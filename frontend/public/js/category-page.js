const BASE_URL = 'http://localhost:3000';
const API_CATEGORY_URL = `${BASE_URL}/api/products/category`;

const bannerElement = document.getElementById('category-banner');
const titleElement = document.getElementById('category-title');
const resultTextElement = document.getElementById('category-result-text');
const sidebarCategoryElement = document.getElementById('sidebar-category');
const sidebarCountElement = document.getElementById('sidebar-count');
const gridElement = document.getElementById('category-grid');

const sortElement = document.getElementById('filter-sort');

let currentProducts = [];
let currentCategoryLabel = 'Todos os produtos';

const categoryLabels = {
  convites: 'Convites',
  embalagens: 'Embalagens',
  cartoes: 'Cartoes',
  flyers: 'Flyers',
  adesivos: 'Adesivos',
  brindes: 'Brindes',
  roupas: 'Roupas',
};

function getCategorySlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return (params.get('name') || '').toLowerCase().trim();
}

function getCategoryLabel(slug) {
  if (!slug) {
    return 'Todos os produtos';
  }
  if (categoryLabels[slug]) {
    return categoryLabels[slug];
  }
  return slug
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function buildImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== 'string') return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
  if (imagePath.startsWith('/')) return BASE_URL + imagePath;
  return `${BASE_URL}/${imagePath}`;
}

function formatPrice(price) {
  return Number(price).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function updateCartCount() {
  const cartCountElement = document.querySelector('.cart-count');
  if (!cartCountElement || !window.CartStore) return;
  cartCountElement.textContent = `(${window.CartStore.countItems()})`;
}

function setCategoryBanner(slug, label) {
  const fileName = slug || 'default';
  const bannerPath = `assets/banners/${fileName}.jpg`;
  bannerElement.src = bannerPath;
  bannerElement.alt = `Banner da categoria ${label}`;
  bannerElement.onerror = () => {
    bannerElement.onerror = null;
    bannerElement.src = `https://placehold.co/1600x300/f5f5f5/333333?text=${encodeURIComponent(label)}`;
  };
}

function createProductCard(product) {
  const fallback = `https://placehold.co/150x150/ffffff/333333?text=${encodeURIComponent(product.name)}`;
  const imageSrc = product.image_url ? buildImageUrl(product.image_url) : fallback;

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="card-image-wrapper">
        <img src="${imageSrc}" alt="${product.name}" onerror="this.src='${fallback}'">
      </div>
      <h3>${product.name}</h3>
      <span style="font-size:15px;font-weight:700;color:#e31b23;">${formatPrice(product.price)}</span>
      ${product.category ? `<span style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;">${product.category}</span>` : ''}
      <div class="category-actions">
        <a href="#" class="btn btn-hollow">Ver produto</a>
        <a href="#" class="btn btn-primary add-to-cart-btn" data-product-id="${product.id}">Saber mais</a>
      </div>
    </div>
  `;
}

function renderProducts(products) {
  if (!products.length) {
    gridElement.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#666;padding:40px 0;">Nenhum produto encontrado para esta categoria.</p>';
    return;
  }

  gridElement.innerHTML = products.map(createProductCard).join('');

  const byId = new Map(products.map((product) => [Number(product.id), product]));
  document.querySelectorAll('.add-to-cart-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      const productId = Number(button.dataset.productId);
      const product = byId.get(productId);
      if (!product || !window.CartStore) return;

      window.CartStore.addToCart(product);
      updateCartCount();

      const originalText = button.textContent;
      button.textContent = 'Adicionado';
      setTimeout(() => {
        button.textContent = originalText;
      }, 800);
    });
  });
}

function applySort(products, sortType) {
  const sorted = [...products];

  if (sortType === 'menor-preco') {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortType === 'maior-preco') {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sortType === 'nome') {
    sorted.sort((a, b) => String(a.name).localeCompare(String(b.name), 'pt-BR'));
  }

  return sorted;
}

function renderFilteredProducts() {
  const sorted = applySort(currentProducts, sortElement.value);
  renderProducts(sorted);
  const count = sorted.length;
  resultTextElement.textContent = `Exibindo ${count} produtos em ${currentCategoryLabel}`;
  sidebarCountElement.textContent = String(count);
}

async function loadProductsByCategory() {
  const slug = getCategorySlugFromUrl();
  const label = getCategoryLabel(slug);
  currentCategoryLabel = label;

  titleElement.textContent = label;
  sidebarCategoryElement.textContent = label;
  setCategoryBanner(slug, label);

  try {
    const endpoint = slug
      ? `${API_CATEGORY_URL}/${encodeURIComponent(slug)}`
      : `${BASE_URL}/api/products`;

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Erro HTTP ${response.status}`);
    }

    const products = await response.json();
    currentProducts = Array.isArray(products) ? products : [];
    renderFilteredProducts();
  } catch (error) {
    resultTextElement.textContent = `Exibindo 0 produtos em ${label}`;
    sidebarCountElement.textContent = '0';
    gridElement.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;padding:40px 0;">Nao foi possivel carregar os produtos desta categoria.</p>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();
  sortElement.addEventListener('change', renderFilteredProducts);
  loadProductsByCategory();
});
