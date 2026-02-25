document.addEventListener('DOMContentLoaded', () => {
  // Mock de produtos com hierarquia: nivel1 (category), nivel2 (group), nivel3 (item)
  const mockProducts = [
    { id: 1, name: 'Convite Classico', price: 19.9, category: 'convites', group: null, item: null, image: 'assets/produtos/convite-classico.png' },
    { id: 2, name: 'Convite Premium', price: 29.9, category: 'convites', group: null, item: null, image: 'assets/produtos/convite-premium.png' },

    { id: 101, name: 'Caixa para Sushi', price: 42.9, category: 'embalagens', group: 'oriental', item: 'sushi', image: 'assets/produtos/sushi.png' },
    { id: 102, name: 'Caixa Combinado Gaveta', price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', image: 'assets/produtos/combinado 1.png' },
    { id: 103, name: 'Embalagem Harumaki 2un', price: 42.9, category: 'embalagens', group: 'oriental', item: 'harumaki', image: 'assets/produtos/Harumaki 2.png' },
    { id: 104, name: 'Embalagem para Temaki com berco para Delivery', price: 42.9, category: 'embalagens', group: 'oriental', item: 'temaki', image: 'assets/produtos/temaki.png' },
    { id: 105, name: 'Caixa Box c/ Tampa Personalizada com berco para Delivery', price: 42.9, category: 'embalagens', group: 'oriental', item: 'yakissoba', image: 'assets/produtos/yakissoba 1.png' },

    { id: 201, name: 'Caixa Hamburguer', price: 34.9, category: 'embalagens', group: 'fastfood', item: 'hamburguer', image: 'assets/produtos/hamburguer.png' },
    { id: 202, name: 'Embalagem Batata Frita', price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/produtos/batata-frita.png' },
    { id: 203, name: 'Caixa para Pastel', price: 27.9, category: 'embalagens', group: 'fastfood', item: 'pastel', image: 'assets/produtos/pastel.png' },
    { id: 204, name: 'Embalagem Hot Dog', price: 26.9, category: 'embalagens', group: 'fastfood', item: 'hot-dog', image: 'assets/produtos/hot-dog.png' },

    { id: 301, name: 'Caixa para Bolo', price: 39.9, category: 'embalagens', group: 'doces', item: 'bolo', image: 'assets/produtos/bolo.png' },
    { id: 302, name: 'Embalagem Churros', price: 22.9, category: 'embalagens', group: 'doces', item: 'churros', image: 'assets/produtos/churros.png' },
  ];

  const labels = {
    category: { convites: 'Convites', embalagens: 'Embalagens' },
    group: { oriental: 'Oriental', fastfood: 'Fast Food', doces: 'Doces' },
    item: {
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
    },
  };

  const itemOptionsByGroup = {
    oriental: ['sushi', 'combinado', 'harumaki', 'temaki', 'yakissoba'],
    fastfood: ['hamburguer', 'batata-frita', 'pastel', 'hot-dog'],
    doces: ['bolo', 'churros'],
  };

  function normalizeGroup(value) {
    if (!value) return '';
    return value === 'fast-food' ? 'fastfood' : value;
  }

  function getInitialStateFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const level1Raw = (params.get('categoria') || params.get('category') || params.get('name') || 'embalagens').toLowerCase();
    const level2Raw = normalizeGroup((params.get('subcategoria') || params.get('group') || '').toLowerCase());
    const level3Raw = (params.get('item') || params.get('subcategory') || params.get('sub') || '').toLowerCase();

    return {
      level1: level1Raw === 'convites' ? 'convites' : 'embalagens',
      level2: level2Raw,
      level3: level3Raw,
      minPrice: null,
      maxPrice: null,
    };
  }

  // Função principal de filtro (pedido do prompt)
  function filterProducts(products, state) {
    return products.filter((product) => {
      if (state.level1 && product.category !== state.level1) return false;
      if (state.level2 && product.group !== state.level2) return false;
      if (state.level3 && product.item !== state.level3) return false;
      if (state.minPrice !== null && product.price < state.minPrice) return false;
      if (state.maxPrice !== null && product.price > state.maxPrice) return false;
      return true;
    });
  }

  function updateUrl(state) {
    const params = new URLSearchParams();
    params.set('categoria', state.level1);
    if (state.level2) params.set('subcategoria', state.level2);
    if (state.level3) params.set('item', state.level3);
    history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }

  function renderBreadcrumb(state) {
    const host = document.getElementById('breadcrumb');
    if (!host) return;

    const parts = ['<a href="index.html">Home</a>'];
    if (state.level1) parts.push(`<a href="category.html?categoria=${state.level1}">${labels.category[state.level1] || state.level1}</a>`);
    if (state.level2) parts.push(`<a href="category.html?categoria=${state.level1}&subcategoria=${state.level2}">${labels.group[state.level2] || state.level2}</a>`);
    if (state.level3) parts.push(`<span>${labels.item[state.level3] || state.level3}</span>`);
    host.innerHTML = parts.join(' <span>&rsaquo;</span> ');
  }

  function renderTitle(state) {
    const title = document.getElementById('page-title');
    if (!title) return;
    if (state.level3) title.textContent = labels.item[state.level3] || state.level3;
    else if (state.level2) title.textContent = labels.group[state.level2] || state.level2;
    else title.textContent = labels.category[state.level1] || 'Catalogo';
  }

  function renderSubcategorySelect(state) {
    const select = document.getElementById('subcategory-select');
    if (!select) return;

    if (state.level1 !== 'embalagens') {
      select.innerHTML = '<option value="">Todos</option>';
      select.disabled = true;
      return;
    }

    const options = state.level2 ? (itemOptionsByGroup[state.level2] || []) : [];
    select.disabled = options.length === 0;
    select.innerHTML =
      '<option value="">Todos</option>' +
      options.map((item) => `<option value="${item}"${item === state.level3 ? ' selected' : ''}>${labels.item[item] || item}</option>`).join('');
  }

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
          <a href="${productUrl}" class="btn btn-hollow produto-btn">VER DETALHES</a>
        </div>
      </article>
    `;
  }

  function renderResult(products, state) {
    const grid = document.getElementById('products-grid');
    const resultText = document.getElementById('category-result-text');
    if (!grid || !resultText) return;

    if (!products.length) {
      grid.innerHTML = '<p class="no-products">Nenhum produto encontrado para os filtros selecionados.</p>';
    } else {
      grid.innerHTML = products.map(cardTemplate).join('');
    }

    const refLabel = state.level3
      ? (labels.item[state.level3] || state.level3)
      : state.level2
        ? (labels.group[state.level2] || state.level2)
        : (labels.category[state.level1] || state.level1);

    resultText.textContent = `Exibindo ${products.length} produto${products.length === 1 ? '' : 's'} em ${refLabel}`;
  }

  function apply(state) {
    const products = filterProducts(mockProducts, state);
    updateUrl(state);
    renderBreadcrumb(state);
    renderTitle(state);
    renderSubcategorySelect(state);
    renderResult(products, state);
  }

  const state = getInitialStateFromUrl();
  const minPriceInput = document.getElementById('min-price');
  const maxPriceInput = document.getElementById('max-price');
  const subSelect = document.getElementById('subcategory-select');

  minPriceInput?.addEventListener('input', () => {
    const value = parseFloat(minPriceInput.value);
    state.minPrice = Number.isFinite(value) ? value : null;
    apply(state);
  });

  maxPriceInput?.addEventListener('input', () => {
    const value = parseFloat(maxPriceInput.value);
    state.maxPrice = Number.isFinite(value) ? value : null;
    apply(state);
  });

  subSelect?.addEventListener('change', () => {
    state.level3 = subSelect.value || '';
    apply(state);
  });

  // Exposto para uso no menu (se precisar filtrar por clique sem reload)
  window.applyCatalogFilter = (selection) => {
    state.level1 = selection.level1 ?? state.level1;
    state.level2 = normalizeGroup(selection.level2 ?? state.level2);
    state.level3 = selection.level3 ?? state.level3;
    apply(state);
  };

  apply(state);

  // ─── Logo dinâmica: ULTRAPRESS para embalagens/demais, logo-2 exclusivo para convites ──
  const footerBrandLogo = document.querySelector('.footer-brand-logo img');
  if (state.level1 !== 'convites') {
    const headerLogo = document.querySelector('.logo img');
    if (headerLogo) headerLogo.src = 'assets/logo/logo-dark-ULTRAPRESS.png';
    if (footerBrandLogo) footerBrandLogo.src = 'assets/logo/logo-white-ULTRAPRESS.png';
  } else {
    if (footerBrandLogo) footerBrandLogo.src = 'assets/logo/logo-white-2.png';
  }
});
