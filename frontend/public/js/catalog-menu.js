document.addEventListener('DOMContentLoaded', () => {
  const trigger = document.getElementById('all-products-btn');
  const menu = document.getElementById('mega-menu');
  if (!trigger || !menu) return;

  const topButtons = Array.from(menu.querySelectorAll('.catalog-icon-btn'));
  const leftCol = menu.querySelector('.catalog-col-left');
  const midCol = menu.querySelector('.catalog-col-mid');
  const promoImage = menu.querySelector('.catalog-promo-float');

  const groups = {
    oriental: {
      label: 'Oriental',
      items: ['sushi', 'combinado', 'harumaki', 'temaki', 'yakissoba'],
    },
    fastfood: {
      label: 'Fast Food',
      items: ['hamburguer', 'batata-frita', 'pastel', 'hot-dog'],
    },
    doces: {
      label: 'Doces',
      items: ['bolo', 'churros'],
    },
  };

  const groupList = [
    { key: 'oriental', label: 'Oriental' },
    { key: 'fastfood', label: 'Fast Food' },
    { key: 'doces', label: 'Doces' },
  ];

  const itemLabels = {
    sushi: 'Sushi',
    combinado: 'Combinado',
    harumaki: 'Harumaki',
    temaki: 'Temaki',
    yakissoba: 'Yakissoba',
    hamburguer: 'Hamburguer',
    'batata-frita': 'Batata Frita',
    pastel: 'Pastel',
    'hot-dog': 'Hot Dog',
    bolo: 'Bolo',
    churros: 'Churros',
  };

  const state = {
    level1: 'convites',
    level2: '',
  };

  function toCatalogUrl(params) {
    const query = new URLSearchParams(params);
    return `category.html?${query.toString()}`;
  }

  function toSubcategoriaSlug(groupKey) {
    return groupKey === 'fastfood' ? 'fast-food' : groupKey;
  }

  function setTopActive(cat) {
    topButtons.forEach((btn) => btn.classList.toggle('active', btn.dataset.cat === cat));
  }

  function setPromoImage(cat) {
    if (!promoImage) return;
    promoImage.src = cat === 'convites'
      ? 'assets/icons/convite-menu.png'
      : 'assets/icons/embalagens-menu.png';
  }

  function renderConvites() {
    state.level1 = 'convites';
    state.level2 = '';
    setTopActive('convites');
    setPromoImage('convites');

    if (leftCol) {
      leftCol.innerHTML = `
        <h4 class="catalog-col-title">CONVITES</h4>
        <p class="catalog-empty-note">Novidades em breve</p>
      `;
    }
    if (midCol) midCol.innerHTML = '';
  }

  function renderLeftGroups(activeGroup) {
    if (!leftCol) return;
    leftCol.innerHTML = `
      <h4 class="catalog-col-title">EMBALAGENS</h4>
      <ul class="catalog-col-list">
        ${groupList
          .map((group) => {
            const activeClass = activeGroup === group.key ? 'active-item' : '';
            return `<li class="${activeClass}"><a href="${toCatalogUrl({ subcategoria: toSubcategoriaSlug(group.key) })}" data-level2="${group.key}">${group.label}</a></li>`;
          })
          .join('')}
      </ul>
    `;

    leftCol.querySelectorAll('.catalog-col-list li').forEach((li) => {
      const link = li.querySelector('[data-level2]');
      const key = link && link.dataset.level2;
      li.classList.toggle('active-item', !!key && activeGroup === key);
    });

    leftCol.querySelectorAll('[data-level2]').forEach((link) => {
      const key = link.dataset.level2;
      link.addEventListener('mouseenter', () => renderSubItems(key));
      link.addEventListener('focus', () => renderSubItems(key));
    });
  }

  function renderSubItems(groupKey) {
    if (!midCol || !groups[groupKey]) return;
    state.level2 = groupKey;
    leftCol.querySelectorAll('.catalog-col-list li').forEach((li) => {
      const link = li.querySelector('[data-level2]');
      const key = link && link.dataset.level2;
      li.classList.toggle('active-item', !!key && key === groupKey);
    });

    const cfg = groups[groupKey];
    midCol.innerHTML = `
      <h4 class="catalog-col-title">${cfg.label.toUpperCase()}</h4>
      <ul class="catalog-col-list">
        ${cfg.items
          .map((item) => `<li><a href="#" data-level3="${item}">${itemLabels[item]}</a></li>`)
          .join('')}
      </ul>
    `;

    midCol.querySelectorAll('[data-level3]').forEach((link) => {
      const item = link.dataset.level3;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = toCatalogUrl({ categoria: 'embalagens', subcategoria: groupKey, item });
      });
    });
  }

  function renderEmbalagens() {
    state.level1 = 'embalagens';
    setTopActive('embalagens');
    setPromoImage('embalagens');
    renderLeftGroups('');
    if (midCol) midCol.innerHTML = '';
  }

  topButtons.forEach((btn) => {
    const cat = btn.dataset.cat;

    btn.addEventListener('mouseenter', () => {
      if (cat === 'embalagens') renderEmbalagens();
      else renderConvites();
    });
    btn.addEventListener('focus', () => {
      if (cat === 'embalagens') renderEmbalagens();
      else renderConvites();
    });
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (cat === 'embalagens') {
        window.location.href = toCatalogUrl({ categoria: 'embalagens' });
      } else {
        window.location.href = toCatalogUrl({ categoria: 'convites' });
      }
    });
  });

  let closeTimer = null;
  const clearCloseTimer = () => {
    if (closeTimer) clearTimeout(closeTimer);
    closeTimer = null;
  };
  const openMenu = () => {
    clearCloseTimer();
    menu.classList.add('active');
  };
  const scheduleClose = () => {
    clearCloseTimer();
    closeTimer = setTimeout(() => menu.classList.remove('active'), 180);
  };

  trigger.addEventListener('mouseenter', openMenu);
  trigger.addEventListener('mouseleave', scheduleClose);
  menu.addEventListener('mouseenter', openMenu);
  menu.addEventListener('mouseleave', scheduleClose);

  trigger.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    menu.classList.toggle('active');
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && !trigger.contains(event.target)) {
      menu.classList.remove('active');
    }
  });

  menu.addEventListener('click', (event) => event.stopPropagation());

  renderConvites();
});
