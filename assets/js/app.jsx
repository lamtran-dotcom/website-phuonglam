const LOGO_SRC = "/assets/media/generated/embedded-001.png";
const ORDER_WEBHOOK_URL = "https://phuonglam-order-webhook.tranquanglam1998.workers.dev/";

const HERO_IMAGES = [
  "/assets/media/generated/embedded-002.jpg",
  "/assets/media/generated/embedded-003.jpg",
  "/assets/media/generated/embedded-004.jpg",
  "/assets/media/generated/embedded-005.jpg",
  "/assets/media/generated/embedded-006.jpg",
  "/assets/media/generated/embedded-007.jpg",
  "/assets/media/generated/embedded-008.jpg",
];
const BAKED_HEADER_IMAGES = /*BAKED_HEADER_IMAGES*/["/assets/media/generated/embedded-002.jpg","/assets/media/generated/embedded-003.jpg","/assets/media/generated/embedded-004.jpg","/assets/media/generated/embedded-008.jpg","/assets/media/generated/embedded-005.jpg","/assets/products/uploads/1777479221546-chatgpt-image-16-31-00-29-thg-4-2026-trung-binh.webp"]/*END_BAKED_HEADER_IMAGES*/;

const BLOG_IMAGE_MAP = {
  'huong-dan-dung-bep-xong-thao-moc': '/assets/blog/featured-bep-xong-thao-moc-phuong-lam.webp',
  'phan-biet-nen-tealight-nen-2h-4h-8h': '/assets/blog/nen-tealight-khong-khoi-featured.webp',
};

const getBlogImage = (slug) => {
  const post = BLOG_POSTS.find(item => item.slug === slug);
  return post?.image || BLOG_IMAGE_MAP[slug] || null;
};

const normalizeSearchText = (value) => (value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .trim();

const useIsMobile = () => {
  const [w, setW] = React.useState(window.innerWidth);
  React.useEffect(() => {
    const h = () => setW(window.innerWidth);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return w < 768;
};

const categoryUrl = (categoryId) => `/danh-muc/${categoryId}/`;
const productUrl = (product) => product?.slug ? `/san-pham/${product.slug}/` : '#';
const queryFlag = (key) => new URLSearchParams(window.location.search).get(key) === 'open';

const Header = ({ page, setPage, cartCount, setCartCount }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const logoClicksRef = React.useRef(0);
  const logoTimerRef = React.useRef(null);
  const isMobile = useIsMobile();

  const navLinks = [
    { label: 'Nến Tealight Xông', page: 'category', cat: 'nen-thom', href: categoryUrl('nen-thom') },
    { label: 'Combo Xông Nhà', page: 'category', cat: 'combo', href: categoryUrl('combo') },
    { label: 'Thảo Mộc Xông', page: 'category', cat: 'thao-moc-xong', href: categoryUrl('thao-moc-xong') },
    { label: 'Đèn Xông Tinh Dầu', page: 'category', cat: 'bep-xong', href: categoryUrl('bep-xong') },
    { label: 'Phụ Kiện Xông', page: 'category', cat: 'phu-kien', href: categoryUrl('phu-kien') },
    { label: 'Hướng Dẫn', page: 'blog' },
  ];

  const handleLogoClick = () => {
    logoClicksRef.current += 1;
    clearTimeout(logoTimerRef.current);
    if (logoClicksRef.current >= 5) {
      logoClicksRef.current = 0;
      setAdminPassword('');
      setAdminLoginOpen(true);
      return;
    }
    logoTimerRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
      setPage({ name: 'home' });
    }, 600);
  };

  const handleAdminLogin = (event) => {
    event.preventDefault();
    const value = adminPassword.trim();
    if (!value) return;
    localStorage.setItem('phuonglam_admin_password', value);
    window.location.href = 'admin-upload.html';
  };

  return (
    <header style={headerStyles.wrap}>
      <div style={headerStyles.inner}>
        {/* Logo */}
        <div style={headerStyles.logo} onClick={handleLogoClick}>
          <img src={LOGO_SRC} alt="Phương Lâm" style={headerStyles.logoImg} />
        </div>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav style={headerStyles.nav}>
            {navLinks.map(l => {
              const active = page.name === l.page && (!l.cat || page.cat === l.cat);
              const style = {
                ...headerStyles.navLink,
                color: active ? '#318223' : '#2d2d2d',
                fontWeight: active ? '800' : '700',
              };
              return l.href ? (
                <a key={l.label} href={l.href} style={style}>{l.label}</a>
              ) : (
                <span key={l.label} style={style} onClick={() => setPage({ name: l.page })}>{l.label}</span>
              );
            })}
          </nav>
        )}

        {/* Actions */}
        <div style={headerStyles.actions}>
          {/* Admin hidden: access via logo click x5 with password */}
          <button id="site-cart-button" style={headerStyles.cartBtn} onClick={() => setPage({ name: 'cart' })}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 && <span style={headerStyles.badge}>{cartCount}</span>}
          </button>
          {isMobile && (
            <button style={{ ...headerStyles.menuBtn, display: 'flex' }} onClick={() => setMenuOpen(!menuOpen)}>
              <span style={headerStyles.hamburger}></span>
              <span style={headerStyles.hamburger}></span>
              <span style={headerStyles.hamburger}></span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={headerStyles.mobileMenu}>
          {navLinks.map(l => l.href ? (
            <a key={l.label} href={l.href} style={headerStyles.mobileLink}>{l.label}</a>
          ) : (
            <span key={l.label} style={headerStyles.mobileLink}
              onClick={() => { setPage({ name: l.page }); setMenuOpen(false); }}>
              {l.label}
            </span>
          ))}
        </div>
      )}

      {adminLoginOpen && (
        <div style={headerStyles.adminOverlay} onClick={() => setAdminLoginOpen(false)}>
          <form style={headerStyles.adminModal} onSubmit={handleAdminLogin} onClick={e => e.stopPropagation()}>
            <div style={headerStyles.adminIcon}>🔐</div>
            <h2 style={headerStyles.adminTitle}>Đăng nhập admin</h2>
            <p style={headerStyles.adminDesc}>Nhập mật khẩu quản trị để mở trang cập nhật sản phẩm.</p>
            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              autoFocus
              placeholder="Mật khẩu admin"
              style={headerStyles.adminInput}
            />
            <button type="submit" style={headerStyles.adminSubmit}>Vào trang admin</button>
            <button type="button" style={headerStyles.adminCancel} onClick={() => setAdminLoginOpen(false)}>Hủy</button>
          </form>
        </div>
      )}
    </header>
  );
};

const headerStyles = {
  wrap: { background: '#fff', borderBottom: '1px solid #f0f0f0', position: 'sticky', top: 0, zIndex: 100 },
  inner: { maxWidth: 1320, margin: '0 auto', padding: '0 28px', height: 128, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 },
  logo: { display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', flexShrink: 0 },
  logoImg: { height: 120, width: 'auto', display: 'block', transform: 'translateY(-10px)' },
  logoMark: { color: '#318223', fontSize: 20 },
  logoText: { fontSize: 22, fontWeight: 700, letterSpacing: '0.5px', color: '#318223', textTransform: 'uppercase' },
  nav: { display: 'flex', gap: 16, flex: 1, justifyContent: 'center', flexWrap: 'nowrap' },
  navLink: { fontSize: 14.5, cursor: 'pointer', transition: 'color .2s', letterSpacing: '0em', whiteSpace: 'nowrap', textDecoration: 'none' },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#444', display: 'flex', alignItems: 'center' },
  cartBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#444', display: 'flex', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 2, right: 2, background: '#318223', color: '#fff', fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  menuBtn: { display: 'none', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 8 },
  hamburger: { display: 'block', width: 20, height: 2, background: '#333', borderRadius: 2 },
  mobileMenu: { padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid #f0f0f0' },
  mobileLink: { padding: '10px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', color: '#333', textDecoration: 'none' },
  adminOverlay: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(18, 32, 17, .42)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  adminModal: { width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #e3efde', borderRadius: 24, boxShadow: '0 28px 80px rgba(28, 73, 22, .24)', padding: '30px 28px 24px', textAlign: 'center', animation: 'modalPop .18s ease-out' },
  adminIcon: { width: 62, height: 62, borderRadius: '50%', background: '#edf8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 },
  adminTitle: { margin: 0, fontSize: 28, color: '#1f1f1f', letterSpacing: '-0.03em' },
  adminDesc: { margin: '8px 0 20px', color: '#777', fontSize: 14, lineHeight: 1.6 },
  adminInput: { width: '100%', border: '1.5px solid #dbe8d7', borderRadius: 14, padding: '14px 16px', fontSize: 16, outline: 'none', textAlign: 'center', boxSizing: 'border-box', marginBottom: 12 },
  adminSubmit: { width: '100%', border: 'none', borderRadius: 14, padding: '14px 18px', background: '#318223', color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 14px 28px rgba(49, 130, 35, .2)' },
  adminCancel: { width: '100%', marginTop: 10, border: '1px solid #e3e3e3', borderRadius: 14, padding: '12px 18px', background: '#fff', color: '#777', fontSize: 14, fontWeight: 800, cursor: 'pointer' },
};




const getResponsiveImageAttrs = (src, sizes = '(max-width: 767px) 50vw, 260px') => {
  if (!src || typeof src !== 'string' || src.startsWith('data:')) return {};
  const pathOnly = src.split('?')[0];
  if (!pathOnly.startsWith('/assets/products/mirrored/') && !pathOnly.startsWith('/assets/products/uploads/')) return {};
  const fileName = pathOnly.split('/').pop() || '';
  const baseName = fileName.replace(/\.[^.]+$/, '');
  if (!baseName) return {};
  return {
    srcSet: `/assets/products/responsive/${baseName}-480.webp 480w, /assets/products/responsive/${baseName}-720.webp 720w, ${src} 900w`,
    sizes,
  };
};

// Placeholder image component
const ImgPlaceholder = ({ label, w = '100%', h = 220, bg = '#e8ede8', style = {}, src = null, aspectRatio = null, responsiveSizes = null, imageLoading = 'lazy', imageFetchPriority = null }) => {
  if (src) {
    const responsiveAttrs = getResponsiveImageAttrs(src, responsiveSizes || '(max-width: 767px) 100vw, 480px');
    return (
      <div style={{ width: w, height: aspectRatio ? 'auto' : h, aspectRatio: aspectRatio || undefined, overflow: 'hidden', flexShrink: 0, ...style }}>
        <img src={src} {...responsiveAttrs} alt={label} loading={imageLoading} fetchPriority={imageFetchPriority || undefined} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; e.target.parentNode.style.background=bg; }} />
      </div>
    );
  }
  return (
    <div style={{
      width: w, height: aspectRatio ? 'auto' : h, aspectRatio: aspectRatio || undefined, background: bg, borderRadius: 10, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 6, overflow: 'hidden', flexShrink: 0,
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(0,0,0,0.03) 8px, rgba(0,0,0,0.03) 16px)',
      ...style
    }}>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', textAlign: 'center', padding: '0 12px' }}>{label}</span>
    </div>
  );
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = event => resolve(event.target.result);
  reader.onerror = reject;
  reader.readAsDataURL(file);
});

const optimizeImageFile = (file, options = {}) => new Promise((resolve) => {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    resolve(null);
    return;
  }

  const maxSize = options.maxSize || 1600;
  const quality = options.quality || 0.82;
  const maxBytes = options.maxBytes || 650 * 1024;
  const fallback = () => readFileAsDataUrl(file).then(resolve).catch(() => resolve(null));
  const objectUrl = URL.createObjectURL(file);
  const img = new Image();

  img.onload = () => {
    try {
      let scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      URL.revokeObjectURL(objectUrl);

      const render = (currentScale, currentQuality) => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * currentScale));
        canvas.height = Math.max(1, Math.round(img.height * currentScale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', currentQuality);
      };

      let imageData = render(scale, quality);
      let currentQuality = quality;
      for (let i = 0; i < 8 && imageData.length > maxBytes * 1.37; i++) {
        currentQuality = Math.max(0.55, currentQuality - 0.08);
        scale *= 0.82;
        imageData = render(scale, currentQuality);
      }
      resolve(imageData);
    } catch (error) {
      URL.revokeObjectURL(objectUrl);
      fallback();
    }
  };

  img.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    fallback();
  };

  img.src = objectUrl;
});

const optimizeImageDataUrl = (src, options = {}) => new Promise((resolve) => {
  if (!src || typeof src !== 'string' || !src.startsWith('data:image/')) {
    resolve(src || null);
    return;
  }
  const img = new Image();
  img.onload = () => {
    try {
      const maxSize = options.maxSize || 1400;
      const quality = options.quality || 0.78;
      const maxBytes = options.maxBytes || 650 * 1024;
      let scale = Math.min(1, maxSize / Math.max(img.width, img.height));
      const render = (currentScale, currentQuality) => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * currentScale));
        canvas.height = Math.max(1, Math.round(img.height * currentScale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', currentQuality);
      };
      let imageData = render(scale, quality);
      let currentQuality = quality;
      for (let i = 0; i < 8 && imageData.length > maxBytes * 1.37; i++) {
        currentQuality = Math.max(0.55, currentQuality - 0.08);
        scale *= 0.82;
        imageData = render(scale, currentQuality);
      }
      resolve(imageData);
    } catch {
      resolve(src);
    }
  };
  img.onerror = () => resolve(null);
  img.src = src;
});

const sanitizeImageCollection = async (imageValue, options = {}) => {
  if (Array.isArray(imageValue)) {
    const cleaned = await Promise.all(imageValue.map(src => optimizeImageDataUrl(src, options)));
    return cleaned.filter(Boolean);
  }
  const cleaned = await optimizeImageDataUrl(imageValue, options);
  return cleaned || null;
};

const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Không thể lưu dữ liệu vào trình duyệt:', key, error);
    return false;
  }
};

const migrateStorageKey = (newKey, oldKey, storage = localStorage) => {
  try {
    if (storage.getItem(newKey) === null) {
      const oldValue = storage.getItem(oldKey);
      if (oldValue !== null) storage.setItem(newKey, oldValue);
    }
  } catch {}
};

[
  'page',
  'cart',
  'images',
  'category-images',
  'header-images',
  'products',
  'featured',
  'new-products',
].forEach(suffix => migrateStorageKey(`phuonglam-${suffix}`, `herbly-${suffix}`));
migrateStorageKey('phuonglam-admin', 'herbly-admin', sessionStorage);

const getFirstImageSource = (imageValue) => {
  if (Array.isArray(imageValue)) return imageValue.find(Boolean) || null;
  return imageValue || null;
};

const getProductDisplayImage = (product, productImages = {}) => {
  const productImage = getFirstImageSource(product?.images) || getFirstImageSource(productImages[product?.id]);
  if (productImage) return productImage;
  const variant = normalizeProductVariants(product).find(item => item.image);
  if (variant) return variant.image;
  if (product?.optionImages && typeof product.optionImages === 'object') {
    const optionImage = Object.values(product.optionImages)
      .flatMap(groupImages => groupImages && typeof groupImages === 'object' ? Object.values(groupImages) : [])
      .find(Boolean);
    if (optionImage) return optionImage;
  }
  return null;
};

const normalizeProductVariants = (product) => {
  if (!product || !Array.isArray(product.variants)) return [];
  return product.variants
    .map((variant, index) => ({
      id: variant.id || `variant_${index}`,
      name: String(variant.name || '').trim(),
      sku: String(variant.sku || '').trim(),
      price: Number(variant.price) || 0,
      originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
      weight: variant.weight ? Number(variant.weight) : null,
      image: variant.image || '',
      options: variant.options && typeof variant.options === 'object' && !Array.isArray(variant.options) ? variant.options : {},
    }))
    .filter(variant => variant.name && variant.price > 0);
};

const getPl004Quantity = (name) => {
  const text = normalizeSearchText(name);
  if (text.includes('100')) return 'Hộp 100 Viên 4h';
  if (text.includes('50')) return '50 Viên 4h';
  return '2 Vỉ 4h = 20 viên';
};

const normalizePl004Options = (product) => {
  if (product?.sku !== 'PL-004') return product;
  return {
    ...product,
    optionGroups: [
      { name: 'Màu', values: ['Hương lài'] },
      { name: 'Số lượng', values: ['2 Vỉ 4h = 20 viên', '50 Viên 4h', 'Hộp 100 Viên 4h'] },
    ],
    variants: (product.variants || []).map(variant => ({
      ...variant,
      options: {
        'Màu': 'Hương lài',
        'Số lượng': getPl004Quantity(variant.name),
      },
    })),
  };
};

const sp196OptionValues = [
  '2 hộp / 20V - Trơn',
  'Hộp 10V - Trơn',
  'Hộp 10V - Trắng',
  '2 hộp / 20V - Đỏ',
  '2 hộp / 20V - Vàng',
  '2 hộp / 20V - Trắng',
  'Hộp 10V - Lài',
  '2 hộp / 20V - Lài',
];

const sp196OptionByVariantId = {
  shopee_variant_181860225801: '2 hộp / 20V - Trơn',
  shopee_variant_281265692611: 'Hộp 10V - Trơn',
  shopee_variant_281265692609: 'Hộp 10V - Trắng',
  shopee_variant_240485670556: '2 hộp / 20V - Đỏ',
  shopee_variant_220387704322: '2 hộp / 20V - Vàng',
  shopee_variant_281265692610: 'Hộp 10V - Trắng',
  shopee_variant_220387704321: '2 hộp / 20V - Trắng',
  shopee_variant_291432885081: 'Hộp 10V - Lài',
  shopee_variant_272429767579: '2 hộp / 20V - Lài',
  shopee_variant_240485670557: '2 hộp / 20V - Trắng',
  shopee_variant_240485670559: '2 hộp / 20V - Vàng',
  shopee_variant_240485670558: '2 hộp / 20V - Đỏ',
};

const normalizeSp196Options = (product) => {
  if (product?.sku !== 'SP-19636361517') return product;
  return {
    ...product,
    optionGroups: [
      { name: 'Loại', values: ['4 Giờ Mai', '4 Giờ Trơn', '4 Giờ Lài', '2h Giờ'] },
      { name: 'Số lượng', values: sp196OptionValues },
    ],
    variants: (product.variants || []).map(variant => ({
      ...variant,
      options: {
        ...(variant.options || {}),
        'Số lượng': sp196OptionByVariantId[variant.id] || variant.options?.['Số lượng'] || variant.name,
      },
    })),
  };
};

const isProductHidden = (product) => product?.hidden === true || product?.hidden === 'true';
const getVisibleProducts = (products = []) => products.map(product => normalizeSp196Options(normalizePl004Options(product))).filter(product => !isProductHidden(product));

const getProductPriceInfo = (product) => {
  const variants = normalizeProductVariants(product);
  if (!variants.length) {
    return {
      price: Number(product.price) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
      hasVariants: false,
    };
  }
  const cheapest = variants.reduce((best, variant) => variant.price < best.price ? variant : best, variants[0]);
  return {
    price: cheapest.price,
    originalPrice: cheapest.originalPrice,
    hasVariants: true,
  };
};

const getShortProductName = (name, maxWords = 6) => {
  const words = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(' ');
  return `${words.slice(0, maxWords).join(' ')}...`;
};

const buildCartItem = (product, variant = null) => {
  const variants = normalizeProductVariants(product);
  const selectedVariant = variant || (variants.length ? variants.reduce((best, item) => item.price < best.price ? item : best, variants[0]) : null);
  if (!selectedVariant) return { ...product, cartKey: String(product.id) };
  return {
    ...product,
    sku: selectedVariant.sku || product.sku,
    price: selectedVariant.price,
    originalPrice: selectedVariant.originalPrice,
    weight: selectedVariant.weight || product.weight,
    selectedVariant: {
      id: selectedVariant.id,
      name: selectedVariant.name,
      image: selectedVariant.image || '',
    },
    cartKey: `${product.id}__${selectedVariant.id}`,
  };
};

const getCartItemKey = (item) => item.cartKey || (item.selectedVariant?.id ? `${item.id}__${item.selectedVariant.id}` : String(item.id));

const animateAddToCart = (sourceEl, imageSrc) => {
  const cartEl = document.getElementById('site-cart-button');
  if (!sourceEl || !cartEl) return;
  const start = sourceEl.getBoundingClientRect();
  const end = cartEl.getBoundingClientRect();
  const ghost = document.createElement('div');
  ghost.className = 'fly-cart-ghost';
  ghost.style.left = `${start.left + start.width / 2 - 37}px`;
  ghost.style.top = `${start.top + start.height / 2 - 37}px`;
  ghost.style.transform = 'scale(1)';
  ghost.style.opacity = '1';
  if (imageSrc) {
    const img = document.createElement('img');
    img.src = imageSrc;
    ghost.appendChild(img);
  } else {
    ghost.textContent = '+1';
  }
  document.body.appendChild(ghost);

  requestAnimationFrame(() => {
    ghost.style.transition = 'left .72s cubic-bezier(.2,.8,.2,1), top .72s cubic-bezier(.2,.8,.2,1), transform .72s cubic-bezier(.2,.8,.2,1), opacity .72s ease';
    ghost.style.left = `${end.left + end.width / 2 - 18}px`;
    ghost.style.top = `${end.top + end.height / 2 - 18}px`;
    ghost.style.transform = 'scale(.28) rotate(12deg)';
    ghost.style.opacity = '.25';
  });

  setTimeout(() => {
    ghost.remove();
    cartEl.classList.remove('cart-pulse');
    void cartEl.offsetWidth;
    cartEl.classList.add('cart-pulse');
  }, 720);
};

const ProductCard = ({ product, setPage, addToCart, productImages = {}, compact = false, imagePriority = false }) => {
  const [hover, setHover] = React.useState(false);
  const priceInfo = getProductPriceInfo(product);
  const displayImage = getProductDisplayImage(product, productImages);
  const displayName = getShortProductName(product.name, 6);
  const href = productUrl(product);
  const handleProductLinkFallback = (event) => {
    if (href !== '#') return;
    event.preventDefault();
    setPage({ name: 'product', id: product.id });
  };
  const discount = priceInfo.originalPrice
    ? Math.round((1 - priceInfo.price / priceInfo.originalPrice) * 100)
    : null;

  return (
    <div
      style={{ ...pcStyles.card, ...(compact ? pcStyles.cardCompact : {}), boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hover ? 'translateY(-3px)' : 'none' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <a href={href} style={{ position: 'relative', cursor: 'pointer', paddingBottom: '100%', overflow: 'hidden', background: '#f0f4ef', display: 'block', color: 'inherit', textDecoration: 'none' }} onClick={handleProductLinkFallback}>
        {(() => {
          const responsiveAttrs = getResponsiveImageAttrs(displayImage, '(max-width: 767px) 50vw, (max-width: 1200px) 25vw, 220px');
          return displayImage
            ? <img src={displayImage} {...responsiveAttrs} alt={product.name} loading={imagePriority ? 'eager' : 'lazy'} fetchPriority={imagePriority ? 'high' : 'auto'} decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,0.03) 8px,rgba(0,0,0,0.03) 16px)' }}><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', textAlign: 'center', padding: '0 12px' }}>{product.name}</span></div>;
        })()}
        {product.tag && (
          <span style={{ ...pcStyles.tag, ...(compact ? pcStyles.tagCompact : {}), background: product.tag === 'Bán chạy' ? '#318223' : '#e07a24' }}>
            {product.tag}
          </span>
        )}
        {discount && <span style={{ ...pcStyles.discount, ...(compact ? pcStyles.discountCompact : {}) }}>-{discount}%</span>}
      </a>
      <div style={{ ...pcStyles.info, ...(compact ? pcStyles.infoCompact : {}) }}>
        <a href={href} title={product.name} style={{ ...pcStyles.name, ...(compact ? pcStyles.nameCompact : {}) }} onClick={handleProductLinkFallback}>{displayName}</a>
        <div style={{ ...pcStyles.priceRow, ...(compact ? pcStyles.priceRowCompact : {}) }}>
          <span style={{ ...pcStyles.price, ...(compact ? pcStyles.priceCompact : {}) }}>{priceInfo.hasVariants ? 'Từ ' : ''}{priceInfo.price.toLocaleString('vi-VN')}đ</span>
          {priceInfo.originalPrice && (
            <span style={{ ...pcStyles.origPrice, ...(compact ? pcStyles.origPriceCompact : {}) }}>{priceInfo.originalPrice.toLocaleString('vi-VN')}đ</span>
          )}
        </div>
        <button style={{ ...pcStyles.addBtn, ...(compact ? pcStyles.addBtnCompact : {}), background: hover ? '#2a6e1e' : '#318223' }}
          onClick={(e) => { e.stopPropagation(); animateAddToCart(e.currentTarget, displayImage); addToCart(buildCartItem(product)); }}>
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  );
};

const pcStyles = {
  card: { background: '#fff', borderRadius: 10, overflow: 'hidden', transition: 'all .25s', cursor: 'default', display: 'flex', flexDirection: 'column', height: '100%' },
  cardCompact: { borderRadius: 10 },
  tag: { position: 'absolute', top: 6, left: 6, color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 6, letterSpacing: '0.03em' },
  tagCompact: { top: 6, left: 6, fontSize: 10, padding: '3px 7px', borderRadius: 6 },
  discount: { position: 'absolute', top: 6, right: 6, background: '#e84848', color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 7px', borderRadius: 6 },
  discountCompact: { top: 6, right: 6, fontSize: 10, padding: '3px 7px', borderRadius: 6 },
  info: { padding: '8px 9px 10px', display: 'flex', flexDirection: 'column', flex: 1 },
  infoCompact: { padding: '8px 9px 10px' },
  name: { fontSize: 16.5, fontWeight: 600, color: '#1a1a1a', marginBottom: 5, cursor: 'pointer', lineHeight: 1.35, textDecoration: 'none' },
  nameCompact: { fontSize: 16.5, marginBottom: 5, lineHeight: 1.35 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 4, marginBottom: 8, flexWrap: 'wrap' },
  priceRowCompact: { gap: 4, marginBottom: 8, flexWrap: 'wrap' },
  price: { fontSize: 12, fontWeight: 700, color: '#318223' },
  priceCompact: { fontSize: 12 },
  origPrice: { fontSize: 10, color: '#aaa', textDecoration: 'line-through' },
  origPriceCompact: { fontSize: 10 },
  addBtn: { width: '100%', border: 'none', color: '#fff', fontSize: 10, fontWeight: 600, padding: '6px 0', borderRadius: 6, cursor: 'pointer', transition: 'background .2s', letterSpacing: '0.02em', marginTop: 'auto' },
  addBtnCompact: { fontSize: 10, padding: '6px 0', borderRadius: 6 },
};

const Footer = ({ setPage }) => {
  const isMobile = useIsMobile();
  const socialLinks = [
    { label: 'Facebook', href: 'https://www.facebook.com/nenphuonglam' },
    { label: 'Instagram', href: 'https://www.instagram.com/nen.phuonglam/' },
    { label: 'Zalo', href: 'https://zalo.me/0773829593' },
  ];
  return (
  <footer style={footerStyles.wrap}>
    <div style={{ ...footerStyles.inner, gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1.2fr', gap: isMobile ? '28px 20px' : 40, padding: isMobile ? '18px 20px 28px' : '60px 24px 40px' }}>
      <div style={{ ...footerStyles.col, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
        <div style={footerStyles.brand}>
          <img src={LOGO_SRC} alt="Phương Lâm" style={footerStyles.logoImg} />
        </div>
        <p style={footerStyles.desc}>Sản phẩm thảo mộc và nến thơm tự nhiên, chăm sóc sức khỏe và không gian sống của bạn.</p>
        <div style={footerStyles.socials}>
          {socialLinks.map(item => (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" style={footerStyles.social}>{item.label}</a>
          ))}
        </div>
      </div>
      <div style={footerStyles.col}>
        <div style={footerStyles.colTitle}>Danh mục</div>
        {CATEGORIES.map(c => (
          <a key={c.id} href={categoryUrl(c.id)} style={footerStyles.link}>{c.name}</a>
        ))}
      </div>
      <div style={footerStyles.col}>
        <div style={footerStyles.colTitle}>Hỗ trợ</div>
        {['Chính sách đổi trả', 'Chính sách vận chuyển', 'Hướng dẫn mua hàng', 'Liên hệ'].map(t => (
          <div key={t} style={footerStyles.link}>{t}</div>
        ))}
      </div>
      <div style={footerStyles.col}>
        <div style={footerStyles.colTitle}>Liên hệ</div>
        <div style={footerStyles.contact}>📍 Quận 11, TP. Hồ Chí Minh</div>
        <div style={footerStyles.contact}>📞 077 3829 593</div>
        <div style={footerStyles.contact}>🕐 8:00 – 20:00 mỗi ngày</div>
      </div>
    </div>
    <div style={footerStyles.bottom}>
      <span>© 2026 Phương Lâm. Bảo lưu mọi quyền.</span>
    </div>
  </footer>
  );
};

const footerStyles = {
  wrap: { background: '#1a2e19', color: '#c8d8c7', marginTop: 80 },
  inner: { maxWidth: 1320, margin: '0 auto', padding: '60px 24px 40px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1.2fr', gap: 40 },
  col: {},
  brand: { height: 112, overflow: 'hidden', marginBottom: 18 },
  logoImg: { height: 240, width: 'auto', filter: 'brightness(0) invert(1)', display: 'block', transform: 'translateY(-70px)' },
  desc: { fontSize: 13, lineHeight: 1.7, color: '#9aad98', maxWidth: 240, margin: '0 0 16px' },
  socials: { display: 'flex', gap: 8 },
  social: { fontSize: 12, padding: '5px 12px', border: '1px solid #3a4e39', borderRadius: 20, cursor: 'pointer', color: '#9aad98', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' },
  colTitle: { fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' },
  link: { display: 'block', fontSize: 13, color: '#9aad98', marginBottom: 8, cursor: 'pointer', lineHeight: 1.6, textDecoration: 'none' },
  contact: { fontSize: 13, color: '#9aad98', marginBottom: 8, lineHeight: 1.6 },
  bottom: { borderTop: '1px solid #2a3e29', textAlign: 'center', padding: '16px 24px', fontSize: 12, color: '#6a7d69' },
};




const HomePage = ({ setPage, addToCart, productImages = {}, featuredIds = null, categoryImages = {}, headerImages = null }) => {
  const allVisibleProducts = getVisibleProducts(window.PRODUCTS_LIVE || PRODUCTS);
  const bestsellers = (() => {
    const all = allVisibleProducts;
    if (featuredIds && featuredIds.length > 0) return featuredIds.map(id => all.find(p => String(p.id) === String(id))).filter(Boolean).slice(0, 6);
    return all.filter(p => p.tag === 'Bán chạy' || p.tag === 'Nổi bật').slice(0, 6);
  })();
  const activeHeroImages = (Array.isArray(headerImages) && headerImages.length > 0) ? headerImages : HERO_IMAGES;
  const isMobile = useIsMobile();
  const [slideIdx, setSlideIdx] = React.useState(0);
  const [homeSearch, setHomeSearch] = React.useState('');
  const [homeSearchOpen, setHomeSearchOpen] = React.useState(() => queryFlag('search'));
  const [homeSearchHover, setHomeSearchHover] = React.useState(false);
  const homeSearchRef = React.useRef(null);
  const homeSearchInputRef = React.useRef(null);
  const normalizedHomeQuery = normalizeSearchText(homeSearch);
  const homeSearchSuggestions = normalizedHomeQuery
    ? [
        ...allVisibleProducts.filter(product => normalizeSearchText(product.name).startsWith(normalizedHomeQuery)),
        ...allVisibleProducts.filter(product => {
          const normalizedName = normalizeSearchText(product.name);
          return !normalizedName.startsWith(normalizedHomeQuery) && normalizedName.includes(normalizedHomeQuery);
        }),
      ].filter((product, index, list) => list.findIndex(item => item.id === product.id) === index).slice(0, 3)
    : [];
  React.useEffect(() => {
    const t = setInterval(() => setSlideIdx(i => (i + 1) % activeHeroImages.length), 3000);
    return () => clearInterval(t);
  }, [activeHeroImages.length]);

  React.useEffect(() => {
    const handleOutside = (event) => {
      if (homeSearchRef.current && !homeSearchRef.current.contains(event.target)) {
        setHomeSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  React.useEffect(() => {
    if (!queryFlag('search')) return;
    homeSearchInputRef.current?.focus();
    setHomeSearchOpen(true);
  }, []);

  const handleHomeSearchSelect = (product) => {
    setHomeSearch(product.name);
    setHomeSearchOpen(false);
    if (product.slug) {
      window.location.href = productUrl(product);
      return;
    }
    setPage({ name: 'product', id: product.id });
  };

  return (
    <div>
      <section style={{ ...hpStyles.heroSearchWrap, padding: isMobile ? '14px 16px 0' : '18px 24px 0' }}>
        <div ref={homeSearchRef} style={hpStyles.heroSearchBox}>
          <div
            style={homeSearchHover ? hpStyles.heroSearchInnerHover : hpStyles.heroSearchInner}
            onMouseEnter={() => setHomeSearchHover(true)}
            onMouseLeave={() => setHomeSearchHover(false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7a8a74" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={homeSearchInputRef}
              style={hpStyles.heroSearchInput}
              placeholder="Tìm sản phẩm... ví dụ: nến, combo, thảo mộc"
              value={homeSearch}
              onFocus={() => setHomeSearchOpen(true)}
              onChange={(e) => {
                setHomeSearch(e.target.value);
                setHomeSearchOpen(true);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && homeSearchSuggestions[0]) {
                  handleHomeSearchSelect(homeSearchSuggestions[0]);
                }
              }}
            />
          </div>
          {homeSearchOpen && homeSearchSuggestions.length > 0 && (
            <div style={hpStyles.heroSuggestBox}>
              {homeSearchSuggestions.map(product => (
                <button
                  key={product.id}
                  style={hpStyles.heroSuggestItem}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleHomeSearchSelect(product)}
                >
                  <div style={hpStyles.heroSuggestLeft}>
                    <ImgPlaceholder
                      label={product.name}
                      bg="#eef4ec"
                      aspectRatio="1 / 1"
                      style={hpStyles.heroSuggestThumb}
                      src={getProductDisplayImage(product, productImages)}
                    />
                    <span style={hpStyles.heroSuggestName}>{product.name}</span>
                  </div>
                  <span style={hpStyles.heroSuggestMeta}>{CATEGORIES.find(c => c.id === product.categoryId)?.name || 'Sản phẩm'}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* HERO */}
      <section style={{ ...hpStyles.hero, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.08fr) minmax(408px, 504px)', padding: isMobile ? '26px 18px 20px' : '50px 24px', gap: isMobile ? 20 : 36 }}>
        <div style={{ ...hpStyles.heroContent, maxWidth: isMobile ? '100%' : 720, width: '100%' }}>
          <div style={{ ...hpStyles.heroBadge, fontSize: isMobile ? 10 : 13, padding: isMobile ? '5px 10px' : '7px 14px', marginBottom: isMobile ? 12 : 16 }}>🌿 Tự nhiên · Thuần khiết · An toàn</div>
          <h1 style={{ ...hpStyles.heroTitle, fontSize: isMobile ? 26 : 43, marginBottom: isMobile ? 12 : 16, maxWidth: isMobile ? '100%' : 720 }}>
            Sống xanh mỗi ngày, <span style={{ color: '#318223' }}>Dịu nhẹ</span> từ thảo mộc tự nhiên
          </h1>
          <p style={{ ...hpStyles.heroSub, fontSize: isMobile ? 13 : 18, marginBottom: isMobile ? 18 : 24, maxWidth: isMobile ? '100%' : 620 }}>Sản phẩm thảo mộc và nến thơm tự nhiên 100%, không hóa chất — chăm sóc không gian sống của bạn.</p>
          <div style={{ ...hpStyles.heroBtns, flexDirection: isMobile ? 'column' : 'row' }}>
            <a href={categoryUrl('nen-thom')} style={{ ...hpStyles.heroCta, width: isMobile ? '100%' : 'auto', padding: isMobile ? '12px 18px' : '12px 24px', fontSize: isMobile ? 14 : 14 }}>Xem sản phẩm</a>
            <a href={categoryUrl('combo')} style={{ ...hpStyles.heroSecondary, width: isMobile ? '100%' : 'auto', padding: isMobile ? '12px 18px' : '12px 24px', fontSize: isMobile ? 14 : 14 }}>Xem combo ưu đãi</a>
          </div>
        </div>
        {!isMobile && (
          <div style={{ ...hpStyles.heroImageFrame, width: '100%', maxWidth: 648, justifySelf: 'end' }}>
            <div style={{ ...hpStyles.heroImage, overflow: 'hidden', borderRadius: 18, position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
            <div style={{ display: 'flex', width: `${activeHeroImages.length * 100}%`, transform: `translateX(-${slideIdx * (100 / activeHeroImages.length)}%)`, transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)', height: '100%' }}>
              {activeHeroImages.map((src, i) => (
                <img key={i} src={src} alt="Phương Lâm" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" style={{ width: `${100 / activeHeroImages.length}%`, height: '100%', objectFit: 'cover', flexShrink: 0 }} />
              ))}
            </div>
            <div style={{ position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 6 }}>
              {activeHeroImages.map((_, i) => (
                <div key={i} onClick={() => setSlideIdx(i)} style={{ width: i === slideIdx ? 22 : 7, height: 7, borderRadius: 4, background: i === slideIdx ? '#fff' : 'rgba(255,255,255,0.55)', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          </div>
          </div>
        )}
      </section>

      {/* TRUST BAR */}
      <div style={{ ...hpStyles.trustBar, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, minmax(0, 1fr))', gap: isMobile ? '12px 16px' : '0 28px', padding: isMobile ? '16px 20px' : '20px 24px', justifyItems: 'center', maxWidth: 1320, margin: '0 auto', boxSizing: 'border-box' }}>
        {[
          { icon: '🚚', text: 'Giao hàng toàn quốc' },
          { icon: '✅', text: 'Kiểm tra trước khi nhận' },
          { icon: '🔄', text: 'Đổi trả trong 7 ngày' },
          { icon: '🌿', text: '100% tự nhiên' },
        ].map(t => (
          <div key={t.text} style={hpStyles.trustItem}>
            <span style={hpStyles.trustIcon}>{t.icon}</span>
            <span style={{ ...hpStyles.trustText, fontSize: isMobile ? 12 : 13 }}>{t.text}</span>
          </div>
        ))}
      </div>

      {/* BESTSELLERS */}
      <section style={{ ...hpStyles.section, background: '#fff', padding: isMobile ? '40px 0' : '64px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
          <div style={hpStyles.sectionHead}>
            <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32 }}>Sản phẩm bán chạy</h2>
            <p style={hpStyles.sectionSub}>Được khách hàng tin dùng và đánh giá cao nhất</p>
          </div>
          <div
            style={{
              ...hpStyles.bestsellerGrid,
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(6, minmax(0, 1fr))',
              gap: isMobile ? 12 : 14,
            }}
          >
            {bestsellers.map(p => (
              <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} productImages={productImages} imagePriority={true} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <a href={categoryUrl('nen-thom')} style={hpStyles.viewAllBtn}>
              Xem tất cả sản phẩm →
            </a>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ ...hpStyles.section, background: '#f7faf6', padding: isMobile ? '40px 20px' : '64px 24px' }}>
        <div style={hpStyles.sectionHead}>
          <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32 }}>Danh mục sản phẩm</h2>
          <p style={hpStyles.sectionSub}>Khám phá đa dạng sản phẩm chăm sóc sức khoẻ tự nhiên</p>
        </div>
        <div style={{ ...hpStyles.catGrid, gridTemplateColumns: isMobile ? 'repeat(4, 1fr)' : 'repeat(4, minmax(0, 1fr))', gap: isMobile ? 8 : 16 }}>
          {CATEGORIES.map(cat => (
            <a key={cat.id} href={categoryUrl(cat.id)} style={hpStyles.catCard}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ ...hpStyles.catImgWrap, padding: isMobile ? '6px 6px 0' : '10px 10px 0' }}>
                <ImgPlaceholder label={cat.name} bg="#f0f5ef" aspectRatio="1 / 1" style={{ borderRadius: 10, width: '100%' }} src={categoryImages[cat.id] || null} />
              </div>
              <div style={{ ...hpStyles.catInfo, padding: isMobile ? '7px 8px 8px' : '10px 12px 12px' }}>
                <div style={{ ...hpStyles.catName, fontSize: isMobile ? 15 : 20 }}>{cat.name}</div>
                <div style={{ ...hpStyles.catFrom, fontSize: isMobile ? 9 : 11 }}>{cat.from}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section style={{ ...hpStyles.section, padding: isMobile ? '40px 20px' : '64px 24px' }}>
        <div style={hpStyles.sectionHead}>
          <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32, color: '#318223' }}>
            Tại sao chọn Phương Lâm?
          </h2>
        </div>
        <div style={{ ...hpStyles.benefitGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: isMobile ? 12 : 24 }}>
          {[
            { icon: '🌱', title: 'Nguyên liệu tự nhiên 100%', desc: 'Tất cả sản phẩm được làm từ nguyên liệu thiên nhiên, không hóa chất độc hại, an toàn cho cả gia đình.' },
            { icon: '🔬', title: 'Kiểm định chất lượng', desc: 'Mỗi lô hàng đều được kiểm tra nghiêm ngặt trước khi đến tay khách hàng.' },
            { icon: '📦', title: 'Đóng gói cẩn thận', desc: 'Hộp quà sang trọng, phù hợp làm quà tặng cho người thân và bạn bè.' },
            { icon: '🤝', title: 'Hỗ trợ tận tâm', desc: 'Đội ngũ tư vấn sẵn sàng hỗ trợ từ 8:00 – 20:00 mỗi ngày.' },
          ].map(b => (
            <div
              key={b.title}
              style={hpStyles.benefitCard}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-10px)';
                e.currentTarget.style.boxShadow = '0 18px 40px rgba(49,130,35,0.16)';
                e.currentTarget.style.borderColor = '#cfe5ca';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.04)';
                e.currentTarget.style.borderColor = '#f0f0f0';
              }}
            >
              <div style={hpStyles.benefitIcon}>{b.icon}</div>
              <div style={hpStyles.benefitTitle}>{b.title}</div>
              <div style={hpStyles.benefitDesc}>{b.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BLOG */}
      <section style={{ ...hpStyles.section, background: '#f7faf6', padding: isMobile ? '40px 0' : '64px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
          <div style={hpStyles.sectionHead}>
            <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32 }}>Bài viết mới nhất</h2>
            <p style={hpStyles.sectionSub}>Kiến thức về sức khoẻ và chăm sóc không gian sống</p>
          </div>
          <div style={{ ...hpStyles.blogGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
            {BLOG_POSTS.slice(0, 6).map(post => (
              <a key={post.id} href={post.url || '#'}
                style={{ ...hpStyles.blogCard, display: 'block', textDecoration: 'none', color: 'inherit' }}
                onClick={e => { if (!post.url) { e.preventDefault(); setPage({ name: 'blog-post', slug: post.slug }); } }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.10)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; e.currentTarget.style.transform = 'none'; }}
              >
                <ImgPlaceholder
                  label={`blog — ${post.title}`}
                  bg="#dde8d9"
                  aspectRatio="16 / 9"
                  src={getBlogImage(post.slug)}
                  style={{ width: '100%' }}
                />
                <div style={hpStyles.blogInfo}>
                  <div style={hpStyles.blogMeta}>{post.date} · {post.readTime}</div>
                  <div style={hpStyles.blogTitle}>{post.title}</div>
                  <div style={hpStyles.blogExcerpt}>{post.excerpt}</div>
                  <span style={hpStyles.blogReadMore}>Đọc tiếp →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

const hpStyles = {
  hero: { maxWidth: 1320, margin: '0 auto', padding: '64px 24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' },
  heroSearchWrap: { maxWidth: 1320, margin: '0 auto' },
  heroSearchBox: { position: 'relative', width: '100%', maxWidth: 525 },
  heroSearchInner: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '2px solid #d7ddd4', borderRadius: 999, padding: '13px 18px', boxShadow: 'none', transition: 'border-color .2s ease, box-shadow .2s ease, transform .2s ease' },
  heroSearchInnerHover: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '2px solid #bfc8bb', borderRadius: 999, padding: '13px 18px', boxShadow: '0 14px 30px rgba(0,0,0,0.10)', transform: 'translateY(-1px)', transition: 'border-color .2s ease, box-shadow .2s ease, transform .2s ease' },
  heroSearchInput: { flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'none', fontSize: 15, color: '#2f382c' },
  heroSuggestBox: { position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, zIndex: 5, background: '#fff', border: '1px solid #dfe8dc', borderRadius: 18, boxShadow: '0 16px 36px rgba(0,0,0,0.12)', overflow: 'hidden' },
  heroSuggestItem: { width: '100%', border: 'none', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, textAlign: 'left', padding: '14px 18px', cursor: 'pointer', fontFamily: 'inherit' },
  heroSuggestLeft: { display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 },
  heroSuggestThumb: { width: 34, minWidth: 34, borderRadius: 8, overflow: 'hidden', flexShrink: 0 },
  heroSuggestName: { fontSize: 14, fontWeight: 600, color: '#1e261c' },
  heroSuggestMeta: { fontSize: 12, color: '#7c8b76', whiteSpace: 'nowrap' },
  heroContent: {},
  heroBadge: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eaf4e9', color: '#318223', fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 20, marginBottom: 20, letterSpacing: '0.02em' },
  heroTitle: { fontSize: 44, fontWeight: 800, lineHeight: 1.2, color: '#1a1a1a', margin: '0 0 20px', letterSpacing: '-1px' },
  heroSub: { fontSize: 16, color: '#666', lineHeight: 1.7, margin: '0 0 32px', maxWidth: 420 },
  heroBtns: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  heroCta: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#318223', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em', textDecoration: 'none', boxSizing: 'border-box' },
  heroSecondary: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff', color: '#318223', border: '1.5px solid #318223', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer', textDecoration: 'none', boxSizing: 'border-box' },
  heroImageFrame: { background: '#f6f3e8', borderRadius: 28, padding: 18, boxShadow: '0 18px 44px rgba(35, 58, 27, 0.06)' },
  heroImage: { background: '#fff8ec' },
  trustBar: { background: '#f7faf6', borderTop: '1px solid #eef3ed', borderBottom: '1px solid #eef3ed', padding: '20px 24px', display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' },
  trustItem: { display: 'flex', alignItems: 'center', gap: 10 },
  trustIcon: { fontSize: 20 },
  trustText: { fontSize: 13, fontWeight: 600, color: '#444' },
  section: { maxWidth: 1320, margin: '0 auto', padding: '64px 24px' },
  sectionHead: { textAlign: 'center', marginBottom: 40 },
  sectionTitle: { fontSize: 32, fontWeight: 800, color: '#1a1a1a', margin: '0 0 10px', letterSpacing: '-0.5px' },
  sectionSub: { fontSize: 15, color: '#777', margin: 0 },
  catGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 },
  catCard: { display: 'block', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', color: 'inherit', textDecoration: 'none' },
  catImgWrap: { padding: '12px 12px 0' },
  catInfo: { padding: '12px 16px 16px' },
  catName: { fontSize: 21, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 },
  catFrom: { fontSize: 12, color: '#318223', fontWeight: 600 },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  bestsellerGrid: { display: 'grid', alignItems: 'stretch' },
  viewAllBtn: { background: 'none', border: '1.5px solid #318223', color: '#318223', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' },
  benefitGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 },
  benefitCard: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '28px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)', transition: 'transform .25s ease, box-shadow .25s ease, border-color .25s ease', cursor: 'default' },
  benefitIcon: { fontSize: 32, marginBottom: 14 },
  benefitTitle: { fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 8 },
  benefitDesc: { fontSize: 13, color: '#777', lineHeight: 1.7 },
  blogGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 },
  blogCard: { background: '#fff', borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'box-shadow .25s, transform .25s', cursor: 'pointer' },
  blogInfo: { padding: '18px 20px 22px' },
  blogMeta: { fontSize: 12, color: '#318223', fontWeight: 600, marginBottom: 8 },
  blogTitle: { fontSize: 15, fontWeight: 700, color: '#1a1a1a', marginBottom: 8, lineHeight: 1.5 },
  blogExcerpt: { fontSize: 13, color: '#777', lineHeight: 1.7, marginBottom: 14 },
  blogReadMore: { fontSize: 13, color: '#318223', fontWeight: 600 },
};




const CategoryPage = ({ cat, setPage, addToCart, productImages = {} }) => {
  const [priceRange, setPriceRange] = React.useState([0, 500000]);
  const [sortBy, setSortBy] = React.useState('default');
  const [activeCat, setActiveCat] = React.useState(cat);
  const [showFilters, setShowFilters] = React.useState(false);
  const isMobile = useIsMobile();
  const productResultsRef = React.useRef(null);

  React.useEffect(() => { setActiveCat(cat); }, [cat]);

  const scrollToProductResults = () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = productResultsRef.current;
        if (!target) return;
        const headerHeight = document.querySelector('header')?.getBoundingClientRect().height || 0;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 14;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      });
    });
  };

  const catInfo = CATEGORIES.find(c => c.id === activeCat) || CATEGORIES[0];
  const getComparablePrice = (product) => getProductPriceInfo(product).price;
  let products = getVisibleProducts(window.PRODUCTS_LIVE || PRODUCTS).filter(p => p.categoryId === activeCat);
  products = products.filter(p => {
    const price = getComparablePrice(p);
    return price >= priceRange[0] && price <= priceRange[1];
  });
  if (sortBy === 'price-asc') products.sort((a, b) => getComparablePrice(a) - getComparablePrice(b));
  if (sortBy === 'price-desc') products.sort((a, b) => getComparablePrice(b) - getComparablePrice(a));

  return (
    <div style={{ maxWidth: 1440, margin: '0 auto', padding: isMobile ? '20px 16px' : '32px 24px' }}>
      {/* Breadcrumb */}
      <div style={cpStyles.breadcrumb}>
        <a href="/" style={cpStyles.breadLink}>Trang chủ</a>
        <span style={cpStyles.breadSep}>›</span>
        <span style={cpStyles.breadCurrent}>{catInfo.name}</span>
      </div>

      {/* Mobile filter toggle */}
      {isMobile && (
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: showFilters ? '#eaf4e9' : '#fff', border: '1px solid #e0e0e0', borderRadius: 10, padding: '9px 16px', fontSize: 13, fontWeight: 600, color: '#318223', cursor: 'pointer', marginBottom: 16 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="6" x2="20" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="11" y1="18" x2="13" y2="18"/>
          </svg>
          {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc & Danh mục'}
        </button>
      )}

      <div style={{ ...cpStyles.layout, gridTemplateColumns: isMobile ? '1fr' : '230px 1fr' }}>
        {/* SIDEBAR */}
        {(!isMobile || showFilters) && <aside style={cpStyles.sidebar}>
          <div style={cpStyles.sideSection}>
            <div style={cpStyles.sideTitle}>Danh mục</div>
            {CATEGORIES.map(c => (
              <a key={c.id}
                href={categoryUrl(c.id)}
                style={{ ...cpStyles.sideLink, color: activeCat === c.id ? '#318223' : '#444', fontWeight: activeCat === c.id ? 700 : 400, background: activeCat === c.id ? '#eaf4e9' : 'none' }}
              >
                {c.name}
              </a>
            ))}
          </div>

          <div style={cpStyles.sideSection}>
            <div style={cpStyles.sideTitle}>Lọc giá</div>
            <div style={cpStyles.priceInputs}>
              <input
                style={cpStyles.priceInput}
                type="number"
                value={priceRange[0]}
                onChange={e => setPriceRange([+e.target.value, priceRange[1]])}
                placeholder="Từ"
              />
              <span style={{ color: '#aaa', fontSize: 12 }}>—</span>
              <input
                style={cpStyles.priceInput}
                type="number"
                value={priceRange[1]}
                onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                placeholder="Đến"
              />
            </div>
            <input
              type="range" min={0} max={500000} step={10000}
              value={priceRange[1]}
              onChange={e => setPriceRange([priceRange[0], +e.target.value])}
              style={{ width: '100%', accentColor: '#318223', marginTop: 8 }}
            />
            <div style={{ fontSize: 12, color: '#318223', fontWeight: 600, marginTop: 4 }}>
              Đến: {priceRange[1].toLocaleString('vi-VN')}đ
            </div>
          </div>

          <div style={cpStyles.sideSection}>
            <div style={cpStyles.sideTitle}>Thẻ phổ biến</div>
            <div style={cpStyles.tagWrap}>
              {['Tự nhiên', 'Thảo mộc', 'Quà tặng', 'Thư giãn', 'Handmade'].map(t => (
                <span key={t} style={cpStyles.tagChip}>{t}</span>
              ))}
            </div>
          </div>
        </aside>}

        {/* MAIN */}
        <main ref={productResultsRef} style={cpStyles.main}>
          <div style={cpStyles.mainHead}>
            <h1 style={cpStyles.catTitle}>{catInfo.name}</h1>
            <div style={cpStyles.sortRow}>
              <span style={{ fontSize: 13, color: '#888' }}>{products.length} sản phẩm</span>
              <select style={cpStyles.sortSelect} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="default">Mặc định</option>
                <option value="price-asc">Giá: thấp → cao</option>
                <option value="price-desc">Giá: cao → thấp</option>
              </select>
            </div>
          </div>

          {products.length === 0 ? (
            <div style={cpStyles.empty}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 15, color: '#888' }}>Không có sản phẩm nào phù hợp</div>
            </div>
          ) : (
            <div style={{ ...cpStyles.grid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? 12 : 12 }}>
              {products.map(p => <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} productImages={productImages} />)}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

const cpStyles = {
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13 },
  breadLink: { color: '#318223', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' },
  breadSep: { color: '#ccc' },
  breadCurrent: { color: '#666' },
  layout: { display: 'grid', gridTemplateColumns: '230px 1fr', gap: 36 },
  sidebar: { flexShrink: 0 },
  sideSection: { marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' },
  sideTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' },
  sideLink: { display: 'block', padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 2, transition: 'all .15s', textDecoration: 'none' },
  priceInputs: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 },
  priceInput: { flex: 1, border: '1px solid #e8e8e8', borderRadius: 8, padding: '7px 10px', fontSize: 12, outline: 'none', width: 0 },
  tagWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  tagChip: { fontSize: 11, padding: '4px 10px', border: '1px solid #dde8dc', borderRadius: 20, color: '#555', cursor: 'pointer' },
  main: {},
  mainHead: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  catTitle: { fontSize: 26, fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: '-0.5px' },
  sortRow: { display: 'flex', alignItems: 'center', gap: 12 },
  sortSelect: { border: '1px solid #e8e8e8', borderRadius: 8, padding: '7px 12px', fontSize: 13, color: '#444', outline: 'none', cursor: 'pointer' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 },
  empty: { textAlign: 'center', padding: '80px 0' },
};




const renderStructuredText = (text) => {
  const lines = String(text || '').split(/\r?\n/);
  const content = [];
  let bullets = [];

  const flushBullets = () => {
    if (!bullets.length) return;
    const bulletItems = bullets;
    bullets = [];
    content.push(
      <ul key={`list-${content.length}`} style={ppStyles.structuredList}>
        {bulletItems.map((item, index) => (
          <li key={`${item}-${index}`} style={ppStyles.structuredListItem}>{item}</li>
        ))}
      </ul>
    );
  };

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      content.push(<div key={`space-${index}`} style={ppStyles.structuredSpace} />);
      return;
    }

    if (/^[✔✅📍]\s*/.test(line)) {
      flushBullets();
      content.push(<h3 key={`heading-${index}`} style={ppStyles.structuredHeading}>{line}</h3>);
      return;
    }

    const bulletMatch = line.match(/^([-•👉]\s*|\d+\.\s+)(.+)$/);
    if (bulletMatch) {
      bullets.push(bulletMatch[2].trim());
      return;
    }

    flushBullets();
    const isHeading = line.length <= 80 && (
      line === line.toUpperCase() ||
      /^(Tổng quan|Điểm nổi bật|Ứng dụng|Thông tin|Từ khóa|Hướng dẫn|Bảo quản|Cam kết|Lưu ý|Xuất xứ)/i.test(line)
    );

    content.push(isHeading ? (
      <h3 key={`heading-${index}`} style={ppStyles.structuredHeading}>{line}</h3>
    ) : (
      <p key={`paragraph-${index}`} style={ppStyles.structuredParagraph}>{line}</p>
    ));
  });

  flushBullets();
  return <div style={ppStyles.structuredText}>{content}</div>;
};


const ProductPage = ({ productId, setPage, goBack, addToCart, productImages = {} }) => {
  const visibleProducts = getVisibleProducts(window.PRODUCTS_LIVE || PRODUCTS);
  const product = visibleProducts.find(p => p.id === productId) || visibleProducts[0] || PRODUCTS[0];
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const isMobile = useIsMobile();
  const [qty, setQty] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState('desc');
  const [activeImg, setActiveImg] = React.useState(0);
  const [addedMsg, setAddedMsg] = React.useState(false);
  const [selectedVariantId, setSelectedVariantId] = React.useState('');
  const [selectedOptions, setSelectedOptions] = React.useState({});
  const [canThumbPrev, setCanThumbPrev] = React.useState(false);
  const [canThumbNext, setCanThumbNext] = React.useState(false);
  const thumbViewportRef = React.useRef(null);
  const related = visibleProducts.filter(p => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 3);
  const variants = normalizeProductVariants(product);
  const optionGroups = Array.isArray(product.optionGroups) ? product.optionGroups.filter(group => group?.name && Array.isArray(group.values) && group.values.length) : [];
  const variantSignature = variants.map(variant => variant.id).join('|');
  const defaultVariant = variants.length ? variants.reduce((best, item) => item.price < best.price ? item : best, variants[0]) : null;
  const selectedVariantByOptions = optionGroups.length
    ? variants.find(variant => optionGroups.every(group => variant.options?.[group.name] === selectedOptions[group.name]))
    : null;
  const selectedVariant = selectedVariantByOptions || variants.find(variant => variant.id === selectedVariantId) || defaultVariant;
  const currentPrice = selectedVariant ? selectedVariant.price : Number(product.price) || 0;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;
  const isColorOptionGroup = (group) => ['mau', 'color'].includes(normalizeSearchText(group?.name));
  const getColorSwatch = (value) => {
    const key = normalizeSearchText(value);
    if (key.includes('trang') || key.includes('white')) return { background: '#fff', border: '#cfd8cf' };
    if (key.includes('huong lai') || key.includes('lai')) return { background: '#f5c84c', border: '#d5a91f' };
    if (key.includes('vang') || key.includes('yellow')) return { background: '#f5c84c', border: '#d5a91f' };
    if (key.includes('do') || key.includes('red')) return { background: '#d93636', border: '#b72525' };
    return { background: '#dfe6dc', border: '#bac8b8' };
  };
  const getOptionImage = (groupName, value) => product.optionImages?.[groupName]?.[value] || '';
  const selectedOptionImage = selectedVariant?.image || optionGroups
    .filter(group => !isColorOptionGroup(group))
    .map(group => getOptionImage(group.name, selectedOptions[group.name]))
    .find(Boolean) || '';
  const getPriorOptionGroups = (groupName) => {
    const groupIndex = optionGroups.findIndex(group => group.name === groupName);
    return groupIndex > 0 ? optionGroups.slice(0, groupIndex) : [];
  };
  const getOptionValuesForGroup = (group) => {
    const priorGroups = getPriorOptionGroups(group.name);
    if (!priorGroups.length) return group.values;
    return group.values.filter(value => variants.some(variant =>
      variant.options?.[group.name] === value &&
      priorGroups.every(priorGroup => {
        const selectedValue = selectedOptions[priorGroup.name];
        return !selectedValue || variant.options?.[priorGroup.name] === selectedValue;
      })
    ));
  };
  const getOptionPreviewVariant = (groupName, value) => {
    const nextOptions = { ...selectedOptions, [groupName]: value };
    return variants.find(variant => optionGroups.every(group => {
      const selectedValue = nextOptions[group.name];
      return !selectedValue || variant.options?.[group.name] === selectedValue;
    })) || variants.find(variant => variant.options?.[groupName] === value);
  };
  const isOptionValueAvailable = (groupName, value) => {
    if (!optionGroups.length) return true;
    return variants.some(variant =>
      variant.options?.[groupName] === value &&
      getPriorOptionGroups(groupName).every(group => {
        const selectedValue = selectedOptions[group.name];
        return !selectedValue || variant.options?.[group.name] === selectedValue;
      })
    );
  };

  React.useEffect(() => {
    if (optionGroups.length) {
      const baseOptions = defaultVariant?.options || {};
      const nextOptions = {};
      optionGroups.forEach((group, index) => {
        const availableValues = group.values.filter(value => variants.some(variant =>
          variant.options?.[group.name] === value &&
          optionGroups.slice(0, index).every(priorGroup => {
            const selectedValue = nextOptions[priorGroup.name];
            return !selectedValue || variant.options?.[priorGroup.name] === selectedValue;
          })
        ));
        const currentValue = selectedOptions[group.name];
        const baseValue = baseOptions[group.name];
        nextOptions[group.name] = availableValues.includes(currentValue)
          ? currentValue
          : availableValues.includes(baseValue)
            ? baseValue
            : availableValues[0] || group.values[0];
      });
      if (JSON.stringify(nextOptions) !== JSON.stringify(selectedOptions)) setSelectedOptions(nextOptions);
    }
    if (variants.length && !variants.some(variant => variant.id === selectedVariantId)) {
      setSelectedVariantId(defaultVariant.id);
    }
    if (!variants.length && selectedVariantId) {
      setSelectedVariantId('');
    }
  }, [product.id, variantSignature, selectedVariantId, JSON.stringify(selectedOptions)]);

  React.useEffect(() => {
    if (selectedVariant && selectedVariant.id !== selectedVariantId) setSelectedVariantId(selectedVariant.id);
  }, [selectedVariant?.id]);

  const handleAddToCart = (event) => {
    animateAddToCart(event?.currentTarget, selectedOptionImage || displayImgs[activeImg] || getProductDisplayImage(product, productImages));
    for (let i = 0; i < qty; i++) addToCart(buildCartItem(product, selectedVariant));
    setAddedMsg(true);
    setTimeout(() => setAddedMsg(false), 2000);
  };

  const discount = currentOriginalPrice
    ? Math.round((1 - currentPrice / currentOriginalPrice) * 100)
    : null;

  const imgLabels = [product.name + ' — góc chính', product.name + ' — góc 2', product.name + ' — chi tiết', product.name + ' — packaging'];
  const hasServerImages = Array.isArray(product.images)
    ? product.images.some(Boolean)
    : !!product.images;
  const productImageValue = hasServerImages ? product.images : productImages[product.id];
  const uploadedImgs = Array.isArray(productImageValue)
    ? productImageValue.filter(Boolean)
    : productImageValue
      ? [productImageValue]
      : [];
  const variantFallbackImgs = variants.map(variant => variant.image).filter(Boolean);
  const optionFallbackImgs = optionGroups
    .filter(group => !isColorOptionGroup(group))
    .flatMap(group => group.values.map(value => getOptionImage(group.name, value)))
    .filter(Boolean);
  const galleryImgs = uploadedImgs.length ? uploadedImgs : variantFallbackImgs.length ? variantFallbackImgs : optionFallbackImgs;
  const displayImgs = galleryImgs.length ? galleryImgs : [null];
  const updateThumbNav = React.useCallback(() => {
    const el = thumbViewportRef.current;
    if (!el) return;
    setCanThumbPrev(el.scrollLeft > 4);
    setCanThumbNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  React.useEffect(() => {
    setActiveImg(0);
  }, [product.id, selectedVariantId]);

  React.useEffect(() => {
    if (activeImg >= displayImgs.length) setActiveImg(0);
  }, [activeImg, displayImgs.length]);

  React.useEffect(() => {
    if (!selectedOptionImage || !galleryImgs.length) return;
    const imageIndex = galleryImgs.findIndex(src => src === selectedOptionImage);
    if (imageIndex >= 0 && imageIndex !== activeImg) setActiveImg(imageIndex);
  }, [selectedOptionImage, galleryImgs.join('|')]);

  React.useEffect(() => {
    if (displayImgs.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImg(prev => (prev + 1) % displayImgs.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [product.id, displayImgs.length]);

  React.useEffect(() => {
    const raf = requestAnimationFrame(updateThumbNav);
    window.addEventListener('resize', updateThumbNav);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', updateThumbNav);
    };
  }, [product.id, galleryImgs.length, updateThumbNav]);

  React.useEffect(() => {
    const el = thumbViewportRef.current;
    if (!el) return;
    const activeThumb = el.querySelector(`[data-thumb-index="${activeImg}"]`);
    if (activeThumb) {
      const targetLeft = activeThumb.offsetLeft - (el.clientWidth - activeThumb.offsetWidth) / 2;
      const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
      el.scrollTo({
        left: Math.max(0, Math.min(targetLeft, maxLeft)),
        behavior: 'smooth',
      });
    }
    const raf = requestAnimationFrame(updateThumbNav);
    return () => cancelAnimationFrame(raf);
  }, [activeImg, updateThumbNav]);

  const scrollThumbs = (direction) => {
    const el = thumbViewportRef.current;
    if (!el) return;
    const step = isMobile ? 160 : 220;
    el.scrollBy({ left: direction * step, behavior: 'smooth' });
    setTimeout(updateThumbNav, 240);
  };

  return (
    <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', padding: isMobile ? '16px 16px' : '32px 24px', overflowX: 'hidden', boxSizing: 'border-box' }}>
      {/* Breadcrumb */}
      <div style={ppStyles.breadcrumb}>
        <a href="/" style={ppStyles.breadLink}>Trang chủ</a>
        <span style={ppStyles.breadSep}>›</span>
        <a href={categoryUrl(product.categoryId)} style={ppStyles.breadLink}>
          {CATEGORIES.find(c => c.id === product.categoryId)?.name}
        </a>
        <span style={ppStyles.breadSep}>›</span>
        <span style={ppStyles.breadCurrent}>{product.name}</span>
      </div>

      {/* MAIN LAYOUT */}
      <div style={{ ...ppStyles.layout, gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'minmax(360px, 480px) minmax(0, 1fr)', gap: isMobile ? 20 : 40 }}>
        {/* LEFT: Gallery */}
        <div style={{ ...ppStyles.gallery, width: '100%', maxWidth: isMobile ? '100%' : 480, justifySelf: 'start' }}>
          <div style={ppStyles.mainImg}>
            <div style={ppStyles.sliderViewport}>
              <div style={{ ...ppStyles.sliderTrack, transform: `translateX(-${activeImg * 100}%)` }}>
                {displayImgs.map((src, i) => (
                  <div key={i} style={ppStyles.sliderSlide}>
                    <ImgPlaceholder label={imgLabels[i] || `${product.name} — ảnh ${i + 1}`} bg="#f0f5ef" aspectRatio="1 / 1" style={{ borderRadius: 14, width: '100%' }} src={src || null} responsiveSizes="(max-width: 767px) 100vw, 480px" imageLoading={i === activeImg ? 'eager' : 'lazy'} imageFetchPriority={i === activeImg ? 'high' : null} />
                  </div>
                ))}
              </div>
            </div>
            {product.tag && <span style={{ ...ppStyles.tag, background: product.tag === 'Bán chạy' ? '#318223' : '#e07a24' }}>{product.tag}</span>}
          </div>
          {galleryImgs.length > 0 && (
            <div style={ppStyles.thumbRail}>
              {canThumbPrev && (
                <button style={{ ...ppStyles.thumbArrow, left: 8 }} onClick={() => scrollThumbs(-1)}>‹</button>
              )}
              <div
                ref={thumbViewportRef}
                style={ppStyles.thumbViewport}
                onScroll={updateThumbNav}
              >
                <div style={{ ...ppStyles.thumbTrack, gap: isMobile ? 8 : 12 }}>
                  {galleryImgs.map((src, i) => (
                    <div
                      key={i}
                      data-thumb-index={i}
                      style={{
                        ...ppStyles.thumb,
                        width: isMobile ? 72 : 84,
                        minWidth: isMobile ? 72 : 84,
                        border: activeImg === i ? '2px solid #318223' : '2px solid transparent'
                      }}
                      onClick={() => setActiveImg(i)}
                    >
                      <ImgPlaceholder label={`ảnh ${i + 1}`} bg="#e8ede7" aspectRatio="1 / 1" style={{ borderRadius: 8, width: '100%' }} src={src} responsiveSizes="84px" />
                    </div>
                  ))}
                </div>
              </div>
              {canThumbNext && (
                <button style={{ ...ppStyles.thumbArrow, right: 8 }} onClick={() => scrollThumbs(1)}>›</button>
              )}
            </div>
          )}
        </div>

        {/* RIGHT: Info */}
        <div style={ppStyles.info}>
          <h1 style={{ ...ppStyles.name, ...(isMobile ? ppStyles.nameMobile : {}) }}>{product.name}</h1>
          <a href={categoryUrl(product.categoryId)} style={ppStyles.catBadge}>
            {CATEGORIES.find(c => c.id === product.categoryId)?.name}
          </a>

          <div style={ppStyles.ratingRow}>
            {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f5a623', fontSize: 16 }}>{s}</span>)}
            <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>({reviews.length} đánh giá)</span>
          </div>

          <div style={ppStyles.priceRow}>
            <span style={ppStyles.price}>{currentPrice.toLocaleString('vi-VN')}đ</span>
            {currentOriginalPrice && (
              <>
                <span style={ppStyles.origPrice}>{currentOriginalPrice.toLocaleString('vi-VN')}đ</span>
                <span style={ppStyles.discountBadge}>-{discount}%</span>
              </>
            )}
          </div>

          <p style={ppStyles.shortDesc}>{product.shortDesc}</p>

          <div style={ppStyles.divider} />

          {variants.length > 0 && optionGroups.length > 0 && (
            <div style={ppStyles.variantWrap}>
              {optionGroups.map(group => (
                <div key={group.name} style={{ marginBottom: 14 }}>
                  <span style={ppStyles.label}>{group.name}</span>
                  <div style={isColorOptionGroup(group) ? ppStyles.colorGrid : (isMobile ? ppStyles.variantGridMobile : ppStyles.variantGrid)}>
                    {getOptionValuesForGroup(group).map(value => {
                      const active = selectedOptions[group.name] === value;
                      const available = isOptionValueAvailable(group.name, value);
                      const previewVariant = getOptionPreviewVariant(group.name, value);
                      const isColor = isColorOptionGroup(group);
                      const swatch = getColorSwatch(value);
                      const previewImage = !isColor ? (previewVariant?.image || getOptionImage(group.name, value)) : '';
                      return (
                        <button
                          key={value}
                          className="product-variant-btn"
                          title={value}
                          aria-label={`${group.name}: ${value}`}
                          disabled={!available}
                          style={{
                            ...(isColor ? ppStyles.colorBtn : ppStyles.variantBtn),
                            ...(!isColor && isMobile ? ppStyles.variantBtnMobile : {}),
                            ...(active ? (isColor ? ppStyles.colorBtnActive : ppStyles.variantBtnActive) : {}),
                            opacity: available ? 1 : 0.45,
                            cursor: available ? 'pointer' : 'not-allowed',
                          }}
                          onClick={() => {
                            if (!available) return;
                            setSelectedOptions(prev => {
                              const next = { ...prev, [group.name]: value };
                              const groupIndex = optionGroups.findIndex(item => item.name === group.name);
                              optionGroups.slice(groupIndex + 1).forEach(item => delete next[item.name]);
                              return next;
                            });
                          }}
                        >
                          {isColor ? (
                            <span style={{ ...ppStyles.colorDot, background: swatch.background, borderColor: swatch.border }} />
                          ) : (
                            <>
                              {previewImage && (
                                <img
                                  src={previewImage}
                                  alt={value}
                                  style={{ ...ppStyles.variantThumb, ...(isMobile ? ppStyles.variantThumbMobile : {}) }}
                                />
                              )}
                              <span style={ppStyles.variantText}>
                                <span>{value}</span>
                                {previewVariant?.price ? (
                                  <span style={ppStyles.variantPrice}>{previewVariant.price.toLocaleString('vi-VN')}đ</span>
                                ) : null}
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              {selectedVariant && (
                <div style={{ fontSize: 13, color: '#5f6f5c', marginTop: 4 }}>
                  Đang chọn: <strong style={{ color: '#318223' }}>{selectedVariant.name}</strong>
                </div>
              )}
            </div>
          )}

          {variants.length > 0 && optionGroups.length === 0 && (
            <div style={ppStyles.variantWrap}>
              <span style={ppStyles.label}>Phân loại</span>
              <div style={isMobile ? ppStyles.variantGridMobile : ppStyles.variantGrid}>
                {variants.map(variant => {
                  const active = selectedVariant && selectedVariant.id === variant.id;
                  return (
                    <button
                      key={variant.id}
                      className="product-variant-btn"
                      style={{ ...ppStyles.variantBtn, ...(isMobile ? ppStyles.variantBtnMobile : {}), ...(active ? ppStyles.variantBtnActive : {}) }}
                      onClick={() => setSelectedVariantId(variant.id)}
                    >
                      {variant.image && (
                        <img
                          src={variant.image}
                          alt={variant.name}
                          style={{ ...ppStyles.variantThumb, ...(isMobile ? ppStyles.variantThumbMobile : {}) }}
                        />
                      )}
                      <span style={ppStyles.variantText}>
                        <span>{variant.name}</span>
                        <strong>{variant.price.toLocaleString('vi-VN')}đ</strong>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* QTY */}
          <div style={ppStyles.qtyRow}>
            <span style={ppStyles.label}>Số lượng</span>
            <div style={ppStyles.qtyControl}>
              <button style={ppStyles.qtyBtn} onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
              <span style={ppStyles.qtyNum}>{qty}</span>
              <button style={ppStyles.qtyBtn} onClick={() => setQty(qty + 1)}>+</button>
            </div>
          </div>

          {/* ACTIONS */}
          <div style={ppStyles.actions}>
            <button className="product-action-btn" style={{ ...ppStyles.addBtn, ...(addedMsg ? ppStyles.addBtnAdded : {}) }} onClick={handleAddToCart}>
              {addedMsg ? '✓ Đã thêm vào giỏ!' : '🛒 Thêm vào giỏ hàng'}
            </button>
            <button className="product-action-btn" style={ppStyles.buyNowBtn} onClick={(e) => { handleAddToCart(e); setTimeout(() => setPage({ name: 'cart' }), 360); }}>
              Mua ngay
            </button>
          </div>

          {/* PERKS */}
          <div style={{ ...ppStyles.perks, padding: isMobile ? '18px 16px' : '20px 22px' }}>
            <div style={ppStyles.perkList}>
              {['🚚 Giao hàng toàn quốc', '✅ Kiểm tra trước khi nhận hàng', '🔄 Đổi trả 7 ngày'].map(p => (
                <div key={p} style={ppStyles.perk}>{p}</div>
              ))}
            </div>
            <div style={ppStyles.supportWrap}>
              <a href="tel:0773829593" style={ppStyles.supportCard}>
                <span style={ppStyles.supportLabel}>Hotline / Zalo</span>
                <strong style={ppStyles.supportPhone}>0773829593</strong>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={ppStyles.tabsWrap}>
        <div style={ppStyles.tabBar}>
          {[['desc', 'Mô tả chi tiết'], ['usage', 'Hướng dẫn sử dụng'], ['reviews', `Đánh giá (${reviews.length})`]].map(([key, label]) => (
            <button key={key}
              style={{ ...ppStyles.tabBtn, color: activeTab === key ? '#318223' : '#666', borderBottom: activeTab === key ? '2px solid #318223' : '2px solid transparent', fontWeight: activeTab === key ? 700 : 400 }}
              onClick={() => setActiveTab(key)}>
              {label}
            </button>
          ))}
        </div>
        <div style={ppStyles.tabContent}>
          {activeTab === 'desc' && renderStructuredText(product.description)}
          {activeTab === 'usage' && renderStructuredText(product.usage)}
          {activeTab === 'reviews' && (
            <div>
              {reviews.length === 0 ? (
                <p style={{ color: '#aaa', fontSize: 14 }}>Chưa có đánh giá nào.</p>
              ) : reviews.map((r, i) => (
                <div key={i} style={ppStyles.review}>
                  <div style={ppStyles.reviewHeader}>
                    <span style={ppStyles.reviewName}>{r.name}</span>
                    <span style={{ color: '#f5a623', fontSize: 13 }}>{'★'.repeat(r.rating)}</span>
                  </div>
                  <p style={ppStyles.reviewText}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div style={ppStyles.related}>
          <h2 style={ppStyles.relatedTitle}>Sản phẩm liên quan</h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(6, 1fr)', gap: isMobile ? 8 : 12 }}>
            {related.map(p => <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} productImages={productImages} />)}
          </div>
        </div>
      )}
    </div>
  );
};

const ppStyles = {
  backBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #dfe7dc', borderRadius: 999, padding: '10px 16px', fontSize: 13, fontWeight: 700, color: '#2f6e24', cursor: 'pointer', marginBottom: 18 },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13, flexWrap: 'wrap' },
  breadLink: { color: '#318223', cursor: 'pointer', fontWeight: 500, textDecoration: 'none' },
  breadSep: { color: '#ccc' },
  breadCurrent: { color: '#666' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, marginBottom: 56, minWidth: 0 },
  gallery: { minWidth: 0 },
  mainImg: { position: 'relative', marginBottom: 12 },
  sliderViewport: { width: '100%', overflow: 'hidden', borderRadius: 14 },
  sliderTrack: { display: 'flex', width: '100%', transition: 'transform .58s cubic-bezier(.22,.61,.36,1)', willChange: 'transform' },
  sliderSlide: { minWidth: '100%', flex: '0 0 100%' },
  tag: { position: 'absolute', top: 14, left: 14, color: '#fff', fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 8 },
  thumbRow: { display: 'grid', gridTemplateColumns: 'repeat(6, 92px)', gap: 12, alignItems: 'start' },
  thumbRail: { position: 'relative', width: '100%' },
  thumbViewport: { width: '100%', overflowX: 'auto', overflowY: 'hidden', scrollbarWidth: 'none', msOverflowStyle: 'none', padding: '0 42px', boxSizing: 'border-box' },
  thumbTrack: { display: 'flex', flexWrap: 'nowrap', width: 'max-content', padding: '2px 0' },
  thumbArrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 2, width: 34, height: 34, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,0.92)', color: '#7d8f78', fontSize: 30, fontWeight: 400, lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' },
  thumb: { borderRadius: 10, overflow: 'hidden', cursor: 'pointer', transition: 'border-color .2s', flexShrink: 0 },
  info: { minWidth: 0, maxWidth: '100%' },
  catBadge: { display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#318223', background: '#eaf4e9', padding: '4px 12px', borderRadius: 20, marginBottom: 14, cursor: 'pointer', textDecoration: 'none' },
  name: { fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px', lineHeight: 1.35, letterSpacing: '0em', overflowWrap: 'anywhere' },
  nameMobile: { fontSize: 18, lineHeight: 1.36 },
  ratingRow: { display: 'flex', alignItems: 'center', marginBottom: 16 },
  priceRow: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  price: { fontSize: 28, fontWeight: 800, color: '#318223' },
  origPrice: { fontSize: 16, color: '#aaa', textDecoration: 'line-through' },
  discountBadge: { background: '#fee', color: '#e84848', fontSize: 13, fontWeight: 700, padding: '3px 8px', borderRadius: 6 },
  shortDesc: { fontSize: 14, color: '#666', lineHeight: 1.8, margin: '0 0 20px' },
  divider: { borderTop: '1px solid #f0f0f0', margin: '20px 0' },
  variantWrap: { marginBottom: 20 },
  variantGrid: { display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 },
  variantGridMobile: { display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 10, marginTop: 10 },
  variantBtn: { minWidth: 140, maxWidth: '100%', background: '#fff', border: '1.5px solid #e1e8df', borderRadius: 10, padding: '10px 12px', color: '#333', cursor: 'pointer', display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 10, textAlign: 'left', transition: 'all .2s', overflow: 'hidden', boxSizing: 'border-box' },
  variantBtnMobile: { width: '100%', minWidth: 0, flex: 'none', padding: '9px 10px', gap: 8 },
  variantThumb: { width: 44, height: 44, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid #e6eee3', background: '#f7faf6' },
  variantThumbMobile: { width: 34, height: 34, borderRadius: 7 },
  variantText: { display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, overflow: 'hidden', overflowWrap: 'anywhere', lineHeight: 1.35 },
  variantPrice: { fontSize: 12, fontWeight: 800, color: '#318223' },
  variantBtnActive: { borderColor: '#318223', background: '#f0f8ef', color: '#318223', boxShadow: '0 8px 20px rgba(49,130,35,0.12)' },
  colorGrid: { display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 10 },
  colorBtn: { width: 42, height: 42, borderRadius: '50%', padding: 3, background: '#fff', border: '2px solid #e1e8df', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all .2s' },
  colorBtnActive: { borderColor: '#318223', boxShadow: '0 0 0 4px rgba(49,130,35,0.12)' },
  colorDot: { display: 'block', width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #cfd8cf' },
  qtyRow: { display: 'flex', alignItems: 'center', gap: 20, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 600, color: '#555' },
  qtyControl: { display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #e0e0e0', borderRadius: 10, overflow: 'hidden' },
  qtyBtn: { width: 40, height: 40, background: '#f7f7f5', border: 'none', fontSize: 18, cursor: 'pointer', color: '#333', fontWeight: 500 },
  qtyNum: { width: 44, textAlign: 'center', fontSize: 15, fontWeight: 700 },
  actions: { display: 'flex', gap: 12, marginBottom: 20 },
  addBtn: { flex: 1, background: '#fff', color: '#318223', border: '2px solid #318223', padding: '14px 20px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s, color .2s' },
  addBtnAdded: { background: '#eaf4e9', color: '#2a6e1e' },
  buyNowBtn: { flex: 1, background: '#318223', color: '#fff', border: '2px solid #318223', padding: '14px 20px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'transform .2s, box-shadow .2s, background .2s' },
  perks: { display: 'flex', flexDirection: 'column', gap: 18, alignItems: 'stretch', background: '#f7faf6', borderRadius: 12, padding: '16px 18px' },
  perkList: { display: 'flex', flexDirection: 'column', gap: 8 },
  perk: { fontSize: 13, color: '#555', whiteSpace: 'normal', overflowWrap: 'anywhere' },
  supportWrap: { width: '100%', display: 'flex', justifyContent: 'center' },
  supportCard: { display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: 360, padding: '14px 16px', borderRadius: 12, background: '#fff', border: '1px solid #dfe8dc', textDecoration: 'none', textAlign: 'center' },
  supportLabel: { fontSize: 12, fontWeight: 600, color: '#6f7f6a', textTransform: 'uppercase', letterSpacing: '0.04em' },
  supportPhone: { fontSize: 20, fontWeight: 800, color: '#318223', lineHeight: 1.2 },
  tabsWrap: { marginBottom: 48 },
  tabBar: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', borderBottom: '1px solid #f0f0f0', marginBottom: 24, maxWidth: 720 },
  tabBtn: { width: '100%', minHeight: 52, background: 'none', border: 'none', borderBottom: '2px solid transparent', padding: '12px 10px', fontSize: 14, cursor: 'pointer', transition: 'all .2s', textAlign: 'center', whiteSpace: 'nowrap' },
  tabContent: { padding: '0 4px' },
  tabText: { fontSize: 14, color: '#555', lineHeight: 1.9, maxWidth: 720 },
  structuredText: { maxWidth: 900, color: '#555', fontSize: 15, lineHeight: 1.85 },
  structuredHeading: { fontSize: 18, fontWeight: 800, color: '#222', margin: '22px 0 10px', lineHeight: 1.45, letterSpacing: '0.01em' },
  structuredParagraph: { fontSize: 15, color: '#5f5f5f', lineHeight: 1.9, margin: '0 0 14px' },
  structuredList: { margin: '0 0 18px 20px', padding: 0, color: '#555', lineHeight: 1.85 },
  structuredListItem: { marginBottom: 8, paddingLeft: 4 },
  structuredSpace: { height: 10 },
  review: { borderBottom: '1px solid #f5f5f5', paddingBottom: 16, marginBottom: 16 },
  reviewHeader: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 6 },
  reviewName: { fontSize: 14, fontWeight: 700, color: '#1a1a1a' },
  reviewText: { fontSize: 13, color: '#666', lineHeight: 1.7, margin: 0 },
  related: {},
  relatedTitle: { fontSize: 22, fontWeight: 800, color: '#1a1a1a', marginBottom: 20, letterSpacing: '-0.3px' },
};




const CartPage = ({ cart, setCart, setPage, productImages = {} }) => {
  const isMobile = useIsMobile();
  const updateQty = (cartKey, delta) => {
    setCart(prev => prev.map(item =>
      getCartItemKey(item) === cartKey ? { ...item, qty: Math.max(1, item.qty + delta) } : item
    ));
  };
  const removeItem = (cartKey) => setCart(prev => prev.filter(item => getCartItemKey(item) !== cartKey));
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingInfo = calculateShipping(cart, { subtotal });
  const shipping = shippingInfo.fee;
  const total = subtotal + shipping;

  if (cart.length === 0) return (
    <div style={{ maxWidth: 600, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>🛒</div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 12 }}>Giỏ hàng trống</h2>
      <p style={{ color: '#888', marginBottom: 28 }}>Hãy thêm sản phẩm yêu thích vào giỏ nhé!</p>
      <a href="/" style={cartStyles.ctaBtn}>Tiếp tục mua sắm</a>
    </div>
  );

  return (
    <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '16px 16px' : '32px 24px' }}>
      <h1 style={{ ...cartStyles.title, fontSize: isMobile ? 22 : 28 }}>Giỏ hàng của bạn</h1>
      <div style={{ ...cartStyles.layout, gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 20 : 32 }}>
        {/* Items */}
        <div style={cartStyles.items}>
          {!isMobile && (
            <div style={cartStyles.itemsHead}>
              <span style={cartStyles.colLabel}>Sản phẩm</span>
              <span style={cartStyles.colLabel}>Đơn giá</span>
              <span style={cartStyles.colLabel}>Số lượng</span>
              <span style={cartStyles.colLabel}>Thành tiền</span>
              <span style={{ width: 32 }}></span>
            </div>
          )}
          {cart.map(item => {
            const itemKey = getCartItemKey(item);
            const itemHref = productUrl(item);
            const handleItemLink = (event) => {
              if (itemHref !== '#') return;
              event.preventDefault();
              setPage({ name: 'product', id: item.id });
            };
            return (
            <div key={itemKey} style={isMobile ? { padding: '14px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 12, alignItems: 'flex-start' } : cartStyles.row}>
              {isMobile ? (
                <>
                  <ImgPlaceholder label={item.name} w={64} h={64} bg="#f0f5ef" style={{ borderRadius: 10, flexShrink: 0 }} src={item.selectedVariant?.image || getProductDisplayImage(item, productImages)} responsiveSizes="64px" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <a href={itemHref} style={{ ...cartStyles.itemName, marginBottom: 2 }} onClick={handleItemLink}>{item.name}</a>
                      <button style={{ ...cartStyles.removeBtn, color: '#bbb', marginLeft: 8, flexShrink: 0 }} onClick={() => removeItem(itemKey)} title="Xóa">✕</button>
                    </div>
                    <div style={{ ...cartStyles.itemCat, marginBottom: 8 }}>{CATEGORIES.find(c => c.id === item.categoryId)?.name}</div>
                    {item.selectedVariant && <div style={cartStyles.itemVariant}>Phân loại: {item.selectedVariant.name}</div>}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={cartStyles.qtyControl}>
                        <button style={cartStyles.qtyBtn} onClick={() => updateQty(itemKey, -1)}>−</button>
                        <span style={cartStyles.qtyNum}>{item.qty}</span>
                        <button style={cartStyles.qtyBtn} onClick={() => updateQty(itemKey, +1)}>+</button>
                      </div>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#318223' }}>{(item.price * item.qty).toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div style={cartStyles.productCol}>
                    <ImgPlaceholder label={item.name} w={84} h={84} bg="#f0f5ef" style={{ borderRadius: 10, flexShrink: 0 }} src={item.selectedVariant?.image || getProductDisplayImage(item, productImages)} responsiveSizes="84px" />
                    <div style={{ minWidth: 0 }}>
                      <a href={itemHref} style={cartStyles.itemName} onClick={handleItemLink}>{item.name}</a>
                      <div style={cartStyles.itemCat}>{CATEGORIES.find(c => c.id === item.categoryId)?.name}</div>
                      {item.selectedVariant && <div style={cartStyles.itemVariant}>Phân loại: {item.selectedVariant.name}</div>}
                    </div>
                  </div>
                  <div style={cartStyles.priceCol}>{item.price.toLocaleString('vi-VN')}đ</div>
                  <div style={cartStyles.qtyCol}>
                    <div style={cartStyles.qtyControl}>
                      <button style={cartStyles.qtyBtn} onClick={() => updateQty(itemKey, -1)}>−</button>
                      <span style={cartStyles.qtyNum}>{item.qty}</span>
                      <button style={cartStyles.qtyBtn} onClick={() => updateQty(itemKey, +1)}>+</button>
                    </div>
                  </div>
                  <div style={{ ...cartStyles.priceCol, color: '#318223', fontWeight: 700 }}>
                    {(item.price * item.qty).toLocaleString('vi-VN')}đ
                  </div>
                  <button style={cartStyles.removeBtn} onClick={() => removeItem(itemKey)} title="Xóa">✕</button>
                </>
              )}
            </div>
            );
          })}
          <div style={{ textAlign: 'left', marginTop: 16 }}>
            <a href="/" style={cartStyles.continueBtn}>← Tiếp tục mua sắm</a>
          </div>
        </div>

        {/* Summary */}
        <div style={cartStyles.summary}>
          <div style={cartStyles.summaryTitle}>Tóm tắt đơn hàng</div>
          <div style={cartStyles.summaryRow}>
            <span>Tạm tính</span>
            <span>{subtotal.toLocaleString('vi-VN')}đ</span>
          </div>
          <div style={cartStyles.summaryRow}>
            <span>Phí vận chuyển</span>
            <span style={{ color: shipping === 0 ? '#318223' : 'inherit' }}>
              {shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}
            </span>
          </div>
          <div style={cartStyles.freeShipNote}>
            Tạm tính theo {formatWeight(shippingInfo.weight)}. Phí cuối cùng sẽ cập nhật theo địa chỉ và hình thức giao hàng.
          </div>
          <div style={cartStyles.divider} />
          <div style={{ ...cartStyles.summaryRow, fontWeight: 700, fontSize: 17 }}>
            <span>Tổng cộng</span>
            <span style={{ color: '#318223' }}>{total.toLocaleString('vi-VN')}đ</span>
          </div>
          <button style={cartStyles.ctaBtn} onClick={() => setPage({ name: 'checkout' })}>
            Tiến hành đặt hàng →
          </button>
          <div style={cartStyles.secureBadge}>🔒 Thanh toán an toàn · Đổi trả 7 ngày</div>
        </div>
      </div>
    </div>
  );
};

const cartStyles = {
  title: { fontSize: 28, fontWeight: 800, color: '#1a1a1a', marginBottom: 28, letterSpacing: '-0.5px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 340px', gap: 32, alignItems: 'start' },
  items: { background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' },
  itemsHead: { display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) 1fr 1fr 1fr 32px', gap: 16, padding: '14px 16px', background: '#f7faf6', borderBottom: '1px solid #eef3ed' },
  colLabel: { fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' },
  row: { display: 'grid', gridTemplateColumns: 'minmax(0, 2.4fr) 1fr 1fr 1fr 32px', gap: 16, padding: '18px 16px', borderBottom: '1px solid #f5f5f5', alignItems: 'center' },
  productCol: { display: 'flex', alignItems: 'center', gap: 16, minWidth: 0 },
  itemName: { display: 'block', fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4, cursor: 'pointer', lineHeight: 1.4, textDecoration: 'none' },
  itemCat: { fontSize: 12, color: '#aaa' },
  itemVariant: { fontSize: 12, color: '#318223', fontWeight: 600, marginTop: 3, marginBottom: 6 },
  priceCol: { fontSize: 14, color: '#444' },
  qtyCol: { display: 'flex', justifyContent: 'center' },
  qtyControl: { display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { width: 32, height: 32, background: '#f7f7f5', border: 'none', fontSize: 16, cursor: 'pointer', color: '#333' },
  qtyNum: { width: 36, textAlign: 'center', fontSize: 14, fontWeight: 700 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 14, padding: 4, borderRadius: 6 },
  continueBtn: { display: 'inline-flex', background: 'none', border: 'none', color: '#318223', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 20px', textDecoration: 'none' },
  summary: { background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: '24px', position: 'sticky', top: 80 },
  summaryTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 12 },
  freeShipNote: { fontSize: 12, color: '#318223', background: '#eaf4e9', padding: '8px 12px', borderRadius: 8, marginBottom: 12 },
  divider: { borderTop: '1px solid #f0f0f0', margin: '16px 0' },
  ctaBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '100%', background: '#318223', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16, textDecoration: 'none' },
  secureBadge: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 12 },
};

const PROVINCE_OPTIONS = [
  'TP.HCM', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn',
  'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước',
  'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
  'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
  'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
  'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
  'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
  'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
  'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
  'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
  'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
];

const OLD_ADDRESS_OPTIONS = {
  'TP.HCM': {
    'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão', 'Phường Tân Định'],
    'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường Võ Thị Sáu', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 6', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 18'],
    'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 6': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
    'Quận 7': ['Phường Tân Thuận Đông', 'Phường Tân Thuận Tây', 'Phường Tân Kiểng', 'Phường Tân Hưng', 'Phường Bình Thuận', 'Phường Tân Quy', 'Phường Phú Thuận', 'Phường Tân Phú', 'Phường Phú Mỹ'],
    'Quận 8': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
    'Quận 10': ['Phường 1', 'Phường 2', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận 11': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
    'Quận 12': ['Phường An Phú Đông', 'Phường Đông Hưng Thuận', 'Phường Hiệp Thành', 'Phường Tân Chánh Hiệp', 'Phường Tân Hưng Thuận', 'Phường Tân Thới Hiệp', 'Phường Tân Thới Nhất', 'Phường Thạnh Lộc', 'Phường Thạnh Xuân', 'Phường Thới An', 'Phường Trung Mỹ Tây'],
    'Quận Bình Tân': ['Phường An Lạc', 'Phường An Lạc A', 'Phường Bình Hưng Hòa', 'Phường Bình Hưng Hòa A', 'Phường Bình Hưng Hòa B', 'Phường Bình Trị Đông', 'Phường Bình Trị Đông A', 'Phường Bình Trị Đông B', 'Phường Tân Tạo', 'Phường Tân Tạo A'],
    'Quận Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 17', 'Phường 19', 'Phường 21', 'Phường 22', 'Phường 24', 'Phường 25', 'Phường 26', 'Phường 27', 'Phường 28'],
    'Quận Gò Vấp': ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16', 'Phường 17'],
    'Quận Phú Nhuận': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 13', 'Phường 15', 'Phường 17'],
    'Quận Tân Bình': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
    'Quận Tân Phú': ['Phường Hiệp Tân', 'Phường Hòa Thạnh', 'Phường Phú Thạnh', 'Phường Phú Thọ Hòa', 'Phường Phú Trung', 'Phường Sơn Kỳ', 'Phường Tân Quý', 'Phường Tân Sơn Nhì', 'Phường Tân Thành', 'Phường Tân Thới Hòa', 'Phường Tây Thạnh'],
    'Thành phố Thủ Đức': ['Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình Chiểu', 'Phường Bình Thọ', 'Phường Cát Lái', 'Phường Hiệp Bình Chánh', 'Phường Hiệp Bình Phước', 'Phường Linh Trung', 'Phường Linh Tây', 'Phường Linh Xuân', 'Phường Long Bình', 'Phường Long Phước', 'Phường Long Thạnh Mỹ', 'Phường Long Trường', 'Phường Phước Bình', 'Phường Phước Long A', 'Phường Phước Long B', 'Phường Tam Bình', 'Phường Tam Phú', 'Phường Tăng Nhơn Phú A', 'Phường Tăng Nhơn Phú B', 'Phường Thảo Điền', 'Phường Thạnh Mỹ Lợi', 'Phường Thủ Thiêm', 'Phường Trường Thạnh'],
    'Huyện Bình Chánh': ['Thị trấn Tân Túc', 'Xã An Phú Tây', 'Xã Bình Chánh', 'Xã Bình Hưng', 'Xã Bình Lợi', 'Xã Đa Phước', 'Xã Hưng Long', 'Xã Lê Minh Xuân', 'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã Quy Đức', 'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B'],
    'Huyện Cần Giờ': ['Thị trấn Cần Thạnh', 'Xã An Thới Đông', 'Xã Bình Khánh', 'Xã Long Hòa', 'Xã Lý Nhơn', 'Xã Tam Thôn Hiệp', 'Xã Thạnh An'],
    'Huyện Củ Chi': ['Thị trấn Củ Chi', 'Xã An Nhơn Tây', 'Xã An Phú', 'Xã Bình Mỹ', 'Xã Hòa Phú', 'Xã Nhuận Đức', 'Xã Phạm Văn Cội', 'Xã Phú Hòa Đông', 'Xã Phú Mỹ Hưng', 'Xã Phước Hiệp', 'Xã Phước Thạnh', 'Xã Phước Vĩnh An', 'Xã Tân An Hội', 'Xã Tân Phú Trung', 'Xã Tân Thạnh Đông', 'Xã Tân Thạnh Tây', 'Xã Tân Thông Hội', 'Xã Thái Mỹ', 'Xã Trung An', 'Xã Trung Lập Hạ', 'Xã Trung Lập Thượng'],
    'Huyện Hóc Môn': ['Thị trấn Hóc Môn', 'Xã Bà Điểm', 'Xã Đông Thạnh', 'Xã Nhị Bình', 'Xã Tân Hiệp', 'Xã Tân Thới Nhì', 'Xã Tân Xuân', 'Xã Thới Tam Thôn', 'Xã Trung Chánh', 'Xã Xuân Thới Đông', 'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng'],
    'Huyện Nhà Bè': ['Thị trấn Nhà Bè', 'Xã Hiệp Phước', 'Xã Long Thới', 'Xã Nhơn Đức', 'Xã Phú Xuân', 'Xã Phước Kiển', 'Xã Phước Lộc'],
  },
  'Hà Nội': {
    'Quận Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh', 'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc'],
    'Quận Hoàn Kiếm': ['Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân', 'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Bông', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân', 'Phường Trần Hưng Đạo', 'Phường Tràng Tiền'],
    'Quận Đống Đa': ['Phường Cát Linh', 'Phường Hàng Bột', 'Phường Khâm Thiên', 'Phường Khương Thượng', 'Phường Kim Liên', 'Phường Láng Hạ', 'Phường Láng Thượng', 'Phường Nam Đồng', 'Phường Ngã Tư Sở', 'Phường Ô Chợ Dừa', 'Phường Phương Liên', 'Phường Phương Mai', 'Phường Quang Trung', 'Phường Quốc Tử Giám', 'Phường Thịnh Quang', 'Phường Thổ Quan', 'Phường Trung Liệt', 'Phường Trung Phụng', 'Phường Trung Tự', 'Phường Văn Chương', 'Phường Văn Miếu'],
  },
  'Đà Nẵng': {
    'Quận Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hải Châu I', 'Phường Hải Châu II', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Thuận Đông', 'Phường Hòa Thuận Tây', 'Phường Nam Dương', 'Phường Phước Ninh', 'Phường Thạch Thang', 'Phường Thanh Bình', 'Phường Thuận Phước'],
    'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Phước Mỹ', 'Phường Thọ Quang'],
    'Quận Ngũ Hành Sơn': ['Phường Hòa Hải', 'Phường Hòa Quý', 'Phường Khuê Mỹ', 'Phường Mỹ An'],
  },
  'Cần Thơ': {
    'Quận Ninh Kiều': ['Phường An Bình', 'Phường An Cư', 'Phường An Hòa', 'Phường An Khánh', 'Phường An Nghiệp', 'Phường An Phú', 'Phường Cái Khế', 'Phường Hưng Lợi', 'Phường Tân An', 'Phường Thới Bình', 'Phường Xuân Khánh'],
    'Quận Cái Răng': ['Phường Ba Láng', 'Phường Hưng Phú', 'Phường Hưng Thạnh', 'Phường Lê Bình', 'Phường Phú Thứ', 'Phường Tân Phú', 'Phường Thường Thạnh'],
  },
  'Hải Phòng': {
    'Quận Hồng Bàng': ['Phường Hạ Lý', 'Phường Hoàng Văn Thụ', 'Phường Hùng Vương', 'Phường Minh Khai', 'Phường Phan Bội Châu', 'Phường Quán Toan', 'Phường Sở Dầu', 'Phường Thượng Lý', 'Phường Trại Chuối'],
    'Quận Ngô Quyền': ['Phường Cầu Đất', 'Phường Cầu Tre', 'Phường Đằng Giang', 'Phường Đông Khê', 'Phường Gia Viên', 'Phường Lạc Viên', 'Phường Lạch Tray', 'Phường Lê Lợi', 'Phường Máy Chai', 'Phường Máy Tơ', 'Phường Vạn Mỹ'],
  },
};

const HCMC_URBAN_DISTRICTS = new Set([
  'Quận 1', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
  'Quận 10', 'Quận 11', 'Quận 12', 'Quận Bình Tân', 'Quận Bình Thạnh',
  'Quận Gò Vấp', 'Quận Phú Nhuận', 'Quận Tân Bình', 'Quận Tân Phú',
  'Thành phố Thủ Đức',
]);

const normalizeAddressText = (value) => (value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]/g, '');

const isHoChiMinhCity = (value) => {
  const normalized = normalizeAddressText(value);
  return ['tphcm', 'hcm', 'hochiminh', 'hochiminhcity', 'saigon'].includes(normalized);
};

const CENTRAL_PROVINCES = new Set([
  'Thanh Hóa', 'Nghệ An', 'Hà Tĩnh', 'Quảng Bình', 'Quảng Trị', 'Thừa Thiên Huế',
  'Đà Nẵng', 'Quảng Nam', 'Quảng Ngãi', 'Bình Định', 'Phú Yên', 'Khánh Hòa',
  'Ninh Thuận', 'Bình Thuận', 'Kon Tum', 'Gia Lai', 'Đắk Lắk', 'Đắk Nông',
  'Lâm Đồng',
]);

const NORTHERN_PROVINCES = new Set([
  'Hà Nội', 'Hải Phòng', 'Bắc Giang', 'Bắc Kạn', 'Bắc Ninh', 'Cao Bằng',
  'Điện Biên', 'Hà Giang', 'Hà Nam', 'Hải Dương', 'Hòa Bình', 'Hưng Yên',
  'Lai Châu', 'Lạng Sơn', 'Lào Cai', 'Nam Định', 'Ninh Bình', 'Phú Thọ',
  'Quảng Ninh', 'Sơn La', 'Thái Bình', 'Thái Nguyên', 'Tuyên Quang',
  'Vĩnh Phúc', 'Yên Bái',
]);

const getStandardDeliveryNote = (city) => {
  if (!city.trim()) return 'Chọn tỉnh/thành phố để xem thời gian giao dự kiến.';
  if (isHoChiMinhCity(city)) return 'Giao thường trong 1-2 ngày.';
  if (CENTRAL_PROVINCES.has(city)) return 'Giao thường khu vực miền Trung trong 3-4 ngày.';
  if (NORTHERN_PROVINCES.has(city)) return 'Giao thường khu vực miền Bắc trong 4-5 ngày.';
  return 'Giao thường khu vực miền Nam trong 2-3 ngày.';
};

const getShippingRegion = (city) => {
  if (!city.trim()) return 'unknown';
  if (isHoChiMinhCity(city)) return 'hcm';
  if (CENTRAL_PROVINCES.has(city)) return 'central';
  if (NORTHERN_PROVINCES.has(city)) return 'north';
  return 'south';
};

const SHIPPING_RULES = {
  overweightFee: 16000,
  extraStepWeight: 1000,
  extraStepFee: 4000,
  urgentFee: 15000,
  freeWeightLimit: {
    in_hcm: 5000,
    outside_hcm: 3000,
  },
};

const getCartWeight = (cart) => cart.reduce((sum, item) => {
  const itemWeight = Number(item.weight) > 0 ? Number(item.weight) : 500;
  return sum + itemWeight * item.qty;
}, 0);

const calculateShipping = (cart, { city = '', deliveryMethod = 'standard', subtotal = 0 } = {}) => {
  if (!cart.length) return { fee: 0, weight: 0, baseShippingFee: 0, urgentShippingFee: 0, area: 'outside_hcm' };
  const weight = getCartWeight(cart);
  const area = isHoChiMinhCity(city) ? 'in_hcm' : 'outside_hcm';
  const freeWeightLimit = SHIPPING_RULES.freeWeightLimit[area];
  const overweight = Math.max(0, weight - freeWeightLimit);
  const extraWeightAfterFirstKg = Math.max(0, overweight - SHIPPING_RULES.extraStepWeight);
  const extraStepFee = overweight > 0
    ? Math.ceil(extraWeightAfterFirstKg / SHIPPING_RULES.extraStepWeight) * SHIPPING_RULES.extraStepFee
    : 0;
  const baseShippingFee = overweight > 0 ? SHIPPING_RULES.overweightFee + extraStepFee : 0;
  const urgentShippingFee = deliveryMethod === 'express' ? SHIPPING_RULES.urgentFee : 0;
  return {
    fee: baseShippingFee + urgentShippingFee,
    weight,
    area,
    freeWeightLimit,
    overweight,
    extraStepFee,
    baseShippingFee,
    urgentShippingFee,
  };
};

const formatWeight = (grams) => grams >= 1000
  ? `${(grams / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}kg`
  : `${grams}g`;


const CheckoutField = ({ id, label, placeholder, form, setForm, errors, setErrors, type = 'text', multiline = false }) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = form[id] || '';
    }
  });

  const syncValue = (value) => {
    setForm(f => ({ ...f, [id]: value }));
    setErrors(er => ({ ...er, [id]: '' }));
  };

  return (
    <div style={coStyles.field}>
      <label style={coStyles.label}>{label}</label>
      {multiline
        ? <textarea
            ref={ref}
            style={{ ...coStyles.input, height: 80, resize: 'vertical', borderColor: errors[id] ? '#e84848' : '#e8e8e8' }}
            placeholder={placeholder}
            defaultValue={form[id] || ''}
            onBlur={e => syncValue(e.target.value)}
          />
        : <input
            ref={ref}
            style={{ ...coStyles.input, borderColor: errors[id] ? '#e84848' : '#e8e8e8' }}
            type={type}
            placeholder={placeholder}
            defaultValue={form[id] || ''}
            onBlur={e => syncValue(e.target.value)}
          />
      }
      {errors[id] && <span style={coStyles.error}>{errors[id]}</span>}
    </div>
  );
};

const CheckoutSuggestField = ({ id, label, options, placeholder, form, setForm, errors, setErrors, disabled = false, onValueChange }) => {
  const ref = React.useRef(null);
  const [query, setQuery] = React.useState(form[id] || '');
  const [open, setOpen] = React.useState(false);

  const normalize = (value) => (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');

  const optionSearchText = (option) => {
    if (option === 'TP.HCM') return 'tp.hcm tphcm hcm ho chi minh hồ chí minh sai gon sài gòn';
    return option;
  };

  const filteredOptions = query.trim()
    ? options.filter(option => normalize(optionSearchText(option)).includes(normalize(query))).slice(0, 8)
    : options.slice(0, 8);

  React.useLayoutEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = form[id] || '';
      setQuery(form[id] || '');
    }
  });

  const syncValue = (value) => {
    setQuery(value);
    setForm(f => ({ ...f, [id]: value }));
    setErrors(er => ({ ...er, [id]: '' }));
    if (onValueChange) onValueChange(value);
  };

  return (
    <div style={coStyles.field}>
      <label style={coStyles.label}>{label}</label>
      <input
        ref={ref}
        style={{ ...coStyles.input, background: disabled ? '#f7f7f5' : '#fff', borderColor: errors[id] ? '#e84848' : '#e8e8e8', cursor: disabled ? 'not-allowed' : 'text' }}
        type="text"
        defaultValue={form[id] || ''}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={e => {
          syncValue(e.target.value);
          setTimeout(() => setOpen(false), 120);
        }}
        onChange={e => {
          const value = e.target.value;
          setQuery(value);
          setForm(f => ({ ...f, [id]: value }));
          setErrors(er => ({ ...er, [id]: '' }));
        }}
      />
      {open && !disabled && filteredOptions.length > 0 && (
        <div style={coStyles.suggestBox}>
          {filteredOptions.map(option => (
            <button
              key={option}
              type="button"
              style={coStyles.suggestItem}
              onMouseDown={e => {
                e.preventDefault();
                if (ref.current) ref.current.value = option;
                syncValue(option);
                setOpen(false);
              }}
            >
              {option}
            </button>
          ))}
        </div>
      )}
      {errors[id] && <span style={coStyles.error}>{errors[id]}</span>}
    </div>
  );
};



const CheckoutPage = ({ cart, setCart, setPage }) => {
  const isMobile = useIsMobile();
  const [step, setStep] = React.useState(1); // 1=info, 2=confirm, 3=success
  const [form, setForm] = React.useState({ name: '', phone: '', city: '', district: '', ward: '', address: '', note: '' });
  const [deliveryMethod, setDeliveryMethod] = React.useState('standard');
  const [errors, setErrors] = React.useState({});
  const [orderSending, setOrderSending] = React.useState(false);
  const [orderError, setOrderError] = React.useState('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasCandleCup = cart.some(item => item.categoryId === 'nen-ly');
  const isHcmAddress = isHoChiMinhCity(form.city);
  const hasSelectedCity = Boolean(form.city.trim());
  const hasSelectedDistrict = Boolean(form.district.trim());
  const isOutsideHcmForCandle = hasCandleCup && hasSelectedCity && !isHcmAddress;
  const isOutsideUrbanHcmForCandle = hasCandleCup && isHcmAddress && hasSelectedDistrict && !HCMC_URBAN_DISTRICTS.has(form.district);
  const isCandleDeliveryBlocked = isOutsideHcmForCandle || isOutsideUrbanHcmForCandle;
  const canUseExpress = isHcmAddress;
  const selectedDeliveryMethod = deliveryMethod;
  const deliveryMethodLabel = selectedDeliveryMethod === 'express' ? 'Hỏa tốc' : 'Giao thường';
  const deliveryNote = selectedDeliveryMethod === 'express'
    ? 'Hỏa tốc: nhận trong 4 tiếng, chỉ áp dụng cho khu vực TP.HCM.'
    : getStandardDeliveryNote(form.city);
  const shippingInfo = calculateShipping(cart, {
    city: form.city,
    deliveryMethod: selectedDeliveryMethod,
    subtotal,
  });
  const shipping = shippingInfo.fee;
  const total = subtotal + shipping;

  React.useEffect(() => {
    if (!canUseExpress && deliveryMethod === 'express') {
      setDeliveryMethod('standard');
    }
  }, [canUseExpress, deliveryMethod]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!form.phone.trim() || !/^0\d{9}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ';
    if (!form.city.trim()) e.city = 'Vui lòng chọn tỉnh/thành phố';
    if (!form.district.trim()) e.district = 'Vui lòng chọn quận/huyện';
    if (!form.ward.trim()) e.ward = 'Vui lòng chọn phường/xã';
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (isCandleDeliveryBlocked) return;
    setOrderError('');
    if (validate()) setStep(2);
  };

  const buildOrderPayload = () => ({
    customerName: form.name.trim(),
    phone: form.phone.trim(),
    address: fullAddress,
    note: form.note.trim(),
    city: form.city,
    district: form.district,
    ward: form.ward,
    deliveryMethod: deliveryMethodLabel,
    deliveryNote,
    subtotal,
    shipping,
    total,
    weight: shippingInfo.weight,
    source: 'phuonglam.com',
    createdAt: new Date().toISOString(),
    items: cart.map(item => ({
      id: item.id,
      sku: item.sku || '',
      variantId: item.selectedVariant?.id || '',
      name: item.selectedVariant?.name ? `${item.name} - ${item.selectedVariant.name}` : item.name,
      productName: item.name,
      variantName: item.selectedVariant?.name || '',
      qty: item.qty,
      price: item.price,
      total: item.price * item.qty,
      weight: item.weight || null,
    })),
  });

  const handleConfirm = async () => {
    if (orderSending) return;
    setOrderError('');
    setOrderSending(true);
    try {
      const response = await fetch(ORDER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildOrderPayload()),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.ok === false) {
        throw new Error(result.error || 'Không gửi được đơn hàng');
      }
      setCart([]);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Order webhook failed', error);
      setOrderError('Chưa gửi được đơn. Vui lòng thử lại hoặc gọi/Zalo 0773829593.');
    } finally {
      setOrderSending(false);
    }
  };

  const fullAddress = [form.address, form.ward, form.district, form.city].filter(Boolean).join(', ');
  const cityOptions = PROVINCE_OPTIONS;
  const districtOptions = form.city ? Object.keys(OLD_ADDRESS_OPTIONS[form.city] || { 'Quận/Huyện theo địa chỉ cũ': [] }) : [];
  const wardOptions = form.city && form.district
    ? ((OLD_ADDRESS_OPTIONS[form.city] || {})[form.district] || ['Phường/Xã theo địa chỉ cũ'])
    : [];

  const Field = ({ id, label, placeholder, type = 'text', multiline = false }) => (
    <div style={coStyles.field}>
      <label style={coStyles.label}>{label}</label>
      {multiline
        ? <textarea style={{ ...coStyles.input, height: 80, resize: 'vertical', borderColor: errors[id] ? '#e84848' : '#e8e8e8' }}
            placeholder={placeholder}
            value={form[id]}
            onChange={e => { setForm(f => ({ ...f, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: '' })); }}
          />
        : <input style={{ ...coStyles.input, borderColor: errors[id] ? '#e84848' : '#e8e8e8' }}
            type={type} placeholder={placeholder}
            value={form[id]}
            onChange={e => { setForm(f => ({ ...f, [id]: e.target.value })); setErrors(er => ({ ...er, [id]: '' })); }}
          />
      }
      {errors[id] && <span style={coStyles.error}>{errors[id]}</span>}
    </div>
  );

  const SelectField = ({ id, label, options, placeholder, disabled = false, onValueChange }) => {
    const listId = `suggest-${id}`;
    const inputRef = React.useRef(null);
    React.useLayoutEffect(() => {
      if (inputRef.current && inputRef.current !== document.activeElement) {
        inputRef.current.value = form[id] || '';
      }
    });
    const syncValue = (value) => {
      setForm(f => ({ ...f, [id]: value }));
      setErrors(er => ({ ...er, [id]: '' }));
      if (onValueChange) onValueChange(value);
    };
    return (
    <div style={coStyles.field}>
      <label style={coStyles.label}>{label}</label>
      <input
        ref={inputRef}
        style={{ ...coStyles.input, background: disabled ? '#f7f7f5' : '#fff', borderColor: errors[id] ? '#e84848' : '#e8e8e8', cursor: disabled ? 'not-allowed' : 'pointer' }}
        type="text"
        list={listId}
        defaultValue={form[id] || ''}
        disabled={disabled}
        placeholder={placeholder}
        onInput={e => syncValue(e.target.value)}
        onBlur={e => syncValue(e.target.value)}
      />
      <datalist id={listId}>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </datalist>
      {errors[id] && <span style={coStyles.error}>{errors[id]}</span>}
    </div>
    );
  };

  // SUCCESS
  if (step === 3) return (
    <div style={{ maxWidth: 540, margin: '80px auto', textAlign: 'center', padding: '0 24px' }}>
      <div style={coStyles.successIcon}>✓</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Đặt hàng thành công!</h2>
      <p style={{ color: '#666', lineHeight: 1.7, marginBottom: 8 }}>
        Cảm ơn <strong>{form.name}</strong>! Đơn hàng của bạn đã được tiếp nhận.
      </p>
      <p style={{ color: '#888', fontSize: 13, marginBottom: 32 }}>
        Chúng tôi sẽ liên hệ xác nhận qua số <strong>{form.phone}</strong> trong vòng 30 phút.
      </p>
      <div style={coStyles.successActions}>
        <button style={coStyles.primaryBtn} onClick={() => setPage({ name: 'home' })}>Tiếp tục mua sắm</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 16px' : '32px 24px' }}>
      {/* Steps */}
      <div style={coStyles.steps}>
        {['Thông tin', 'Xác nhận', 'Hoàn tất'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ ...coStyles.stepDot, background: step > i ? '#318223' : step === i + 1 ? '#318223' : '#e0e0e0', color: step >= i + 1 ? '#fff' : '#aaa' }}>{step > i + 1 ? '✓' : i + 1}</div>
            <span style={{ fontSize: 13, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? '#1a1a1a' : '#aaa' }}>{s}</span>
            {i < 2 && <div style={coStyles.stepLine} />}
          </div>
        ))}
      </div>

      <div style={{ ...coStyles.layout, gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? 16 : 28 }}>
        {/* STEP 1: Form */}
        {step === 1 && (
          <div style={coStyles.formCard}>
            <h2 style={coStyles.cardTitle}>Thông tin giao hàng</h2>
            <div style={coStyles.formHint}>Lưu ý: Nhập theo địa chỉ cũ</div>
            <CheckoutField id="name" label="Họ và tên *" placeholder="Nguyễn Văn A" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            <CheckoutField id="phone" label="Số điện thoại *" placeholder="0901234567" type="tel" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            <CheckoutSuggestField id="city" label="Tỉnh/Thành phố *" options={cityOptions} placeholder="Gõ tỉnh/thành phố để chọn" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onValueChange={() => setForm(f => ({ ...f, district: '', ward: '' }))} />
            <CheckoutSuggestField id="district" label="Quận/Huyện *" options={districtOptions} placeholder={form.city ? 'Gõ quận/huyện để chọn' : 'Chọn tỉnh/thành phố trước'} disabled={!form.city} form={form} setForm={setForm} errors={errors} setErrors={setErrors} onValueChange={() => setForm(f => ({ ...f, ward: '' }))} />
            <CheckoutSuggestField id="ward" label="Phường/Xã *" options={wardOptions} placeholder={form.district ? 'Gõ phường/xã để chọn' : 'Chọn quận/huyện trước'} disabled={!form.district} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            <CheckoutField id="address" label="Địa chỉ *" placeholder="Số nhà, tên đường..." multiline form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            <div style={coStyles.field}>
              <label style={coStyles.label}>Vận chuyển *</label>
              <div style={coStyles.shippingOptions}>
                <button
                  type="button"
                  style={{ ...coStyles.shippingOption, ...(selectedDeliveryMethod === 'standard' ? coStyles.shippingOptionActive : {}) }}
                  onClick={() => setDeliveryMethod('standard')}
                >
                  <span style={coStyles.shippingTitle}>Giao thường</span>
                  <span style={coStyles.shippingDesc}>{getStandardDeliveryNote(form.city)}</span>
                </button>
                {canUseExpress && (
                  <button
                    type="button"
                    style={{ ...coStyles.shippingOption, ...(selectedDeliveryMethod === 'express' ? coStyles.shippingOptionActive : {}) }}
                    onClick={() => setDeliveryMethod('express')}
                  >
                    <span style={coStyles.shippingTitle}>Hỏa tốc</span>
                    <span style={coStyles.shippingDesc}>Nhận trong 4 tiếng</span>
                  </button>
                )}
              </div>
              {!canUseExpress && (
                <div style={coStyles.shippingUnavailable}>Hỏa tốc chỉ áp dụng cho khách chọn địa chỉ TP.HCM.</div>
              )}
              <div style={coStyles.shippingNote}>{deliveryNote}</div>
            </div>
            <CheckoutField id="note" label="Ghi chú (tùy chọn)" placeholder="Ghi chú thêm cho người giao hàng..." multiline form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            {isCandleDeliveryBlocked && (
              <div style={coStyles.deliveryBlock}>
                Sản phẩm nến ly hiện chỉ hỗ trợ giao hỏa tốc trong nội thành TP.HCM. Khu vực bạn chọn chưa thể đặt sản phẩm này.
              </div>
            )}
            {!isCandleDeliveryBlocked && (
              <button style={coStyles.primaryBtn} onClick={handleSubmit}>Xem lại đơn hàng →</button>
            )}
          </div>
        )}

        {/* STEP 2: Confirm */}
        {step === 2 && (
          <div style={coStyles.formCard}>
            <h2 style={coStyles.cardTitle}>Xác nhận đơn hàng</h2>
            <div style={coStyles.confirmInfo}>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Người nhận</span><span style={coStyles.confirmVal}>{form.name}</span></div>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Số điện thoại</span><span style={coStyles.confirmVal}>{form.phone}</span></div>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Tỉnh/Thành phố</span><span style={coStyles.confirmVal}>{form.city}</span></div>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Quận/Huyện</span><span style={coStyles.confirmVal}>{form.district}</span></div>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Phường/Xã</span><span style={coStyles.confirmVal}>{form.ward}</span></div>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Địa chỉ</span><span style={coStyles.confirmVal}>{fullAddress}</span></div>
              <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Vận chuyển</span><span style={coStyles.confirmVal}>{deliveryMethodLabel} - {deliveryNote}</span></div>
              {form.note && <div style={coStyles.confirmRow}><span style={coStyles.confirmLabel}>Ghi chú</span><span style={coStyles.confirmVal}>{form.note}</span></div>}
            </div>
            <div style={coStyles.payMethod}>
              <div style={coStyles.cardTitle}>Phương thức thanh toán</div>
              <label style={coStyles.payOption}>
                <input type="radio" name="pay" defaultChecked style={{ accentColor: '#318223' }} />
                <span>Thanh toán khi nhận hàng (COD)</span>
              </label>
            </div>
          </div>
        )}

        {/* ORDER SUMMARY */}
        <div>
          <div style={coStyles.summary}>
            <div style={coStyles.cardTitle}>Đơn hàng ({cart.reduce((s, i) => s + i.qty, 0)} sản phẩm)</div>
            {cart.map(item => (
              <div key={getCartItemKey(item)} style={coStyles.summaryItem}>
                <div style={coStyles.summaryItemLeft}>
                  <div style={coStyles.summaryName}>{item.name}</div>
                  {item.selectedVariant && <div style={{ fontSize: 12, color: '#318223', fontWeight: 600, marginTop: 3 }}>Phân loại: {item.selectedVariant.name}</div>}
                  <div style={{ fontSize: 12, color: '#aaa' }}>x{item.qty}</div>
                </div>
                <div style={coStyles.summaryItemPrice}>{(item.price * item.qty).toLocaleString('vi-VN')}đ</div>
              </div>
            ))}
            <div style={coStyles.summaryDivider} />
            <div style={coStyles.summaryRow}><span>Tạm tính</span><span>{subtotal.toLocaleString('vi-VN')}đ</span></div>
            <div style={coStyles.summaryRow}>
              <span>Vận chuyển</span>
              <span style={{ color: shipping === 0 ? '#318223' : 'inherit' }}>{shipping === 0 ? 'Miễn phí' : `${shipping.toLocaleString('vi-VN')}đ`}</span>
            </div>
            <div style={coStyles.summaryDelivery}>
              <strong>{deliveryMethodLabel}</strong> · {deliveryNote}
            </div>
            <div style={coStyles.shippingBreakdown}>
              <div style={coStyles.shippingBreakRow}><span>Cân nặng</span><span>{formatWeight(shippingInfo.weight)}</span></div>
              <div style={coStyles.shippingBreakRow}><span>Ngưỡng miễn phí</span><span>{formatWeight(shippingInfo.freeWeightLimit || 3000)}</span></div>
              {shippingInfo.overweight > 0 && (
                <div style={coStyles.shippingBreakRow}><span>Cân vượt ngưỡng</span><span>{formatWeight(shippingInfo.overweight)}</span></div>
              )}
              <div style={coStyles.shippingBreakRow}><span>Phí cơ bản</span><span>{shippingInfo.baseShippingFee === 0 ? 'Miễn phí' : `${shippingInfo.baseShippingFee.toLocaleString('vi-VN')}đ`}</span></div>
              {shippingInfo.urgentShippingFee > 0 && (
                <div style={coStyles.shippingBreakRow}><span>Phụ phí hỏa tốc</span><span>{shippingInfo.urgentShippingFee.toLocaleString('vi-VN')}đ</span></div>
              )}
            </div>
            <div style={coStyles.summaryDivider} />
            <div style={{ ...coStyles.summaryRow, fontWeight: 700, fontSize: 16 }}>
              <span>Tổng cộng</span>
              <span style={{ color: '#318223' }}>{total.toLocaleString('vi-VN')}đ</span>
            </div>
            {step === 2 && (
              <div style={coStyles.confirmActions}>
                <button style={coStyles.secondaryBtnSmall} onClick={() => setStep(1)}>← Sửa thông tin</button>
                <button
                  style={{ ...coStyles.primaryBtnSmall, opacity: orderSending ? 0.72 : 1, cursor: orderSending ? 'wait' : 'pointer' }}
                  onClick={handleConfirm}
                  disabled={orderSending}
                >
                  {orderSending ? 'Đang gửi đơn...' : 'Xác nhận đặt hàng'}
                </button>
                {orderError && <div style={coStyles.orderError}>{orderError}</div>}
              </div>
            )}
          </div>
          {hasCandleCup && (
            <div style={coStyles.candleDeliveryNote}>
              Lưu ý: Đối với sản phẩm nến ly Chúng tôi hỗ trợ giao hỏa tốc trong nội thành hcm
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const coStyles = {
  steps: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36, justifyContent: 'center' },
  stepDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  stepLine: { width: 60, height: 1, background: '#e0e0e0', margin: '0 8px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' },
  formCard: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '28px 28px 24px' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 },
  formHint: { marginTop: -8, marginBottom: 18, fontSize: 15, color: '#318223', fontWeight: 700 },
  field: { marginBottom: 18, position: 'relative' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: { width: '100%', border: '1.5px solid #e8e8e8', borderRadius: 10, padding: '11px 14px', fontSize: 14, outline: 'none', boxSizing: 'border-box', color: '#1a1a1a', fontFamily: 'inherit', transition: 'border-color .2s' },
  suggestBox: { position: 'absolute', left: 0, right: 0, top: '100%', zIndex: 50, marginTop: 6, background: '#fff', border: '1px solid #dfe7dc', borderRadius: 12, boxShadow: '0 14px 35px rgba(0,0,0,0.12)', overflow: 'hidden' },
  suggestItem: { display: 'block', width: '100%', border: 'none', background: '#fff', textAlign: 'left', padding: '11px 14px', fontSize: 14, color: '#1a1a1a', cursor: 'pointer', fontFamily: 'inherit' },
  shippingOptions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 },
  shippingOption: { border: '1.5px solid #e8e8e8', background: '#fff', borderRadius: 12, padding: '12px 14px', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' },
  shippingOptionActive: { borderColor: '#318223', background: '#f2faf0', boxShadow: '0 8px 22px rgba(49,130,35,0.10)' },
  shippingTitle: { display: 'block', color: '#1a1a1a', fontSize: 14, fontWeight: 800, marginBottom: 4 },
  shippingDesc: { display: 'block', color: '#777', fontSize: 12, lineHeight: 1.45 },
  shippingUnavailable: { marginTop: 8, color: '#9a6a1f', background: '#fff8e8', borderRadius: 8, padding: '8px 10px', fontSize: 12, lineHeight: 1.5 },
  shippingNote: { marginTop: 8, color: '#318223', fontSize: 13, lineHeight: 1.5, fontWeight: 700 },
  error: { fontSize: 12, color: '#e84848', marginTop: 4, display: 'block' },
  primaryBtn: { width: '100%', background: '#318223', color: '#fff', border: 'none', padding: '14px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 },
  secondaryBtn: { background: '#fff', color: '#318223', border: '1.5px solid #318223', padding: '13px 20px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
  confirmActions: { display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' },
  orderError: { width: '100%', background: '#fff4e8', border: '1px solid #f2c799', borderRadius: 10, padding: '10px 12px', color: '#8a4a10', fontSize: 13, lineHeight: 1.5, fontWeight: 700, textAlign: 'center' },
  primaryBtnSmall: { background: '#318223', color: '#fff', border: 'none', width: '40%', minWidth: 220, padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer' },
  secondaryBtnSmall: { background: '#fff', color: '#318223', border: '1.5px solid #318223', width: '40%', minWidth: 220, padding: '10px 16px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  confirmInfo: { background: '#f7faf6', borderRadius: 10, padding: '16px 18px', marginBottom: 20 },
  confirmRow: { display: 'flex', gap: 12, marginBottom: 10, fontSize: 14 },
  confirmLabel: { color: '#888', minWidth: 120 },
  confirmVal: { color: '#1a1a1a', fontWeight: 600 },
  payMethod: { borderTop: '1px solid #f0f0f0', paddingTop: 20 },
  payOption: { display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#333', cursor: 'pointer' },
  summary: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '24px', position: 'sticky', top: 80 },
  deliveryBlock: { background: '#fff4e8', border: '1px solid #f2c799', borderRadius: 10, padding: '12px 14px', color: '#8a4a10', fontSize: 13, lineHeight: 1.6, fontWeight: 600, marginTop: 4 },
  candleDeliveryNote: { marginTop: 12, background: '#f2faf0', border: '1px solid #d8ead4', borderRadius: 12, padding: '12px 14px', color: '#318223', fontSize: 13, lineHeight: 1.6, fontWeight: 700 },
  summaryItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  summaryItemLeft: {},
  summaryName: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, maxWidth: 200 },
  summaryItemPrice: { fontSize: 13, fontWeight: 600, color: '#444', flexShrink: 0 },
  summaryDivider: { borderTop: '1px solid #f0f0f0', margin: '14px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 10 },
  summaryDelivery: { marginTop: -2, marginBottom: 12, color: '#777', background: '#f7faf6', borderRadius: 8, padding: '8px 10px', fontSize: 12, lineHeight: 1.5 },
  shippingBreakdown: { background: '#fbfbfa', border: '1px solid #eeeeea', borderRadius: 10, padding: '10px 12px', marginBottom: 12 },
  shippingBreakRow: { display: 'flex', justifyContent: 'space-between', gap: 12, color: '#777', fontSize: 12, lineHeight: 1.6 },
  successIcon: { width: 72, height: 72, background: '#eaf4e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#318223', margin: '0 auto 24px', fontWeight: 700 },
  successActions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
};






// Vietnamese-safe input — uncontrolled, sync DOM only when NOT focused
const VietInput = ({ value, onChange, style, placeholder, type, disabled }) => {
  const ref = React.useRef(null);
  // useLayoutEffect không có deps → chạy sau mỗi render, sync DOM khi field không focus
  React.useLayoutEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = value || '';
    }
  });
  return (
    <input
      ref={ref}
      type={type || 'text'}
      disabled={disabled}
      style={style}
      placeholder={placeholder}
      defaultValue={value || ''}
      onChange={e => onChange(e)}
      onBlur={e => onChange(e)}
    />
  );
};

const VietTextarea = ({ value, onChange, style, placeholder }) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = value || '';
    }
  });
  return (
    <textarea
      ref={ref}
      style={style}
      placeholder={placeholder}
      defaultValue={value || ''}
      onChange={e => onChange(e)}
      onBlur={e => onChange(e)}
    />
  );
};

const ProductEditor = ({ productOverrides, setProductOverrides, productImages, setProductImages, setExtraProducts }) => {
  const [selected, setSelected] = React.useState(null);
  const [form, setForm] = React.useState({});
  const [saved, setSaved] = React.useState(false);
  const [filterCat, setFilterCat] = React.useState('all');
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [addCat, setAddCat] = React.useState('');
  const [addTag, setAddTag] = React.useState('');
  const [addSaved, setAddSaved] = React.useState(false);
  const addFormRef = React.useRef(null);
  const productListRef = React.useRef(null);
  const listScrollTopRef = React.useRef(0);
  const shouldRestoreSelectionScrollRef = React.useRef(false);
  const restoreFramesRef = React.useRef(0);
  const [catalogProducts, setCatalogProducts] = React.useState(() => window.PRODUCTS_LIVE || PRODUCTS);
  const [newProducts, setNewProducts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('phuonglam-new-products') || '[]'); } catch { return []; }
  });

  React.useEffect(() => {
    let cancelled = false;
    fetch('/api/products.php', { cache: 'no-store' })
      .then(response => response.ok ? response.json() : null)
      .then(data => {
        if (cancelled || !Array.isArray(data?.products)) return;
        setCatalogProducts(data.products);
        window.PRODUCTS_LIVE = data.products;
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-new-products', JSON.stringify(newProducts));
    if (setExtraProducts) setExtraProducts(newProducts);
    // Sync to PRODUCTS_LIVE so FeaturedEditor sees new products
    const base = catalogProducts.map(p => productOverrides[p.id] ? { ...p, ...productOverrides[p.id] } : p);
    window.PRODUCTS_LIVE = [...base, ...newProducts];
  }, [newProducts, productOverrides, catalogProducts]);

  const createEmptyVariant = () => ({
    id: 'variant_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    name: '',
    sku: '',
    price: '',
    originalPrice: '',
    weight: '',
    image: '',
  });

  const parseProductNumber = (value) => {
    if (value === '' || value == null) return null;
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    const normalized = String(value).trim().replace(/\s+/g, '').replace(/[,.]/g, '');
    if (!normalized) return null;
    const number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  };

  const numericInputProps = { type: 'text', inputMode: 'numeric', pattern: '[0-9., ]*' };

  const cleanVariants = (variants = []) => variants
    .map((variant, index) => ({
      id: variant.id || `variant_${Date.now()}_${index}`,
      name: String(variant.name || '').trim(),
      sku: String(variant.sku || '').trim(),
      price: parseProductNumber(variant.price) || 0,
      originalPrice: parseProductNumber(variant.originalPrice),
      weight: parseProductNumber(variant.weight),
      image: variant.image || '',
    }))
    .filter(variant => variant.name && variant.price > 0);

  const addVariant = () => {
    setForm(f => ({ ...f, variants: [...(Array.isArray(f.variants) ? f.variants : []), createEmptyVariant()] }));
  };

  const updateVariant = (index, field, value) => {
    setForm(f => {
      const variants = Array.isArray(f.variants) ? [...f.variants] : [];
      variants[index] = { ...variants[index], [field]: value };
      return { ...f, variants };
    });
  };

  const removeVariant = (index) => {
    setForm(f => {
      const variants = Array.isArray(f.variants) ? [...f.variants] : [];
      variants.splice(index, 1);
      return { ...f, variants };
    });
  };

  const moveVariant = (index, direction) => {
    setForm(f => {
      const variants = Array.isArray(f.variants) ? [...f.variants] : [];
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= variants.length) return f;
      [variants[index], variants[targetIndex]] = [variants[targetIndex], variants[index]];
      return { ...f, variants };
    });
  };

  const moveProductImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex > 5) return;
    setProductImages(prev => {
      const currentImages = Array.isArray(prev[selected]) ? [...prev[selected]] : (prev[selected] ? [prev[selected]] : []);
      while (currentImages.length < 6) currentImages.push(null);
      [currentImages[index], currentImages[targetIndex]] = [currentImages[targetIndex], currentImages[index]];
      const lastFilledIndex = currentImages.reduce((last, value, imgIndex) => value ? imgIndex : last, -1);
      if (lastFilledIndex === -1) {
        const next = { ...prev };
        delete next[selected];
        return next;
      }
      return { ...prev, [selected]: currentImages.slice(0, Math.max(lastFilledIndex + 1, 1)) };
    });
  };

  const uploadVariantImage = async (index, file) => {
    if (!file || !file.type.startsWith('image/')) return;
    const imageData = await optimizeImageFile(file, { maxSize: 520, quality: 0.72, maxBytes: 90 * 1024 });
    if (imageData) updateVariant(index, 'image', imageData);
  };

  const handleAddProduct = () => {
    const f = addFormRef.current;
    const name = (f?.querySelector('#np-name')?.value || '').trim();
    const price = f?.querySelector('#np-price')?.value || '';
    if (!name || !price || !addCat) { alert('Vui lòng điền tên, giá và chọn danh mục!'); return; }
    const prod = {
      id: 'new_' + Date.now(),
      sku: 'PL-' + String(Date.now()).slice(-4),
      categoryId: addCat,
      name,
      price: parseProductNumber(price) || 0,
      originalPrice: parseProductNumber(f?.querySelector('#np-oprice')?.value),
      shortDesc: f?.querySelector('#np-sdesc')?.value || '',
      description: f?.querySelector('#np-desc')?.value || '',
      usage: f?.querySelector('#np-usage')?.value || '',
      tag: addTag || null,
      weight: parseProductNumber(f?.querySelector('#np-weight')?.value),
      hidden: false,
      variants: [],
    };
    if (f) f.querySelectorAll('input[id^="np-"],textarea[id^="np-"]').forEach(el => { el.value = ''; });
    setAddCat(''); setAddTag('');
    setNewProducts(prev => [...prev, prod]);
    setAddSaved(true); setShowAddForm(false);
    setTimeout(() => setAddSaved(false), 2500);
  };

  const allProducts = [...catalogProducts, ...newProducts.filter(np => !catalogProducts.find(p => p.id === np.id))];
  const products = filterCat === 'all' ? allProducts : allProducts.filter(p => p.categoryId === filterCat);

  const selectProduct = (p) => {
    if (productListRef.current) {
      listScrollTopRef.current = productListRef.current.scrollTop;
    }
    shouldRestoreSelectionScrollRef.current = true;
    restoreFramesRef.current = 8;
    setSelected(p.id);
    setSaved(false);
    setForm({
      sku: p.sku || '',
      name: p.name,
      price: p.price,
      originalPrice: p.originalPrice || '',
      shortDesc: p.shortDesc,
      description: p.description,
      usage: p.usage,
      tag: p.tag || '',
      weight: p.weight || '',
      hidden: isProductHidden(p),
      variants: normalizeProductVariants(p).map(variant => ({
        ...variant,
        originalPrice: variant.originalPrice || '',
        weight: variant.weight || '',
      })),
    });
  };

  React.useLayoutEffect(() => {
    if (!shouldRestoreSelectionScrollRef.current) return;
    const restorePosition = () => {
      if (productListRef.current) {
        productListRef.current.scrollTop = listScrollTopRef.current;
      }
    };
    restorePosition();
    const tick = () => {
      restorePosition();
      restoreFramesRef.current -= 1;
      if (restoreFramesRef.current > 0) {
        requestAnimationFrame(tick);
      } else {
        shouldRestoreSelectionScrollRef.current = false;
      }
    };
    requestAnimationFrame(tick);
  }, [selected]);





  const saveProduct = () => {
    const updated = {
      sku: form.sku || '',
      name: form.name,
      price: parseProductNumber(form.price) || 0,
      originalPrice: parseProductNumber(form.originalPrice),
      shortDesc: form.shortDesc,
      description: form.description,
      usage: form.usage,
      tag: form.tag || null,
      weight: parseProductNumber(form.weight),
      hidden: !!form.hidden,
      variants: cleanVariants(form.variants),
    };
    setProductOverrides(prev => ({ ...prev, [selected]: updated }));
    setNewProducts(prev => prev.map(p => p.id === selected ? { ...p, ...updated } : p));
    if (window.PRODUCTS_LIVE) {
      const idx = window.PRODUCTS_LIVE.findIndex(p => p.id === selected);
      if (idx !== -1) window.PRODUCTS_LIVE[idx] = { ...window.PRODUCTS_LIVE[idx], ...updated };
    }
    setCatalogProducts(prev => prev.map(p => p.id === selected ? { ...p, ...updated } : p));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetProduct = (id) => {
    setProductOverrides(prev => { const n = {...prev}; delete n[id]; return n; });
    setProductImages(prev => { const n = {...prev}; delete n[id]; return n; });
    if (selected === id) { setSelected(null); setForm({}); }
  };

  const selectedProduct = selected ? allProducts.find(p => p.id === selected) : null;
  const discount = form.price && form.originalPrice ? Math.round((1 - Number(form.price) / Number(form.originalPrice)) * 100) : null;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 20, minHeight: 500 }}>
      {/* LEFT: Product list */}
      <div
        ref={productListRef}
        onScroll={() => {
          if (productListRef.current) {
            listScrollTopRef.current = productListRef.current.scrollTop;
          }
        }}
        style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflowX: 'hidden', overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}
      >
        <div style={{ padding: '12px 16px', background: '#f7faf6', borderBottom: '1px solid #eef3ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Sản phẩm ({products.length})</span>
          <button onClick={() => { setShowAddForm(true); setSelected(null); }} style={{ background: '#318223', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>+ Thêm</button>
        </div>
        {/* Category filter */}
        <div style={{ padding: '8px 10px', borderBottom: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          <span onClick={() => setFilterCat('all')} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, cursor: 'pointer', background: filterCat === 'all' ? '#318223' : '#f0f0f0', color: filterCat === 'all' ? '#fff' : '#555', fontWeight: 600 }}>Tất cả</span>
          {CATEGORIES.map(c => (
            <span key={c.id} onClick={() => setFilterCat(c.id)} style={{ fontSize: 11, padding: '3px 9px', borderRadius: 999, cursor: 'pointer', background: filterCat === c.id ? '#318223' : '#f0f0f0', color: filterCat === c.id ? '#fff' : '#555', fontWeight: 600 }}>{c.name}</span>
          ))}
        </div>
        {products.length === 0 && <div style={{ padding: '24px', textAlign: 'center', color: '#ccc', fontSize: 13 }}>Chưa có sản phẩm trong danh mục này</div>}
        {products.map(p => {
          const hasChanges = !!productOverrides[p.id] || !!productImages[p.id];
          const isSelected = selected === p.id;
          const priceInfo = getProductPriceInfo(p);
          const hidden = isProductHidden(p);
          return (
            <div key={p.id}
              style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: isSelected ? '#eaf4e9' : (hidden ? '#fbfbfb' : '#fff'), borderLeft: isSelected ? '3px solid #318223' : '3px solid transparent', transition: 'all .15s', opacity: hidden ? .58 : 1 }}
              onClick={() => selectProduct(p)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Thumbnail */}
                <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#f0f5ef', flexShrink: 0, border: '1px solid #e8e8e8' }}>
                  {getProductDisplayImage(p, productImages)
                    ? <img src={getProductDisplayImage(p, productImages)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>📦</div>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: isSelected ? 700 : 600, color: '#1a1a1a', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: '#318223', fontWeight: 600 }}>{priceInfo.hasVariants ? 'Từ ' : ''}{priceInfo.price.toLocaleString('vi-VN')}đ</div>
                </div>
                {hidden && <span style={{ fontSize: 10, background: '#999', color: '#fff', padding: '2px 6px', borderRadius: 10, flexShrink: 0 }}>Ẩn</span>}
                {hasChanges && <span style={{ fontSize: 10, background: '#318223', color: '#fff', padding: '2px 6px', borderRadius: 10, flexShrink: 0 }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* RIGHT */}
      {showAddForm ? (
        <div ref={addFormRef} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>🆕 Thêm sản phẩm mới</div>
            <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: '1px solid #e0e0e0', padding: '6px 14px', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#666' }}>✕ Đóng</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Danh mục *</div>
              <select value={addCat} onChange={e => setAddCat(e.target.value)} style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">— Chọn danh mục —</option>
                {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Tên sản phẩm *</div>
              <input id="np-name" defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="Nhập tên sản phẩm" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Giá bán (đ) *</div>
              <input id="np-price" {...numericInputProps} defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="VD: 125000" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Giá gốc (đ)</div>
              <input id="np-oprice" {...numericInputProps} defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="Để trống nếu không có" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>⚖️ Trọng lượng (gram)</div>
              <input id="np-weight" {...numericInputProps} defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="VD: 200" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Nhãn</div>
              <select value={addTag} onChange={e => setAddTag(e.target.value)} style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', background: '#fff', boxSizing: 'border-box' }}>
                <option value="">Không có</option>
                <option value="Bán chạy">🔥 Bán chạy</option>
                <option value="Nổi bật">⭐ Nổi bật</option>
                <option value="Mới">🆕 Mới</option>
                <option value="Sale">🏷 Sale</option>
              </select>
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Mô tả ngắn</div>
              <textarea id="np-sdesc" defaultValue="" rows={2} style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Mô tả ngắn hiển thị trên thẻ sản phẩm" />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Mô tả chi tiết</div>
              <textarea id="np-desc" defaultValue="" rows={3} style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Thành phần, công dụng, chất liệu..." />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Hướng dẫn sử dụng</div>
              <textarea id="np-usage" defaultValue="" rows={2} style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} placeholder="Cách dùng, lưu ý an toàn..." />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
            <button onClick={handleAddProduct} style={{ background: '#318223', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>✓ Lưu sản phẩm</button>
            <button onClick={() => setShowAddForm(false)} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '11px 18px', borderRadius: 9, fontSize: 13, cursor: 'pointer', color: '#555' }}>Huỷ</button>
          </div>
        </div>
      ) : !selected ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: 14, border: '1px dashed #ddd' }}>
          <div style={{ textAlign: 'center', color: '#bbb' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👈</div>
            <div style={{ fontSize: 14 }}>Chọn sản phẩm bên trái để chỉnh sửa</div>
          </div>
        </div>
      ) : (
        <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 24, overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a' }}>Chỉnh sửa: {form.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button
                style={{ background: form.hidden ? '#318223' : '#fff8f8', border: form.hidden ? '1px solid #318223' : '1px solid #ffd0d0', color: form.hidden ? '#fff' : '#d64545', borderRadius: 8, padding: '5px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}
                onClick={() => setForm(f => ({ ...f, hidden: !f.hidden }))}>
                {form.hidden ? 'Hiện sản phẩm' : 'Ẩn sản phẩm'}
              </button>
              <button style={{ background: 'none', border: '1px solid #f0d0d0', color: '#e84848', borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}
                onClick={() => resetProduct(selected)}>↺ Reset về mặc định</button>
            </div>
          </div>
          {form.hidden && (
            <div style={{ margin: '-8px 0 18px', padding: '10px 12px', borderRadius: 10, background: '#fff8e8', color: '#8a5b00', fontSize: 12, fontWeight: 700 }}>
              Sản phẩm này đang ẩn khỏi trang khách xem. Bấm “Hiện sản phẩm” rồi “Lưu thay đổi” để mở lại.
            </div>
          )}

          {/* IMAGE UPLOAD — 6 slots 1:1 */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Ảnh sản phẩm <span style={{ color: '#aaa', fontWeight: 400, textTransform: 'none' }}>(kéo thả hoặc click — tối đa 6 ảnh)</span>
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[0,1,2,3,4,5].map(idx => {
                const imgs = Array.isArray(productImages[selected]) ? productImages[selected] : (productImages[selected] ? [productImages[selected]] : []);
                const imgSrc = imgs[idx] || null;
                const isCover = idx === 0;
                return (
                  <div key={idx} style={{ position: 'relative', paddingBottom: '100%' }}>
                    <div
                      style={{ position: 'absolute', inset: 0, border: imgSrc ? (isCover ? '2.5px solid #318223' : '1.5px solid #d0e8cc') : '2px dashed #d0d0d0', borderRadius: 10, background: imgSrc ? 'transparent' : '#fafafa', overflow: 'hidden', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color .2s' }}
                      onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor='#318223'; e.currentTarget.style.background='#f0f8f0'; }}
                      onDragLeave={e => { e.currentTarget.style.borderColor=imgSrc?(isCover?'#318223':'#d0e8cc'):'#d0d0d0'; e.currentTarget.style.background=imgSrc?'transparent':'#fafafa'; }}
                      onDrop={async e => {
                        e.preventDefault();
                        e.currentTarget.style.borderColor=isCover?'#318223':'#d0d0d0';
                        e.currentTarget.style.background=imgSrc?'transparent':'#fafafa';
                        const file = e.dataTransfer.files[0];
                        if (!file || !file.type.startsWith('image/')) return;
                        const imageData = await optimizeImageFile(file, { maxSize: 900, quality: 0.72, maxBytes: 150 * 1024 });
                        if (!imageData) return;
                        setProductImages(prev => {
                          const cur = Array.isArray(prev[selected]) ? [...prev[selected]] : (prev[selected] ? [prev[selected]] : []);
                          while (cur.length < 6) cur.push(null);
                          cur[idx] = imageData;
                          return { ...prev, [selected]: cur.filter((x,i) => i <= Math.max(idx, cur.findLastIndex(v=>v))) };
                        });
                      }}
                      onClick={() => { const inp = document.getElementById('img-slot-'+idx+'-'+selected); if(inp) inp.click(); }}
                    >
                      {imgSrc ? (
                        <>
                          <img src={imgSrc} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity .2s' }}
                            onMouseEnter={e => e.currentTarget.style.opacity=1}
                            onMouseLeave={e => e.currentTarget.style.opacity=0}>
                            <div style={{ color: '#fff', fontSize: 20 }}>🔄</div>
                            <div style={{ color: '#fff', fontSize: 11, marginTop: 4 }}>Đổi ảnh</div>
                          </div>
                          <button style={{ position: 'absolute', top: 4, right: 4, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 22, height: 22, color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}
                            onClick={e => { e.stopPropagation(); setProductImages(prev => { const cur = Array.isArray(prev[selected]) ? [...prev[selected]] : [prev[selected]]; cur[idx] = null; const clean = cur.map((v,i) => i < cur.findLastIndex(v=>v)+1 ? v : null).filter((_,i) => i < 6); return { ...prev, [selected]: clean.some(Boolean) ? clean : undefined }; }); }}>
                            ✕
                          </button>
                          <div style={{ position: 'absolute', left: 4, right: 4, bottom: isCover ? 24 : 4, display: 'flex', justifyContent: 'space-between', gap: 6, zIndex: 2 }}>
                            <button
                              onClick={e => { e.stopPropagation(); moveProductImage(idx, -1); }}
                              disabled={idx === 0}
                              style={{ background: idx === 0 ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 999, minWidth: 28, height: 24, color: '#fff', fontSize: 12, fontWeight: 700, cursor: idx === 0 ? 'not-allowed' : 'pointer', padding: '0 8px' }}>
                              ←
                            </button>
                            <button
                              onClick={e => { e.stopPropagation(); moveProductImage(idx, 1); }}
                              disabled={idx === 5}
                              style={{ background: idx === 5 ? 'rgba(0,0,0,0.25)' : 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 999, minWidth: 28, height: 24, color: '#fff', fontSize: 12, fontWeight: 700, cursor: idx === 5 ? 'not-allowed' : 'pointer', padding: '0 8px' }}>
                              →
                            </button>
                          </div>
                        </>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#ccc', pointerEvents: 'none' }}>
                          <div style={{ fontSize: 24 }}>+</div>
                          <div style={{ fontSize: 11, marginTop: 2 }}>{isCover ? 'Ảnh bìa' : `Ảnh ${idx+1}`}</div>
                        </div>
                      )}
                      {isCover && imgSrc && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: '#318223', color: '#fff', fontSize: 10, fontWeight: 700, textAlign: 'center', padding: '3px 0' }}>ẢNH BÌA</div>}
                    </div>
                    <input id={'img-slot-'+idx+'-'+selected} type="file" accept="image/*" style={{ display: 'none' }}
                      onChange={async e => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const imageData = await optimizeImageFile(file, { maxSize: 900, quality: 0.72, maxBytes: 150 * 1024 });
                        if (!imageData) return;
                        setProductImages(prev => {
                          const cur = Array.isArray(prev[selected]) ? [...prev[selected]] : (prev[selected] ? [prev[selected]] : []);
                          while (cur.length <= idx) cur.push(null);
                          cur[idx] = imageData;
                          return { ...prev, [selected]: cur };
                        });
                      }} />
                  </div>
                );
              })}
            </div>
          </div>

          {/* PRICE ROW */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={peStyles.label}>Giá bán (đ) *</label>
              <input style={peStyles.input} {...numericInputProps} value={form.price || ''} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
            </div>
            <div>
              <label style={peStyles.label}>Giá gốc (đ) — để trống nếu không giảm</label>
              <input style={peStyles.input} {...numericInputProps} value={form.originalPrice || ''} onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))} />
            </div>
            <div>
              <label style={peStyles.label}>Nhãn sản phẩm</label>
              <select style={peStyles.input} value={form.tag || ''} onChange={e => setForm(f => ({...f, tag: e.target.value}))}>
                <option value="">Không có</option>
                <option value="Bán chạy">Bán chạy</option>
                <option value="Nổi bật">Nổi bật</option>
                <option value="Mới">Mới</option>
              </select>
            </div>
            <div>
              <label style={peStyles.label}>Trạng thái sản phẩm</label>
              <select style={peStyles.input} value={form.hidden ? 'hidden' : 'visible'} onChange={e => setForm(f => ({ ...f, hidden: e.target.value === 'hidden' }))}>
                <option value="visible">Đang hiện trên website</option>
                <option value="hidden">Đang ẩn khỏi khách</option>
              </select>
            </div>
          </div>
          {discount && <div style={{ fontSize: 12, color: '#318223', marginBottom: 14, fontWeight: 600 }}>→ Giảm {discount}% so với giá gốc</div>}

          {/* VARIANTS */}
          <div style={{ marginBottom: 20, border: '1px solid #eef3ed', borderRadius: 12, padding: 16, background: '#fbfdfb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div>
                <label style={{ ...peStyles.label, marginBottom: 3 }}>Phân loại sản phẩm</label>
                <div style={{ fontSize: 12, color: '#888', lineHeight: 1.5 }}>Ví dụ: Hộp 10 viên, hộp 100 viên, mùi Mai, mùi Lavender...</div>
              </div>
              <button
                onClick={addVariant}
                style={{ background: '#318223', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 14px', fontSize: 12, fontWeight: 800, cursor: 'pointer', flexShrink: 0 }}>
                + Thêm phân loại
              </button>
            </div>

            {(!Array.isArray(form.variants) || form.variants.length === 0) && (
              <div style={{ fontSize: 12, color: '#aaa', padding: '10px 0' }}>
                Chưa có phân loại. Nếu để trống, khách sẽ mua theo giá sản phẩm chính.
              </div>
            )}

            {Array.isArray(form.variants) && form.variants.map((variant, index) => (
              <div key={variant.id || index} style={{ display: 'grid', gridTemplateColumns: '74px 1.4fr 1fr 1fr 1fr 1fr auto', gap: 8, alignItems: 'end', marginTop: 10, paddingTop: 10, borderTop: index === 0 ? 'none' : '1px solid #edf2eb' }}>
                <div>
                  <label style={peStyles.miniLabel}>Ảnh</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#318223', minWidth: 18 }}>#{index + 1}</span>
                    <button
                      onClick={() => moveVariant(index, -1)}
                      disabled={index === 0}
                      style={{ background: '#fff', color: index === 0 ? '#bbb' : '#318223', border: '1px solid #d7e7d4', borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 700, cursor: index === 0 ? 'not-allowed' : 'pointer' }}>
                      ↑
                    </button>
                    <button
                      onClick={() => moveVariant(index, 1)}
                      disabled={index === form.variants.length - 1}
                      style={{ background: '#fff', color: index === form.variants.length - 1 ? '#bbb' : '#318223', border: '1px solid #d7e7d4', borderRadius: 6, padding: '2px 6px', fontSize: 11, fontWeight: 700, cursor: index === form.variants.length - 1 ? 'not-allowed' : 'pointer' }}>
                      ↓
                    </button>
                  </div>
                  <div
                    style={{ width: 58, height: 50, borderRadius: 8, border: variant.image ? '1.5px solid #318223' : '1.5px dashed #cfd8cc', background: '#fff', overflow: 'hidden', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#318223', fontSize: 18, fontWeight: 800 }}
                    onClick={() => { const input = document.getElementById(`variant-img-${selected}-${index}`); if (input) input.click(); }}
                  >
                    {variant.image
                      ? <img src={variant.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span>+</span>
                    }
                    {variant.image && (
                      <button
                        onClick={e => { e.stopPropagation(); updateVariant(index, 'image', ''); }}
                        style={{ position: 'absolute', top: 2, right: 2, width: 18, height: 18, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 12, lineHeight: '18px', cursor: 'pointer' }}
                      >
                        ×
                      </button>
                    )}
                    <input
                      id={`variant-img-${selected}-${index}`}
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={e => uploadVariantImage(index, e.target.files && e.target.files[0])}
                    />
                  </div>
                </div>
                <div>
                  <label style={peStyles.miniLabel}>Tên phân loại *</label>
                  <input style={peStyles.input} value={variant.name || ''} onChange={e => updateVariant(index, 'name', e.target.value)} placeholder="VD: Hộp 100 viên" />
                </div>
                <div>
                  <label style={peStyles.miniLabel}>Giá bán *</label>
                  <input style={peStyles.input} {...numericInputProps} value={variant.price || ''} onChange={e => updateVariant(index, 'price', e.target.value)} placeholder="125000" />
                </div>
                <div>
                  <label style={peStyles.miniLabel}>Giá gốc</label>
                  <input style={peStyles.input} {...numericInputProps} value={variant.originalPrice || ''} onChange={e => updateVariant(index, 'originalPrice', e.target.value)} placeholder="155000" />
                </div>
                <div>
                  <label style={peStyles.miniLabel}>Gram</label>
                  <input style={peStyles.input} {...numericInputProps} value={variant.weight || ''} onChange={e => updateVariant(index, 'weight', e.target.value)} placeholder="200" />
                </div>
                <div>
                  <label style={peStyles.miniLabel}>SKU</label>
                  <input style={peStyles.input} value={variant.sku || ''} onChange={e => updateVariant(index, 'sku', e.target.value)} placeholder="PL-001A" />
                </div>
                <button
                  onClick={() => removeVariant(index)}
                  style={{ background: '#fff', color: '#d33', border: '1px solid #ffd6d6', borderRadius: 8, padding: '9px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Xóa
                </button>
              </div>
            ))}
          </div>

          {/* TEXT FIELDS */}
          {[
            { label: 'SKU (mã sản phẩm)', field: 'sku' },
            { label: 'Tên sản phẩm', field: 'name' },
            { label: 'Mô tả ngắn (hiện trên card)', field: 'shortDesc', multiline: true },
            { label: 'Mô tả chi tiết', field: 'description', multiline: true },
            { label: 'Hướng dẫn sử dụng', field: 'usage', multiline: true },
            { label: '⚖️ Trọng lượng (gram)', field: 'weight' },
          ].map(({ label, field, multiline }) => (
            <div key={field} style={{ marginBottom: 14 }}>
              <label style={peStyles.label}>{label}</label>
              {multiline
                ? <VietTextarea style={{ ...peStyles.input, height: 80, resize: 'vertical' }} value={form[field] || ''} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} />
                : <VietInput style={peStyles.input} value={form[field] || ''} onChange={e => setForm(f => ({...f, [field]: e.target.value}))} />
              }
            </div>
          ))}

          <button style={{ background: saved ? '#2a6e1e' : '#318223', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', transition: 'background .3s', width: '100%', marginTop: 4 }}
            onClick={saveProduct}>
            {saved ? '✓ Đã lưu thành công!' : '💾 Lưu thay đổi'}
          </button>
        </div>
      )}
    </div>
  );
};

const peStyles = {
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.03em' },
  miniLabel: { display: 'block', fontSize: 11, fontWeight: 700, color: '#777', marginBottom: 4 },
  input: { width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: '#1a1a1a', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' },
};

const ADMIN_PASSWORD = 'Lam29081998';


const CategoryAdmin = ({ productImages, setProductImages, productOverrides, setProductOverrides }) => {
  const [selectedCat, setSelectedCat] = React.useState(null);
  const [showAddForm, setShowAddForm] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({ name: '', price: '', originalPrice: '', shortDesc: '', tag: '' });
  const [newProducts, setNewProducts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('phuonglam-new-products') || '[]'); } catch { return []; }
  });
  const addFormRef = React.useRef(null);
  const [saved, setSaved] = React.useState(false);
  const [editImg, setEditImg] = React.useState(null);

  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-new-products', JSON.stringify(newProducts));
    window.EXTRA_PRODUCTS = newProducts;
  }, [newProducts]);

  const allProducts = [...(window.PRODUCTS_LIVE || PRODUCTS), ...newProducts];
  const catProducts = selectedCat ? allProducts.filter(p => p.categoryId === selectedCat) : [];
  const selectedCatInfo = CATEGORIES.find(c => c.id === selectedCat);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price) return;
    const prod = {
      id: 'new_' + Date.now(),
      categoryId: selectedCat,
      name: newProduct.name,
      price: Number(newProduct.price),
      originalPrice: newProduct.originalPrice ? Number(newProduct.originalPrice) : null,
      shortDesc: newProduct.shortDesc || '',
      description: '',
      usage: '',
      tag: newProduct.tag || null,
    };
    setNewProducts(prev => [...prev, prod]);
    setNewProduct({ name: '', price: '', originalPrice: '', shortDesc: '', tag: '' });
    setShowAddForm(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const deleteNewProduct = (id) => {
    setNewProducts(prev => prev.filter(p => p.id !== id));
    setProductImages(prev => { const n = {...prev}; delete n[id]; return n; });
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20, minHeight: 500 }}>
      {/* LEFT: Category list */}
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden', alignSelf: 'start' }}>
        <div style={{ padding: '14px 16px', background: '#f7faf6', borderBottom: '1px solid #eef3ed', fontSize: 12, fontWeight: 700, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Danh mục</div>
        {CATEGORIES.map(cat => {
          const count = allProducts.filter(p => p.categoryId === cat.id).length;
          const isActive = selectedCat === cat.id;
          return (
            <div key={cat.id} style={{ padding: '12px 16px', cursor: 'pointer', borderBottom: '1px solid #f5f5f5', background: isActive ? '#eaf4e9' : '#fff', borderLeft: isActive ? '3px solid #318223' : '3px solid transparent', transition: 'all .15s' }}
              onClick={() => { setSelectedCat(cat.id); setShowAddForm(false); setSaved(false); }}>
              <div style={{ fontSize: 14, fontWeight: isActive ? 700 : 500, color: isActive ? '#318223' : '#333' }}>{cat.icon} {cat.name}</div>
              <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{count} sản phẩm</div>
            </div>
          );
        })}
      </div>

      {/* RIGHT: Products */}
      <div>
        {!selectedCat ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 320, color: '#ccc', gap: 12 }}>
            <div style={{ fontSize: 40 }}>📂</div>
            <div style={{ fontSize: 15 }}>Chọn danh mục để xem và thêm sản phẩm</div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'hidden' }}>
            {/* Category header + add button */}
            <div style={{ padding: '16px 20px', background: '#f7faf6', borderBottom: '1px solid #eef3ed', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>{selectedCatInfo?.icon} {selectedCatInfo?.name}</div>
                <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{catProducts.length} sản phẩm</div>
              </div>
              <button onClick={() => { setShowAddForm(f => !f); setSaved(false); }}
                style={{ background: showAddForm ? '#f0f0f0' : '#318223', color: showAddForm ? '#555' : '#fff', border: 'none', padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s' }}>
                {showAddForm ? '✕ Đóng' : '+ Thêm sản phẩm'}
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <div style={{ padding: '20px', borderBottom: '2px solid #eef3ed', background: '#f9fcf9' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 }}>🆕 Thêm sản phẩm mới vào {selectedCatInfo?.name}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Tên sản phẩm *</div>
                    <input value={newProduct.name} onChange={e => setNewProduct(p => ({...p, name: e.target.value}))}
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="Nhập tên sản phẩm" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Giá bán (đ) *</div>
                    <input value={newProduct.price} onChange={e => setNewProduct(p => ({...p, price: e.target.value}))} type="number"
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="VD: 125000" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Giá gốc (đ)</div>
                    <input value={newProduct.originalPrice} onChange={e => setNewProduct(p => ({...p, originalPrice: e.target.value}))} type="number"
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="Để trống nếu không có" />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Nhãn</div>
                    <select value={newProduct.tag} onChange={e => setNewProduct(p => ({...p, tag: e.target.value}))}
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box', background: '#fff' }}>
                      <option value="">Không có</option>
                      <option value="Bán chạy">🔥 Bán chạy</option>
                      <option value="Nổi bật">⭐ Nổi bật</option>
                      <option value="Mới">🆕 Mới</option>
                      <option value="Sale">🏷 Sale</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: '1/-1' }}>
                    <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Mô tả ngắn</div>
                    <input value={newProduct.shortDesc} onChange={e => setNewProduct(p => ({...p, shortDesc: e.target.value}))}
                      style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="Mô tả ngắn gọn về sản phẩm" />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={handleAddProduct} style={{ background: (!newProduct.name || !newProduct.price) ? '#ccc' : '#318223', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: (!newProduct.name || !newProduct.price) ? 'not-allowed' : 'pointer' }}>
                    ✓ Lưu sản phẩm
                  </button>
                  <button onClick={() => setShowAddForm(false)} style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '10px 16px', borderRadius: 9, fontSize: 13, cursor: 'pointer', color: '#666' }}>Huỷ</button>
                </div>
              </div>
            )}

            {saved && <div style={{ padding: '12px 20px', background: '#eaf4e9', color: '#2a6e1e', fontSize: 13, fontWeight: 700, borderBottom: '1px solid #d4ead2' }}>✅ Đã thêm sản phẩm thành công!</div>}

            {/* Product grid */}
            <div style={{ padding: 16 }}>
              {catProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '48px 0', color: '#ccc' }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📦</div>
                  <div style={{ fontSize: 14 }}>Chưa có sản phẩm nào — bấm "+ Thêm sản phẩm" để bắt đầu</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', gap: 14 }}>
                  {catProducts.map(p => {
                    const img = productImages[p.id];
                    const isNew = String(p.id).startsWith('new_');
                    return (
                      <div key={p.id} style={{ border: '1px solid #efefef', borderRadius: 12, overflow: 'hidden', background: '#fff', boxShadow: '0 1px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ height: 115, background: img ? 'none' : '#f0f4ef', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, position: 'relative', overflow: 'hidden' }}>
                          {img ? <img src={img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '📦'}
                          {p.tag && <span style={{ position: 'absolute', top: 6, left: 6, background: p.tag === 'Bán chạy' ? '#318223' : p.tag === 'Sale' ? '#e84848' : '#e07a24', color: '#fff', fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 4 }}>{p.tag}</span>}
                          {isNew && <span style={{ position: 'absolute', top: 6, right: 6, background: '#1565c0', color: '#fff', fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4 }}>MỚI</span>}
                        </div>
                        <div style={{ padding: '10px 10px 12px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, marginBottom: 4, minHeight: 32 }}>{p.name}</div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#318223' }}>{(p.price||0).toLocaleString('vi-VN')}đ</div>
                          <label style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, fontSize: 11, color: '#888', cursor: 'pointer', padding: '5px 8px', border: '1px dashed #ddd', borderRadius: 6, justifyContent: 'center' }}>
                            📷 {img ? 'Đổi ảnh' : 'Thêm ảnh'}
                            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async e => {
                              const file = e.target.files[0]; if (!file) return;
                              const imageData = await optimizeImageFile(file, { maxSize: 900, quality: 0.72, maxBytes: 150 * 1024 });
                              if (imageData) setProductImages(prev => ({ ...prev, [p.id]: imageData }));
                            }} />
                          </label>
                          {isNew && (
                            <button onClick={() => deleteNewProduct(p.id)} style={{ width: '100%', marginTop: 6, background: 'none', border: '1px solid #fdd', borderRadius: 6, padding: '4px', fontSize: 11, color: '#e84848', cursor: 'pointer' }}>🗑 Xoá</button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturedEditor = ({ featuredIds, setFeaturedIds, productImages }) => {
  const allProducts = window.PRODUCTS_LIVE ? [...window.PRODUCTS_LIVE] : [...PRODUCTS];
  const defaultIds = getVisibleProducts(allProducts).filter(p => p.tag === 'Bán chạy' || p.tag === 'Nổi bật').map(p => p.id);
  const current = featuredIds || defaultIds;
  const selectedProducts = current.map(id => allProducts.find(p => p.id === id)).filter(Boolean);

  const toggle = (id) => {
    setFeaturedIds(prev => {
      const cur = prev || defaultIds;
      return cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id];
    });
  };

  const moveFeatured = (id, direction) => {
    setFeaturedIds(prev => {
      const cur = [...(prev || defaultIds)];
      const index = cur.indexOf(id);
      const targetIndex = index + direction;
      if (index === -1 || targetIndex < 0 || targetIndex >= cur.length) return cur;
      [cur[index], cur[targetIndex]] = [cur[targetIndex], cur[index]];
      return cur;
    });
  };

  const setFeaturedPosition = (id, nextPositionValue) => {
    const nextPosition = Number(nextPositionValue);
    if (!Number.isFinite(nextPosition)) return;
    setFeaturedIds(prev => {
      const cur = [...(prev || defaultIds)];
      const index = cur.indexOf(id);
      if (index === -1) return cur;
      const boundedIndex = Math.min(Math.max(nextPosition - 1, 0), cur.length - 1);
      const [item] = cur.splice(index, 1);
      cur.splice(boundedIndex, 0, item);
      return cur;
    });
  };

  const isSelected = (id) => current.includes(id);

  return (
    <div>
      <div style={{ marginBottom: 20, padding: '14px 18px', background: '#f7faf6', borderRadius: 10, border: '1px solid #ddeedd', fontSize: 13, color: '#444' }}>
        ⭐ Chọn sản phẩm hiển thị trong mục <strong>"Sản phẩm bán chạy"</strong> trên trang chủ. Đang chọn: <strong style={{ color: '#318223' }}>{current.length} sản phẩm</strong>
      </div>
      {selectedProducts.length > 0 && (
        <div style={{ marginBottom: 18, padding: 14, background: '#fff', border: '1px solid #e7efe4', borderRadius: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#318223', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 10 }}>
            Thứ tự hiển thị ngoài trang chủ
          </div>
          <div style={{ display: 'grid', gap: 8 }}>
            {selectedProducts.map((product, index) => (
              <div key={product.id} style={{ display: 'grid', gridTemplateColumns: '56px 1fr 76px auto', gap: 10, alignItems: 'center', padding: '8px 10px', background: '#f8fbf7', borderRadius: 10, border: '1px solid #edf3ea' }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#318223' }}>#{index + 1}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{product.sku || product.id}</div>
                </div>
                <input
                  type="number"
                  min="1"
                  max={selectedProducts.length}
                  value={index + 1}
                  onChange={e => setFeaturedPosition(product.id, e.target.value)}
                  style={{ width: '100%', border: '1.5px solid #d8e7d4', borderRadius: 8, padding: '7px 8px', fontSize: 12, fontWeight: 700, outline: 'none', boxSizing: 'border-box', textAlign: 'center' }}
                />
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => moveFeatured(product.id, -1)}
                    disabled={index === 0}
                    style={{ background: '#fff', color: index === 0 ? '#bbb' : '#318223', border: '1px solid #d7e7d4', borderRadius: 8, padding: '7px 9px', fontSize: 12, fontWeight: 700, cursor: index === 0 ? 'not-allowed' : 'pointer' }}>
                    ↑
                  </button>
                  <button
                    onClick={() => moveFeatured(product.id, 1)}
                    disabled={index === selectedProducts.length - 1}
                    style={{ background: '#fff', color: index === selectedProducts.length - 1 ? '#bbb' : '#318223', border: '1px solid #d7e7d4', borderRadius: 8, padding: '7px 9px', fontSize: 12, fontWeight: 700, cursor: index === selectedProducts.length - 1 ? 'not-allowed' : 'pointer' }}>
                    ↓
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {allProducts.map(p => {
          const sel = isSelected(p.id);
          const src = getProductDisplayImage(p, productImages);
          const priceInfo = getProductPriceInfo(p);
          const hidden = isProductHidden(p);
          const position = current.indexOf(p.id);
          return (
            <div key={p.id} onClick={() => toggle(p.id)}
              style={{ border: sel ? '2.5px solid #318223' : '2px solid #e8e8e8', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', background: sel ? '#f0f8ef' : '#fff', transition: 'all .15s', position: 'relative', opacity: hidden ? .55 : 1 }}>
              {/* Check badge */}
              {sel && <div style={{ position: 'absolute', top: 8, right: 8, background: '#318223', color: '#fff', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, zIndex: 1 }}>✓</div>}
              {sel && <div style={{ position: 'absolute', top: 8, right: 36, background: '#fff', color: '#318223', borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 800, zIndex: 1, border: '1px solid #cfe3ca' }}>Vị trí {position + 1}</div>}
              {hidden && <div style={{ position: 'absolute', top: 8, left: 8, background: '#888', color: '#fff', borderRadius: 999, padding: '3px 8px', fontSize: 10, fontWeight: 800, zIndex: 1 }}>Ẩn</div>}
              {/* Image 1:1 */}
              <div style={{ paddingBottom: '100%', position: 'relative', background: '#f0f4ef' }}>
                {src
                  ? <img src={src} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28 }}>📦</div>
                }
              </div>
              <div style={{ padding: '10px 12px' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', marginBottom: 2, lineHeight: 1.4 }}>{p.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{p.sku || ''} · {priceInfo.hasVariants ? 'Từ ' : ''}{priceInfo.price.toLocaleString('vi-VN')}đ</div>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 18, display: 'flex', gap: 10 }}>
        <button onClick={() => { safeSetLocalStorage('phuonglam-featured', JSON.stringify(current)); window.FEATURED_IDS = current; alert('✅ Đã lưu! Vào trang chủ để xem.'); }}
          style={{ background: '#318223', color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 9, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          ✓ Lưu thay đổi
        </button>
        <button onClick={() => setFeaturedIds(null)}
          style={{ background: '#fff', border: '1px solid #e0e0e0', padding: '11px 18px', borderRadius: 9, fontSize: 13, cursor: 'pointer', color: '#666' }}>
          Reset về mặc định
        </button>
      </div>
    </div>
  );
};

const HeaderImageEditor = ({ headerImages = null, setHeaderImages }) => {
  const current = (Array.isArray(headerImages) && headerImages.length > 0) ? headerImages : HERO_IMAGES;
  const usingDefault = !Array.isArray(headerImages);

  const readFiles = (files) => {
    Array.from(files || []).forEach(async file => {
      const imageData = await optimizeImageFile(file, { maxSize: 1300, quality: 0.72, maxBytes: 320 * 1024 });
      if (!imageData) return;
      setHeaderImages(prev => {
        const base = Array.isArray(prev) ? prev : [...HERO_IMAGES];
        return [...base, imageData];
      });
    });
  };

  const replaceImage = async (index, file) => {
    if (!file) return;
    const imageData = await optimizeImageFile(file, { maxSize: 1300, quality: 0.72, maxBytes: 320 * 1024 });
    if (!imageData) return;
    setHeaderImages(prev => {
      const next = Array.isArray(prev) ? [...prev] : [...HERO_IMAGES];
      next[index] = imageData;
      return next;
    });
  };

  const removeImage = (index) => {
    setHeaderImages(prev => {
      const next = Array.isArray(prev) ? [...prev] : [...HERO_IMAGES];
      next.splice(index, 1);
      return next.length ? next : null;
    });
  };

  const moveImage = (index, direction) => {
    setHeaderImages(prev => {
      const next = Array.isArray(prev) ? [...prev] : [...HERO_IMAGES];
      const target = index + direction;
      if (target < 0 || target >= next.length) return next;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>Ảnh header / slider</h2>
        <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>
          Quản lý các ảnh chạy ở banner đầu trang. Có thể thêm nhiều ảnh, thay ảnh, xóa ảnh và sắp xếp thứ tự hiển thị.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
        <label style={{ background: '#318223', color: '#fff', border: 'none', borderRadius: 9, padding: '11px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
          Thêm ảnh header
          <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => readFiles(e.target.files)} />
        </label>
        <button
          onClick={() => setHeaderImages(null)}
          style={{ background: '#fff', color: '#666', border: '1px solid #e0e0e0', borderRadius: 9, padding: '11px 16px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          Reset về mặc định
        </button>
      </div>

      {usingDefault && (
        <div style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: '#f7faf6', border: '1px solid #ddeedd', fontSize: 13, color: '#355133' }}>
          Đang dùng bộ ảnh header mặc định. Khi bạn thêm hoặc thay ảnh, hệ thống sẽ lưu thành bộ ảnh riêng trong admin.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {current.map((src, index) => (
          <div key={index} style={{ border: '1px solid #ececec', borderRadius: 14, padding: 14, background: '#fff' }}>
            <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 12, overflow: 'hidden', background: '#f0f5ef', marginBottom: 12 }}>
              <img src={src} alt={`Header ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 12 }}>Ảnh header {index + 1}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ background: '#318223', color: '#fff', borderRadius: 9, padding: '9px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer' }}>
                Thay ảnh
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => replaceImage(index, e.target.files && e.target.files[0])} />
              </label>
              <button onClick={() => moveImage(index, -1)} disabled={index === 0}
                style={{ background: '#fff', color: index === 0 ? '#bbb' : '#318223', border: '1px solid #d9ead5', borderRadius: 9, padding: '9px 12px', fontSize: 12, fontWeight: 700, cursor: index === 0 ? 'not-allowed' : 'pointer' }}>
                Lên
              </button>
              <button onClick={() => moveImage(index, 1)} disabled={index === current.length - 1}
                style={{ background: '#fff', color: index === current.length - 1 ? '#bbb' : '#318223', border: '1px solid #d9ead5', borderRadius: 9, padding: '9px 12px', fontSize: 12, fontWeight: 700, cursor: index === current.length - 1 ? 'not-allowed' : 'pointer' }}>
                Xuống
              </button>
              <button onClick={() => removeImage(index)}
                style={{ background: '#fff', color: '#d33', border: '1px solid #ffd6d6', borderRadius: 9, padding: '9px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CategoryImageEditor = ({ categoryImages = {}, setCategoryImages }) => {
  const handleUpload = async (categoryId, file) => {
    if (!file) return;
    const imageData = await optimizeImageFile(file, { maxSize: 850, quality: 0.72, maxBytes: 150 * 1024 });
    if (imageData) setCategoryImages(prev => ({ ...prev, [categoryId]: imageData }));
  };

  const removeImage = (categoryId) => {
    setCategoryImages(prev => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  };

  return (
    <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 24, marginBottom: 24 }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>Ảnh danh mục sản phẩm</h2>
        <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6 }}>
          Thêm ảnh đại diện cho từng danh mục ở trang chủ. Ảnh nên dùng tỷ lệ 1:1 để hiển thị đẹp và đều khung.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
        {CATEGORIES.map(cat => (
          <div key={cat.id} style={{ border: '1px solid #ececec', borderRadius: 14, padding: 14, background: '#fff' }}>
            <ImgPlaceholder
              label={cat.name}
              bg="#f0f5ef"
              aspectRatio="1 / 1"
              src={categoryImages[cat.id] || null}
              style={{ width: '100%', borderRadius: 12, marginBottom: 12 }}
            />
            <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', marginBottom: 4 }}>{cat.name}</div>
            <div style={{ fontSize: 12, color: '#318223', fontWeight: 700, marginBottom: 12 }}>Từ {cat.from}</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ background: '#318223', color: '#fff', border: 'none', borderRadius: 9, padding: '9px 12px', fontSize: 12, fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                Chọn ảnh
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={e => handleUpload(cat.id, e.target.files && e.target.files[0])}
                />
              </label>
              {categoryImages[cat.id] && (
                <button
                  onClick={() => removeImage(cat.id)}
                  style={{ background: '#fff', color: '#d33', border: '1px solid #ffd6d6', borderRadius: 9, padding: '9px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                  Xóa ảnh
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminPage = ({ setPage, productImages = {}, setProductImages, productOverrides = {}, setProductOverrides, featuredIds, setFeaturedIds, setExtraProducts, categoryImages = {}, setCategoryImages, headerImages = null, setHeaderImages }) => {
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('phuonglam-admin') === '1');
  const [pwInput, setPwInput] = React.useState('');
  const [pwError, setPwError] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState('');

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('phuonglam-admin', '1');
      setAuthed(true);
      setPwError(false);
    } else {
      setPwError(true);
      setPwInput('');
    }
  };

  if (!authed) return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 16, padding: '40px 36px', width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔐</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', marginBottom: 6 }}>Đăng nhập Admin</div>
        <div style={{ fontSize: 13, color: '#aaa', marginBottom: 28 }}>Chỉ dành cho quản trị viên</div>
        <input
          style={{ width: '100%', border: pwError ? '1.5px solid #e84848' : '1.5px solid #e0e0e0', borderRadius: 10, padding: '12px 14px', fontSize: 14, outline: 'none', marginBottom: 8, boxSizing: 'border-box', textAlign: 'center', letterSpacing: 4 }}
          type="password"
          placeholder="Nhập mật khẩu"
          value={pwInput}
          onChange={e => { setPwInput(e.target.value); setPwError(false); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          autoFocus
        />
        {pwError && <div style={{ fontSize: 12, color: '#e84848', marginBottom: 10 }}>Mật khẩu không đúng, thử lại!</div>}
        <button
          style={{ width: '100%', background: '#318223', color: '#fff', border: 'none', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}
          onClick={handleLogin}>
          Đăng nhập
        </button>
        <button style={{ marginTop: 14, background: 'none', border: 'none', color: '#aaa', fontSize: 13, cursor: 'pointer' }} onClick={() => setPage({ name: 'home' })}>
          ← Về trang chủ
        </button>
      </div>
    </div>
  );

  const [orders, setOrders] = React.useState(SAMPLE_ORDERS);
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [printOrder, setPrintOrder] = React.useState(null);
  const [search, setSearch] = React.useState('');
  const [adminTab, setAdminTab] = React.useState('orders');

  const statusColors = { New: '#318223', Processing: '#e07a24', Completed: '#888' };
  const statusBg = { New: '#eaf4e9', Processing: '#fef3e8', Completed: '#f5f5f5' };
  const statusLabels = { New: 'Mới', Processing: 'Đang xử lý', Completed: 'Hoàn tất' };

  const updateStatus = (id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const filtered = orders.filter(o => {
    const matchStatus = filterStatus === 'All' || o.status === filterStatus;
    const matchSearch = !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search) || o.phone.includes(search);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: orders.length,
    newCount: orders.filter(o => o.status === 'New').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    revenue: orders.reduce((s, o) => s + o.total, 0),
  };

  if (printOrder) return <PrintView order={printOrder} onBack={() => setPrintOrder(null)} />;
  // close orders tab block after table
  const ordersSection = null; // marker

  return (
    <div style={adStyles.wrap}>
      {/* Header */}
      <div style={adStyles.topBar}>
        <div>
          <h1 style={adStyles.pageTitle}>Quản lý đơn hàng</h1>
          <div style={adStyles.pageSubtitle}>Phương Lâm Admin · Cập nhật lúc 20/04/2025</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button style={adStyles.exportBtn} onClick={() => { window.location.href = 'admin-upload.html'; }}>
            Mở admin lưu trực tiếp
          </button>

          <button style={adStyles.backBtn} onClick={() => setPage({ name: 'home' })}>← Về trang chủ</button>
        </div>
      </div>

      <div style={{ marginBottom: 20, background: '#f7faf6', border: '1px solid #ddeedd', borderRadius: 12, padding: '16px 18px', color: '#355133' }}>
        <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 8 }}>Admin cũ chỉ dùng để xem đơn hàng</div>
        <div style={{ fontSize: 13, lineHeight: 1.7 }}>
          1. Muốn thêm/sửa sản phẩm và upload ảnh trực tiếp, hãy mở <strong>admin-upload.html</strong>.
          <br />
          2. Trong admin mới sẽ có nút <strong>Lưu lên website</strong>.
          <br />
          3. Không cần xuất file index.html theo cách cũ nữa.
        </div>
        {exportStatus && (
          <div style={{ marginTop: 10, fontSize: 13, color: '#2f6e24', fontWeight: 600 }}>
            {exportStatus}
          </div>
        )}
      </div>

      {/* Stats */}

      <div style={adStyles.statsGrid}>
        {[
          { label: 'Tổng đơn', value: stats.total, color: '#318223', bg: '#eaf4e9' },
          { label: 'Đơn mới', value: stats.newCount, color: '#318223', bg: '#eaf4e9' },
          { label: 'Đang xử lý', value: stats.processing, color: '#e07a24', bg: '#fef3e8' },
          { label: 'Doanh thu', value: stats.revenue.toLocaleString('vi-VN') + 'đ', color: '#1a1a1a', bg: '#f7f7f5' },
        ].map(s => (
          <div key={s.label} style={adStyles.statCard}>
            <div style={{ ...adStyles.statValue, color: s.color }}>{s.value}</div>
            <div style={adStyles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 24, borderBottom: '2px solid #f0f0f0' }}>
        {[['orders', '📋 Đơn hàng'], ['products', '✏️ Sản phẩm'], ['featured', '⭐ Bán chạy'], ['header', '🖼️ Ảnh header'], ['categories', '🧩 Ảnh danh mục']].map(([key, label]) => (
          <button key={key}
            style={{ background: 'none', border: 'none', borderBottom: adminTab === key ? '2px solid #318223' : '2px solid transparent', marginBottom: -2, padding: '10px 20px', fontSize: 14, fontWeight: adminTab === key ? 700 : 400, color: adminTab === key ? '#318223' : '#666', cursor: 'pointer' }}
            onClick={() => setAdminTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {adminTab === 'products' && (
        <ProductEditor productOverrides={productOverrides} setProductOverrides={setProductOverrides} productImages={productImages} setProductImages={setProductImages} setExtraProducts={setExtraProducts} />
      )}

      {adminTab === 'featured' && (
        <FeaturedEditor featuredIds={featuredIds} setFeaturedIds={setFeaturedIds} productImages={productImages} />
      )}

      {adminTab === 'header' && (
        <HeaderImageEditor headerImages={headerImages} setHeaderImages={setHeaderImages} />
      )}

      {adminTab === 'categories' && (
        <CategoryImageEditor categoryImages={categoryImages} setCategoryImages={setCategoryImages} />
      )}


      {adminTab === 'orders' && <>
      {/* Filters */}
      <div style={adStyles.filterBar}>
        <div style={adStyles.searchWrap}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input style={adStyles.searchInput} placeholder="Tìm theo tên, SĐT, mã đơn..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={adStyles.statusTabs}>
          {['All', 'New', 'Processing', 'Completed'].map(s => (
            <button key={s}
              style={{ ...adStyles.statusTab, background: filterStatus === s ? '#318223' : '#fff', color: filterStatus === s ? '#fff' : '#555', border: filterStatus === s ? '1.5px solid #318223' : '1.5px solid #e0e0e0' }}
              onClick={() => setFilterStatus(s)}>
              {s === 'All' ? 'Tất cả' : statusLabels[s]} {s !== 'All' && `(${orders.filter(o => o.status === s).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={adStyles.tableWrap}>
        <table style={adStyles.table}>
          <thead>
            <tr style={adStyles.thead}>
              <th style={adStyles.th}>Mã đơn</th>
              <th style={adStyles.th}>Khách hàng</th>
              <th style={adStyles.th}>SĐT</th>
              <th style={adStyles.th}>Sản phẩm</th>
              <th style={adStyles.th}>Tổng tiền</th>
              <th style={adStyles.th}>Ngày đặt</th>
              <th style={adStyles.th}>Trạng thái</th>
              <th style={adStyles.th}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(order => (
              <tr key={order.id} style={adStyles.tr}>
                <td style={{ ...adStyles.td, fontWeight: 700, color: '#318223' }}>{order.id}</td>
                <td style={adStyles.td}>
                  <div style={{ fontWeight: 600, color: '#1a1a1a', fontSize: 14 }}>{order.customer}</div>
                  <div style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>{order.address.substring(0, 30)}...</div>
                </td>
                <td style={adStyles.td}>{order.phone}</td>
                <td style={adStyles.td}>
                  {order.items.map((item, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                      {item.name}{item.selectedVariant ? ` - ${item.selectedVariant.name}` : ''} × {item.qty}
                    </div>
                  ))}
                </td>
                <td style={{ ...adStyles.td, fontWeight: 700, color: '#318223', whiteSpace: 'nowrap' }}>
                  {order.total.toLocaleString('vi-VN')}đ
                </td>
                <td style={{ ...adStyles.td, color: '#888', fontSize: 13 }}>{order.date}</td>
                <td style={adStyles.td}>
                  <select
                    style={{ ...adStyles.statusSelect, color: statusColors[order.status], background: statusBg[order.status], borderColor: statusColors[order.status] + '55' }}
                    value={order.status}
                    onChange={e => updateStatus(order.id, e.target.value)}>
                    <option value="New">Mới</option>
                    <option value="Processing">Đang xử lý</option>
                    <option value="Completed">Hoàn tất</option>
                  </select>
                </td>
                <td style={adStyles.td}>
                  <button style={adStyles.printBtn} onClick={() => setPrintOrder(order)}>🖨 In đơn</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa', fontSize: 14 }}>Không tìm thấy đơn hàng nào</div>
        )}
      </div>
      </>}
    </div>
  );
};

const PrintView = ({ order, onBack }) => {
  const handlePrint = () => window.print();
  return (
    <div>
      <div style={{ padding: '20px 32px', display: 'flex', gap: 12, borderBottom: '1px solid #f0f0f0' }} className="no-print">
        <button style={{ background: 'none', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13 }} onClick={onBack}>← Quay lại</button>
        <button style={{ background: '#318223', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 }} onClick={handlePrint}>🖨 In ngay</button>
      </div>
      <div id="print-area" style={pvStyles.sheet}>
        <div style={pvStyles.header}>
          <div style={pvStyles.shopName}>● Phương Lâm</div>
          <div style={pvStyles.orderId}>ĐƠN HÀNG {order.id}</div>
        </div>
        <div style={pvStyles.divider} />
        <div style={pvStyles.infoGrid}>
          <div><span style={pvStyles.infoLabel}>Người nhận:</span> <strong>{order.customer}</strong></div>
          <div><span style={pvStyles.infoLabel}>Điện thoại:</span> <strong>{order.phone}</strong></div>
          <div style={{ gridColumn: '1 / -1' }}><span style={pvStyles.infoLabel}>Địa chỉ:</span> {order.address}</div>
          <div><span style={pvStyles.infoLabel}>Ngày đặt:</span> {order.date}</div>
        </div>
        <div style={pvStyles.divider} />
        <table style={pvStyles.itemTable}>
          <thead>
            <tr style={{ background: '#f7faf6' }}>
              <th style={pvStyles.ith}>Sản phẩm</th>
              <th style={{ ...pvStyles.ith, textAlign: 'center' }}>SL</th>
              <th style={{ ...pvStyles.ith, textAlign: 'right' }}>Đơn giá</th>
              <th style={{ ...pvStyles.ith, textAlign: 'right' }}>Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={pvStyles.itd}>{item.name}{item.selectedVariant ? ` - ${item.selectedVariant.name}` : ''}</td>
                <td style={{ ...pvStyles.itd, textAlign: 'center' }}>{item.qty}</td>
                <td style={{ ...pvStyles.itd, textAlign: 'right' }}>{item.price.toLocaleString('vi-VN')}đ</td>
                <td style={{ ...pvStyles.itd, textAlign: 'right', fontWeight: 700 }}>{(item.price * item.qty).toLocaleString('vi-VN')}đ</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={pvStyles.divider} />
        <div style={pvStyles.total}>
          <span>TỔNG CỘNG</span>
          <span style={{ color: '#318223' }}>{order.total.toLocaleString('vi-VN')}đ</span>
        </div>
        <div style={pvStyles.footer}>Cảm ơn bạn đã mua hàng tại Phương Lâm! · phuonglam.com · 0901 234 567</div>
      </div>
    </div>
  );
};

const adStyles = {
  wrap: { maxWidth: 1200, margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  pageTitle: { fontSize: 26, fontWeight: 800, color: '#1a1a1a', margin: '0 0 4px', letterSpacing: '-0.5px' },
  pageSubtitle: { fontSize: 13, color: '#aaa' },
  backBtn: { background: 'none', border: '1px solid #e0e0e0', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, padding: '20px 22px' },
  statValue: { fontSize: 26, fontWeight: 800, marginBottom: 4 },
  statLabel: { fontSize: 13, color: '#888' },
  filterBar: { display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' },
  searchWrap: { display: 'flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #e8e8e8', borderRadius: 10, padding: '9px 14px', flex: 1, minWidth: 200 },
  searchInput: { border: 'none', outline: 'none', fontSize: 13, flex: 1, color: '#333' },
  statusTabs: { display: 'flex', gap: 8 },
  statusTab: { padding: '8px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all .15s' },
  tableWrap: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 900 },
  thead: { background: '#f7faf6' },
  th: { padding: '13px 16px', fontSize: 12, fontWeight: 700, color: '#888', textAlign: 'left', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #f5f5f5', transition: 'background .15s' },
  td: { padding: '14px 16px', fontSize: 13, color: '#555', verticalAlign: 'middle' },
  statusSelect: { border: '1.5px solid', borderRadius: 8, padding: '5px 10px', fontSize: 12, fontWeight: 700, cursor: 'pointer', outline: 'none' },
  printBtn: { background: '#f7f7f5', border: '1px solid #e8e8e8', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', color: '#444', whiteSpace: 'nowrap' },
  exportBtn: { background: '#318223', color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700 },
};

const pvStyles = {
  sheet: { maxWidth: 680, margin: '24px auto', padding: '32px 36px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 12 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  shopName: { fontSize: 22, fontWeight: 800, color: '#1a1a1a' },
  orderId: { fontSize: 15, fontWeight: 700, color: '#318223' },
  divider: { borderTop: '1.5px dashed #e0e0e0', margin: '14px 0' },
  infoGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13, color: '#444' },
  infoLabel: { color: '#888' },
  itemTable: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  ith: { padding: '10px 12px', fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' },
  itd: { padding: '10px 12px', color: '#444' },
  total: { display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#1a1a1a', padding: '4px 0' },
  footer: { textAlign: 'center', fontSize: 12, color: '#aaa', marginTop: 20, paddingTop: 14, borderTop: '1px solid #f0f0f0' },
};



const BlogPage = ({ setPage }) => {
  const isMobile = useIsMobile();
  const [activeTag, setActiveTag] = React.useState('Tất cả');
  const tags = ['Tất cả', 'Hướng dẫn', 'Kiến thức', 'Thảo mộc', 'Sức khỏe', 'Phụ kiện'];
  const filtered = activeTag === 'Tất cả' ? BLOG_POSTS : BLOG_POSTS.filter(p => p.tag === activeTag);

  const tagColor = (tag) => {
    const map = { 'Hướng dẫn': '#2e7d32', 'Kiến thức': '#1565c0', 'Thảo mộc': '#6a3d9a', 'Sức khỏe': '#c62828', 'Phụ kiện': '#e65100' };
    return map[tag] || '#555';
  };

  return (
    <div style={{ background: '#f8faf7', minHeight: '80vh', paddingBottom: 60 }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg,#2e7d32 0%,#43a047 100%)', color: '#fff', textAlign: 'center', padding: isMobile ? '40px 20px 32px' : '60px 24px 48px' }}>
        <h1 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, margin: '0 0 12px', letterSpacing: '-0.5px' }}>Hướng Dẫn &amp; Kiến Thức</h1>
        <p style={{ fontSize: isMobile ? 14 : 16, opacity: 0.88, margin: 0, maxWidth: 560, marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.6 }}>Khám phá cách xông thảo mộc đúng cách, lợi ích sức khỏe và những bí quyết từ thiên nhiên</p>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '24px 16px' : '40px 24px' }}>
        {/* Tag Filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32, justifyContent: isMobile ? 'flex-start' : 'center' }}>
          {tags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)} style={{
              padding: '8px 18px', borderRadius: 999, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
              background: activeTag === tag ? '#2e7d32' : '#fff',
              color: activeTag === tag ? '#fff' : '#555',
              borderColor: activeTag === tag ? '#2e7d32' : '#ddd',
            }}>{tag}</button>
          ))}
        </div>

        {/* Articles Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
          {filtered.slice(0, 6).map(post => (
            <article key={post.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform .2s, box-shadow .2s', cursor: 'pointer' }}
              onClick={() => { if (post.url) window.location.href = post.url; else setPage({ name: 'blog-post', slug: post.slug }); }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <ImgPlaceholder
                label={`blog — ${post.title}`}
                bg="#e8ede7"
                aspectRatio="1 / 1"
                src={getBlogImage(post.slug)}
                style={{ width: '100%' }}
              />
              <div style={{ padding: '18px 20px 22px' }}>
                <div style={{ marginBottom: 10 }}>
                  <span style={{ background: tagColor(post.tag) + '18', color: tagColor(post.tag), fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{post.tag}</span>
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px', lineHeight: 1.45 }}>{post.title}</h2>
                <p style={{ fontSize: 13, color: '#777', lineHeight: 1.6, margin: '0 0 16px' }}>{post.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: '#aaa' }}>
                  <span>📅 {post.date}</span>
                  <span>⏱ {post.readTime}</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa', fontSize: 15 }}>Không có bài viết nào trong danh mục này</div>
        )}

        {/* CTA */}
        <div style={{ marginTop: 48, background: 'linear-gradient(135deg,#f1f8e9,#e8f5e9)', borderRadius: 20, padding: isMobile ? '28px 20px' : '36px 40px', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🌿</div>
          <h3 style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: '#2e7d32', margin: '0 0 10px' }}>Muốn thử ngay hôm nay?</h3>
          <p style={{ fontSize: 14, color: '#555', margin: '0 0 20px', lineHeight: 1.6 }}>Khám phá bộ sản phẩm xông thảo mộc tự nhiên, được tuyển chọn kỹ lưỡng từ thiên nhiên Việt Nam</p>
          <button onClick={() => setPage({ name: 'home' })} style={{ background: '#2e7d32', color: '#fff', border: 'none', padding: '13px 32px', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
            Xem Sản Phẩm →
          </button>
        </div>
      </div>
    </div>
  );
};

const BlogPostPage = ({ slug, setPage, goBack }) => {
  const isMobile = useIsMobile();
  const post = BLOG_POSTS.find(item => item.slug === slug) || BLOG_POSTS[0];
  const article = BLOG_ARTICLES[post.slug] || {
    intro: post.excerpt,
    paragraphs: ['Nội dung bài viết đang được cập nhật thêm để mang lại trải nghiệm đọc đầy đủ và hữu ích hơn cho khách truy cập.'],
  };
  const relatedPosts = BLOG_POSTS.filter(item => item.slug !== post.slug && item.tag === post.tag).slice(0, 3);
  const articleSearchText = normalizeSearchText(`${post.title} ${post.excerpt} ${post.slug} ${post.tag} ${article.intro}`);
  const ctaTarget = (() => {
    if (articleSearchText.includes('combo')) return { cat: 'combo', label: 'Combo Xông Nhà' };
    if (articleSearchText.includes('bep xong')) return { cat: 'combo', label: 'Combo Xông Nhà' };
    if (articleSearchText.includes('nen')) return { cat: 'nen-thom', label: 'Nến Xông' };
    if (articleSearchText.includes('thao moc')) return { cat: 'thao-moc-xong', label: 'Thảo Mộc Xông' };
    if (articleSearchText.includes('den xong tinh dau') || articleSearchText.includes('tinh dau')) return { cat: 'bep-xong', label: 'Đèn Xông Tinh Dầu' };
    return { cat: 'combo', label: 'Combo Xông Nhà' };
  })();
  const renderArticleBlocks = () => {
    if (article.sections) {
      return article.sections.map((block, index) => {
        if (block.type === 'h2') {
          return <h2 key={index} style={{ fontSize: isMobile ? 22 : 28, lineHeight: 1.35, color: '#1f2f21', margin: '32px 0 14px', fontWeight: 900 }}>{block.text}</h2>;
        }
        if (block.type === 'h3') {
          return <h3 key={index} style={{ fontSize: isMobile ? 18 : 21, lineHeight: 1.45, color: '#253c28', margin: '24px 0 10px', fontWeight: 800 }}>{block.text}</h3>;
        }
        if (block.type === 'image') {
          return (
            <figure key={index} style={{ margin: '28px 0', borderRadius: 18, overflow: 'hidden', background: '#f7faf6', boxShadow: '0 10px 28px rgba(28,43,28,0.08)' }}>
              <img src={block.src} alt={block.alt} loading="lazy" style={{ display: 'block', width: '100%', height: 'auto' }} />
              {block.caption ? <figcaption style={{ fontSize: 12, lineHeight: 1.6, color: '#7a8a78', padding: '12px 16px' }}>{block.caption}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === 'list') {
          return (
            <ul key={index} style={{ paddingLeft: 20, margin: '0 0 18px' }}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex} style={{ fontSize: 15, lineHeight: 1.9, color: '#5a665a', marginBottom: 8 }}>{item}</li>
              ))}
            </ul>
          );
        }
        return <p key={index} style={{ fontSize: 15, lineHeight: 1.9, color: '#5a665a', margin: '0 0 18px' }}>{block.text}</p>;
      });
    }

    return article.paragraphs.map((paragraph, index) => (
      <p key={index} style={{ fontSize: 15, lineHeight: 1.9, color: '#5a665a', margin: '0 0 18px' }}>
        {paragraph}
      </p>
    ));
  };

  return (
    <div style={{ background: '#f8faf7', minHeight: '80vh', paddingBottom: 72 }}>
      <div style={{ maxWidth: 940, margin: '0 auto', padding: isMobile ? '22px 16px 0' : '36px 24px 0' }}>
        <button
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid #dbe7d8', color: '#2e7d32', padding: '10px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer', marginBottom: 18 }}
          onClick={() => goBack ? goBack({ name: 'blog' }) : setPage({ name: 'blog' })}
        >
          ← Quay lại danh sách bài viết
        </button>

        <article style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 35px rgba(28,43,28,0.08)' }}>
          <ImgPlaceholder
            label={`blog cover — ${post.title}`}
            bg="#eef3ea"
            aspectRatio="1 / 1"
            src={getBlogImage(post.slug)}
            style={{ width: '100%' }}
          />
          <div style={{ background: 'linear-gradient(135deg,#2e7d32,#5aa95d)', color: '#fff', padding: isMobile ? '28px 20px' : '42px 46px' }}>
            <div style={{ display: 'inline-flex', padding: '6px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.16)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 16 }}>
              {post.tag}
            </div>
            <h1 style={{ fontSize: isMobile ? 26 : 40, lineHeight: 1.2, margin: '0 0 14px', fontWeight: 900, letterSpacing: '-0.03em' }}>{post.title}</h1>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 13, opacity: 0.92 }}>
              <span>📅 {post.date}</span>
              <span>⏱ {post.readTime}</span>
            </div>
          </div>

          <div style={{ padding: isMobile ? '24px 20px 28px' : '34px 46px 40px' }}>
            <p style={{ fontSize: isMobile ? 16 : 18, lineHeight: 1.85, color: '#36523a', margin: '0 0 22px', fontWeight: 500 }}>{article.intro}</p>

            {renderArticleBlocks()}

            <div style={{ background: '#f7faf6', border: '1px solid #eef3ed', borderRadius: 12, padding: isMobile ? '32px 18px' : '40px 24px', margin: '48px 0 0', textAlign: 'center' }}>
              <h3 style={{ fontSize: isMobile ? 24 : 32, lineHeight: 1.25, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px' }}>Mua {ctaTarget.label} Chính Hãng tại Nến Phương Lâm</h3>
              <p style={{ fontSize: isMobile ? 15 : 18, color: '#666', margin: '0 0 24px', lineHeight: 1.6 }}>Giao hàng toàn quốc · Kiểm tra trước khi nhận · 100% thảo mộc & nến tự nhiên</p>
              <a
                href={categoryUrl(ctaTarget.cat)}
                style={{ display: 'block', width: '100%', maxWidth: 400, margin: '0 auto 20px', background: 'linear-gradient(180deg,#ffffff,#f4fbf2)', color: '#318223', border: '2px solid #318223', padding: '16px 32px', borderRadius: 10, fontSize: isMobile ? 16 : 18, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.03em', boxShadow: '0 10px 0 #1f6819, 0 18px 32px rgba(49,130,35,.22)', transition: 'all .2s', boxSizing: 'border-box', textDecoration: 'none' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 13px 0 #1f6819, 0 24px 38px rgba(49,130,35,.26)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 0 #1f6819, 0 18px 32px rgba(49,130,35,.22)'; }}
              >
                Xem ngay {ctaTarget.label} →
              </a>
              <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap', marginTop: 16 }}>
                <span style={{ fontSize: isMobile ? 14 : 16, color: '#444', fontWeight: 500 }}>💬 Zalo: 077 3829 593</span>
                <span style={{ fontSize: isMobile ? 14 : 16, color: '#444', fontWeight: 500 }}>📞 Hotline: 077 3829 593</span>
              </div>
            </div>
          </div>
        </article>

        {relatedPosts.length > 0 && (
          <section style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: isMobile ? 20 : 24, color: '#1f2f21', margin: '0 0 16px', fontWeight: 800 }}>Bài viết liên quan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 18 }}>
              {relatedPosts.map(item => (
                <div
                  key={item.slug}
                  onClick={() => { if (item.url) window.location.href = item.url; else setPage({ name: 'blog-post', slug: item.slug }); }}
                  style={{ background: '#fff', borderRadius: 18, padding: '18px 18px 20px', boxShadow: '0 6px 18px rgba(0,0,0,0.05)', cursor: 'pointer', transition: 'transform .2s, box-shadow .2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(0,0,0,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(0,0,0,0.05)'; }}
                >
                  <div style={{ fontSize: 12, color: '#2e7d32', fontWeight: 700, marginBottom: 8 }}>{item.tag}</div>
                  <div style={{ fontSize: 15, color: '#1a1a1a', fontWeight: 700, lineHeight: 1.5, marginBottom: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: '#788478', lineHeight: 1.65 }}>{item.excerpt}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "primaryColor": "#318223",
  "fontScale": 100,
  "borderRadius": 10
}/*EDITMODE-END*/;

// Baked-in data (replaced by export function — do not edit manually)
const BAKED_PRODUCTS = /*BAKED_PRODUCTS*/[]/*END_BAKED_PRODUCTS*/;
const BAKED_IMAGES = /*BAKED_IMAGES*/{"1":["/assets/media/generated/embedded-016.webp","/assets/media/generated/embedded-017.jpg","/assets/media/generated/embedded-018.webp","/assets/media/generated/embedded-019.jpg"],"2":["/assets/media/generated/embedded-020.webp"],"7":["/assets/media/generated/embedded-021.jpg"],"new_1776824123777":["/assets/media/generated/embedded-022.jpg"],"new_1776857397825":["/assets/media/generated/embedded-023.jpg"],"new_1776857467847":["/assets/media/generated/embedded-024.jpg","/assets/media/generated/embedded-025.jpg"]}/*END_BAKED_IMAGES*/;
const BAKED_CATEGORY_IMAGES = /*BAKED_CATEGORY_IMAGES*/{"nen-thom":"/assets/media/generated/embedded-018.jpg","combo":"/assets/media/generated/embedded-026.jpg","thao-moc-xong":"/assets/media/generated/embedded-027.jpg","bep-xong":"/assets/media/generated/embedded-028.jpg","nu-tram":"/assets/media/generated/embedded-029.jpg","nen-tru":"/assets/products/uploads/1777285327929-nen-tru.webp","phu-kien":"/assets/products/uploads/1777455666776-chatgpt-image-16-31-00-29-thg-4-2026-trung-binh.webp","nen-ly":"/assets/products/uploads/1777539330674-nen-ly-no-dai.webp"}/*END_BAKED_CATEGORY_IMAGES*/;
const BAKED_FEATURED = /*BAKED_FEATURED*/["1","shopee_55553449576","shopee_22353875434","shopee_29011454025","7","shopee_22080262041","shopee_57058955812","shopee_40170692234","shopee_54450013830"]/*END_BAKED_FEATURED*/;
const BAKED_EXTRA = /*BAKED_EXTRA*/[]/*END_BAKED_EXTRA*/;

const EXPORT_FILE_NAME = 'index.html';
const IS_PREVIEW_REFRESH = new URLSearchParams(window.location.search).has('preview');
if (IS_PREVIEW_REFRESH) {
  ['phuonglam-page', 'phuonglam-products', 'phuonglam-new-products', 'herbly-page', 'herbly-products', 'herbly-new-products'].forEach(key => localStorage.removeItem(key));
}

const serializeForInlineScript = (value) =>
  JSON.stringify(value)
    .replace(/<\/script/gi, '<\\/script')
    .replace(/<!--/g, '<\\!--');

const exportSyncedWebsiteSnapshot = async () => {
  const response = await fetch(window.location.href);
  const sourceHtml = await response.text();

  const bakedProducts = Array.isArray(window.PRODUCTS_LIVE) ? window.PRODUCTS_LIVE : PRODUCTS;
  const bakedImages = (() => {
    try { return JSON.parse(localStorage.getItem('phuonglam-images') || '{}'); } catch { return {}; }
  })();
  const bakedCategoryImages = (() => {
    try { return JSON.parse(localStorage.getItem('phuonglam-category-images') || '{}'); } catch { return {}; }
  })();
  const bakedHeaderImages = (() => {
    try {
      const value = localStorage.getItem('phuonglam-header-images');
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  })();
  const bakedFeatured = (() => {
    try {
      const value = localStorage.getItem('phuonglam-featured');
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  })();

  let out = sourceHtml;
  out = out.replace(/\/\*BAKED_PRODUCTS\*\/[\s\S]*?\/\*END_BAKED_PRODUCTS\*\//, `/*BAKED_PRODUCTS*/${serializeForInlineScript(bakedProducts)}/*END_BAKED_PRODUCTS*/`);
  out = out.replace(/\/\*BAKED_IMAGES\*\/[\s\S]*?\/\*END_BAKED_IMAGES\*\//, `/*BAKED_IMAGES*/${serializeForInlineScript(bakedImages)}/*END_BAKED_IMAGES*/`);
  out = out.replace(/\/\*BAKED_CATEGORY_IMAGES\*\/[\s\S]*?\/\*END_BAKED_CATEGORY_IMAGES\*\//, `/*BAKED_CATEGORY_IMAGES*/${serializeForInlineScript(bakedCategoryImages)}/*END_BAKED_CATEGORY_IMAGES*/`);
  out = out.replace(/\/\*BAKED_HEADER_IMAGES\*\/[\s\S]*?\/\*END_BAKED_HEADER_IMAGES\*\//, `/*BAKED_HEADER_IMAGES*/${serializeForInlineScript(bakedHeaderImages)}/*END_BAKED_HEADER_IMAGES*/`);
  out = out.replace(/\/\*BAKED_FEATURED\*\/[\s\S]*?\/\*END_BAKED_FEATURED\*\//, `/*BAKED_FEATURED*/${serializeForInlineScript(bakedFeatured)}/*END_BAKED_FEATURED*/`);
  out = out.replace(/\/\*BAKED_EXTRA\*\/[\s\S]*?\/\*END_BAKED_EXTRA\*\//, `/*BAKED_EXTRA*/[]/*END_BAKED_EXTRA*/`);

  const blob = new Blob([out], { type: 'text/html;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = EXPORT_FILE_NAME;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
};

const App = () => {
  const [page, setPage] = React.useState(() => {
    try {
      if (IS_PREVIEW_REFRESH) return { name: 'home' };
      if (queryFlag('cart')) return { name: 'cart' };
      if (queryFlag('search')) return { name: 'home' };
      if (window.history.state?.page) return window.history.state.page;
      return JSON.parse(localStorage.getItem('phuonglam-page')) || { name: 'home' };
    } catch {
      return { name: 'home' };
    }
  });
  const [cart, setCart] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('phuonglam-cart')) || []; } catch { return []; }
  });
  const [productImages, setProductImages] = React.useState(() => {
    if (Object.keys(BAKED_IMAGES).length > 0) return BAKED_IMAGES;
    try { return JSON.parse(localStorage.getItem('phuonglam-images')) || {}; } catch { return {}; }
  });
  const [categoryImages, setCategoryImages] = React.useState(() => {
    if (Object.keys(BAKED_CATEGORY_IMAGES).length > 0) return BAKED_CATEGORY_IMAGES;
    try { return JSON.parse(localStorage.getItem('phuonglam-category-images')) || {}; } catch { return {}; }
  });
  const [headerImages, setHeaderImages] = React.useState(() => {
    if (Array.isArray(BAKED_HEADER_IMAGES) && BAKED_HEADER_IMAGES.length > 0) return BAKED_HEADER_IMAGES;
    try {
      const value = localStorage.getItem('phuonglam-header-images');
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  });
  const [productOverrides, setProductOverrides] = React.useState(() => {
    if (BAKED_PRODUCTS.length > 0) return {}; // baked export uses BAKED_PRODUCTS directly
    try { return JSON.parse(localStorage.getItem('phuonglam-products')) || {}; } catch { return {}; }
  });
  const [featuredIds, setFeaturedIds] = React.useState(() => {
    if (BAKED_FEATURED !== null) return BAKED_FEATURED;
    try { const v = localStorage.getItem('phuonglam-featured'); return v ? JSON.parse(v) : null; } catch { return null; }
  });

  React.useEffect(() => {
    if (featuredIds !== null) safeSetLocalStorage('phuonglam-featured', JSON.stringify(featuredIds));
  }, [featuredIds]);

  const [extraProducts, setExtraProducts] = React.useState(() => {
    if (BAKED_PRODUCTS.length > 0) return BAKED_EXTRA;
    if (BAKED_EXTRA.length > 0) return BAKED_EXTRA;
    try { return JSON.parse(localStorage.getItem('phuonglam-new-products') || '[]'); } catch { return []; }
  });
  // Merge hardcoded PRODUCTS with any saved overrides
  const mergedProducts = (BAKED_PRODUCTS.length > 0 ? BAKED_PRODUCTS : PRODUCTS).map(p => productOverrides[p.id] ? { ...p, ...productOverrides[p.id] } : p);

  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-images', JSON.stringify(productImages));
  }, [productImages]);
  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-category-images', JSON.stringify(categoryImages));
  }, [categoryImages]);
  React.useEffect(() => {
    if (Array.isArray(headerImages)) {
      safeSetLocalStorage('phuonglam-header-images', JSON.stringify(headerImages));
    } else {
      localStorage.removeItem('phuonglam-header-images');
    }
  }, [headerImages]);
  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-products', JSON.stringify(productOverrides));
  }, [productOverrides]);

  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-page', JSON.stringify(page));
    try {
      window.history.replaceState({ ...(window.history.state || {}), page }, '', window.location.href);
    } catch {}
  }, [page]);

  React.useEffect(() => {
    safeSetLocalStorage('phuonglam-cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'phuonglam-cart') return;
      try {
        const nextCart = JSON.parse(event.newValue || '[]');
        setCart(Array.isArray(nextCart) ? nextCart : []);
      } catch {
        setCart([]);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addToCart = (product) => {
    setCart(prev => {
      const item = product.cartKey ? product : buildCartItem(product);
      const itemKey = getCartItemKey(item);
      const existing = prev.find(i => getCartItemKey(i) === itemKey);
      if (existing) return prev.map(i => getCartItemKey(i) === itemKey ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const isAdmin = page.name === 'admin';

  React.useEffect(() => {
    if (!window.history.state?.page) {
      try {
        window.history.replaceState({ page }, '', window.location.href);
      } catch {}
    }

    const handlePopState = (event) => {
      if (event.state?.page) {
        setPage(event.state.page);
        return;
      }
      try {
        setPage(JSON.parse(localStorage.getItem('phuonglam-page')) || { name: 'home' });
      } catch {
        setPage({ name: 'home' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateTo = (nextPage, options = {}) => {
    const { replace = false } = options;
    setPage(nextPage);
    try {
      const method = replace ? 'replaceState' : 'pushState';
      window.history[method]({ page: nextPage }, '', window.location.href);
    } catch {}
  };

  const goBack = (fallbackPage = { name: 'home' }) => {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    navigateTo(fallbackPage, { replace: true });
  };

  const effectiveProducts = [...mergedProducts, ...extraProducts];
  window.PRODUCTS_LIVE = effectiveProducts;

  const effectiveFeaturedIds = featuredIds;
  const effectiveHeaderImages = headerImages;
  const effectiveCategoryImages = categoryImages;

  // Apply overrides globally for child components
  React.useEffect(() => {
    window.PRODUCTS_LIVE = effectiveProducts;
  }, [effectiveProducts]);

  const renderPage = () => {
    switch (page.name) {
      case 'home':     return <HomePage setPage={navigateTo} addToCart={addToCart} productImages={productImages} featuredIds={effectiveFeaturedIds} categoryImages={effectiveCategoryImages} headerImages={effectiveHeaderImages} />;
      case 'category': return <CategoryPage cat={page.cat} setPage={navigateTo} addToCart={addToCart} productImages={productImages} />;
      case 'product':  return <ProductPage productId={page.id} setPage={navigateTo} goBack={goBack} addToCart={addToCart} productImages={productImages} />;
      case 'cart':     return <CartPage cart={cart} setCart={setCart} setPage={navigateTo} productImages={productImages} />;
      case 'checkout': return <CheckoutPage cart={cart} setCart={setCart} setPage={navigateTo} />;
      case 'admin':    return <AdminPage setPage={navigateTo} productImages={productImages} setProductImages={setProductImages} productOverrides={productOverrides} setProductOverrides={setProductOverrides} featuredIds={featuredIds} setFeaturedIds={setFeaturedIds} setExtraProducts={setExtraProducts} categoryImages={categoryImages} setCategoryImages={setCategoryImages} headerImages={headerImages} setHeaderImages={setHeaderImages} />;
      case 'blog':     return <BlogPage setPage={navigateTo} />;
      case 'blog-post': return <BlogPostPage slug={page.slug} setPage={navigateTo} goBack={goBack} />;
      default:         return <HomePage setPage={navigateTo} addToCart={addToCart} productImages={productImages} featuredIds={effectiveFeaturedIds} categoryImages={effectiveCategoryImages} headerImages={effectiveHeaderImages} />;
    }
  };

  return (
    <div>
      {!isAdmin && <Header page={page} setPage={navigateTo} cartCount={cartCount} />}
      {isAdmin && (
        <div style={{ background: '#f7faf6', borderBottom: '1px solid #eef3ed', padding: '0 24px', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#318223', fontSize: 18 }}>●</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a' }}>Phương Lâm Admin</span>
          </div>
          <span style={{ fontSize: 12, color: '#aaa' }}>Trang quản trị nội bộ</span>
        </div>
      )}
      <main>{renderPage()}</main>
      {!isAdmin && <Footer setPage={navigateTo} />}
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

const tweaksPanel = document.getElementById('tweaks-panel');
window.addEventListener('message', e => {
  if (e.data?.type === '__activate_edit_mode') tweaksPanel.classList.add('visible');
  if (e.data?.type === '__deactivate_edit_mode') tweaksPanel.classList.remove('visible');
});
window.parent.postMessage({ type: '__edit_mode_available' }, '*');

function applyTweak(key, value) {
  window.parent.postMessage({ type: '__edit_mode_set_keys', edits: { [key]: value } }, '*');
}
