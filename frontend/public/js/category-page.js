document.addEventListener('DOMContentLoaded', () => {

  // ── Dados ───────────────────────────────────────────────────────────────────
  const mockProducts = [
    { id: 1, name: 'MEDICINA – UNIVERSIDADE DO PARÁ', price: 0, category: 'convites', group: null, item: null, image: 'assets/produtos-convites/Cursos/MEDICINA/MEDICINA – UNIVERSIDADE DO PARÁ/MEDICINA – UNIVERSIDADE DO PARÁ-Card.png' },

    // ── ORIENTAL › Combinado ────────────────────────────────────────────────
    { id: 101, name: 'Caixa para Combinado Especial',                    price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', type: 'combinado', model: 'especial',     image: 'assets/Produtos/Oriental/Combinado/Especial/Caixa para Combinado Especial/Caixa para Combinado Especial.png' },
    { id: 102, name: 'Caixa Gaveta Combinado Liso',                      price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', type: 'combinado', model: 'liso',          image: 'assets/Produtos/Oriental/Combinado/Liso/Caixa Gaveta Combinado Liso/Caixa Gaveta Combinado Liso.png' },
    { id: 103, name: 'Caixa para Combinado Liso',                        price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', type: 'combinado', model: 'liso',          image: 'assets/Produtos/Oriental/Combinado/Liso/Caixa para Combinado Liso/Caixa para Combinado Liso.png' },
    { id: 104, name: 'Caixa Gaveta Combinado Kraft Personalizada',       price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', type: 'combinado', model: 'personalizar',  image: 'assets/Produtos/Oriental/Combinado/Personalizar/Caixa Gaveta Combinado Kraft Personalizada/Caixa Gaveta Combinado Kraft Personalizada.png' },
    { id: 105, name: 'Caixa para Combinado Especial Kraft Personalizado',price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', type: 'combinado', model: 'personalizar',  image: 'assets/Produtos/Oriental/Combinado/Personalizar/Caixa para Combinado Especial Kraft Personalizado/Caixa para Combinado Especial Kraft Personalizado.png' },
    { id: 106, name: 'Caixa para Combinado Personalizar',                price: 42.9, category: 'embalagens', group: 'oriental', item: 'combinado', type: 'combinado', model: 'personalizar',  image: 'assets/Produtos/Oriental/Combinado/Personalizar/Caixa para Combinado Personalizar/Caixa para Combinado Personalizar.png' },

    // ── ORIENTAL › Harumaki ─────────────────────────────────────────────────
    { id: 107, name: 'Embalagem para Rolinho Primavera (Harumaki) 1un Liso', price: 39.9, category: 'embalagens', group: 'oriental', item: 'harumaki', image: 'assets/Produtos/Oriental/Harumaki/Liso/Embalagem para Rolinho Primavera (Harumaki) 1un Liso/Embalagem para Rolinho Primavera (Harumaki) 1un Liso.png' },
    { id: 108, name: 'Embalagem para Rolinho Primavera (Harumaki) 2un Liso', price: 39.9, category: 'embalagens', group: 'oriental', item: 'harumaki', image: 'assets/Produtos/Oriental/Harumaki/Liso/Embalagem para Rolinho Primavera (Harumaki) 2un Liso/Embalagem para Rolinho Primavera (Harumaki) 2un Liso.png' },
    { id: 109, name: 'Embalagem Harumaki 1un Personalizada',                 price: 39.9, category: 'embalagens', group: 'oriental', item: 'harumaki', image: 'assets/Produtos/Oriental/Harumaki/Personalizar/Embalagem Harumaki 1un Personalizada/Embalagem Harumaki 1un Personalizada.png' },
    { id: 110, name: 'Embalagem Harumaki 2un Personalizada',                 price: 39.9, category: 'embalagens', group: 'oriental', item: 'harumaki', image: 'assets/Produtos/Oriental/Harumaki/Personalizar/Embalagem Harumaki 2un Personalizada/Embalagem Harumaki 2un Personalizada.png' },

    // ── ORIENTAL › Sushi ────────────────────────────────────────────────────
    { id: 111, name: 'Caixa para Sushi Liso',        price: 42.9, category: 'embalagens', group: 'oriental', item: 'sushi', image: 'assets/Produtos/Oriental/Sushi/Liso/Caixa para Sushi Liso/Caixa para Sushi Liso.png' },
    { id: 112, name: 'Caixa para Sushi Personalizada', price: 42.9, category: 'embalagens', group: 'oriental', item: 'sushi', image: 'assets/Produtos/Oriental/Sushi/Personalizar/Caixa para Sushi Personalizada/Caixa para Sushi Personalizada.png' },

    // ── ORIENTAL › Temaki ───────────────────────────────────────────────────
    { id: 113, name: 'Embalagem para Temaki com berço para Delivery Liso',        price: 39.9, category: 'embalagens', group: 'oriental', item: 'temaki', image: 'assets/Produtos/Oriental/Temaki/Liso/Embalagem para Temaki com berço para Delivery Liso/Embalagem para Temaki com berço para Delivery Liso.png' },
    { id: 114, name: 'Temaki Triangular com Berço',                               price: 39.9, category: 'embalagens', group: 'oriental', item: 'temaki', image: 'assets/Produtos/Oriental/Temaki/Liso/Temaki Triangular com Berço/Temaki Triangular com Berço/Temaki Triangular com Berço.png' },
    { id: 115, name: 'Embalagem para Temaki com berço para Delivery Personalizar', price: 39.9, category: 'embalagens', group: 'oriental', item: 'temaki', image: 'assets/Produtos/Oriental/Temaki/Personalizar/Embalagem para Temaki com berço para Delivery Personalizar/Embalagem para Temaki com berço para Delivery Personalizar.png' },
    { id: 116, name: 'Temaki Triangular com Berço Personalizar',                  price: 39.9, category: 'embalagens', group: 'oriental', item: 'temaki', image: 'assets/Produtos/Oriental/Temaki/Personalizar/Temaki Triangular com Berço Personalizar/Temaki Triangular com Berço Personalizar.png' },

    // ── ORIENTAL › Yakissoba ────────────────────────────────────────────────
    { id: 117, name: 'Caixa Box Liso',                 price: 42.9, category: 'embalagens', group: 'oriental', item: 'yakissoba', image: 'assets/Produtos/Oriental/Yakissoba/Liso/Caixa Box Liso/Caixa Box Liso.png' },
    { id: 118, name: 'Caixa Box com Tampa Liso',       price: 42.9, category: 'embalagens', group: 'oriental', item: 'yakissoba', image: 'assets/Produtos/Oriental/Yakissoba/Liso/Caixa Box com Tampa Liso/Caixa Box com Tampa Liso.png' },
    { id: 119, name: 'Caixa Box Personalizada',        price: 42.9, category: 'embalagens', group: 'oriental', item: 'yakissoba', image: 'assets/Produtos/Oriental/Yakissoba/Personalizar/Caixa Box Personalizada/Caixa Box Personalizada.png' },
    { id: 120, name: 'Caixa Box com Tampa Personalizada', price: 42.9, category: 'embalagens', group: 'oriental', item: 'yakissoba', image: 'assets/Produtos/Oriental/Yakissoba/Personalizar/Caixa Box com Tampa Personalizada/Caixa Box com Tampa Personalizada.png' },

    // ── FAST FOOD › Batata Frita ────────────────────────────────────────────
    { id: 201, name: 'Caixa Batata Frita 120G Liso',         price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/Produtos/Fast Food/Batata Frita/Liso/Caixa Batata Frita 120G Liso/Caixa Batata Frita 120G Liso.png' },
    { id: 202, name: 'Caixa Batata Frita 250G Liso',         price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/Produtos/Fast Food/Batata Frita/Liso/Caixa Batata Frita 250G Liso/Caixa Batata Frita 250G Liso.png' },
    { id: 203, name: 'Embalagem Cone Multiuso Liso',          price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/Produtos/Fast Food/Batata Frita/Liso/Embalagem Cone Multiuso Liso/Embalagem Cone Multiuso Liso.png' },
    { id: 204, name: 'Caixa Batata Frita 120G PERSONALIZADO', price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/Produtos/Fast Food/Batata Frita/Personalizar/Caixa Batata Frita 120G PERSONALIZADO/Caixa Batata Frita 120G PERSONALIZADO.png' },
    { id: 205, name: 'Caixa Batata Frita 250G PERSONALIZADO', price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/Produtos/Fast Food/Batata Frita/Personalizar/Caixa Batata Frita 250G PERSONALIZADO/Caixa Batata Frita 250G PERSONALIZADO.png' },
    { id: 206, name: 'Embalagem Cone Multiuso PERSONALIZADO', price: 24.9, category: 'embalagens', group: 'fastfood', item: 'batata-frita', image: 'assets/Produtos/Fast Food/Batata Frita/Personalizar/Embalagem Cone Multiuso PERSONALIZADO/Embalagem Cone Multiuso PERSONALIZADO.png' },

    // ── FAST FOOD › Hambúrguer ──────────────────────────────────────────────
    { id: 207, name: 'Caixa Hambúrguer Tradicional Liso',   price: 34.9, category: 'embalagens', group: 'fastfood', item: 'hamburguer', image: 'assets/Produtos/Fast Food/Hamburguer/Liso/Caixa Hambúrguer Tradicional Liso/Caixa Hambúrguer Tradicional Liso.png' },
    { id: 208, name: 'Caixa para Hambúrguer Liso',          price: 34.9, category: 'embalagens', group: 'fastfood', item: 'hamburguer', image: 'assets/Produtos/Fast Food/Hamburguer/Liso/Caixa para Hambúrguer Liso/Caixa para Hambúrguer Liso.png' },
    { id: 209, name: 'Caixa Box Hamburguer Personalizado',  price: 34.9, category: 'embalagens', group: 'fastfood', item: 'hamburguer', image: 'assets/Produtos/Fast Food/Hamburguer/Personalizar/Caixa Box Hamburguer Personalizado/Caixa Box Hamburguer Personalizado.png' },
    { id: 210, name: 'Caixa Hambúrguer Kraft Personalizada', price: 34.9, category: 'embalagens', group: 'fastfood', item: 'hamburguer', image: 'assets/Produtos/Fast Food/Hamburguer/Personalizar/Caixa Hambúrguer Kraft Personalizada/Caixa Hambúrguer Kraft Personalizada.png' },

    // ── FAST FOOD › Hot Dog ─────────────────────────────────────────────────
    { id: 211, name: 'Hot Dog com Trava',             price: 26.9, category: 'embalagens', group: 'fastfood', item: 'hot-dog', image: 'assets/Produtos/Fast Food/Hot Dog/Liso/Hot Dog com Trava/Hot Dog com Trava.png' },
    { id: 212, name: 'Hot Dog com Trava Personalizar', price: 26.9, category: 'embalagens', group: 'fastfood', item: 'hot-dog', image: 'assets/Produtos/Fast Food/Hot Dog/Personalizar/Hot Dog com Trava Personalizar/Hot Dog com Trava Personalizar.png' },

    // ── FAST FOOD › Pastel ──────────────────────────────────────────────────
    { id: 213, name: 'Pastel Balcão Liso', price: 27.9, category: 'embalagens', group: 'fastfood', item: 'pastel', image: 'assets/Produtos/Fast Food/Pastel/Liso/Pastel Balcão Liso/Pastel Balcão Liso.png' },

    // ── FAST FOOD › Pizza ───────────────────────────────────────────────────
    { id: 214, name: 'Embalagem Mini Pizza Liso',        price: 29.9, category: 'embalagens', group: 'fastfood', item: 'pizza', image: 'assets/Produtos/Fast Food/Pizza/Liso/Embalagem Mini Pizza Liso/Embalagem Mini Pizza Liso.png' },
    { id: 215, name: 'Embalagem Mini Pizza Personalizada', price: 29.9, category: 'embalagens', group: 'fastfood', item: 'pizza', image: 'assets/Produtos/Fast Food/Pizza/Personalizar/Embalagem Mini Pizza Personalizada/Embalagem Mini Pizza Personalizada.png' },

    // ── FAST FOOD › Pizza Fatia ─────────────────────────────────────────────
    { id: 216, name: 'Embalagem para Pizza pedaço Liso',        price: 27.9, category: 'embalagens', group: 'fastfood', item: 'pizza-fatia', image: 'assets/Produtos/Fast Food/Pizza Fatia/Liso/Embalagem para Pizza pedaço Liso/Embalagem para Pizza pedaço Liso.png' },
    { id: 217, name: 'Embalagem para Pizza pedaço personalizada', price: 27.9, category: 'embalagens', group: 'fastfood', item: 'pizza-fatia', image: 'assets/Produtos/Fast Food/Pizza Fatia/Personalizar/Embalagem para Pizza pedaço personalizada/Embalagem para Pizza pedaço personalizada.png' },

    // ── FAST FOOD › Porção ──────────────────────────────────────────────────
    { id: 218, name: 'Caixa para Porções Liso',                  price: 32.9, category: 'embalagens', group: 'fastfood', item: 'porcao', image: 'assets/Produtos/Fast Food/Porção/Liso/Caixa para Porções Liso/Caixa para Porções Liso.png' },
    { id: 219, name: 'Embalagem Porção Balcão Liso',             price: 32.9, category: 'embalagens', group: 'fastfood', item: 'porcao', image: 'assets/Produtos/Fast Food/Porção/Liso/Embalagem Porção Balcão Liso/Embalagem Porção Balcão Liso.png' },
    { id: 220, name: 'Caixa Personalizada para Porção Delivery', price: 32.9, category: 'embalagens', group: 'fastfood', item: 'porcao', image: 'assets/Produtos/Fast Food/Porção/Personalizar/Caixa Personalizada para Porção Delivery/Caixa Personalizada para Porção Delivery.png' },

    // ── DOCES › Bolo Fatia ──────────────────────────────────────────────────
    { id: 301, name: 'Caixa para Bolo Fatia Liso',         price: 34.9, category: 'embalagens', group: 'doces', item: 'bolo-fatia', image: 'assets/Produtos/Doces/Bolo Fatia/Liso/Caixa para Bolo Fatia Liso/Caixa para Bolo Fatia Liso.png' },
    { id: 302, name: 'Caixa para Bolo Fatia Personalizar', price: 34.9, category: 'embalagens', group: 'doces', item: 'bolo-fatia', image: 'assets/Produtos/Doces/Bolo Fatia/Personalizar/Caixa para Bolo Fatia Personalizar/Caixa para Bolo Fatia Personalizar.png' },

    // ── DOCES › Bolo Fatia sem Berço ────────────────────────────────────────
    { id: 303, name: 'Caixa para Bolo Fatia sem berço Liso',         price: 34.9, category: 'embalagens', group: 'doces', item: 'bolo-fatia-sem-berco', image: 'assets/Produtos/Doces/Bolo Fatia sem Berço/Liso/Caixa para Bolo Fatia sem berço Liso/Caixa para Bolo Fatia sem berço Liso.png' },
    { id: 304, name: 'Caixa para Bolo Fatia sem berço Personalizar', price: 34.9, category: 'embalagens', group: 'doces', item: 'bolo-fatia-sem-berco', image: 'assets/Produtos/Doces/Bolo Fatia sem Berço/Personalizar/Caixa para Bolo Fatia sem berço Personalizar/Caixa para Bolo Fatia sem berço Personalizar.png' },

    // ── DOCES › Churros Delivery ────────────────────────────────────────────
    { id: 305, name: 'Embalagens para Churros Liso',         price: 29.9, category: 'embalagens', group: 'doces', item: 'churros-delivery', image: 'assets/Produtos/Doces/Churros Delivery/Liso/Embalagens para Churros Liso/Embalagens para Churros Liso.png' },
    { id: 306, name: 'Embalagens para Churros Personalizar', price: 29.9, category: 'embalagens', group: 'doces', item: 'churros-delivery', image: 'assets/Produtos/Doces/Churros Delivery/Personalizar/Embalagens para Churros Personalizar/Embalagens para Churros Personalizar.png' },

    // ── DOCES › Churros Mesa ────────────────────────────────────────────────
    { id: 307, name: 'Embalagens para Churros Mesa Lisa',         price: 29.9, category: 'embalagens', group: 'doces', item: 'churros-mesa', image: 'assets/Produtos/Doces/Churros Mesa/Liso/Embalagens para Churros Mesa Lisa/Embalagens para Churros Mesa Lisa.png' },
    { id: 308, name: 'Embalagens para Churros Mesa Personalizar', price: 29.9, category: 'embalagens', group: 'doces', item: 'churros-mesa', image: 'assets/Produtos/Doces/Churros Mesa/Personalizar/Embalagens para Churros Mesa Personalizar/Embalagens para Churros Mesa Personalizar.png' },

    // ── DOCES › Doces Diversos ──────────────────────────────────────────────
    { id: 309, name: 'Caixa para Doces Diversos Liso',         price: 34.9, category: 'embalagens', group: 'doces', item: 'doces-diversos', image: 'assets/Produtos/Doces/Doces Diversos/Liso/Caixa para Doces Diversos Liso/Caixa para Doces Diversos Liso.png' },
    { id: 310, name: 'Caixa para Doces Diversos Personalizar', price: 34.9, category: 'embalagens', group: 'doces', item: 'doces-diversos', image: 'assets/Produtos/Doces/Doces Diversos/Personalizar/Caixa para Doces Diversos Personalizar/Caixa para Doces Diversos Personalizar.png' },

    // ── DOCES › Doces Variados ──────────────────────────────────────────────
    { id: 311, name: 'Caixa para Doce Liso',         price: 34.9, category: 'embalagens', group: 'doces', item: 'doces-variados', image: 'assets/Produtos/Doces/Doces Variados/Liso/Caixa para Doce Liso/Caixa para Doce Liso.png' },
    { id: 312, name: 'Caixa para Doce Personalizar', price: 34.9, category: 'embalagens', group: 'doces', item: 'doces-variados', image: 'assets/Produtos/Doces/Doces Variados/Personalizar/Caixa para Doce Personalizar/Caixa para Doce Personalizar.png' },
  ];

  const labels = {
    category: { convites: 'Convites', embalagens: 'Embalagens' },
    group:    { oriental: 'Oriental', fastfood: 'Fast Food', doces: 'Doces' },
    item: {
      // Oriental
      combinado: 'Combinado', harumaki: 'Harumaki', sushi: 'Sushi', temaki: 'Temaki', yakissoba: 'Yakissoba',
      // Fast Food
      'batata-frita': 'Batata Frita', hamburguer: 'Hambúrguer', 'hot-dog': 'Hot Dog',
      pastel: 'Pastel', pizza: 'Pizza', 'pizza-fatia': 'Pizza Fatia', porcao: 'Porção',
      // Doces
      'bolo-fatia': 'Bolo Fatia', 'bolo-fatia-sem-berco': 'Bolo Fatia sem Berço',
      'churros-delivery': 'Churros Delivery', 'churros-mesa': 'Churros Mesa',
      'doces-diversos': 'Doces Diversos', 'doces-variados': 'Doces Variados',
    },
  };

  const itemOptionsByGroup = {
    oriental: ['combinado', 'harumaki', 'sushi', 'temaki', 'yakissoba'],
    fastfood: ['hamburguer', 'batata-frita', 'pastel', 'hot-dog', 'pizza', 'pizza-fatia', 'porcao'],
    doces:    ['bolo-fatia', 'bolo-fatia-sem-berco', 'churros-delivery', 'churros-mesa', 'doces-diversos', 'doces-variados'],
  };

  const modelOptionsByItem = {
    combinado: ['liso', 'especial', 'personalizar'],
  };

  const modelLabels = {
    liso: 'Liso', especial: 'Especial', personalizar: 'Personalizar',
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
    const productUrl = product.category === 'convites'
      ? `convite-product.html?id=${product.id}`
      : `product.html?id=${product.id}&group=${encodeURIComponent(product.group || '')}`;
    return `
      <article class="produto${product.category === 'convites' ? ' produto--convite' : ''}" data-price="${product.price}">
        <a href="${productUrl}">
          <div class="produto-img-wrap">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://placehold.co/220x180/fafafa/999?text=Produto'">
          </div>
        </a>
        <button class="wl-heart-btn" data-wishlist-id="${product.id}" data-product='${JSON.stringify({id:product.id,name:product.name,price:product.price,image:product.image,item:product.item,group:product.group})}' aria-label="Adicionar aos favoritos" type="button">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
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

    // Atualiza corações e liga evento de toggle
    if (window.WishlistStore) window.WishlistStore.initHearts();
    grid.querySelectorAll('.wl-heart-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const product = JSON.parse(this.dataset.product);
        const added = window.WishlistStore.toggle(product);
        this.classList.toggle('wl-active', added);
        this.setAttribute('aria-label', added ? 'Remover dos favoritos' : 'Adicionar aos favoritos');
      });
    });
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

  // ── Banner dinâmico ────────────────────────────────────────────────────────
  function applyBanner(level1) {
    const banner = document.getElementById('category-banner');
    if (!banner) return;
    if (level1 === 'convites') {
      banner.src = 'assets/banners/banner-Convites.png';
      banner.alt = 'Banner Convites';
    } else {
      banner.src = 'assets/banners/banner-embalagens.png';
      banner.alt = 'Banner Embalagens';
    }
  }

  // ── Logo dinâmica ──────────────────────────────────────────────────────────
  function applyLogo(level1) {
    const headerLogo     = document.querySelector('.logo img');
    const footerBrandLogo = document.querySelector('.footer-brand-logo img');
    if (level1 === 'convites') {
      if (footerBrandLogo) footerBrandLogo.src = 'assets/logo/logo-white-2.png';
    } else {
      if (footerBrandLogo) footerBrandLogo.src = 'assets/logo/logo-white-ULTRAPRESS.png';
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
    applyBanner(state.level1);
    apply(state);
  };

  applyLogo(state.level1);
  applyBanner(state.level1);
  apply(state);
});
