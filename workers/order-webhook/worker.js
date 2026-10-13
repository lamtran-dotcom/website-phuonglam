// Cloudflare Worker "phuonglam-order-webhook": receives checkout orders from phuonglam.com
// and posts them to Telegram. Deployed from the Cloudflare dashboard; this copy is the source.
// Env vars: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID.
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

      // Message 1: delivery details. <code> makes each value copy on tap in Telegram.
      const delivery = [
        `🛒 <b>ĐƠN MỚI #${orderId}</b>`,
        "",
        `Tên: <code>${html(order.customerName)}</code>`,
        `SĐT: <code>${html(order.phone)}</code>`,
        `Địa chỉ: <code>${html(order.address)}</code>`,
        `Giao: ${html(order.deliveryMethod)}`,
      ];
      if (order.note) delivery.push(`Ghi chú: ${html(order.note)}`);
      delivery.push(`Thời gian: ${new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" })}`);

      // Message 2: items and the amount to collect.
      const items = Array.isArray(order.items) ? order.items : [];
      const products = [`📦 <b>SẢN PHẨM #${orderId}</b>`, ""];
      items.forEach((item, index) => {
        const qty = Number(item.qty) || 1;
        const lineTotal = Number(item.total) || (Number(item.price) || 0) * qty;
        products.push(`${index + 1}. ${html(item.name)} × ${qty} = ${formatVnd(lineTotal)}`);
      });
      const itemsTotal = items.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
      products.push("");
      products.push(`Tạm tính: ${formatVnd(order.subtotal)}`);
      products.push(`Phí ship: ${formatVnd(order.shipping)}`);
      products.push(`<b>THU COD: ${formatVnd(order.total)}</b>`);
      if (itemsTotal !== Number(order.subtotal || 0)) {
        products.push(`⚠️ Tạm tính không khớp tổng sản phẩm (${formatVnd(itemsTotal)}), kiểm tra lại đơn.`);
      }

      const first = await sendTelegram(env, delivery.join("\n"));
      if (!first.ok) {
        return corsResponse({ ok: false, error: "Telegram failed", detail: first.detail }, 502);
      }
      const second = await sendTelegram(env, products.join("\n"), first.messageId);
      if (!second.ok) {
        return corsResponse({ ok: false, error: "Telegram failed", detail: second.detail }, 502);
      }

      return corsResponse({ ok: true, orderId });
    } catch (error) {
      return corsResponse({ ok: false, error: error.message }, 500);
    }
  }
};

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
