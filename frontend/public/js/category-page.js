document.addEventListener('DOMContentLoaded', () => {

  // ── Dados ───────────────────────────────────────────────────────────────────
  const mockProducts = [
    { id: 1,   name: 'Convite Clássico',  price: 19.9, category: 'convites', group: null, item: null, image: 'assets/produtos/convite-classico.png' },
    { id: 2,   name: 'Convite Premium',   price: 29.9, category: 'convites', group: null, item: null, image: 'assets/produtos/convite-premium.png' },

    { id: 101, name: 'Caixa para Sushi Personalizada',                         price: 42.9, category: 'embalagens', group: 'oriental', item: 'sushi',                 image: 'Produtos/Sushi/Caixa para Sushi Personalizada/Caixa para Sushi Personalizada.png' },
    { id: 102, name: 'Caixa para Combinado Liso',                               price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado-liso',        type: 'combinado', model: 'liso',         image: 'Produtos/Combinado/Liso/Caixa para Combinado Liso/Caixa para Combinado Liso.png' },
    { id: 106, name: 'Caixa para Combinado Especial',                           price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado-especial',    type: 'combinado', model: 'especial',     image: 'Produtos/Combinado/Especial/Caixa para Combinado Especial/Caixa para Combinado Especial.png' },
    { id: 107, name: 'Caixa para Combinado Personalizar',                       price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado-personalizar', type: 'combinado', model: 'personalizar', image: 'Produtos/Combinado/Personalizar/Caixa para Combinado Personalizar/Caixa para Combinado Personalizar.png' },
    { id: 108, name: 'Caixa Gaveta Combinado Kraft Personalizada',              price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado-kraft',         type: 'combinado', model: 'kraft',        image: 'Produtos/Combinado/Personalizar/Caixa Gaveta Combinado Kraft Personalizada/Caixa Gaveta Combinado Kraft Personalizada.png' },
    { id: 103, name: 'Embalagem Harumaki 2un',                                  price: 42.9, category: 'embalagens', group: 'oriental', item: 'harumaki',              image: 'Produtos/Harumaki/Embalagem Harumaki 2un/Embalagem Harumaki 2un.png' },
    { id: 104, name: 'Embalagem para Temaki com berço para Delivery',           price: 42.9, category: 'embalagens', group: 'oriental', item: 'temaki',                image: 'Produtos/Temaki/Embalagem para Temaki com berço para Delivery/Embalagem para Temaki com berço para Delivery.png' },
    { id: 105, name: 'Caixa Box c Tampa Personalizada com berço para Delivery', price: 42.9, category: 'embalagens', group: 'oriental', item: 'yakissoba',             image: 'Produtos/Yakissoba/Caixa Box c Tampa Personalizada com berço para Delivery/Caixa Box c Tampa Personalizada com berço para Delivery.png' },

    { id: 201, name: 'Caixa Hambúrguer',       price: 34.9, category: 'embalagens', group: 'fastfood', item: 'hamburguer',   image: 'assets/produtos/hamburguer.png' },
    { id: 202, name: 'Embalagem Batata Frita',  price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/produtos/batata-frita.png' },
    { id: 203, name: 'Caixa para Pastel',       price: 27.9, category: 'embalagens', group: 'fastfood', item: 'pastel',       image: 'assets/produtos/pastel.png' },
    { id: 204, name: 'Embalagem Hot Dog',        price: 26.9, category: 'embalagens', group: 'fastfood', item: 'hot-dog',     image: 'assets/produtos/hot-dog.png' },

    { id: 301, name: 'Caixa para Bolo',   price: 39.9, category: 'embalagens', group: 'doces', item: 'bolo',    image: 'assets/produtos/bolo.png' },
    { id: 302, name: 'Embalagem Churros', price: 22.9, category: 'embalagens', group: 'doces', item: 'churros', image: 'assets/produtos/churros.png' },
  ];

  const labels = {
    category: { convites: 'Convites', embalagens: 'Embalagens' },
    group:    { oriental: 'Oriental', fastfood: 'Fast Food', doces: 'Doces' },
    item: {
      sushi: 'Sushi',
      combinado: 'Combinado',
      'combinado-liso': 'Combinado Liso', 'combinado-especial': 'Combinado Especial', 'combinado-personalizar': 'Combinado Personalizar', 'combinado-kraft': 'Combinado Kraft',
      harumaki: 'Harumaki', temaki: 'Temaki', yakissoba: 'Yakissoba',
      hamburguer: 'Hambúrguer', 'batata-frita': 'Batata Frita',
      pastel: 'Pastel', 'hot-dog': 'Hot Dog',
      bolo: 'Bolo', churros: 'Churros',
    },
  };

  const itemOptionsByGroup = {
    oriental: ['sushi', 'combinado', 'harumaki', 'temaki', 'yakissoba'],
    fastfood: ['hamburguer', 'batata-frita', 'pastel', 'hot-dog'],
    doces:    ['bolo', 'churros'],
  };

  const modelOptionsByItem = {
    combinado: ['liso', 'especial', 'personalizar', 'kraft'],
  };

  const modelLabels = {
    liso: 'Liso', especial: 'Especial', personalizar: 'Personalizar', kraft: 'Kraft',
  };

  function getFilterItem(p) { return p.type || p.item; }

  // ── Estado ─────────────────────────────────────────────────────────────────
  function normalizeGroup(v) {
    if (!v) return '';
    return v === 'fast-food' ? 'fastfood' : v;
  }

  function getInitialStateFromUrl() {
    const params   = new URLSearchParams(window.location.search);
    const raw      = (params.get('categoria') || params.get('category') || params.get('name') || 'embalagens').toLowerCase();
    const level1   = raw === 'convites' ? 'convites' : 'embalagens';
    // Pré-seleção via URL (vindos do mega menu)
    const group    = normalizeGroup((params.get('subcategoria') || params.get('group') || '').toLowerCase());
    const item     = (params.get('item') || params.get('subcategory') || params.get('sub') || '').toLowerCase();

    return {
      level1,
      selectedGroups: group ? new Set([group]) : new Set(),
      selectedItems:  item  ? new Set([item])  : new Set(),
      selectedModels: new Set(),
      minPrice: null,
      maxPrice: null,
    };
  }

  // ── Filtro de produtos ─────────────────────────────────────────────────────
  function filterProducts(products, state) {
    return products.filter(p => {
      if (state.level1 && p.category !== state.level1) return false;
      if (state.selectedGroups.size > 0 && !state.selectedGroups.has(p.group)) return false;
      if (state.selectedItems.size  > 0 && !state.selectedItems.has(getFilterItem(p))) return false;
      if (state.selectedModels.size > 0 && !state.selectedModels.has(p.model)) return false;
      if (state.minPrice !== null && p.price < state.minPrice) return false;
      if (state.maxPrice !== null && p.price > state.maxPrice) return false;
      return true;
    });
  }

  // ── URL / breadcrumb / título ──────────────────────────────────────────────
  function updateUrl(state) {
    const params = new URLSearchParams();
    if (state.level1) params.set('categoria', state.level1);
    history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  function renderBreadcrumb(state) {
    const host = document.getElementById('breadcrumb');
    if (!host) return;
    const parts = ['<a href="index.html">Home</a>'];
    if (state.level1) {
      parts.push(`<a href="category.html?categoria=${state.level1}">${labels.category[state.level1] || state.level1}</a>`);
    }
    if (state.selectedGroups.size === 1) {
      const g = [...state.selectedGroups][0];
      parts.push(`<span>${labels.group[g] || g}</span>`);
    }
    if (state.selectedItems.size === 1) {
      const it = [...state.selectedItems][0];
      parts.push(`<span>${labels.item[it] || it}</span>`);
    }
    host.innerHTML = parts.join(' <span>&rsaquo;</span> ');
  }

  function renderTitle(state) {
    const title = document.getElementById('page-title');
    if (!title) return;
    if (state.selectedItems.size === 1) {
      title.textContent = labels.item[[...state.selectedItems][0]] || [...state.selectedItems][0];
    } else if (state.selectedGroups.size === 1) {
      title.textContent = labels.group[[...state.selectedGroups][0]] || [...state.selectedGroups][0];
    } else {
      title.textContent = labels.category[state.level1] || 'Catálogo';
    }
  }

  // ── Card ───────────────────────────────────────────────────────────────────
  function cardTemplate(product) {
    const productUrl = `product.html?sub=${encodeURIComponent(product.item || '')}&group=${encodeURIComponent(product.group || '')}&subcategory=${encodeURIComponent(product.item || '')}`;
    return `
      <article class="produto" data-price="${product.price}">
        <a href="${productUrl}">
          <div class="produto-img-wrap">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/220x180/fafafa/999?text=Produto'">
          </div>
        </a>
        <div class="produto-info">
          <h3 class="produto-nome">${product.name}</h3>
          <div class="produto-stars">&#9733;&#9733;&#9733;&#9733;&#9734;</div>
          <div class="produto-old-price">R$ 59,90</div>
          <div class="produto-price">${product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <div class="produto-parcel">ou 2x de ${(product.price / 2).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</div>
          <a href="${productUrl}" class="btn btn-hollow produto-btn">COMPRAR</a>
        </div>
      </article>`;
  }

  function renderResult(products, state) {
    const grid       = document.getElementById('products-grid');
    const resultText = document.getElementById('category-result-text');
    if (!grid || !resultText) return;

    grid.innerHTML = products.length
      ? products.map(cardTemplate).join('')
      : '<p class="no-products">Nenhum produto encontrado para os filtros selecionados.</p>';

    const refLabel = state.selectedItems.size === 1
      ? (labels.item[[...state.selectedItems][0]] || [...state.selectedItems][0])
      : state.selectedGroups.size === 1
        ? (labels.group[[...state.selectedGroups][0]] || [...state.selectedGroups][0])
        : (labels.category[state.level1] || state.level1);

    resultText.textContent = `Exibindo ${products.length} produto${products.length === 1 ? '' : 's'} em ${refLabel}`;
  }

  // ── Sidebar: modo convites vs embalagens ───────────────────────────────────
  function toggleSidebarMode(level1) {
    const comingSoon = document.getElementById('sidebar-coming-soon');
    const filtersDiv = document.getElementById('sidebar-filters');
    const isConvites = level1 === 'convites';
    // Usar style.display para evitar que CSS (display:flex) sobrescreva o atributo hidden
    if (comingSoon) comingSoon.style.display = isConvites ? 'flex' : 'none';
    if (filtersDiv)  filtersDiv.style.display = isConvites ? 'none' : 'block';
  }

  // ── Range Slider ───────────────────────────────────────────────────────────
  function initRangeSlider(state) {
    const catProds = mockProducts.filter(p => p.category === state.level1);
    const maxVal   = Math.ceil(Math.max(...catProds.map(p => p.price), 0));

    const rangeMin  = document.getElementById('range-min');
    const rangeMax  = document.getElementById('range-max');
    const fill      = document.getElementById('range-fill');
    const minInput  = document.getElementById('min-price');
    const maxInput  = document.getElementById('max-price');
    if (!rangeMin || !rangeMax) return;

    rangeMin.max      = maxVal;
    rangeMax.max      = maxVal;
    rangeMin.value    = 0;
    rangeMax.value    = maxVal;
    minInput.max      = maxVal;
    maxInput.max      = maxVal;
    maxInput.value    = maxVal;
    maxInput.placeholder = maxVal;

    function updateFill() {
      const lo  = Number(rangeMin.value);
      const hi  = Number(rangeMax.value);
      const pct = 100 / maxVal;
      fill.style.left  = (lo * pct) + '%';
      fill.style.right = (100 - hi * pct) + '%';
    }

    function syncFromSliders() {
      const lo = Number(rangeMin.value);
      const hi = Number(rangeMax.value);
      minInput.value     = lo;
      maxInput.value     = hi;
      state.minPrice     = lo > 0     ? lo : null;
      state.maxPrice     = hi < maxVal ? hi : null;
      updateFill();
      apply(state);
    }

    function syncFromInputs() {
      let lo = Math.max(0,      Number(minInput.value) || 0);
      let hi = Math.min(maxVal, Number(maxInput.value) || maxVal);
      if (lo > hi) lo = hi;
      rangeMin.value = lo;
      rangeMax.value = hi;
      minInput.value = lo;
      maxInput.value = hi;
      state.minPrice = lo > 0     ? lo : null;
      state.maxPrice = hi < maxVal ? hi : null;
      updateFill();
      apply(state);
    }

    rangeMin.addEventListener('input', () => {
      if (Number(rangeMin.value) > Number(rangeMax.value)) rangeMin.value = rangeMax.value;
      syncFromSliders();
    });
    rangeMax.addEventListener('input', () => {
      if (Number(rangeMax.value) < Number(rangeMin.value)) rangeMax.value = rangeMin.value;
      syncFromSliders();
    });
    minInput.addEventListener('change', syncFromInputs);
    maxInput.addEventListener('change', syncFromInputs);

    updateFill();
  }

  // ── Checkboxes ─────────────────────────────────────────────────────────────
  function countFor(field, value) {
    return mockProducts.filter(p => p[field] === value).length;
  }

  function renderGroupCheckboxes(state) {
    const container = document.getElementById('filter-groups');
    if (!container) return;

    container.innerHTML = Object.keys(itemOptionsByGroup).map(group => `
      <label class="filter-check-label">
        <input type="checkbox" class="filter-check-input filter-check-group"
               value="${group}" ${state.selectedGroups.has(group) ? 'checked' : ''}>
        <span class="filter-check-box"><i class="fas fa-check filter-check-icon"></i></span>
        <span class="filter-check-text">${labels.group[group] || group}</span>
        <span class="filter-check-count">${countFor('group', group)}</span>
      </label>`).join('');

    container.querySelectorAll('.filter-check-group').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) state.selectedGroups.add(cb.value);
        else            state.selectedGroups.delete(cb.value);
        // atualiza tipos visíveis conforme grupos selecionados
        renderItemCheckboxes(state);
        apply(state);
      });
    });
  }

  function renderItemCheckboxes(state) {
    const container = document.getElementById('filter-items');
    if (!container) return;

    const activeGroups = state.selectedGroups.size > 0
      ? [...state.selectedGroups]
      : Object.keys(itemOptionsByGroup);

    const visibleItems = activeGroups.flatMap(g => itemOptionsByGroup[g] || []);

    // Remove itens selecionados que saíram do escopo
    [...state.selectedItems].forEach(item => {
      if (!visibleItems.includes(item)) state.selectedItems.delete(item);
    });

    container.innerHTML = visibleItems.map(item => `
      <label class="filter-check-label">
        <input type="checkbox" class="filter-check-input filter-check-item"
               value="${item}" ${state.selectedItems.has(item) ? 'checked' : ''}>
        <span class="filter-check-box"><i class="fas fa-check filter-check-icon"></i></span>
        <span class="filter-check-text">${labels.item[item] || item}</span>
        <span class="filter-check-count">${mockProducts.filter(p => getFilterItem(p) === item).length}</span>
      </label>`).join('');

    container.querySelectorAll('.filter-check-item').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) state.selectedItems.add(cb.value);
        else            state.selectedItems.delete(cb.value);
        // limpa modelos se combinado foi desmarcado
        if (!state.selectedItems.has('combinado')) state.selectedModels.clear();
        renderModelCheckboxes(state);
        apply(state);
      });
    });
  }

  function renderModelCheckboxes(state) {
    const section   = document.getElementById('filter-models-section');
    const container = document.getElementById('filter-models');
    if (!section || !container) return;

    // decide quais grupos de modelos mostrar
    const activeItems = state.selectedItems.size > 0
      ? [...state.selectedItems]
      : Object.values(itemOptionsByGroup).flat();

    const visibleModels = activeItems.flatMap(it => modelOptionsByItem[it] || []);

    if (visibleModels.length === 0) {
      section.hidden = true;
      return;
    }
    section.hidden = false;

    // remove modelos selecionados que saíram do escopo
    [...state.selectedModels].forEach(m => {
      if (!visibleModels.includes(m)) state.selectedModels.delete(m);
    });

    container.innerHTML = visibleModels.map(model => `
      <label class="filter-check-label">
        <input type="checkbox" class="filter-check-input filter-check-model"
               value="${model}" ${state.selectedModels.has(model) ? 'checked' : ''}>
        <span class="filter-check-box"><i class="fas fa-check filter-check-icon"></i></span>
        <span class="filter-check-text">${modelLabels[model] || model}</span>
        <span class="filter-check-count">${mockProducts.filter(p => p.model === model).length}</span>
      </label>`).join('');

    container.querySelectorAll('.filter-check-model').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) state.selectedModels.add(cb.value);
        else            state.selectedModels.delete(cb.value);
        apply(state);
      });
    });
  }

  // ── Apply (ciclo principal) ────────────────────────────────────────────────
  function apply(state) {
    toggleSidebarMode(state.level1);
    const products = filterProducts(mockProducts, state);
    updateUrl(state);
    renderBreadcrumb(state);
    renderTitle(state);
    renderResult(products, state);
    renderModelCheckboxes(state);
  }

  // ── Logo dinâmica ──────────────────────────────────────────────────────────
  function applyLogo(level1) {
    const headerLogo     = document.querySelector('.logo img');
    const footerBrandLogo = document.querySelector('.footer-brand-logo img');
    if (level1 !== 'convites') {
      if (headerLogo)     headerLogo.src     = 'assets/logo/logo-dark-ULTRAPRESS.png';
      if (footerBrandLogo) footerBrandLogo.src = 'assets/logo/logo-white-ULTRAPRESS.png';
    } else {
      if (footerBrandLogo) footerBrandLogo.src = 'assets/logo/logo-white-2.png';
    }
  }

  // ── Inicialização ──────────────────────────────────────────────────────────
  const state = getInitialStateFromUrl();

  initRangeSlider(state);
  renderGroupCheckboxes(state);
  renderItemCheckboxes(state);

  document.getElementById('clear-groups')?.addEventListener('click', () => {
    state.selectedGroups.clear();
    renderGroupCheckboxes(state);
    renderItemCheckboxes(state);
    apply(state);
  });

  document.getElementById('clear-items')?.addEventListener('click', () => {
    state.selectedItems.clear();
    state.selectedModels.clear();
    renderItemCheckboxes(state);
    apply(state);
  });

  document.getElementById('clear-models')?.addEventListener('click', () => {
    state.selectedModels.clear();
    renderModelCheckboxes(state);
    apply(state);
  });

  // Exposto para o mega menu
  window.applyCatalogFilter = (selection) => {
    const newLevel1 = selection.level1 ?? state.level1;
    if (newLevel1 !== state.level1) {
      state.selectedGroups.clear();
      state.selectedItems.clear();
    }
    state.level1 = newLevel1;
    if (selection.level2) {
      const g = normalizeGroup(selection.level2);
      state.selectedGroups.clear();
      state.selectedGroups.add(g);
    }
    if (selection.level3) {
      state.selectedItems.clear();
      state.selectedItems.add(selection.level3);
    }
    renderGroupCheckboxes(state);
    renderItemCheckboxes(state);
    applyLogo(state.level1);
    apply(state);
  };

  applyLogo(state.level1);
  apply(state);
});
