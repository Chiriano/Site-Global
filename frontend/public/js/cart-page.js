const BASE_URL = 'http://localhost:3000';
const ORDER_API_URL = `${BASE_URL}/api/orders`;

const cartItemsContainer = document.getElementById('cart-items');
const cartTotalElement = document.getElementById('cart-total');
const cartCountElement = document.querySelector('.cart-count');
const checkoutButton = document.getElementById('checkout-btn');
const statusMessage = document.getElementById('cart-status');

function buildImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  if (imageUrl.startsWith('/')) return `${BASE_URL}${imageUrl}`;
  return `${BASE_URL}/${imageUrl}`;
}

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function setStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `cart-status ${type}`;
}

function updateCartHeaderCount() {
  if (!window.CartStore || !cartCountElement) return;
  const count = window.CartStore.countItems();
  cartCountElement.textContent = `(${count})`;
}

function renderEmptyCart() {
  cartItemsContainer.innerHTML = `
    <div class="empty-cart">
      Seu carrinho esta vazio.
    </div>
  `;
  cartTotalElement.textContent = formatPrice(0);
  checkoutButton.disabled = true;
}

function createItemRow(item) {
  const subtotal = Number(item.price) * Number(item.quantity);
  const image = buildImageUrl(item.image_url);

  return `
    <div class="cart-row" data-product-id="${item.id}">
      <div class="cart-col image">
        ${image
          ? `<img src="${image}" alt="${item.name}" class="cart-image">`
          : '<span class="no-image">Sem imagem</span>'}
      </div>
      <div class="cart-col name">${item.name}</div>
      <div class="cart-col price">${formatPrice(item.price)}</div>
      <div class="cart-col qty">
        <input type="number" min="1" value="${item.quantity}" class="qty-input">
      </div>
      <div class="cart-col subtotal">${formatPrice(subtotal)}</div>
      <div class="cart-col remove">
        <button class="remove-btn">Remover</button>
      </div>
    </div>
  `;
}

function renderCart() {
  const cart = window.CartStore.getCart();
  updateCartHeaderCount();

  if (!cart.length) {
    renderEmptyCart();
    return;
  }

  cartItemsContainer.innerHTML = cart.map(createItemRow).join('');
  cartTotalElement.textContent = formatPrice(window.CartStore.calculateTotal(cart));
  checkoutButton.disabled = false;
}

function handleQuantityChange(event) {
  const input = event.target;
  if (!input.classList.contains('qty-input')) return;

  const row = input.closest('.cart-row');
  const productId = Number(row.dataset.productId);
  const quantity = Number(input.value);

  window.CartStore.updateQuantity(productId, quantity);
  renderCart();
}

function handleRemoveClick(event) {
  const button = event.target;
  if (!button.classList.contains('remove-btn')) return;

  const row = button.closest('.cart-row');
  const productId = Number(row.dataset.productId);
  window.CartStore.removeFromCart(productId);
  renderCart();
}

function finalizeOrder() {
  const cart = window.CartStore.getCart();
  if (!cart.length) {
    setStatus('Carrinho vazio. Adicione produtos antes de finalizar.', 'error');
    return;
  }
  window.location.href = 'checkout.html';
}

document.addEventListener('DOMContentLoaded', () => {
  const cartLink = document.querySelector('.cart-btn a');
  if (cartLink) {
    cartLink.setAttribute('href', 'cart.html');
  }

  renderCart();

  cartItemsContainer.addEventListener('change', handleQuantityChange);
  cartItemsContainer.addEventListener('click', handleRemoveClick);
  checkoutButton.addEventListener('click', finalizeOrder);
});
