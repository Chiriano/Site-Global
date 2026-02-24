(function attachCartModule(global) {
  const STORAGE_KEY = 'alpha_convites_cart';

  function safeParse(value) {
    try {
      return JSON.parse(value);
    } catch (error) {
      return [];
    }
  }

  function persist(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  function getCart() {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? safeParse(raw) : [];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.filter((item) => item && Number(item.id) > 0 && Number(item.quantity) > 0);
  }

  function findItemIndex(cart, productId) {
    return cart.findIndex((item) => Number(item.id) === Number(productId));
  }

  function addToCart(product) {
    if (!product || !Number(product.id)) {
      throw new Error('Produto invalido para carrinho.');
    }

    const cart = getCart();
    const index = findItemIndex(cart, product.id);
    if (index >= 0) {
      cart[index].quantity += 1;
    } else {
      cart.push({
        id: Number(product.id),
        name: product.name || 'Produto',
        price: Number(product.price) || 0,
        image_url: product.image_url || null,
        quantity: 1,
      });
    }

    persist(cart);
    return cart;
  }

  function removeFromCart(productId) {
    const cart = getCart().filter((item) => Number(item.id) !== Number(productId));
    persist(cart);
    return cart;
  }

  function updateQuantity(productId, qty) {
    const quantity = Number(qty);
    if (!Number.isFinite(quantity)) {
      return getCart();
    }

    const cart = getCart();
    const index = findItemIndex(cart, productId);
    if (index < 0) {
      return cart;
    }

    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart[index].quantity = Math.floor(quantity);
    }

    persist(cart);
    return cart;
  }

  function clearCart() {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }

  function countItems(cartOverride) {
    const cart = cartOverride || getCart();
    return cart.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }

  function calculateTotal(cartOverride) {
    const cart = cartOverride || getCart();
    return cart.reduce((sum, item) => sum + Number(item.price) * Number(item.quantity), 0);
  }

  global.CartStore = {
    addToCart,
    removeFromCart,
    updateQuantity,
    getCart,
    clearCart,
    countItems,
    calculateTotal,
  };
})(window);
