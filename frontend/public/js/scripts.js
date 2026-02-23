// ─────────────────────────────────────────
// Configuração da API
// ─────────────────────────────────────────
const API_URL = 'http://localhost:3000/api/products';

// ─────────────────────────────────────────
// Busca produtos na API
// ─────────────────────────────────────────
async function fetchProducts() {
    console.log('[API] Buscando produtos em:', API_URL);

    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
    }

    const products = await response.json();
    console.log(`[API] ${products.length} produto(s) recebido(s).`);
    return products;
}

// ─────────────────────────────────────────
// Formata preço para Real brasileiro
// ─────────────────────────────────────────
function formatPrice(price) {
    return Number(price).toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}

// ─────────────────────────────────────────
// Cria o HTML de um card de produto
// ─────────────────────────────────────────
function createProductCard(product) {
    const fallback = `https://placehold.co/150x150/ffffff/333333?text=${encodeURIComponent(product.name)}`;
    const imageSrc = product.image_url ? product.image_url : fallback;

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
            <a href="#" class="btn btn-primary btn-hollow">Saber Mais</a>
        </div>
    `;
}

// ─────────────────────────────────────────
// Renderiza lista de produtos no grid
// ─────────────────────────────────────────
function renderProducts(products) {
    const grid = document.querySelector('.categories-grid');
    if (!grid) {
        console.warn('[Render] Elemento .categories-grid não encontrado.');
        return;
    }

    if (!products.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;padding:40px 0;">Nenhum produto cadastrado.</p>';
        console.log('[Render] Nenhum produto para exibir.');
        return;
    }

    grid.innerHTML = products.map(createProductCard).join('');
    console.log(`[Render] ${products.length} produto(s) renderizado(s).`);

    grid.querySelectorAll('.product-card .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            incrementCart();
        });
    });
}

// ─────────────────────────────────────────
// Carrega e exibe produtos
// ─────────────────────────────────────────
async function loadProducts() {
    const grid = document.querySelector('.categories-grid');
    if (!grid) return;

    grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;padding:40px 0;">Carregando produtos...</p>';

    try {
        const products = await fetchProducts();
        renderProducts(products);
    } catch (err) {
        console.error('[Erro] Falha ao carregar produtos:', err.message);
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px 0;">Não foi possível carregar os produtos. Verifique se o servidor está rodando.</p>';
    }
}

// ─────────────────────────────────────────
// Contador do carrinho
// ─────────────────────────────────────────
const cartCountSpan = document.querySelector('.cart-count');
let cartCount = 0;

function incrementCart() {
    cartCount++;
    if (cartCountSpan) {
        cartCountSpan.textContent = cartCount;
        cartCountSpan.style.transform = 'scale(1.5)';
        setTimeout(() => {
            cartCountSpan.style.transform = 'scale(1)';
        }, 200);
    }
}

// ─────────────────────────────────────────
// Inicialização
// ─────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    console.log('[App] Alpha Convites iniciado.');

    const allProductsBtn = document.getElementById('all-products-btn');
    const megaMenu = document.getElementById('mega-menu');

    if (allProductsBtn && megaMenu) {
        allProductsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            megaMenu.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!allProductsBtn.contains(e.target) && !megaMenu.contains(e.target)) {
                megaMenu.classList.remove('active');
            }
        });

        megaMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    document.querySelectorAll('.btn-secondary').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            incrementCart();
        });
    });

    loadProducts();
});
