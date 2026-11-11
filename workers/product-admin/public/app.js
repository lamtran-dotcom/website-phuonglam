// Online product admin (Admin v2). Plain ES module, no build step.
// Edits stay in a browser draft until "Xuất bản", which sends all products plus new
// images to /api/publish as one commit. See docs/ADMIN-V2.md.

import * as Variants from './variants.js';

const DRAFT_KEY = 'pl-admin-draft-v1';
// WebP encoder for browsers whose canvas cannot write WebP (Safari / iPhone).
const WEBP_ENCODER = 'https://cdn.jsdelivr.net/npm/@jsquash/webp@1.4.0/encode.js/+esm';
const IMAGE_WIDTHS = [900, 720, 480];

const state = {
  baseSha: '',
  productsSha: '',
  siteUrl: 'https://phuonglam.com',
  original: [],
  products: [],
  categories: [], // same array as settings.categories
  settingsSha: '',
  originalSettings: null,
  settings: null, // data/settings.json: featuredIds, headerImages, categoryImages, categories, shipping
  images: {}, // repo path -> base64 WebP, not yet published
  view: 'list',
  editId: null,
  search: '',
  category: '',
  selected: new Set(),
  autoSlug: new Set(),
  publishing: false,
};

const app = document.getElementById('app');
const bar = document.getElementById('bar');
const dialog = document.getElementById('dialog');

// ---------- helpers ----------

const clone = (value) => JSON.parse(JSON.stringify(value));
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const money = (value) => (value == null || value === '' ? '' : Number(value).toLocaleString('vi-VN'));
const parseMoney = (text) => {
  const digits = String(text).replace(/[^\d]/g, '');
  return digits ? Number(digits) : null;
};
const keyOf = (product) => String(product.id);
const findProduct = (id) => state.products.find((p) => keyOf(p) === String(id));
const originalOf = (product) => state.original.find((p) => keyOf(p) === keyOf(product));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

export const slugify = (value) => String(value || '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd').replace(/Đ/g, 'd')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .slice(0, 90).replace(/-+$/, '');

const toast = (text) => {
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => el.classList.remove('show'), 2600);
};

const imageUrl = (path) => {
  if (!path) return '';
  const repoPath = path.replace(/^\//, '');
  if (state.images[repoPath]) return `data:image/webp;base64,${state.images[repoPath]}`;
  return /^https?:/.test(path) ? path : `${state.siteUrl}${path}`;
};

const categoriesNow = () => state.settings?.categories || [];
const categoryName = (id) => categoriesNow().find((c) => c.id === id)?.name || id || '—';

const variantPrices = (product, field = 'price') => (product.variants || [])
  .map((v) => Number(v[field]) || 0).filter((n) => n > 0);

// ---------- product content (same outline as tools/product_content.js) ----------

const cleanLine = (value) => String(value ?? '').replace(/\s+/g, ' ').trim();
const toList = (value) => (Array.isArray(value) ? value : String(value ?? '').split('\n'))
  .map((line) => cleanLine(String(line).replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '')))
  .filter(Boolean);
const toSpecs = (value) => (Array.isArray(value) ? value : String(value ?? '').split('\n')).map((row) => {
  if (row && typeof row === 'object') return { label: cleanLine(row.label), value: cleanLine(row.value) };
  const text = cleanLine(row);
  const at = text.indexOf(':');
  return at > 0 ? { label: cleanLine(text.slice(0, at)), value: cleanLine(text.slice(at + 1)) } : { label: '', value: '' };
}).filter((row) => row.label && row.value);

export const composeDescription = (content) => {
  const intro = cleanLine(content?.intro);
  if (!intro) return '';
  const highlights = toList(content.highlights);
  const specs = toSpecs(content.specs);
  const steps = toList(content.steps);
  const care = toList(content.care);
  return [
    intro,
    highlights.length ? `Điểm nổi bật:\n${highlights.map((line) => `- ${line}`).join('\n')}` : '',
    specs.length ? `Thông số:\n${specs.map((row) => `- ${row.label}: ${row.value}`).join('\n')}` : '',
    steps.length ? `Cách dùng:\n${steps.map((line, i) => `${i + 1}. ${line}`).join('\n')}` : '',
    care.length ? `Lưu ý & bảo quản:\n${care.map((line) => `- ${line}`).join('\n')}` : '',
  ].filter(Boolean).join('\n\n');
};

// ---------- API ----------

const api = async (path, options = {}) => {
  let res;
  try {
    res = await fetch(path, { ...options, redirect: 'manual', headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
  } catch {
    throw new Error('Mất kết nối hoặc phiên đăng nhập đã hết hạn. Tải lại trang.');
  }
  if (res.type === 'opaqueredirect' || res.status === 401) throw Object.assign(new Error('Phiên đăng nhập đã hết hạn. Tải lại trang để đăng nhập lại.'), { status: 401 });
  const body = await res.json().catch(() => ({ ok: false, error: `Lỗi ${res.status}` }));
  if (!res.ok || body.ok === false) throw Object.assign(new Error(body.error || `Lỗi ${res.status}`), { status: res.status, details: body.details || [] });
  return body;
};

// ---------- draft ----------

const saveDraft = () => {
  clearTimeout(saveDraft.timer);
  saveDraft.timer = setTimeout(() => {
    const changed = changeCount() > 0;
    try {
      if (!changed) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({
        productsSha: state.productsSha, products: state.products,
        settingsSha: state.settingsSha, settings: state.settings,
        images: state.images, savedAt: Date.now(),
      }));
    } catch {
      toast('Không lưu được nháp trên máy (ảnh quá lớn). Nên xuất bản sớm.');
    }
  }, 400);
};

const readDraft = () => {
  try {
    return JSON.parse(localStorage.getItem(DRAFT_KEY) || 'null');
  } catch {
    return null;
  }
};

const clearDraft = () => {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
};

// ---------- changes ----------

const FIELD_LABELS = {
  name: 'Tên', slug: 'Đường dẫn', categoryId: 'Danh mục', price: 'Giá bán', originalPrice: 'Giá gạch',
  hidden: 'Ẩn/hiện', tag: 'Nhãn', weight: 'Cân nặng', sku: 'SKU', images: 'Ảnh', variants: 'Phân loại',
  shortDesc: 'Mô tả ngắn', content: 'Nội dung', description: 'Mô tả', seoTitle: 'Tiêu đề Google', seoDescription: 'Mô tả Google',
};

const changeList = () => {
  const list = [];
  const currentIds = new Set(state.products.map(keyOf));
  for (const product of state.products) {
    const before = originalOf(product);
    if (!before) list.push({ type: 'add', product });
    else if (!same(before, product)) {
      const fields = [...new Set([...Object.keys(before), ...Object.keys(product)])].filter((k) => !same(before[k], product[k]));
      list.push({ type: 'edit', product, before, fields });
    }
  }
  for (const product of state.original) if (!currentIds.has(keyOf(product))) list.push({ type: 'delete', product });
  return list;
};

const describeField = (field, before, after) => {
  const label = FIELD_LABELS[field] || field;
  if (field === 'price' || field === 'originalPrice') return `${label}: <span class="old">${esc(money(before[field]) || '—')}</span> → <b>${esc(money(after[field]) || '—')}</b>`;
  if (field === 'hidden') return after.hidden ? '<b>Ẩn khỏi web</b>' : '<b>Hiện lên web</b>';
  if (field === 'categoryId') return `${label}: <b>${esc(categoryName(after.categoryId))}</b>`;
  if (field === 'variants') {
    const a = before.variants || [];
    const b = after.variants || [];
    const changed = b.filter((v) => !same(v, a.find((x) => x.id === v.id))).length;
    const removed = a.filter((v) => !b.some((x) => x.id === v.id)).length;
    return `${label}: ${changed ? `${changed} dòng sửa` : ''}${changed && removed ? ', ' : ''}${removed ? `${removed} dòng xoá` : ''}`;
  }
  if (field === 'description') return '';
  return label;
};

const settingsChanged = () => !!state.settings && !same(state.originalSettings, state.settings);
const productsChanged = () => changeList().length > 0;
const changeCount = () => changeList().length + (settingsChanged() ? 1 : 0);

const settingsChangeParts = () => {
  if (!settingsChanged()) return [];
  const a = state.originalSettings;
  const b = state.settings;
  return [
    !same(a.headerImages, b.headerImages) && 'ảnh header',
    !same(a.featuredIds, b.featuredIds) && 'sản phẩm bán chạy',
    !same(a.categories, b.categories) && 'danh mục',
    !same(a.categoryImages, b.categoryImages) && 'ảnh danh mục',
  ].filter(Boolean);
};

const changeSummary = () => {
  const list = changeList();
  const parts = [];
  if (list.length) {
    const names = list.slice(0, 3).map((c) => c.product.name).join(', ');
    parts.push(`${list.length} sản phẩm: ${names}${list.length > 3 ? '…' : ''}`);
  }
  if (settingsChanged()) parts.push(`Trang chủ: ${settingsChangeParts().join(', ')}`);
  return parts.join(' · ');
};

// ---------- rendering ----------

const render = () => {
  if (state.view === 'edit' && findProduct(state.editId)) renderEdit();
  else if (state.view === 'home') renderHome();
  else {
    state.view = 'list';
    renderList();
  }
  renderTabs();
  renderBar();
};

const tabsEl = document.getElementById('tabs');
const renderTabs = () => {
  if (!tabsEl) return;
  tabsEl.hidden = !state.settings;
  const active = state.view === 'home' ? 'home' : 'list';
  tabsEl.innerHTML = `<button class="${active === 'list' ? 'on' : ''}" data-action="tab" data-tab="list">Sản phẩm</button>
    <button class="${active === 'home' ? 'on' : ''}" data-action="tab" data-tab="home">Trang chủ &amp; danh mục</button>`;
};

const renderBar = () => {
  const count = changeCount();
  bar.hidden = count === 0;
  if (!count) return;
  const productCount = changeList().length;
  const label = [productCount && `${productCount} sản phẩm`, settingsChanged() && 'trang chủ/danh mục'].filter(Boolean).join(' + ');
  bar.innerHTML = `<span class="n">${label} có thay đổi chưa xuất bản</span>
    <button data-action="show-changes">Xem</button>
    <button data-action="discard-all">Huỷ tất cả</button>
    <button class="primary" data-action="publish" ${state.publishing ? 'disabled' : ''}>${state.publishing ? 'Đang xuất bản…' : 'Xuất bản'}</button>`;
};

const visibleProducts = () => {
  const q = slugify(state.search).replace(/-/g, ' ');
  return state.products.filter((p) => (!state.category || p.categoryId === state.category)
    && (!q || slugify(`${p.name} ${p.sku} ${p.slug}`).replace(/-/g, ' ').includes(q)));
};

const priceCell = (product, field, cls) => {
  const before = originalOf(product);
  const wasChanged = before && !same(before[field], product[field]) && !product.variants?.length;
  if (product.variants?.length) {
    const prices = variantPrices(product, field);
    const text = prices.length ? (Math.min(...prices) === Math.max(...prices) ? money(prices[0]) : `${money(Math.min(...prices))}–${money(Math.max(...prices))}`) : '—';
    return `<div class="${cls} range">${esc(text)}</div>`;
  }
  return `<div class="${cls} price"><input inputmode="numeric" data-field="${field}" data-id="${esc(keyOf(product))}" value="${esc(money(product[field]))}" aria-label="${FIELD_LABELS[field]}">
    ${wasChanged ? `<div class="was">${esc(money(before[field]) || '—')}</div>` : ''}</div>`;
};

const renderList = () => {
  const rows = visibleProducts();
  const allSelected = rows.length > 0 && rows.every((p) => state.selected.has(keyOf(p)));
  const selectedCount = state.selected.size;
  app.innerHTML = `
    <div class="toolbar">
      <input type="search" id="search" placeholder="Tìm tên, SKU…" value="${esc(state.search)}">
      <select id="category">
        <option value="">Tất cả danh mục (${state.products.length})</option>
        ${categoriesNow().map((c) => `<option value="${esc(c.id)}" ${c.id === state.category ? 'selected' : ''}>${esc(c.name)} (${state.products.filter((p) => p.categoryId === c.id).length})</option>`).join('')}
      </select>
      <button class="primary" data-action="add">+ Thêm sản phẩm</button>
    </div>
    ${selectedCount ? `
    <div class="bulk">
      <span class="count">Đã chọn ${selectedCount}</span>
      <select id="bulk-field"><option value="price">Giá bán</option><option value="originalPrice">Giá gạch</option></select>
      <select id="bulk-op">
        <option value="add">tăng (đ)</option><option value="sub">giảm (đ)</option>
        <option value="addpct">tăng (%)</option><option value="subpct">giảm (%)</option><option value="set">đặt bằng (đ)</option>
      </select>
      <input id="bulk-value" inputmode="numeric" placeholder="vd 8000">
      <button class="primary" data-action="bulk-apply">Áp dụng</button>
      <button data-action="bulk-hide">Ẩn</button>
      <button data-action="bulk-show">Hiện</button>
      <button data-action="bulk-clear">Bỏ chọn</button>
      <div class="hint" style="width:100%">Áp cho cả giá từng phân loại. Kết quả làm tròn đến 1.000đ.</div>
    </div>` : ''}
    <div class="rows">
      <div class="row head">
        <input type="checkbox" data-action="select-all" ${allSelected ? 'checked' : ''} aria-label="Chọn tất cả">
        <span></span><span>Sản phẩm</span><span>Danh mục</span><span style="text-align:right">Giá bán</span><span style="text-align:right">Giá gạch</span><span>Ẩn</span>
      </div>
      ${rows.map((p) => {
        const before = originalOf(p);
        const cls = [!before ? 'added' : '', before && !same(before, p) ? 'changed' : '', p.hidden ? 'is-hidden' : ''].join(' ');
        const img = p.images?.[0] || p.variants?.find((v) => v.image)?.image || '';
        return `<div class="row ${cls}">
          <input class="c" type="checkbox" data-action="select" data-id="${esc(keyOf(p))}" ${state.selected.has(keyOf(p)) ? 'checked' : ''} aria-label="Chọn">
          ${img ? `<img class="thumb t" src="${esc(imageUrl(img))}" alt="" loading="lazy">` : '<div class="thumb t"></div>'}
          <div class="name"><button class="link" data-action="edit" data-id="${esc(keyOf(p))}">${esc(p.name || '(chưa có tên)')}</button>
            <div class="sub">${p.variants?.length ? `${p.variants.length} phân loại` : 'Không phân loại'}${p.tag ? ` · ${esc(p.tag)}` : ''}</div></div>
          <div class="cat sub">${esc(categoryName(p.categoryId))}</div>
          ${priceCell(p, 'price', 'p')}
          ${priceCell(p, 'originalPrice', 'o')}
          <label class="toggle h"><input type="checkbox" data-field="hidden" data-id="${esc(keyOf(p))}" ${p.hidden ? 'checked' : ''}> Ẩn</label>
        </div>`;
      }).join('') || '<p class="empty">Không có sản phẩm phù hợp.</p>'}
    </div>`;
};

// ---------- homepage & categories (data/settings.json) ----------

// New categories get their id from the name until the id is edited by hand.
const autoCategoryIds = new WeakSet();
const isNewCategory = (c) => !state.originalSettings.categories.some((o) => o.id === c.id) || autoCategoryIds.has(c);
const productCount = (categoryId) => state.products.filter((p) => p.categoryId === categoryId).length;

const uniqueCategoryId = (base, self) => {
  let id = base || 'danh-muc';
  for (let n = 2; categoriesNow().some((c) => c !== self && c.id === id); n += 1) id = `${base}-${n}`;
  return id;
};

// Category images are keyed by id, so they follow an id change.
const setCategoryId = (category, id) => {
  const images = state.settings.categoryImages;
  if (images[category.id] && category.id !== id) {
    images[id] = images[category.id];
    delete images[category.id];
  }
  category.id = id;
};

const thumb = (src) => (src ? `<img class="thumb" src="${esc(imageUrl(src))}" alt="" loading="lazy">` : '<div class="thumb"></div>');

const renderHome = () => {
  const s = state.settings;
  const featured = s.featuredIds.map((id) => state.products.find((p) => keyOf(p) === String(id)) || { id, missing: true });
  const pickable = state.products.filter((p) => !p.hidden && !s.featuredIds.includes(keyOf(p)));
  app.innerHTML = `
    <section class="card"><h2>Ảnh header chạy</h2>
      <p class="hint">Ảnh chạy ở đầu trang chủ, ảnh thứ nhất hiện trước. Ảnh vuông 900×900 hiển thị đẹp nhất.</p>
      <div class="images">
        ${s.headerImages.map((src, i) => `<div class="image ${state.images[src.replace(/^\//, '')] ? 'new' : ''}">
          ${i === 0 ? '<span class="cover">Đầu tiên</span>' : ''}
          <img src="${esc(imageUrl(src))}" alt="" loading="lazy">
          <div class="tools">
            <button data-action="header-move" data-index="${i}" data-step="-1" ${i === 0 ? 'disabled' : ''} aria-label="Lên trước">◀</button>
            <button class="danger" data-action="header-remove" data-index="${i}" aria-label="Bỏ ảnh">✕</button>
            <button data-action="header-move" data-index="${i}" data-step="1" ${i === s.headerImages.length - 1 ? 'disabled' : ''} aria-label="Ra sau">▶</button>
          </div></div>`).join('')}
        <label class="upload">+ Thêm ảnh header<br><small>Tự thu nhỏ và đổi sang WebP</small><input type="file" accept="image/*" multiple data-action="header-upload"></label>
      </div>
    </section>

    <section class="card"><h2>Sản phẩm bán chạy (${s.featuredIds.length})</h2>
      <p class="hint">Theo thứ tự này trên trang chủ: 6 sản phẩm đầu hiện ngay, tối đa 12 khi trang tải xong. Sản phẩm đang ẩn không hiện.</p>
      <ol class="featured">
        ${featured.map((p, i) => `<li class="${p.missing || p.hidden ? 'muted' : ''}">
          <span class="fnum">${i + 1}</span>
          ${thumb(p.images?.[0] || p.variants?.find((v) => v.image)?.image)}
          <span class="fname">${esc(p.name || `(không tìm thấy sản phẩm ${p.id})`)}${p.hidden ? ' · <b>đang ẩn</b>' : ''}</span>
          <button data-action="featured-move" data-index="${i}" data-step="-1" ${i === 0 ? 'disabled' : ''} aria-label="Lên">↑</button>
          <button data-action="featured-move" data-index="${i}" data-step="1" ${i === featured.length - 1 ? 'disabled' : ''} aria-label="Xuống">↓</button>
          <button class="danger" data-action="featured-remove" data-index="${i}" aria-label="Bỏ khỏi bán chạy">✕</button>
        </li>`).join('')}
      </ol>
      <select id="featured-pick" aria-label="Thêm sản phẩm bán chạy">
        <option value="">+ Chọn sản phẩm để thêm vào bán chạy…</option>
        ${pickable.map((p) => `<option value="${esc(keyOf(p))}">${esc(p.name)}</option>`).join('')}
      </select>
    </section>

    <section class="card"><h2>Danh mục (${s.categories.length})</h2>
      <p class="hint">Thứ tự ở đây là thứ tự trên menu và trang chủ. Mỗi danh mục có trang phuonglam.com/danh-muc/&lt;mã&gt;/; mã không đổi được sau khi đã xuất bản.</p>
      <div class="cats">
        ${s.categories.map((c, i) => {
          const count = productCount(c.id);
          const img = s.categoryImages[c.id] || '';
          return `<div class="cat">
            <div class="cat-img">${thumb(img)}
              <label class="mini">Đổi ảnh<input type="file" accept="image/*" data-action="cat-upload" data-index="${i}"></label>
              ${img ? `<button class="link danger" data-action="cat-image-remove" data-index="${i}">Bỏ ảnh</button>` : ''}
            </div>
            <div class="cat-fields">
              <div class="cat-row">
                <input class="cat-icon" data-cat-field="icon" data-index="${i}" value="${esc(c.icon)}" aria-label="Biểu tượng" placeholder="🕯️">
                <input data-cat-field="name" data-index="${i}" value="${esc(c.name)}" placeholder="Tên danh mục" aria-label="Tên danh mục">
              </div>
              <div class="hint">${isNewCategory(c)
                ? `Mã đường dẫn: <input class="cat-id" data-cat-field="id" data-index="${i}" value="${esc(c.id)}" aria-label="Mã đường dẫn"> · <b>mới</b>`
                : `phuonglam.com/danh-muc/${esc(c.id)}/`} · ${count} sản phẩm</div>
            </div>
            <div class="cat-tools">
              <button data-action="cat-move" data-index="${i}" data-step="-1" ${i === 0 ? 'disabled' : ''} aria-label="Lên">↑</button>
              <button data-action="cat-move" data-index="${i}" data-step="1" ${i === s.categories.length - 1 ? 'disabled' : ''} aria-label="Xuống">↓</button>
              <button class="danger" data-action="cat-remove" data-index="${i}" ${count ? `disabled title="Còn ${count} sản phẩm trong danh mục này"` : ''} aria-label="Xoá danh mục">✕</button>
            </div>
          </div>`;
        }).join('')}
      </div>
      <div class="vadd"><button data-action="cat-add">+ Thêm danh mục</button>
        <span class="hint">Chỉ xoá được danh mục không còn sản phẩm. Chuyển sản phẩm sang danh mục khác trong trang sửa sản phẩm.</span></div>
    </section>`;
};

const moveItem = (list, index, step) => {
  const target = index + step;
  if (target < 0 || target >= list.length) return;
  [list[index], list[target]] = [list[target], list[index]];
};

const homeAction = (action, el) => {
  const s = state.settings;
  const i = Number(el.dataset.index);
  const step = Number(el.dataset.step);
  switch (action) {
    case 'header-move': moveItem(s.headerImages, i, step); break;
    case 'header-remove': s.headerImages.splice(i, 1); break;
    case 'featured-move': moveItem(s.featuredIds, i, step); break;
    case 'featured-remove': s.featuredIds.splice(i, 1); break;
    case 'cat-move': moveItem(s.categories, i, step); break;
    case 'cat-image-remove': delete s.categoryImages[s.categories[i].id]; break;
    case 'cat-remove': {
      const c = s.categories[i];
      if (productCount(c.id) || !confirm(`Xoá danh mục "${c.name}"?`)) return true;
      s.categories.splice(i, 1);
      delete s.categoryImages[c.id];
      break;
    }
    case 'cat-add': {
      const c = { id: uniqueCategoryId('danh-muc-moi'), name: '', icon: '' };
      autoCategoryIds.add(c);
      s.categories.push(c);
      saveDraft();
      render();
      app.querySelector(`[data-cat-field="name"][data-index="${s.categories.length - 1}"]`)?.focus();
      return true;
    }
    default: return false;
  }
  saveDraft();
  render();
  return true;
};

const onCategoryInput = (el) => {
  const c = state.settings.categories[Number(el.dataset.index)];
  if (!c) return;
  const field = el.dataset.catField;
  if (field === 'icon') c.icon = el.value.trim();
  if (field === 'name') {
    c.name = el.value.replace(/\s+/g, ' ').trimStart();
    if (autoCategoryIds.has(c)) {
      setCategoryId(c, uniqueCategoryId(slugify(c.name) || 'danh-muc-moi', c));
      const idInput = app.querySelector(`[data-cat-field="id"][data-index="${el.dataset.index}"]`);
      if (idInput) idInput.value = c.id;
    }
  }
  if (field === 'id') {
    autoCategoryIds.delete(c);
    setCategoryId(c, slugify(el.value));
  }
  saveDraft();
  renderBar();
};

const onHomeFiles = async (el) => {
  const files = [...(el.files || [])];
  if (!files.length) return;
  const paths = await processImages(el.dataset.action === 'cat-upload' ? files.slice(0, 1) : files);
  if (!paths.length) return;
  if (el.dataset.action === 'header-upload') state.settings.headerImages.push(...paths);
  else state.settings.categoryImages[state.settings.categories[Number(el.dataset.index)].id] = paths[0];
  saveDraft();
  render();
};

const lines = (value) => (Array.isArray(value) ? value : []).join('\n');
const specLines = (value) => (Array.isArray(value) ? value : []).map((row) => `${row.label}: ${row.value}`).join('\n');

const counter = (text, min, max) => {
  const n = String(text || '').length;
  const cls = n > max ? 'bad' : n < min ? 'warn' : '';
  return `<span class="hint ${cls}" data-counter>${n} ký tự (nên ${min}–${max})</span>`;
};

const renderEdit = () => {
  const p = findProduct(state.editId);
  const before = originalOf(p);
  const id = esc(keyOf(p));
  const c = p.content || {};
  const liveUrl = before && !before.hidden ? `${state.siteUrl}/san-pham/${before.slug}/` : '';

  app.innerHTML = `
    <div class="edit-head">
      <button data-action="back">← Danh sách</button>
      <h1>${esc(p.name || 'Sản phẩm mới')}</h1>
      ${liveUrl ? `<a href="${esc(liveUrl)}" target="_blank" rel="noopener"><button>Xem trên web</button></a>` : ''}
      <button data-action="duplicate" data-id="${id}">Nhân bản</button>
      ${before && !same(before, p) ? `<button data-action="revert" data-id="${id}">Huỷ sửa SP này</button>` : ''}
      <button class="danger" data-action="delete" data-id="${id}">Xoá</button>
    </div>

    <section class="card"><h2>Thông tin cơ bản</h2>
      <div class="grid">
        <div class="wide"><label>Tên sản phẩm</label><input data-field="name" data-id="${id}" value="${esc(p.name)}"></div>
        <div class="wide"><label>Đường dẫn (slug)</label><input data-field="slug" data-id="${id}" value="${esc(p.slug)}">
          <div class="hint ${before && before.slug !== p.slug ? 'warn' : ''}" data-slug-hint>${before && before.slug !== p.slug ? 'Đổi đường dẫn làm link cũ trên Google/Facebook bị lỗi 404. Chỉ đổi khi thật cần.' : `${esc(state.siteUrl)}/san-pham/${esc(p.slug)}/`}</div></div>
        <div><label>Danh mục</label><select data-field="categoryId" data-id="${id}">
          ${categoriesNow().map((cat) => `<option value="${esc(cat.id)}" ${cat.id === p.categoryId ? 'selected' : ''}>${esc(cat.name)}</option>`).join('')}
          ${categoriesNow().some((cat) => cat.id === p.categoryId) ? '' : `<option value="${esc(p.categoryId)}" selected>${esc(p.categoryId || '— chọn —')}</option>`}
        </select></div>
        <div><label>Nhãn</label><select data-field="tag" data-id="${id}">
          ${['', 'Bán chạy', 'Nổi bật', 'Mới', 'Sale'].map((t) => `<option value="${t}" ${t === (p.tag || '') ? 'selected' : ''}>${t || '(không)'}</option>`).join('')}
        </select></div>
        <div class="wide"><label class="toggle"><input type="checkbox" data-field="hidden" data-id="${id}" ${p.hidden ? 'checked' : ''}> Ẩn sản phẩm khỏi web</label></div>
      </div>
    </section>

    <section class="card"><h2>Ảnh <span class="hint">(ảnh đầu tiên là ảnh bìa)</span></h2>
      <div class="images">
        ${(p.images || []).map((src, i) => `<div class="image ${state.images[src.replace(/^\//, '')] ? 'new' : ''}">
          ${i === 0 ? '<span class="cover">Bìa</span>' : ''}
          <img src="${esc(imageUrl(src))}" alt="" loading="lazy">
          <div class="tools">
            <button data-action="img-left" data-index="${i}" ${i === 0 ? 'disabled' : ''} aria-label="Lên trước">◀</button>
            <button class="danger" data-action="img-remove" data-index="${i}" aria-label="Bỏ ảnh">✕</button>
            <button data-action="img-right" data-index="${i}" ${i === p.images.length - 1 ? 'disabled' : ''} aria-label="Ra sau">▶</button>
          </div></div>`).join('')}
        <label class="upload">+ Thêm ảnh<br><small>Tự thu nhỏ và đổi sang WebP</small><input type="file" accept="image/*" multiple data-action="img-upload"></label>
      </div>
    </section>

    ${renderSales(p)}

    ${renderShipping(p)}

    <section class="card"><h2>Nội dung</h2>
      <div class="grid">
        <div class="wide"><label>Mô tả ngắn (hiện cạnh giá)</label><textarea data-field="shortDesc" data-id="${id}">${esc(p.shortDesc)}</textarea></div>
        <div class="wide"><label>Giới thiệu</label><textarea data-field="content.intro" data-id="${id}">${esc(c.intro)}</textarea></div>
        <div class="wide"><label>Điểm nổi bật (mỗi dòng một ý)</label><textarea data-field="content.highlights" data-type="lines" data-id="${id}">${esc(lines(c.highlights))}</textarea></div>
        <div class="wide"><label>Thông số (mỗi dòng "Tên: giá trị")</label><textarea data-field="content.specs" data-type="specs" data-id="${id}">${esc(specLines(c.specs))}</textarea></div>
        <div class="wide"><label>Cách dùng (mỗi dòng một bước)</label><textarea data-field="content.steps" data-type="lines" data-id="${id}">${esc(lines(c.steps))}</textarea></div>
        <div class="wide"><label>Lưu ý &amp; bảo quản (mỗi dòng một ý)</label><textarea data-field="content.care" data-type="lines" data-id="${id}">${esc(lines(c.care))}</textarea></div>
      </div>
    </section>

    <section class="card"><h2>Hiển thị trên Google</h2>
      <div class="grid">
        <div class="wide"><label>Tiêu đề (để trống = tên sản phẩm)</label><input data-field="seoTitle" data-id="${id}" value="${esc(p.seoTitle)}">${counter(p.seoTitle, 30, 60)}</div>
        <div class="wide"><label>Mô tả</label><textarea data-field="seoDescription" data-id="${id}">${esc(p.seoDescription)}</textarea>${counter(p.seoDescription, 140, 155)}</div>
      </div>
      <div class="serp" data-serp>${serp(p)}</div>
    </section>`;
};

// ---------- sales info (Shopee-style variants) ----------

const imagePicker = (p, selected, attrs) => `<select ${attrs}>
  <option value="">Không ảnh</option>
  ${(p.images || []).map((src, i) => `<option value="${esc(src)}" ${src === selected ? 'selected' : ''}>Ảnh ${i + 1}${i === 0 ? ' (bìa)' : ''}</option>`).join('')}
  ${selected && !(p.images || []).includes(selected) ? `<option value="${esc(selected)}" selected>Ảnh riêng</option>` : ''}
</select>`;

const moneyInput = (value, attrs) => `<input inputmode="numeric" ${attrs} value="${esc(money(value))}">`;

const renderGroup = (view, group, gi) => `
  <div class="vgroup">
    <div class="vgroup-head">
      <span class="vgroup-label">Phân loại ${gi + 1}</span>
      <input data-var-group-name="${gi}" value="${esc(group.name)}" placeholder="Tên nhóm, vd: Màu sắc, Kích thước" aria-label="Tên nhóm phân loại ${gi + 1}">
      <button class="danger" data-action="var-remove-group" data-group="${gi}">Xoá nhóm</button>
    </div>
    <div class="vvalues">
      ${group.values.map((value, vi) => `<div class="vvalue">
        ${gi === 0 ? `<span class="vthumb">${view.optionImages?.[group.name]?.[value] ? `<img src="${esc(imageUrl(view.optionImages[group.name][value]))}" alt="">` : ''}</span>
          ${imagePicker(view, view.optionImages?.[group.name]?.[value] || '', `data-var-image="${gi}" data-value="${esc(value)}" aria-label="Ảnh cho ${esc(value)}"`)}` : ''}
        <input data-var-value="${gi}" data-index="${vi}" value="${esc(value)}" aria-label="Lựa chọn ${vi + 1}">
        <button data-action="var-move-value" data-group="${gi}" data-index="${vi}" data-step="-1" ${vi === 0 ? 'disabled' : ''} aria-label="Lên">↑</button>
        <button data-action="var-move-value" data-group="${gi}" data-index="${vi}" data-step="1" ${vi === group.values.length - 1 ? 'disabled' : ''} aria-label="Xuống">↓</button>
        <button class="danger" data-action="var-remove-value" data-group="${gi}" data-index="${vi}" aria-label="Xoá lựa chọn">✕</button>
      </div>`).join('')}
      <div class="vvalue add"><input data-var-new="${gi}" placeholder="+ Thêm lựa chọn (gõ rồi Enter)"></div>
    </div>
  </div>`;

const renderVariantTable = (p, view) => {
  const groups = view.optionGroups.filter((g) => g.values.length);
  const combos = Variants.combinations(view);
  if (!combos.length) return '<p class="hint">Thêm ít nhất một lựa chọn để tạo bảng phân loại.</p>';
  const firstSpan = groups.length === 2 ? groups[1].values.length : 1;
  const rows = combos.map((combo, index) => {
    const variant = Variants.findVariant(view, combo);
    const real = variant && p.variants.find((v) => v.id === variant.id);
    const comboAttr = esc(JSON.stringify(combo));
    const groupCells = groups.map((g, gi) => {
      if (gi === 0 && groups.length === 2) return index % firstSpan === 0 ? `<td class="vcell" rowspan="${firstSpan}">${esc(combo[g.name])}</td>` : '';
      return `<td class="vcell">${esc(combo[g.name])}</td>`;
    }).join('');
    if (!real) {
      return `<tr class="off">${groupCells}<td colspan="4" class="hint">Không bán</td>
        <td><label class="toggle"><input type="checkbox" data-var-sale="${comboAttr}"> Bán</label></td></tr>`;
    }
    const vid = esc(real.id);
    return `<tr>${groupCells}
      <td class="num">${moneyInput(real.price, `data-vfield="price" data-vid="${vid}" aria-label="Giá bán"`)}</td>
      <td class="num">${moneyInput(real.originalPrice, `data-vfield="originalPrice" data-vid="${vid}" aria-label="Giá gạch"`)}</td>
      <td class="num"><input inputmode="numeric" data-vfield="weight" data-vid="${vid}" value="${esc(real.weight ?? '')}" placeholder="${esc(p.weight ?? '')}" aria-label="Cân nặng"></td>
      <td><input data-vfield="sku" data-vid="${vid}" value="${esc(real.sku || '')}" aria-label="SKU phân loại"></td>
      <td><label class="toggle"><input type="checkbox" data-var-sale="${comboAttr}" checked> Bán</label></td></tr>`;
  }).join('');
  return `<div class="scroll-x"><table class="variants">
    <thead><tr>${groups.map((g) => `<th>${esc(g.name)}</th>`).join('')}<th>Giá bán (đ) *</th><th>Giá gạch (đ)</th><th>Cân nặng (g)</th><th>SKU</th><th></th></tr></thead>
    <tbody>${rows}</tbody></table></div>`;
};

const renderSales = (p) => {
  const id = esc(keyOf(p));
  // Imported products without groups are shown as one group; the data changes only on edit.
  const view = Variants.ensureGroups(clone(p));
  const hasGroups = view.optionGroups.length > 0;
  if (!hasGroups) {
    return `<section class="card"><h2>Thông tin bán hàng</h2>
      <div class="grid">
        <div><label>Giá bán (đ) *</label><input inputmode="numeric" data-field="price" data-id="${id}" value="${esc(money(p.price))}"></div>
        <div><label>Giá gạch (đ, để trống nếu không có)</label><input inputmode="numeric" data-field="originalPrice" data-id="${id}" value="${esc(money(p.originalPrice))}"></div>
        <div><label>SKU</label><input data-field="sku" data-id="${id}" value="${esc(p.sku)}"></div>
      </div>
      <div class="vadd"><button data-action="var-add-group">+ Thêm nhóm phân loại</button>
        <span class="hint">Ví dụ: Màu sắc, Kích thước, Mùi hương. Tối đa ${Variants.MAX_GROUPS} nhóm.</span></div>
    </section>`;
  }
  const orphans = Variants.orphanVariants(p);
  return `<section class="card"><h2>Thông tin bán hàng</h2>
    <h3>Phân loại hàng</h3>
    ${view.optionGroups.map((g, gi) => renderGroup(view, g, gi)).join('')}
    ${view.optionGroups.length < Variants.MAX_GROUPS ? `<div class="vadd"><button data-action="var-add-group">+ Thêm nhóm phân loại ${view.optionGroups.length + 1}</button></div>` : ''}

    <h3>Danh sách phân loại hàng <span class="hint">(${p.variants.length} đang bán)</span></h3>
    <div class="apply-all">
      <div><label>Giá bán</label><input inputmode="numeric" id="all-price" placeholder="đ"></div>
      <div><label>Giá gạch</label><input inputmode="numeric" id="all-originalPrice" placeholder="đ"></div>
      <div><label>Cân nặng</label><input inputmode="numeric" id="all-weight" placeholder="gram"></div>
      <button data-action="var-apply-all">Áp dụng cho tất cả phân loại</button>
    </div>
    ${renderVariantTable(p, view)}
    <div class="hint">Cân nặng để trống = dùng cân nặng chung ở mục Vận chuyển. Bỏ tick "Bán" để ngừng bán tổ hợp đó.</div>
    ${orphans.length ? `<div class="orphans"><b>${orphans.length} phân loại cũ không thuộc lựa chọn nào</b> (đang không hiện trên web):
      <ul>${orphans.map((v) => `<li>${esc(v.name)} · ${esc(money(v.price))}đ <button class="danger" data-action="var-remove-orphan" data-vid="${esc(v.id)}">Xoá</button></li>`).join('')}</ul></div>` : ''}
  </section>`;
};

const renderShipping = (p) => {
  const id = esc(keyOf(p));
  const missing = !p.weight && !(p.variants || []).every((v) => v.weight);
  return `<section class="card"><h2>Vận chuyển</h2>
    <div class="grid">
      <div><label>Cân nặng sau đóng gói (gram) *</label>
        <input inputmode="numeric" data-field="weight" data-type="int" data-id="${id}" value="${esc(p.weight ?? '')}" placeholder="vd 300">
        <div class="hint ${missing ? 'warn' : ''}">${missing ? 'Chưa có cân nặng: phí ship sẽ tính theo mức mặc định.' : 'Phí ship tính theo tổng cân nặng giỏ hàng.'}${p.variants?.length ? ' Phân loại để trống cân nặng sẽ dùng số này.' : ''}</div></div>
    </div>
  </section>`;
};

// Runs a structural variant change on the product being edited, then redraws.
const variantOp = (fn, focusSelector) => {
  const p = findProduct(state.editId);
  if (!p) return;
  try {
    fn(p);
  } catch (error) {
    toast(error.message);
  }
  saveDraft();
  render();
  if (focusSelector) app.querySelector(focusSelector)?.focus();
};

const serp = (p) => `<div class="u">phuonglam.com › san-pham › ${esc(p.slug)}</div>
  <div class="t">${esc(p.seoTitle || `${p.name} | Phương Lâm`)}</div>
  <div class="d">${esc((p.seoDescription || p.shortDesc || '').slice(0, 160))}</div>`;

// ---------- editing ----------

const setPath = (target, path, value) => {
  const keys = path.split('.');
  let obj = target;
  for (const key of keys.slice(0, -1)) {
    if (obj[key] == null || typeof obj[key] !== 'object') obj[key] = {};
    obj = obj[key];
  }
  obj[keys.at(-1)] = value;
};

const readInput = (el) => {
  const field = el.dataset.field;
  const type = el.dataset.type;
  if (el.type === 'checkbox') return el.checked;
  if (field === 'price' || type === 'money') return parseMoney(el.value) ?? 0;
  if (field === 'originalPrice') return parseMoney(el.value);
  if (type === 'int') return parseMoney(el.value);
  if (type === 'lines') return toList(el.value);
  if (type === 'specs') return toSpecs(el.value);
  return el.value;
};

const onFieldChange = (el) => {
  const product = findProduct(el.dataset.id);
  if (!product) return;
  const field = el.dataset.field;
  let value = readInput(el);
  // Variant originalPrice: empty means "none", like the product-level field.
  if (/^variants\.\d+\.originalPrice$/.test(field)) value = parseMoney(el.value);
  setPath(product, field, value);

  if (field.startsWith('content.')) product.description = composeDescription(product.content);
  if (field === 'name' && state.autoSlug.has(keyOf(product))) {
    product.slug = slugify(product.name);
    const slugInput = app.querySelector('[data-field="slug"]');
    if (slugInput) slugInput.value = product.slug;
  }
  if (field === 'slug') {
    state.autoSlug.delete(keyOf(product));
    product.slug = slugify(el.value) || el.value;
    const hint = app.querySelector('[data-slug-hint]');
    const before = originalOf(product);
    if (hint) {
      const moved = before && before.slug !== product.slug;
      hint.className = `hint ${moved ? 'warn' : ''}`;
      hint.textContent = moved ? 'Đổi đường dẫn làm link cũ trên Google/Facebook bị lỗi 404. Chỉ đổi khi thật cần.' : `${state.siteUrl}/san-pham/${product.slug}/`;
    }
  }
  if (field === 'seoTitle' || field === 'seoDescription') {
    const holder = el.parentElement.querySelector('[data-counter]');
    if (holder) holder.outerHTML = field === 'seoTitle' ? counter(product.seoTitle, 30, 60) : counter(product.seoDescription, 140, 155);
  }
  const serpBox = app.querySelector('[data-serp]');
  if (serpBox) serpBox.innerHTML = serp(product);
  if (state.view === 'list' && field === 'hidden') renderList();
  saveDraft();
  renderBar();
};

const round1000 = (n) => Math.max(0, Math.round(n / 1000) * 1000);

export const applyBulk = (value, op, amount) => {
  if (op === 'set') return round1000(amount);
  if (value == null || value === 0) return value; // no crossed-out price stays none
  if (op === 'add') return round1000(value + amount);
  if (op === 'sub') return round1000(value - amount);
  if (op === 'addpct') return round1000(value * (1 + amount / 100));
  if (op === 'subpct') return round1000(value * (1 - amount / 100));
  return value;
};

const bulkApply = () => {
  const field = document.getElementById('bulk-field').value;
  const op = document.getElementById('bulk-op').value;
  const amount = Number(String(document.getElementById('bulk-value').value).replace(',', '.').replace(/[^\d.]/g, ''));
  if (!amount && op !== 'set') return toast('Nhập số tiền hoặc phần trăm');
  for (const id of state.selected) {
    const product = findProduct(id);
    if (!product) continue;
    product[field] = applyBulk(product[field], op, amount);
    for (const variant of product.variants || []) variant[field] = applyBulk(variant[field], op, amount);
  }
  toast(`Đã áp cho ${state.selected.size} sản phẩm. Kiểm tra rồi bấm Xuất bản.`);
  saveDraft();
  render();
};

const newProduct = () => {
  const id = `pl_${Date.now().toString(36)}`;
  return {
    id, sku: '', categoryId: state.category || categoriesNow()[0]?.id || '', name: '', price: 0, originalPrice: null,
    shortDesc: '', description: '', usage: '', tag: '', weight: null, hidden: false,
    optionGroups: [], optionImages: {}, images: [], variants: [], slug: '', seoTitle: '', seoDescription: '',
    content: { intro: '', highlights: [], specs: [], steps: [], care: [] },
  };
};

const uniqueSlug = (base, exceptId) => {
  let slug = base || 'san-pham';
  let n = 2;
  while (state.products.some((p) => p.slug === slug && keyOf(p) !== exceptId)) slug = `${base}-${n++}`;
  return slug;
};

// ---------- images ----------

const bytesToBase64 = (bytes) => {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
};

const encodeWebp = async (bitmap, width) => {
  const scale = Math.min(1, width / bitmap.width);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, w, h);
  if (!window.__forceWasmWebp) {
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', 0.82));
    if (blob?.type === 'image/webp') return new Uint8Array(await blob.arrayBuffer());
  }
  const { default: encode } = await import(WEBP_ENCODER);
  return new Uint8Array(await encode(ctx.getImageData(0, 0, w, h), { quality: 82 }));
};

// Resizes picked files to WebP 900/720/480 px, keeps them as pending uploads and
// returns their public paths (/assets/products/uploads/<name>.webp).
const processImages = async (files) => {
  const paths = [];
  for (const file of files) {
    toast(`Đang xử lý ${file.name}…`);
    let bitmap;
    try {
      bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    } catch {
      toast(`Không đọc được ảnh ${file.name}`);
      continue;
    }
    const base = `${Date.now()}-${slugify(file.name.replace(/\.[^.]+$/, '')).slice(0, 60) || 'anh'}`;
    const [full, medium, small] = await Promise.all(IMAGE_WIDTHS.map((w) => encodeWebp(bitmap, w)));
    state.images[`assets/products/uploads/${base}.webp`] = bytesToBase64(full);
    state.images[`assets/products/responsive/${base}-720.webp`] = bytesToBase64(medium);
    state.images[`assets/products/responsive/${base}-480.webp`] = bytesToBase64(small);
    paths.push(`/assets/products/uploads/${base}.webp`);
    bitmap.close?.();
  }
  if (paths.length) toast('Đã thêm ảnh');
  return paths;
};

const addImages = async (product, files) => {
  const paths = await processImages(files);
  product.images = [...(product.images || []), ...paths];
  saveDraft();
  render();
};

// Only send new images that are still used somewhere in the products or settings.
const imagesToPublish = () => {
  const used = new Set();
  const walk = (value) => {
    if (typeof value === 'string' && value.startsWith('/assets/products/uploads/')) used.add(value.slice(1));
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(state.products);
  walk(state.settings);
  return Object.entries(state.images).filter(([path]) => {
    const upload = path.startsWith('assets/products/uploads/')
      ? path
      : path.replace('assets/products/responsive/', 'assets/products/uploads/').replace(/-(480|720)\.webp$/, '.webp');
    return used.has(upload);
  }).map(([path, data]) => ({ path, data }));
};

// ---------- publish & deploy status ----------

const checkBeforePublish = () => {
  const problems = [];
  const slugs = new Map();
  for (const p of state.products) {
    if (!p.name.trim()) problems.push('Có sản phẩm chưa có tên');
    if (!p.slug) problems.push(`"${p.name}": thiếu đường dẫn`);
    if (slugs.has(p.slug)) problems.push(`"${p.name}" trùng đường dẫn với "${slugs.get(p.slug)}"`);
    slugs.set(p.slug, p.name);
    if (!p.categoryId) problems.push(`"${p.name}": chưa chọn danh mục`);
    if (!p.hidden && !p.variants?.length && !p.price) problems.push(`"${p.name}": đang hiện nhưng giá bán = 0`);
    if (!p.hidden && !p.images?.length) problems.push(`"${p.name}": đang hiện nhưng chưa có ảnh`);
    (p.optionGroups || []).forEach((g, gi) => {
      if (!g.values.length) problems.push(`"${p.name}": nhóm phân loại ${gi + 1} (${g.name}) chưa có lựa chọn nào`);
    });
    if (p.optionGroups?.length && !p.variants?.some((v) => v.price > 0)) problems.push(`"${p.name}": chưa có phân loại nào có giá bán`);
    if (p.categoryId && !categoriesNow().some((c) => c.id === p.categoryId)) problems.push(`"${p.name}": danh mục "${p.categoryId}" không còn trong danh sách danh mục`);
  }
  const ids = new Set();
  categoriesNow().forEach((c, i) => {
    if (!c.name.trim()) problems.push(`Danh mục #${i + 1} chưa có tên`);
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id)) problems.push(`Danh mục "${c.name}": mã đường dẫn chỉ dùng a-z, 0-9 và dấu gạch`);
    if (ids.has(c.id)) problems.push(`Hai danh mục trùng mã "${c.id}"`);
    ids.add(c.id);
  });
  return problems;
};

const publish = async () => {
  const problems = checkBeforePublish();
  if (problems.length) return showDialog('Chưa xuất bản được', `<ul>${problems.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`);
  state.publishing = true;
  renderBar();
  try {
    const result = await api('/api/publish', {
      method: 'POST',
      body: JSON.stringify({
        baseSha: state.baseSha,
        // Only what changed is sent, so the other file is never overwritten with an old copy.
        ...(productsChanged() ? { productsSha: state.productsSha, products: state.products } : {}),
        ...(settingsChanged() ? { settingsSha: state.settingsSha, settings: state.settings } : {}),
        images: imagesToPublish(),
        message: changeSummary(),
      }),
    });
    state.baseSha = result.commitSha;
    if (result.productsSha) state.productsSha = result.productsSha;
    if (result.settingsSha) state.settingsSha = result.settingsSha;
    state.original = clone(state.products);
    state.originalSettings = clone(state.settings);
    state.images = {};
    state.autoSlug.clear();
    clearDraft();
    toast(result.unchanged ? 'Không có gì thay đổi' : 'Đã xuất bản. Web cập nhật sau 1–2 phút.');
    if (!result.unchanged) watchDeploy(result.commitSha);
  } catch (error) {
    if (error.status === 409) {
      showDialog('Dữ liệu trên web đã đổi', `<p>${esc(error.message)}</p><p>Bản nháp của bạn vẫn được giữ trên máy này.</p>`, '<button class="danger" data-action="reload-fresh">Bỏ nháp, tải dữ liệu mới</button>');
    } else {
      showDialog('Xuất bản lỗi', `<p>${esc(error.message)}</p>${error.details?.length ? `<ul>${error.details.map((d) => `<li>${esc(d)}</li>`).join('')}</ul>` : ''}`);
    }
  } finally {
    state.publishing = false;
    render();
  }
};

const deployEl = document.getElementById('deploy');
const watchDeploy = (sha, started = Date.now()) => {
  clearTimeout(watchDeploy.timer);
  deployEl.hidden = false;
  deployEl.className = 'deploy';
  deployEl.textContent = 'Đang cập nhật web…';
  const tick = async () => {
    try {
      const status = await api(`/api/status?sha=${sha}`);
      if (status.state === 'live') {
        deployEl.textContent = 'Web đã cập nhật ✓';
        setTimeout(() => { deployEl.hidden = true; }, 15000);
        return;
      }
      if (status.state === 'failed') {
        deployEl.className = 'deploy failed';
        deployEl.innerHTML = `Build lỗi, web giữ bản cũ · <a href="${esc(status.runUrl)}" target="_blank" rel="noopener">chi tiết</a>`;
        return;
      }
    } catch {
      // Keep polling; a single failed status call is not a deploy failure.
    }
    if (Date.now() - started > 15 * 60 * 1000) {
      deployEl.textContent = 'Chưa thấy web cập nhật, kiểm tra GitHub Actions';
      return;
    }
    watchDeploy.timer = setTimeout(tick, 8000);
  };
  watchDeploy.timer = setTimeout(tick, 5000);
};

// ---------- dialogs ----------

const showDialog = (title, html, extraButtons = '') => {
  dialog.innerHTML = `<div class="dlg"><h2>${esc(title)}</h2>${html}<div class="actions">${extraButtons}<button data-action="close-dialog">Đóng</button></div></div>`;
  dialog.showModal();
};

const showChanges = () => {
  const items = changeList().map((c) => {
    if (c.type === 'add') return `<li><b>Thêm mới:</b> ${esc(c.product.name || '(chưa có tên)')}</li>`;
    if (c.type === 'delete') return `<li><b>Xoá:</b> ${esc(c.product.name)}</li>`;
    const parts = c.fields.map((f) => describeField(f, c.before, c.product)).filter(Boolean);
    return `<li class="diff"><button class="link" data-action="edit" data-id="${esc(keyOf(c.product))}">${esc(c.product.name)}</button><br>${parts.join(' · ')}</li>`;
  });
  if (settingsChanged()) items.push(`<li class="diff"><button class="link" data-action="tab" data-tab="home">Trang chủ &amp; danh mục</button><br>${esc(settingsChangeParts().join(', '))}</li>`);
  showDialog('Thay đổi chưa xuất bản', `<ul>${items.join('')}</ul>`);
};

// ---------- events ----------

document.addEventListener('click', async (event) => {
  const el = event.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT' && el.type === 'file') return;
  const action = el.dataset.action;
  const product = state.view === 'edit' ? findProduct(state.editId) : null;
  if (action === 'tab') {
    if (dialog.open) dialog.close();
    state.view = el.dataset.tab === 'home' ? 'home' : 'list';
    render();
    window.scrollTo(0, 0);
    return;
  }
  if (state.view === 'home' && homeAction(action, el)) return;
  switch (action) {
    case 'edit':
      if (dialog.open) dialog.close();
      state.view = 'edit';
      state.editId = el.dataset.id;
      render();
      window.scrollTo(0, 0);
      break;
    case 'back':
      state.view = 'list';
      render();
      break;
    case 'add': {
      const p = newProduct();
      state.products.unshift(p);
      state.autoSlug.add(keyOf(p));
      state.view = 'edit';
      state.editId = keyOf(p);
      render();
      app.querySelector('[data-field="name"]')?.focus();
      break;
    }
    case 'duplicate': {
      const source = findProduct(el.dataset.id);
      const copy = { ...clone(source), id: `pl_${Date.now().toString(36)}`, name: `${source.name} (bản sao)`, hidden: true };
      copy.slug = uniqueSlug(`${source.slug}-ban-sao`, copy.id);
      copy.variants = (copy.variants || []).map((v, i) => ({ ...v, id: `${copy.id}_v${i}` }));
      state.products.splice(state.products.indexOf(source) + 1, 0, copy);
      state.editId = keyOf(copy);
      toast('Đã tạo bản sao (đang ẩn)');
      saveDraft();
      render();
      break;
    }
    case 'revert': {
      const before = originalOf(findProduct(el.dataset.id));
      const index = state.products.findIndex((p) => keyOf(p) === el.dataset.id);
      state.products[index] = clone(before);
      saveDraft();
      render();
      break;
    }
    case 'delete': {
      const target = findProduct(el.dataset.id);
      const live = originalOf(target) && !originalOf(target).hidden;
      if (!confirm(`Xoá "${target.name}"?${live ? '\n\nTrang sản phẩm đang có trên Google sẽ thành lỗi 404. Nếu chỉ tạm ngừng bán, nên bấm "Ẩn" thay vì xoá.' : ''}`)) return;
      state.products = state.products.filter((p) => p !== target);
      state.view = 'list';
      saveDraft();
      render();
      break;
    }
    case 'select':
      if (el.checked) state.selected.add(el.dataset.id);
      else state.selected.delete(el.dataset.id);
      renderList();
      break;
    case 'select-all': {
      const rows = visibleProducts();
      if (el.checked) rows.forEach((p) => state.selected.add(keyOf(p)));
      else rows.forEach((p) => state.selected.delete(keyOf(p)));
      renderList();
      break;
    }
    case 'bulk-apply':
      bulkApply();
      break;
    case 'bulk-hide':
    case 'bulk-show':
      state.selected.forEach((id) => { const p = findProduct(id); if (p) p.hidden = action === 'bulk-hide'; });
      saveDraft();
      render();
      break;
    case 'bulk-clear':
      state.selected.clear();
      renderList();
      break;
    case 'img-left':
    case 'img-right': {
      const i = Number(el.dataset.index);
      const j = action === 'img-left' ? i - 1 : i + 1;
      [product.images[i], product.images[j]] = [product.images[j], product.images[i]];
      saveDraft();
      render();
      break;
    }
    case 'img-remove': {
      const src = product.images[Number(el.dataset.index)];
      product.images.splice(Number(el.dataset.index), 1);
      // Variants pointing at the removed image would show a missing picture.
      (product.variants || []).forEach((v) => { if (v.image === src) v.image = ''; });
      saveDraft();
      render();
      break;
    }
    case 'var-add-group': {
      const next = Variants.ensureGroups(clone(product)).optionGroups.length;
      variantOp((p) => Variants.addGroup(p), `[data-var-group-name="${next}"]`);
      app.querySelector(`[data-var-group-name="${next}"]`)?.select();
      break;
    }
    case 'var-remove-group': {
      const gi = Number(el.dataset.group);
      const name = Variants.ensureGroups(clone(product)).optionGroups[gi]?.name;
      const last = Variants.ensureGroups(clone(product)).optionGroups.length === 1;
      if (!confirm(last
        ? `Xoá nhóm "${name}"? Sản phẩm sẽ không còn phân loại, giữ giá thấp nhất làm giá bán.`
        : `Xoá nhóm "${name}"? Các dòng sẽ gộp lại theo nhóm còn lại.`)) return;
      variantOp((p) => Variants.removeGroup(p, gi));
      break;
    }
    case 'var-remove-value': {
      const gi = Number(el.dataset.group);
      const vi = Number(el.dataset.index);
      const value = Variants.ensureGroups(clone(product)).optionGroups[gi]?.values[vi];
      if (!confirm(`Xoá lựa chọn "${value}" và các dòng phân loại của nó?`)) return;
      variantOp((p) => Variants.removeValue(p, gi, vi));
      break;
    }
    case 'var-move-value':
      variantOp((p) => Variants.moveValue(p, Number(el.dataset.group), Number(el.dataset.index), Number(el.dataset.step)));
      break;
    case 'var-apply-all': {
      const values = Object.fromEntries(['price', 'originalPrice', 'weight']
        .map((field) => [field, parseMoney(document.getElementById(`all-${field}`).value)])
        .filter(([, value]) => value != null));
      if (!Object.keys(values).length) return toast('Nhập giá hoặc cân nặng để áp dụng');
      variantOp((p) => {
        p.variants.forEach((v) => Object.assign(v, values));
        Variants.syncProductPrice(p);
      });
      toast(`Đã áp dụng cho ${product.variants.length} phân loại`);
      break;
    }
    case 'var-remove-orphan':
      if (!confirm('Xoá phân loại cũ này?')) return;
      variantOp((p) => { p.variants = p.variants.filter((v) => v.id !== el.dataset.vid); });
      break;
    case 'show-changes':
      showChanges();
      break;
    case 'discard-all':
      if (!confirm('Huỷ mọi thay đổi chưa xuất bản?')) return;
      state.products = clone(state.original);
      state.settings = clone(state.originalSettings);
      state.images = {};
      state.selected.clear();
      clearDraft();
      render();
      break;
    case 'publish':
      publish();
      break;
    case 'close-dialog':
      dialog.close();
      break;
    case 'reload-fresh':
      clearDraft();
      location.reload();
      break;
    default:
      break;
  }
});

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'search') {
    state.search = el.value;
    const pos = el.selectionStart;
    renderList();
    const input = document.getElementById('search');
    input.focus();
    input.setSelectionRange(pos, pos);
    return;
  }
  if (el.dataset.field && el.type !== 'checkbox' && el.tagName !== 'SELECT') onFieldChange(el);
  if (el.dataset.vfield) onVariantFieldChange(el);
  if (el.dataset.catField) onCategoryInput(el);
});

// Price / crossed-out price / weight / SKU of one row of the variant table.
const onVariantFieldChange = (el) => {
  const product = findProduct(state.editId);
  const variant = product?.variants.find((v) => v.id === el.dataset.vid);
  if (!variant) return;
  const field = el.dataset.vfield;
  if (field === 'sku') variant.sku = el.value.trim();
  else if (field === 'price') variant.price = parseMoney(el.value) ?? 0;
  else variant[field] = parseMoney(el.value);
  if (field === 'price' || field === 'originalPrice') Variants.syncProductPrice(product);
  saveDraft();
  renderBar();
};

// Structural variant edits (group names, values, images, on/off) run on "change",
// i.e. when the field is left or Enter is pressed, then the table is rebuilt.
const onVariantStructureChange = (el) => {
  const d = el.dataset;
  if (d.varGroupName !== undefined) {
    variantOp((p) => Variants.renameGroup(p, Number(d.varGroupName), el.value));
    return true;
  }
  if (d.varValue !== undefined) {
    variantOp((p) => Variants.renameValue(p, Number(d.varValue), Number(d.index), el.value));
    return true;
  }
  if (d.varNew !== undefined) {
    if (!el.value.trim()) return true;
    variantOp((p) => Variants.addValue(p, Number(d.varNew), el.value), `[data-var-new="${d.varNew}"]`);
    return true;
  }
  if (d.varImage !== undefined) {
    variantOp((p) => Variants.setValueImage(p, Number(d.varImage), d.value, el.value));
    return true;
  }
  if (d.varSale !== undefined) {
    variantOp((p) => Variants.setComboOnSale(p, JSON.parse(d.varSale), el.checked));
    return true;
  }
  return false;
};

document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.id === 'category') {
    state.category = el.value;
    renderList();
    return;
  }
  if (el.dataset.action === 'img-upload') {
    const product = findProduct(state.editId);
    if (product && el.files?.length) addImages(product, [...el.files]);
    return;
  }
  if (onVariantStructureChange(el)) return;
  if (el.dataset.action === 'header-upload' || el.dataset.action === 'cat-upload') {
    onHomeFiles(el);
    return;
  }
  if (el.id === 'featured-pick' && el.value) {
    state.settings.featuredIds.push(el.value);
    saveDraft();
    render();
    return;
  }
  // A category name/id is tidied once the field is left (trailing spaces, empty id).
  if (el.dataset.catField) {
    const c = state.settings.categories[Number(el.dataset.index)];
    if (c) {
      c.name = c.name.trim();
      if (!c.id) setCategoryId(c, uniqueCategoryId(slugify(c.name) || 'danh-muc-moi', c));
    }
    saveDraft();
    render();
  }
  if (el.dataset.field && (el.type === 'checkbox' || el.tagName === 'SELECT')) {
    onFieldChange(el);
    if (el.tagName === 'SELECT' && el.dataset.field.includes('.image')) render();
  }
});

// Money inputs show thousands separators once the field loses focus.
document.addEventListener('focusout', (event) => {
  const el = event.target;
  const field = el.dataset?.field || el.dataset?.vfield || '';
  if (el.tagName === 'INPUT' && (field === 'price' || field === 'originalPrice' || el.dataset.type === 'money')) {
    el.value = money(parseMoney(el.value));
    const row = el.closest('.row');
    const product = findProduct(el.dataset.id);
    if (row && product) row.classList.toggle('changed', !!originalOf(product) && !same(originalOf(product), product));
  }
});

window.addEventListener('beforeunload', (event) => {
  if (changeCount() && !readDraft()) event.preventDefault();
});

// ---------- start ----------

const start = async () => {
  try {
    const data = await api('/api/catalog');
    Object.assign(state, {
      baseSha: data.baseSha,
      productsSha: data.productsSha,
      siteUrl: data.siteUrl || state.siteUrl,
      original: data.products,
      products: clone(data.products),
      settingsSha: data.settingsSha,
      originalSettings: data.settings,
      settings: clone(data.settings),
    });
    const draft = readDraft();
    if (draft?.products) {
      // A draft is only reusable when neither file changed on the site since it was saved.
      if (draft.productsSha === data.productsSha && (!draft.settings || draft.settingsSha === data.settingsSha)) {
        state.products = draft.products;
        if (draft.settings) state.settings = draft.settings;
        state.images = draft.images || {};
        toast('Đã mở lại bản nháp chưa xuất bản');
      } else {
        showDialog(
          'Có bản nháp cũ',
          '<p>Máy này còn bản nháp chưa xuất bản, nhưng dữ liệu trên web đã đổi sau đó. Bản nháp không dùng được nữa.</p>',
          '<button class="danger" data-action="reload-fresh">Bỏ bản nháp</button>',
        );
      }
    }
    render();
    document.getElementById('logout').hidden = false;
  } catch (error) {
    if (error.status === 401) return renderLogin();
    app.innerHTML = `<p class="empty">${esc(error.message)}</p><p class="empty"><button onclick="location.reload()">Tải lại</button></p>`;
  }
};

const renderLogin = (message = '') => {
  bar.hidden = true;
  if (tabsEl) tabsEl.hidden = true;
  document.getElementById('logout').hidden = true;
  app.innerHTML = `<form class="card login" id="login-form">
    <h2>Đăng nhập</h2>
    <label for="password">Mật khẩu quản lý</label>
    <input type="password" id="password" autocomplete="current-password" required>
    ${message ? `<p class="hint bad">${esc(message)}</p>` : ''}
    <button class="primary" type="submit">Vào trang quản lý</button>
  </form>`;
  document.getElementById('password').focus();
};

document.addEventListener('submit', async (event) => {
  if (event.target.id !== 'login-form') return;
  event.preventDefault();
  const button = event.target.querySelector('button');
  button.disabled = true;
  try {
    await api('/api/login', { method: 'POST', body: JSON.stringify({ password: document.getElementById('password').value }) });
    app.innerHTML = '<p class="loading">Đang tải dữ liệu…</p>';
    await start();
  } catch (error) {
    renderLogin(error.status === 401 ? 'Sai mật khẩu' : error.message);
  }
});

document.getElementById('logout').addEventListener('click', async () => {
  if (changeCount() && !confirm('Còn thay đổi chưa xuất bản (vẫn lưu nháp trên máy này). Vẫn đăng xuất?')) return;
  await api('/api/logout', { method: 'POST', body: '{}' }).catch(() => {});
  renderLogin();
});

start();
