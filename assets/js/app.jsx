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
HERO_IMAGES[4] = "quẹt gas.jpg";
HERO_IMAGES.splice(5, 1);
const BAKED_HEADER_IMAGES = /*BAKED_HEADER_IMAGES*/["/assets/media/generated/embedded-002.jpg","/assets/media/generated/embedded-003.jpg","/assets/media/generated/embedded-004.jpg","/assets/media/generated/embedded-008.jpg","/assets/media/generated/embedded-005.jpg","/assets/products/uploads/1777451872306-shop-1-phu-kien.webp"]/*END_BAKED_HEADER_IMAGES*/;

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

const Header = ({ page, setPage, cartCount, setCartCount }) => {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = React.useState(false);
  const [adminPassword, setAdminPassword] = React.useState('');
  const logoClicksRef = React.useRef(0);
  const logoTimerRef = React.useRef(null);
  const isMobile = useIsMobile();

  const navLinks = [
    { label: 'Nến Tealight Xông', page: 'category', cat: 'nen-thom' },
    { label: 'Combo Xông Nhà', page: 'category', cat: 'combo' },
    { label: 'Thảo Mộc Xông', page: 'category', cat: 'thao-moc-xong' },
    { label: 'Đèn Xông Tinh Dầu', page: 'category', cat: 'bep-xong' },
    { label: 'Phụ Kiện Xông', page: 'category', cat: 'phu-kien' },
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
            {navLinks.map(l => (
              <span
                key={l.label}
                style={{
                  ...headerStyles.navLink,
                  color: page.name === l.page && (!l.cat || page.cat === l.cat) ? '#318223' : '#2d2d2d',
                  fontWeight: page.name === l.page && (!l.cat || page.cat === l.cat) ? '800' : '700',
                }}
                onClick={() => setPage(l.cat ? { name: 'category', cat: l.cat } : { name: l.page })}
              >
                {l.label}
              </span>
            ))}
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
          {navLinks.map(l => (
            <span key={l.label} style={headerStyles.mobileLink}
              onClick={() => { setPage(l.cat ? { name: 'category', cat: l.cat } : { name: l.page }); setMenuOpen(false); }}>
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
  navLink: { fontSize: 14.5, cursor: 'pointer', transition: 'color .2s', letterSpacing: '0em', whiteSpace: 'nowrap' },
  actions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#444', display: 'flex', alignItems: 'center' },
  cartBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 8, borderRadius: 8, color: '#444', display: 'flex', alignItems: 'center', position: 'relative' },
  badge: { position: 'absolute', top: 2, right: 2, background: '#318223', color: '#fff', fontSize: 10, fontWeight: 700, width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  menuBtn: { display: 'none', flexDirection: 'column', gap: 4, background: 'none', border: 'none', cursor: 'pointer', padding: 8 },
  hamburger: { display: 'block', width: 20, height: 2, background: '#333', borderRadius: 2 },
  mobileMenu: { padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4, borderTop: '1px solid #f0f0f0' },
  mobileLink: { padding: '10px 0', fontSize: 15, fontWeight: 700, cursor: 'pointer', borderBottom: '1px solid #f5f5f5', color: '#333' },
  adminOverlay: { position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(18, 32, 17, .42)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 },
  adminModal: { width: '100%', maxWidth: 420, background: '#fff', border: '1px solid #e3efde', borderRadius: 24, boxShadow: '0 28px 80px rgba(28, 73, 22, .24)', padding: '30px 28px 24px', textAlign: 'center', animation: 'modalPop .18s ease-out' },
  adminIcon: { width: 62, height: 62, borderRadius: '50%', background: '#edf8e9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 28 },
  adminTitle: { margin: 0, fontSize: 28, color: '#1f1f1f', letterSpacing: '-0.03em' },
  adminDesc: { margin: '8px 0 20px', color: '#777', fontSize: 14, lineHeight: 1.6 },
  adminInput: { width: '100%', border: '1.5px solid #dbe8d7', borderRadius: 14, padding: '14px 16px', fontSize: 16, outline: 'none', textAlign: 'center', boxSizing: 'border-box', marginBottom: 12 },
  adminSubmit: { width: '100%', border: 'none', borderRadius: 14, padding: '14px 18px', background: '#318223', color: '#fff', fontSize: 16, fontWeight: 900, cursor: 'pointer', boxShadow: '0 14px 28px rgba(49, 130, 35, .2)' },
  adminCancel: { width: '100%', marginTop: 10, border: '1px solid #e3e3e3', borderRadius: 14, padding: '12px 18px', background: '#fff', color: '#777', fontSize: 14, fontWeight: 800, cursor: 'pointer' },
};




// Placeholder image component
const ImgPlaceholder = ({ label, w = '100%', h = 220, bg = '#e8ede8', style = {}, src = null, aspectRatio = null }) => {
  if (src) {
    return (
      <div style={{ width: w, height: aspectRatio ? 'auto' : h, aspectRatio: aspectRatio || undefined, overflow: 'hidden', flexShrink: 0, ...style }}>
        <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; e.target.parentNode.style.background=bg; }} />
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

const isProductHidden = (product) => product?.hidden === true || product?.hidden === 'true';
const getVisibleProducts = (products = []) => products.filter(product => !isProductHidden(product));

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

const getCartItemKey = (item) => item.cartKey || String(item.id);

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

const ProductCard = ({ product, setPage, addToCart, productImages = {}, compact = false }) => {
  const [hover, setHover] = React.useState(false);
  const priceInfo = getProductPriceInfo(product);
  const displayImage = getProductDisplayImage(product, productImages);
  const displayName = getShortProductName(product.name, 6);
  const discount = priceInfo.originalPrice
    ? Math.round((1 - priceInfo.price / priceInfo.originalPrice) * 100)
    : null;

  return (
    <div
      style={{ ...pcStyles.card, ...(compact ? pcStyles.cardCompact : {}), boxShadow: hover ? '0 8px 32px rgba(0,0,0,0.10)' : '0 2px 12px rgba(0,0,0,0.06)', transform: hover ? 'translateY(-3px)' : 'none' }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ position: 'relative', cursor: 'pointer', paddingBottom: '100%', overflow: 'hidden', background: '#f0f4ef' }} onClick={() => setPage({ name: 'product', id: product.id })}>
        {(() => {
          return displayImage
            ? <img src={displayImage} alt={product.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} onError={e => { e.target.style.display='none'; }} />
            : <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 8px,rgba(0,0,0,0.03) 8px,rgba(0,0,0,0.03) 16px)' }}><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#888', textAlign: 'center', padding: '0 12px' }}>{product.name}</span></div>;
        })()}
        {product.tag && (
          <span style={{ ...pcStyles.tag, ...(compact ? pcStyles.tagCompact : {}), background: product.tag === 'Bán chạy' ? '#318223' : '#e07a24' }}>
            {product.tag}
          </span>
        )}
        {discount && <span style={{ ...pcStyles.discount, ...(compact ? pcStyles.discountCompact : {}) }}>-{discount}%</span>}
      </div>
      <div style={{ ...pcStyles.info, ...(compact ? pcStyles.infoCompact : {}) }}>
        <div title={product.name} style={{ ...pcStyles.name, ...(compact ? pcStyles.nameCompact : {}) }} onClick={() => setPage({ name: 'product', id: product.id })}>{displayName}</div>
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
  tag: { position: 'absolute', top: 6, left: 6, color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 5, letterSpacing: '0.03em' },
  tagCompact: { top: 6, left: 6, fontSize: 8, padding: '2px 5px', borderRadius: 5 },
  discount: { position: 'absolute', top: 6, right: 6, background: '#e84848', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 5 },
  discountCompact: { top: 6, right: 6, fontSize: 8, padding: '2px 5px', borderRadius: 5 },
  info: { padding: '8px 9px 10px', display: 'flex', flexDirection: 'column', flex: 1 },
  infoCompact: { padding: '8px 9px 10px' },
  name: { fontSize: 13.75, fontWeight: 600, color: '#1a1a1a', marginBottom: 5, cursor: 'pointer', lineHeight: 1.35 },
  nameCompact: { fontSize: 13.75, marginBottom: 5, lineHeight: 1.35 },
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
  return (
  <footer style={footerStyles.wrap}>
    <div style={{ ...footerStyles.inner, gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr 1.2fr', gap: isMobile ? '28px 20px' : 40, padding: isMobile ? '18px 20px 28px' : '60px 24px 40px' }}>
      <div style={{ ...footerStyles.col, gridColumn: isMobile ? '1 / -1' : 'auto' }}>
        <div style={footerStyles.brand}>
          <img src={LOGO_SRC} alt="Phương Lâm" style={footerStyles.logoImg} />
        </div>
        <p style={footerStyles.desc}>Sản phẩm thảo mộc và nến thơm tự nhiên, chăm sóc sức khỏe và không gian sống của bạn.</p>
        <div style={footerStyles.socials}>
          {['Facebook', 'Instagram', 'Zalo'].map(s => (
            <span key={s} style={footerStyles.social}>{s}</span>
          ))}
        </div>
      </div>
      <div style={footerStyles.col}>
        <div style={footerStyles.colTitle}>Danh mục</div>
        {CATEGORIES.map(c => (
          <div key={c.id} style={footerStyles.link} onClick={() => setPage({ name: 'category', cat: c.id })}>{c.name}</div>
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
      <span>© 2025 Phương Lâm. Bảo lưu mọi quyền.</span>
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
  social: { fontSize: 12, padding: '5px 12px', border: '1px solid #3a4e39', borderRadius: 20, cursor: 'pointer', color: '#9aad98' },
  colTitle: { fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 14, letterSpacing: '0.06em', textTransform: 'uppercase' },
  link: { fontSize: 13, color: '#9aad98', marginBottom: 8, cursor: 'pointer', lineHeight: 1.6 },
  contact: { fontSize: 13, color: '#9aad98', marginBottom: 8, lineHeight: 1.6 },
  bottom: { borderTop: '1px solid #2a3e29', textAlign: 'center', padding: '16px 24px', fontSize: 12, color: '#6a7d69' },
};




const HomePage = ({ setPage, addToCart, productImages = {}, featuredIds = null, categoryImages = {}, headerImages = null }) => {
  const allVisibleProducts = getVisibleProducts(window.PRODUCTS_LIVE || PRODUCTS);
  const bestsellers = (() => {
    const all = allVisibleProducts;
    if (featuredIds && featuredIds.length > 0) return featuredIds.map(id => all.find(p => String(p.id) === String(id))).filter(Boolean);
    return all.filter(p => p.tag === 'Bán chạy' || p.tag === 'Nổi bật');
  })();
  const activeHeroImages = (Array.isArray(headerImages) && headerImages.length > 0) ? headerImages : HERO_IMAGES;
  const isMobile = useIsMobile();
  const [slideIdx, setSlideIdx] = React.useState(0);
  const [homeSearch, setHomeSearch] = React.useState('');
  const [homeSearchOpen, setHomeSearchOpen] = React.useState(false);
  const [homeSearchHover, setHomeSearchHover] = React.useState(false);
  const homeSearchRef = React.useRef(null);
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

  const handleHomeSearchSelect = (product) => {
    setHomeSearch(product.name);
    setHomeSearchOpen(false);
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
            <button style={{ ...hpStyles.heroCta, width: isMobile ? '100%' : 'auto', padding: isMobile ? '12px 18px' : '12px 24px', fontSize: isMobile ? 14 : 14 }} onClick={() => setPage({ name: 'category', cat: 'nen-thom' })}>Xem sản phẩm</button>
            <button style={{ ...hpStyles.heroSecondary, width: isMobile ? '100%' : 'auto', padding: isMobile ? '12px 18px' : '12px 24px', fontSize: isMobile ? 14 : 14 }} onClick={() => setPage({ name: 'category', cat: 'combo' })}>Xem combo ưu đãi</button>
          </div>
        </div>
        {!isMobile && (
          <div style={{ ...hpStyles.heroImageFrame, width: '100%', maxWidth: 648, justifySelf: 'end' }}>
            <div style={{ ...hpStyles.heroImage, overflow: 'hidden', borderRadius: 18, position: 'relative', width: '100%', aspectRatio: '1 / 1' }}>
            <div style={{ display: 'flex', width: `${activeHeroImages.length * 100}%`, transform: `translateX(-${slideIdx * (100 / activeHeroImages.length)}%)`, transition: 'transform 0.7s cubic-bezier(0.4,0,0.2,1)', height: '100%' }}>
              {activeHeroImages.map((src, i) => (
                <img key={i} src={src} alt="Phương Lâm" style={{ width: `${100 / activeHeroImages.length}%`, height: '100%', objectFit: 'cover', flexShrink: 0 }} />
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
          <div style={{ ...hpStyles.productGrid, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(7, 1fr)', gap: isMobile ? 12 : 14 }}>
            {bestsellers.map(p => (
              <ProductCard key={p.id} product={p} setPage={setPage} addToCart={addToCart} productImages={productImages} />
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <button style={hpStyles.viewAllBtn} onClick={() => setPage({ name: 'category', cat: 'nen-thom' })}>
              Xem tất cả sản phẩm →
            </button>
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
            <div key={cat.id} style={hpStyles.catCard} onClick={() => setPage({ name: 'category', cat: cat.id })}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(0,0,0,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.06)'; }}
            >
              <div style={{ ...hpStyles.catImgWrap, padding: isMobile ? '6px 6px 0' : '10px 10px 0' }}>
                <ImgPlaceholder label={cat.name} bg="#f0f5ef" aspectRatio="1 / 1" style={{ borderRadius: 10, width: '100%' }} src={categoryImages[cat.id] || null} />
              </div>
              <div style={{ ...hpStyles.catInfo, padding: isMobile ? '7px 8px 8px' : '10px 12px 12px' }}>
                <div style={{ ...hpStyles.catName, fontSize: isMobile ? 10 : 13 }}>{cat.name}</div>
                <div style={{ ...hpStyles.catFrom, fontSize: isMobile ? 9 : 11 }}>{cat.from}</div>
              </div>
            </div>
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
  heroCta: { background: '#318223', color: '#fff', border: 'none', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', letterSpacing: '0.02em' },
  heroSecondary: { background: '#fff', color: '#318223', border: '1.5px solid #318223', padding: '14px 28px', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' },
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
  catCard: { background: '#fff', border: '1px solid #f0f0f0', borderRadius: 12, overflow: 'hidden', cursor: 'pointer', transition: 'all .25s', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' },
  catImgWrap: { padding: '12px 12px 0' },
  catInfo: { padding: '12px 16px 16px' },
  catName: { fontSize: 14, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 },
  catFrom: { fontSize: 12, color: '#318223', fontWeight: 600 },
  productGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 },
  viewAllBtn: { background: 'none', border: '1.5px solid #318223', color: '#318223', padding: '12px 28px', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' },
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
        <span style={cpStyles.breadLink} onClick={() => setPage({ name: 'home' })}>Trang chủ</span>
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
              <div key={c.id}
                style={{ ...cpStyles.sideLink, color: activeCat === c.id ? '#318223' : '#444', fontWeight: activeCat === c.id ? 700 : 400, background: activeCat === c.id ? '#eaf4e9' : 'none' }}
                onClick={() => { setActiveCat(c.id); setPage({ name: 'category', cat: c.id }); }}
              >
                {c.name}
              </div>
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
  breadLink: { color: '#318223', cursor: 'pointer', fontWeight: 500 },
  breadSep: { color: '#ccc' },
  breadCurrent: { color: '#666' },
  layout: { display: 'grid', gridTemplateColumns: '230px 1fr', gap: 36 },
  sidebar: { flexShrink: 0 },
  sideSection: { marginBottom: 28, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' },
  sideTitle: { fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' },
  sideLink: { padding: '8px 10px', borderRadius: 8, cursor: 'pointer', fontSize: 13, marginBottom: 2, transition: 'all .15s' },
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
    if (key.includes('vang') || key.includes('yellow')) return { background: '#f5c84c', border: '#d5a91f' };
    if (key.includes('do') || key.includes('red')) return { background: '#d93636', border: '#b72525' };
    return { background: '#dfe6dc', border: '#bac8b8' };
  };
  const getOptionImage = (groupName, value) => product.optionImages?.[groupName]?.[value] || '';
  const selectedOptionImage = selectedVariant?.image || optionGroups
    .filter(group => !isColorOptionGroup(group))
    .map(group => getOptionImage(group.name, selectedOptions[group.name]))
    .find(Boolean) || '';
  const getOptionPreviewVariant = (groupName, value) => {
    const nextOptions = { ...selectedOptions, [groupName]: value };
    return variants.find(variant => optionGroups.every(group => {
      const selectedValue = nextOptions[group.name];
      return !selectedValue || variant.options?.[group.name] === selectedValue;
    })) || variants.find(variant => variant.options?.[groupName] === value);
  };
  const isOptionValueAvailable = (groupName, value) => {
    if (!optionGroups.length) return true;
    const nextOptions = { ...selectedOptions, [groupName]: value };
    return variants.some(variant => optionGroups.every(group => {
      const selectedValue = nextOptions[group.name];
      return !selectedValue || variant.options?.[group.name] === selectedValue;
    }));
  };

  React.useEffect(() => {
    if (optionGroups.length) {
      const baseOptions = defaultVariant?.options || {};
      const nextOptions = {};
      optionGroups.forEach(group => {
        nextOptions[group.name] = selectedOptions[group.name] || baseOptions[group.name] || group.values[0];
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
    if (activeThumb && typeof activeThumb.scrollIntoView === 'function') {
      activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
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
        <span style={ppStyles.breadLink} onClick={() => setPage({ name: 'home' })}>Trang chủ</span>
        <span style={ppStyles.breadSep}>›</span>
        <span style={ppStyles.breadLink} onClick={() => setPage({ name: 'category', cat: product.categoryId })}>
          {CATEGORIES.find(c => c.id === product.categoryId)?.name}
        </span>
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
                    <ImgPlaceholder label={imgLabels[i] || `${product.name} — ảnh ${i + 1}`} bg="#f0f5ef" aspectRatio="1 / 1" style={{ borderRadius: 14, width: '100%' }} src={src || null} />
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
                      <ImgPlaceholder label={`ảnh ${i + 1}`} bg="#e8ede7" aspectRatio="1 / 1" style={{ borderRadius: 8, width: '100%' }} src={src} />
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
          <div style={ppStyles.catBadge} onClick={() => setPage({ name: 'category', cat: product.categoryId })}>
            {CATEGORIES.find(c => c.id === product.categoryId)?.name}
          </div>

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
                    {group.values.map(value => {
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
                            setSelectedOptions(prev => ({ ...prev, [group.name]: value }));
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
  breadLink: { color: '#318223', cursor: 'pointer', fontWeight: 500 },
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
  catBadge: { display: 'inline-block', fontSize: 12, fontWeight: 600, color: '#318223', background: '#eaf4e9', padding: '4px 12px', borderRadius: 20, marginBottom: 14, cursor: 'pointer' },
  name: { fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: '0 0 12px', lineHeight: 1.3, letterSpacing: '0em', overflowWrap: 'anywhere' },
  nameMobile: { fontSize: 24, lineHeight: 1.25 },
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
      <button style={cartStyles.ctaBtn} onClick={() => setPage({ name: 'home' })}>Tiếp tục mua sắm</button>
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
            return (
            <div key={itemKey} style={isMobile ? { padding: '14px 14px', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 12, alignItems: 'flex-start' } : cartStyles.row}>
              {isMobile ? (
                <>
                  <ImgPlaceholder label={item.name} w={64} h={64} bg="#f0f5ef" style={{ borderRadius: 10, flexShrink: 0 }} src={item.selectedVariant?.image || getProductDisplayImage(item, productImages)} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ ...cartStyles.itemName, marginBottom: 2 }} onClick={() => setPage({ name: 'product', id: item.id })}>{item.name}</div>
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
                    <ImgPlaceholder label={item.name} w={84} h={84} bg="#f0f5ef" style={{ borderRadius: 10, flexShrink: 0 }} src={item.selectedVariant?.image || getProductDisplayImage(item, productImages)} />
                    <div style={{ minWidth: 0 }}>
                      <div style={cartStyles.itemName} onClick={() => setPage({ name: 'product', id: item.id })}>{item.name}</div>
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
            <button style={cartStyles.continueBtn} onClick={() => setPage({ name: 'home' })}>← Tiếp tục mua sắm</button>
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
  itemName: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', marginBottom: 4, cursor: 'pointer', lineHeight: 1.4 },
  itemCat: { fontSize: 12, color: '#aaa' },
  itemVariant: { fontSize: 12, color: '#318223', fontWeight: 600, marginTop: 3, marginBottom: 6 },
  priceCol: { fontSize: 14, color: '#444' },
  qtyCol: { display: 'flex', justifyContent: 'center' },
  qtyControl: { display: 'inline-flex', alignItems: 'center', border: '1px solid #e0e0e0', borderRadius: 8, overflow: 'hidden' },
  qtyBtn: { width: 32, height: 32, background: '#f7f7f5', border: 'none', fontSize: 16, cursor: 'pointer', color: '#333' },
  qtyNum: { width: 36, textAlign: 'center', fontSize: 14, fontWeight: 700 },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#ccc', fontSize: 14, padding: 4, borderRadius: 6 },
  continueBtn: { background: 'none', border: 'none', color: '#318223', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '8px 20px' },
  summary: { background: '#fff', borderRadius: 14, border: '1px solid #f0f0f0', padding: '24px', position: 'sticky', top: 80 },
  summaryTitle: { fontSize: 16, fontWeight: 700, color: '#1a1a1a', marginBottom: 20 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#555', marginBottom: 12 },
  freeShipNote: { fontSize: 12, color: '#318223', background: '#eaf4e9', padding: '8px 12px', borderRadius: 8, marginBottom: 12 },
  divider: { borderTop: '1px solid #f0f0f0', margin: '16px 0' },
  ctaBtn: { width: '100%', background: '#318223', color: '#fff', border: 'none', padding: '14px 0', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer', marginTop: 16 },
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
  const [newProducts, setNewProducts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('herbly-new-products') || '[]'); } catch { return []; }
  });

  React.useEffect(() => {
    safeSetLocalStorage('herbly-new-products', JSON.stringify(newProducts));
    if (setExtraProducts) setExtraProducts(newProducts);
    // Sync to PRODUCTS_LIVE so FeaturedEditor sees new products
    const sourceProducts = BAKED_PRODUCTS.length > 0 ? BAKED_PRODUCTS : PRODUCTS;
    const base = sourceProducts.map(p => productOverrides[p.id] ? { ...p, ...productOverrides[p.id] } : p);
    window.PRODUCTS_LIVE = [...base, ...newProducts];
  }, [newProducts, productOverrides]);

  const createEmptyVariant = () => ({
    id: 'variant_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
    name: '',
    sku: '',
    price: '',
    originalPrice: '',
    weight: '',
    image: '',
  });

  const cleanVariants = (variants = []) => variants
    .map((variant, index) => ({
      id: variant.id || `variant_${Date.now()}_${index}`,
      name: String(variant.name || '').trim(),
      sku: String(variant.sku || '').trim(),
      price: Number(variant.price) || 0,
      originalPrice: variant.originalPrice ? Number(variant.originalPrice) : null,
      weight: variant.weight ? Number(variant.weight) : null,
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
      price: Number(price),
      originalPrice: f?.querySelector('#np-oprice')?.value ? Number(f.querySelector('#np-oprice').value) : null,
      shortDesc: f?.querySelector('#np-sdesc')?.value || '',
      description: f?.querySelector('#np-desc')?.value || '',
      usage: f?.querySelector('#np-usage')?.value || '',
      tag: addTag || null,
      weight: f?.querySelector('#np-weight')?.value ? Number(f.querySelector('#np-weight').value) : null,
      hidden: false,
      variants: [],
    };
    if (f) f.querySelectorAll('input[id^="np-"],textarea[id^="np-"]').forEach(el => { el.value = ''; });
    setAddCat(''); setAddTag('');
    setNewProducts(prev => [...prev, prod]);
    setAddSaved(true); setShowAddForm(false);
    setTimeout(() => setAddSaved(false), 2500);
  };

  const allProducts = [...(window.PRODUCTS_LIVE || PRODUCTS), ...newProducts.filter(np => !(window.PRODUCTS_LIVE || []).find(p => p.id === np.id))];
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
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : null,
      shortDesc: form.shortDesc,
      description: form.description,
      usage: form.usage,
      tag: form.tag || null,
      weight: form.weight ? Number(form.weight) : null,
      hidden: !!form.hidden,
      variants: cleanVariants(form.variants),
    };
    setProductOverrides(prev => ({ ...prev, [selected]: updated }));
    setNewProducts(prev => prev.map(p => p.id === selected ? { ...p, ...updated } : p));
    if (window.PRODUCTS_LIVE) {
      const idx = window.PRODUCTS_LIVE.findIndex(p => p.id === selected);
      if (idx !== -1) window.PRODUCTS_LIVE[idx] = { ...window.PRODUCTS_LIVE[idx], ...updated };
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const resetProduct = (id) => {
    setProductOverrides(prev => { const n = {...prev}; delete n[id]; return n; });
    setProductImages(prev => { const n = {...prev}; delete n[id]; return n; });
    if (selected === id) { setSelected(null); setForm({}); }
  };

  const selectedProduct = selected ? (window.PRODUCTS_LIVE || PRODUCTS).find(p => p.id === selected) : null;
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
              <input id="np-price" type="number" defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="VD: 125000" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>Giá gốc (đ)</div>
              <input id="np-oprice" type="number" defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="Để trống nếu không có" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#888', fontWeight: 600, marginBottom: 4 }}>⚖️ Trọng lượng (gram)</div>
              <input id="np-weight" type="number" defaultValue="" style={{ width: '100%', border: '1.5px solid #e0e0e0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} placeholder="VD: 200" />
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
              <input style={peStyles.input} type="number" value={form.price || ''} onChange={e => setForm(f => ({...f, price: e.target.value}))} />
            </div>
            <div>
              <label style={peStyles.label}>Giá gốc (đ) — để trống nếu không giảm</label>
              <input style={peStyles.input} type="number" value={form.originalPrice || ''} onChange={e => setForm(f => ({...f, originalPrice: e.target.value}))} />
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
                  <input style={peStyles.input} type="number" value={variant.price || ''} onChange={e => updateVariant(index, 'price', e.target.value)} placeholder="125000" />
                </div>
                <div>
                  <label style={peStyles.miniLabel}>Giá gốc</label>
                  <input style={peStyles.input} type="number" value={variant.originalPrice || ''} onChange={e => updateVariant(index, 'originalPrice', e.target.value)} placeholder="155000" />
                </div>
                <div>
                  <label style={peStyles.miniLabel}>Gram</label>
                  <input style={peStyles.input} type="number" value={variant.weight || ''} onChange={e => updateVariant(index, 'weight', e.target.value)} placeholder="200" />
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
    try { return JSON.parse(localStorage.getItem('herbly-new-products') || '[]'); } catch { return []; }
  });
  const addFormRef = React.useRef(null);
  const [saved, setSaved] = React.useState(false);
  const [editImg, setEditImg] = React.useState(null);

  React.useEffect(() => {
    safeSetLocalStorage('herbly-new-products', JSON.stringify(newProducts));
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
        <button onClick={() => { safeSetLocalStorage('herbly-featured', JSON.stringify(current)); window.FEATURED_IDS = current; alert('✅ Đã lưu! Vào trang chủ để xem.'); }}
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
  const [authed, setAuthed] = React.useState(() => sessionStorage.getItem('herbly-admin') === '1');
  const [pwInput, setPwInput] = React.useState('');
  const [pwError, setPwError] = React.useState(false);
  const [exportStatus, setExportStatus] = React.useState('');

  const handleLogin = () => {
    if (pwInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('herbly-admin', '1');
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
              <button
                onClick={() => setPage({ name: 'category', cat: ctaTarget.cat })}
                style={{ display: 'block', width: '100%', maxWidth: 400, margin: '0 auto 20px', background: 'linear-gradient(180deg,#ffffff,#f4fbf2)', color: '#318223', border: '2px solid #318223', padding: '16px 32px', borderRadius: 10, fontSize: isMobile ? 16 : 18, fontWeight: 800, cursor: 'pointer', letterSpacing: '0.03em', boxShadow: '0 10px 0 #1f6819, 0 18px 32px rgba(49,130,35,.22)', transition: 'all .2s', boxSizing: 'border-box' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 13px 0 #1f6819, 0 24px 38px rgba(49,130,35,.26)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 0 #1f6819, 0 18px 32px rgba(49,130,35,.22)'; }}
              >
                Xem ngay {ctaTarget.label} →
              </button>
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
const BAKED_PRODUCTS = /*BAKED_PRODUCTS*/[{"id":"p_1777435996053_fbofd","sku":"PL-002","categoryId":"nen-thom","name":"Nến tealight 4 giờ Phương Lâm xông thảo mộc thư giãn không khói không mùi - Loại Trơn ","price":55000,"originalPrice":null,"shortDesc":"Loại Trơn Cháy đủ 4 tiếng - không khói không mùi dùng để xông, hâm nóng đồ ăn\n","description":"Nến tealight 4 giờ Phương Lâm Loại Trơn là dòng nến viên vỏ nhôm màu trắng, không khói, không mùi, cháy ổn định khoảng 4 tiếng mỗi viên. Sản phẩm phù hợp để dùng với bếp xông thảo mộc, đèn xông tinh dầu, khay hâm trà, bộ hâm nóng đồ ăn, bàn tiệc, góc thiền, spa, quán cafe hoặc không gian thư giãn tại nhà.\n\nLoại Trơn có thiết kế đơn giản, sạch mắt và dễ phối với nhiều không gian. Ngọn lửa nhỏ, đều, giúp tạo nhiệt ổn định để làm nóng thảo mộc khô, khuếch tán tinh dầu hoặc giữ ấm trà và món ăn nhẹ mà không làm lấn át mùi hương chính. Đây là lựa chọn phù hợp cho khách cần nến tealight dùng hằng ngày, nến xông thảo mộc không mùi, nến đốt tinh dầu không khói hoặc nến hâm nóng tiện lợi.\n\nNến được đóng dạng viên nhỏ gọn, dễ đặt vào bếp xông, đèn tinh dầu, ly nến, khay decor hoặc dụng cụ hâm nóng. Vỏ nhôm giúp cố định sáp trong quá trình cháy, dễ thay nến sau khi dùng và thuận tiện khi mua số lượng nhiều để dự trữ.\n\nSản phẩm có các phân loại 2 vỉ 4h = 20 viên, 50 viên 4h và hộp 100 viên 4h. Khách có thể chọn theo nhu cầu sử dụng ít, dùng thường xuyên tại nhà hoặc dùng số lượng lớn cho spa, quán, khu vực thờ cúng, setup tiệc và xông phòng.\n\nNến tealight 4 giờ Phương Lâm Loại Trơn phù hợp cho người đang tìm nến tealight trắng, nến tealight không khói, nến tealight không mùi, nến xông thảo mộc, nến đốt đèn tinh dầu, nến hâm trà và nến hâm nóng đồ ăn nhỏ gọn.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ PHƯƠNG LÂM LOẠI TRƠN\n\n✔ Dùng với bếp xông thảo mộc:\nĐặt 1 viên nến vào khoang giữ nến của bếp xông. Châm lửa ở tim nến, sau đó đặt thảo mộc khô hoặc nguyên liệu xông ở phần khay phía trên. Đặt bếp ở nơi thoáng, trên bề mặt phẳng và chịu nhiệt.\n\n✔ Dùng với đèn xông tinh dầu:\nCho nước và tinh dầu vào khay đèn xông theo lượng phù hợp, đặt nến bên dưới rồi châm lửa. Theo dõi lượng nước trong khay, không để khay bị cạn khi nến vẫn đang cháy.\n\n✔ Dùng để hâm trà hoặc hâm nóng đồ ăn:\nĐặt nến vào đúng vị trí của đế hâm, khay hâm hoặc bộ hâm trà. Chỉ dùng với dụng cụ chịu nhiệt và có khoảng cách phù hợp giữa ngọn lửa với đáy bình, ly hoặc khay thức ăn.\n\n✔ Dùng trang trí và tạo ánh sáng:\nCó thể đặt nến trong ly nến, khay decor hoặc chân nến chịu nhiệt để tạo ánh sáng ấm cho bàn tiệc, phòng ngủ, góc thiền, spa hoặc quán cafe.\n\n✔ Lưu ý an toàn:\nKhông đặt nến gần rèm, giấy, khăn, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy hoặc khi sáp còn nóng. Không để nến cháy khi không có người trông coi. Để xa tầm tay trẻ em và vật nuôi.\n\n✔ Cách tắt nến:\nDùng dụng cụ tắt nến hoặc que nhỏ nhấn nhẹ tim nến xuống phần sáp lỏng rồi dựng lại. Hạn chế thổi trực tiếp để tránh khói nhẹ và tránh bắn sáp nóng.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp và tránh khu vực có nhiệt độ cao để nến không bị mềm, chảy sáp hoặc biến dạng.","tag":"Bán chạy","weight":200,"hidden":false,"optionGroups":[{"name":"Màu","values":["Trắng"]},{"name":"Số lượng","values":["2 Vỉ 4h = 20 viên","50 Viên 4h","Hộp 100 Viên 4h"]}],"optionImages":{},"images":["/assets/products/uploads/1777436017221-nen-4h-tron-100v.webp","/assets/products/uploads/1777455420691-chatgpt-image-16-14-50-29-thg-4-2026.webp","/assets/products/uploads/1777455426597-chatgpt-image-16-13-51-29-thg-4-2026.webp","/assets/products/uploads/1777455435623-chatgpt-image-16-18-14-29-thg-4-2026.webp","/assets/products/uploads/1777435866129-nen-tealight-ban-tho-gia-dinh.webp","/assets/products/uploads/1777435871149-bo-ket-xong-nha-phuong-lam-202604280416-luu-y-an-toan-xong-nha-bo-ket.webp","/assets/products/uploads/1777455438162-chatgpt-image-16-16-54-29-thg-4-2026.webp","/assets/products/uploads/1777455472866-bo-ket-xong-nha-phuong-lam-202604280416-bep-xong-thao-moc-bo-ket-nen-tealight.webp","/assets/products/uploads/1777455477308-bep-xong-thao-moc-san-pham-chinh.webp"],"reviews":[{"name":"Nguyễn Thị Mai","rating":5,"comment":"Mùi rất dễ chịu, đốt cả buổi tối không bị ngột. Sẽ mua lại!"},{"name":"Trần Văn Hùng","rating":5,"comment":"Sản phẩm đẹp, đóng gói cẩn thận. Hương thơm tự nhiên không hắc."},{"name":"Lê Thu Hà","rating":4,"comment":"Rất thích, chỉ tiếc hơi nhỏ hơn mình nghĩ."}],"variants":[{"id":"pl001_trang_20v","name":"Trắng - 2 Vỉ 4h = 20 viên","sku":"PL-001-TRANG-20V","price":55000,"originalPrice":null,"weight":200,"image":"/assets/products/uploads/1777436104847-11.webp","options":{"Màu":"Trắng","Số lượng":"2 Vỉ 4h = 20 viên"}},{"id":"pl001_trang_50v","name":"Trắng - 50 Viên 4h","sku":"PL-001-TRANG-50V","price":95000,"originalPrice":null,"weight":700,"image":"/assets/products/uploads/1777436122417-10.webp","options":{"Màu":"Trắng","Số lượng":"50 Viên 4h"}},{"id":"pl001_trang_100v","name":"Trắng - Hộp 100 Viên 4h","sku":"PL-001-TRANG-100V","price":175000,"originalPrice":null,"weight":1300,"image":"/assets/products/uploads/1777436090522-nen-4h-tron-100v.webp","options":{"Màu":"Trắng","Số lượng":"Hộp 100 Viên 4h"}},{"id":"pl001_vang_20v","name":"Vàng - 2 Vỉ 4h = 20 viên","sku":"PL-001-VANG-20V","price":55000,"originalPrice":null,"weight":200,"image":"","options":{"Màu":"Vàng","Số lượng":"2 Vỉ 4h = 20 viên"}},{"id":"pl001_vang_50v","name":"Vàng - 50 Viên 4h","sku":"PL-001-VANG-50V","price":95000,"originalPrice":null,"weight":700,"image":"/assets/products/uploads/1777435902832-8.webp","options":{"Màu":"Vàng","Số lượng":"50 Viên 4h"}},{"id":"pl001_vang_100v","name":"Vàng - Hộp 100 Viên 4h","sku":"PL-001-VANG-100V","price":175000,"originalPrice":null,"weight":1300,"image":"/assets/products/generated/product-001.jpg","options":{"Màu":"Vàng","Số lượng":"Hộp 100 Viên 4h"}},{"id":"pl001_do_20v","name":"Đỏ - 2 Vỉ 4h = 20 viên","sku":"PL-001-DO-20V","price":55000,"originalPrice":null,"weight":200,"image":"","options":{"Màu":"Đỏ","Số lượng":"2 Vỉ 4h = 20 viên"}},{"id":"pl001_do_50v","name":"Đỏ - 50 Viên 4h","sku":"PL-001-DO-50V","price":95000,"originalPrice":null,"weight":700,"image":"/assets/products/uploads/1777435920684-11.webp","options":{"Màu":"Đỏ","Số lượng":"50 Viên 4h"}},{"id":"pl001_do_100v","name":"Đỏ - Hộp 100 Viên 4h","sku":"PL-001-DO-100V","price":175000,"originalPrice":null,"weight":1300,"image":"/assets/products/generated/product-003.jpg","options":{"Màu":"Đỏ","Số lượng":"Hộp 100 Viên 4h"}}]},{"id":1,"sku":"PL-001","categoryId":"nen-thom","name":"Nến tealight 4 giờ Phương Lâm xông thảo mộc thư giãn không khói không mùi - Loại Mai","price":55000,"originalPrice":null,"shortDesc":"Có thể tùy chọn màu và số lượng - Loại Mai - cháy 4h\n+ 2 vỉ 4h = 20 viên\n+ 50v 4h\n+ Hộp 100 viên 4h\n","description":"Nến tealight 4 giờ Phương Lâm Loại Mai là dòng nến viên nhỏ gọn, chuyên dùng để đốt đèn xông tinh dầu, bếp xông thảo mộc, hâm trà, trang trí bàn tiệc, decor phòng ngủ, phòng khách, spa, quán cafe hoặc không gian thư giãn tại nhà.\n\nSản phẩm cháy ổn định trong khoảng 4 giờ mỗi viên, ngọn lửa nhỏ vừa đủ để làm nóng tinh dầu hoặc thảo mộc khô mà không tạo mùi nến gắt. Nến không khói, không mùi, phù hợp cho khách cần nến tealight dùng hằng ngày, nến xông thảo mộc, nến đốt đèn tinh dầu hoặc nến trang trí đơn giản, sạch và tiện.\n\nThiết kế dạng viên có vỏ nhôm giúp dễ đặt vào bếp xông, chén đốt tinh dầu, ly nến hoặc khay trang trí. Kích thước nhỏ, dễ cất giữ, dễ mang theo và thay mới nhanh sau mỗi lần sử dụng.\n\nPhân loại sản phẩm gồm 2 vỉ 4h = 20 viên, 50 viên 4h và hộp 100 viên 4h. Khách có thể chọn màu Trắng, Vàng hoặc Đỏ theo nhu cầu trang trí, thờ cúng, xông phòng hoặc sử dụng thường xuyên.\n\nNến tealight 4 giờ Phương Lâm phù hợp cho người đang tìm nến tealight không khói, nến không mùi, nến đốt tinh dầu, nến xông thảo mộc, nến trang trí tiệc, nến hâm trà và nến dùng cho bếp xông mini.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ PHƯƠNG LÂM\n\n✔ Dùng với bếp xông thảo mộc:\nĐặt 1 viên nến tealight vào đúng vị trí giữ nến của bếp xông. Châm lửa ở tim nến, sau đó đặt thảo mộc hoặc tinh dầu ở khay phía trên theo đúng hướng dẫn của từng loại bếp.\n\n✔ Dùng với đèn xông tinh dầu:\nCho nước và vài giọt tinh dầu vào khay đèn xông, đặt nến bên dưới rồi đốt nến. Không để khay tinh dầu bị cạn nước trong lúc nến còn cháy.\n\n✔ Dùng trang trí, hâm trà hoặc tạo ánh sáng:\nĐặt nến trong ly, khay hoặc đế chịu nhiệt. Luôn đặt trên bề mặt phẳng, khô ráo, chắc chắn và cách xa rèm, giấy, vải, gỗ mỏng hoặc vật dễ cháy.\n\n✔ Lưu ý an toàn:\nKhông di chuyển nến khi đang cháy hoặc khi sáp còn nóng. Không để nến cháy khi không có người trông coi. Để xa tầm tay trẻ em và vật nuôi. Không đặt nhiều viên nến quá sát nhau để tránh nhiệt tập trung.\n\n✔ Cách tắt nến:\nDùng dụng cụ tắt nến hoặc que nhỏ nhấn nhẹ tim nến xuống phần sáp lỏng rồi dựng tim nến lại. Hạn chế thổi trực tiếp để tránh bắn sáp nóng.\n\n✔ Bảo quản:\nBảo quản nến nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp và nơi có nhiệt độ cao để nến không bị mềm, chảy sáp hoặc biến dạng.","tag":"Bán chạy","weight":200,"hidden":false,"optionGroups":[{"name":"Màu","values":["Trắng","Vàng","Đỏ"]},{"name":"Số lượng","values":["2 Vỉ 4h = 20 viên","50 Viên 4h","Hộp 100 Viên 4h"]}],"optionImages":{},"images":["/assets/products/uploads/1777435799447-chatgpt-image-14-52-27-22-thg-4-2026.webp","/assets/products/uploads/1777435820024-image.webp","/assets/products/uploads/1777455636813-chatgpt-image-16-12-04-29-thg-4-2026.webp","/assets/products/uploads/1777455528964-chatgpt-image-16-31-23-29-thg-4-2026.webp","/assets/products/uploads/1777435605298-nen-tealight-khong-khoi-xong-tinh-dau-202604280600-nen-tealight-khong-khoi-chay-sach.webp","/assets/products/uploads/1777435857424-bo-ket-xong-nha-phuong-lam-202604280416-bep-xong-thao-moc-bo-ket-nen-tealight.webp","/assets/products/uploads/1777435866129-nen-tealight-ban-tho-gia-dinh.webp","/assets/products/uploads/1777435871149-bo-ket-xong-nha-phuong-lam-202604280416-luu-y-an-toan-xong-nha-bo-ket.webp"],"reviews":[{"name":"Nguyễn Thị Mai","rating":5,"comment":"Mùi rất dễ chịu, đốt cả buổi tối không bị ngột. Sẽ mua lại!"},{"name":"Trần Văn Hùng","rating":5,"comment":"Sản phẩm đẹp, đóng gói cẩn thận. Hương thơm tự nhiên không hắc."},{"name":"Lê Thu Hà","rating":4,"comment":"Rất thích, chỉ tiếc hơi nhỏ hơn mình nghĩ."}],"variants":[{"id":"pl001_trang_20v","name":"Trắng - 2 Vỉ 4h = 20 viên","sku":"PL-001-TRANG-20V","price":55000,"originalPrice":null,"weight":200,"image":"/assets/products/uploads/1777346963502-12.webp","options":{"Màu":"Trắng","Số lượng":"2 Vỉ 4h = 20 viên"}},{"id":"pl001_trang_50v","name":"Trắng - 50 Viên 4h","sku":"PL-001-TRANG-50V","price":95000,"originalPrice":null,"weight":700,"image":"/assets/products/uploads/1777346987165-10.webp","options":{"Màu":"Trắng","Số lượng":"50 Viên 4h"}},{"id":"pl001_trang_100v","name":"Trắng - Hộp 100 Viên 4h","sku":"PL-001-TRANG-100V","price":175000,"originalPrice":null,"weight":1300,"image":"/assets/products/generated/product-002.jpg","options":{"Màu":"Trắng","Số lượng":"Hộp 100 Viên 4h"}},{"id":"pl001_vang_20v","name":"Vàng - 2 Vỉ 4h = 20 viên","sku":"PL-001-VANG-20V","price":55000,"originalPrice":null,"weight":200,"image":"","options":{"Màu":"Vàng","Số lượng":"2 Vỉ 4h = 20 viên"}},{"id":"pl001_vang_50v","name":"Vàng - 50 Viên 4h","sku":"PL-001-VANG-50V","price":95000,"originalPrice":null,"weight":700,"image":"/assets/products/uploads/1777435902832-8.webp","options":{"Màu":"Vàng","Số lượng":"50 Viên 4h"}},{"id":"pl001_vang_100v","name":"Vàng - Hộp 100 Viên 4h","sku":"PL-001-VANG-100V","price":175000,"originalPrice":null,"weight":1300,"image":"/assets/products/generated/product-001.jpg","options":{"Màu":"Vàng","Số lượng":"Hộp 100 Viên 4h"}},{"id":"pl001_do_20v","name":"Đỏ - 2 Vỉ 4h = 20 viên","sku":"PL-001-DO-20V","price":55000,"originalPrice":null,"weight":200,"image":"","options":{"Màu":"Đỏ","Số lượng":"2 Vỉ 4h = 20 viên"}},{"id":"pl001_do_50v","name":"Đỏ - 50 Viên 4h","sku":"PL-001-DO-50V","price":95000,"originalPrice":null,"weight":700,"image":"/assets/products/uploads/1777435920684-11.webp","options":{"Màu":"Đỏ","Số lượng":"50 Viên 4h"}},{"id":"pl001_do_100v","name":"Đỏ - Hộp 100 Viên 4h","sku":"PL-001-DO-100V","price":175000,"originalPrice":null,"weight":1300,"image":"/assets/products/generated/product-003.jpg","options":{"Màu":"Đỏ","Số lượng":"Hộp 100 Viên 4h"}}]},{"id":7,"sku":"PL-003","categoryId":"phu-kien","name":"Hột quẹt gas thắp nến đầu dài an có thể thu gọn tiện lợi I Phương Lâm","price":25000,"originalPrice":40000,"shortDesc":"Chuyên dùng cho đốt nến xông, an toàn tiện lợi","description":"Hột quẹt gas thắp nến đầu dài Phương Lâm dùng để châm nến tealight, nến thơm, bếp xông thảo mộc, đèn xông tinh dầu và các góc trang trí cần lửa nhỏ. Thiết kế đầu dài giúp tay cách xa ngọn lửa hơn khi thắp nến trong ly, bếp xông hoặc vị trí sâu khó châm.\n\nSản phẩm nhỏ gọn, dễ cầm, có thể thu gọn tiện cất trong ngăn kéo, túi đồ xông hoặc kệ nến. Phù hợp dùng tại nhà, spa, quán cafe, phòng thờ, bàn tiệc hoặc khi setup không gian thư giãn.","usage":"HƯỚNG DẪN SỬ DỤNG HỘT QUẸT GAS ĐẦU DÀI\n\n✔ Cách dùng:\nMở đầu bật lửa, hướng đầu lửa vào tim nến hoặc vị trí cần châm rồi bấm đánh lửa. Giữ khoảng cách vừa đủ, không để tay quá gần ngọn lửa.\n\n✔ Sau khi dùng:\nTắt lửa hoàn toàn, chờ đầu bật lửa nguội rồi thu gọn và cất lại.\n\n✔ Lưu ý an toàn:\nKhông dùng gần xăng dầu, cồn hoặc vật dễ cháy. Không để bật lửa dưới nắng nóng, gần bếp lửa hoặc nơi nhiệt độ cao. Để xa tầm tay trẻ em.","tag":"Nổi bật","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["/assets/products/uploads/1777451754260-shop-1-phu-kien.webp","/assets/products/uploads/1777455572843-chatgpt-image-16-30-11-29-thg-4-2026-trung-binh.webp","/assets/products/uploads/1777455577721-chatgpt-image-16-27-42-29-thg-4-2026-trung-binh.webp","/assets/products/uploads/1777455579445-chatgpt-image-16-26-39-29-thg-4-2026-trung-binh.webp","/assets/products/uploads/1777455581435-chatgpt-image-16-25-05-29-thg-4-2026-trung-binh.webp"],"reviews":[],"variants":[]},{"id":"shopee_57653126590","sku":"SP-57653126590","categoryId":"thao-moc-xong","name":"Quế thanh Yên Bái nấu ăn pha trà thơm đậm tự nhiên","price":30000,"originalPrice":null,"shortDesc":"Quế thanh Yên Bái xuất khẩu, chọn từ quế già cây, thơm nồng ấm và nhiều tinh dầu. Phù hợp nấu phở, bò kho, món hầm, pha trà quế và tạo hương tự nhiên.","description":"QUẾ THANH YÊN BÁI XUẤT KHẨU\n\n✔ Tổng quan sản phẩm:\nQuế thanh Yên Bái xuất khẩu là dòng quế khô nguyên thanh được chọn từ quế già cây, vỏ dày, chắc, mùi thơm nồng ấm và hàm lượng tinh dầu tự nhiên cao.\nSản phẩm phù hợp cho gia đình cần quế thanh sạch để nấu ăn, pha trà thảo mộc, làm đồ uống ấm hoặc dùng decor tạo hương tự nhiên.\n\n✔ Điểm nổi bật:\n- Quế Yên Bái thơm đậm, rõ mùi, bền hương.\n- Thanh quế dày, chắc, nhiều tinh dầu tự nhiên.\n- Hậu vị ngọt sâu, cay nhẹ, ít chát.\n- Đã cạo vỏ sạch, màu nâu đỏ đẹp, tiện sử dụng.\n- Dễ bảo quản, dùng được lâu khi buộc kín túi và để nơi khô thoáng.\n\n✔ Ứng dụng phổ biến:\n- Gia vị nấu ăn: dùng cho phở, bò kho, món hầm, món nướng, nước dùng và các món cần hương quế ấm.\n- Pha trà và đồ uống: pha trà quế mật ong, trà quế gừng, trà thảo mộc hoặc trang trí đồ uống nóng.\n- Tạo hương tự nhiên: đặt trong phòng, tủ quần áo, góc decor hoặc kết hợp cùng nến, thảo mộc khô.\n- Quà tặng thảo mộc: hình thức sạch, đẹp, hương thơm tự nhiên, phù hợp làm quà nhỏ tinh tế.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Quế thanh Yên Bái xuất khẩu\n- Dạng sản phẩm: quế khô nguyên thanh, đã cạo vỏ sạch\n- Xuất xứ: Yên Bái, Việt Nam\n- Phân loại: 50g, 100g, 200g\n- Cân nặng vận chuyển: 200g\n- Bảo quản: nơi khô ráo, thoáng mát, tránh ẩm, buộc kín túi zip sau khi dùng.\n\n📍 Cam kết:\n- Sản phẩm được chọn lọc từ nguồn quế tự nhiên.\n- Hình ảnh và mô tả được chuẩn hóa rõ ràng để khách dễ chọn đúng phân loại.\n- Hỗ trợ tư vấn cách dùng quế thanh cho nấu ăn, pha trà và tạo hương.","usage":"HƯỚNG DẪN SỬ DỤNG QUẾ THANH\n\n✔ Nấu ăn:\nCho 1-2 thanh quế vào phở, bò kho, món hầm hoặc nước dùng. Vớt ra khi hương quế đã đủ thơm để món ăn không bị gắt mùi.\n\n✔ Pha trà:\nHãm 1 thanh quế nhỏ với nước nóng 5-10 phút. Có thể thêm mật ong, gừng, táo đỏ hoặc thảo mộc tùy khẩu vị.\n\n✔ Tạo hương tự nhiên:\nĐặt vài thanh quế ở bàn trà, kệ decor, tủ quần áo hoặc túi thơm để tạo mùi ấm nhẹ.\n\n✔ Bảo quản:\nBuộc kín túi sau khi dùng, để nơi khô ráo, tránh nắng gắt và tránh ẩm để giữ mùi thơm lâu hơn.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-miaao8qg5csibd","https://cf.shopee.vn/file/vn-11134207-820l4-miaaopx3emf5b9","https://cf.shopee.vn/file/vn-11134207-820l4-mia87b30ynlw32"],"reviews":[],"variants":[{"id":"shopee_variant_405301400469","name":"100g","sku":"","price":55000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-miaaopx3emf5b9","options":{}},{"id":"shopee_variant_405301400470","name":"200g","sku":"","price":120000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-miaaopx3emf5b9","options":{}},{"id":"shopee_variant_405301400468","name":"50g","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-miaaopx3emf5b9","options":{}}]},{"id":"shopee_57058955812","sku":"SP-57058955812","categoryId":"nen-thom","name":"Nến tealight 4 giờ trang trí tiệc ánh sáng ấm cháy ổn định","price":500000,"originalPrice":null,"shortDesc":"Set 50 viên nến tealight nhỏ gọn, ánh sáng ấm, phù hợp trang trí bàn tiệc, phòng ngủ, spa, thiền thư giãn và dùng kèm đèn xông tinh dầu hoặc bếp xông thảo mộc.","description":"SET 50 NẾN TEALIGHT TRANG TRÍ\n\n✔ Tổng quan sản phẩm:\nSet 50 viên nến tealight được thiết kế nhỏ gọn, dễ dùng và cháy ổn định, phù hợp để tạo ánh sáng ấm cho bàn tiệc, phòng ngủ, spa, góc thiền hoặc không gian thư giãn tại nhà.\nSản phẩm có 2 phân loại để khách chọn theo nhu cầu: vỏ trong suốt đẹp khi decor và vỏ nhôm phù hợp hơn khi dùng để xông tinh dầu, xông thảo mộc liên tục.\n\n✔ Điểm nổi bật:\n- Set 50 viên tiện lợi, dễ dự trữ và sử dụng hằng ngày.\n- Ánh sáng ấm, dịu mắt, tạo cảm giác thư giãn và chill vào buổi tối.\n- Kích thước nhỏ gọn, dễ đặt trong ly nến, đèn xông tinh dầu hoặc phụ kiện decor.\n- Vỏ trong suốt cho hiệu ứng ánh sáng đẹp, phù hợp chụp ảnh, trang trí bàn tiệc và decor phòng.\n- Vỏ nhôm chịu nhiệt tốt hơn, phù hợp dùng kèm bếp xông thảo mộc hoặc đèn xông tinh dầu trong thời gian dài.\n\n✔ Ứng dụng phổ biến:\n- Trang trí bàn tiệc, sinh nhật, đám cưới, quán cà phê, spa hoặc phòng ngủ.\n- Dùng cùng đèn xông tinh dầu để khuếch tán hương thơm nhẹ nhàng.\n- Dùng cùng bếp xông thảo mộc để tạo nhiệt ổn định khi xông nhà.\n- Setup thiền, yoga, đọc sách hoặc thư giãn buổi tối.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Set 50 nến tealight trang trí\n- Phân loại: 50 viên vỏ trong suốt, 50 viên vỏ nhôm\n- Cân nặng vận chuyển: 2000g\n- Dạng sản phẩm: nến tealight viên nhỏ\n- Phù hợp: decor, spa, thiền, xông tinh dầu, xông thảo mộc\n\n✔ Lưu ý quan trọng:\n- Vỏ trong suốt đẹp hơn khi dùng để trang trí/decor.\n- Nếu dùng để xông tinh dầu hoặc xông thảo mộc liên tục, nên chọn loại vỏ nhôm để chịu nhiệt tốt hơn và bền hơn.\n- Luôn đặt nến trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT\n\n✔ Dùng để trang trí:\nĐặt nến trong ly nến, khay decor hoặc khu vực bàn tiệc để tạo ánh sáng ấm và không gian thư giãn.\n\n✔ Dùng với đèn xông tinh dầu:\nĐặt nến vào khoang đốt của đèn xông, sau đó thêm nước và tinh dầu vào khay phía trên theo hướng dẫn của từng loại đèn.\n\n✔ Dùng với bếp xông thảo mộc:\nƯu tiên chọn phân loại vỏ nhôm nếu cần đốt liên tục để xông thảo mộc hoặc giữ nhiệt lâu hơn.\n\n✔ An toàn khi sử dụng:\nKhông để nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy và luôn tắt nến trước khi rời khỏi phòng.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp để giữ form nến đẹp và hạn chế chảy sáp.","tag":"","weight":2000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-81ztc-mn4c46ppkwsj39","https://cf.shopee.vn/file/vn-11134207-81ztc-mn4c4aqbcd1i4e","https://cf.shopee.vn/file/vn-11134207-81ztc-mn4c4eu7yf44ff","https://cf.shopee.vn/file/vn-11134207-81ztc-mn4c4c8sak1y98","https://cf.shopee.vn/file/vn-11134207-81ztc-mn4c4dla213918"],"reviews":[],"variants":[{"id":"shopee_variant_277543299479","name":"50 Viên Trong Suốt","sku":"","price":600000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn4cb39bhfk3ec","options":{}},{"id":"shopee_variant_277543299480","name":"50 Viên Vỏ Nhôm","sku":"","price":500000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn4c46ppkwsj39","options":{}}]},{"id":"shopee_56102764086","sku":"470519_mod470519","categoryId":"phu-kien","name":"Dĩa lót bếp xông đất nung cách nhiệt giữ sạch mặt bàn","price":30000,"originalPrice":null,"shortDesc":"Dĩa lót đất nung tự nhiên dùng cho bếp xông thảo mộc, bồ kết và nến tealight. Giúp cách nhiệt, giữ vệ sinh mặt bàn và hoàn thiện bộ bếp xông mộc mạc.","description":"DĨA LÓT BẾP XÔNG ĐẤT NUNG\n\n✔ Tổng quan sản phẩm:\nDĩa lót bếp xông đất nung là phụ kiện cần có khi sử dụng bếp xông thảo mộc, bồ kết hoặc đèn xông dùng nến.\nSản phẩm giúp bộ bếp xông hoàn thiện hơn, đồng thời hỗ trợ giữ vệ sinh và tăng độ an toàn khi đặt bếp trên mặt bàn.\n\n✔ Công dụng nổi bật:\n- Cách nhiệt an toàn, hạn chế nhiệt từ đáy bếp tiếp xúc trực tiếp với mặt bàn gỗ, kính hoặc đá.\n- Hứng tàn nến, sáp hoặc vụn thảo mộc rơi vãi để khu vực xông luôn gọn sạch.\n- Màu đất nung mộc mạc, ton-sur-ton với bếp xông, phù hợp không gian spa, phòng khách, bàn trà hoặc bàn thờ gia tiên.\n- Dễ kết hợp với bếp xông size 13cm và 16cm.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Dĩa lót bếp xông đất nung\n- Chất liệu: đất nung tự nhiên, chịu nhiệt tốt\n- Màu sắc: nâu đỏ gốm mộc\n- Kích thước tương thích: bếp xông đường kính khoảng 13cm - 16cm\n- Xuất xứ: Việt Nam\n- Cân nặng vận chuyển: 200g\n\n✔ Lưu ý quan trọng:\n- Sản phẩm chỉ bao gồm dĩa lót, không bao gồm bếp xông, nến hoặc thảo mộc.\n- Do là gốm đất nung, màu sắc có thể chênh lệch đậm nhạt nhẹ tùy mẻ nung.\n- Nên đặt dĩa trên bề mặt phẳng, khô ráo trước khi đặt bếp xông lên trên.\n\n📍 Cam kết:\n- Hàng đúng mô tả, đóng gói chống sốc kỹ khi vận chuyển.\n- Hỗ trợ đổi trả nếu sản phẩm bị bể vỡ do quá trình vận chuyển.","usage":"HƯỚNG DẪN SỬ DỤNG DĨA LÓT BẾP XÔNG\n\n✔ Cách dùng:\nĐặt dĩa lót trên mặt bàn phẳng, sau đó đặt bếp xông thảo mộc, bếp xông bồ kết hoặc phụ kiện xông lên giữa dĩa.\n\n✔ Khi dùng với nến:\nĐặt nến tealight vào đúng vị trí của bếp xông. Dĩa lót bên dưới giúp hứng tàn, sáp hoặc vụn thảo mộc nếu có rơi xuống.\n\n✔ Vệ sinh:\nSau khi bếp nguội hoàn toàn, lau dĩa bằng khăn khô hoặc khăn ẩm nhẹ. Không ngâm nước quá lâu để giữ độ bền của đất nung.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh va đập mạnh. Khi không dùng, có thể đặt chung với bộ bếp xông để giữ trọn bộ gọn gàng.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mik5ksxnhrew1f"],"reviews":[],"variants":[]},{"id":"shopee_55553449576","sku":"SP-55553449576","categoryId":"combo","name":"Bộ bếp xông thảo mộc đất nung xông nhà thư giãn đủ món","price":230000,"originalPrice":null,"shortDesc":"Bộ bếp xông thảo mộc đất nung full set 5 món, có bếp niêu, đế nến, dĩa lót, 10 viên nến tealight và thảo mộc tự nhiên. Phù hợp xông nhà, khử mùi, thư giãn và tạo hương ấm cho không gian sống.","description":"BỘ BẾP XÔNG THẢO MỘC ĐẤT NUNG FULL SET\n\n✔ Tổng quan sản phẩm:\nBộ bếp xông thảo mộc Phương Lâm là combo xông nhà tiện lợi, kết hợp bếp niêu đất nung mộc mạc với nến tealight và thảo mộc tự nhiên.\nSản phẩm phù hợp cho khách muốn mua một bộ đầy đủ để dùng ngay, không cần chọn lẻ từng phụ kiện.\n\n✔ Bộ sản phẩm bao gồm:\n- Bếp niêu đất nung size 13cm hoặc 16cm tùy phân loại.\n- Đế đựng nến đất nung giúp thay nến dễ hơn và an toàn hơn khi sử dụng.\n- Dĩa lót bếp giúp cách nhiệt, giữ vệ sinh mặt bàn và hoàn thiện bộ bếp.\n- 10 viên nến tealight cháy khoảng 4 giờ mỗi viên.\n- Gói thảo mộc xông tự nhiên được phối theo từng nhu cầu: tẩy uế, khử mùi, thư giãn, thanh lọc không khí, xua muỗi, giảm cảm hoặc xông nhà mới.\n\n✔ Công dụng nổi bật:\n- Xông nhà mới, xông phòng làm việc, phòng khách, phòng ngủ hoặc khu vực cần làm sạch mùi.\n- Khử mùi ẩm mốc, mùi thức ăn và tạo hương thảo mộc ấm dễ chịu.\n- Hỗ trợ không gian thư giãn, thiền, đọc sách, spa tại nhà hoặc nghỉ ngơi cuối ngày.\n- Thiết kế đất nung mộc mạc, dễ decor cùng bàn trà, kệ gỗ, góc thờ hoặc không gian phong cách tự nhiên.\n\n✔ Chọn phân loại theo nhu cầu:\n- Size 13cm: nhỏ gọn, phù hợp phòng nhỏ, bàn làm việc, phòng ngủ hoặc khách mới bắt đầu dùng bếp xông.\n- Size 16cm: lòng bếp rộng hơn, phù hợp phòng khách, không gian lớn hơn hoặc nhu cầu xông thường xuyên.\n- Bộ Tẩy Uế: phù hợp xông nhà mới, cuối năm, đầu năm, rằm hoặc mùng 1.\n- Bộ Khử Mùi: phù hợp khu vực bếp, phòng kín, phòng có mùi ẩm hoặc mùi thức ăn.\n- Bộ Thư Giãn: phù hợp phòng ngủ, spa tại nhà, thiền hoặc nghỉ ngơi buổi tối.\n- Bộ Thanh Lọc Không Khí: phù hợp dùng hằng ngày để tạo không gian thơm sạch tự nhiên.\n- Bộ Xua Muỗi: phù hợp khu vực có muỗi, côn trùng hoặc phòng cần mùi thảo mộc mạnh hơn.\n- Bộ Giảm Cảm: phù hợp khi cần hương thảo mộc ấm, dễ chịu cho mùa lạnh hoặc lúc cơ thể mệt mỏi.\n- Bộ Xông Nhà Mới: phù hợp khai trương, nhập trạch, dọn nhà hoặc làm mới không gian.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bộ bếp xông thảo mộc đất nung full set\n- Chất liệu bếp: đất nung chịu nhiệt\n- Phân loại kích thước: 13cm và 16cm\n- Số nến đi kèm: 10 viên tealight\n- Cân nặng vận chuyển: 2000g\n- Phù hợp: xông nhà, khử mùi, tẩy uế, thư giãn, decor, thanh lọc không khí\n\n✔ Lưu ý quan trọng:\n- Khi xông thảo mộc, dùng phương pháp nướng khô để thảo mộc tỏa hương, không cần cho nước.\n- Đặt bếp trên dĩa lót, bề mặt phẳng và cách xa vật dễ cháy.\n- Không chạm tay vào bếp khi đang đốt nến vì đất nung giữ nhiệt lâu.\n- Để xa tầm tay trẻ em và vật nuôi trong suốt quá trình sử dụng.","usage":"HƯỚNG DẪN SỬ DỤNG BỘ BẾP XÔNG THẢO MỘC\n\n✔ Bước 1: Chuẩn bị bếp\nĐặt dĩa lót trên mặt bàn phẳng, sau đó đặt bếp niêu đất nung lên giữa dĩa.\n\n✔ Bước 2: Đốt nến\nĐặt 1 viên nến tealight vào đế đựng nến, châm lửa rồi đưa đế nến vào lòng bếp qua cửa lò.\n\n✔ Bước 3: Cho thảo mộc\nCho một lượng thảo mộc vừa đủ vào lòng niêu phía trên. Không cần thêm nước, để thảo mộc được làm nóng khô và tỏa hương tự nhiên.\n\n✔ Bước 4: Tận hưởng hương thơm\nĐặt bếp ở nơi thông thoáng nhẹ để hương thảo mộc lan đều. Có thể thêm thảo mộc nếu muốn mùi rõ hơn.\n\n✔ Sau khi dùng:\nChờ bếp nguội hoàn toàn rồi lấy phần thảo mộc đã xông ra. Lau bếp và dĩa lót bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ An toàn:\nKhông di chuyển bếp khi nến đang cháy. Không để gần rèm, giấy, gỗ mỏng hoặc vật dễ bắt lửa. Luôn tắt nến trước khi rời khỏi phòng.","tag":"","weight":2000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mik62n59xzpiea","https://cf.shopee.vn/file/vn-11134207-820l4-mia82lp7gkqu39","https://cf.shopee.vn/file/vn-11134207-820l4-mik63sfpts0665","https://cf.shopee.vn/file/vn-11134207-820l4-mik62pwl1q83bc","https://cf.shopee.vn/file/vn-11134207-820l4-mik62rohxcsnbc"],"reviews":[],"variants":[{"id":"shopee_variant_405332605554","name":"16cm - Bộ Tẩy Uế Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605560","name":"16cm - Bộ Giảm Cảm Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605549","name":"13cm - Bộ Xua Muỗi Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605557","name":"16cm - Bộ Xông Nhà Mới Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605556","name":"16cm - Bộ Xua Muỗi Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605551","name":"13cm - Bộ Khử Mùi Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605548","name":"13cm - Bộ Thư Giãn Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605552","name":"13cm - Bộ Thanh Lọc Không Khí Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605550","name":"13cm - Bộ Xông Nhà Mới Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605558","name":"16cm - Bộ Khử Mùi Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605559","name":"16cm - Bộ Thanh Lọc Không Khí Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605553","name":"13cm - Bộ Giảm Cảm Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605555","name":"16cm - Bộ Thư Giãn Full Set","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"","options":{}},{"id":"shopee_variant_405332605547","name":"13cm - Bộ Tẩy Uế Full Set","sku":"","price":230000,"originalPrice":null,"weight":2000,"image":"","options":{}}]},{"id":"shopee_54450013830","sku":"SP-54450013830","categoryId":"nen-tru","name":"Nến trụ trắng 72h trang trí bàn tiệc cháy êm không khói","price":120000,"originalPrice":null,"shortDesc":"NẾN TRỤ KHÔNG KHÓI MÀU TRẮNG TINH KHIẾT – NÂNG TẦM KHÔNG GIAN SANG TRỌNG CỦA BẠN.","description":"NẾN TRỤ TRẮNG 72H TRANG TRÍ BÀN TIỆC CHÁY ÊM KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nNẾN TRỤ KHÔNG KHÓI MÀU TRẮNG TINH KHIẾT – NÂNG TẦM KHÔNG GIAN SANG TRỌNG CỦA BẠN.\n\n✔ Mô tả chi tiết:\nNẾN TRỤ KHÔNG KHÓI MÀU TRẮNG TINH KHIẾT – NÂNG TẦM KHÔNG GIAN SANG TRỌNG CỦA BẠN\n\nThông tin sản phẩm:\nSize S 7cm x 10cm Trang trí bàn ăn cá nhân, decor theo bộ, tạo sự cân đối.\nSize M 7cm x 15cm Kích thước phổ thông, lý tưởng cho trung tâm bàn tiệc, sảnh.\nSize L 7cm x 20cm Tạo điểm nhấn cao, ấn tượng, thích hợp đặt trên bệ lò sưởi, góc decor.\n\nThời gian đốt:\nSize S: 48h\nSize M: 68h\nSize L: 90h\n\n✨ ĐẶC ĐIỂM NỔI BẬT VÀ CHẤT LƯỢNG:\n\nKhông Khói & Sạch Sẽ: Được làm từ sáp sạch, nến cháy sạch, không tạo khói đen, không gây mùi khó chịu, giữ cho không khí trong lành, lý tưởng cho không gian kín như nhà hàng, bàn ăn.\n\nÁnh Sáng Ấm Cúng: Ngọn lửa ổn định, cháy lâu, tạo ra ánh sáng vàng dịu nhẹ, lãng mạn, hoàn hảo để tạo không khí ấm áp, thư giãn.\n\nThiết Kế Sang Trọng: Màu trắng tinh khôi, hình trụ thẳng đứng, mang lại vẻ ngoài tối giản nhưng cực kỳ tinh tế và đẳng cấp, dễ dàng hòa hợp với mọi kiểu decor từ cổ điển đến hiện đại.\n\n🍽️ ỨNG DỤNG ĐA NĂNG:\n\nTrang Trí Bàn Tiệc: Là điểm nhấn không thể thiếu cho các bữa tiệc lãng mạn, tiệc cưới, sinh nhật, sự kiện cao cấp.\n\nNhà Hàng & Khách Sạn: Tạo không gian dùng bữa ấm cúng, sang trọng, nâng cao trải nghiệm của khách hàng.\n\nKhông Gian Sống: Đặt tại phòng khách, phòng ngủ, hoặc bồn tắm để thư giãn, thiền định, hoặc tạo mùi hương nhẹ nhàng nếu dùng kèm đĩa tinh dầu.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến trụ trắng 72h trang trí bàn tiệc cháy êm không khói\n- Danh mục: Nến trụ\n- Phân loại: Size M 7x15, Size L 7x20, Size S 7x10\n- Cân nặng vận chuyển: 800g\n- Mã sản phẩm: SP-54450013830\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TRỤ TRẮNG 72H TRANG TRÍ BÀN TIỆC CHÁY ÊM KHÔNG KHÓI\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":800,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mg6e5ubuwaoae1","https://cf.shopee.vn/file/vn-11134207-820l4-mg6e6j2o2rka4f","https://cf.shopee.vn/file/vn-11134207-820l4-mg6e63iax1jff1","https://cf.shopee.vn/file/vn-11134207-820l4-mg6e66ng4pvy99","https://cf.shopee.vn/file/vn-11134207-820l4-mg6e68l9kydo3e","https://cf.shopee.vn/file/vn-11134207-820l4-mg6e6aehmtjha0","https://cf.shopee.vn/file/vn-11134207-820l4-mg6e6e3w3nyid1"],"reviews":[],"variants":[{"id":"shopee_variant_405001591546","name":"Size M 7x15","sku":"","price":140000,"originalPrice":null,"weight":800,"image":"","options":{}},{"id":"shopee_variant_405001591547","name":"Size L 7x20","sku":"","price":160000,"originalPrice":null,"weight":800,"image":"","options":{}},{"id":"shopee_variant_405001591545","name":"Size S 7x10","sku":"","price":120000,"originalPrice":null,"weight":800,"image":"","options":{}}]},{"id":"shopee_53859220256","sku":"SP-53859220256","categoryId":"thao-moc-xong","name":"Lá dứa khô tự nhiên xông nhà thơm dịu thanh lọc không gian","price":55000,"originalPrice":null,"shortDesc":"LÁ DỨA KHÔ NGUYÊN CHẤT – THƠM TỰ NHIÊN, ĐA DỤNG.","description":"LÁ DỨA KHÔ TỰ NHIÊN XÔNG NHÀ THƠM DỊU THANH LỌC KHÔNG GIAN\n\n✔ Tổng quan sản phẩm:\nLÁ DỨA KHÔ NGUYÊN CHẤT – THƠM TỰ NHIÊN, ĐA DỤNG.\n\n✔ Mô tả chi tiết:\n🌿 LÁ DỨA KHÔ NGUYÊN CHẤT – THƠM TỰ NHIÊN, ĐA DỤNG\n\n✨ ĐIỂM NỔI BẬT\nLá dứa khô tự nhiên, giữ mùi thơm dịu nhẹ như lá tươi\nKhông tẩm hóa chất, an toàn khi sử dụng\nHương thơm ngọt nhẹ, tạo cảm giác thư giãn, dễ chịu\nDễ bảo quản, tiện lợi sử dụng lâu dài\n\n📦 THÔNG TIN SẢN PHẨM\nThành phần: 100% lá dứa khô\nKhối lượng: 100g\nDạng: lá cắt khô, tiện sử dụng\nBảo quản: nơi khô ráo, thoáng mát, tránh ẩm\n\n🌱 CÔNG DỤNG\nDùng xông phòng giúp không gian thơm mát, dễ chịu\nNấu nước lá dứa thanh mát\nLàm nguyên liệu nấu chè, bánh, món ăn\nCó thể kết hợp với thảo mộc khác để xông thư giãn\n\n📌 HƯỚNG DẪN SỬ DỤNG\nXông: dùng 1 nắm nhỏ, đun với nước hoặc cho vào nồi xông\nNấu nước: rửa sơ, đun sôi 5–10 phút\nLàm bánh: ngâm mềm trước khi dùng\n\n⚠️ LƯU Ý\nSản phẩm là thảo mộc tự nhiên, màu sắc có thể thay đổi nhẹ\nKhông dùng khi có dấu hiệu ẩm mốc\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Lá dứa khô tự nhiên xông nhà thơm dịu thanh lọc không gian\n- Danh mục: Thảo mộc xông\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-53859220256\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG LÁ DỨA KHÔ TỰ NHIÊN XÔNG NHÀ THƠM DỊU THANH LỌC KHÔNG GIAN\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-81ztc-mnazm74o66tk75","https://cf.shopee.vn/file/vn-11134207-81ztc-mnazn33ab2mgd6"],"reviews":[],"variants":[]},{"id":"shopee_48452789252","sku":"470514_mod470514","categoryId":"phu-kien","name":"Ly đựng nến đất nung dùng bếp xông an toàn tiện cầm","price":30000,"originalPrice":null,"shortDesc":"🔥 TẠI SAO BẠN CẦN SẢN PHẨM NÀY? Nếu bạn đang sử dụng bếp xông thảo mộc hoặc xông tinh dầu, chiếc ly đựng nến này là phụ kiện cần thiết.","description":"LY ĐỰNG NẾN ĐẤT NUNG DÙNG BẾP XÔNG AN TOÀN TIỆN CẦM\n\n✔ Tổng quan sản phẩm:\n🔥 TẠI SAO BẠN CẦN SẢN PHẨM NÀY? Nếu bạn đang sử dụng bếp xông thảo mộc hoặc xông tinh dầu, chiếc ly đựng nến này là phụ kiện cần thiết.\n\n✔ Mô tả chi tiết:\nLY ĐỰNG NẾN (GÁO NẾN) ĐẤT NUNG CÓ TAY CẦM\n🔥 TẠI SAO BẠN CẦN SẢN PHẨM NÀY? Nếu bạn đang sử dụng bếp xông thảo mộc hoặc xông tinh dầu, chiếc ly đựng nến này là phụ kiện cần thiết\n\n✅ An toàn tuyệt đối: Thiết kế có tay cầm giúp bạn dễ dàng đưa nến vào hoặc lấy nến ra khỏi lòng bếp đang nóng mà không sợ bị bỏng tay. \n✅ Giữ vệ sinh: Ly hứng trọn phần sáp nến khi tan chảy, ngăn sáp tràn ra làm bẩn lòng bếp xông, giúp việc vệ sinh bếp trở nên nhẹ nhàng hơn. \n✅ Thẩm mỹ: Chất liệu đất nung đồng bộ với bếp xông, tạo vẻ đẹp mộc mạc, cổ điển cho góc thư giãn của bạn.\n\n📝 THÔNG TIN CHI TIẾT:\nChất liệu: Đất nung tự nhiên, chịu nhiệt cao, không nứt vỡ khi đốt nến lâu.\nMàu sắc: Nâu đỏ (màu gốm truyền thống).\nCông năng: Dùng để đựng nến tealight (nến viên tròn) đặt vào bên trong các loại bếp xông thảo mộc, bếp xông bồ kết hoặc đèn xông tinh dầu.\n\n⚠️ LƯU Ý QUAN TRỌNG (ĐỌC KỸ TRƯỚC KHI MUA):\nSản phẩm bán ra là 01 LY ĐỰNG NẾN (ĐẾ NẾN).\nKHÔNG BAO GỒM: Bếp xông, nến và thảo mộc đi kèm. Hình ảnh bếp và nến chỉ mang tính chất minh họa cho cách sử dụng sản phẩm.\nVì là hàng gốm thủ công, màu sắc có thể chênh lệch đậm nhạt đôi chút tùy mẻ nung nhưng chất lượng luôn đảm bảo.\n\n📦 QUY CÁCH ĐÓNG GÓI: Hàng được bọc chống sốc kỹ càng, đảm bảo an toàn khi vận chuyển xa.\nNẾN PHƯƠNG LÂM CAM KẾT: \n⭐️ Hàng đúng mô tả, hình ảnh thật do shop tự chụp. \n⭐️ Đổi trả nếu sản phẩm bị bể vỡ do vận chuyển.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Ly đựng nến đất nung dùng bếp xông an toàn tiện cầm\n- Danh mục: Bếp xông / đèn xông\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: 470514_mod470514\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG LY ĐỰNG NẾN ĐẤT NUNG DÙNG BẾP XÔNG AN TOÀN TIỆN CẦM\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mi0auosgwcn5af"],"reviews":[],"variants":[]},{"id":"shopee_41402989656","sku":"SP-41402989656","categoryId":"bep-xong","name":"Máy xông tinh dầu tự động thơm phòng nhanh sang trọng","price":34000,"originalPrice":null,"shortDesc":"Máy khuếch tán tinh dầu tự động, máy xịt thơm phòng xông tinh dầu.","description":"MÁY XÔNG TINH DẦU TỰ ĐỘNG THƠM PHÒNG NHANH SANG TRỌNG\n\n✔ Tổng quan sản phẩm:\nMáy khuếch tán tinh dầu tự động, máy xịt thơm phòng xông tinh dầu.\n\n✔ Mô tả chi tiết:\nThông tin sản phẩm:\nMáy khuếch tán tinh dầu tự động, máy xịt thơm phòng xông tinh dầu\n- Máy xông tinh dầu tự động có pin sạc\n- Sử dụng được cho Phòng khách, Phòng ngủ, Phòng ngủ ,Nhà vệ sinh, Khách sạn, Ô tô\n- Máy tạo độ ẩm Sáng tạo Không tiếng ồn\n\nThông số sản phẩm:\nMô hình: Máy xông tinh dầu\nPhương pháp tạo ẩm: tạo ion\nKiểm soát độ ẩm: thủ công / tự động\nThể loại: Xông tinh dầu\nDung lượng pin: 2000mAh\nDung tích tinh dầu: 50ml\n\nĐặc điểm:\n- Không chỉ là một chiếc máy tạo hương thơm mà còn là một bầu không khí đầy màu sắc\n- Hình thức đẹp và trọng lượng nhẹ.\n- Yên tĩnh và có thể tạo ra một môi trường yên tĩnh và thoải mái cho bạn.\n\nCông dụng:\n- Sử dụng để bàn hoặc treo tường\n- Màn hình kỹ thuật số hiện thị chế độ xông\n- Máy tạo ra hương thơm nguyên tử Nano\n- Có thể sạc lại\n- Có 4 chế độ điều chỉnh\n\n4 chế độ phun hương thơm: Bấm giữ để bật/tắt\n• Chế độ 1: Phun tinh dầu 3 giây chu kỳ liên tục 5 phút một lần.\n• Chế độ 2: Phun tinh dầu 3 giây chu kỳ liên tục sau mỗi 10 phút.\n• Chế độ 3: Phun tinh dầu 3 giây chu kỳ liên tục 20 phút một lần.\n• Chế độ 4: phun liên tục.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Máy xông tinh dầu tự động thơm phòng nhanh sang trọng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: Máy + Hoa Dành Dành, Máy + Shangri-La, Hoa Dành Dành, Chanh, Máy + Chanh, Hoa Oải Hương, Hương Shangri-La, Chuông Gió Xanh, Máy + Oải Hương, Chỉ máy (Không lọ), Hương Hilton, Máy + Chuông Gió, và 1 phân loại khác\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-41402989656\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG MÁY XÔNG TINH DẦU TỰ ĐỘNG THƠM PHÒNG NHANH SANG TRỌNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":200,"hidden":true,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7ra0g-maifmqtp3mbl19","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifn56m36bl37","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifn6yzgz41a4","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifn9phgu4s86","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifn3qq73wsfe","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifo6dxn8oxad","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifo7gs2e9t19","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifohof4eddad","https://cf.shopee.vn/file/vn-11134207-7ra0g-maifojhmgzgsa8"],"reviews":[],"variants":[{"id":"shopee_variant_159195646314","name":"Máy + Hoa Dành Dành","sku":"","price":170000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maifojhmgzgsa8","options":{}},{"id":"shopee_variant_159195646313","name":"Máy + Shangri-La","sku":"","price":170000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maifo7gs2e9t19","options":{}},{"id":"shopee_variant_275246448541","name":"Hoa Dành Dành","sku":"","price":34000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maifobv7mjsxca","options":{}},{"id":"shopee_variant_275246448542","name":"Chanh","sku":"","price":34000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijr2zegptt26","options":{}},{"id":"shopee_variant_159195646312","name":"Máy + Chanh","sku":"","price":170000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijrkh8tm0xc6","options":{}},{"id":"shopee_variant_275246448539","name":"Hoa Oải Hương","sku":"","price":34000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijqochudhdb0","options":{}},{"id":"shopee_variant_275246448538","name":"Hương Shangri-La","sku":"","price":34000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijqm86y18h4b","options":{}},{"id":"shopee_variant_275246448540","name":"Chuông Gió Xanh","sku":"","price":34000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijqtdygts168","options":{}},{"id":"shopee_variant_159195646311","name":"Máy + Oải Hương","sku":"","price":170000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maifohof4eddad","options":{}},{"id":"shopee_variant_275246448536","name":"Chỉ máy (Không lọ)","sku":"","price":150000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijq6a4a4e9c5","options":{}},{"id":"shopee_variant_275246448537","name":"Hương Hilton","sku":"","price":34000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijqcbnfsg1e7","options":{}},{"id":"shopee_variant_159195646310","name":"Máy + Chuông Gió","sku":"","price":170000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maijrcqo59xo1f","options":{}},{"id":"shopee_variant_275246448543","name":"Máy+ Hilton","sku":"","price":170000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-maifo6dxn8oxad","options":{}}]},{"id":"shopee_41330081336","sku":"SP-41330081336","categoryId":"phu-kien","name":"Bộ phụ kiện xông nhà đất nung dùng bếp niêu tiện lợi","price":40000,"originalPrice":null,"shortDesc":"Chất liệu: Gốm đất nung tự nhiên, giữ nhiệt tốt và chịu nhiệt bền bỉ","description":"BỘ PHỤ KIỆN XÔNG NHÀ ĐẤT NUNG DÙNG BẾP NIÊU TIỆN LỢI\n\n✔ Tổng quan sản phẩm:\nChất liệu: Gốm đất nung tự nhiên, giữ nhiệt tốt và chịu nhiệt bền bỉ\n\n✔ Mô tả chi tiết:\n✨ Đặc điểm nổi bật:\nChất liệu: Gốm đất nung tự nhiên, giữ nhiệt tốt và chịu nhiệt bền bỉ.\nThiết kế: Phong cách tối giản, mộc mạc, phù hợp với mọi không gian từ phòng khách đến bàn trà, phòng thiền.\nĐa năng: Sử dụng để đốt nụ trầm hương, làm đèn xông tinh dầu hoặc đốt nến tealight trang trí.\nAn toàn: Chân đế dày dặn, cách nhiệt tốt với bề mặt bàn.\n🛡️ CHÍNH SÁCH BẢO HÀNH ĐẶC BIỆT: \nPhuong Lam cam kết Bảo Hành Bể Vỡ 100%. \nNếu sản phẩm bị hư hỏng trong quá trình vận chuyển, bạn chỉ cần gửi video khui hàng, shop sẽ gửi bù sản phẩm mới hoàn toàn miễn phí.\n📦 Bộ sản phẩm bao gồm: (Bạn điền các tùy chọn phân loại ở đây, ví dụ: Dĩa lót/Đế nến/Trọn bộ).\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bộ phụ kiện xông nhà đất nung dùng bếp niêu tiện lợi\n- Danh mục: Combo xông nhà\n- Phân loại: Nắp lẻ sz 16, Đế Nến, Dĩa Lót, Nắp lẻ sz 13\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-41330081336\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG BỘ PHỤ KIỆN XÔNG NHÀ ĐẤT NUNG DÙNG BẾP NIÊU TIỆN LỢI\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r0cmrtqtgcd","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r0fet179i8f","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r03hcr7r7e4","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r0ibhwhz989"],"reviews":[],"variants":[{"id":"shopee_variant_335787476785","name":"Nắp lẻ sz 16","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r03hcr7r7e4","options":{}},{"id":"shopee_variant_335787476782","name":"Đế Nến","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r0ibhwhz989","options":{}},{"id":"shopee_variant_335787476783","name":"Dĩa Lót","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r0fet179i8f","options":{}},{"id":"shopee_variant_335787476784","name":"Nắp lẻ sz 13","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r03hcr7r7e4","options":{}}]},{"id":"shopee_40170692234","sku":"SP-40170692234","categoryId":"nu-tram","name":"Nụ trầm hương tự nhiên xông nhà thiền định thơm dịu","price":400000,"originalPrice":null,"shortDesc":"Nụ trầm hương tự nhiên, mùi thơm nhẹ nhàng, giúp thư giãn tinh thần, giảm stress và thanh lọc không gian sống. Phù hợp dùng khi thiền, yoga, làm việc hoặc tiếp khách","description":"NỤ TRẦM HƯƠNG TỰ NHIÊN XÔNG NHÀ THIỀN ĐỊNH THƠM DỊU\n\n✔ Tổng quan sản phẩm:\nNụ trầm hương tự nhiên, mùi thơm nhẹ nhàng, giúp thư giãn tinh thần, giảm stress và thanh lọc không gian sống. Phù hợp dùng khi thiền, yoga, làm việc hoặc tiếp khách\n\n✔ Mô tả chi tiết:\n✨ Nụ trầm hương tự nhiên, mùi thơm nhẹ nhàng, giúp thư giãn tinh thần, giảm stress và thanh lọc không gian sống. Phù hợp dùng khi thiền, yoga, làm việc hoặc tiếp khách.\n✔ Cháy đều – khói dịu – không gắt\n✔ Hương thơm ấm, dễ chịu, không hóa chất\n✔ Dùng được với thác khói hoặc lư xông trầm\n\nII. THÔNG TIN SẢN PHẨM:\nThành phần: Trầm Hương Tự Nhiên\nThời gian cháy: 20-30 phút/nụ\nQuy cách:\n- Hộp nhỏ: 40 nụ\n- Hộp lớn: 65 nụ\n\nXuất xứ: Việt Nam\n\nIII. CÔNG DỤNG NỤ TRẦM HƯƠNG TỰ NHIÊN:\nThanh lọc không khí: Loại bỏ mùi khó chịu, mang lại không gian trong lành.\nThu hút tài lộc: Dùng trong dịp khai trương, tân gia, lễ Tết để mang lại may mắn.\nThư giãn tinh thần: Giúp giảm căng thẳng, dễ ngủ và tạo cảm giác an yên.\nKhông gian thờ cúng: Tạo sự trang nghiêm, thanh tịnh cho nơi thờ cúng.\nAn toàn: Mùi hương dịu nhẹ, không cay mắt, an toàn cho cả trẻ em.\n\nIV. HƯỚNG DẪN SỬ DỤNG:\nĐốt nhang nụ trầm hương, đặt lên thác khói hoặc lư đồng\nKhói trầm chảy ngược tạo hiệu ứng thẩm mỹ, giúp tâm trí thư giãn\nDùng trong phòng máy lạnh hoặc phòng kín đều phù hợp\n\nCAM KẾT CHẤT LƯỢNG:\n✅ KHÔNG hóa chất – KHÔNG tạp chất\n✅ KHÔNG cay mắt – KHÔNG gây dị ứng\n🎯 1 đổi 1 trong 7 ngày nếu sản phẩm lỗi\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nụ trầm hương tự nhiên xông nhà thiền định thơm dịu\n- Danh mục: Nụ trầm\n- Phân loại: HŨ 65 NỤ, HŨ 40 NỤ\n- Cân nặng vận chuyển: 300g\n- Mã sản phẩm: SP-40170692234\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NỤ TRẦM HƯƠNG TỰ NHIÊN XÔNG NHÀ THIỀN ĐỊNH THƠM DỊU\n\n✔ Cách đốt:\nĐặt nụ trầm lên đế đốt chịu nhiệt, châm lửa phần đầu nụ rồi thổi nhẹ để nụ cháy âm ỉ.\n\n✔ Không gian phù hợp:\nDùng trong phòng khách, phòng thiền, phòng làm việc hoặc góc thư giãn.\n\n✔ An toàn:\nKhông đặt gần vật dễ cháy và không để nụ trầm cháy khi không có người trông coi.\n\n✔ Bảo quản:\nĐậy kín hộp/túi sau khi dùng, tránh ẩm để giữ hương tốt hơn.","tag":"","weight":300,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-81ztc-mn2pt9elz4si94","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2ea975ppty9b","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2e90dsun0g67","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2eaiwrtcld9b","https://cf.shopee.vn/file/vn-11134207-820l4-mez84dov3957db","https://cf.shopee.vn/file/vn-11134207-820l4-mez84cdel8gfff","https://cf.shopee.vn/file/vn-11134207-820l4-mez84s36df6500","https://cf.shopee.vn/file/vn-11134207-820l4-mez84lr2fmz09b","https://cf.shopee.vn/file/vn-11134207-820l4-mez84n44bx1q77"],"reviews":[],"variants":[{"id":"shopee_variant_271689735957","name":"HŨ 65 NỤ","sku":"","price":500000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2pua8neg3k51","options":{}},{"id":"shopee_variant_271689735956","name":"HŨ 40 NỤ","sku":"","price":400000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2pua8neg3k51","options":{}}]},{"id":"shopee_29011454025","sku":"SP-29011454025","categoryId":"nen-thom","name":"Nến tealight 4 giờ hương lài trang trí tiệc không khói","price":60000,"originalPrice":null,"shortDesc":"Con người như những viên nến thơm, cần trải qua những thử thách và khó khăn mới có thể phát huy hương thơm đích thực của mình!!!.","description":"NẾN TEALIGHT 4 GIỜ HƯƠNG LÀI TRANG TRÍ TIỆC KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nCon người như những viên nến thơm, cần trải qua những thử thách và khó khăn mới có thể phát huy hương thơm đích thực của mình!!!.\n\n✔ Mô tả chi tiết:\n🍁Con người như những viên nến thơm, cần trải qua những thử thách và khó khăn mới có thể phát huy hương thơm đích thực của mình!!!\n\nLƯU Ý: Trên thị trường có 2 Loại NẾN ĐỦ GIỜ Và NẾN THIẾU GIỜ, Shop chỉ bán loại NẾN ĐỦ GIỜ nên giá sẽ nhỉnh hơn 1 chút.\n\n✔ Thông số kĩ thuật: \nHương thơm: Lài\nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 13 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: Đủ 4 tiếng\n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn hương thơm lài. Khi cháy không khói, cháy trong 4 tiếng liên tục 1 viên.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nMọi ý kiến đóng góp, shop luôn sẵn sàng hỗ trợ ở kênh chat của shop\n\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ hương lài trang trí tiệc không khói\n- Danh mục: Nến thơm / nến tealight\n- Phân loại: Hộp 50v 4h - Lài, 2Vỉ 4h/20v - Lài, Hộp 100v 4h - Lài\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-29011454025\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ HƯƠNG LÀI TRANG TRÍ TIỆC KHÔNG KHÓI\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-m08tssymndsfd0","https://cf.shopee.vn/file/vn-11134207-7r98o-m08uo4lchx4d73","https://cf.shopee.vn/file/vn-11134207-7r98o-m08uot2kocy7ed","https://cf.shopee.vn/file/vn-11134207-7r98o-m08uoca98p2l7a","https://cf.shopee.vn/file/vn-11134207-7r98o-m08uoj2paz8t8c","https://cf.shopee.vn/file/vn-11134207-7r98o-m08updmklgnj96","https://cf.shopee.vn/file/vn-11134207-7r98o-m08upm4w56uld9"],"reviews":[],"variants":[{"id":"shopee_variant_185395649762","name":"Hộp 50v 4h - Lài","sku":"","price":145000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-m08uknnxbcode6","options":{}},{"id":"shopee_variant_185395649763","name":"2Vỉ 4h/20v - Lài","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-m08ukpzpwqkvfe","options":{}},{"id":"shopee_variant_185395649761","name":"Hộp 100v 4h - Lài","sku":"","price":260000,"originalPrice":null,"weight":1500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-m08ukwrc08lrde","options":{}}]},{"id":"shopee_28991652145","sku":"SP-28991652145","categoryId":"combo","name":"Bộ xông nhà tẩy uế thảo mộc khử mùi thu hút may mắn","price":120000,"originalPrice":null,"shortDesc":"BẢO HÀNH: NẾU TRONG QUÁ TRÌNH VẬN CHUYỂN BỊ BỂ VỠ SHOP SẼ ĐỔI CHO BẠN CÁI MỚI.","description":"BỘ XÔNG NHÀ TẨY UẾ THẢO MỘC KHỬ MÙI THU HÚT MAY MẮN\n\n✔ Tổng quan sản phẩm:\nBẢO HÀNH: NẾU TRONG QUÁ TRÌNH VẬN CHUYỂN BỊ BỂ VỠ SHOP SẼ ĐỔI CHO BẠN CÁI MỚI.\n\n✔ Mô tả chi tiết:\nBẢO HÀNH: NẾU TRONG QUÁ TRÌNH VẬN CHUYỂN BỊ BỂ VỠ SHOP SẼ ĐỔI CHO BẠN CÁI MỚI\n\nTHÔNG TIN SẢN PHẨM:\n+ Bếp: Nhiều kích cỡ tự chọn\n+ 10 Viên nến đốt trong 4 giờ/ Viên (bộ tiết kiệm chỉ có 1 viên)\n+ Gói thảo mộc xông: mix nhiều mùi theo từng nhu cầu\n+ 1 đế đựng nến tránh bỏng tay (bộ tiết kiệm sẽ không có)\n\nHướng dẫn sử dụng: đốt 1 - 3 viên nến dưới bếp, cho thảo mộc lên mặt bếp\n\nCÔNG DỤNG XÔNG THẢO MỘC\nMỗi ngôi nhà đều cần một khởi đầu mới mẻ. Bộ Xông Nhà Khởi Đầu Thuận Lợi sẽ giúp bạn làm mọi chuyện dễ dàng.\n\nCảm giác thư thái ngay từ hơi thở: Từ khoảnh khắc đầu tiên, hương thơm tự nhiên của thảo mộc sẽ lan tỏa, mang lại cảm giác thanh khiết, giúp đường thở thông thoáng và dễ chịu, đón chào khong khi trong lành!\n\nKhông gian sạch sẽ, không lo côn trùng: Thay vì dùng hóa chất, hãy để sức mạnh của tự nhiên bảo vệ ngôi nhà bạn. Khói thảo mộc vừa làm sạch không khí, vừa nhẹ nhàng xua đuổi các vị khách không mời như muỗi, ruồi, kiến.\n\nNăng lượng tươi mới cho ngôi nhà: Một nén thảo mộc được đốt lên không chỉ là khói và hương thơm, mà còn là cách để bạn xua tan những điều không may, mang lại nguồn năng lượng tích cực, sự thịnh vượng và bình an cho cả gia đình.\n\nXUẤT XỨ: VIỆT NAM\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bộ xông nhà tẩy uế thảo mộc khử mùi thu hút may mắn\n- Danh mục: Combo xông nhà\n- Phân loại: BỘ BẾP 16CM, BỘ XÔNG XUA MUỖI, BỘ TIẾT KIỆM 16CM, BỘ TIẾT KIỆM 13CM, BỘ XÔNG GIẢI CẢM, BỘ XÔNG THƯ GIÃN, BỘ XÔNG CAO CẤP 13CM, BỘ XÔNG NHÀ MỚI, BỘ XÔNG KHỬ MÙI, BỘ XÔNG TẨY UẾ, BỘ BẾP 13CM, BỘ XÔNG CAO CẤP 16CM\n- Cân nặng vận chuyển: 2000g\n- Mã sản phẩm: SP-28991652145\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG BỘ XÔNG NHÀ TẨY UẾ THẢO MỘC KHỬ MÙI THU HÚT MAY MẮN\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":2000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-meracf95o3cxaf","https://cf.shopee.vn/file/vn-11134207-820l4-meraaf49fz0h1e","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-820l4-merad9z3yznr95","https://cf.shopee.vn/file/vn-11134207-820l4-merabdphgirk6b","https://cf.shopee.vn/file/vn-11134207-820l4-merabp9yoohv75","https://cf.shopee.vn/file/vn-11134207-820l4-merab4dmduypb8","https://cf.shopee.vn/file/vn-11134207-820l4-meraatrq2wp128"],"reviews":[],"variants":[{"id":"shopee_variant_276593039596","name":"BỘ BẾP 16CM","sku":"","price":270000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32r4zy0bgn4c","options":{}},{"id":"shopee_variant_276593039600","name":"BỘ XÔNG XUA MUỖI","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32hr3h3hfm8e","options":{}},{"id":"shopee_variant_291959085301","name":"BỘ TIẾT KIỆM 16CM","sku":"","price":140000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mftq1q9r3cax2e","options":{}},{"id":"shopee_variant_291959085300","name":"BỘ TIẾT KIỆM 13CM","sku":"","price":120000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mftq1otr7zt63b","options":{}},{"id":"shopee_variant_276593039603","name":"BỘ XÔNG GIẢI CẢM","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32i51tmy9ua0","options":{}},{"id":"shopee_variant_276593039597","name":"BỘ XÔNG THƯ GIÃN","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32ip10ei9y4f","options":{}},{"id":"shopee_variant_262243998906","name":"BỘ XÔNG CAO CẤP 13CM","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mik5fds8pxxi86","options":{}},{"id":"shopee_variant_276593039601","name":"BỘ XÔNG NHÀ MỚI","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32jv2qdlhd09","options":{}},{"id":"shopee_variant_276593039599","name":"BỘ XÔNG KHỬ MÙI","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32s9cz9gqp42","options":{}},{"id":"shopee_variant_276593039598","name":"BỘ XÔNG TẨY UẾ","sku":"","price":260000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32kec7nxfqb1","options":{}},{"id":"shopee_variant_276593039595","name":"BỘ BẾP 13CM","sku":"","price":250000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32r2z058u99d","options":{}},{"id":"shopee_variant_262243998907","name":"BỘ XÔNG CAO CẤP 16CM","sku":"","price":280000,"originalPrice":null,"weight":2000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mik5fcbv5k3l74","options":{}}]},{"id":"shopee_28842006335","sku":"SP-28842006335","categoryId":"nu-tram","name":"Nụ trầm hương Phương Lâm xông nhà tẩy uế thư giãn","price":250000,"originalPrice":null,"shortDesc":"NỤ TRẦM HƯƠNG TỰ NHIÊN | XÔNG NHÀ TẨY UẾ – CHIÊU TÀI LỘC.","description":"NỤ TRẦM HƯƠNG PHƯƠNG LÂM XÔNG NHÀ TẨY UẾ THƯ GIÃN\n\n✔ Tổng quan sản phẩm:\nNỤ TRẦM HƯƠNG TỰ NHIÊN | XÔNG NHÀ TẨY UẾ – CHIÊU TÀI LỘC.\n\n✔ Mô tả chi tiết:\nNỤ TRẦM HƯƠNG TỰ NHIÊN | XÔNG NHÀ TẨY UẾ – CHIÊU TÀI LỘC\n\nI. GIỚI THIỆU SẢN PHẨM NỤ TRẦM HƯƠNG:\nNụ Trầm Hương Thiên Nhiên Phương Lâm được làm từ 100% trầm hương tự nhiên, mang đến hương thơm thanh khiết, giúp thanh lọc không gian và thu hút năng lượng tích cực. Sản phẩm dạng nụ nhỏ gọn, tiện lợi để xông ở nhiều nơi như phòng khách, phòng ngủ, phòng làm việc hay phòng thờ.\n\nII. THÔNG TIN SẢN PHẨM:\n\nThành phần: Trầm Hương Tự Nhiên\nThời gian cháy: 30 phút/nụ\nQuy cách:\n- Hộp nhỏ: 40 nụ\n- Hộp lớn: 65 nụ\nXuất xứ: Việt Nam\n\nIII. CÔNG DỤNG NỤ TRẦM HƯƠNG TỰ NHIÊN:\nThanh lọc không khí: Loại bỏ mùi khó chịu, mang lại không gian trong lành.\nThu hút tài lộc: Dùng trong dịp khai trương, tân gia, lễ Tết để mang lại may mắn.\nThư giãn tinh thần: Giúp giảm căng thẳng, dễ ngủ và tạo cảm giác an yên.\nKhông gian thờ cúng: Tạo sự trang nghiêm, thanh tịnh cho nơi thờ cúng.\nAn toàn: Mùi hương dịu nhẹ, không cay mắt, an toàn cho cả trẻ em.\n\nIV. HƯỚNG DẪN SỬ DỤNG:\nĐốt nhang nụ trầm hương, đặt lên thác khói hoặc lư đồng\nKhói trầm chảy ngược tạo hiệu ứng thẩm mỹ, giúp tâm trí thư giãn\nDùng trong phòng máy lạnh hoặc phòng kín đều phù hợp\n\nCAM KẾT CHẤT LƯỢNG:\n✅ KHÔNG hóa chất – KHÔNG tạp chất\n✅ KHÔNG cay mắt – KHÔNG gây dị ứng\n🎯 1 đổi 1 trong 7 ngày nếu sản phẩm lỗi\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nụ trầm hương Phương Lâm xông nhà tẩy uế thư giãn\n- Danh mục: Nụ trầm\n- Phân loại: HỘP 65 NỤ, HỘP 40 NỤ\n- Cân nặng vận chuyển: 500g\n- Mã sản phẩm: SP-28842006335\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NỤ TRẦM HƯƠNG PHƯƠNG LÂM XÔNG NHÀ TẨY UẾ THƯ GIÃN\n\n✔ Cách đốt:\nĐặt nụ trầm lên đế đốt chịu nhiệt, châm lửa phần đầu nụ rồi thổi nhẹ để nụ cháy âm ỉ.\n\n✔ Không gian phù hợp:\nDùng trong phòng khách, phòng thiền, phòng làm việc hoặc góc thư giãn.\n\n✔ An toàn:\nKhông đặt gần vật dễ cháy và không để nụ trầm cháy khi không có người trông coi.\n\n✔ Bảo quản:\nĐậy kín hộp/túi sau khi dùng, tránh ẩm để giữ hương tốt hơn.","tag":"","weight":500,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-81ztc-mn2q20lgcmbq5d","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2pw2qxztaedb","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2e90dsun0g67","https://cf.shopee.vn/file/vn-11134207-81ztc-mn2eaiwrtcld9b","https://cf.shopee.vn/file/vn-11134207-820l4-mez84cdel8gfff","https://cf.shopee.vn/file/vn-11134207-820l4-mez84dov3957db","https://cf.shopee.vn/file/vn-11134207-820l4-mez84s36df6500","https://cf.shopee.vn/file/vn-11134207-820l4-mez84lr2fmz09b","https://cf.shopee.vn/file/vn-11134207-820l4-mez84n44bx1q77"],"reviews":[],"variants":[{"id":"shopee_variant_253939287160","name":"HỘP 65 NỤ","sku":"","price":600000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2pua8neg3k51","options":{}},{"id":"shopee_variant_253939287161","name":"HỘP 40 NỤ","sku":"","price":250000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mn2pua8neg3k51","options":{}}]},{"id":"shopee_28422178672","sku":"SP-28422178672","categoryId":"phu-kien","name":"Nắp bếp niêu xông thảo mộc đất nung giữ nhiệt tiện thay","price":25000,"originalPrice":null,"shortDesc":"Hướng dẫn sử dụng: Chọn thảo dược và đặt lên mặt bếp cho 1 viên vào miệng bếp và đốt","description":"NẮP BẾP NIÊU XÔNG THẢO MỘC ĐẤT NUNG GIỮ NHIỆT TIỆN THAY\n\n✔ Tổng quan sản phẩm:\nHướng dẫn sử dụng: Chọn thảo dược và đặt lên mặt bếp cho 1 viên vào miệng bếp và đốt\n\n✔ Mô tả chi tiết:\nLẻ nắp bếp niêu dùng xông thảo mộc\n\nThành phần: 100% đất sét\nThông số kĩ thuật: đường kính 15cm và 13cm\nHướng dẫn sử dụng: Chọn thảo dược và đặt lên mặt bếp cho 1 viên vào miệng bếp và đốt. \n✔ Bảo quản: tránh làm rơi rớt, va đập mạnh có thể làm vỡ hoặc mẻ\n\nÔNG DỤNG xông thảo mộc:\n✔ Hỗ trợ hô hấp: Hương thơm của các thảo dược trong xông thảo mộc có thể hỗ trợ làm sạch đường hô hấp, giúp làm thông thoáng và dễ thở hơn.\n✔ Thư giãn tinh thần: Hương thơm từ thảo dược giúp giảm căng thẳng và lo âu.\n✔ Tăng cường tuần hoàn: Cải thiện việc cung cấp máu và dưỡng chất cho cơ thể.\n\n📍 Shop cam kết sẽ ĐỀN BÙ cho khách hàng nếu quá trình vận chuyển làm VỠ sản phẩm.\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nắp bếp niêu xông thảo mộc đất nung giữ nhiệt tiện thay\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: Nắp Size 15cm, Nắp Size 13cm\n- Cân nặng vận chuyển: 300g\n- Mã sản phẩm: SP-28422178672\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẮP BẾP NIÊU XÔNG THẢO MỘC ĐẤT NUNG GIỮ NHIỆT TIỆN THAY\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":300,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-81ztc-mn2r03hcr7r7e4"],"reviews":[],"variants":[{"id":"shopee_variant_247374495675","name":"Nắp Size 15cm","sku":"","price":30000,"originalPrice":null,"weight":300,"image":"","options":{}},{"id":"shopee_variant_247374495674","name":"Nắp Size 13cm","sku":"","price":25000,"originalPrice":null,"weight":300,"image":"","options":{}}]},{"id":"shopee_28251842874","sku":"470535_mod470535","categoryId":"nen-thom","name":"Nến tealight 8 giờ vỏ nhôm xông tinh dầu không mùi","price":11000,"originalPrice":null,"shortDesc":"Kích thước 1 viên: Cao 2,5cm đường kính 3,5cm.","description":"NẾN TEALIGHT 8 GIỜ VỎ NHÔM XÔNG TINH DẦU KHÔNG MÙI\n\n✔ Tổng quan sản phẩm:\nKích thước 1 viên: Cao 2,5cm đường kính 3,5cm.\n\n✔ Mô tả chi tiết:\nNẾN TEALIGHT VIÊN CHÁY 8 GIỜ.\n✔ Thông số kĩ thuật: \nKích thước 1 viên: Cao 2,5cm đường kính 3,5cm\nKhối lượng: 25 gam/ viên\nChất liệu: Vổ nhôm, sáp\nThời gian cháy: 8h\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn vỏ nhôm, Chuyên dùng để trang trí tiệc, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng..... Khi cháy không khói, không mùi, có thể cháy trong 8 tới 10 giờ tiếng liên tục.\n\nXuất xứ: Việt nam \n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 8 giờ vỏ nhôm xông tinh dầu không mùi\n- Danh mục: Bếp xông / đèn xông\n- Cân nặng vận chuyển: 23g\n- Mã sản phẩm: 470535_mod470535\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 8 GIỜ VỎ NHÔM XÔNG TINH DẦU KHÔNG MÙI\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":23,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7ras8-mdr82mbakrvz1d","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm4a6cl1vq50","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm4bo6eaerad","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm46urg1xi78","https://cf.shopee.vn/file/vn-11134207-7r98o-lw5qxdpa3pi34e","https://cf.shopee.vn/file/vn-11134207-7r98o-lw5qxdpa0wd71e","https://cf.shopee.vn/file/vn-11134207-7r98o-lw5qxdpa2axn7a"],"reviews":[],"variants":[]},{"id":"shopee_28125966432","sku":"CBGC","categoryId":"thao-moc-xong","name":"Thảo mộc giảm cảm xông hơi dễ chịu thanh lọc không khí","price":55000,"originalPrice":null,"shortDesc":"GÓI XÔNG GIẢI CẢM THẢO MỘC 100G – THANH LỌC, THƯ GIÃN, GIẢM CẢM 🌿💨.","description":"THẢO MỘC GIẢM CẢM XÔNG HƠI DỄ CHỊU THANH LỌC KHÔNG KHÍ\n\n✔ Tổng quan sản phẩm:\nGÓI XÔNG GIẢI CẢM THẢO MỘC 100G – THANH LỌC, THƯ GIÃN, GIẢM CẢM 🌿💨.\n\n✔ Mô tả chi tiết:\nGÓI XÔNG GIẢI CẢM THẢO MỘC 100G – THANH LỌC, THƯ GIÃN, GIẢM CẢM 🌿💨\n\n🔥 Giải cảm - Giúp ngủ ngon - Xua đủi côn trùng\n\n🌱 Thành phần tự nhiên (100g):\n✔ Khuynh diệp (27%): Thông mũi, hỗ trợ hô hấp, thanh lọc không khí.\n✔ Gừng (23%): Làm ấm cơ thể, giảm đau nhức, kích thích tuần hoàn.\n✔ Bưởi (27%): Thư giãn, giải tỏa căng thẳng, giúp ngủ ngon.\n✔ Sả (23%): Kháng khuẩn, giảm stress, giúp tinh thần sảng khoái.\n\n💚 Công dụng vượt trội:\n✅ Giúp cơ thể thải độc, giảm nghẹt mũi, ho, cảm lạnh.\n✅ Giữ ấm, kích thích tuần hoàn, giúp thư giãn sau ngày dài mệt mỏi.\n✅ Thanh lọc không khí, xua đuổi vi khuẩn, côn trùng.\n✅ Hỗ trợ giấc ngủ, giúp tinh thần thoải mái, giảm căng thẳng.\n\n🔥 Cách dùng hiệu quả:\n✔ Xông hơi: Đun sôi gói xông với nước, trùm khăn kín và xông 10-15 phút.\n✔ Tắm thảo mộc: Hòa nước xông vào bồn tắm giúp thư giãn sâu.\n✔ Ngâm chân: Giúp tuần hoàn tốt, giảm nhức mỏi, ngủ ngon hơn.\n\n📌 Sản phẩm 100% thiên nhiên, an toàn, lành tính 📌\n\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Thảo mộc giảm cảm xông hơi dễ chịu thanh lọc không khí\n- Danh mục: Thảo mộc xông\n- Phân loại: GÓI 100G, GÓI 200G, GÓI 500G\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: CBGC\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG THẢO MỘC GIẢM CẢM XÔNG HƠI DỄ CHỊU THANH LỌC KHÔNG KHÍ\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me9j6xxtfj7o94","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9k99qoraww84","https://cf.shopee.vn/file/vn-11134207-820l4-me83kr38d6v80a","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-7ra0g-m65ib3dm2ps35a","https://cf.shopee.vn/file/vn-11134207-7ra0g-m65ibkucilw7ae"],"reviews":[],"variants":[{"id":"shopee_variant_271447161134","name":"GÓI 100G","sku":"","price":55000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j6xxtfj7o94","options":{}},{"id":"shopee_variant_271447161135","name":"GÓI 200G","sku":"","price":110000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j6xxtfj7o94","options":{}},{"id":"shopee_variant_271447161136","name":"GÓI 500G","sku":"","price":190000,"originalPrice":null,"weight":600,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j6xxtfj7o94","options":{}}]},{"id":"shopee_26830705457","sku":"SP-26830705457","categoryId":"nen-thom","name":"Nến tealight 8 giờ vỏ nhôm xông thảo mộc không khói","price":80000,"originalPrice":null,"shortDesc":"Kích thước 1 viên: Cao 2,5cm đường kính 3,5cm.","description":"NẾN TEALIGHT 8 GIỜ VỎ NHÔM XÔNG THẢO MỘC KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nKích thước 1 viên: Cao 2,5cm đường kính 3,5cm.\n\n✔ Mô tả chi tiết:\nNẾN TEALIGHT VIÊN CHÁY 8 GIỜ.\n✔ Thông số kĩ thuật: \nKích thước 1 viên: Cao 2,5cm đường kính 3,5cm\nKhối lượng: 25 gam/ viên\nChất liệu: Vổ nhôm, sáp\nThời gian cháy: 8\n\n🕯 Mô tả sản phẩm:\nThời gian cháy lâu: Mỗi viên nến tealight có thể đốt liên tục lên đến 10 giờ, phù hợp cho xông tinh dầu, bếp xông thảo mộc hoặc trang trí.\n\nKhông khói - Không mùi: Sáp nến tinh khiết giúp không gian luôn thoáng đãng, không gây khó chịu.\n\nThiết kế viên tròn, màu trắng trang nhã: Phù hợp với mọi loại đèn xông tinh dầu, lò đốt hương liệu, hay trang trí không gian sống.\n\nVỏ nhôm an toàn, tiện lợi: Giúp nến cháy đều, không chảy tràn, dễ dàng sử dụng.\n\n💡 Ứng dụng: Xông tinh dầu, xông thảo mộc, trang trí tiệc, spa, thiền định, yoga.\n\nXuất xứ: Việt nam \n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 8 giờ vỏ nhôm xông thảo mộc không khói\n- Danh mục: Thảo mộc xông\n- Phân loại: 20 VIÊN, 50 VIÊN, 10 VIÊN\n- Cân nặng vận chuyển: 300g\n- Mã sản phẩm: SP-26830705457\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 8 GIỜ VỎ NHÔM XÔNG THẢO MỘC KHÔNG KHÓI\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":300,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7ras8-mdr8dil4j8atb5","https://cf.shopee.vn/file/vn-11134207-7ras8-mdr82mbakrvz1d","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm599n8do3ad","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm5f3es7uu11","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm5gs68htf24","https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qm5i6y66km36","https://cf.shopee.vn/file/vn-11134207-7ras8-mdr8970s6mcx80"],"reviews":[],"variants":[{"id":"shopee_variant_49538480380","name":"20 VIÊN","sku":"","price":160000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-mdr8dil4j8atb5","options":{}},{"id":"shopee_variant_49538480381","name":"50 VIÊN","sku":"","price":380000,"originalPrice":null,"weight":1200,"image":"https://cf.shopee.vn/file/vn-11134207-7ra0g-m7qmim11p50x65","options":{}},{"id":"shopee_variant_49538480379","name":"10 VIÊN","sku":"","price":80000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-mdr82mbakrvz1d","options":{}}]},{"id":"shopee_26007254880","sku":"SP-26007254880","categoryId":"thao-moc-xong","name":"Thảo mộc xông nhà tự nhiên tẩy uế khử mùi xua côn trùng","price":25000,"originalPrice":null,"shortDesc":"Xông thảo mộc, còn được gọi là xông hơi thảo dược. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và tinh thần: là một phương pháp giúp thanh lọc không khí, xua đủi côn trùng, cải thiện môi trường","description":"THẢO MỘC XÔNG NHÀ TỰ NHIÊN TẨY UẾ KHỬ MÙI XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\nXông thảo mộc, còn được gọi là xông hơi thảo dược. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và tinh thần: là một phương pháp giúp thanh lọc không khí, xua đủi côn trùng, cải thiện môi trường\n\n✔ Mô tả chi tiết:\nXông thảo mộc, còn được gọi là xông hơi thảo dược. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và tinh thần: là một phương pháp giúp thanh lọc không khí, xua đủi côn trùng, cải thiện môi trường sống. \n\n*** LƯU Ý: Đốt Xông thảo mộc ở những nơi thoáng, không xông trong phòng kín\n\nThành phần: 100% thảo mộc thiên nhiên\nHướng dẫn bảo quản: zip kín miệng, bảo quản nơi khô ráo\nHướng dẫn sử dụng: \n+ Xông khô:Dùng xông đốt với nến tealight và bếp xông chuyên dụng hoặc than và khay nhôm, sẽ có khói\n+ Xông Nước: Cho thảo mộc vào nấu với nước sôi thêm 1 2 thìa muối hột \nChính sách bảo hành: bù hàng cho khách phát hiện hàng cũ hoặc có nấm mốc.\n- Xuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Thảo mộc xông nhà tự nhiên tẩy uế khử mùi xua côn trùng\n- Danh mục: Thảo mộc xông\n- Phân loại: 50g Lá Nguyệt Quế, GÓI XÔNG GIẢI CẢM, 50g Quế, 100g Bồ Kết, GÓI XÔNG XUA MUỖI, GÓI XÔNG THƯ GIÃN, 100g Lá Khuynh Diệp, GÓI XÔNG NHÀ MỚI, GÓI COMBO 12 LOẠI, 200g Bưởi, GÓI THANH LỌC KO KHÍ, 30g Hương Thảo, và 11 phân loại khác\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-26007254880\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG THẢO MỘC XÔNG NHÀ TỰ NHIÊN TẨY UẾ KHỬ MÙI XUA CÔN TRÙNG\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me83k4bvilfm0a","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me83kjxjaw3r69","https://cf.shopee.vn/file/vn-11134207-820l4-me9jhmt9sbuoe9","https://cf.shopee.vn/file/vn-11134207-820l4-me9jhpdfpxc321","https://cf.shopee.vn/file/vn-11134207-820l4-me9jhxxbx8g404","https://cf.shopee.vn/file/vn-11134207-820l4-me9ji07k0npe4b","https://cf.shopee.vn/file/vn-11134207-820l4-me9jib38191g52"],"reviews":[],"variants":[{"id":"shopee_variant_236618207002","name":"50g Lá Nguyệt Quế","sku":"","price":35000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j928f1hxg5b","options":{}},{"id":"shopee_variant_178707503017","name":"GÓI XÔNG GIẢI CẢM","sku":"","price":45000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j76kg9tz7ab","options":{}},{"id":"shopee_variant_236618207000","name":"50g Quế","sku":"","price":25000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8k8zsydgb0","options":{}},{"id":"shopee_variant_236618206998","name":"100g Bồ Kết","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7hpw02di63","options":{}},{"id":"shopee_variant_296446961936","name":"GÓI XÔNG XUA MUỖI","sku":"","price":65000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jduorludfaf","options":{}},{"id":"shopee_variant_296446961940","name":"GÓI XÔNG THƯ GIÃN","sku":"","price":65000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jg6i6d4w44e","options":{}},{"id":"shopee_variant_236618207004","name":"100g Lá Khuynh Diệp","sku":"","price":35000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8ye3b9j9ba","options":{}},{"id":"shopee_variant_296446961939","name":"GÓI XÔNG NHÀ MỚI","sku":"","price":65000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mki70t518yyq60","options":{}},{"id":"shopee_variant_287557175679","name":"GÓI COMBO 12 LOẠI","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mnb9a6ez07b641","options":{}},{"id":"shopee_variant_236618207001","name":"200g Bưởi","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8rh42oedc8","options":{}},{"id":"shopee_variant_296446961937","name":"GÓI THANH LỌC KO KHÍ","sku":"","price":65000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jejtmns3k41","options":{}},{"id":"shopee_variant_139440748579","name":"30g Hương Thảo","sku":"","price":45000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j897yj28498","options":{}},{"id":"shopee_variant_296446961938","name":"GÓI XÔNG KHỬ MÙI","sku":"","price":65000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jfioudxc2c8","options":{}},{"id":"shopee_variant_236618207006","name":"50g Hoa Đại Hồi","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j97x7xdza26","options":{}},{"id":"shopee_variant_236618207005","name":"100g Sả Khô","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9g85pyis16","options":{}},{"id":"shopee_variant_139440748580","name":"50g Hương Nhu","sku":"","price":37000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9ltsy29vb4","options":{}},{"id":"shopee_variant_236618207008","name":"GÓI XÔNG NỒNG ẤM","sku":"","price":35000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j6tiztp8j9f","options":{}},{"id":"shopee_variant_236618206999","name":"100g Bạc Hà","sku":"","price":35000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8293frib38","options":{}},{"id":"shopee_variant_128408384523","name":"30g Oải Hương","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7qxurk022c","options":{}},{"id":"shopee_variant_236618207003","name":"50g Lát Cam Khô","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7vm93ldzf9","options":{}},{"id":"shopee_variant_272257427124","name":"100gVỏ Quế Cao Cấp🔥","sku":"","price":55000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mia87b30ynlw32","options":{}},{"id":"shopee_variant_236618207007","name":"100g Gừng Lát Sấy","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9a13zyf4d7","options":{}},{"id":"shopee_variant_128408384522","name":"50g Hạt Cà Phê Rang","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7lt5ecjp4c","options":{}}]},{"id":"shopee_25759395070","sku":"SP-25759395070","categoryId":"thao-moc-xong","name":"Vỏ quế khô Yên Bái xông thảo mộc khử mùi thơm ấm","price":22000,"originalPrice":null,"shortDesc":"📍Quế thanh là hương liệu được dùng rất phổ biến trên khắp thế giới, nó là phần vỏ của cây quế sau khi phơi khô. Mùi hương của quế thanh rất đặc biệt, vị ấm, ngọt không lẫn với hương liệu nào khác. Quế thanh có rất nhiều","description":"VỎ QUẾ KHÔ YÊN BÁI XÔNG THẢO MỘC KHỬ MÙI THƠM ẤM\n\n✔ Tổng quan sản phẩm:\n📍Quế thanh là hương liệu được dùng rất phổ biến trên khắp thế giới, nó là phần vỏ của cây quế sau khi phơi khô. Mùi hương của quế thanh rất đặc biệt, vị ấm, ngọt không lẫn với hương liệu nào khác. Quế thanh có rất nhiều\n\n✔ Mô tả chi tiết:\n🌳 VỎ QUẾ NHẬP YÊN BÁI |NẾN PHƯƠNG LÂM 🌳\n\n📍Quế thanh là hương liệu được dùng rất phổ biến trên khắp thế giới, nó là phần vỏ của cây quế sau khi phơi khô. Mùi hương của quế thanh rất đặc biệt, vị ấm, ngọt không lẫn với hương liệu nào khác. Quế thanh có rất nhiều công dụng: hỗ trợ rất tốt cho sức khỏe, đánh bay một số chứng bịnh liên quan đến hệ hô hấp (cả.m, cú.m), hệ tim mạch, nhiễ.m trùng da, đái t.h.á.o đường. Ngoài ra, quế thanh khô cũng là thảo dược thiên nhiên vô cùng thân thiện, giúp chị em làm đẹp hiệu quả.\n\n*Thành phần: 100% Vỏ quế khô chưa cạo vỏ\n*Định lượng: Vỏ quế 50g, 100G, 200g đựng trong túi zip. \n\nHướng dẫn sử dụng:\n- Vỏ quế: cho vỏ quế lên trên mặt bếp xông (có thể kèm thêm hoa hồi, bồ kết, bưởi,... để tạo thêm mùi) đốt 1-3 viên nến tròn bên dưới. Nên đốt ở không gian thoáng trong nhà.\n\n👉 Bảo quản: Nơi khô thoáng, tránh ánh nắng trực tiếp.\nXuất xứ: Yên Bái, Việt Nam\n\n📍Cam kết\n+ Đảm bảo chất lượng, dịch vụ tốt, hàng được giao từ 1-3 ngày kể từ ngày đặt hàng.\n+ Giao hàng toàn quốc - nhận hàng trả tiền\n+ Đổi trả theo quy định của Shopee nhanh chóng\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Vỏ quế khô Yên Bái xông thảo mộc khử mùi thơm ấm\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 200g Vỏ Quế, 50g Vỏ Quế Cao Cấp🔥, 100g Vỏ Quế Cao Cấp, 50g Vỏ Quế, 100g Vỏ Quế\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-25759395070\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG VỎ QUẾ KHÔ YÊN BÁI XÔNG THẢO MỘC KHỬ MÙI THƠM ẤM\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me83bmwd7chyc0","https://cf.shopee.vn/file/vn-11134207-820l4-mia82lp7gkqu39","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j8k8zsydgb0","https://cf.shopee.vn/file/vn-11134207-7r98o-lt901teh0e552e","https://cf.shopee.vn/file/vn-11134207-7r98o-lt901teh1spl79","https://cf.shopee.vn/file/vn-11134207-7r98o-lqoqw9ba5rkid7","https://cf.shopee.vn/file/vn-11134207-7r98o-lqoqw9bacseqa3","https://cf.shopee.vn/file/vn-11134207-7r98o-lqoqw9bah04238"],"reviews":[],"variants":[{"id":"shopee_variant_250242247741","name":"200g Vỏ Quế","sku":"","price":69000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8k8zsydgb0","options":{}},{"id":"shopee_variant_360301129707","name":"50g Vỏ Quế Cao Cấp🔥","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mia87b30ynlw32","options":{}},{"id":"shopee_variant_360301129708","name":"100g Vỏ Quế Cao Cấp","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mia87b30ynlw32","options":{}},{"id":"shopee_variant_250242247739","name":"50g Vỏ Quế","sku":"","price":22000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8k8zsydgb0","options":{}},{"id":"shopee_variant_250242247740","name":"100g Vỏ Quế","sku":"","price":40000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8k8zsydgb0","options":{}}]},{"id":"shopee_25659397266","sku":"SP-25659397266","categoryId":"thao-moc-xong","name":"Lá khuynh diệp khô xông nhà giảm cảm thanh lọc không khí","price":22000,"originalPrice":null,"shortDesc":"Lá khuynh diệp khô dùng với bếp Xông Thảo Mộc kết hợp với các loại thảo mộc khác như: bồ kết, vỏ bưởi, quế, hoa hồi, giúp thanh lọc không khí, Giảm cảm và lưu thông hơi thở.","description":"LÁ KHUYNH DIỆP KHÔ XÔNG NHÀ GIẢM CẢM THANH LỌC KHÔNG KHÍ\n\n✔ Tổng quan sản phẩm:\nLá khuynh diệp khô dùng với bếp Xông Thảo Mộc kết hợp với các loại thảo mộc khác như: bồ kết, vỏ bưởi, quế, hoa hồi, giúp thanh lọc không khí, Giảm cảm và lưu thông hơi thở.\n\n✔ Mô tả chi tiết:\nLá khuynh diệp khô dùng với bếp Xông Thảo Mộc kết hợp với các loại thảo mộc khác như: bồ kết, vỏ bưởi, quế, hoa hồi, giúp thanh lọc không khí, Giảm cảm và lưu thông hơi thở\n\n*Thành phần: 100% Lá Bạch Đàn (Khuynh diệp) khô\n*Định lượng: lá khô 50g, 100G, 200g đựng trong túi zip. \n\nHướng dẫn sử dụng:\n- Lá Khuynh diệp: cho lá khô lên trên mặt bếp xông (có thể kèm thêm hoa hồi, bồ kết, bưởi,... để tạo thêm mùi) đốt 1-3 viên nến tròn bên dưới. \n\n👉 Bảo quản: Nơi khô thoáng, tránh ánh nắng trực tiếp.\nXuất xứ: Yên Bái, Việt Nam\n\n📍Cam kết\n+ Đảm bảo chất lượng, dịch vụ tốt, hàng được giao từ 1-3 ngày kể từ ngày đặt hàng.\n+ Giao hàng toàn quốc - nhận hàng trả tiền\n+ Đổi trả theo quy định của Shopee nhanh chóng\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Lá khuynh diệp khô xông nhà giảm cảm thanh lọc không khí\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 100g Lá Khuynh Diệp, 200g Lá Khuynh Diệp, 50g Lá Khuynh Diệp\n- Cân nặng vận chuyển: 100g\n- Mã sản phẩm: SP-25659397266\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG LÁ KHUYNH DIỆP KHÔ XÔNG NHÀ GIẢM CẢM THANH LỌC KHÔNG KHÍ\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":100,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me81yjdhmxhhe4","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j8ye3b9j9ba","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-7r98o-lqos9xwinp3mb6","https://cf.shopee.vn/file/vn-11134207-7r98o-lqos9xwip3o2ef","https://cf.shopee.vn/file/vn-11134207-7r98o-lqos9xwiqi8i60"],"reviews":[],"variants":[{"id":"shopee_variant_187280785913","name":"100g Lá Khuynh Diệp","sku":"","price":40000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8ye3b9j9ba","options":{}},{"id":"shopee_variant_187280785914","name":"200g Lá Khuynh Diệp","sku":"","price":75000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8ye3b9j9ba","options":{}},{"id":"shopee_variant_187280785912","name":"50g Lá Khuynh Diệp","sku":"","price":22000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8ye3b9j9ba","options":{}}]},{"id":"shopee_25314272283","sku":"SP-25314272283","categoryId":"thao-moc-xong","name":"Hoa đại hồi khô xông thảo mộc thơm ấm xua côn trùng","price":10000,"originalPrice":null,"shortDesc":"- Xông thảo mộc, Thanh lọc không khí nhà cửa, Thơm nhà, Xua đuổi côn trùng có thể kết hợp vs combo Thảo mộc khác.","description":"HOA ĐẠI HỒI KHÔ XÔNG THẢO MỘC THƠM ẤM XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\n- Xông thảo mộc, Thanh lọc không khí nhà cửa, Thơm nhà, Xua đuổi côn trùng có thể kết hợp vs combo Thảo mộc khác.\n\n✔ Mô tả chi tiết:\nSản phẩm: Hoa hồi khô\nCông dụng: \n- Xông thảo mộc, Thanh lọc không khí nhà cửa, Thơm nhà, Xua đuổi côn trùng có thể kết hợp vs combo Thảo mộc khác\n- Gia vị cho nhiều món ngon như hoa hồi nấu phở, bò kho, thành phần trong ngũ vị hương, các món kho, món xào tăng phần hấp dẫn hơn bởi mùi hương và vị đặc trưng của hoa hồi khô.\n- Giảm đ,au nh,ức xư,ơng kh,ớp, c.ảm c.úm\n\nHướng dẫn sử dụng:\n• Xông Thảo mộc: cho Hoa hồi lên trên mặt Bếp Xông (có thể kèm thêm, bồ kết, bưởi, quế... để tạo thêm mùi) đốt 1-3 viên nến tròn bên dưới. \n• Nấu nước phở: ninh sơ qua xư.ơng bò, đổ nước lần đầu. Sau đó cho cho xư.ơng vào ninh nhừ trên 200 độ C khoảng 15 phút. Nướng hoa hồi, thảo quả, quế chi, hành khô… cho vào nồi. Sau đó cho sá sùng vào nồi. Ninh khoảng 30 phút. Nêm gia vị vừa đủ là bạn đã có một nồi nước dùng thơm phức.\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Hoa đại hồi khô xông thảo mộc thơm ấm xua côn trùng\n- Danh mục: Thảo mộc xông\n- Phân loại: Túi 50g, Túi 100g, Túi 10g\n- Cân nặng vận chuyển: 50g\n- Mã sản phẩm: SP-25314272283\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG HOA ĐẠI HỒI KHÔ XÔNG THẢO MỘC THƠM ẤM XUA CÔN TRÙNG\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":50,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me83ehkpjklg65","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j97x7xdza26","https://cf.shopee.vn/file/vn-11134207-7r98o-lry9gjnklryc8a","https://cf.shopee.vn/file/vn-11134207-7r98o-lry9gjnkn6isf8","https://cf.shopee.vn/file/vn-11134207-7r98o-lry9gjnkol38f6","https://cf.shopee.vn/file/vn-11134207-7r98o-lryao6hbktcpbd"],"reviews":[],"variants":[{"id":"shopee_variant_168071517048","name":"Túi 50g","sku":"","price":25000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j97x7xdza26","options":{}},{"id":"shopee_variant_168071517049","name":"Túi 100g","sku":"","price":50000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j97x7xdza26","options":{}},{"id":"shopee_variant_168071517047","name":"Túi 10g","sku":"","price":10000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j97x7xdza26","options":{}}]},{"id":"shopee_25158793608","sku":"SP-25158793608","categoryId":"thao-moc-xong","name":"Cam vàng sấy khô xông nhà khử mùi thanh lọc không khí","price":14100,"originalPrice":null,"shortDesc":"Trong cam lát sấy khô rất giàu vitamin C, canxi, chất xơ và nhiều loại chất dinh dưỡng khác, đặc biệt tinh dầu vỏ cam rất tốt cho da, có thể giảm m.ụn, giúp làm căng mịn da","description":"CAM VÀNG SẤY KHÔ XÔNG NHÀ KHỬ MÙI THANH LỌC KHÔNG KHÍ\n\n✔ Tổng quan sản phẩm:\nTrong cam lát sấy khô rất giàu vitamin C, canxi, chất xơ và nhiều loại chất dinh dưỡng khác, đặc biệt tinh dầu vỏ cam rất tốt cho da, có thể giảm m.ụn, giúp làm căng mịn da\n\n✔ Mô tả chi tiết:\nTrong cam lát sấy khô rất giàu vitamin C, canxi, chất xơ và nhiều loại chất dinh dưỡng khác, đặc biệt tinh dầu vỏ cam rất tốt cho da, có thể giảm m.ụn, giúp làm căng mịn da,..\n\nThành phần: 100% cam cắt lát sấy khô\n\nĐịnh lượng: 10 lát đẹp khoảng 30g; 20g và 100g đựng trong túi zipper\n\n- ĐỐT XÔNG NHÀ: đặt lát cam và những loại thảo mộc khác lên bếp xông, đốt 1 viên nến bên dưới và thưởng thức\n- PHA TRÀ: Phà trà bằng nước ấm 70-80 độ C là nhiệt độ vừa đủ để trà thơm ngon mà không bị mất đi vitamin vốn có trong trà. Tuyệt đối không pha trà bằng nước nóng sẽ làm trà bị đắng nhé\n- TRANG TRÍ: dùng lát cam đẹp để trang trí cây thông, hộp quà, nến thơm...\n\nHướng dẫn bảo quản: bảo quản nơi khô ráo thoáng mát.\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\n📍Cam kết\n * Đảm bảo chất lượng, dịch vụ tốt, hàng được giao từ 1-3 ngày kể từ ngày đặt hàng.\n * Giao hàng toàn quốc - nhận hàng trả tiền\n * Đổi trả theo quy định của Shopee \n\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Cam vàng sấy khô xông nhà khử mùi thanh lọc không khí\n- Danh mục: Phụ kiện xông\n- Phân loại: 100g Lát Cam Khô, 50g Lát Cam Khô, 20g Lát Cam Khô\n- Cân nặng vận chuyển: 50g\n- Mã sản phẩm: SP-25158793608\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG CAM VÀNG SẤY KHÔ XÔNG NHÀ KHỬ MÙI THANH LỌC KHÔNG KHÍ\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":50,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me81rpd7l0ci00","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j7vm93ldzf9","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-7r98o-lqko3xgndbg797","https://cf.shopee.vn/file/vn-11134207-7r98o-lqko3xgn93qv8f","https://cf.shopee.vn/file/vn-11134207-7r98o-lqko3xgnbwvr43","https://cf.shopee.vn/file/vn-11134207-7r98o-lqko3xgnaibb79"],"reviews":[],"variants":[{"id":"shopee_variant_214875378541","name":"100g Lát Cam Khô","sku":"","price":53000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7vm93ldzf9","options":{}},{"id":"shopee_variant_214875378542","name":"50g Lát Cam Khô","sku":"","price":26471,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7vm93ldzf9","options":{}},{"id":"shopee_variant_214875378543","name":"20g Lát Cam Khô","sku":"","price":14100,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7vm93ldzf9","options":{}}]},{"id":"shopee_24656264608","sku":"SP-24656264608","categoryId":"thao-moc-xong","name":"Lá nguyệt quế khô xông nhà thanh tẩy xua côn trùng","price":26000,"originalPrice":null,"shortDesc":"LÁ NGUYỆT QUẾ KHÔ DÙNG XÔNG NHÀ KẾT HỢP CÙNG BỒ KẾT, VỎ BƯỞI, GIÚP THANH LỌC KHÔNG KHÍ, THANH TẨY NHÀ CỬA VÀ TĂNG CƯỜNG HỆ MIEN DICH, GIẢM CĂNG THẲNG BẢO VỆ SỨC KHỎE CHO GIA ĐÌNH BẠN","description":"LÁ NGUYỆT QUẾ KHÔ XÔNG NHÀ THANH TẨY XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\nLÁ NGUYỆT QUẾ KHÔ DÙNG XÔNG NHÀ KẾT HỢP CÙNG BỒ KẾT, VỎ BƯỞI, GIÚP THANH LỌC KHÔNG KHÍ, THANH TẨY NHÀ CỬA VÀ TĂNG CƯỜNG HỆ MIEN DICH, GIẢM CĂNG THẲNG BẢO VỆ SỨC KHỎE CHO GIA ĐÌNH BẠN\n\n✔ Mô tả chi tiết:\nLÁ NGUYỆT QUẾ KHÔ DÙNG XÔNG NHÀ KẾT HỢP CÙNG BỒ KẾT, VỎ BƯỞI, GIÚP THANH LỌC KHÔNG KHÍ, THANH TẨY NHÀ CỬA VÀ TĂNG CƯỜNG HỆ MIEN DICH, GIẢM CĂNG THẲNG BẢO VỆ SỨC KHỎE CHO GIA ĐÌNH BẠN.\n\n*Thành phần: 100% Lá Nguyệt Quế khô\n*Định lượng: lá khô 50g, 100G, 200g đựng trong túi zip. \n\nCÔNG DỤNG:\n- Đốt xông thơm nhà, thu hút vận may\n- Ghi điều mình mong muốn và áp dụng luật hấp dẫn\n- Làm gia vị cho các món ăn\n\n👉 Bảo quản: Nơi khô thoáng, tránh ánh nắng trực tiếp.\nXuất xứ: Việt Nam\n\n📍Cam kết\n+ Đảm bảo chất lượng, dịch vụ tốt, hàng được giao từ 1-3 ngày kể từ ngày đặt hàng.\n+ Giao hàng toàn quốc - nhận hàng trả tiền\n+ Đổi trả theo quy định của Shopee nhanh chóng\n\nMọi ý kiến đóng góp, shop luôn sẵn sàng hỗ trợ ở kênh chat của shop 24/7\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Lá nguyệt quế khô xông nhà thanh tẩy xua côn trùng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 100g Lá Khô, 200g Lá Khô, 50g Lá Khô\n- Cân nặng vận chuyển: 60g\n- Mã sản phẩm: SP-24656264608\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG LÁ NGUYỆT QUẾ KHÔ XÔNG NHÀ THANH TẨY XUA CÔN TRÙNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":60,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me81u0q9jx8m9e","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j928f1hxg5b","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye72tck914","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye72qjfde4","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye72rxzte0","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye72ur4p68"],"reviews":[],"variants":[{"id":"shopee_variant_246121016936","name":"100g Lá Khô","sku":"","price":50000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j928f1hxg5b","options":{}},{"id":"shopee_variant_246121016937","name":"200g Lá Khô","sku":"","price":95000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j928f1hxg5b","options":{}},{"id":"shopee_variant_250485627812","name":"50g Lá Khô","sku":"","price":26000,"originalPrice":null,"weight":60,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j928f1hxg5b","options":{}}]},{"id":"shopee_24604156053","sku":"SP-24604156053","categoryId":"bep-xong","name":"Tinh dầu thơm phòng khách sạn khử mùi thư giãn cao cấp","price":60000,"originalPrice":null,"shortDesc":"BIẾN NGÔI NHÀ CỦA BẠN THÀNH KHÁCH SẠN 5 SAO CHỈ TRONG TÍCH TẮC.","description":"TINH DẦU THƠM PHÒNG KHÁCH SẠN KHỬ MÙI THƯ GIÃN CAO CẤP\n\n✔ Tổng quan sản phẩm:\nBIẾN NGÔI NHÀ CỦA BẠN THÀNH KHÁCH SẠN 5 SAO CHỈ TRONG TÍCH TẮC.\n\n✔ Mô tả chi tiết:\nBIẾN NGÔI NHÀ CỦA BẠN THÀNH KHÁCH SẠN 5 SAO CHỈ TRONG TÍCH TẮC\n\nChào mừng bạn đến với Nến Phương Lâm. Chúng tôi mang đến dòng tinh dầu thơm phòng cao cấp, được chiết xuất 100% tự nhiên, giúp không gian sống của bạn trở nên đẳng cấp, thư thái như đang ở trong những resort sang trọng nhất.\n\n🔥 ƯU ĐIỂM NỔI BẬT: \n✅ Hương thơm sang trọng: Tone mùi Coco/Hilton thanh lịch, quyến rũ, lưu hương lâu. \n✅ 100% Tự nhiên: An toàn tuyệt đối cho sức khỏe, không chứa hóa chất độc hại. \n✅ Khử mùi hiệu quả: Loại bỏ mùi ẩm mốc, mùi thức ăn, trả lại bầu không khí trong lành. \n✅ Thư giãn tinh thần: Hương thơm dịu nhẹ giúp giảm căng thẳng (stress), cải thiện giấc ngủ ngon và sâu hơn.\n\n📝 HƯỚNG DẪN SỬ DỤNG:\nXông phòng: Nhỏ 3-5 giọt tinh dầu vào đèn xông (đèn gốm nến hoặc đèn điện) hoặc máy khuếch tán đã có nước.\nTắm bồn: Nhỏ vài giọt vào bồn tắm nước ấm để ngâm mình thư giãn.\nTreo xe/Tủ quần áo: Có thể dùng kèm với túi thơm hoặc đá khuếch tán.\n\n📦 THÔNG TIN SẢN PHẨM:\nThương hiệu: Nến Phương Lâm\nDung tích: 10ml\nQuy cách đóng gói: Chai thủy tinh tối màu bảo quản tốt chất lượng tinh dầu.\nĐóng gói: Việt Nam\n\n🛡️ CAM KẾT CỦA SHOP:\nSản phẩm giống 100% mô tả.\nĐổi trả theo quy định của Shopee.\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Tinh dầu thơm phòng khách sạn khử mùi thư giãn cao cấp\n- Danh mục: Tinh dầu\n- Phân loại: Gỗ Đàn Hương, Hoa Lê Anh, Khánh Sạn Hilton🔥, Resort ( Sheraton ), Coco (Ngọt Ngào), Ấm Áp (Quế & Thông), Trà Trắng (Mùi Sang)\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-24604156053\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG TINH DẦU THƠM PHÒNG KHÁCH SẠN KHỬ MÙI THƯ GIÃN CAO CẤP\n\n✔ Với đèn xông:\nNhỏ vài giọt tinh dầu vào nước trong khay đèn xông, sau đó làm nóng bằng nến hoặc điện tùy loại đèn.\n\n✔ Với máy khuếch tán:\nThêm tinh dầu theo dung tích máy và hướng dẫn của thiết bị.\n\n✔ Lưu ý:\nKhông uống tinh dầu, tránh tiếp xúc trực tiếp với mắt và để xa tầm tay trẻ em.\n\n✔ Bảo quản:\nĐậy kín nắp sau khi dùng, để nơi mát và tránh ánh nắng trực tiếp.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mi8mtdyrtsec90","https://cf.shopee.vn/file/vn-11134207-820l4-mhj8g7l5cmwy87","https://cf.shopee.vn/file/vn-11134207-820l4-mi8n6t5hrsw179","https://cf.shopee.vn/file/vn-11134207-820l4-mhj8g9usos1wc8","https://cf.shopee.vn/file/vn-11134207-81ztc-mlc57xq4l4w836","https://cf.shopee.vn/file/vn-11134207-820l4-mi8mwfaorh8m35","https://cf.shopee.vn/file/vn-11134207-820l4-mi8mwbkw4qo75f","https://cf.shopee.vn/file/vn-11134207-820l4-mi8mwgus31u034"],"reviews":[],"variants":[{"id":"shopee_variant_440296119911","name":"Gỗ Đàn Hương","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc51x9162o8f7","options":{}},{"id":"shopee_variant_440296119912","name":"Hoa Lê Anh","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc53qh26adgec","options":{}},{"id":"shopee_variant_250211429868","name":"Khánh Sạn Hilton🔥","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi8myc673ime37","options":{}},{"id":"shopee_variant_360296129288","name":"Resort ( Sheraton )","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc575gudslf5a","options":{}},{"id":"shopee_variant_440296119908","name":"Coco (Ngọt Ngào)","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi8mwfaorh8m35","options":{}},{"id":"shopee_variant_440296119909","name":"Ấm Áp (Quế & Thông)","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi8mwbkw4qo75f","options":{}},{"id":"shopee_variant_440296119910","name":"Trà Trắng (Mùi Sang)","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc51yqdce8801","options":{}}]},{"id":"shopee_24564267189","sku":"SP-24564267189","categoryId":"nen-thom","name":"Nến xông thảo mộc 4 giờ màu vàng thanh lọc xua muỗi","price":95000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao","description":"NẾN XÔNG THẢO MỘC 4 GIỜ MÀU VÀNG THANH LỌC XUA MUỖI\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao,...\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 8-13 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h - 10h\n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi, có thể cháy trong 4 tiếng liên tục.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến xông thảo mộc 4 giờ màu vàng thanh lọc xua muỗi\n- Danh mục: Thảo mộc xông\n- Phân loại: 100 Viên 4h - Vàng, 50 Viên 4h - Vàng\n- Cân nặng vận chuyển: 1300g\n- Mã sản phẩm: SP-24564267189\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN XÔNG THẢO MỘC 4 GIỜ MÀU VÀNG THANH LỌC XUA MUỖI\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":1300,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mer6bemekc1t80","https://cf.shopee.vn/file/vn-11134207-7r98o-lry8hy96z8p099","https://cf.shopee.vn/file/vn-11134207-7r98o-lry8hy974uysba","https://cf.shopee.vn/file/vn-11134207-7r98o-lry8hy9769j800","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a41pjno88","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzbqbu7b","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9"],"reviews":[],"variants":[{"id":"shopee_variant_250351612818","name":"100 Viên 4h - Vàng","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mer6bemekc1t80","options":{}},{"id":"shopee_variant_250351612819","name":"50 Viên 4h - Vàng","sku":"","price":95000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a41trd00b","options":{}}]},{"id":"shopee_24264267967","sku":"SP-24264267967","categoryId":"nen-thom","name":"Nến xông thảo mộc 4 giờ dùng tinh dầu xua côn trùng","price":95000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao","description":"NẾN XÔNG THẢO MỘC 4 GIỜ DÙNG TINH DẦU XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao,...\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 8-13 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h - 10h\n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi, có thể cháy trong 4 tiếng liên tục.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nMọi ý kiến đóng góp, shop luôn sẵn sàng hỗ trợ ở kênh chat của shop\n\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến xông thảo mộc 4 giờ dùng tinh dầu xua côn trùng\n- Danh mục: Thảo mộc xông\n- Phân loại: 50 Viên 4h - Đỏ, 100 Viên 4h - Đỏ\n- Cân nặng vận chuyển: 1300g\n- Mã sản phẩm: SP-24264267967\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN XÔNG THẢO MỘC 4 GIỜ DÙNG TINH DẦU XUA CÔN TRÙNG\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":1300,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mer6d5nakagw94","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a41wkhwcb","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a41xz2c25","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a41zdms64","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a420s78d4","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a4226ro0d","https://cf.shopee.vn/file/vn-11134207-7r98o-lry98a423lc491","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9"],"reviews":[],"variants":[{"id":"shopee_variant_204921942831","name":"50 Viên 4h - Đỏ","sku":"","price":95000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lry9gjnkdcjod6","options":{}},{"id":"shopee_variant_204921942832","name":"100 Viên 4h - Đỏ","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mer6d5nakagw94","options":{}}]},{"id":"shopee_23980156399","sku":"SP-23980156399","categoryId":"bep-xong","name":"Đèn xông tinh dầu hình hươu gốm sứ trang trí sang trọng","price":165000,"originalPrice":null,"shortDesc":"Đèn xông con HƯƠU chất liệu bằng SẮT được sơn tĩnh điện sang trọng hiện đại, chén đựng nước to bằng gốm sứ.","description":"ĐÈN XÔNG TINH DẦU HÌNH HƯƠU GỐM SỨ TRANG TRÍ SANG TRỌNG\n\n✔ Tổng quan sản phẩm:\nĐèn xông con HƯƠU chất liệu bằng SẮT được sơn tĩnh điện sang trọng hiện đại, chén đựng nước to bằng gốm sứ.\n\n✔ Mô tả chi tiết:\nĐèn xông con HƯƠU chất liệu bằng SẮT được sơn tĩnh điện sang trọng hiện đại, chén đựng nước to bằng gốm sứ\n\nKÍCH THƯỚC: \n✔ Chân sắt 11 x 6.5 x 17 cm\n✔ Chén trắng: 10 x 10 x 2.5 cm\nMàu sắc Chân: Vàng, Trắng, Đen\n\nHướng dẫn sử dụng\n✔Bước 1\n Cung cấp nhiệt\n* Đặt nến vào trong khoang đốt nến của đèn\n* Châm lửa đốt nến để cung cấp nhiệt\n✔ Bước 2\n đổ nước nóng vào đĩa đựng nước của đèn\n* Đổ nước khoảng 2/3 chén đựng nước xông, (Khuyến khích nên sử dụng nước ấm khoảng 60 độ C)\n✔ Bước 3\n Nhỏ tinh dầu lên nước nóng\n* Nhỏ tinh dầu lên cốc đựng nước của đèn khi nước nóng\n* Nhỏ khoảng từ 3-4 giọt tinh dầu trong một lần sử dụng\n\n📍SHOP CAM KẾT sẽ đèn bù hàng cho khách nếu quá trình vận chuyển làm vỡ đèn.\nNếu phát hiện bể, vỡ đèn - shop sẽ hỗ trợ ĐỔI đèn nhanh nhất có thể\n\n🌈Cảm ơn bạn đã giành thời gian cho shop, chúc bạn và gia đình có nhiều sức khỏe ạ!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Đèn xông tinh dầu hình hươu gốm sứ trang trí sang trọng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: CHÂN ĐEN + CHÉN, CHÂN TRẮNG + CHÉN, CON VOI SEN, CHÂN VÀNG + CHÉN\n- Cân nặng vận chuyển: 800g\n- Mã sản phẩm: SP-23980156399\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG ĐÈN XÔNG TINH DẦU HÌNH HƯƠU GỐM SỨ TRANG TRÍ SANG TRỌNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":800,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5j13ynce","https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3noho70","https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3m9x848","https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5j2ij33a","https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5j5bnza4","https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5j3x3jb0","https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5j84sv86","https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5j6q8f64","https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3cfy486"],"reviews":[],"variants":[{"id":"shopee_variant_88783509950","name":"CHÂN ĐEN + CHÉN","sku":"","price":165000,"originalPrice":null,"weight":800,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3i27w4c","options":{}},{"id":"shopee_variant_88783509951","name":"CHÂN TRẮNG + CHÉN","sku":"","price":165000,"originalPrice":null,"weight":800,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3jgsc5b","options":{}},{"id":"shopee_variant_88783509952","name":"CON VOI SEN","sku":"","price":165000,"originalPrice":null,"weight":800,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3kvcsc8","options":{}},{"id":"shopee_variant_88783509949","name":"CHÂN VÀNG + CHÉN","sku":"","price":165000,"originalPrice":null,"weight":800,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3gnng9b","options":{}}]},{"id":"shopee_23752550828","sku":"SP-23752550828","categoryId":"bep-xong","name":"Đèn xông tinh dầu gốm sứ Bát Tràng trang trí sang trọng","price":30000,"originalPrice":null,"shortDesc":"***Lưu ý: nhắm lượng nước phù hợp với thời gian xông (khuyến khích nhiệt độ của nước khoảng 60 - 70 độ C sẽ tiết kiệm được thời gian đồng thời không làm bay hơi tinh dầu quá nhanh)","description":"ĐÈN XÔNG TINH DẦU GỐM SỨ BÁT TRÀNG TRANG TRÍ SANG TRỌNG\n\n✔ Tổng quan sản phẩm:\n***Lưu ý: nhắm lượng nước phù hợp với thời gian xông (khuyến khích nhiệt độ của nước khoảng 60 - 70 độ C sẽ tiết kiệm được thời gian đồng thời không làm bay hơi tinh dầu quá nhanh)\n\n✔ Mô tả chi tiết:\n✔ Thành phần: 100% đất sét\nHướng dẫn sử dụng: \n- Cho nước vào 2/3 miệng đèn xông\n***Lưu ý: nhắm lượng nước phù hợp với thời gian xông (khuyến khích nhiệt độ của nước khoảng 60 - 70 độ C sẽ tiết kiệm được thời gian đồng thời không làm bay hơi tinh dầu quá nhanh).\n- Nhỏ 2-3 giọt tinh dầu vào nước tùy sở thích.\n- Đốt 1 viên nến để ở bên trong đèn, 10p sau nước bắt đầu nóng lên tinh dầu sẽ tỏa mùi thơm.\n- Sau khi đốt xong nếu còn dư nước nên đổ đi và lấy găn giấy thấm nước và lau sơ\n\n✔ Bảo quản: tránh làm rơi rớt, va đập mạnh có thể làm vỡ hoặc mẻ\n✔ Cách tắt nến không khói: dùng cây tăm đè tim nến xuống sao cho chìm xuống nước, lửa sẽ tắt mà không khói.\n\n📍 Shop cam kết sẽ ĐỀN BÙ cho khách hàng nếu quá trình vận chuyển làm VỠ sản phẩm.\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\nXuất xứ: Việt Nam, Làng Bát Tràng\n\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Đèn xông tinh dầu gốm sứ Bát Tràng trang trí sang trọng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: BÔNG MAI, BỘ CHÉN RỜI NHỎ, CON HƯU VÀNG, ĐẾ ĐỰNG TRẮNG, BỘ CAFE, MẶT CƯỜI, HOA TRẮNG TO, CON HƯU TRẮNG, ĐẾ ĐỰNG ĐEN, CHÉN LIỀN TO - CAO, TRỤ TRÒN, HOA TRẮNG NHỎ, và 10 phân loại khác\n- Cân nặng vận chuyển: 500g\n- Mã sản phẩm: SP-23752550828\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG ĐÈN XÔNG TINH DẦU GỐM SỨ BÁT TRÀNG TRANG TRÍ SANG TRỌNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":500,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lmq29lces0ynf0","https://cf.shopee.vn/file/vn-11134207-7r98o-llm9cyx3p32443","https://cf.shopee.vn/file/vn-11134207-7r98o-llmbmlj31lcf1b","https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22id2d3f41","https://cf.shopee.vn/file/vn-11134207-7r98o-lkusos72byl9b3","https://cf.shopee.vn/file/vn-11134207-7r98o-lkusos7295gdba","https://cf.shopee.vn/file/vn-11134207-7r98o-lkusos72erq533","https://cf.shopee.vn/file/vn-11134207-7r98o-lkusos72g6al1d","https://cf.shopee.vn/file/vn-11134207-7r98o-lkusos72hkv1c7"],"reviews":[],"variants":[{"id":"shopee_variant_235562147707","name":"BÔNG MAI","sku":"","price":37647,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wyj84dc5","options":{}},{"id":"shopee_variant_235562147706","name":"BỘ CHÉN RỜI NHỎ","sku":"","price":37647,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22idc72j8f","options":{}},{"id":"shopee_variant_204578697552","name":"CON HƯU VÀNG","sku":"","price":116471,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5ivhov14","options":{}},{"id":"shopee_variant_235562147714","name":"ĐẾ ĐỰNG TRẮNG","sku":"","price":30000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wynftp3b","options":{}},{"id":"shopee_variant_235562147719","name":"BỘ CAFE","sku":"","price":49500,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22iddlmzb9","options":{}},{"id":"shopee_variant_235562147720","name":"MẶT CƯỜI","sku":"","price":49500,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wyrnj121","options":{}},{"id":"shopee_variant_235562147718","name":"HOA TRẮNG TO","sku":"","price":111765,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfy3euke9udmc5","options":{}},{"id":"shopee_variant_204578697553","name":"CON HƯU TRẮNG","sku":"","price":116471,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5iyatra2","options":{}},{"id":"shopee_variant_235562147710","name":"ĐẾ ĐỰNG ĐEN","sku":"","price":30000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wym199d6","options":{}},{"id":"shopee_variant_235562147713","name":"CHÉN LIỀN TO - CAO","sku":"","price":49500,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22idf07f89","options":{}},{"id":"shopee_variant_235562147708","name":"TRỤ TRÒN","sku":"","price":37647,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wyoue5ce","options":{}},{"id":"shopee_variant_235562147711","name":"HOA TRẮNG NHỎ","sku":"","price":75000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfy3f3a7sg7iab","options":{}},{"id":"shopee_variant_235562147712","name":"BỘ RỜI TO","sku":"","price":49500,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22idasi3d0","options":{}},{"id":"shopee_variant_204578697551","name":"VOI HOA SEN - XANH","sku":"","price":116571,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5izpe7f3","options":{}},{"id":"shopee_variant_235562147715","name":"BỘ ẤM TRÀ","sku":"","price":37647,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22id9dxnb6","options":{}},{"id":"shopee_variant_235562147716","name":"CHÉN LIỀN NHỎ","sku":"","price":31765,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wyq8ylef","options":{}},{"id":"shopee_variant_235562147722","name":"CHIẾC LÁ","sku":"","price":31765,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22id3rnv19","options":{}},{"id":"shopee_variant_235562147721","name":"TRÒN NHỎ","sku":"","price":37647,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuv22idgerv85","options":{}},{"id":"shopee_variant_204578697554","name":"CON HƯU ĐEN","sku":"","price":116471,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llm8pd5iww9b6b","options":{}},{"id":"shopee_variant_235562147717","name":"HÌNH TIM","sku":"","price":31765,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-ll2xblcn9jh917","options":{}},{"id":"shopee_variant_119004698283","name":"BÚP SEN - ĐẸP","sku":"","price":76471,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llnied7pkcsc0a","options":{}},{"id":"shopee_variant_235562147709","name":"ĐÈN VUÔNG","sku":"","price":49500,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkuxg7wykmota0","options":{}}]},{"id":"shopee_23752423694","sku":"SP-23752423694","categoryId":"phu-kien","name":"Đế đựng nến tealight gốm sứ dùng đèn xông tiện lợi","price":30000,"originalPrice":null,"shortDesc":"Đế đựng nến giúp bạn an toàn hơn khi sử dụng đèn xông tinh dầu, bếp xông, tránh bỏng tay khi thay nến ngoài ra còn góp phần trang trí không gian thêm sang trọng và tinh tế","description":"ĐẾ ĐỰNG NẾN TEALIGHT GỐM SỨ DÙNG ĐÈN XÔNG TIỆN LỢI\n\n✔ Tổng quan sản phẩm:\nĐế đựng nến giúp bạn an toàn hơn khi sử dụng đèn xông tinh dầu, bếp xông, tránh bỏng tay khi thay nến ngoài ra còn góp phần trang trí không gian thêm sang trọng và tinh tế\n\n✔ Mô tả chi tiết:\nĐế đựng nến giúp bạn an toàn hơn khi sử dụng đèn xông tinh dầu, bếp xông, tránh bỏng tay khi thay nến ngoài ra còn góp phần trang trí không gian thêm sang trọng và tinh tế.\n\nThông số kỹ thuật: \n✔ Kích Thước: 8.3 x 4.1 x 1.6\n✔ Màu sắc: đen, trắng\n\nMô tả sản phẩm:\n- Thành phần: gốm sứ \nXuất xứ: Việt Nam\n\n✔ Hướng dẫn: cho nến tealight vào đế sau đó cầm vào cáng dài và đốt nến để tránh bị bỏng tay sau đó cho vào bếp xông\n✔ Bảo quản: tránh làm rơi rớt, va đập mạnh có thể làm vỡ hoặc mẻ\n\n📍 Shop cam kết sẽ ĐỀN BÙ cho khách hàng nếu quá trình vận chuyển làm VỠ sản phẩm.\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Đế đựng nến tealight gốm sứ dùng đèn xông tiện lợi\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: Đế Trắng, Ly đựng Nến, Đế Đen\n- Cân nặng vận chuyển: 50g\n- Mã sản phẩm: SP-23752423694\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG ĐẾ ĐỰNG NẾN TEALIGHT GỐM SỨ DÙNG ĐÈN XÔNG TIỆN LỢI\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":50,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lmq29lceqme7ca","https://cf.shopee.vn/file/vn-11134207-7r98o-lkte9ie1qqm31f","https://cf.shopee.vn/file/vn-11134211-7r98o-lktieeo7p2yj03","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzfy1634","https://cf.shopee.vn/file/vn-11134211-7r98o-lktieeo7qhizda","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzhclm37","https://cf.shopee.vn/file/vn-11134211-7r98o-lktieeo7rw3fb4","https://cf.shopee.vn/file/vn-11134211-7r98o-lktieeo7tanv31","https://cf.shopee.vn/file/vn-11134211-7r98o-lktieeo7xid736"],"reviews":[],"variants":[{"id":"shopee_variant_221952128688","name":"Đế Trắng","sku":"","price":30000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkte9ie1s56j73","options":{}},{"id":"shopee_variant_320267970308","name":"Ly đựng Nến","sku":"","price":30000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi0agzho5f5u43","options":{}},{"id":"shopee_variant_221952128687","name":"Đế Đen","sku":"","price":30000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkte9ie1nxh70b","options":{}}]},{"id":"shopee_23579313881","sku":"SP-23579313881","categoryId":"thao-moc-xong","name":"Bạc hà khô xông nhà thanh lọc không khí xua côn trùng","price":30000,"originalPrice":null,"shortDesc":"Cây bạc hà khô xông nhà có thể kết hợp cùng với các loại thảo mộc khác: bồ kết, vỏ bưởi, hoa hồi, vỏ quế,... giúp thanh lọc không khí, thanh tẩy nhà cửa, xua đuổi côn trùng","description":"BẠC HÀ KHÔ XÔNG NHÀ THANH LỌC KHÔNG KHÍ XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\nCây bạc hà khô xông nhà có thể kết hợp cùng với các loại thảo mộc khác: bồ kết, vỏ bưởi, hoa hồi, vỏ quế,... giúp thanh lọc không khí, thanh tẩy nhà cửa, xua đuổi côn trùng\n\n✔ Mô tả chi tiết:\nCây bạc hà khô xông nhà có thể kết hợp cùng với các loại thảo mộc khác: bồ kết, vỏ bưởi, hoa hồi, vỏ quế,... giúp thanh lọc không khí, thanh tẩy nhà cửa, xua đuổi côn trùng.\n- Shop có bán thêm nhiều loại thảo mộc khác\n\nThành phần: 100% Cây bạc hà khô\nĐóng gói: 100g, 300g, 500g.\n✔Hướng dẫn sử dụng: cho lá sả khô cùng các thảo mộc khác lên trên mặt bếp xông rồi đốt 1 viên nến tròn bên dưới.\n✔Hướng dẫn bảo quản: bảo quản nơi khô ráo thoáng mát.\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bạc hà khô xông nhà thanh lọc không khí xua côn trùng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 500G BẠC HÀ KHÔ, 100G BẠC HÀ KHÔ, 300G BẠC HÀ KHÔ\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-23579313881\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG BẠC HÀ KHÔ XÔNG NHÀ THANH LỌC KHÔNG KHÍ XUA CÔN TRÙNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me81zledf7cz16","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j8293frib38","https://cf.shopee.vn/file/vn-11134207-7r98o-llapxdo8q1tifd","https://cf.shopee.vn/file/vn-11134207-7r98o-llar6fhf0clka9","https://cf.shopee.vn/file/vn-11134207-7r98o-llar6fhf1r60ba","https://cf.shopee.vn/file/vn-11134207-7r98o-llar6fhf35qgb6","https://cf.shopee.vn/file/vn-11134207-7r98o-llar6fhf5yvcbb"],"reviews":[],"variants":[{"id":"shopee_variant_221993739506","name":"500G BẠC HÀ KHÔ","sku":"","price":120000,"originalPrice":null,"weight":600,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8293frib38","options":{}},{"id":"shopee_variant_221993739504","name":"100G BẠC HÀ KHÔ","sku":"","price":30000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8293frib38","options":{}},{"id":"shopee_variant_221993739505","name":"300G BẠC HÀ KHÔ","sku":"","price":90000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8293frib38","options":{}}]},{"id":"shopee_23250987135","sku":"SP-23250987135","categoryId":"nen-thom","name":"Nến tealight 4 giờ bông mai đốt tinh dầu không khói","price":46000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao, thờ cúng, làm nến thơm khi kết hợp với tinh dầu sả","description":"NẾN TEALIGHT 4 GIỜ BÔNG MAI ĐỐT TINH DẦU KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao, thờ cúng, làm nến thơm khi kết hợp với tinh dầu sả\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao, thờ cúng, làm nến thơm khi kết hợp với tinh dầu sả,...\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.4 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 14 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 4h \n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi, có thể cháy trong 4 tiếng liên tục.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ bông mai đốt tinh dầu không khói\n- Danh mục: Tinh dầu\n- Phân loại: 2 VỈ 2H = 2OVIEN, 100 Viên 4H Mai, 2 VỈ 4H = 2OVIEN\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-23250987135\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ BÔNG MAI ĐỐT TINH DẦU KHÔNG KHÓI\n\n✔ Với đèn xông:\nNhỏ vài giọt tinh dầu vào nước trong khay đèn xông, sau đó làm nóng bằng nến hoặc điện tùy loại đèn.\n\n✔ Với máy khuếch tán:\nThêm tinh dầu theo dung tích máy và hướng dẫn của thiết bị.\n\n✔ Lưu ý:\nKhông uống tinh dầu, tránh tiếp xúc trực tiếp với mắt và để xa tầm tay trẻ em.\n\n✔ Bảo quản:\nĐậy kín nắp sau khi dùng, để nơi mát và tránh ánh nắng trực tiếp.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134211-7r98o-ll0arq0ukr0r74","https://cf.shopee.vn/file/vn-11134207-7r98o-llc0vbpfe85217","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815ggpo4d","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815dnks9a","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815f2581c","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815hva44c","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815j9uk91","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815kof0d4","https://cf.shopee.vn/file/vn-11134207-7qukw-lkat2kxlb4bs7a"],"reviews":[],"variants":[{"id":"shopee_variant_69695983652","name":"2 VỈ 2H = 2OVIEN","sku":"","price":46000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llc16wj9c6vc80","options":{}},{"id":"shopee_variant_184497527909","name":"100 Viên 4H Mai","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lyn174whf73596","options":{}},{"id":"shopee_variant_69695983651","name":"2 VỈ 4H = 2OVIEN","sku":"","price":55000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llc16wj9asaw27","options":{}}]},{"id":"shopee_22755245517","sku":"SP-22755245517","categoryId":"thao-moc-xong","name":"Gừng khô xông thảo mộc giảm cảm thanh lọc không khí","price":20000,"originalPrice":null,"shortDesc":"Gừng khô dùng với bếp Xông Thảo Mộc kết hợp với các loại thảo mộc khác như: bồ kết, vỏ bưởi, quế, hoa hồi, giúp thanh lọc không khí, Giảm cảm và lưu thông hơi thở.","description":"GỪNG KHÔ XÔNG THẢO MỘC GIẢM CẢM THANH LỌC KHÔNG KHÍ\n\n✔ Tổng quan sản phẩm:\nGừng khô dùng với bếp Xông Thảo Mộc kết hợp với các loại thảo mộc khác như: bồ kết, vỏ bưởi, quế, hoa hồi, giúp thanh lọc không khí, Giảm cảm và lưu thông hơi thở.\n\n✔ Mô tả chi tiết:\nGừng khô dùng với bếp Xông Thảo Mộc kết hợp với các loại thảo mộc khác như: bồ kết, vỏ bưởi, quế, hoa hồi, giúp thanh lọc không khí, Giảm cảm và lưu thông hơi thở\n\n*Thành phần: 100% Gừng khô\n*Định lượng: lá khô 50g, 100G, 200g đựng trong túi zip. \n\nHướng dẫn sử dụng:\n- Gừng Khô: cho Gừng khô lên trên mặt bếp xông (có thể kèm thêm hoa hồi, bồ kết, bưởi,... để tạo thêm mùi) đốt 1-3 viên nến tròn bên dưới. \n\n👉 Bảo quản: Nơi khô thoáng, tránh ánh nắng trực tiếp.\nXuất xứ: Việt Nam\n\n📍Cam kết\n+ Đảm bảo chất lượng, dịch vụ tốt, hàng được giao từ 1-3 ngày kể từ ngày đặt hàng.\n+ Giao hàng toàn quốc - nhận hàng trả tiền\n+ Đổi trả theo quy định của Shopee nhanh chóng\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Gừng khô xông thảo mộc giảm cảm thanh lọc không khí\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 50g Gừng Khô, 100g Gừng Khô, 200g Gừng Khô\n- Cân nặng vận chuyển: 50g\n- Mã sản phẩm: SP-22755245517\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG GỪNG KHÔ XÔNG THẢO MỘC GIẢM CẢM THANH LỌC KHÔNG KHÍ\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":50,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me83d3qykg0061","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j9a13zyf4d7","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye730dehe0","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye72yyu157","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye731ryxb6","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye7336jdcc","https://cf.shopee.vn/file/vn-11134207-7r98o-lx6xye72xk9l9c"],"reviews":[],"variants":[{"id":"shopee_variant_197042267249","name":"50g Gừng Khô","sku":"","price":20000,"originalPrice":null,"weight":50,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9a13zyf4d7","options":{}},{"id":"shopee_variant_222956800522","name":"100g Gừng Khô","sku":"","price":55000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9a13zyf4d7","options":{}},{"id":"shopee_variant_222956800523","name":"200g Gừng Khô","sku":"","price":80000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9a13zyf4d7","options":{}}]},{"id":"shopee_22361508205","sku":"SP-22361508205","categoryId":"thao-moc-xong","name":"Bồ kết khô gội đầu xông nhà khử mùi thơm tự nhiên","price":32000,"originalPrice":null,"shortDesc":"- Dùng gội đầu: Bồ kết có chứa các chất dưỡng ẩm, làm mềm, mượt và bóng tóc, giúp tóc không bị khô, xơ, gãy rụng. Ngoài ra Bồ kết có chứa các dược chất saponin, flavonoid, protein, canxi và các nguyên tố vi lượng có tác","description":"BỒ KẾT KHÔ GỘI ĐẦU XÔNG NHÀ KHỬ MÙI THƠM TỰ NHIÊN\n\n✔ Tổng quan sản phẩm:\n- Dùng gội đầu: Bồ kết có chứa các chất dưỡng ẩm, làm mềm, mượt và bóng tóc, giúp tóc không bị khô, xơ, gãy rụng. Ngoài ra Bồ kết có chứa các dược chất saponin, flavonoid, protein, canxi và các nguyên tố vi lượng có tác\n\n✔ Mô tả chi tiết:\nTÁC DỤNG BỒ KẾT:\n- Dùng gội đầu: Bồ kết có chứa các chất dưỡng ẩm, làm mềm, mượt và bóng tóc, giúp tóc không bị khô, xơ, gãy rụng. Ngoài ra Bồ kết có chứa các dược chất saponin, flavonoid, protein, canxi và các nguyên tố vi lượng có tác dụng làm sạch gàu, ức chế nấm, vi khuẩn gây bệnh cho da đầu. \n\n- Tác dụng Xông Nhà: Khử trùng, Khử Khuẩn không khí trong nhà, chống cảm cúm, hen suyễn, Xua đuổi côn trùng. Thanh tảy môi trường, Xua đuổi khí uế, mang lại vượng khí, may mắn bình an cho gia đình.\n\nHƯỚNG DẪN SỬ DỤNG:\n- Dùng Gội đầu: \n+ Bước 1: Để đạt được hiểu quả tốt nhất bạn nên nướng bồ kết trước bằng nồi chiên không dầu hoặc bếp lửa cho đến khi có mùi thơm và ngả màu vàng.\n+ Bước 2: bẻ nhỏ quả bồ kết và cho vào nồi nước đun sôi khoảng 15 phút, sau đó để nguội hoặc hơi ấm.\n+ Bước 3: làm ướt tóc bằng nước bồ kết và massage nhẹ nhàng da đầu và tóc trong 3 đến 5 phút, sau đó xả sạch bằng nước.\nLƯU Ý:\n+ Nước bồ kết sau khi nấu xong nên sử dụng trong ngày\n+ Thành phần saponin chỉ lưu giữ hương thơm trong thời gian ngắn, vì vậy để có mủi hương thơm tự nhiên, lâu dài bạn nên nấu nước bồ kết kết hợp với vỏ bưởi, cam,...\n\n- Dùng Xông Nhà: sử dụng từ 3 đến 10 quả bồ kết khô, cho lên bếp xông thảo mộc đốt bằng nến viên - nến tealight.\n\nHƯỚNG DẪN BẢO QUẢN: bảo quản nơi khô ráo, thoáng mát.\nĐịnh lượng: 100 gam, 500 gam\nXuất xứ: Việt nam \nCảnh báo: không được ăn.\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bồ kết khô gội đầu xông nhà khử mùi thơm tự nhiên\n- Danh mục: Thảo mộc xông\n- Phân loại: 200g Bồ Kết, 500g Bồ Kết, 100g Bồ Kết\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-22361508205\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG BỒ KẾT KHÔ GỘI ĐẦU XÔNG NHÀ KHỬ MÙI THƠM TỰ NHIÊN\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me821wr79y4h47","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j7hpw02di63","https://cf.shopee.vn/file/vn-11134207-7r98o-log7xpeen2rb9d","https://cf.shopee.vn/file/vn-11134207-7r98o-lyn1i7qfs28d3c"],"reviews":[],"variants":[{"id":"shopee_variant_235832531169","name":"200g Bồ Kết","sku":"","price":60000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7hpw02di63","options":{}},{"id":"shopee_variant_235832531170","name":"500g Bồ Kết","sku":"","price":142000,"originalPrice":null,"weight":600,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7hpw02di63","options":{}},{"id":"shopee_variant_235832531168","name":"100g Bồ Kết","sku":"","price":32000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7hpw02di63","options":{}}]},{"id":"shopee_22353875434","sku":"SP-22353875434","categoryId":"thao-moc-xong","name":"Thảo mộc xông nhà Phương Lâm thanh tẩy xua côn trùng","price":50000,"originalPrice":null,"shortDesc":"Thảo Mộc Xông Nhà Tự Nhiên – Thanh Lọc Không Gian sống.","description":"THẢO MỘC XÔNG NHÀ PHƯƠNG LÂM THANH TẨY XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\nThảo Mộc Xông Nhà Tự Nhiên – Thanh Lọc Không Gian sống.\n\n✔ Mô tả chi tiết:\n🌿 Thảo Mộc Xông Nhà Tự Nhiên – Thanh Lọc Không Gian sống\nThảo Mộc Xông Nhà (hay còn gọi là Xông Hơi Thảo Dược) là giải pháp hoàn hảo để thanh lọc không khí, cải thiện môi trường sống và mang lại lợi ích thư giãn tuyệt vời cho tinh thần. Sản phẩm được bào chế từ 100% thảo mộc thiên nhiên chọn lọc, an toàn cho sức khỏe và gần gũi với thiên nhiên.\n✅ Thông Tin Sản Phẩm\nThành phần: 100% Thảo mộc thiên nhiên.\n\nXuất xứ: Việt Nam.\n\nBảo quản: Zip kín miệng túi sau khi dùng, bảo quản nơi khô ráo, tránh ẩm ướt.\n\nChính sách bảo hành: Bù hàng/Hoàn tiền 100% nếu khách hàng phát hiện sản phẩm cũ, ẩm mốc hoặc kém chất lượng.\n✨ Công Dụng Tuyệt Vời Của Xông Thảo Mộc\nThanh lọc không khí: Giúp không gian sống trong lành, loại bỏ mùi ẩm mốc, khó chịu.\n\nHỗ trợ tinh thần: Mang lại cảm giác thư thái, dễ chịu, giúp giảm căng thẳng và mệt mỏi.\n\nCải thiện môi trường: Hỗ trợ xua đuổi côn trùng (đặc biệt là muỗi) một cách tự nhiên.\n\nĐể đáp ứng các mục đích sử dụng khác nhau, shop đã thiết kế các combo chuyên biệt:\n- Combo Tẩy Uế & Khai Vận: Xông nhà, cửa hàng, văn phòng đầu tháng, cuối năm, hoặc khi kinh doanh không thuận lợi.\n- Combo Xông Nhà Mới: Nhà mới, chung cư mới, văn phòng mới chuyển đến.\n- Combo Thư Giãn & Khử Mùi: Phòng ngủ, phòng khách, phòng làm việc cần không gian yên tĩnh, dễ chịu.\n- Combo Xua Muỗi & Thanh Lọc: Khu vực ẩm thấp, gần vườn cây, hoặc nhà có trẻ nhỏ.\n\n📖 Hướng Dẫn Sử Dụng Đơn Giản\nBạn có thể tùy chọn 2 phương pháp xông tùy theo sở thích:\n\nXông Khô (Đốt):\n\nSử dụng với nến tealight và bếp xông chuyên dụng hoặc than và khay nhôm.\n\nPhương pháp này sẽ tạo khói nhẹ, lan tỏa hương thơm nhanh.\n\nXông Nước (Nấu):\n\nCho thảo mộc vào nồi, nấu cùng nước sôi và thêm 1-2 thìa muối hột.\n\nDùng để lau nhà, hoặc đặt nồi nước xông ở góc nhà để hơi nước mang tinh dầu thảo mộc lan tỏa.\n\n⚠️ LƯU Ý QUAN TRỌNG: Luôn đốt xông thảo mộc ở nơi thoáng khí (cửa sổ, ban công, cửa ra vào). Tuyệt đối không xông trong phòng kín để đảm bảo an toàn và hiệu quả.\n\n💖 Cam Kết Từ Shop\n👉 Sản phẩm chính hãng, an toàn: Luôn chọn lọc và phân phối các mặt hàng gần gũi với thiên nhiên, đảm bảo an toàn cho sức khỏe.\n👉 Đổi trả nhanh chóng: Hỗ trợ trả hàng hoàn tiền nhanh nếu sản phẩm bị lỗi.\n👉 Hỗ trợ 24/7: Cần hỗ trợ thêm, đừng ngần ngại nhắn tin trực tiếp với shop nhé!\n\n🌈Xin cảm ơn quý khách đã tin chọn sản phẩm của shop! Chúc quý khách có những trải nghiệm mua sắm tuyệt vời nhất!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Thảo mộc xông nhà Phương Lâm thanh tẩy xua côn trùng\n- Danh mục: Thảo mộc xông\n- Phân loại: GÓI THANH LỌC KO KHÍ, HOA HỒI 50G, HẠT CÀ PHÊ RANG 50G, OẢI HƯƠNG 30G, GÓI XÔNG XUA MUỖI, KHUYNH DIỆP 100G, GÓI XÔNG NHÀ MỚI, GÓI XÔNG THƯ GIÃN, QUẾ 100G, GÓI COMBO 12 LOẠI, BỒ KẾT 100G, HƯƠNG THẢO 50G, và 7 phân loại khác\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-22353875434\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG THẢO MỘC XÔNG NHÀ PHƯƠNG LÂM THANH TẨY XUA CÔN TRÙNG\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mfv6ps7h86ix96","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-mfv7k8v1joju0b","https://cf.shopee.vn/file/vn-11134207-820l4-mftqyum4xqfc9e","https://cf.shopee.vn/file/vn-11134207-820l4-mftqyx99s3yj00","https://cf.shopee.vn/file/vn-11134207-820l4-mftqz1wnh62y6c","https://cf.shopee.vn/file/vn-11134207-820l4-mftr0rjwgx720d","https://cf.shopee.vn/file/vn-11134207-820l4-mftr0w1vp4wfdc"],"reviews":[],"variants":[{"id":"shopee_variant_238169116862","name":"GÓI THANH LỌC KO KHÍ","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jejtmns3k41","options":{}},{"id":"shopee_variant_218754372031","name":"HOA HỒI 50G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j97x7xdza26","options":{}},{"id":"shopee_variant_218754372030","name":"HẠT CÀ PHÊ RANG 50G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv7hggy4dmz28","options":{}},{"id":"shopee_variant_218754372028","name":"OẢI HƯƠNG 30G","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv7hsp9lix478","options":{}},{"id":"shopee_variant_238169116864","name":"GÓI XÔNG XUA MUỖI","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jduorludfaf","options":{}},{"id":"shopee_variant_218754372025","name":"KHUYNH DIỆP 100G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv7i0rgtp1oa1","options":{}},{"id":"shopee_variant_238169116859","name":"GÓI XÔNG NHÀ MỚI","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jg2rweq6fe0","options":{}},{"id":"shopee_variant_238169116861","name":"GÓI XÔNG THƯ GIÃN","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jg6i6d4w44e","options":{}},{"id":"shopee_variant_218754372027","name":"QUẾ 100G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8k8zsydgb0","options":{}},{"id":"shopee_variant_355817710874","name":"GÓI COMBO 12 LOẠI","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mnb9a6ez07b641","options":{}},{"id":"shopee_variant_218754372024","name":"BỒ KẾT 100G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j7hpw02di63","options":{}},{"id":"shopee_variant_218754372029","name":"HƯƠNG THẢO 50G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv7hp7nzg9ae2","options":{}},{"id":"shopee_variant_218754372026","name":"LÁ NGUYỆT QUẾ 50G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv7hxl08r9k27","options":{}},{"id":"shopee_variant_218754372023","name":"BẠC HÀ 100G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8293frib38","options":{}},{"id":"shopee_variant_238169116860","name":"GÓI XÔNG KHỬ MÙI","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9jfioudxc2c8","options":{}},{"id":"shopee_variant_218754372032","name":"LÁT CAM 100G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv7hbqhm2o88e","options":{}},{"id":"shopee_variant_218754372033","name":"GỪNG 100G","sku":"","price":50000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9a13zyf4d7","options":{}},{"id":"shopee_variant_238169116863","name":"GÓI XÔNG GIẢI CẢM","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv73sc9o4y7d4","options":{}},{"id":"shopee_variant_286959241893","name":"GÓI XÔNG TẨY UẾ","sku":"","price":70000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfv78e9n8a30d5","options":{}}]},{"id":"shopee_22278304112","sku":"SP-22278304112","categoryId":"nen-thom","name":"Nến tealight 4 giờ hoa mai trang trí tiệc không khói","price":46000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao","description":"NẾN TEALIGHT 4 GIỜ HOA MAI TRANG TRÍ TIỆC KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao,...\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 8-13 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h - 10h\n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi, có thể cháy trong 4 tiếng liên tục.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ hoa mai trang trí tiệc không khói\n- Danh mục: Nến thơm / nến tealight\n- Phân loại: 2 vỉ/20v - VÀNG 2h, 2 vỉ/20v - TRẮNG 2h, MÀU ĐỎ HỘP 100, MÀU VÀNG HỘP 100, MÀU TRẮNG HỘP 100, 2 vỉ/20v - ĐỎ 2h\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-22278304112\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ HOA MAI TRANG TRÍ TIỆC KHÔNG KHÓI\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0itth90rg6a","https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0irnhy9uge7","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbmc2zkbt706","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0ffggqze1","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0ffrpaja9","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0fft3uz01","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0ffuiff57","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzc58ctocf187","https://cf.shopee.vn/file/vn-11134207-7r98o-lkzc58ctpqzhc7"],"reviews":[],"variants":[{"id":"shopee_variant_221965271472","name":"2 vỉ/20v - VÀNG 2h","sku":"","price":46000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0ffow5n58","options":{}},{"id":"shopee_variant_221965271473","name":"2 vỉ/20v - TRẮNG 2h","sku":"","price":46000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0ffhvbff3","options":{}},{"id":"shopee_variant_221965271476","name":"MÀU ĐỎ HỘP 100","sku":"","price":125000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0jattw21k91","options":{}},{"id":"shopee_variant_221965271477","name":"MÀU VÀNG HỘP 100","sku":"","price":125000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0j86drpy40a","options":{}},{"id":"shopee_variant_221965271478","name":"MÀU TRẮNG HỘP 100","sku":"","price":125000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0jdfw2es8d3","options":{}},{"id":"shopee_variant_221965271479","name":"2 vỉ/20v - ĐỎ 2h","sku":"","price":46000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbt0ffnhl78e","options":{}}]},{"id":"shopee_22080262041","sku":"SP-22080262041","categoryId":"bep-xong","name":"Đèn xông tinh dầu đốt nến trang trí phòng ngủ sang trọng","price":89000,"originalPrice":null,"shortDesc":"Đèn xông trắng nhỏ sang trọng hiện đại, chất lượng gốm sứ cứng cáp.","description":"ĐÈN XÔNG TINH DẦU ĐỐT NẾN TRANG TRÍ PHÒNG NGỦ SANG TRỌNG\n\n✔ Tổng quan sản phẩm:\nĐèn xông trắng nhỏ sang trọng hiện đại, chất lượng gốm sứ cứng cáp.\n\n✔ Mô tả chi tiết:\nĐèn xông trắng nhỏ sang trọng hiện đại, chất lượng gốm sứ cứng cáp\n\nThông số:\n✔ Hoa trắng nhỏ: 7.5 x 7.5 x 8.5 cm\n✔ Hoa trắng to: 10 X 10 X 10 cm\n✔ Búp Sen: 7.5 x 7.5 x 10.5 cm\n\nHướng dẫn sử dụng\n✔️Bước 1\n Cung cấp nhiệt\n* Đặt nến vào trong khoang đốt nến của đèn\n* Châm lửa đốt nến để cung cấp nhiệt\n✔️ Bước 2\n đổ nước nóng vào đĩa đựng nước của đèn\n* Đổ nước khoảng 2/3 chén đựng nước xông, (Khuyến khích nên sử dụng nước ấm khoảng 60 độ C)\n✔️ Bước 3\n Nhỏ tinh dầu lên nước nóng\n* Nhỏ tinh dầu lên cốc đựng nước của đèn khi nước nóng\n* Nhỏ khoảng từ 3-4 giọt tinh dầu trong một lần sử dụng\n\n📍SHOP CAM KẾT sẽ đèn bù hàng cho khách nếu quá trình vận chuyển làm vỡ đèn.\n📍Nếu phát hiện bể, vỡ đèn - shop sẽ hỗ trợ ĐỔI đèn nhanh nhất có thể\n\n🌈Cảm ơn bạn đã giành thời gian cho shop, chúc bạn và gia đình có nhiều sức khỏe ạ!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Đèn xông tinh dầu đốt nến trang trí phòng ngủ sang trọng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: BÚP SEN + ĐẾ TRẮNG, HOA TRẮNG NHỎ, ĐÈN TO + ĐẾ TRẮNG, BÚP SEN, CON HƯU ĐEN, ĐÀI SEN, ĐÈN NHỎ + ĐẾ TRẮNG, CON HƯU VÀNG, ĐÀI SEN + ĐẾ TRẮNG, HOA TRẮNG TO\n- Cân nặng vận chuyển: 333g\n- Mã sản phẩm: SP-22080262041\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG ĐÈN XÔNG TINH DẦU ĐỐT NẾN TRANG TRÍ PHÒNG NGỦ SANG TRỌNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":333,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mhj7zuii26m966","https://cf.shopee.vn/file/vn-11134207-820l4-mhj7f5z611j7b4","https://cf.shopee.vn/file/vn-11134207-820l4-mhj8g7l5cmwy87","https://cf.shopee.vn/file/vn-11134207-820l4-mhj8g9usos1wc8","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzk5qi1f","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzir621d","https://cf.shopee.vn/file/vn-11134207-7r98o-llnied7ppz24a6","https://cf.shopee.vn/file/vn-11134207-7r98o-llnied7prdmkc1","https://cf.shopee.vn/file/vn-11134207-7r98o-llnied7pss70b0"],"reviews":[],"variants":[{"id":"shopee_variant_49699073017","name":"BÚP SEN + ĐẾ TRẮNG","sku":"","price":140000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llnmspjbtzrj42","options":{}},{"id":"shopee_variant_214581260520","name":"HOA TRẮNG NHỎ","sku":"","price":89000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfy3f3a7sg7iab","options":{}},{"id":"shopee_variant_49699073016","name":"ĐÈN TO + ĐẾ TRẮNG","sku":"","price":150000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llnmspjbsl73aa","options":{}},{"id":"shopee_variant_214581260522","name":"BÚP SEN","sku":"","price":120000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llnlfx02cjtb44","options":{}},{"id":"shopee_variant_445209502673","name":"CON HƯU ĐEN","sku":"","price":150000,"originalPrice":null,"weight":333,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mhj8223pc9hd54","options":{}},{"id":"shopee_variant_385209422961","name":"ĐÀI SEN","sku":"","price":100000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mhj7gkcnlybm19","options":{}},{"id":"shopee_variant_49699073015","name":"ĐÈN NHỎ + ĐẾ TRẮNG","sku":"","price":100000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llnmspjbr6mn6c","options":{}},{"id":"shopee_variant_445209502672","name":"CON HƯU VÀNG","sku":"","price":150000,"originalPrice":null,"weight":333,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mhj8279dxvr700","options":{}},{"id":"shopee_variant_385209422962","name":"ĐÀI SEN + ĐẾ TRẮNG","sku":"","price":150000,"originalPrice":null,"weight":500,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mhj7gn3k4cg4ee","options":{}},{"id":"shopee_variant_214581260521","name":"HOA TRẮNG TO","sku":"","price":150000,"originalPrice":null,"weight":600,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfy3euke9udmc5","options":{}}]},{"id":"shopee_21583817320","sku":"SP-21583817320","categoryId":"thao-moc-xong","name":"Vỏ bưởi khô xông nhà gội đầu thơm dịu tự nhiên","price":14119,"originalPrice":null,"shortDesc":"✔Trong vỏ bưởi có nhiều dưỡng chất tốt cho sức khỏe như: Vitamin C, Chất sơ, Flavonoids và Polyphenols, Các khoáng chất và dưỡng chất khác","description":"VỎ BƯỞI KHÔ XÔNG NHÀ GỘI ĐẦU THƠM DỊU TỰ NHIÊN\n\n✔ Tổng quan sản phẩm:\n✔Trong vỏ bưởi có nhiều dưỡng chất tốt cho sức khỏe như: Vitamin C, Chất sơ, Flavonoids và Polyphenols, Các khoáng chất và dưỡng chất khác\n\n✔ Mô tả chi tiết:\nVỏ bưởi khô da xanh thơm mát, loại KHÔNG MỐC\n\n✔Trong vỏ bưởi có nhiều dưỡng chất tốt cho sức khỏe như: Vitamin C, Chất sơ, Flavonoids và Polyphenols, Các khoáng chất và dưỡng chất khác,..\n✔ Vỏ bưởi phơi năng có thể bảo quản và dùng được lâu\n\nĐóng gói: 100g, 300g, 500g\nHướng dẫn bảo quản: bảo quản nơi khô ráo thoáng mát.\nXuất xứ: Việt Nam\n\n👉HƯƠNG DẪN SỬ DỤNG: \n- Đốt với bếp xông giúp thơm nhà thanh lọc không khí\n- Ngâm với nước nóng để tắm gội rất tốt cho sức khỏe và da (đặc biệt khi bị ớn lạnh, cảm cúm - đun nóng ngâm chân) \n- Uống như trà giảm cảm, giảm cân\n- Gội đầu giúp kích thích mọc tóc, tóc khỏe mượt\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\nlasakho #lasa #lasaxongnha #boket #bepdunboket #nieudotboket #xongboket #tinhdau #nendotdenxongtinhdau#nenphuonglam\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Vỏ bưởi khô xông nhà gội đầu thơm dịu tự nhiên\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 100G BƯỞI PHƠI NẮNG, 200G BƯỞI PHƠI NẮNG, 500G BƯỞI PHƠI NẮNG\n- Cân nặng vận chuyển: 180g\n- Mã sản phẩm: SP-21583817320\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG VỎ BƯỞI KHÔ XÔNG NHÀ GỘI ĐẦU THƠM DỊU TỰ NHIÊN\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":180,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me83dsqju3gk26","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j8rh42oedc8","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-7r98o-llapxdo8depi56","https://cf.shopee.vn/file/vn-11134207-7r98o-llapxdo8et9yde","https://cf.shopee.vn/file/vn-11134207-7r98o-llapxdo8g7ueaa","https://cf.shopee.vn/file/vn-11134207-7r98o-llapxdo8j0za58"],"reviews":[],"variants":[{"id":"shopee_variant_214559818874","name":"100G BƯỞI PHƠI NẮNG","sku":"","price":14119,"originalPrice":null,"weight":180,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8rh42oedc8","options":{}},{"id":"shopee_variant_214559818875","name":"200G BƯỞI PHƠI NẮNG","sku":"","price":21716,"originalPrice":null,"weight":180,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8rh42oedc8","options":{}},{"id":"shopee_variant_214559818876","name":"500G BƯỞI PHƠI NẮNG","sku":"","price":60000,"originalPrice":null,"weight":180,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j8rh42oedc8","options":{}}]},{"id":"shopee_19636361517","sku":"SP-19636361517","categoryId":"nen-thom","name":"Nến tealight 4 giờ đốt đèn xông trang trí không khói","price":40000,"originalPrice":null,"shortDesc":"Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ dùng để xông tinh dầu, xông thảo mộc, trang trí tiệc cưới, quán cafe, ngoài ra còn được dùng để hâm nóng trà, hâm nóng đồ ăn. Đặc biệt không khói không mùi khi đốt liên tụ.","description":"NẾN TEALIGHT 4 GIỜ ĐỐT ĐÈN XÔNG TRANG TRÍ KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nMô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ dùng để xông tinh dầu, xông thảo mộc, trang trí tiệc cưới, quán cafe, ngoài ra còn được dùng để hâm nóng trà, hâm nóng đồ ăn. Đặc biệt không khói không mùi khi đốt liên tụ.\n\n✔ Mô tả chi tiết:\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ dùng để xông tinh dầu, xông thảo mộc, trang trí tiệc cưới, quán cafe, ngoài ra còn được dùng để hâm nóng trà, hâm nóng đồ ăn. Đặc biệt không khói không mùi khi đốt liên tục 4 giờ\n\nLƯU Ý: Trên thị trường có 2 Loại NẾN ĐỦ GIỜ Và NẾN THIẾU GIỜ, Shop chỉ bán NẾN ĐỦ GIỜ nên giá sẽ nhỉnh hơn 1 chút.\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: \n-Nến 4h 3.8 x 3.8 x 1.6 cm\n-Nến 2h 3.8 x 3.8 x 1 cm\nKhối lượng: 8-14 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h \n✔ Quy cách đóng gói:1 Viên\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ dùng để xông tinh dầu, xông thảo mộc, trang trí tiệc cưới, quán cafe, ngoài ra còn được dùng để hâm nóng trà, hâm nóng đồ ăn. Đặc biệt không khói không mùi khi đốt liên tục 4 giờ\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ đốt đèn xông trang trí không khói\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 2 HỘP/ 20V 4H TRƠN🤍, HỘP 10V TRƠN 4H🤍, HỘP 10V TRẮNG 4H🤍, 2 HỘP/ 20V 4H❤️, 2 HỘP/ 20V 4H💛, HỘP 10V TRẮNG 2H🤍, 2 HỘP/ 20V 4H🤍, 5 VIÊN VỎ NHÔM 8H, HỘP 10V LÀI 4H💛, 2 HỘP/ 20V 4H - LÀI🔥, 2 HỘP/ 20V 2H🤍, 2 HỘP/ 20V 2H💛, và 2 phân loại khác\n- Cân nặng vận chuyển: 100g\n- Mã sản phẩm: SP-19636361517\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ ĐỐT ĐÈN XÔNG TRANG TRÍ KHÔNG KHÓI\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":100,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lmqvki7i74rj1b","https://cf.shopee.vn/file/vn-11134207-7qukw-lkarlyg9xbj04f","https://cf.shopee.vn/file/vn-11134207-7qukw-ljy1ed7er9c224","https://cf.shopee.vn/file/vn-11134207-7qukw-ljy1ed7esnwi55","https://cf.shopee.vn/file/vn-11134207-7r98o-lx9osk9qq6l7c3","https://cf.shopee.vn/file/vn-11134207-7qukw-lkarlyg9t3to55","https://cf.shopee.vn/file/vn-11134207-7qukw-lkarlyg9uie43b","https://cf.shopee.vn/file/vn-11134207-7qukw-lkarlyg9vwyk9b","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz29yc7alkk58"],"reviews":[],"variants":[{"id":"shopee_variant_181860225801","name":"2 HỘP/ 20V 4H TRƠN🤍","sku":"","price":48000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc3trim9g5g5c","options":{}},{"id":"shopee_variant_281265692611","name":"HỘP 10V TRƠN 4H🤍","sku":"","price":50000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7yw73prz7k3d","options":{}},{"id":"shopee_variant_281265692609","name":"HỘP 10V TRẮNG 4H🤍","sku":"","price":50000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7yw2eemm8673","options":{}},{"id":"shopee_variant_240485670556","name":"2 HỘP/ 20V 4H❤️","sku":"","price":48000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc4h1vub6kj01","options":{}},{"id":"shopee_variant_220387704322","name":"2 HỘP/ 20V 4H💛","sku":"","price":48000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc4h3kxmgw025","options":{}},{"id":"shopee_variant_281265692610","name":"HỘP 10V TRẮNG 2H🤍","sku":"","price":40000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7yw4j8derkb5","options":{}},{"id":"shopee_variant_220387704321","name":"2 HỘP/ 20V 4H🤍","sku":"","price":48000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc3ucnze3gh7a","options":{}},{"id":"shopee_variant_281265692612","name":"5 VIÊN VỎ NHÔM 8H","sku":"","price":85000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7ywhhos0zr4b","options":{}},{"id":"shopee_variant_291432885081","name":"HỘP 10V LÀI 4H💛","sku":"","price":90000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7yyjv3sxkwa0","options":{}},{"id":"shopee_variant_272429767579","name":"2 HỘP/ 20V 4H - LÀI🔥","sku":"","price":60000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc3tk0q328497","options":{}},{"id":"shopee_variant_240485670557","name":"2 HỘP/ 20V 2H🤍","sku":"","price":42000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc3toasd0jpaf","options":{}},{"id":"shopee_variant_240485670559","name":"2 HỘP/ 20V 2H💛","sku":"","price":42000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc41ehj01sf69","options":{}},{"id":"shopee_variant_240485670558","name":"2 HỘP/ 20V 2H❤️","sku":"","price":42000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-81ztc-mlc41g5qqyo530","options":{}},{"id":"shopee_variant_188687128794","name":"5 VIÊN TRANG TRÍ 8H","sku":"","price":90000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7ywk3nzmkk70","options":{}}]},{"id":"shopee_18592779414","sku":"SP-18592779414","categoryId":"thao-moc-xong","name":"Lá sả khô xông nhà thanh lọc không khí xua côn trùng","price":20000,"originalPrice":null,"shortDesc":"Lá sả khô xông nhà có thể kết hợp cùng với các loại thảo mộc khác: bồ kết, vỏ bưởi, hoa hồi, vỏ quế,... giúp thanh lọc không khí, thanh tẩy nhà cửa, xua đuổi côn trùng","description":"LÁ SẢ KHÔ XÔNG NHÀ THANH LỌC KHÔNG KHÍ XUA CÔN TRÙNG\n\n✔ Tổng quan sản phẩm:\nLá sả khô xông nhà có thể kết hợp cùng với các loại thảo mộc khác: bồ kết, vỏ bưởi, hoa hồi, vỏ quế,... giúp thanh lọc không khí, thanh tẩy nhà cửa, xua đuổi côn trùng\n\n✔ Mô tả chi tiết:\nLá sả khô xông nhà có thể kết hợp cùng với các loại thảo mộc khác: bồ kết, vỏ bưởi, hoa hồi, vỏ quế,... giúp thanh lọc không khí, thanh tẩy nhà cửa, xua đuổi côn trùng.\n- Shop có bán thêm nhiều loại thảo mộc khác\n\nThành phần: 100% lá sả khô\nĐóng gói: 100g, 300g, 500g.\n✔Hướng dẫn sử dụng: cho lá sả khô cùng các thảo mộc khác lên trên mặt bếp xông rồi đốt 1 viên nến tròn bên dưới.\n✔Hướng dẫn bảo quản: bảo quản nơi khô ráo thoáng mát.\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\nlasakho #lasa #lasaxongnha #boket #bepdunboket #nieudotboket #xongboket #tinhdau #nendotdenxongtinhdau#nenphuonglam\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Lá sả khô xông nhà thanh lọc không khí xua côn trùng\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 300G LÁ SẢ KHÔ, 500G LÁ SẢ KHÔ, 100G LÁ SẢ KHÔ\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-18592779414\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG LÁ SẢ KHÔ XÔNG NHÀ THANH LỌC KHÔNG KHÍ XUA CÔN TRÙNG\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me81vo6c8xky63","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9j9g85pyis16","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-7r98o-lla5li015mt276","https://cf.shopee.vn/file/vn-11134207-7r98o-lla5li01b92ub6","https://cf.shopee.vn/file/vn-11134207-7r98o-llapxdo8n8om25","https://cf.shopee.vn/file/vn-11134207-7r98o-lla5li019uief1"],"reviews":[],"variants":[{"id":"shopee_variant_167845924296","name":"300G LÁ SẢ KHÔ","sku":"","price":60000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9g85pyis16","options":{}},{"id":"shopee_variant_167845924297","name":"500G LÁ SẢ KHÔ","sku":"","price":80000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9g85pyis16","options":{}},{"id":"shopee_variant_166081437519","name":"100G LÁ SẢ KHÔ","sku":"","price":20000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j9g85pyis16","options":{}}]},{"id":"shopee_18092365763","sku":"SP-18092365763","categoryId":"thao-moc-xong","name":"Combo thảo mộc xông nhà thanh lọc khử mùi tự nhiên","price":45000,"originalPrice":null,"shortDesc":"hoặc soạn theo yêu cầu (nhắn tin với shop để shop soạn theo yêu cầu của bạn nha).","description":"COMBO THẢO MỘC XÔNG NHÀ THANH LỌC KHỬ MÙI TỰ NHIÊN\n\n✔ Tổng quan sản phẩm:\nhoặc soạn theo yêu cầu (nhắn tin với shop để shop soạn theo yêu cầu của bạn nha).\n\n✔ Mô tả chi tiết:\nCombo 5 Loại thảo mộc shop soạn sẵn\nhoặc soạn theo yêu cầu (nhắn tin với shop để shop soạn theo yêu cầu của bạn nha)\n✔Đóng gói: 100g, 500g\n✔Hướng dẫn bảo quản: bảo quản nơi khô ráo thoáng mát.\nXuất xứ: Việt Nam\n\nXông thảo mộc, còn được gọi là xông hơi thảo dược. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và tinh thần: là một phương pháp giúp thanh lọc không khí, xua đủi côn trùng, cải thiện môi trường sống. \n\n*** LƯU Ý: Đốt Xông thảo mộc ở những nơi thoáng, không xông trong phòng kín\n\nCÔNG DỤNG xông thảo mộc:\n✔ Hỗ trợ hô hấp: Hương thơm của các thảo dược trong xông thảo mộc có thể hỗ trợ làm sạch đường hô hấp, giúp làm thông thoáng và dễ thở hơn.\n✔ Thư giãn tinh thần: Hương thơm từ thảo dược giúp giảm căng thẳng và lo âu.\n✔ Tăng cường tuần hoàn: Cải thiện việc cung cấp máu và dưỡng chất cho cơ thể.\n\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Combo thảo mộc xông nhà thanh lọc khử mùi tự nhiên\n- Danh mục: Combo xông nhà\n- Phân loại: 100G, 500G\n- Cân nặng vận chuyển: 200g\n- Mã sản phẩm: SP-18092365763\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG COMBO THẢO MỘC XÔNG NHÀ THANH LỌC KHỬ MÙI TỰ NHIÊN\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":200,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-me83kcluw9390c","https://cf.shopee.vn/file/vn-11134207-820l4-me9j6tiztp8j9f","https://cf.shopee.vn/file/vn-11134207-820l4-me83kilmeww12a","https://cf.shopee.vn/file/vn-11134207-820l4-mer5ta7gvrb8a3","https://cf.shopee.vn/file/vn-11134207-820l4-mer5tc2qg0eb34","https://cf.shopee.vn/file/vn-11134207-820l4-mer5thsm6y2rd9"],"reviews":[],"variants":[{"id":"shopee_variant_148340038670","name":"100G","sku":"","price":45000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j6tiztp8j9f","options":{}},{"id":"shopee_variant_148340038671","name":"500G","sku":"","price":169000,"originalPrice":null,"weight":600,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me9j6tiztp8j9f","options":{}}]},{"id":"shopee_17395821074","sku":"SP-17395821074","categoryId":"combo","name":"Bếp xông thảo mộc bồ kết đất nung khử mùi thơm nhà","price":100000,"originalPrice":null,"shortDesc":"BẾP ĐẤT NUNG dùng để xông Thảo Mộc, bồ kết, hương thảo, giúp thanh lọc không khí, thơm nhà","description":"BẾP XÔNG THẢO MỘC BỒ KẾT ĐẤT NUNG KHỬ MÙI THƠM NHÀ\n\n✔ Tổng quan sản phẩm:\nBẾP ĐẤT NUNG dùng để xông Thảo Mộc, bồ kết, hương thảo, giúp thanh lọc không khí, thơm nhà\n\n✔ Mô tả chi tiết:\nBẾP ĐẤT NUNG dùng để xông Thảo Mộc, bồ kết, hương thảo, giúp thanh lọc không khí, thơm nhà.\n\nThành phần: 100% đất sét\nThông số kĩ thuật: đường kính 13cm-16cm\nHướng dẫn sử dụng: Chọn thảo dược và đặt lên mặt bếp cho 1 viên vào miệng bếp và đốt. \n✔ Bảo quản: tránh làm rơi rớt, va đập mạnh có thể làm vỡ hoặc mẻ\n\nCÔNG DỤNG xông thảo mộc:\n✔ Hỗ trợ hô hấp: Hương thơm của các thảo dược trong xông thảo mộc có thể hỗ trợ làm sạch đường hô hấp, giúp làm thông thoáng và dễ thở hơn.\n✔ Thư giãn tinh thần: Hương thơm từ thảo dược giúp giảm căng thẳng và lo âu.\n✔ Tăng cường tuần hoàn: Cải thiện việc cung cấp máu và dưỡng chất cho cơ thể.\n\n📍 Shop cam kết sẽ ĐỀN BÙ cho khách hàng nếu quá trình vận chuyển làm VỠ sản phẩm.\n\n****LƯU Ý: khi đốt mẫu bếp nhỏ như Hình Vuông hoặc Trụ Tròn nên cắt ngắn tim nến nếu ngọn lửa lớn để tránh vỡ bếp và hạn chế khói khi đốt. Chỉ nên đốt đến khi Thảo Mộc vừa nóng thì sẽ đạt được hiểu quả nhất & bảo vệ bếp khỏi nguy cơ vỡ bếp.\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bếp xông thảo mộc bồ kết đất nung khử mùi thơm nhà\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: Bếp Xông 13cm (Lẻ), BỘ THƯ GIÃN 16CM, BỘ CAO CẤP 16CM, BỘ TRẢI NGHIỆM 13CM, BỘ XÔNG KHỬ MÙI 13CM, BỘ THANH LỌC KK 13CM, BỘ CAO CẤP 13CM, BỘ TRẢI NGHIỆM 16CM, BỘ XUA MUỖI 13CM, BỘ THƯ GIÃN 13CM, BỘ GIẢI CẢM 16CM, BỘ GIẢI CẢM 13CM, và 8 phân loại khác\n- Cân nặng vận chuyển: 1300g\n- Mã sản phẩm: SP-17395821074\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG BẾP XÔNG THẢO MỘC BỒ KẾT ĐẤT NUNG KHỬ MÙI THƠM NHÀ\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":1300,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mesdeg5484cj59","https://cf.shopee.vn/file/vn-11134207-820l4-mi32lies5on597","https://cf.shopee.vn/file/vn-11134207-820l4-mer7dkezq22v57","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-820l4-me9jlzvew5xcc9","https://cf.shopee.vn/file/vn-11134207-820l4-me9ko8x2sa2pc5","https://cf.shopee.vn/file/vn-11134207-7ras8-mcedhrmcsqqa9e","https://cf.shopee.vn/file/vn-11134207-7ras8-mcedicxjm1xufb"],"reviews":[],"variants":[{"id":"shopee_variant_194717189919","name":"Bếp Xông 13cm (Lẻ)","sku":"","price":100000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mer5s9y6b47a1a","options":{}},{"id":"shopee_variant_266960240098","name":"BỘ THƯ GIÃN 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mfttnprcgmx718","options":{}},{"id":"shopee_variant_340277903902","name":"BỘ CAO CẤP 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mik5fcbv5k3l74","options":{}},{"id":"shopee_variant_281959715541","name":"BỘ TRẢI NGHIỆM 13CM","sku":"","price":120000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mftq1otr7zt63b","options":{}},{"id":"shopee_variant_206267475676","name":"BỘ XÔNG KHỬ MÙI 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32jcl77xfk0d","options":{}},{"id":"shopee_variant_306594380508","name":"BỘ THANH LỌC KK 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32hc6h0nie3f","options":{}},{"id":"shopee_variant_340277903901","name":"BỘ CAO CẤP 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mik5fds8pxxi86","options":{}},{"id":"shopee_variant_281959715542","name":"BỘ TRẢI NGHIỆM 16CM","sku":"","price":140000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mftq1q9r3cax2e","options":{}},{"id":"shopee_variant_306594380507","name":"BỘ XUA MUỖI 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32hr3h3hfm8e","options":{}},{"id":"shopee_variant_306594380506","name":"BỘ THƯ GIÃN 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32ip10ei9y4f","options":{}},{"id":"shopee_variant_266960240099","name":"BỘ GIẢI CẢM 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32i8lbot1j63","options":{}},{"id":"shopee_variant_218209461669","name":"BỘ GIẢI CẢM 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32i51tmy9ua0","options":{}},{"id":"shopee_variant_281959715543","name":"BỘ XÔNG NHÀ MỚI 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32jv2qdlhd09","options":{}},{"id":"shopee_variant_261960240490","name":"BỘ XÔNG TẨY UẾ 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32kbn7qxojb5","options":{}},{"id":"shopee_variant_266960240100","name":"BỘ XUA MUỖI 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32hui9yps0a7","options":{}},{"id":"shopee_variant_266960240096","name":"BỘ XÔNG NHÀ MỚI 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32jzkqgpom28","options":{}},{"id":"shopee_variant_266960240101","name":"BỘ THANH LỌC KK 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32h76byhhca4","options":{}},{"id":"shopee_variant_194812290706","name":"BỘ XÔNG TẨY UẾ 13CM","sku":"","price":260000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32kec7nxfqb1","options":{}},{"id":"shopee_variant_194717189920","name":"Bếp xông 15cm (Lẻ)","sku":"","price":130000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mgw6bulk3aiwef","options":{}},{"id":"shopee_variant_266960240097","name":"BỘ XÔNG KHỬ MÙI 16CM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32iso81xjcf3","options":{}}]},{"id":"shopee_16798613604","sku":"SP-16798613604","categoryId":"combo","name":"Bếp xông thảo mộc bồ kết đất nung thanh tẩy không khí","price":90000,"originalPrice":null,"shortDesc":"Xông thảo mộc, còn được gọi là xông hơi thảo dược, là một phương pháp truyền thống trong y học cổ truyền của nhiều quốc gia, như Trung Quốc, Ấn Độ. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và.","description":"BẾP XÔNG THẢO MỘC BỒ KẾT ĐẤT NUNG THANH TẨY KHÔNG KHÍ\n\n✔ Tổng quan sản phẩm:\nXông thảo mộc, còn được gọi là xông hơi thảo dược, là một phương pháp truyền thống trong y học cổ truyền của nhiều quốc gia, như Trung Quốc, Ấn Độ. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và.\n\n✔ Mô tả chi tiết:\nXông thảo mộc, còn được gọi là xông hơi thảo dược, là một phương pháp truyền thống trong y học cổ truyền của nhiều quốc gia, như Trung Quốc, Ấn Độ. Công dụng của xông thảo mộc được cho là có nhiều lợi ích cho sức khỏe và tinh thần\n\nCÔNG DỤNG xông thảo mộc:\n✔ Hỗ trợ hô hấp: Hương thơm của các thảo dược trong xông thảo mộc có thể hỗ trợ làm sạch đường hô hấp, giúp làm thông thoáng và dễ thở hơn.\n✔ Thư giãn tinh thần: Hương thơm từ thảo dược giúp giảm căng thẳng và lo âu.\n✔ Tăng cường tuần hoàn: Cải thiện việc cung cấp máu và dưỡng chất cho cơ thể.\n\n📍 Shop cam kết sẽ ĐỀN BÙ cho khách hàng nếu quá trình vận chuyển làm VỠ sản phẩm.\n📍 Bếp sẽ được giao màu ngẫu nhiên, bạn có thể nhắn tin trực tiếp với shop để chọn màu ạ\n****LƯU Ý: khi đốt mẫu bếp nhỏ như Hình Vuông hoặc Trụ Tròn nên cắt ngắn tim nến nếu ngọn lửa lớn để tránh vỡ bếp và hạn chế khói khi đốt. Chỉ nên đốt đến khi Thảo Mộc vừa nóng thì sẽ đạt được hiểu quả nhất & bảo vệ bếp khỏi nguy cơ vỡ bếp.\n\nThành phần: 100% đất sét\nThông số kĩ thuật: đường kính 13cm, 15cm\nHướng dẫn sử dụng: Chọn thảo dược và đặt lên mặt bếp cho 1 viên vào miệng bếp và đốt. \n\n✔ Cách tắt nến không khói: dùng cây tăm đè tim nến xuống sao cho chìm xuống nước, lửa sẽ tắt mà không khói.\n✔ Bảo quản: tránh làm rơi rớt, va đập mạnh có thể làm vỡ hoặc mẻ\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\nXuất xứ: Việt Nam\n\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Bếp xông thảo mộc bồ kết đất nung thanh tẩy không khí\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: BỘ XÔNG CAO CẤP 13CM, Lẻ NIÊU ĐẤT 15CM, BỘ XUA CÔN TRÙNG, BỘ THANH LỌC KO KHÍ, Lẻ NIÊU ĐẤT 13CM, BỘ XÔNG KHỬ MÙI, BỘ XÔNG GIẢI CẢM, BỘ XÔNG CAO CẤP 16CM, BỘ XÔNG TẨY UẾ, BỘ TRẢI NGHIỆM 13CM, BỘ TRẢI NGHIỆM 15CM, BỘ XÔNG NHÀ MỚI, và 2 phân loại khác\n- Cân nặng vận chuyển: 1000g\n- Mã sản phẩm: SP-16798613604\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG BẾP XÔNG THẢO MỘC BỒ KẾT ĐẤT NUNG THANH TẨY KHÔNG KHÍ\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":1000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mgw6arugeu4v32","https://cf.shopee.vn/file/vn-11134207-820l4-me81slwur4zme9","https://cf.shopee.vn/file/vn-11134207-820l4-me81snlbxzbac9","https://cf.shopee.vn/file/vn-11134207-7ras8-mcedicxjm1xufb","https://cf.shopee.vn/file/vn-11134207-820l4-mftq1otr7zt63b","https://cf.shopee.vn/file/vn-11134207-820l4-mftqnuhzdclq24","https://cf.shopee.vn/file/vn-11134207-820l4-meraaf49fz0h1e","https://cf.shopee.vn/file/vn-11134207-820l4-mfv6ps7h86ix96","https://cf.shopee.vn/file/vn-11134207-820l4-mfv816twynm5ea"],"reviews":[],"variants":[{"id":"shopee_variant_425277938493","name":"BỘ XÔNG CAO CẤP 13CM","sku":"","price":260000,"originalPrice":null,"weight":1500,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mik5fds8pxxi86","options":{}},{"id":"shopee_variant_176061315563","name":"Lẻ NIÊU ĐẤT 15CM","sku":"","price":100000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mgw6bulk3aiwef","options":{}},{"id":"shopee_variant_271958960062","name":"BỘ XUA CÔN TRÙNG","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32hr3h3hfm8e","options":{}},{"id":"shopee_variant_271958960059","name":"BỘ THANH LỌC KO KHÍ","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32hc6h0nie3f","options":{}},{"id":"shopee_variant_176061315556","name":"Lẻ NIÊU ĐẤT 13CM","sku":"","price":90000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mer5s9y6b47a1a","options":{}},{"id":"shopee_variant_271958960060","name":"BỘ XÔNG KHỬ MÙI","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32jcl77xfk0d","options":{}},{"id":"shopee_variant_271958960063","name":"BỘ XÔNG GIẢI CẢM","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32i51tmy9ua0","options":{}},{"id":"shopee_variant_425277938494","name":"BỘ XÔNG CAO CẤP 16CM","sku":"","price":280000,"originalPrice":null,"weight":1500,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mik5fcbv5k3l74","options":{}},{"id":"shopee_variant_271958960058","name":"BỘ XÔNG TẨY UẾ","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32kec7nxfqb1","options":{}},{"id":"shopee_variant_271958960056","name":"BỘ TRẢI NGHIỆM 13CM","sku":"","price":120000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mftq1otr7zt63b","options":{}},{"id":"shopee_variant_271958960057","name":"BỘ TRẢI NGHIỆM 15CM","sku":"","price":140000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mftq1q9r3cax2e","options":{}},{"id":"shopee_variant_271958960061","name":"BỘ XÔNG NHÀ MỚI","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32jv2qdlhd09","options":{}},{"id":"shopee_variant_271958960064","name":"BỘ XÔNG THƯ GIÃN","sku":"","price":250000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32ip10ei9y4f","options":{}},{"id":"shopee_variant_271958960065","name":"BỘ 15CM + 5 LOẠI TM","sku":"","price":280000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mi32r4zy0bgn4c","options":{}}]},{"id":"shopee_12551285956","sku":"SP-12551285956","categoryId":"nen-thom","name":"Nến tealight 4 giờ đốt đèn xông tinh dầu trang trí tiệc","price":125000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao","description":"NẾN TEALIGHT 4 GIỜ ĐỐT ĐÈN XÔNG TINH DẦU TRANG TRÍ TIỆC\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao,...\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 8-13 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h - 10h\n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi, có thể cháy trong 4 tiếng liên tục.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ đốt đèn xông tinh dầu trang trí tiệc\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 100V 2H-TRẮNG, 100V 2H-VÀNG, 100V 2H-ĐỎ\n- Cân nặng vận chuyển: 1000g\n- Mã sản phẩm: SP-12551285956\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ ĐỐT ĐÈN XÔNG TINH DẦU TRANG TRÍ TIỆC\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":1000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lmqvki7ie5lr2a","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59la5dg7c","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59lbjxwfe","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59lcyic45","https://cf.shopee.vn/file/vn-11134207-7r98o-lkusos724xr140","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59lfrn8b6","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59led2s28","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59liks4a8","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1m59lh67oa2"],"reviews":[],"variants":[{"id":"shopee_variant_122311453980","name":"100V 2H-TRẮNG","sku":"","price":125000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llipto0yrx6wa7","options":{}},{"id":"shopee_variant_122311453981","name":"100V 2H-VÀNG","sku":"","price":125000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbmc2zepjfc0","options":{}},{"id":"shopee_variant_122311453982","name":"100V 2H-ĐỎ","sku":"","price":125000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbmc2zdayz8d","options":{}}]},{"id":"shopee_7863836931","sku":"SP-7863836931","categoryId":"nen-thom","name":"Nến tealight 4 giờ hộp nhỏ trang trí không khói không mùi","price":50000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, trang trí tiệc sinh nhật, đầy tháng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao, thờ cúng","description":"NẾN TEALIGHT 4 GIỜ HỘP NHỎ TRANG TRÍ KHÔNG KHÓI KHÔNG MÙI\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, trang trí tiệc sinh nhật, đầy tháng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao, thờ cúng\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, trang trí tiệc sinh nhật, đầy tháng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao, thờ cúng,...\n\n✔ Đóng gói: 10 viên / hộp\n\nThông Số nến:\nKích thước 1 viên: 3.8 x 3.8 x 1.3 cm\nKích thước 1 vỉ 10 viên: 20 x 3 x 7 cm\nKhối lượng: 8-14 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h \n\n✔Mô tả sản phẩm: Nến Tealight dạng viên tròn nhỏ, hộp 10 viên nhỏ gọn có thể mang theo đi du lịch, dùng để đốt đèn xông tinh dầu trong spa khách sạn làm thơm phòng, trang trí tiệc sinh nhật, quán cafe, ngoài ra còn được dùng để hâm nóng trà, hâm nóng đồ ăn. \nXuất xứ: Việt Nam\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ hộp nhỏ trang trí không khói không mùi\n- Danh mục: Nến thơm / nến tealight\n- Phân loại: 2VỈ 2H/20v - BM, 2VỈ 4H/20v - BM, 2VỈ 4H/20v - TRƠN, 2VỈ 2H/20v - ĐỎ, 2VỈ 2H/20v - VÀNG\n- Cân nặng vận chuyển: 100g\n- Mã sản phẩm: SP-7863836931\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ HỘP NHỎ TRANG TRÍ KHÔNG KHÓI KHÔNG MÙI\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":100,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lmqvki7ifk6773","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy635dunj5gdf","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy635duoxpw50","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy635duqcacc0","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy635duvyk4e0","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg8159fvgf2","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg81581b030","https://cf.shopee.vn/file/vn-11134207-7qukw-lkasg815aufw64","https://cf.shopee.vn/file/vn-11134207-7qukw-ljy1ed7eog7667"],"reviews":[],"variants":[{"id":"shopee_variant_204248613517","name":"2VỈ 2H/20v - BM","sku":"","price":50000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-lfz923nhgpd64b","options":{}},{"id":"shopee_variant_214086746103","name":"2VỈ 4H/20v - BM","sku":"","price":60000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-lgalu7897f56dd","options":{}},{"id":"shopee_variant_22701649405","name":"2VỈ 4H/20v - TRƠN","sku":"","price":60000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljy5js01i3ec3b","options":{}},{"id":"shopee_variant_194540526748","name":"2VỈ 2H/20v - ĐỎ","sku":"","price":50000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbmc2zbweja5","options":{}},{"id":"shopee_variant_194540526749","name":"2VỈ 2H/20v - VÀNG","sku":"","price":50000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lkzbmc2zahu33f","options":{}}]},{"id":"shopee_7510227721","sku":"SP-7510227721","categoryId":"nen-thom","name":"Nến tealight 4-8 giờ xông tinh dầu thảo mộc sang trọng","price":49000,"originalPrice":null,"shortDesc":"Nến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao","description":"NẾN TEALIGHT 4-8 GIỜ XÔNG TINH DẦU THẢO MỘC SANG TRỌNG\n\n✔ Tổng quan sản phẩm:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao\n\n✔ Mô tả chi tiết:\nNến Tealight đốt đèn xông tinh dầu, xông thảo mộc, trang trí tiệc sinh nhật, làm thơm phòng, thôi nôi, đám cưới, xông thảo mộc, hâm nóng đồ ăn, hâm nóng trà, trà thiền, cúng sao,...\n\nLƯU Ý: Trên thị trường có 2 Loại NẾN ĐỦ GIỜ Và NẾN THIẾU GIỜ, Shop chỉ bán loại NẾN ĐỦ GIỜ nên giá sẽ nhỉnh hơn 1 chút.\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 8-14 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h - 10h\n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi, có thể cháy trong 4 tiếng liên tục.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\nXuất xứ: Việt Nam\n\nMọi ý kiến đóng góp, shop luôn sẵn sàng hỗ trợ ở kênh chat của shop\n\n📍 Cam kết\n👉 Chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền ngay nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm thật tốt tại shop nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4-8 giờ xông tinh dầu thảo mộc sang trọng\n- Danh mục: Thảo mộc xông\n- Phân loại: 5 Viên Trắng - 8H, Hộp 100v 4h - Lài🔥, 100v Trắng (4h)🔥, 2 vỉ 2h/20 Viên, 50v Đỏ (4h), 100v Vàng (2h), 2vỉ 4h/20 viên - Mai, 50v Trắng (4h), 50v Đỏ (2h), 100v Trắng Trơn (4h), 50v Trắng Trơn (4h), 2 Vỉ 4h/20v - Lài, và 10 phân loại khác\n- Cân nặng vận chuyển: 100g\n- Mã sản phẩm: SP-7510227721\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4-8 GIỜ XÔNG TINH DẦU THẢO MỘC SANG TRỌNG\n\n✔ Cách dùng:\nCho một lượng sản phẩm vừa đủ vào bếp xông hoặc dụng cụ phù hợp, làm nóng bằng nến tealight để hương thơm tỏa ra tự nhiên.\n\n✔ Liều lượng:\nDùng lượng nhỏ trước, sau đó tăng dần tùy diện tích phòng và độ đậm mùi mong muốn.\n\n✔ Sau khi dùng:\nChờ dụng cụ nguội hoàn toàn rồi vệ sinh phần thảo mộc đã xông.\n\n✔ An toàn:\nLuôn đặt bếp/dụng cụ xông trên bề mặt phẳng, chịu nhiệt và tránh xa vật dễ cháy.","tag":"","weight":100,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lxva6hgm8xjvab","https://cf.shopee.vn/file/vn-11134207-7r98o-llc0vbpf8lva97","https://cf.shopee.vn/file/vn-11134207-7r98o-llc0vbpfbf068b","https://cf.shopee.vn/file/vn-11134207-7r98o-llc34ft8ahfs23","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzejgq5c","https://cf.shopee.vn/file/vn-11134207-7r98o-ltmf5ttzd4wa0d","https://cf.shopee.vn/file/vn-11134207-7r98o-lx9osk9qkkbf88","https://cf.shopee.vn/file/vn-11134207-7r98o-lx9osk9qj5qz5a","https://cf.shopee.vn/file/vn-11134211-7qukw-ljxzv3h666tef2"],"reviews":[],"variants":[{"id":"shopee_variant_170379919674","name":"5 Viên Trắng - 8H","sku":"","price":52000,"originalPrice":null,"weight":170,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-meio9h9tqadja1","options":{}},{"id":"shopee_variant_187811219711","name":"Hộp 100v 4h - Lài🔥","sku":"","price":245000,"originalPrice":null,"weight":1400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-m08wnbrrlhbhf2","options":{}},{"id":"shopee_variant_19007182408","name":"100v Trắng (4h)🔥","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lw8ktgi5js2jd5","options":{}},{"id":"shopee_variant_177622237206","name":"2 vỉ 2h/20 Viên","sku":"","price":49000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-lgalu789d1ey84","options":{}},{"id":"shopee_variant_157203837972","name":"50v Đỏ (4h)","sku":"","price":95000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lry8hy96wfk499","options":{}},{"id":"shopee_variant_181860054369","name":"100v Vàng (2h)","sku":"","price":125000,"originalPrice":null,"weight":900,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0bnv09s9k7d","options":{}},{"id":"shopee_variant_177622237205","name":"2vỉ 4h/20 viên - Mai","sku":"","price":55000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljy1awep3yk4a0","options":{}},{"id":"shopee_variant_181860054368","name":"50v Trắng (4h)","sku":"","price":95000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lxwlwbhzww63b0","options":{}},{"id":"shopee_variant_158494768494","name":"50v Đỏ (2h)","sku":"","price":70000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lxwlx45bznx518","options":{}},{"id":"shopee_variant_18275000433","name":"100v Trắng Trơn (4h)","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llc34ft8bw0886","options":{}},{"id":"shopee_variant_127164998308","name":"50v Trắng Trơn (4h)","sku":"","price":95000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljxzqs4vuhaa52","options":{}},{"id":"shopee_variant_187811219713","name":"2 Vỉ 4h/20v - Lài","sku":"","price":65000,"originalPrice":null,"weight":200,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-m08wnib215v1a9","options":{}},{"id":"shopee_variant_157203837971","name":"100v Đỏ (4h)","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mer6d5nakagw94","options":{}},{"id":"shopee_variant_108072752186","name":"2vỉ 4h/20 viên Trơn","sku":"","price":55000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljy1awep2jzoc8","options":{}},{"id":"shopee_variant_158494768493","name":"50v Vàng (2h)","sku":"","price":70000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lxwlwzbx1fizb6","options":{}},{"id":"shopee_variant_127164998307","name":"50v Trắng (2h)","sku":"","price":70000,"originalPrice":null,"weight":400,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lxwlwthblm8pbb","options":{}},{"id":"shopee_variant_19007182407","name":"100v Đỏ (2h)","sku":"","price":125000,"originalPrice":null,"weight":900,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0bts3lxr072","options":{}},{"id":"shopee_variant_170380498771","name":"100v Trắng (2h)","sku":"","price":125000,"originalPrice":null,"weight":900,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-m1e0bfqk5qfwaa","options":{}},{"id":"shopee_variant_222470622914","name":"100v Vàng (4h)","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mer6bemekc1t80","options":{}},{"id":"shopee_variant_127164998306","name":"10 Viên Trắng - 8H","sku":"","price":95000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-meio9jkq20auec","options":{}},{"id":"shopee_variant_187811219712","name":"Hộp 50v 4h - Lài","sku":"","price":135000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-m08wnekhi3kf51","options":{}},{"id":"shopee_variant_222470622915","name":"50v Vàng (4h)","sku":"","price":95000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-lry8hy96tmf8e7","options":{}}]},{"id":"shopee_7246422347","sku":"SP-7246422347","categoryId":"nen-thom","name":"Nến tealight 8 giờ tiêu chuẩn Âu trang trí không khói","price":50000,"originalPrice":null,"shortDesc":"LƯU Ý: NẾN CHỈ DÙNG TRANG TRÍ ĐỐT BÊN NGOÀI - KHÔNG DÙNG ĐỂ XÔNG THẢO MỘC VÀ TINH DẦU.","description":"NẾN TEALIGHT 8 GIỜ TIÊU CHUẨN ÂU TRANG TRÍ KHÔNG KHÓI\n\n✔ Tổng quan sản phẩm:\nLƯU Ý: NẾN CHỈ DÙNG TRANG TRÍ ĐỐT BÊN NGOÀI - KHÔNG DÙNG ĐỂ XÔNG THẢO MỘC VÀ TINH DẦU.\n\n✔ Mô tả chi tiết:\nNẾN TEALIGHT VIÊN CHÁY 8 GIỜ\n✔ Thông số kĩ thuật: \nKích thước 1 viên: Cao 3cm đường kính 4cm\nKhối lượng: 35 gam/ viên\nChất liệu: Mica chống nhiệt, sáp cọ \nThời gian cháy: 8\n\nLƯU Ý: NẾN CHỈ DÙNG TRANG TRÍ ĐỐT BÊN NGOÀI - KHÔNG DÙNG ĐỂ XÔNG THẢO MỘC VÀ TINH DẦU\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để trang trí tiệc sinh nhật, đám cưới, đốt trong ly tỏa ánh sáng tạo không gian sang trọng chill chill. Khi cháy không khói, không mùi, có thể cháy trong 10 giờ tiếng liên tục.\n\nXuất xứ: Việt nam \n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 8 giờ tiêu chuẩn Âu trang trí không khói\n- Danh mục: Nến thơm / nến tealight\n- Phân loại: 5 VIÊN, 10 VIÊN, 20 VIÊN\n- Cân nặng vận chuyển: 120g\n- Mã sản phẩm: SP-7246422347\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 8 GIỜ TIÊU CHUẨN ÂU TRANG TRÍ KHÔNG KHÓI\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":120,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7ras8-mdr8ajuspyr311","https://cf.shopee.vn/file/vn-11134207-7qukw-lkhkxzfw87fsf4","https://cf.shopee.vn/file/vn-11134207-7qukw-lkhkxzfw6svc18","https://cf.shopee.vn/file/vn-11134207-7qukw-lkhkxzfw16lk9e","https://cf.shopee.vn/file/vn-11134207-7qukw-lkhkxzfw5eaw1a","https://cf.shopee.vn/file/vn-11134207-7qukw-lkhkxzfw9m08ff"],"reviews":[],"variants":[{"id":"shopee_variant_50598244623","name":"5 VIÊN","sku":"","price":50000,"originalPrice":null,"weight":120,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-me7ywk3nzmkk70","options":{}},{"id":"shopee_variant_50598244624","name":"10 VIÊN","sku":"","price":95000,"originalPrice":null,"weight":300,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-mdr8ajuspyr311","options":{}},{"id":"shopee_variant_50598244625","name":"20 VIÊN","sku":"","price":190000,"originalPrice":null,"weight":700,"image":"https://cf.shopee.vn/file/vn-11134207-820l4-mgxm9x2lcyrs73","options":{}}]},{"id":"shopee_6228169441","sku":"SP-6228169441","categoryId":"nen-thom","name":"Nến tealight 8 giờ trang trí không khói tạo không gian ấm","price":8000,"originalPrice":null,"shortDesc":"Chất liệu: Mica chống nhiệt, sáp cọ, hoặc vỏ nhôm.","description":"NẾN TEALIGHT 8 GIỜ TRANG TRÍ KHÔNG KHÓI TẠO KHÔNG GIAN ẤM\n\n✔ Tổng quan sản phẩm:\nChất liệu: Mica chống nhiệt, sáp cọ, hoặc vỏ nhôm.\n\n✔ Mô tả chi tiết:\nNẾN TEALIGHT VIÊN CHÁY 8 GIỜ.\n✔ Thông số kĩ thuật: \nKích thước 1 viên: Cao 3cm đường kính 4cm\nKhối lượng: 25 gam/ viên\nChất liệu: Mica chống nhiệt, sáp cọ, hoặc vỏ nhôm\nThời gian cháy: 8\n\nLƯU Ý: \n- Phân Loại Mica: Dùng trang trí bàn tiệc, bàn làm việc, quán cafe. Không khuyến khích dùng vs bếp xông thảo mộc Xông tinh dầu.\n\n- Phân Loại Nhôm: Thích hợp dùng để xông thảo mộc, xông tinh dầu, hâm nóng đồ ăn làm nóng trà.\n\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để trang trí tiệc sinh nhật, đám cưới, đốt trong ly tỏa ánh sáng tạo không gian sang trọng chill chill. Khi cháy không khói, không mùi, có thể cháy trong 8 tới 10 giờ tiếng liên tục.\n\nXuất xứ: Việt nam \n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 8 giờ trang trí không khói tạo không gian ấm\n- Danh mục: Nến thơm / nến tealight\n- Phân loại: Nến Dùng Trang Trí, Nến Dùng Xông & Bếp\n- Cân nặng vận chuyển: 30g\n- Mã sản phẩm: SP-6228169441\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 8 GIỜ TRANG TRÍ KHÔNG KHÓI TẠO KHÔNG GIAN ẤM\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":30,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-820l4-mhj8v8snr7yg42","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy6f9znqf422e","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy6f9znrtoi3a","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy6f9znt88y14","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy635duxd4k63","https://cf.shopee.vn/file/vn-11134207-7ras8-mdr8970s6mcx80","https://cf.shopee.vn/file/vn-11134207-7qukw-lkarlyg9yq3g1e","https://cf.shopee.vn/file/vn-11134207-7qukw-lkarlyga1j8c97"],"reviews":[],"variants":[{"id":"shopee_variant_178225553056","name":"Nến Dùng Trang Trí","sku":"","price":10000,"originalPrice":null,"weight":30,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-mdr89134v9o107","options":{}},{"id":"shopee_variant_178225553057","name":"Nến Dùng Xông & Bếp","sku":"","price":8000,"originalPrice":null,"weight":30,"image":"https://cf.shopee.vn/file/vn-11134207-7ras8-mdr82mbakrvz1d","options":{}}]},{"id":"shopee_6203380691","sku":"SP-6203380691","categoryId":"nen-ly","name":"Nến ly 72h nơ lớn thờ cúng không khói Phương Lâm","price":195000,"originalPrice":null,"shortDesc":"Nến ly thờ cúng, đốt rằm, tết niên, khai trương","description":"NẾN LY 72H NƠ LỚN THỜ CÚNG KHÔNG KHÓI PHƯƠNG LÂM\n\n✔ Tổng quan sản phẩm:\nNến ly thờ cúng, đốt rằm, tết niên, khai trương\n\n✔ Mô tả chi tiết:\nNến ly thờ cúng, đốt rằm, tết niên, khai trương,... \n\n🔰 Thông Số:\n✔ Kích thước: 14x6cm (Cao,Rộng)\n✔ Đóng gói: 6ly /hộp\n✔ Thời gian cháy: 3 - 4 ngày\n✔ không mùi, ít khói\n✔ thân thiện với môi trường\n\n*Cách bảo quản nến ly\nBảo quản ở nơi có nhiệt độ thấp & thoáng mát, tránh bụi.\nHạn chế & tránh để sản phẩm Nến ly tiếp xúc trực tiếp với ánh sáng mặt trời, huỳnh quang hay ánh sáng khác.\n\n👉 Lưu ý: sản phẩm này chỉ giao trong nội thành HCM\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến ly 72h nơ lớn thờ cúng không khói Phương Lâm\n- Danh mục: Nến ly\n- Phân loại: Vàng, Đỏ, Trắng(Thánh Giá)\n- Cân nặng vận chuyển: 1000g\n- Mã sản phẩm: SP-6203380691\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN LY 72H NƠ LỚN THỜ CÚNG KHÔNG KHÓI PHƯƠNG LÂM\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":1000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134211-7r98o-ll0arq0uysp7ac","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1vnd4s2b805","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1vnd4tgvoac","https://cf.shopee.vn/file/vn-11134207-7qukw-ljz29yc6xygk52","https://cf.shopee.vn/file/vn-11134211-7qukw-lfzaq3cn5uyfcf","https://cf.shopee.vn/file/vn-11134211-7qukw-lfzaq3cn8o3bb9"],"reviews":[],"variants":[{"id":"shopee_variant_8641104012","name":"Vàng","sku":"","price":195000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1vnd4xol084","options":{}},{"id":"shopee_variant_8641104010","name":"Đỏ","sku":"","price":195000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1vnd4uvg4fb","options":{}},{"id":"shopee_variant_8641104011","name":"Trắng(Thánh Giá)","sku":"","price":195000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz1vnd4wa0k5f","options":{}}]},{"id":"shopee_5810581839","sku":"SP-5810581839","categoryId":"nen-thom","name":"Nến tealight 4 giờ trơn đốt đèn xông tinh dầu mini","price":55000,"originalPrice":null,"shortDesc":"Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi","description":"NẾN TEALIGHT 4 GIỜ TRƠN ĐỐT ĐÈN XÔNG TINH DẦU MINI\n\n✔ Tổng quan sản phẩm:\nMô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi\n\n✔ Mô tả chi tiết:\n✔ Mô tả sản phẩm: Nến Tealight dạng viên tròn, nhỏ gọn dùng để đốt trong đèn xông tinh dầu. Khi cháy không khói, không mùi.\n\n✔ Thông số kĩ thuật: \nKích thước 1 viên: 3.8 x 3.8 x 1.6 cm\nKích thước 1 hộp 100 viên: 20 x 20 x 7 cm\nKhối lượng: 8-14 gam/ viên\nChất liệu: vỏ nhôm, sáp cọ \nThời gian cháy: 2h - 4h \n\n✔ Quy cách đóng gói:100 Viên, 50 viên, 10 viên.\n\n✔ Công dụng: Chuyên dùng để trang trí tiệc sinh nhật, thờ cúng, thả đèn hòa đăng ngoài ra còn dùng đốt tinh dầu để xông hương trong Spa, nhà hàng, khách sạn, quán cà phê hay xông phòng tạo cảm giác thư giãn, giảm stress cho người dùng....\n\nXuất xứ: Việt nam \n📍 Cam kết\n👉 Luôn chọn lọc và phân phối các mặt hàng chính hãng, sản phẩm gần gũi với thiên nhiên, an toàn cho sức khỏe\n👉 Trả hàng hoàn tiền nhanh nếu phát hiện sản phẩm bị lỗi, quy trình nhanh chóng\n👉 Chúng tôi luôn hoàn thiện mình và không ngừng phát triển để đem lại những trải nghiệm tốt nhất cho bạn\n\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n🌈Xin cảm ơn đã dành ít phút tham quan gian hàng của shop, Hy vọng bạn có được trải nghiệm mua sắm tốt nhất nhé!\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến tealight 4 giờ trơn đốt đèn xông tinh dầu mini\n- Danh mục: Bếp xông / đèn xông\n- Phân loại: 2 VỈ 2H/20V - BM, TRẮNG TRƠN 4H, 2 VỈ 4H/20v - TRƠN\n- Cân nặng vận chuyển: 100g\n- Mã sản phẩm: SP-5810581839\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN TEALIGHT 4 GIỜ TRƠN ĐỐT ĐÈN XÔNG TINH DẦU MINI\n\n✔ Cách dùng:\nĐặt sản phẩm trên bề mặt phẳng, khô ráo và lắp cùng bếp xông, nến hoặc phụ kiện phù hợp theo đúng công năng.\n\n✔ Khi sử dụng:\nNếu dùng với nhiệt hoặc nến, luôn để xa vật dễ cháy và không chạm tay trực tiếp khi sản phẩm còn nóng.\n\n✔ Vệ sinh:\nChờ sản phẩm nguội hoàn toàn rồi lau bằng khăn khô hoặc khăn ẩm nhẹ.\n\n✔ Bảo quản:\nĐể nơi khô thoáng, tránh rơi vỡ hoặc va đập mạnh.","tag":"","weight":100,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134207-7r98o-lmqvki7igyqn01","https://cf.shopee.vn/file/vn-11134207-7r98o-llc16wj9j7pkbf","https://cf.shopee.vn/file/vn-11134207-7r98o-llc16wj9kma031","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy1gqsn5lf8f6","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy1gqsn6zzoc4","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy1gqsn8ek4b7","https://cf.shopee.vn/file/vn-11134207-7r98o-llc0vbpfmnjq73","https://cf.shopee.vn/file/vn-11134207-7r98o-llc16wj99dqg32","https://cf.shopee.vn/file/vn-11134211-7qukw-ljy1gqsn9t4k31"],"reviews":[],"variants":[{"id":"shopee_variant_204248570886","name":"2 VỈ 2H/20V - BM","sku":"","price":55000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-lgalu789h94ad4","options":{}},{"id":"shopee_variant_11395456078","name":"TRẮNG TRƠN 4H","sku":"","price":175000,"originalPrice":null,"weight":1300,"image":"https://cf.shopee.vn/file/vn-11134207-7r98o-llc34ft8dakoec","options":{}},{"id":"shopee_variant_186697251135","name":"2 VỈ 4H/20v - TRƠN","sku":"","price":55000,"originalPrice":null,"weight":100,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-lgalu789efze2e","options":{}}]},{"id":"shopee_4903385000","sku":"SP-4903385000","categoryId":"nen-ly","name":"Nến ly 120h thờ cúng nơ đại không khói trang nghiêm","price":190000,"originalPrice":null,"shortDesc":"Nến ly thờ cúng, đốt rằm, tết niên, khai trương","description":"NẾN LY 120H THỜ CÚNG NƠ ĐẠI KHÔNG KHÓI TRANG NGHIÊM\n\n✔ Tổng quan sản phẩm:\nNến ly thờ cúng, đốt rằm, tết niên, khai trương\n\n✔ Mô tả chi tiết:\nNến ly thờ cúng, đốt rằm, tết niên, khai trương,... \nGiá bán = hộp = 6 ly = 3 cặp\n🔰 Thông Số:\n✔ Kích thước: 22x7cm (Cao,Rộng)\n✔ Đóng gói: 6ly /hộp\n✔ Thời gian cháy: 5 -6 ngày\n✔ không mùi, không khói\n✔ thân thiện với môi trường\n\n*Cách bảo quản nến ly\nBảo quản ở nơi có nhiệt độ thấp & thoáng mát, tránh bụi.\nHạn chế & tránh để sản phẩm Nến ly tiếp xúc trực tiếp với ánh sáng mặt trời, huỳnh quang hay ánh sáng khác.\n\n👉 Lưu ý: sản phẩm này chỉ giao trong nội thành HCM\nCần hỗ trợ thêm hãy nhắn tin trực tiếp với shop nhé, hỗ trợ online 24/7\n\n✔ Thông tin sản phẩm:\n- Tên sản phẩm: Nến ly 120h thờ cúng nơ đại không khói trang nghiêm\n- Danh mục: Nến ly\n- Phân loại: Hộp Nơ Đại (Vàng), Hộp Nơ Lớn (Đỏ), Hộp Nơ Lớn (Vàng), Hộp Nơ Đại (Đỏ)\n- Cân nặng vận chuyển: 1000g\n- Mã sản phẩm: SP-4903385000\n\n✔ Lưu ý quan trọng:\n- Vui lòng chọn đúng phân loại trước khi đặt hàng.\n- Bảo quản sản phẩm nơi khô ráo, thoáng mát, tránh ẩm và nắng gắt.\n- Màu sắc, kích thước hoặc hình dáng có thể chênh nhẹ do ánh sáng chụp ảnh hoặc đặc tính thủ công/tự nhiên của từng sản phẩm.","usage":"HƯỚNG DẪN SỬ DỤNG NẾN LY 120H THỜ CÚNG NƠ ĐẠI KHÔNG KHÓI TRANG NGHIÊM\n\n✔ Cách đốt:\nĐặt nến trên bề mặt phẳng, chịu nhiệt rồi châm lửa ở tim nến.\n\n✔ Khi sử dụng:\nKhông đặt nến gần rèm, giấy, gỗ mỏng hoặc vật dễ cháy. Không di chuyển nến khi đang cháy.\n\n✔ Sau khi dùng:\nTắt nến trước khi rời khỏi phòng và chờ nến nguội hoàn toàn trước khi cất giữ.\n\n✔ Bảo quản:\nĐể nến nơi khô ráo, thoáng mát, tránh nắng nóng trực tiếp.","tag":"","weight":1000,"hidden":false,"optionGroups":[],"optionImages":{},"images":["https://cf.shopee.vn/file/vn-11134211-7r98o-ll0arq0v1lu3e1","https://cf.shopee.vn/file/vn-11134211-7qukw-lfzaq3cp1a7r48","https://cf.shopee.vn/file/vn-11134211-7qukw-lfzaq3cmw0zbcf","https://cf.shopee.vn/file/vn-11134211-7qukw-lfzaq3cmyu4721"],"reviews":[],"variants":[{"id":"shopee_variant_8642375206","name":"Hộp Nơ Đại (Vàng)","sku":"","price":320000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz29yc76dv82f","options":{}},{"id":"shopee_variant_77432782821","name":"Hộp Nơ Lớn (Đỏ)","sku":"","price":190000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz29yc73kqc20","options":{}},{"id":"shopee_variant_77432782822","name":"Hộp Nơ Lớn (Vàng)","sku":"","price":190000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz29yc74zas1f","options":{}},{"id":"shopee_variant_8642375205","name":"Hộp Nơ Đại (Đỏ)","sku":"","price":320000,"originalPrice":null,"weight":1000,"image":"https://cf.shopee.vn/file/vn-11134207-7qukw-ljz29yc77sfo74","options":{}}]}]/*END_BAKED_PRODUCTS*/;
const BAKED_IMAGES = /*BAKED_IMAGES*/{"1":["/assets/media/generated/embedded-016.jpg","/assets/media/generated/embedded-017.jpg","/assets/media/generated/embedded-018.webp","/assets/media/generated/embedded-019.jpg"],"2":["/assets/media/generated/embedded-020.jpg"],"7":["/assets/media/generated/embedded-021.jpg"],"new_1776824123777":["/assets/media/generated/embedded-022.jpg"],"new_1776857397825":["/assets/media/generated/embedded-023.jpg"],"new_1776857467847":["/assets/media/generated/embedded-024.jpg","/assets/media/generated/embedded-025.jpg"]}/*END_BAKED_IMAGES*/;
const BAKED_CATEGORY_IMAGES = /*BAKED_CATEGORY_IMAGES*/{"nen-thom":"/assets/media/generated/embedded-018.jpg","combo":"/assets/media/generated/embedded-026.jpg","thao-moc-xong":"/assets/media/generated/embedded-027.jpg","bep-xong":"/assets/media/generated/embedded-028.jpg","nu-tram":"/assets/media/generated/embedded-029.jpg","phu-kien":"/assets/media/generated/embedded-009.jpg","nen-tru":"/assets/products/uploads/1777285327929-nen-tru.webp"}/*END_BAKED_CATEGORY_IMAGES*/;
const BAKED_FEATURED = /*BAKED_FEATURED*/["shopee_7510227721","shopee_29011454025","shopee_17395821074","shopee_26007254880","shopee_22080262041","shopee_40170692234","shopee_54450013830","7"]/*END_BAKED_FEATURED*/;
const BAKED_EXTRA = /*BAKED_EXTRA*/[]/*END_BAKED_EXTRA*/;

const EXPORT_FILE_NAME = 'index.html';
const IS_PREVIEW_REFRESH = new URLSearchParams(window.location.search).has('preview');
if (IS_PREVIEW_REFRESH) {
  ['herbly-page', 'herbly-products', 'herbly-new-products'].forEach(key => localStorage.removeItem(key));
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
    try { return JSON.parse(localStorage.getItem('herbly-images') || '{}'); } catch { return {}; }
  })();
  const bakedCategoryImages = (() => {
    try { return JSON.parse(localStorage.getItem('herbly-category-images') || '{}'); } catch { return {}; }
  })();
  const bakedHeaderImages = (() => {
    try {
      const value = localStorage.getItem('herbly-header-images');
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  })();
  const bakedFeatured = (() => {
    try {
      const value = localStorage.getItem('herbly-featured');
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
      if (window.history.state?.page) return window.history.state.page;
      return JSON.parse(localStorage.getItem('herbly-page')) || { name: 'home' };
    } catch {
      return { name: 'home' };
    }
  });
  const [cart, setCart] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('herbly-cart')) || []; } catch { return []; }
  });
  const [productImages, setProductImages] = React.useState(() => {
    if (Object.keys(BAKED_IMAGES).length > 0) return BAKED_IMAGES;
    try { return JSON.parse(localStorage.getItem('herbly-images')) || {}; } catch { return {}; }
  });
  const [categoryImages, setCategoryImages] = React.useState(() => {
    if (Object.keys(BAKED_CATEGORY_IMAGES).length > 0) return BAKED_CATEGORY_IMAGES;
    try { return JSON.parse(localStorage.getItem('herbly-category-images')) || {}; } catch { return {}; }
  });
  const [headerImages, setHeaderImages] = React.useState(() => {
    if (Array.isArray(BAKED_HEADER_IMAGES) && BAKED_HEADER_IMAGES.length > 0) return BAKED_HEADER_IMAGES;
    try {
      const value = localStorage.getItem('herbly-header-images');
      return value ? JSON.parse(value) : null;
    } catch {
      return null;
    }
  });
  const [productOverrides, setProductOverrides] = React.useState(() => {
    if (BAKED_PRODUCTS.length > 0) return {}; // baked export uses BAKED_PRODUCTS directly
    try { return JSON.parse(localStorage.getItem('herbly-products')) || {}; } catch { return {}; }
  });
  const [featuredIds, setFeaturedIds] = React.useState(() => {
    if (BAKED_FEATURED !== null) return BAKED_FEATURED;
    try { const v = localStorage.getItem('herbly-featured'); return v ? JSON.parse(v) : null; } catch { return null; }
  });

  React.useEffect(() => {
    if (featuredIds !== null) safeSetLocalStorage('herbly-featured', JSON.stringify(featuredIds));
  }, [featuredIds]);

  const [extraProducts, setExtraProducts] = React.useState(() => {
    if (BAKED_PRODUCTS.length > 0) return BAKED_EXTRA;
    if (BAKED_EXTRA.length > 0) return BAKED_EXTRA;
    try { return JSON.parse(localStorage.getItem('herbly-new-products') || '[]'); } catch { return []; }
  });
  // Merge hardcoded PRODUCTS with any saved overrides
  const mergedProducts = (BAKED_PRODUCTS.length > 0 ? BAKED_PRODUCTS : PRODUCTS).map(p => productOverrides[p.id] ? { ...p, ...productOverrides[p.id] } : p);

  React.useEffect(() => {
    safeSetLocalStorage('herbly-images', JSON.stringify(productImages));
  }, [productImages]);
  React.useEffect(() => {
    safeSetLocalStorage('herbly-category-images', JSON.stringify(categoryImages));
  }, [categoryImages]);
  React.useEffect(() => {
    if (Array.isArray(headerImages)) {
      safeSetLocalStorage('herbly-header-images', JSON.stringify(headerImages));
    } else {
      localStorage.removeItem('herbly-header-images');
    }
  }, [headerImages]);
  React.useEffect(() => {
    safeSetLocalStorage('herbly-products', JSON.stringify(productOverrides));
  }, [productOverrides]);

  React.useEffect(() => {
    safeSetLocalStorage('herbly-page', JSON.stringify(page));
    try {
      window.history.replaceState({ ...(window.history.state || {}), page }, '', window.location.href);
    } catch {}
  }, [page]);

  React.useEffect(() => {
    safeSetLocalStorage('herbly-cart', JSON.stringify(cart));
  }, [cart]);

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
        setPage(JSON.parse(localStorage.getItem('herbly-page')) || { name: 'home' });
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
