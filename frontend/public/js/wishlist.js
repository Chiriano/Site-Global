(function attachWishlistModule(global) {
  const STORAGE_KEY = 'alpha_ultrapress_wishlist';

  function getWishlist() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function persist(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function isInWishlist(productId) {
    return getWishlist().some(p => Number(p.id) === Number(productId));
  }

  function toggle(product) {
    const list = getWishlist();
    const idx = list.findIndex(p => Number(p.id) === Number(product.id));
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push({
        id: Number(product.id),
        name: product.name || 'Produto',
        price: Number(product.price) || 0,
        image: product.image || null,
        item: product.item || null,
        group: product.group || null,
      });
    }
    persist(list);
    updateBadges();
    return !( idx >= 0 ); // true = foi adicionado
  }

  function count() {
    return getWishlist().length;
  }

  function updateBadges() {
    const n = count();
    document.querySelectorAll('.wishlist-count').forEach(el => {
      el.textContent = n > 0 ? n : '';
      el.style.display = n > 0 ? '' : 'none';
    });
  }

  function initHearts() {
    // Atualiza todos os corações já renderizados na página
    document.querySelectorAll('[data-wishlist-id]').forEach(btn => {
      const id = btn.dataset.wishlistId;
      const active = isInWishlist(id);
      btn.classList.toggle('wl-active', active);
      btn.setAttribute('aria-label', active ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
    });
    updateBadges();
  }

  global.WishlistStore = {
    getWishlist,
    toggle,
    isInWishlist,
    count,
    updateBadges,
    initHearts,
  };

  // Auto-init badges quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHearts);
  } else {
    initHearts();
  }

})(window);
