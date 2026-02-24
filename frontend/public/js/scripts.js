const BASE_URL = 'http://localhost:3000';
const API_URL = `${BASE_URL}/api/products`;
const ASSETS_BASE = '/assets';

function buildApiImageUrl(imagePath) {
    if (!imagePath || typeof imagePath !== 'string') {
        return '';
    }

    const cleanPath = imagePath.trim();
    if (!cleanPath) {
        return '';
    }

    if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
        return cleanPath;
    }

    if (cleanPath.startsWith('/')) {
        return BASE_URL + cleanPath;
    }

    return BASE_URL + '/' + cleanPath;
}

function formatPrice(price) {
    return Number(price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

function updateCartCount() {
    const cartCountSpan = document.querySelector('.cart-count');
    if (!cartCountSpan || !window.CartStore) {
        return;
    }

    const count = window.CartStore.countItems();
    cartCountSpan.textContent = `(${count})`;
}

function configureCartHeaderLink() {
    const cartLink = document.querySelector('.cart-btn a');
    if (cartLink) {
        cartLink.setAttribute('href', 'cart.html');
    }
}

function configureSiteLogo() {
    const configuredFile = (window.SITE_LOGO_FILE || localStorage.getItem('site_logo_file') || '').trim();
    const fileCandidates = [configuredFile, 'logo.png', 'logo-dark-2.png', 'logo-white-2.png']
        .filter((value, index, array) => value && array.indexOf(value) === index);
    const basePaths = [`${ASSETS_BASE}/logo`, 'assets/logo', './assets/logo', '/frontend/public/assets/logo'];
    const logoCandidates = [];

    basePaths.forEach((basePath) => {
        fileCandidates.forEach((fileName) => {
            logoCandidates.push(`${basePath}/${fileName}`);
        });
    });

    const logoImages = document.querySelectorAll('.logo img, .footer-bottom img');
    logoImages.forEach((img) => {
        img.style.maxHeight = '140px';
        img.style.width = 'auto';
        let index = 0;
        img.src = logoCandidates[index];
        img.onerror = () => {
            index += 1;
            if (index < logoCandidates.length) {
                img.src = logoCandidates[index];
                return;
            }
            img.onerror = null;
        };
    });

    const footerContent = document.querySelector('.main-footer .footer-content');
    if (footerContent) {
        const applyFooterLayout = () => {
            footerContent.style.display = 'grid';
            footerContent.style.gap = '28px';
            footerContent.style.alignItems = 'start';

            if (window.innerWidth < 992) {
                footerContent.style.gridTemplateColumns = 'repeat(2, minmax(180px, 1fr))';
            } else {
                footerContent.style.gridTemplateColumns = 'minmax(180px, 240px) repeat(4, minmax(160px, 1fr))';
            }
        };

        applyFooterLayout();
        window.addEventListener('resize', applyFooterLayout);
    }

    if (footerContent && !footerContent.querySelector('.footer-brand-logo')) {
        const brandBox = document.createElement('div');
        brandBox.className = 'footer-brand-logo';
        brandBox.style.display = 'flex';
        brandBox.style.alignItems = 'center';
        brandBox.style.justifyContent = 'flex-start';
        brandBox.style.minWidth = '180px';
        brandBox.style.paddingTop = '8px';

        const brandImg = document.createElement('img');
        brandImg.src = './assets/logo/logo-white-2.png';
        brandImg.alt = 'Alpha Convites Logo';
        brandImg.style.width = '190px';
        brandImg.style.height = 'auto';
        brandImg.style.display = 'block';
        brandImg.onerror = () => {
            brandImg.onerror = null;
            brandImg.src = '/assets/logo/logo-white-2.png';
        };

        brandBox.appendChild(brandImg);
        footerContent.prepend(brandBox);
    }

    const newsletterCol = document.querySelector('.main-footer .newsletter-col');
    if (newsletterCol) {
        newsletterCol.style.marginTop = '0';
    }

    const footerBottomLogo = document.querySelector('.footer-bottom img');
    if (footerBottomLogo) {
        footerBottomLogo.style.display = 'none';
    }

    const headerLogo = document.querySelector('.main-header .logo img');
    if (headerLogo) {
        headerLogo.style.width = '240px';
        headerLogo.style.maxWidth = '240px';
        headerLogo.style.maxHeight = 'none';
        headerLogo.style.height = 'auto';
    }
}

async function fetchProducts() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
}

function createProductCard(product) {
    const fallback = `https://placehold.co/150x150/ffffff/333333?text=${encodeURIComponent(product.name)}`;
    const imageSrc = product.image_url ? buildApiImageUrl(product.image_url) : fallback;

    return `
        <div class="product-card" data-id="${product.id}">
            <div class="card-image-wrapper">
                <img
                    src="${imageSrc}"
                    alt="${product.name}"
                    onerror="this.src='${fallback}'">
            </div>
            <h3>${product.name}</h3>
            ${product.description
                ? `<p style="font-size:12px;color:#666;text-align:center;line-height:1.4;">${product.description}</p>`
                : ''}
            <span style="font-size:15px;font-weight:700;color:#e31b23;">${formatPrice(product.price)}</span>
            ${product.category
                ? `<span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">${product.category}</span>`
                : ''}
            <a href="#" class="btn btn-primary btn-hollow add-to-cart-btn" data-product-id="${product.id}">Saber mais</a>
        </div>
    `;
}

function attachAddToCartHandlers(products) {
    const productsById = new Map(products.map((product) => [Number(product.id), product]));

    document.querySelectorAll('.add-to-cart-btn').forEach((btn) => {
        btn.addEventListener('click', (event) => {
            event.preventDefault();
            if (!window.CartStore) {
                return;
            }

            const productId = Number(btn.dataset.productId);
            const product = productsById.get(productId);
            if (!product) {
                return;
            }

            window.CartStore.addToCart(product);
            updateCartCount();

            const originalText = btn.textContent;
            btn.textContent = 'Adicionado';
            btn.style.opacity = '0.8';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.opacity = '1';
            }, 800);
        });
    });
}

function renderProducts(products) {
    const grid = document.querySelector('.categories-grid');
    if (!grid) {
        return;
    }

    if (!products.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;padding:40px 0;">Nenhum produto cadastrado.</p>';
        return;
    }

    grid.innerHTML = products.map(createProductCard).join('');
    attachAddToCartHandlers(products);
}

async function loadProducts() {
    const grid = document.querySelector('.categories-grid');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;padding:40px 0;">Carregando produtos...</p>';

    try {
        const products = await fetchProducts();
        renderProducts(products);
    } catch (err) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px 0;">Nao foi possivel carregar os produtos. Verifique se o servidor esta rodando.</p>';
        console.error('[Erro] Falha ao carregar produtos:', err.message);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const allProductsBtn = document.getElementById('all-products-btn');
    const megaMenu = document.getElementById('mega-menu');

    if (allProductsBtn && megaMenu) {
        allProductsBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            megaMenu.classList.toggle('active');
        });

        document.addEventListener('click', (event) => {
            if (!allProductsBtn.contains(event.target) && !megaMenu.contains(event.target)) {
                megaMenu.classList.remove('active');
            }
        });

        megaMenu.addEventListener('click', (event) => event.stopPropagation());
    }

    configureSiteLogo();
    configureCartHeaderLink();
    updateCartCount();
    loadProducts();
});
