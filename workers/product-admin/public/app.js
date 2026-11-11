// Online product admin (Admin v2). Plain ES module, no build step.
// Edits stay in a browser draft until "Xuất bản", which sends all products plus new
// images to /api/publish as one commit. See docs/ADMIN-V2.md.

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
  categories: [],
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

const categoryName = (id) => state.categories.find((c) => c.id === id)?.name || id || '—';

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
    const changed = changeList().length > 0;
    try {
      if (!changed) localStorage.removeItem(DRAFT_KEY);
      else localStorage.setItem(DRAFT_KEY, JSON.stringify({
        productsSha: state.productsSha, products: state.products, images: state.images, savedAt: Date.now(),
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

const changeSummary = () => {
  const list = changeList();
  const names = list.slice(0, 3).map((c) => c.product.name).join(', ');
  return `${list.length} sản phẩm: ${names}${list.length > 3 ? '…' : ''}`;
};

// ---------- rendering ----------

const render = () => {
  if (state.view === 'edit' && findProduct(state.editId)) renderEdit();
  else {
    state.view = 'list';
    renderList();
  }
  renderBar();
};

const renderBar = () => {
  const count = changeList().length;
  bar.hidden = count === 0;
  if (!count) return;
  bar.innerHTML = `<span class="n">${count} sản phẩm có thay đổi chưa xuất bản</span>
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
        ${state.categories.map((c) => `<option value="${esc(c.id)}" ${c.id === state.category ? 'selected' : ''}>${esc(c.name)} (${state.products.filter((p) => p.categoryId === c.id).length})</option>`).join('')}
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
  const hasVariants = p.variants?.length > 0;
  const liveUrl = before && !before.hidden ? `${state.siteUrl}/san-pham/${before.slug}/` : '';
  const imageOptions = (selected) => `<option value="">—</option>${(p.images || []).map((src, i) => `<option value="${esc(src)}" ${src === selected ? 'selected' : ''}>Ảnh ${i + 1}</option>`).join('')}${selected && !(p.images || []).includes(selected) ? `<option value="${esc(selected)}" selected>Ảnh riêng</option>` : ''}`;

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
          ${state.categories.map((cat) => `<option value="${esc(cat.id)}" ${cat.id === p.categoryId ? 'selected' : ''}>${esc(cat.name)}</option>`).join('')}
          ${state.categories.some((cat) => cat.id === p.categoryId) ? '' : `<option value="${esc(p.categoryId)}" selected>${esc(p.categoryId || '— chọn —')}</option>`}
        </select></div>
        <div><label>Nhãn</label><select data-field="tag" data-id="${id}">
          ${['', 'Bán chạy', 'Nổi bật', 'Mới', 'Sale'].map((t) => `<option value="${t}" ${t === (p.tag || '') ? 'selected' : ''}>${t || '(không)'}</option>`).join('')}
        </select></div>
        <div><label>SKU</label><input data-field="sku" data-id="${id}" value="${esc(p.sku)}"></div>
        <div><label>Cân nặng (gram)</label><input inputmode="numeric" data-field="weight" data-type="int" data-id="${id}" value="${esc(p.weight ?? '')}"></div>
        ${hasVariants ? '' : `
        <div><label>Giá bán (đ)</label><input inputmode="numeric" data-field="price" data-id="${id}" value="${esc(money(p.price))}"></div>
        <div><label>Giá gạch (đ, để trống nếu không có)</label><input inputmode="numeric" data-field="originalPrice" data-id="${id}" value="${esc(money(p.originalPrice))}"></div>`}
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

    ${hasVariants ? `
    <section class="card"><h2>Phân loại (${p.variants.length})</h2>
      <div class="chips">${(p.optionGroups || []).map((g) => `<span class="chip">${esc(g.name)}: ${g.values.length} lựa chọn</span>`).join('')}</div>
      <div class="apply-all">
        <div><label>Giá bán tất cả</label><input inputmode="numeric" id="all-price"></div>
        <div><label>Giá gạch tất cả</label><input inputmode="numeric" id="all-originalPrice"></div>
        <div><label>Cân nặng tất cả (g)</label><input inputmode="numeric" id="all-weight"></div>
        <button data-action="variants-apply">Áp cho mọi dòng</button>
      </div>
      <div class="scroll-x"><table class="variants">
        <thead><tr><th>Tên phân loại</th><th>Giá bán</th><th>Giá gạch</th><th>Cân nặng (g)</th><th>Ảnh</th><th></th></tr></thead>
        <tbody>${p.variants.map((v, i) => `<tr>
          <td><input data-field="variants.${i}.name" data-id="${id}" value="${esc(v.name)}"></td>
          <td class="num"><input inputmode="numeric" data-field="variants.${i}.price" data-type="money" data-id="${id}" value="${esc(money(v.price))}"></td>
          <td class="num"><input inputmode="numeric" data-field="variants.${i}.originalPrice" data-type="money" data-id="${id}" value="${esc(money(v.originalPrice))}"></td>
          <td class="num"><input inputmode="numeric" data-field="variants.${i}.weight" data-type="int" data-id="${id}" value="${esc(v.weight ?? '')}"></td>
          <td>${v.image ? `<img src="${esc(imageUrl(v.image))}" alt="">` : ''} <select data-field="variants.${i}.image" data-id="${id}">${imageOptions(v.image)}</select></td>
          <td><button class="danger" data-action="variant-remove" data-index="${i}" aria-label="Xoá dòng">✕</button></td>
        </tr>`).join('')}</tbody>
      </table></div>
      <div class="hint">Dòng có giá 0 sẽ không hiện trên web. Thêm lựa chọn mới (size, mùi…) vẫn làm ở admin cũ.</div>
    </section>` : ''}

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
    id, sku: '', categoryId: state.category || state.categories[0]?.id || '', name: '', price: 0, originalPrice: null,
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

const addImages = async (product, files) => {
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
    product.images = [...(product.images || []), `/assets/products/uploads/${base}.webp`];
    bitmap.close?.();
  }
  toast('Đã thêm ảnh');
  saveDraft();
  render();
};

// Only send new images that are still used somewhere in the products.
const imagesToPublish = () => {
  const used = new Set();
  const walk = (value) => {
    if (typeof value === 'string' && value.startsWith('/assets/products/uploads/')) used.add(value.slice(1));
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(state.products);
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
  }
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
        productsSha: state.productsSha,
        products: state.products,
        images: imagesToPublish(),
        message: changeSummary(),
      }),
    });
    state.baseSha = result.commitSha;
    state.productsSha = result.productsSha;
    state.original = clone(state.products);
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
  showDialog('Thay đổi chưa xuất bản', `<ul>${items.join('')}</ul>`);
};

// ---------- events ----------

document.addEventListener('click', async (event) => {
  const el = event.target.closest('[data-action]');
  if (!el || el.tagName === 'INPUT' && el.type === 'file') return;
  const action = el.dataset.action;
  const product = state.view === 'edit' ? findProduct(state.editId) : null;
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
    case 'variant-remove':
      if (!confirm('Xoá dòng phân loại này?')) return;
      product.variants.splice(Number(el.dataset.index), 1);
      saveDraft();
      render();
      break;
    case 'variants-apply': {
      for (const field of ['price', 'originalPrice', 'weight']) {
        const value = parseMoney(document.getElementById(`all-${field}`).value);
        if (value != null) product.variants.forEach((v) => { v[field] = value; });
      }
      saveDraft();
      render();
      break;
    }
    case 'show-changes':
      showChanges();
      break;
    case 'discard-all':
      if (!confirm('Huỷ mọi thay đổi chưa xuất bản?')) return;
      state.products = clone(state.original);
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
});

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
  if (el.dataset.field && (el.type === 'checkbox' || el.tagName === 'SELECT')) {
    onFieldChange(el);
    if (el.tagName === 'SELECT' && el.dataset.field.includes('.image')) render();
  }
});

// Money inputs show thousands separators once the field loses focus.
document.addEventListener('focusout', (event) => {
  const el = event.target;
  const field = el.dataset?.field || '';
  if (el.tagName === 'INPUT' && (field === 'price' || field === 'originalPrice' || el.dataset.type === 'money')) {
    el.value = money(parseMoney(el.value));
    const row = el.closest('.row');
    const product = findProduct(el.dataset.id);
    if (row && product) row.classList.toggle('changed', !!originalOf(product) && !same(originalOf(product), product));
  }
});

window.addEventListener('beforeunload', (event) => {
  if (changeList().length && !readDraft()) event.preventDefault();
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
      categories: data.categories.length ? data.categories : [...new Set(data.products.map((p) => p.categoryId))].map((id) => ({ id, name: id })),
    });
    const draft = readDraft();
    if (draft?.products) {
      if (draft.productsSha === data.productsSha) {
        state.products = draft.products;
        state.images = draft.images || {};
        toast('Đã mở lại bản nháp chưa xuất bản');
      } else {
        showDialog(
          'Có bản nháp cũ',
          '<p>Máy này còn bản nháp chưa xuất bản, nhưng sản phẩm trên web đã đổi sau đó. Bản nháp không dùng được nữa.</p>',
          '<button class="danger" data-action="reload-fresh">Bỏ bản nháp</button>',
        );
      }
    }
    render();
  } catch (error) {
    app.innerHTML = `<p class="empty">${esc(error.message)}</p><p class="empty"><button onclick="location.reload()">Tải lại</button></p>`;
  }
};

start();
