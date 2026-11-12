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
const BAKED_HEADER_IMAGES = /*BAKED_HEADER_IMAGES*/["/assets/media/generated/embedded-002.jpg","/assets/media/generated/embedded-004.jpg","/assets/products/uploads/1791536192124-image.webp","/assets/products/uploads/1784088181930-bo-xong-10cm.webp","/assets/products/uploads/1784088155555-chatgpt-image-20-39-29-29-thg-4-2026.webp","/assets/products/uploads/1791536195520-chatgpt-image-18-52-30-10-thg-8-2026.webp"]/*END_BAKED_HEADER_IMAGES*/;

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

const SHIPPING_PROMO_DISMISS_KEY = 'phuonglam-shipping-promo-dismissed-at';
const SHIPPING_PROMO_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
const SHIPPING_PROMO_IMAGE = '/assets/media/generated/shipping-promo-popup-v1.webp';

const ShippingPromotion = ({ setPage }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [ctaHovered, setCtaHovered] = React.useState(false);
  const isMobile = useIsMobile();
  React.useEffect(() => {
    const image = new Image();
    image.src = SHIPPING_PROMO_IMAGE;
  }, []);

  React.useEffect(() => {
    let dismissedAt = 0;
    try {
      dismissedAt = Number(localStorage.getItem(SHIPPING_PROMO_DISMISS_KEY)) || 0;
    } catch {}
    if (Date.now() - dismissedAt < SHIPPING_PROMO_COOLDOWN_MS) return;
    const timer = window.setTimeout(() => setIsOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    if (!isOpen) return;
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    return () => document.removeEventListener('keydown', closeOnEscape);
  }, [isOpen]);

  const close = () => {
    safeSetLocalStorage(SHIPPING_PROMO_DISMISS_KEY, String(Date.now()));
    setIsOpen(false);
  };

  const shopNow = () => {
    close();
    setPage({ name: 'home' });
    window.setTimeout(() => {
      document.getElementById('san-pham-ban-chay')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  return (
    <>
      <div style={shippingPromoStyles.bar} role="status">
        <span aria-hidden="true" style={shippingPromoStyles.barIcon}>🚚</span>
        <span><strong>Ưu đãi phí giao toàn quốc</strong> <span style={shippingPromoStyles.barDivider}>·</span> Giá website tốt hơn giá sàn</span>
      </div>
      {isOpen && (
        <div className="shipping-promo-overlay" style={shippingPromoStyles.overlay} onMouseDown={close} role="presentation">
          <section
            className="shipping-promo-modal"
            aria-labelledby="shipping-promo-title"
            aria-modal="true"
            role="dialog"
            style={{
              ...shippingPromoStyles.modal,
              width: isMobile ? 'calc(100vw - 32px)' : '100%',
              minHeight: isMobile ? 0 : 370,
              maxHeight: isMobile ? 'calc(100dvh - 112px)' : undefined,
            }}
            onMouseDown={event => event.stopPropagation()}
          >
            <img className="shipping-promo-image" src={SHIPPING_PROMO_IMAGE} alt="" loading="eager" fetchPriority="high" decoding="async" style={{ ...shippingPromoStyles.image, ...(isMobile ? shippingPromoStyles.imageMobile : {}) }} />
            <span className="shipping-promo-smoke shipping-promo-smoke-one" aria-hidden="true"></span>
            <span className="shipping-promo-smoke shipping-promo-smoke-two" aria-hidden="true"></span>
            <span className="shipping-promo-candle-glow" aria-hidden="true"></span>
            <div className="shipping-promo-content" style={{ ...shippingPromoStyles.content, maxWidth: isMobile ? '100%' : '62%', ...(isMobile ? shippingPromoStyles.contentMobile : {}) }}>
              <span className="shipping-promo-eyebrow" style={shippingPromoStyles.eyebrow}>ƯU ĐÃI TOÀN QUỐC</span>
              <h2 className="shipping-promo-title" id="shipping-promo-title" style={{ ...shippingPromoStyles.title, fontSize: isMobile ? 27 : 38 }}>Ưu đãi giao thường,<br />giá web tốt hơn sàn</h2>
              <div className="shipping-promo-highlight" style={shippingPromoStyles.highlight}>
                <span style={shippingPromoStyles.highlightLabel}>VẬN CHUYỂN</span>
                <strong>Freeship toàn quốc đơn từ {SHIPPING_RULES.smallOrderThreshold.toLocaleString('vi-VN')}đ</strong>
                <strong>Giao hỏa tốc trong vòng 1 giờ tại nội thành TP.HCM</strong>
              </div>
              <div className="shipping-promo-price-compare" style={{ ...shippingPromoStyles.priceCompare, ...(isMobile ? shippingPromoStyles.priceCompareMobile : {}) }}>
                <div style={shippingPromoStyles.priceRow}>
                  <span>Giá sàn sau mã</span>
                  <strong style={shippingPromoStyles.marketPrice}>250.000đ</strong>
                </div>
                <div style={shippingPromoStyles.priceRow}>
                  <span>Giá website chỉ còn</span>
                  <strong style={shippingPromoStyles.websitePrice}>200.000đ</strong>
                </div>
                <div className="shipping-promo-saving" style={shippingPromoStyles.saving}>Tiết kiệm 50.000đ</div>
              </div>
              <button
                className="shipping-promo-cta"
                type="button"
                style={{ ...shippingPromoStyles.cta, ...(isMobile ? shippingPromoStyles.ctaMobile : {}), ...(ctaHovered ? shippingPromoStyles.ctaHover : {}) }}
                onClick={shopNow}
                onMouseEnter={() => setCtaHovered(true)}
                onMouseLeave={() => setCtaHovered(false)}
                onFocus={() => setCtaHovered(true)}
                onBlur={() => setCtaHovered(false)}
              ><span className="shipping-promo-cta-label">Mua ngay – nhận ưu đãi</span> <span className="shipping-promo-cta-arrow" aria-hidden="true">→</span></button>
              <p className="shipping-promo-note" style={{ ...shippingPromoStyles.note, ...(isMobile ? shippingPromoStyles.noteMobile : {}) }}>Mức giá thực tế áp dụng theo từng sản phẩm và phân loại.</p>
            </div>
            <button className="shipping-promo-close" type="button" aria-label="Đóng thông báo ưu đãi giao hàng" style={shippingPromoStyles.close} onClick={close}>×</button>
          </section>
        </div>
      )}
    </>
  );
};

const shippingPromoStyles = {
  bar: { minHeight: 34, background: '#285d20', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '6px 16px', textAlign: 'center', fontSize: 12, lineHeight: 1.4, position: 'relative', zIndex: 101 },
  barIcon: { fontSize: 15 },
  barDivider: { color: '#b9d6ae', padding: '0 5px' },
  overlay: { position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(18, 35, 15, .56)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 },
  modal: { width: '100%', maxWidth: 700, overflow: 'hidden', position: 'relative', display: 'flex', alignItems: 'stretch', borderRadius: 24, background: '#fff9ef', boxShadow: '0 28px 80px rgba(0, 0, 0, .28)', animation: 'shippingPromoModal .34s cubic-bezier(.2,.8,.2,1) both' },
  image: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'right center', pointerEvents: 'none' },
  imageMobile: { objectPosition: 'right bottom', opacity: .19 },
  content: { position: 'relative', zIndex: 1, padding: '42px 34px 30px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: 'linear-gradient(90deg, #fff9ef 0%, #fff9ef 64%, rgba(255,249,239,.78) 78%, rgba(255,249,239,0) 100%)' },
  contentMobile: { padding: '28px 22px 20px', background: 'rgba(255,249,239,.91)' },
  eyebrow: { display: 'inline-block', background: '#e8f2e2', color: '#285d20', borderRadius: 999, padding: '6px 11px', fontSize: 11, lineHeight: 1, fontWeight: 900, letterSpacing: '.08em' },
  title: { margin: '13px 0 14px', color: '#194713', fontWeight: 900, lineHeight: 1.05, letterSpacing: '-.045em' },
  highlight: { display: 'flex', flexDirection: 'column', gap: 3, padding: '10px 13px', borderRadius: 12, background: '#285d20', color: '#fff', boxShadow: '0 10px 22px rgba(40, 93, 32, .18)' },
  highlightLabel: { fontSize: 10, fontWeight: 900, letterSpacing: '.06em', color: '#d7f0cb' },
  priceCompare: { width: '100%', maxWidth: 330, margin: '13px 0 17px', padding: '10px 13px', borderRadius: 12, background: 'rgba(255,255,255,.72)', border: '1px solid #e7d9c2', boxSizing: 'border-box' },
  priceCompareMobile: { margin: '12px 0 15px', padding: '9px 11px' },
  priceRow: { display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, color: '#5a564e', fontSize: 13, lineHeight: 1.55 },
  marketPrice: { color: '#77736b', textDecoration: 'line-through', fontWeight: 700, whiteSpace: 'nowrap' },
  websitePrice: { color: '#285d20', fontSize: 18, fontWeight: 900, whiteSpace: 'nowrap' },
  saving: { marginTop: 6, color: '#d9682c', fontSize: 14, fontWeight: 900 },
  cta: { border: 'none', borderRadius: 11, padding: '13px 17px', background: '#d9682c', color: '#fff', fontSize: 14, fontWeight: 900, cursor: 'pointer', boxShadow: '0 5px 0 #a9441d, 0 12px 22px rgba(217, 104, 44, .22)', textTransform: 'uppercase', transition: 'transform .18s ease, background .18s ease, box-shadow .18s ease' },
  ctaMobile: { width: '100%', padding: '13px 12px', fontSize: 14, textAlign: 'center' },
  ctaHover: { transform: 'translateY(-3px)', background: '#e97838', boxShadow: '0 8px 0 #a9441d, 0 17px 26px rgba(217, 104, 44, .34)' },
  note: { margin: '12px 0 0', color: '#77736b', fontSize: 10.5, lineHeight: 1.4 },
  noteMobile: { marginTop: 11, fontSize: 10 },
  close: { position: 'absolute', zIndex: 2, top: 12, right: 12, width: 34, height: 34, border: '1px solid rgba(25, 71, 19, .12)', borderRadius: '50%', background: 'rgba(255,255,255,.85)', color: '#285d20', fontSize: 26, lineHeight: 1, cursor: 'pointer' },
};

const Header = ({ page, setPage, cartCount, setCartCount }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [hoveredNavLabel, setHoveredNavLabel] = React.useState(null);
  const isMobile = useIsMobile();

  const navLinks = [
    { label: 'Nến Tealight Xông', page: 'category', cat: 'nen-thom', href: categoryUrl('nen-thom') },
    { label: 'Combo Xông Nhà', page: 'category', cat: 'combo', href: categoryUrl('combo') },
    { label: 'Thảo Mộc Xông', page: 'category', cat: 'thao-moc-xong', href: categoryUrl('thao-moc-xong') },
    { label: 'Đèn Xông Tinh Dầu', page: 'category', cat: 'bep-xong', href: categoryUrl('bep-xong') },
    { label: 'Phụ Kiện Xông', page: 'category', cat: 'phu-kien', href: categoryUrl('phu-kien') },
    { label: 'Hướng Dẫn', page: 'blog' },
  ];

  const handleLogoClick = () => setPage({ name: 'home' });

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
              const isHovered = hoveredNavLabel === l.label;
              const style = {
                ...headerStyles.navLink,
                color: active || isHovered ? '#318223' : '#2d2d2d',
                fontWeight: active || isHovered ? '800' : '700',
                ...(isHovered ? headerStyles.navLinkHover : {}),
              };
              const hoverHandlers = {
                onMouseEnter: () => setHoveredNavLabel(l.label),
                onMouseLeave: () => setHoveredNavLabel(null),
                onFocus: () => setHoveredNavLabel(l.label),
                onBlur: () => setHoveredNavLabel(null),
              };
              return l.href ? (
                <a key={l.label} href={l.href} style={style} {...hoverHandlers}>{l.label}</a>
              ) : (
                <span key={l.label} style={style} {...hoverHandlers} onClick={() => setPage({ name: l.page })}>{l.label}</span>
              );
            })}
          </nav>
        )}

        {/* Actions */}
        <div style={headerStyles.actions}>
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
  navLink: { fontSize: 14.5, cursor: 'pointer', transition: 'transform .18s ease, color .18s ease, background .18s ease, box-shadow .18s ease', letterSpacing: '0em', whiteSpace: 'nowrap', textDecoration: 'none', padding: '7px 8px', borderRadius: 9, display: 'inline-block' },
  navLinkHover: { transform: 'translateY(-1px)', background: '#eef7ea', boxShadow: '0 4px 10px rgba(49, 130, 35, .12)' },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#444', display: 'flex', alignItems: 'center' },
  cartBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#444', display: 'flex', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 2, right: 2, background: '#318223', color: '#fff', fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  menuBtn: { display: 'none', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 8 },
  hamburger: { display: 'block', width: 20, height: 2, background: '#333', borderRadius: 2 },
  mobileMenu: { padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid #f0f0f0' },
  mobileLink: { padding: '10px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', color: '#333', textDecoration: 'none' },
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
        <img src={src} {...responsiveAttrs} alt={label} loading={imageLoading} fetchPriority={imageFetchPriority || undefined} decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => {
          const image = e.currentTarget;
          if (!image.dataset.originalFallback && image.getAttribute('srcset')) {
            image.dataset.originalFallback = 'true';
            image.removeAttribute('srcset');
            image.removeAttribute('sizes');
            image.src = image.getAttribute('src') || src;
            return;
          }
          image.style.display = 'none';
          image.parentNode.style.background = bg;
        }} />
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

const safeSetLocalStorage = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn('Không thể lưu dữ liệu vào trình duyệt:', key, error);
    return false;
  }
};


// Keys written by older versions of the storefront; nothing reads them any more.
['images', 'category-images', 'header-images', 'products', 'featured', 'new-products'].forEach((suffix) => {
  try { localStorage.removeItem(`phuonglam-${suffix}`); } catch {}
});

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

// Cart items live in localStorage and are sent with orders, so keep only what the cart,
// shipping rules and checkout read instead of the full product (descriptions run to KBs).
const cartProductFields = (product) => ({
  id: product.id,
  slug: product.slug,
  sku: product.sku,
  name: product.name,
  categoryId: product.categoryId,
  price: product.price,
  originalPrice: product.originalPrice,
  weight: product.weight,
  images: [getProductDisplayImage(product)].filter(Boolean),
});

const buildCartItem = (product, variant = null) => {
  const variants = normalizeProductVariants(product);
  const selectedVariant = variant || (variants.length ? variants.reduce((best, item) => item.price < best.price ? item : best, variants[0]) : null);
  if (!selectedVariant) return { ...cartProductFields(product), cartKey: String(product.id) };
  return {
    ...cartProductFields(product),
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

// A cart saved in the browser keeps the price from when each item was added. Refresh price
// and weight from the current catalog so checkout shows what the order Worker will charge.
const repriceCartItem = (item) => {
  const product = PRODUCTS.find(entry => String(entry.id) === String(item?.id));
  if (!product) return item;
  if (item.selectedVariant?.id) {
    const variant = normalizeProductVariants(product).find(entry => entry.id === item.selectedVariant.id);
    if (!variant) return item;
    return { ...item, price: variant.price, originalPrice: variant.originalPrice, weight: variant.weight || product.weight };
  }
  const price = Number(product.price) || 0;
  if (!price) return item;
  return { ...item, price, originalPrice: product.originalPrice ? Number(product.originalPrice) : null, weight: product.weight };
};
const repriceCart = (cart) => (Array.isArray(cart) ? cart.map(repriceCartItem) : []);

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

// Only reviews with a stated source count; template placeholders without one are ignored.
const REVIEW_SOURCES = ['Shopee', 'Zalo', 'Facebook', 'Google', 'Website'];
const getGenuineReviews = (product) => (Array.isArray(product?.reviews) ? product.reviews : []).map((review) => {
  if (!review || typeof review !== 'object') return null;
  const rating = Number(review.rating);
  const comment = String(review.comment ?? review.text ?? '').replace(/\s+/g, ' ').trim();
  const name = String(review.name || '').replace(/\s+/g, ' ').trim();
  const source = REVIEW_SOURCES.find((item) => item.toLowerCase() === String(review.source || '').trim().toLowerCase());
  if (!source || !name || comment.length < 5 || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  return { name, rating, comment, source, date: /^\d{4}-\d{2}-\d{2}$/.test(String(review.date || '')) ? String(review.date) : '' };
}).filter(Boolean);

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
            ? <img src={displayImage} {...responsiveAttrs} alt={product.name} loading={imagePriority ? 'eager' : 'lazy'} fetchPriority="auto" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
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
          {priceInfo.hasVariants && <span style={{ fontSize: 12, fontWeight: 600, color: '#657263' }}>Từ </span>}
          <span style={{ ...pcStyles.price, ...(compact ? pcStyles.priceCompact : {}) }}>{priceInfo.price.toLocaleString('vi-VN')}đ</span>
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
        {[
          { label: 'Chính sách đổi trả', href: '/chinh-sach-doi-tra/' },
          { label: 'Chính sách vận chuyển', href: '/chinh-sach-van-chuyen/' },
          { label: 'Liên hệ', href: '/lien-he/' },
        ].map(item => (
          <a key={item.label} href={item.href} style={footerStyles.link}>{item.label}</a>
        ))}
      </div>
      <div style={footerStyles.col}>
        <div style={footerStyles.colTitle}>Liên hệ</div>
        <div style={footerStyles.contact}>📍 Phường Tân Phú, TP. Hồ Chí Minh</div>
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




const BestsellerCarousel = ({ isMobile, children }) => {
  const items = React.Children.toArray(children);
  const trackRef = React.useRef(null);
  const pausedRef = React.useRef(false);
  const dragRef = React.useRef({ down: false, moved: false, startX: 0, startLeft: 0 });
  const [overflow, setOverflow] = React.useState(false);
  const gap = isMobile ? 12 : 14;
  const cardBasis = isMobile ? '150px' : `calc((100% - ${gap * 5}px) / 6)`;

  const step = React.useCallback((dir) => {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild;
    const cardStep = (first ? first.getBoundingClientRect().width : 150) + gap;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir > 0 && atEnd) el.scrollTo({ left: 0, behavior: 'smooth' });
    else el.scrollBy({ left: dir * cardStep * (isMobile ? 1 : 2), behavior: 'smooth' });
  }, [gap, isMobile]);

  React.useEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const check = () => setOverflow(el.scrollWidth > el.clientWidth + 4);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [items.length, isMobile]);

  React.useEffect(() => {
    if (!overflow) return undefined;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const t = setInterval(() => { if (!pausedRef.current) step(1); }, 3500);
    return () => clearInterval(t);
  }, [overflow, step]);

  const onMouseDown = (e) => {
    const el = trackRef.current;
    dragRef.current = { down: true, moved: false, startX: e.pageX, startLeft: el.scrollLeft };
    el.style.scrollSnapType = 'none';
    el.style.cursor = 'grabbing';
  };
  const onMouseMove = (e) => {
    const d = dragRef.current;
    if (!d.down) return;
    const dx = e.pageX - d.startX;
    if (Math.abs(dx) > 5) d.moved = true;
    trackRef.current.scrollLeft = d.startLeft - dx;
  };
  const endDrag = () => {
    const el = trackRef.current;
    if (!dragRef.current.down || !el) return;
    dragRef.current.down = false;
    el.style.scrollSnapType = 'x proximity';
    el.style.cursor = overflow ? 'grab' : 'default';
  };
  const swallowClickAfterDrag = (e) => {
    if (dragRef.current.moved) { e.preventDefault(); e.stopPropagation(); dragRef.current.moved = false; }
  };

  const arrowStyle = (side) => ({
    position: 'absolute', top: '38%', [side]: -18, width: 36, height: 36, borderRadius: '50%',
    border: '1px solid #dfe8dc', background: '#fff', color: '#318223', fontSize: 18, fontWeight: 700,
    cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
  });

  return (
    <div
      style={{ position: 'relative' }}
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; endDrag(); }}
      onTouchStart={() => { pausedRef.current = true; }}
      onTouchEnd={() => { setTimeout(() => { pausedRef.current = false; }, 4000); }}
    >
      <style>{'.bestseller-track::-webkit-scrollbar{display:none}'}</style>
      {overflow && !isMobile && (
        <button type="button" aria-label="Sản phẩm trước" style={arrowStyle('left')} onClick={() => step(-1)}>‹</button>
      )}
      <div
        ref={trackRef}
        className="bestseller-track"
        onMouseDown={isMobile ? undefined : onMouseDown}
        onMouseMove={isMobile ? undefined : onMouseMove}
        onMouseUp={isMobile ? undefined : endDrag}
        onClickCapture={swallowClickAfterDrag}
        onDragStart={(e) => e.preventDefault()}
        style={{
          display: 'flex', gap, overflowX: 'auto', scrollSnapType: 'x proximity', scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch', padding: '4px 2px 12px', alignItems: 'stretch',
          justifyContent: overflow ? 'flex-start' : 'center', cursor: overflow && !isMobile ? 'grab' : 'default',
        }}
      >
        {items.map((item, i) => (
          <div key={item.key || i} style={{ flex: `0 0 ${cardBasis}`, minWidth: 0, scrollSnapAlign: 'start', display: 'flex' }}>
            <div style={{ width: '100%' }}>{item}</div>
          </div>
        ))}
      </div>
      {overflow && !isMobile && (
        <button type="button" aria-label="Sản phẩm tiếp theo" style={arrowStyle('right')} onClick={() => step(1)}>›</button>
      )}
    </div>
  );
};

// "Từ …đ" on a category card is the cheapest visible product in it, so it cannot go stale.
const getCategoryFromLabel = (categoryId) => {
  const prices = getVisibleProducts(PRODUCTS)
    .filter(product => product.categoryId === categoryId)
    .map(product => getProductPriceInfo(product).price)
    .filter(price => price > 0);
  return prices.length ? `Từ ${Math.min(...prices).toLocaleString('vi-VN')}đ` : '';
};

const HomePage = ({ setPage, addToCart, productImages = {}, featuredIds = null, categoryImages = {}, headerImages = null }) => {
  const allVisibleProducts = getVisibleProducts(PRODUCTS);
  const bestsellers = (() => {
    const all = allVisibleProducts;
    if (featuredIds && featuredIds.length > 0) return featuredIds.map(id => all.find(p => String(p.id) === String(id))).filter(Boolean).slice(0, 12);
    return all.filter(p => p.tag === 'Bán chạy' || p.tag === 'Nổi bật').slice(0, 12);
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
    if (activeHeroImages.length < 2) return undefined;
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
      <section style={{ ...hpStyles.hero, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(280px, .9fr)', padding: isMobile ? '24px 18px 18px' : '44px', gap: isMobile ? 18 : 36, background: '#fbf8f0', borderRadius: isMobile ? 20 : 28, boxSizing: 'border-box', overflow: 'hidden' }}>
        <div style={{ ...hpStyles.heroContent, maxWidth: isMobile ? '100%' : 620, width: '100%' }}>
          <div style={{ ...hpStyles.heroBadge, fontSize: isMobile ? 11 : 13, padding: isMobile ? '6px 11px' : '7px 14px', marginBottom: isMobile ? 14 : 18 }}>Nến &amp; thảo mộc Phương Lâm</div>
          <h1 style={{ ...hpStyles.heroTitle, fontSize: isMobile ? 30 : 52, lineHeight: 1.12, marginBottom: isMobile ? 14 : 18, maxWidth: isMobile ? '100%' : 600, letterSpacing: '-1.5px' }}>
            Thắp chút ấm áp.<br /><span style={{ color: '#318223' }}>Ươm hương an yên.</span>
          </h1>
          <p style={{ ...hpStyles.heroSub, fontSize: isMobile ? 15 : 17, marginBottom: isMobile ? 18 : 24, maxWidth: isMobile ? '100%' : 540 }}>Từ ánh nến dịu ấm đến hương thảo mộc mộc mạc — cùng Phương Lâm chăm chút từng góc nhà. Khám phá nến tealight, nến ly, thảo mộc và bộ xông phù hợp với bạn.</p>
          <div style={{ ...hpStyles.heroBtns, flexDirection: isMobile ? 'column' : 'row' }}>
            <a href="#danh-muc-san-pham" style={{ ...hpStyles.heroCta, width: isMobile ? '100%' : 'auto', padding: isMobile ? '13px 18px' : '13px 24px', fontSize: 14 }}>Khám phá sản phẩm</a>
            <a href={categoryUrl('combo')} style={{ ...hpStyles.heroSecondary, width: isMobile ? '100%' : 'auto', padding: isMobile ? '13px 18px' : '13px 24px', fontSize: 14 }}>Xem bộ xông</a>
          </div>
        </div>
        <div style={{ ...hpStyles.heroImageFrame, width: '100%', maxWidth: 560, justifySelf: 'end', boxSizing: 'border-box', padding: isMobile ? 8 : 12, order: isMobile ? 2 : 0 }}>
          <div style={{ ...hpStyles.heroImage, overflow: 'hidden', borderRadius: isMobile ? 14 : 20, position: 'relative', width: '100%', aspectRatio: isMobile ? '16 / 10' : '1 / 1' }}>
            <div style={{ display: 'flex', width: `${activeHeroImages.length * 100}%`, transform: `translateX(-${slideIdx * (100 / activeHeroImages.length)}%)`, transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)', height: '100%' }}>
              {activeHeroImages.map((src, i) => (
                <img key={i} src={src} alt="Nến, bếp xông và thảo mộc Phương Lâm" loading={i === 0 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : 'auto'} decoding="async" style={{ display: 'block', width: `${100 / activeHeroImages.length}%`, height: '100%', objectFit: 'cover', flexShrink: 0 }} />
              ))}
            </div>
          </div>
          {activeHeroImages.length > 1 && (
            <div role="tablist" aria-label="Chọn ảnh header" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 12 }}>
              {activeHeroImages.map((_, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === slideIdx} aria-label={`Ảnh ${i + 1}`} onClick={() => setSlideIdx(i)} style={{ width: i === slideIdx ? 26 : 9, height: 9, borderRadius: 5, border: 'none', padding: 0, background: i === slideIdx ? '#318223' : '#c9d6c5', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section id="san-pham-ban-chay" style={{ ...hpStyles.section, background: '#fff', padding: isMobile ? '40px 0' : '56px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
          <div style={hpStyles.sectionHead}>
            <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32 }}>Sản phẩm bán chạy</h2>
            <p style={hpStyles.sectionSub}>Được khách hàng tin dùng và đánh giá cao nhất</p>
          </div>
          <BestsellerCarousel isMobile={isMobile}>
            {bestsellers.map((p, index) => (
              <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} productImages={productImages} imagePriority={index < 6} />
            ))}
          </BestsellerCarousel>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 28 }}>
            <a href="#danh-muc-san-pham" style={hpStyles.viewAllBtn}>Xem các danh mục →</a>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div style={{ ...hpStyles.trustBar, display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, minmax(0, 1fr))', gap: isMobile ? '12px 16px' : '0 28px', padding: isMobile ? '16px 20px' : '20px 24px', justifyItems: 'center', maxWidth: 1320, margin: '0 auto', boxSizing: 'border-box' }}>
        {[
          { icon: '🕯️', text: 'Nến & thảo mộc' },
          { icon: '🔥', text: 'Bếp xông & phụ kiện' },
          { icon: '🎁', text: 'Combo nhiều lựa chọn' },
          { icon: '📖', text: 'Bài viết hướng dẫn' },
        ].map(t => (
          <div key={t.text} style={hpStyles.trustItem}>
            <span style={hpStyles.trustIcon}>{t.icon}</span>
            <span style={{ ...hpStyles.trustText, fontSize: isMobile ? 12 : 13 }}>{t.text}</span>
          </div>
        ))}
      </div>

      {/* CATEGORIES */}
      <section id="danh-muc-san-pham" style={{ ...hpStyles.section, background: '#f7faf6', padding: isMobile ? '40px 16px' : '56px 24px', scrollMarginTop: 90 }}>
        <div style={hpStyles.sectionHead}>
          <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32 }}>Danh mục sản phẩm</h2>
          <p style={hpStyles.sectionSub}>Nến, bếp xông, thảo mộc và phụ kiện theo nhu cầu</p>
        </div>
        <div style={{ ...hpStyles.catGrid, gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(5, minmax(0, 1fr))', gap: isMobile ? 12 : 14 }}>
          {CATEGORIES.map(cat => (
            <a key={cat.id} href={categoryUrl(cat.id)} style={hpStyles.catCard}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ ...hpStyles.catImgWrap, padding: isMobile ? '6px 6px 0' : '10px 10px 0' }}>
                <ImgPlaceholder label={cat.name} bg="#f0f5ef" aspectRatio="1 / 1" style={{ borderRadius: 10, width: '100%' }} src={categoryImages[cat.id] || null} />
              </div>
              <div style={{ ...hpStyles.catInfo, padding: isMobile ? '7px 8px 8px' : '10px 12px 12px' }}>
                <div style={{ ...hpStyles.catName, fontSize: isMobile ? 15 : 17 }}>{cat.name}</div>
                <div style={{ ...hpStyles.catFrom, fontSize: isMobile ? 9 : 11 }}>{getCategoryFromLabel(cat.id)}</div>
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* COMBO */}
      <section style={{ ...hpStyles.section, padding: isMobile ? '24px 16px 40px' : '24px 24px 56px' }}>
        <div style={{ ...hpStyles.comboFeature, gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, .9fr) minmax(0, 1.1fr)', gap: isMobile ? 18 : 48, padding: isMobile ? 18 : 36 }}>
          <ImgPlaceholder label="Bộ xông nhà Phương Lâm" bg="#efe8d8" aspectRatio="1 / 1" src={categoryImages.combo || null} style={{ width: '100%', borderRadius: 16, overflow: 'hidden' }} />
          <div>
            <div style={{ ...hpStyles.heroBadge, marginBottom: 14 }}>Bộ xông nhà</div>
            <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 25 : 34, marginBottom: 12 }}>Bắt đầu với một bộ xông</h2>
            <p style={{ ...hpStyles.heroSub, fontSize: 15, maxWidth: 540, marginBottom: 20 }}>Khám phá các bộ xông và lựa chọn phân loại trên từng sản phẩm. Bạn có thể xem thông tin và giá hiện hành trước khi chọn.</p>
            <a href={categoryUrl('combo')} style={{ ...hpStyles.heroCta, padding: '12px 20px', fontSize: 14 }}>Khám phá các bộ xông</a>
          </div>
        </div>
      </section>

      {/* BLOG */}
      <section style={{ ...hpStyles.section, background: '#f7faf6', padding: isMobile ? '40px 0' : '64px 0' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
          <div style={hpStyles.sectionHead}>
            <h2 style={{ ...hpStyles.sectionTitle, fontSize: isMobile ? 24 : 32 }}>Bài viết mới nhất</h2>
            <p style={hpStyles.sectionSub}>Hướng dẫn chọn và sử dụng nến, thảo mộc xông nhà</p>
          </div>
          <div style={{ ...hpStyles.blogGrid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24 }}>
            {BLOG_POSTS.filter(post => post.url).slice(0, 3).map(post => (
              <a key={post.id} href={post.url || '#'}
                style={{ ...hpStyles.blogCard, display: 'block', textDecoration: 'none', color: 'inherit' }}
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
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
            <a href="/blog/" style={hpStyles.viewAllBtn}>Xem tất cả hướng dẫn →</a>
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
  heroImageFrame: { background: '#efe7d8', borderRadius: 24, padding: 12, boxShadow: '0 16px 38px rgba(70, 56, 35, 0.08)' },
  heroImage: { background: '#fff8ec' },
  comboFeature: { maxWidth: 1272, margin: '0 auto', display: 'grid', alignItems: 'center', background: '#fbf8f0', borderRadius: 24, boxSizing: 'border-box' },
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

  React.useEffect(() => { setActiveCat(cat); }, [cat]);

  const catInfo = CATEGORIES.find(c => c.id === activeCat) || CATEGORIES[0];
  const getComparablePrice = (product) => getProductPriceInfo(product).price;
  let products = getVisibleProducts(PRODUCTS).filter(p => p.categoryId === activeCat);
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
        <main style={cpStyles.main}>
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




const renderInlineMarkdown = (text) => String(text).split(/(\*\*[^*]+\*\*)/g).map((part, index) => (
  part.startsWith('**') && part.endsWith('**')
    ? <strong key={index}>{part.slice(2, -2)}</strong>
    : part
));

const renderStructuredText = (text) => {
  const lines = String(text || '').split(/\r?\n/);
  const content = [];
  let bullets = [];
  let numbered = [];
  let skippedTitle = false;
  const flushLists = () => {
    if (bullets.length) {
      content.push(<ul key={`ul-${content.length}`} style={ppStyles.structuredList}>{bullets.map((item, index) => <li key={index} style={ppStyles.structuredListItem}>{renderInlineMarkdown(item)}</li>)}</ul>);
      bullets = [];
    }
    if (numbered.length) {
      content.push(<ol key={`ol-${content.length}`} style={ppStyles.structuredList}>{numbered.map((item, index) => <li key={index} style={ppStyles.structuredListItem}>{renderInlineMarkdown(item)}</li>)}</ol>);
      numbered = [];
    }
  };
  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || /^-{3,}$/.test(line)) {
      flushLists();
      if (!line) content.push(<div key={`space-${index}`} style={ppStyles.structuredSpace} />);
      return;
    }
    const markdownHeading = line.match(/^#{1,6}\s+(.+)$/);
    if (markdownHeading || /^[✔✅📍]\s*/.test(line)) {
      flushLists();
      if (markdownHeading && markdownHeading[0].startsWith('# ') && !skippedTitle) { skippedTitle = true; return; }
      const heading = markdownHeading ? markdownHeading[1] : line;
      content.push(<h3 key={`heading-${index}`} style={ppStyles.structuredHeading}>{renderInlineMarkdown(heading)}</h3>);
      return;
    }
    if (line.startsWith('>')) {
      flushLists();
      content.push(<blockquote key={`quote-${index}`} style={ppStyles.structuredQuote}>{renderInlineMarkdown(line.replace(/^>\s?/, ''))}</blockquote>);
      return;
    }
    const bulletMatch = line.match(/^[-*•👉]\s+(.+)$/);
    const numberMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (bulletMatch) { if (numbered.length) flushLists(); bullets.push(bulletMatch[1]); return; }
    if (numberMatch) { if (bullets.length) flushLists(); numbered.push(numberMatch[1]); return; }
    flushLists();
    const isLegacyHeading = line.length <= 80 && (
      line === line.toUpperCase() ||
      /^(Tổng quan|Điểm nổi bật|Ứng dụng|Thông tin|Từ khóa|Hướng dẫn|Bảo quản|Cam kết|Lưu ý|Xuất xứ)/i.test(line)
    );
    const isStepHeading = /^\*\*Bước\s+\d+/i.test(line);
    content.push(isLegacyHeading || isStepHeading
      ? <h3 key={`heading-${index}`} style={ppStyles.structuredHeading}>{renderInlineMarkdown(line)}</h3>
      : <p key={`paragraph-${index}`} style={ppStyles.structuredParagraph}>{renderInlineMarkdown(line)}</p>);
  });
  flushLists();
  return <div style={ppStyles.structuredText}>{content}</div>;
};


const ProductPage = ({ productId, setPage, goBack, addToCart, productImages = {} }) => {
  const visibleProducts = getVisibleProducts(PRODUCTS);
  const product = visibleProducts.find(p => p.id === productId) || visibleProducts[0] || PRODUCTS[0];
  const reviews = getGenuineReviews(product);
  const reviewStars = (avg => Math.min(5, Math.floor(avg) + (avg - Math.floor(avg) >= 0.75 ? 1 : 0)))(reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0);
  const reviewAverage = reviews.length ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10 : 0;
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

  const handleBuyNow = (event) => {
    handleAddToCart(event);
    setPage({ name: 'checkout' });
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
    <div style={{ width: '100%', maxWidth: 1440, margin: '0 auto', padding: isMobile ? '16px 16px 104px' : '32px 24px', overflowX: 'hidden', boxSizing: 'border-box' }}>
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

          {reviews.length > 0 && (
            <div style={ppStyles.ratingRow}>
              <span style={{ color: '#f5a623', fontSize: 16 }}>{'★'.repeat(reviewStars)}{'☆'.repeat(5 - reviewStars)}</span>
              <span style={{ fontSize: 13, color: '#888', marginLeft: 8 }}>{String(reviewAverage).replace('.', ',')} · {reviews.length} đánh giá</span>
            </div>
          )}

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
                          aria-pressed={active}
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
                      aria-pressed={Boolean(active)}
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
            <button className="product-action-btn" style={ppStyles.buyNowBtn} onClick={handleBuyNow}>
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
                    <span style={{ fontSize: 12, color: '#999' }}>{[r.date ? r.date.split('-').reverse().join('/') : '', `Nguồn: ${r.source}`].filter(Boolean).join(' · ')}</span>
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
      {isMobile && (
        <div style={ppStyles.mobileBuyDock}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11, color: '#687564', lineHeight: 1.3 }}>Giá hiện tại</div>
            <strong style={{ color: '#318223', fontSize: 16, whiteSpace: 'nowrap' }}>{currentPrice.toLocaleString('vi-VN')}đ</strong>
          </div>
          <button className="product-action-btn" style={{ ...ppStyles.buyNowBtn, flex: '1 1 auto', padding: '12px 16px', margin: 0 }} onClick={handleBuyNow}>
            Mua ngay
          </button>
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
  mobileBuyDock: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 99, display: 'flex', alignItems: 'center', gap: 14, padding: '10px 16px calc(10px + env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #e8eee5', background: 'rgba(255,255,255,.97)', boxShadow: '0 -8px 24px rgba(20,45,18,.12)', boxSizing: 'border-box' },
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
  structuredQuote: { margin: '12px 0 18px', padding: '12px 16px', borderLeft: '3px solid #8ab77e', background: '#f7faf6', color: '#4c6248', borderRadius: '0 8px 8px 0' },
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
  const shippingInfo = calculateShipping(cart);
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
            {getFreeshipGap(subtotal) > 0
              ? `Mua thêm ${getFreeshipGap(subtotal).toLocaleString('vi-VN')}đ để được miễn phí giao hàng. `
              : 'Đơn của bạn được miễn phí giao thường. '}
            Phí cuối cùng cập nhật theo địa chỉ và hình thức giao ở bước đặt hàng.
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

const normalizeAddressText = (value) => (value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/[^a-z0-9]/g, '');

// Typed names that should resolve to a province in PROVINCE_OPTIONS.
const PROVINCE_ALIASES = {
  tphcm: 'TP.HCM', hcm: 'TP.HCM', hochiminh: 'TP.HCM', tphochiminh: 'TP.HCM', thanhphohochiminh: 'TP.HCM',
  hochiminhcity: 'TP.HCM', saigon: 'TP.HCM', sg: 'TP.HCM',
  hn: 'Hà Nội', tphanoi: 'Hà Nội', thanhphohanoi: 'Hà Nội',
  hue: 'Thừa Thiên Huế', tphue: 'Thừa Thiên Huế', thanhphohue: 'Thừa Thiên Huế',
  vungtau: 'Bà Rịa - Vũng Tàu', bariavungtau: 'Bà Rịa - Vũng Tàu', brvt: 'Bà Rịa - Vũng Tàu',
  tpdanang: 'Đà Nẵng', tpcantho: 'Cần Thơ', tphaiphong: 'Hải Phòng',
};

// Returns the canonical option for typed text (accents, spacing and "Tỉnh"/"TP" prefixes ignored), or ''.
const matchAddressOption = (value, options) => {
  const typed = normalizeAddressText(value);
  if (!typed) return '';
  const stripped = typed.replace(/^(tinh|thanhpho|tp|quan|huyen|thixa|phuong|xa|thitran)/, '');
  const exact = options.find(option => [typed, stripped].includes(normalizeAddressText(option))
    || [typed, stripped].includes(normalizeAddressText(option).replace(/^(quan|huyen|thanhpho|thixa|phuong|xa|thitran)/, '')));
  if (exact) return exact;
  const alias = PROVINCE_ALIASES[typed] || PROVINCE_ALIASES[stripped];
  return alias && options.includes(alias) ? alias : '';
};

// Accepts spaces, dots, dashes and +84/84 prefixes; returns a 0xxxxxxxxx number or the cleaned input.
const normalizePhone = (value) => {
  const digits = String(value || '').replace(/[^\d+]/g, '');
  if (/^\+?84\d{9}$/.test(digits)) return `0${digits.replace(/^\+?84/, '')}`;
  return digits.replace(/\+/g, '');
};

const CHECKOUT_PROFILE_KEY = 'phuonglam-checkout-profile';
const CHECKOUT_PROFILE_FIELDS = ['name', 'phone', 'city', 'district', 'ward', 'address'];

const loadCheckoutProfile = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CHECKOUT_PROFILE_KEY) || 'null');
    if (!saved || typeof saved !== 'object') return {};
    return Object.fromEntries(CHECKOUT_PROFILE_FIELDS.map(key => [key, typeof saved[key] === 'string' ? saved[key] : '']));
  } catch {
    return {};
  }
};

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

// Fee settings come from data/settings.json (`shipping`, edited in the admin); the build bakes them here.
const BAKED_SHIPPING = /*BAKED_SHIPPING*/{"hcmFreeWeight":5000,"otherFreeWeight":3000,"firstKgFee":16000,"extraKgFee":4000,"expressFee":15000,"defaultItemWeight":500,"smallOrderThreshold":150000,"smallOrderFee":20000}/*END_BAKED_SHIPPING*/;
const SHIPPING_RULES = {
  hcmFreeWeight: 5000,
  otherFreeWeight: 3000,
  firstKgFee: 16000,
  extraKgFee: 4000,
  expressFee: 15000,
  defaultItemWeight: 500,
  smallOrderThreshold: 150000,
  smallOrderFee: 20000,
  ...BAKED_SHIPPING,
};

// Item total still needed for free shipping (0 when the cart already qualifies).
const getFreeshipGap = (subtotal) => Math.max(0, SHIPPING_RULES.smallOrderThreshold - subtotal);
const SHIPPING_STEP_WEIGHT = 1000;

const getCartWeight = (cart) => cart.reduce((sum, item) => {
  const itemWeight = Number(item.weight) > 0 ? Number(item.weight) : SHIPPING_RULES.defaultItemWeight;
  return sum + itemWeight * item.qty;
}, 0);

// Free up to the area's weight limit; above it, the first started kg costs firstKgFee
// and every further started kg costs extraKgFee. Express adds a flat fee.
const calculateShipping = (cart, { city = '', deliveryMethod = 'standard' } = {}) => {
  if (!cart.length) return { fee: 0, weight: 0, baseShippingFee: 0, urgentShippingFee: 0, area: 'outside_hcm' };
  const weight = getCartWeight(cart);
  const area = isHoChiMinhCity(city) ? 'in_hcm' : 'outside_hcm';
  const freeWeightLimit = area === 'in_hcm' ? SHIPPING_RULES.hcmFreeWeight : SHIPPING_RULES.otherFreeWeight;
  const overweight = Math.max(0, weight - freeWeightLimit);
  const extraWeightAfterFirstKg = Math.max(0, overweight - SHIPPING_STEP_WEIGHT);
  const extraStepFee = overweight > 0
    ? Math.ceil(extraWeightAfterFirstKg / SHIPPING_STEP_WEIGHT) * SHIPPING_RULES.extraKgFee
    : 0;
  const weightFee = overweight > 0 ? SHIPPING_RULES.firstKgFee + extraStepFee : 0;
  // Below the item-total threshold a flat fee replaces free shipping (same rule as the order Worker).
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.qty) || 1), 0);
  const smallOrderFee = getFreeshipGap(subtotal) > 0 ? SHIPPING_RULES.smallOrderFee : 0;
  const baseShippingFee = weightFee + smallOrderFee;
  const urgentShippingFee = deliveryMethod === 'express' ? SHIPPING_RULES.expressFee : 0;
  return {
    fee: baseShippingFee + urgentShippingFee,
    smallOrderFee,
    weight,
    area,
    freeWeightLimit,
    overweight,
    extraStepFee,
    baseShippingFee,
    urgentShippingFee,
  };
};



const CHECKOUT_AUTOCOMPLETE = { name: 'name', phone: 'tel', address: 'street-address', note: 'off' };

const CheckoutField = ({ id, label, placeholder, form, setForm, errors, setErrors, type = 'text', multiline = false, onCommit }) => {
  const ref = React.useRef(null);
  React.useLayoutEffect(() => {
    if (ref.current && ref.current !== document.activeElement) {
      ref.current.value = form[id] || '';
    }
  });

  // Sync on every change, not only on blur, so browser autofill of unfocused fields is kept.
  const syncValue = (value) => {
    setForm(f => ({ ...f, [id]: value }));
    setErrors(er => ({ ...er, [id]: '' }));
  };
  const commitValue = (value) => {
    const next = onCommit ? onCommit(value) : value;
    if (ref.current && next !== value) ref.current.value = next;
    syncValue(next);
  };
  const inputProps = {
    ref,
    id: `checkout-${id}`,
    name: id,
    placeholder,
    autoComplete: CHECKOUT_AUTOCOMPLETE[id] || 'off',
    defaultValue: form[id] || '',
    onChange: e => syncValue(e.target.value),
    onBlur: e => commitValue(e.target.value),
  };

  return (
    <div style={coStyles.field}>
      <label style={coStyles.label} htmlFor={`checkout-${id}`}>{label}</label>
      {multiline
        ? <textarea
            {...inputProps}
            rows={2}
            style={{ ...coStyles.input, minHeight: 64, resize: 'vertical', borderColor: errors[id] ? '#e84848' : '#e8e8e8' }}
          />
        : <input
            {...inputProps}
            style={{ ...coStyles.input, borderColor: errors[id] ? '#e84848' : '#e8e8e8' }}
            type={type}
            inputMode={type === 'tel' ? 'tel' : undefined}
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

  // Typing updates the form immediately; dependants (district, ward) reset only when the committed value changes.
  const committed = React.useRef(form[id] || '');
  const syncValue = (value) => {
    setQuery(value);
    setForm(f => ({ ...f, [id]: value }));
    setErrors(er => ({ ...er, [id]: '' }));
    if (value === committed.current) return;
    committed.current = value;
    if (onValueChange) onValueChange(value);
  };
  const choose = (option) => {
    if (ref.current) ref.current.value = option;
    syncValue(option);
    setOpen(false);
  };

  return (
    <div style={coStyles.field}>
      <label style={coStyles.label} htmlFor={`checkout-${id}`}>{label}</label>
      <input
        ref={ref}
        id={`checkout-${id}`}
        name={id}
        style={{ ...coStyles.input, background: disabled ? '#f7f7f5' : '#fff', borderColor: errors[id] ? '#e84848' : '#e8e8e8', cursor: disabled ? 'not-allowed' : 'text' }}
        type="text"
        defaultValue={form[id] || ''}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="next"
        onFocus={() => setOpen(true)}
        onKeyDown={e => {
          if (e.key === 'Enter' && open && query.trim() && filteredOptions.length > 0) {
            e.preventDefault();
            choose(filteredOptions[0]);
          }
        }}
        onBlur={e => {
          // Snap "ha noi", "hcm", "q1"-style input to the listed spelling so region rules match.
          const typed = e.target.value.trim();
          const matched = matchAddressOption(typed, options);
          if (matched && ref.current) ref.current.value = matched;
          syncValue(matched || typed);
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
                choose(option);
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
  const [form, setForm] = React.useState(() => ({ name: '', phone: '', city: '', district: '', ward: '', address: '', note: '', ...loadCheckoutProfile() }));
  const [rememberProfile, setRememberProfile] = React.useState(true);
  const [deliveryMethod, setDeliveryMethod] = React.useState('standard');
  const [errors, setErrors] = React.useState({});
  const [orderSending, setOrderSending] = React.useState(false);
  const [orderError, setOrderError] = React.useState('');
  const [orderReceipt, setOrderReceipt] = React.useState(null);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasCandleCup = cart.some(item => item.categoryId === 'nen-ly');
  const isHcmAddress = isHoChiMinhCity(form.city);
  const canUseExpress = isHcmAddress;
  const selectedDeliveryMethod = deliveryMethod;
  const deliveryMethodLabel = selectedDeliveryMethod === 'express' ? 'Hỏa tốc' : 'Giao thường';
  const deliveryNote = selectedDeliveryMethod === 'express'
    ? 'Hỏa tốc: giao trong 1 giờ, áp dụng cho địa chỉ nội thành TP.HCM.'
    : getStandardDeliveryNote(form.city);
  const shippingInfo = calculateShipping(cart, {
    city: form.city,
    deliveryMethod: selectedDeliveryMethod,
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
    const phone = normalizePhone(form.phone);
    const city = matchAddressOption(form.city, PROVINCE_OPTIONS);
    if (!form.name.trim()) e.name = 'Vui lòng nhập họ tên';
    if (!/^0\d{9}$/.test(phone)) e.phone = 'Số điện thoại gồm 10 số, ví dụ 0901234567';
    if (!form.city.trim()) e.city = 'Vui lòng chọn tỉnh/thành phố';
    else if (!city) e.city = 'Chọn tỉnh/thành phố trong danh sách gợi ý';
    if (!form.ward.trim()) e.ward = 'Vui lòng nhập phường/xã';
    if (!form.address.trim()) e.address = 'Vui lòng nhập số nhà, tên đường';
    setForm(f => ({ ...f, phone: /^0\d{9}$/.test(phone) ? phone : f.phone, city: city || f.city }));
    setErrors(e);
    const firstError = ['name', 'phone', 'city', 'ward', 'address'].find(key => e[key]);
    if (firstError) {
      const field = document.getElementById(`checkout-${firstError}`);
      if (field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field.focus({ preventScroll: true });
      }
    }
    return Object.keys(e).length === 0;
  };

  const saveCheckoutProfile = () => {
    if (!rememberProfile) {
      try { localStorage.removeItem(CHECKOUT_PROFILE_KEY); } catch {}
      return;
    }
    const profile = Object.fromEntries(CHECKOUT_PROFILE_FIELDS.map(key => [key, String(form[key] || '').trim()]));
    safeSetLocalStorage(CHECKOUT_PROFILE_KEY, JSON.stringify(profile));
  };

  const handleSubmit = () => {
    setOrderError('');
    if (validate()) setStep(2);
  };

  const buildOrderPayload = () => ({
    customerName: form.name.trim(),
    phone: normalizePhone(form.phone),
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
      setOrderReceipt({
        reference: result.orderId || result.order?.id || result.id || '',
        items: cart.map(item => ({ ...item })),
        subtotal,
        shipping,
        total,
      });
      saveCheckoutProfile();
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
  const districtOptions = form.city ? Object.keys(OLD_ADDRESS_OPTIONS[form.city] || {}) : [];
  const wardOptions = form.city
    ? ((OLD_ADDRESS_OPTIONS[form.city] || {})[form.district] || [])
    : [];

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
      {orderReceipt && (
        <div style={{ textAlign: 'left', background: '#f7faf6', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
          {orderReceipt.reference && <div style={{ fontWeight: 700, color: '#318223', marginBottom: 12 }}>Mã đơn: {orderReceipt.reference}</div>}
          {orderReceipt.items.map(item => (
            <div key={getCartItemKey(item)} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 8, fontSize: 13 }}>
              <span>{item.name}{item.selectedVariant?.name ? ` · ${item.selectedVariant.name}` : ''} × {item.qty}</span>
              <strong>{(item.price * item.qty).toLocaleString('vi-VN')}đ</strong>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #e4ebe1', marginTop: 12, paddingTop: 12, fontWeight: 700 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Tạm tính</span><span>{orderReceipt.subtotal.toLocaleString('vi-VN')}đ</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>Vận chuyển</span><span>{orderReceipt.shipping === 0 ? 'Miễn phí' : `${orderReceipt.shipping.toLocaleString('vi-VN')}đ`}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#318223' }}><span>Tổng cộng</span><span>{orderReceipt.total.toLocaleString('vi-VN')}đ</span></div>
          </div>
        </div>
      )}
      <div style={coStyles.successActions}>
        <button style={coStyles.primaryBtn} onClick={() => setPage({ name: 'home' })}>Tiếp tục mua sắm</button>
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: isMobile ? '16px 16px' : '32px 24px' }}>
      {/* Steps */}
      <div style={{ ...coStyles.steps, ...(isMobile ? coStyles.stepsMobile : {}) }}>
        {['Thông tin', 'Xác nhận', 'Hoàn tất'].map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 4 : 8, minWidth: 0 }}>
            <div style={{ ...coStyles.stepDot, ...(isMobile ? coStyles.stepDotMobile : {}), background: step > i ? '#318223' : step === i + 1 ? '#318223' : '#e0e0e0', color: step >= i + 1 ? '#fff' : '#aaa' }}>{step > i + 1 ? '✓' : i + 1}</div>
            <span style={{ fontSize: isMobile ? 11 : 13, whiteSpace: 'nowrap', fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? '#1a1a1a' : '#aaa' }}>{s}</span>
            {i < 2 && <div style={{ ...coStyles.stepLine, ...(isMobile ? coStyles.stepLineMobile : {}) }} />}
          </div>
        ))}
      </div>

      <div style={{ ...coStyles.layout, gridTemplateColumns: isMobile ? '1fr' : '1fr 360px', gap: isMobile ? 16 : 28 }}>
        {/* STEP 1: Form */}
        {step === 1 && (
          <div style={coStyles.formCard}>
            <h2 style={coStyles.cardTitle}>Thông tin giao hàng</h2>
            <div style={coStyles.formHint}>Gõ không dấu cũng được, ví dụ "hcm", "ha noi". Chọn gợi ý hoặc tự nhập theo địa chỉ hiện tại.</div>
            <div style={isMobile ? undefined : coStyles.fieldPair}>
              <CheckoutField id="name" label="Họ và tên *" placeholder="Nguyễn Văn A" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
              <CheckoutField id="phone" label="Số điện thoại *" placeholder="0901 234 567" type="tel" onCommit={value => { const phone = normalizePhone(value); return /^0\d{9}$/.test(phone) ? phone : value; }} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            </div>
            <CheckoutSuggestField id="city" label="Tỉnh/Thành phố *" options={cityOptions} placeholder="Gõ tỉnh/thành phố để chọn" form={form} setForm={setForm} errors={errors} setErrors={setErrors} onValueChange={() => setForm(f => ({ ...f, district: '', ward: '' }))} />
            <div style={isMobile ? undefined : coStyles.fieldPair}>
              <CheckoutSuggestField id="district" label="Quận/Huyện (nếu có)" options={districtOptions} placeholder={form.city ? 'Bỏ trống nếu địa chỉ mới không có' : 'Chọn tỉnh/thành phố trước'} disabled={!form.city} form={form} setForm={setForm} errors={errors} setErrors={setErrors} onValueChange={() => setForm(f => ({ ...f, ward: '' }))} />
              <CheckoutSuggestField id="ward" label="Phường/Xã *" options={wardOptions} placeholder={form.city ? 'Gõ phường/xã' : 'Chọn tỉnh/thành phố trước'} disabled={!form.city} form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            </div>
            <CheckoutField id="address" label="Số nhà, tên đường *" placeholder="Ví dụ: 12/3 Lê Lợi" form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
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
                    <span style={coStyles.shippingDesc}>Nhận trong 1 giờ · +{SHIPPING_RULES.expressFee.toLocaleString('vi-VN')}đ</span>
                  </button>
                )}
              </div>
              {!canUseExpress && (
                <div style={coStyles.shippingUnavailable}>Hỏa tốc chỉ áp dụng cho khách chọn địa chỉ TP.HCM.</div>
              )}
              <div style={coStyles.shippingNote}>{deliveryNote}</div>
            </div>
            <CheckoutField id="note" label="Ghi chú (tùy chọn)" placeholder="Ghi chú thêm cho người giao hàng..." multiline form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
            <label style={coStyles.rememberRow}>
              <input type="checkbox" checked={rememberProfile} onChange={e => setRememberProfile(e.target.checked)} style={{ accentColor: '#318223' }} />
              <span>Lưu thông tin trên máy này cho lần đặt sau</span>
            </label>
            <button style={coStyles.primaryBtn} onClick={handleSubmit}>Xem lại đơn hàng →</button>
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
              Nến ly giao toàn quốc. Hỏa tốc trong 1 giờ áp dụng tại nội thành TP.HCM.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const coStyles = {
  steps: { display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36, justifyContent: 'center', width: '100%', boxSizing: 'border-box' },
  stepsMobile: { justifyContent: 'space-between', gap: 2, marginBottom: 24, overflow: 'hidden' },
  stepDot: { width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 },
  stepDotMobile: { width: 24, height: 24, minWidth: 24, fontSize: 11 },
  stepLine: { width: 60, height: 1, background: '#e0e0e0', margin: '0 8px' },
  stepLineMobile: { width: 16, minWidth: 16, margin: '0 2px' },
  layout: { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 28, alignItems: 'start' },
  formCard: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: '28px 28px 24px' },
  cardTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 },
  formHint: { marginTop: -8, marginBottom: 18, fontSize: 15, color: '#318223', fontWeight: 700 },
  field: { marginBottom: 18, position: 'relative', minWidth: 0 },
  fieldPair: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  rememberRow: { display: 'flex', alignItems: 'center', gap: 8, margin: '-4px 0 16px', fontSize: 13, color: '#555', cursor: 'pointer' },
  label: { display: 'block', fontSize: 13, fontWeight: 600, color: '#444', marginBottom: 6 },
  input: { width: '100%', border: '1.5px solid #e8e8e8', borderRadius: 10, padding: '11px 14px', fontSize: 16, outline: 'none', boxSizing: 'border-box', color: '#1a1a1a', fontFamily: 'inherit', transition: 'border-color .2s' },
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
  candleDeliveryNote: { marginTop: 12, background: '#f2faf0', border: '1px solid #d8ead4', borderRadius: 12, padding: '12px 14px', color: '#318223', fontSize: 13, lineHeight: 1.6, fontWeight: 700 },
  summaryItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  summaryItemLeft: {},
  summaryName: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.4, maxWidth: 200 },
  summaryItemPrice: { fontSize: 13, fontWeight: 600, color: '#444', flexShrink: 0 },
  summaryDivider: { borderTop: '1px solid #f0f0f0', margin: '14px 0' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 10 },
  summaryDelivery: { marginTop: -2, marginBottom: 12, color: '#777', background: '#f7faf6', borderRadius: 8, padding: '8px 10px', fontSize: 12, lineHeight: 1.5 },
  successIcon: { width: 72, height: 72, background: '#eaf4e9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: '#318223', margin: '0 auto 24px', fontWeight: 700 },
  successActions: { display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' },
};






// Post dates look like "26 tháng 4, 2026"; newer posts first, then higher id on the same day.
const blogPostTime = (post) => {
  const match = String(post?.date || '').match(/(\d{1,2})\s*tháng\s*(\d{1,2}),?\s*(\d{4})/i);
  return match ? Date.UTC(Number(match[3]), Number(match[2]) - 1, Number(match[1])) : 0;
};
const sortBlogPostsNewestFirst = (posts) => [...posts].sort((a, b) =>
  (blogPostTime(b) - blogPostTime(a)) || ((Number(b.id) || 0) - (Number(a.id) || 0)));

const BlogPage = ({ setPage }) => {
  const isMobile = useIsMobile();
  const [activeTag, setActiveTag] = React.useState('Tất cả');
  const sortedPosts = React.useMemo(() => sortBlogPostsNewestFirst(BLOG_POSTS), []);
  const [currentPage, setCurrentPage] = React.useState(1);
  const gridRef = React.useRef(null);
  const tags = ['Tất cả', 'Hướng dẫn', 'Kiến thức', 'Thảo mộc', 'Sức khỏe', 'Phụ kiện'];
  const filtered = activeTag === 'Tất cả' ? sortedPosts : sortedPosts.filter(p => p.tag === activeTag);
  const POSTS_PER_PAGE = 6;
  const totalPages = Math.max(1, Math.ceil(filtered.length / POSTS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const visiblePosts = filtered.slice((safePage - 1) * POSTS_PER_PAGE, safePage * POSTS_PER_PAGE);
  const selectTag = (tag) => { setActiveTag(tag); setCurrentPage(1); };
  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    if (gridRef.current) gridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const pageBtnStyle = (active, disabled) => ({
    minWidth: 40, height: 40, padding: '0 12px', borderRadius: 10, border: '1.5px solid', fontSize: 14, fontWeight: 700,
    cursor: disabled ? 'default' : 'pointer', opacity: disabled ? 0.4 : 1,
    background: active ? '#2e7d32' : '#fff', color: active ? '#fff' : '#555', borderColor: active ? '#2e7d32' : '#ddd',
  });

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
            <button key={tag} onClick={() => selectTag(tag)} style={{
              padding: '8px 18px', borderRadius: 999, border: '1.5px solid', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'all .2s',
              background: activeTag === tag ? '#2e7d32' : '#fff',
              color: activeTag === tag ? '#fff' : '#555',
              borderColor: activeTag === tag ? '#2e7d32' : '#ddd',
            }}>{tag}</button>
          ))}
        </div>

        {/* Articles Grid */}
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? 16 : 24, scrollMarginTop: 90 }}>
          {visiblePosts.map(post => (
            <article key={post.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', transition: 'transform .2s, box-shadow .2s', cursor: 'pointer' }}
              onClick={() => { window.location.href = post.url; }}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <nav aria-label="Phân trang bài viết" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginTop: 32 }}>
            <button type="button" onClick={() => safePage > 1 && goToPage(safePage - 1)} disabled={safePage === 1} style={pageBtnStyle(false, safePage === 1)} aria-label="Trang trước">‹</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} type="button" onClick={() => goToPage(n)} aria-current={n === safePage ? 'page' : undefined} style={pageBtnStyle(n === safePage, false)}>{n}</button>
            ))}
            <button type="button" onClick={() => safePage < totalPages && goToPage(safePage + 1)} disabled={safePage === totalPages} style={pageBtnStyle(false, safePage === totalPages)} aria-label="Trang sau">›</button>
          </nav>
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

// Baked in by tools/build_static_site.js from data/settings.json — do not edit by hand.
const BAKED_IMAGES = /*BAKED_IMAGES*/{"1":["/assets/media/generated/embedded-016.webp","/assets/media/generated/embedded-017.jpg","/assets/media/generated/embedded-018.webp","/assets/media/generated/embedded-019.jpg"],"2":["/assets/media/generated/embedded-020.webp"],"7":["/assets/media/generated/embedded-021.jpg"],"new_1776824123777":["/assets/media/generated/embedded-022.jpg"],"new_1776857397825":["/assets/media/generated/embedded-023.jpg"],"new_1776857467847":["/assets/media/generated/embedded-024.jpg","/assets/media/generated/embedded-025.jpg"]}/*END_BAKED_IMAGES*/;
const BAKED_CATEGORY_IMAGES = /*BAKED_CATEGORY_IMAGES*/{"nen-thom":"/assets/media/generated/embedded-018.jpg","combo":"/assets/products/uploads/1784088233058-bo-xong-10cm.webp","bep-xong":"/assets/media/generated/embedded-028.jpg","nu-tram":"/assets/media/generated/embedded-029.jpg","nen-tru":"/assets/products/uploads/1777285327929-nen-tru.webp","tui-thom":"/assets/products/uploads/1791430809390-chatgpt-image-10-29-51-9-thg-9-2026-1.webp","go-thom":"/assets/products/uploads/1791430854028-chatgpt-image-19-14-36-16-thg-7-2026.webp","nen-ly":"/assets/products/uploads/1791430890708-chatgpt-image-16-33-52-19-thg-7-2026.webp","thao-moc-xong":"/assets/products/uploads/1791430906647-chatgpt-image-18-52-30-10-thg-8-2026.webp","phu-kien":"/assets/products/uploads/1791536108168-chatgpt-image-18-29-21-10-thg-8-2026.webp"}/*END_BAKED_CATEGORY_IMAGES*/;
const BAKED_FEATURED = /*BAKED_FEATURED*/["1","shopee_55553449576","shopee_22353875434","p_1791429972397_g7kgf","shopee_29011454025","shopee_22080262041","shopee_57058955812","shopee_40170692234","shopee_54450013830"]/*END_BAKED_FEATURED*/;

// The local admin opens pages with ?preview=… to start from the home view.
const IS_PREVIEW_REFRESH = new URLSearchParams(window.location.search).has('preview');

const App = () => {
  const [page, setPage] = React.useState(() => {
    try {
      if (IS_PREVIEW_REFRESH) return { name: 'home' };
      if (queryFlag('checkout')) return { name: 'checkout' };
      if (queryFlag('cart')) return { name: 'cart' };
      if (queryFlag('search')) return { name: 'home' };
      if (window.history.state?.page) return window.history.state.page;
      return JSON.parse(localStorage.getItem('phuonglam-page')) || { name: 'home' };
    } catch {
      return { name: 'home' };
    }
  });
  const [cart, setCart] = React.useState(() => {
    try { return repriceCart(JSON.parse(localStorage.getItem('phuonglam-cart'))); } catch { return []; }
  });
  const productImages = BAKED_IMAGES;
  const categoryImages = BAKED_CATEGORY_IMAGES;
  const headerImages = Array.isArray(BAKED_HEADER_IMAGES) && BAKED_HEADER_IMAGES.length > 0 ? BAKED_HEADER_IMAGES : null;
  const featuredIds = BAKED_FEATURED;

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
        setCart(repriceCart(nextCart));
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

  const renderPage = () => {
    switch (page.name) {
      case 'home':     return <HomePage setPage={navigateTo} addToCart={addToCart} productImages={productImages} featuredIds={featuredIds} categoryImages={categoryImages} headerImages={headerImages} />;
      case 'category': return <CategoryPage cat={page.cat} setPage={navigateTo} addToCart={addToCart} productImages={productImages} />;
      case 'product':  return <ProductPage productId={page.id} setPage={navigateTo} goBack={goBack} addToCart={addToCart} productImages={productImages} />;
      case 'cart':     return <CartPage cart={cart} setCart={setCart} setPage={navigateTo} productImages={productImages} />;
      case 'checkout': return <CheckoutPage cart={cart} setCart={setCart} setPage={navigateTo} />;
      case 'blog':     return <BlogPage setPage={navigateTo} />;
      default:         return <HomePage setPage={navigateTo} addToCart={addToCart} productImages={productImages} featuredIds={featuredIds} categoryImages={categoryImages} headerImages={headerImages} />;
    }
  };

  return (
    <div>
      {page.name !== 'checkout' && <ShippingPromotion setPage={navigateTo} />}
      <Header page={page} setPage={navigateTo} cartCount={cartCount} />
      <main>{renderPage()}</main>
      <Footer setPage={navigateTo} />
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
