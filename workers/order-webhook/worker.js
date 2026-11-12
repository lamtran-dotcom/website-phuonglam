// Cloudflare Worker "phuonglam-order-webhook": receives checkout orders from phuonglam.com
// and posts them to Telegram. Deployed from the Cloudflare dashboard; this copy is the source.
// Env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
//
// Prices, weights and the shipping fee are recomputed from the site's own price list
// (/assets/js/order-pricing.json, written by tools/build_static_site.js). The amount to
// collect is the recomputed one; what the browser sent is only shown when it differs.
// An order is never rejected for a price difference: the shop calls the customer instead.

const PRICING_URL = "https://phuonglam.com/assets/js/order-pricing.json";

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return corsResponse(null, 204);
    }

    if (request.method !== "POST") {
      return corsResponse({ ok: false, error: "Method not allowed" }, 405);
    }

    try {
      const order = await request.json();
      const orderId = createOrderId();
      const pricing = await loadPricing();
      const checked = priceOrder(order, pricing);

      // Message 1: delivery details. <code> makes each value copy on tap in Telegram;
      // blank lines between the copyable rows keep taps from landing on the wrong one.
      const delivery = [
        `🛒 <b>ĐƠN MỚI #${orderId}</b>`,
        "",
        `Tên: ${order.salutation === "Anh" || order.salutation === "Chị" ? `${order.salutation} ` : ""}<code>${html(order.customerName)}</code>`,
        "",
        `SĐT: <code>${html(order.phone)}</code>`,
        "",
        `Địa chỉ: <code>${html(order.address)}</code>`,
        "",
        `Giao: ${html(order.deliveryMethod)}`,
      ];
      if (order.note) delivery.push(`Ghi chú: ${html(order.note)}`);
      delivery.push(`Thời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`);

      const first = await sendTelegram(env, delivery.join("\n"));
      if (!first.ok) {
        return corsResponse({ ok: false, error: "Telegram failed", detail: first.detail }, 502);
      }
      const second = await sendTelegram(env, itemsMessage(orderId, checked), first.messageId);
      if (!second.ok) {
        return corsResponse({ ok: false, error: "Telegram failed", detail: second.detail }, 502);
      }

      return corsResponse({ ok: true, orderId });
    } catch (error) {
      return corsResponse({ ok: false, error: error.message }, 500);
    }
  }
};

async function loadPricing() {
  try {
    const res = await fetch(PRICING_URL, { cf: { cacheTtl: 60, cacheEverything: true } });
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.products && data.shipping ? data : null;
  } catch {
    return null;
  }
}

// Same rule as calculateShipping in assets/js/app.jsx: free up to the area's weight limit;
// above it the first started kg costs firstKgFee, each further started kg extraKgFee;
// an item total below smallOrderThreshold adds smallOrderFee; express adds a flat fee.
function shippingFee({ weight, city, express, subtotal = Infinity }, rules) {
  const freeLimit = isHoChiMinhCity(city) ? rules.hcmFreeWeight : rules.otherFreeWeight;
  const overweight = Math.max(0, weight - freeLimit);
  const extraSteps = Math.ceil(Math.max(0, overweight - 1000) / 1000);
  const base = overweight > 0 ? rules.firstKgFee + extraSteps * rules.extraKgFee : 0;
  const smallOrder = subtotal < (Number(rules.smallOrderThreshold) || 0) ? Number(rules.smallOrderFee) || 0 : 0;
  return base + smallOrder + (express ? rules.expressFee : 0);
}

function priceOrder(order, pricing) {
  const sentItems = Array.isArray(order.items) ? order.items : [];
  const sent = {
    subtotal: Number(order.subtotal) || 0,
    shipping: Number(order.shipping) || 0,
    total: Number(order.total) || 0,
  };
  if (!pricing) {
    return {
      verified: false,
      items: sentItems.map(item => {
        const qty = Math.max(1, Math.floor(Number(item.qty)) || 1);
        const unitPrice = Number(item.price) || 0;
        return { name: item.name, qty, unitPrice, lineTotal: unitPrice * qty, sentPrice: unitPrice, problem: "" };
      }),
      ...sent,
      sent,
    };
  }

  const rules = pricing.shipping;
  let weight = 0;
  const items = sentItems.map(item => {
    const qty = Math.max(1, Math.floor(Number(item.qty)) || 1);
    const sentPrice = Number(item.price) || 0;
    const product = pricing.products[item.id];
    const variant = product && item.variantId ? product.variants[item.variantId] : null;
    let unitPrice = sentPrice;
    let itemWeight = Number(item.weight) || 0;
    let problem = "";
    if (!product) problem = "sản phẩm không còn trên web";
    else if (item.variantId && !variant) problem = "phân loại không còn trên web";
    else {
      const source = variant || product;
      unitPrice = source.price;
      itemWeight = source.weight;
      if (product.hidden) problem = "sản phẩm đang ẩn";
    }
    weight += (itemWeight > 0 ? itemWeight : rules.defaultItemWeight) * qty;
    return { name: item.name, qty, unitPrice, lineTotal: unitPrice * qty, sentPrice, problem };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const express = String(order.deliveryMethod || "").toLowerCase().includes("hỏa tốc");
  const shipping = items.length ? shippingFee({ weight, city: order.city, express, subtotal }, rules) : 0;
  return { verified: true, items, subtotal, shipping, total: subtotal + shipping, sent };
}

function itemsMessage(orderId, checked) {
  const lines = [`📦 <b>SẢN PHẨM #${orderId}</b>`, ""];
  checked.items.forEach((item, index) => {
    let line = `${index + 1}. ${html(item.name)} × ${item.qty} = ${formatVnd(item.lineTotal)}`;
    if (checked.verified && item.sentPrice !== item.unitPrice) line += ` (khách thấy ${formatVnd(item.sentPrice)}/cái)`;
    if (item.problem) line += ` ⚠️ ${item.problem}`;
    lines.push(line);
  });
  lines.push("");
  lines.push(`Tạm tính: ${formatVnd(checked.subtotal)}`);
  lines.push(`Phí ship: ${formatVnd(checked.shipping)}`);
  lines.push(`<b>THU COD: ${formatVnd(checked.total)}</b>`);
  if (!checked.verified) {
    lines.push("⚠️ Không đọc được bảng giá web, số tiền là số khách gửi lên. Kiểm tra lại giá trước khi giao.");
  } else if (checked.total !== checked.sent.total) {
    lines.push(`⚠️ Khách thấy tổng ${formatVnd(checked.sent.total)}, giá web hiện tại là ${formatVnd(checked.total)}. Gọi khách xác nhận trước khi giao.`);
  }
  if (checked.items.some(item => item.problem)) {
    lines.push("⚠️ Có sản phẩm không kiểm được giá, xem các dòng có dấu ⚠️.");
  }
  return lines.join("\n");
}

async function sendTelegram(env, text, replyTo) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: env.TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
      ...(replyTo ? { reply_parameters: { message_id: replyTo, allow_sending_without_reply: true } } : {}),
    })
  });
  if (!res.ok) return { ok: false, detail: await res.text() };
  const data = await res.json().catch(() => ({}));
  return { ok: true, messageId: data.result?.message_id };
}

// Short readable code, e.g. PL1310-4821 (day+month in VN time, then 4 random digits).
function createOrderId() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Ho_Chi_Minh", day: "2-digit", month: "2-digit" }).formatToParts(new Date());
  const day = parts.find(part => part.type === "day").value;
  const month = parts.find(part => part.type === "month").value;
  const random = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10000).padStart(4, "0");
  return `PL${day}${month}-${random}`;
}

// Same as isHoChiMinhCity in assets/js/app.jsx.
function isHoChiMinhCity(value) {
  const normalized = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
  return ["tphcm", "hcm", "hochiminh", "hochiminhcity", "saigon"].includes(normalized);
}

function corsResponse(data, status = 200) {
  return new Response(data ? JSON.stringify(data) : null, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "https://phuonglam.com",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}

function html(value) {
  return (String(value || "").trim() || "-")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatVnd(value) {
  const number = Number(value || 0);
  return number.toLocaleString("vi-VN") + "đ";
}
