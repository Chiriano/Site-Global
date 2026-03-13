(function () {
  'use strict';

  // ── State ──────────────────────────────────────────────────────────────────
  var couponDiscount = 0;

  // ── Helpers ────────────────────────────────────────────────────────────────

  function formatPrice(value) {
    return Number(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Resolve image path — relative paths work as-is from the frontend root.
  // Absolute URLs are passed through unchanged.
  function resolveImage(item) {
    var src = item.image_url || item.image || null;
    if (!src) return null;
    // Already an absolute URL
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    // Relative path — use as-is (served from same origin)
    return src;
  }

  // Update every .cart-count element in the page
  function updateAllCounts() {
    if (!window.CartStore) return;
    var count = window.CartStore.countItems();
    var label = count > 0 ? String(count) : '0';
    document.querySelectorAll('.cart-count').forEach(function (el) {
      // Desktop header uses "(N)" format; badge elements use plain number
      el.textContent = el.closest('.cart-btn') ? '(' + label + ')' : label;
    });
  }

  // ── Item card HTML ─────────────────────────────────────────────────────────

  function createItemCard(item) {
    var subtotal = Number(item.price) * Number(item.quantity);
    var imgSrc   = resolveImage(item);
    var qty      = Number(item.quantity) || 1;

    var imgHtml = imgSrc
      ? '<img src="' + escapeHtml(imgSrc) + '" alt="' + escapeHtml(item.name) + '" loading="lazy" class="ci__img">'
      : '<span class="ci__no-img"><i class="fas fa-image fa-2x"></i></span>';

    return [
      '<div class="ci" data-id="' + item.id + '">',
        '<div class="ci__img-wrap">' + imgHtml + '</div>',
        '<div class="ci__body">',
          '<div class="ci__name">' + escapeHtml(item.name) + '</div>',
          '<div class="ci__unit-price">Preço unitário: ' + formatPrice(item.price) + '</div>',
          '<div class="ci__bottom">',
            '<div class="ci__controls">',
              '<div class="qty-step">',
                '<button class="qty-step__btn" type="button" data-action="dec" data-id="' + item.id + '"' + (qty <= 1 ? ' disabled' : '') + '>',
                  '&#8722;',
                '</button>',
                '<input class="qty-step__val" type="number" value="' + qty + '" readonly tabindex="-1">',
                '<button class="qty-step__btn" type="button" data-action="inc" data-id="' + item.id + '">',
                  '&#43;',
                '</button>',
              '</div>',
              '<button class="ci__remove-btn" type="button" data-action="remove" data-id="' + item.id + '">',
                '<i class="fas fa-trash-alt"></i> Remover',
              '</button>',
            '</div>',
            '<div class="ci__subtotal">',
              '<div class="ci__subtotal-label">Subtotal</div>',
              '<div class="ci__subtotal-value">' + formatPrice(subtotal) + '</div>',
            '</div>',
          '</div>',
        '</div>',
      '</div>',
    ].join('');
  }

  // ── Empty state HTML ───────────────────────────────────────────────────────

  function emptyStateHtml() {
    return [
      '<div class="cart-empty-state">',
        '<div class="cart-empty-state__icon">',
          '<i class="fas fa-shopping-cart"></i>',
        '</div>',
        '<div class="cart-empty-state__title">Seu carrinho está vazio</div>',
        '<div class="cart-empty-state__text">',
          'Você ainda não adicionou nenhum produto.<br>',
          'Explore nossa loja e encontre o que procura!',
        '</div>',
        '<a href="index.html" class="cart-empty-state__btn">',
          '<i class="fas fa-arrow-left"></i> Continuar comprando',
        '</a>',
      '</div>',
    ].join('');
  }

  // ── Render functions ───────────────────────────────────────────────────────

  function renderItems(cart) {
    var container = document.getElementById('cp-items');
    if (!container) return;

    if (!cart.length) {
      container.innerHTML = emptyStateHtml();
      return;
    }

    // Seller bar + items wrapped together
    var html = [
      '<div class="cp__seller-bar">',
        '<i class="fas fa-store"></i>',
        '<span>Alpha Convites</span>',
      '</div>',
    ].join('');

    cart.forEach(function (item) {
      html += createItemCard(item);
    });

    container.innerHTML = html;

    // Image error fallback — replace broken images with placeholder icon
    container.querySelectorAll('img.ci__img').forEach(function (img) {
      img.addEventListener('error', function () {
        this.parentElement.innerHTML = '<span class="ci__no-img"><i class="fas fa-image fa-2x"></i></span>';
      });
    });
  }

  function renderSummary(cart) {
    var subtotal = window.CartStore ? window.CartStore.calculateTotal(cart) : 0;
    var total    = Math.max(0, subtotal - couponDiscount);
    var count    = window.CartStore ? window.CartStore.countItems(cart) : 0;

    // Item count label in page header
    var countEl = document.getElementById('cp-item-count');
    if (countEl) {
      countEl.textContent = count > 0
        ? '(' + count + (count === 1 ? ' item' : ' itens') + ')'
        : '';
    }

    var subtotalEl      = document.getElementById('os-subtotal');
    var discountEl      = document.getElementById('os-discount');
    var discountRowEl   = document.getElementById('os-discount-row');
    var totalEl         = document.getElementById('os-total');
    var checkoutBtnEl   = document.getElementById('os-checkout-btn');

    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

    if (discountEl && discountRowEl) {
      if (couponDiscount > 0) {
        discountEl.textContent      = '− ' + formatPrice(couponDiscount);
        discountRowEl.style.display = '';
      } else {
        discountRowEl.style.display = 'none';
      }
    }

    if (totalEl)       totalEl.textContent   = formatPrice(total);
    if (checkoutBtnEl) checkoutBtnEl.disabled = !cart.length;
  }

  function render() {
    var cart = window.CartStore ? window.CartStore.getCart() : [];
    renderItems(cart);
    renderSummary(cart);
    updateAllCounts();
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  function changeQty(productId, delta) {
    if (!window.CartStore) return;
    var cart = window.CartStore.getCart();
    var item = cart.find(function (i) { return Number(i.id) === Number(productId); });
    if (!item) return;

    var newQty = Number(item.quantity) + delta;
    if (newQty <= 0) {
      window.CartStore.removeFromCart(productId);
    } else {
      window.CartStore.updateQuantity(productId, newQty);
    }
    render();
  }

  function removeItem(productId) {
    if (!window.CartStore) return;
    window.CartStore.removeFromCart(productId);
    render();
  }

  function applyCoupon() {
    var input = document.getElementById('coupon-input');
    var code  = input ? input.value.trim().toUpperCase() : '';

    if (!code) {
      showCouponMsg('Digite um código de cupom válido.', 'err');
      return;
    }

    // Demo coupon set — ready to be replaced with a real API call
    var coupons = {
      'ALPHA10':   0.10,
      'BEMVINDO':  0.15,
      'CONVITE20': 0.20,
    };

    if (coupons[code]) {
      var cart     = window.CartStore ? window.CartStore.getCart() : [];
      var subtotal = window.CartStore ? window.CartStore.calculateTotal(cart) : 0;
      couponDiscount = subtotal * coupons[code];
      var pct = Math.round(coupons[code] * 100);
      showCouponMsg('Cupom aplicado! ' + pct + '% de desconto.', 'ok');
    } else {
      couponDiscount = 0;
      showCouponMsg('Cupom inválido ou expirado.', 'err');
    }

    render();
  }

  function showCouponMsg(text, type) {
    var el = document.getElementById('coupon-msg');
    if (!el) return;
    el.textContent = text;
    el.className = 'coupon-msg ' + type;
  }

  function checkout() {
    var cart = window.CartStore ? window.CartStore.getCart() : [];
    if (!cart.length) return;
    window.location.href = 'checkout.html';
  }

  // ── Event delegation ───────────────────────────────────────────────────────

  function onItemsClick(e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;

    var action = btn.dataset.action;
    var id     = btn.dataset.id;

    if (action === 'inc')    changeQty(id, 1);
    if (action === 'dec')    changeQty(id, -1);
    if (action === 'remove') removeItem(id);
  }

  // ── Init ───────────────────────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    // Safety check
    if (!window.CartStore) {
      console.error('[cart-page] CartStore not found. Make sure cart.js is loaded before cart-page.js.');
      return;
    }

    render();

    var itemsEl = document.getElementById('cp-items');
    if (itemsEl) itemsEl.addEventListener('click', onItemsClick);

    var checkoutBtn = document.getElementById('os-checkout-btn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', checkout);

    var couponBtn = document.getElementById('coupon-apply-btn');
    if (couponBtn) couponBtn.addEventListener('click', applyCoupon);

    var couponInput = document.getElementById('coupon-input');
    if (couponInput) {
      couponInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') applyCoupon();
      });
    }
  });

})();
