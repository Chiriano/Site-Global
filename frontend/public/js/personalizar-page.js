(function () {
  'use strict';

  // ============================================================
  // CONFIGURAÇÃO DAS PÁGINAS E MODELOS
  // ============================================================
  //
  // Como ajustar coordenadas de slots e textos:
  //   left, top, width, height → porcentagem da área de edição (0–100)
  //   Para textos:
  //     fontSize, fontSizeMin → porcentagem da ALTURA do editor (ex: 6 = 6% da altura)
  //   Para fotos:
  //     fade: true → aplica máscara de desvanecimento branco nas bordas (Página 1)
  //
  // Estrutura de pastas das imagens:
  //   assets/molduras-de-foto/pagina-1/1.png
  //   assets/molduras-de-foto/pagina-2/1.png, 2.png
  //   assets/molduras-de-foto/pagina-3/1.png, 2.png, 3.png, 4.png

  var PAGES = {

    // ── Página 1: foto com fade branco ──────────────────────
    1: {
      id: 1,
      name: 'Página 1',
      bgColor: '#f8f3ea',   // cor que aparece através do fade
      models: [
        {
          id: 'p1-m1',
          name: 'Foto com Fade',
          src: 'assets/molduras-de-foto/pagina-1/1.png',
          photos: [
            { key: 'foto1', left: 0, top: 0, width: 100, height: 100, fade: true }
          ],
          texts: []
        }
      ]
    },

    // ── Página 2: título + nome + bio + foto ─────────────────
    2: {
      id: 2,
      name: 'Página 2',
      bgColor: 'transparent',
      models: [
        {
          id: 'p2-m1',
          name: 'Foto Livre',
          src: 'assets/molduras-de-foto/pagina-2/1.png',
          photos: [
            { key: 'foto1', left: 52, top: 8, width: 43, height: 65 }
          ],
          texts: [
            {
              key: 'titulo',
              label: 'Título',
              left: 5, top: 8, width: 44, height: 14,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 7, fontSizeMin: 3,
              align: 'center', italic: true,
              maxChars: 50, placeholder: 'Nome / Título'
            },
            {
              key: 'nome',
              label: 'Nome Completo',
              left: 5, top: 24, width: 44, height: 7,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 3, fontSizeMin: 1.5,
              align: 'center', italic: false,
              maxChars: 80, placeholder: 'Nome Completo'
            },
            {
              key: 'bio',
              label: 'Biografia',
              left: 5, top: 34, width: 44, height: 42,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 2, fontSizeMin: 1,
              align: 'justify', italic: false, lineHeight: 1.5,
              maxChars: 600, placeholder: 'Escreva aqui a biografia...'
            }
          ]
        },
        {
          id: 'p2-m2',
          name: 'Com Moldura',
          src: 'assets/molduras-de-foto/pagina-2/2.png',
          photos: [
            { key: 'foto1', left: 53, top: 12, width: 40, height: 56 }
          ],
          texts: [
            {
              key: 'titulo',
              label: 'Título',
              left: 5, top: 8, width: 44, height: 14,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 7, fontSizeMin: 3,
              align: 'center', italic: true,
              maxChars: 50, placeholder: 'Nome / Título'
            },
            {
              key: 'nome',
              label: 'Nome Completo',
              left: 5, top: 24, width: 44, height: 7,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 3, fontSizeMin: 1.5,
              align: 'center', italic: false,
              maxChars: 80, placeholder: 'Nome Completo'
            },
            {
              key: 'bio',
              label: 'Biografia',
              left: 5, top: 34, width: 44, height: 42,
              fontFamily: "'Georgia', 'Times New Roman', serif",
              fontSize: 2, fontSizeMin: 1,
              align: 'justify', italic: false, lineHeight: 1.5,
              maxChars: 600, placeholder: 'Escreva aqui a biografia...'
            }
          ]
        }
      ]
    },

    // ── Página 3: molduras com layouts de foto ───────────────
    3: {
      id: 3,
      name: 'Página 3',
      bgColor: 'transparent',
      models: [
        {
          id: 'p3-m1',
          name: 'Modelo 1 · 1 foto',
          src: 'assets/molduras-de-foto/pagina-3/1.png',
          photos: [
            { key: 'foto1', left: 5, top: 8, width: 90, height: 83 }
          ],
          texts: []
        },
        {
          id: 'p3-m2',
          name: 'Modelo 2 · 2 fotos',
          src: 'assets/molduras-de-foto/pagina-3/2.png',
          photos: [
            { key: 'foto1', left: 3.0,  top: 7.7, width: 44.2, height: 84.5 },
            { key: 'foto2', left: 52.8, top: 7.7, width: 44.2, height: 84.5 }
          ],
          texts: []
        },
        {
          id: 'p3-m3',
          name: 'Modelo 3 · 3 fotos',
          src: 'assets/molduras-de-foto/pagina-3/3.png',
          photos: [
            { key: 'foto1', left: 5,  top: 8,  width: 44, height: 40 },
            { key: 'foto2', left: 5,  top: 51, width: 44, height: 40 },
            { key: 'foto3', left: 52, top: 8,  width: 43, height: 83 }
          ],
          texts: []
        },
        {
          id: 'p3-m4',
          name: 'Modelo 4 · 4 fotos',
          src: 'assets/molduras-de-foto/pagina-3/4.png',
          photos: [
            { key: 'foto1', left: 7.4,  top: 13.2, width: 39.0, height: 37.8 },
            { key: 'foto2', left: 47.7, top: 13.2, width: 39.0, height: 37.8 },
            { key: 'foto3', left: 7.4,  top: 52.5, width: 39.0, height: 37.8 },
            { key: 'foto4', left: 47.7, top: 52.5, width: 39.0, height: 37.8 }
          ],
          texts: []
        }
      ]
    }
  };

  // ============================================================
  // ESTADO DO EDITOR
  // ============================================================

  var state = {
    activePage:  1,
    // Modelo ativo por página  (ex: { 1: 'p1-m1', 2: 'p2-m1', 3: 'p3-m1' })
    activeModel: { 1: 'p1-m1', 2: 'p2-m1', 3: 'p3-m1' },
    // Slot ativo por página
    activeSlot:  { 1: 'foto1', 2: 'foto1', 3: 'foto1' },
    // Imagens: chave 'pageId:modelId:slotKey' → { src, naturalW, naturalH, scale, offsetX, offsetY }
    images: {},
    // Textos: chave 'pageId:textKey' → string
    texts: {},
    // Zoom da visualização do editor (não da foto)
    editorZoom: 1,
    // Estado do drag
    drag: {
      active:       false,
      moved:        false,   // true se o mouse se moveu mais que o threshold
      slotKey:      null,
      slotEl:       null,
      imgEl:        null,
      startClientX: 0,
      startClientY: 0,
      startOffsetX: 0,
      startOffsetY: 0
    }
  };

  // ============================================================
  // REFERÊNCIAS DOM
  // ============================================================

  var dom = {
    btnVoltar:        document.getElementById('btn-voltar'),
    btnAvancar:       document.getElementById('btn-avancar'),
    btnSalvar:        document.getElementById('btn-salvar'),
    btnZoomIn:        document.getElementById('btn-zoom-in'),
    btnZoomOut:       document.getElementById('btn-zoom-out'),
    btnZoomReset:     document.getElementById('btn-zoom-reset'),
    btnCenter:        document.getElementById('btn-center'),
    btnFill:          document.getElementById('btn-fill'),
    btnReset:         document.getElementById('btn-reset'),
    zoomVal:          document.getElementById('zoom-val'),
    modelGrid:        document.getElementById('model-grid'),
    slotSelect:       document.getElementById('slot-select'),
    slotSelectorWrap: document.getElementById('slot-selector-wrap'),
    fotoInput:        document.getElementById('foto-input'),
    photoActions:     document.getElementById('photo-actions'),
    textsForm:        document.getElementById('texts-form'),
    sectionTexts:     document.getElementById('section-texts'),
    sectionFoto:      document.getElementById('section-foto'),
    pageSubtitle:     document.getElementById('page-subtitle'),
    canvasStage:      document.getElementById('canvas-stage'),
    editorWrap:       document.getElementById('editor-wrap'),
    bgLayer:          document.getElementById('bg-layer'),
    slotsLayer:       document.getElementById('slots-layer'),
    textsLayer:       document.getElementById('texts-layer'),
    molduraLayer:     document.getElementById('moldura-layer'),
    canvasHint:       document.getElementById('canvas-hint'),
    toastArea:        document.getElementById('toast-area'),
    pageNav:          document.getElementById('page-nav')
  };

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================

  function init() {
    // Link "Voltar" baseado no ?id= da URL
    var params    = new URLSearchParams(window.location.search);
    var productId = params.get('id') || '';
    dom.btnVoltar.href = 'convite-product.html' + (productId ? '?id=' + encodeURIComponent(productId) : '');

    renderAll();
    bindEvents();
  }

  // ============================================================
  // RENDERIZAÇÃO
  // ============================================================

  /** Renderização completa (usado na inicialização) */
  function renderAll() {
    updateSubtitle();
    renderPageNav();
    renderModelGrid();
    renderMoldura();
    renderBgLayer();
    renderSlots();
    renderTextsLayer();
    renderTextsForm();
    renderSlotSelect();
    renderLeftPanelVisibility();
    renderEditorZoom();
  }

  /** Atualiza ao trocar de página */
  function renderPageSwitch() {
    updateSubtitle();
    renderPageNav();
    renderModelGrid();
    renderMoldura();
    renderBgLayer();
    renderSlots();
    renderTextsLayer();
    renderTextsForm();
    renderSlotSelect();
    renderLeftPanelVisibility();
  }

  /** Atualiza ao trocar de modelo dentro da página */
  function renderModelSwitch() {
    renderModelGrid();
    renderMoldura();
    renderSlots();
    renderTextsLayer();
    renderSlotSelect();
  }

  function updateSubtitle() {
    var page = PAGES[state.activePage];
    dom.pageSubtitle.textContent = 'Editando: ' + page.name;
  }

  function renderPageNav() {
    dom.pageNav.querySelectorAll('[data-page]').forEach(function (btn) {
      var p = parseInt(btn.getAttribute('data-page'), 10);
      btn.classList.toggle('is-active', p === state.activePage);
    });
  }

  function renderModelGrid() {
    var page         = PAGES[state.activePage];
    var activeModelId = curModelId();
    dom.modelGrid.innerHTML = page.models.map(function (model) {
      var active = model.id === activeModelId;
      return '<button class="pz-model-card' + (active ? ' is-active' : '') + '"' +
        ' data-model-id="' + esc(model.id) + '" type="button">' +
        '<img src="' + esc(model.src) + '" alt="' + esc(model.name) + '" loading="lazy">' +
        '<span>' + esc(model.name) + '</span>' +
        '</button>';
    }).join('');
  }

  function renderMoldura() {
    var model = curModel();
    dom.molduraLayer.innerHTML = '';
    var img = document.createElement('img');
    img.src = model.src;
    img.alt = model.name || 'Moldura';
    img.onerror = function () {
      console.warn('[personalizar] Moldura não encontrada:', model.src);
    };
    dom.molduraLayer.appendChild(img);
  }

  function renderBgLayer() {
    var page = PAGES[state.activePage];
    dom.bgLayer.style.background = page.bgColor || 'transparent';
  }

  function renderSlots() {
    var model      = curModel();
    var activeSlotKey = state.activeSlot[state.activePage];
    dom.slotsLayer.innerHTML = '';

    (model.photos || []).forEach(function (slot) {
      var slotEl = document.createElement('div');
      slotEl.className = 'photo-slot' +
        (slot.fade         ? ' slot-fade'     : '') +
        (slot.key === activeSlotKey ? ' is-active-slot' : '');
      slotEl.setAttribute('data-slot', slot.key);
      slotEl.style.cssText =
        'left:'   + slot.left   + '%;' +
        'top:'    + slot.top    + '%;' +
        'width:'  + slot.width  + '%;' +
        'height:' + slot.height + '%;';

      // Slots de moldura não exibem borda de seleção dourada
      slotEl.classList.add('no-border');

      // Inserir no DOM antes de aplicar a foto (precisamos das dimensões reais)
      dom.slotsLayer.appendChild(slotEl);

      // Restaurar foto se já existir no estado
      var imgState = getImageState(state.activePage, curModelId(), slot.key);
      if (imgState) {
        renderPhotoInSlot(slotEl, slot.key, imgState);
      }

      bindSlotEvents(slotEl, slot.key);
    });
  }

  function renderSlotSelect() {
    var model      = curModel();
    var photos     = model.photos || [];
    var currentKey = state.activeSlot[state.activePage];

    dom.slotSelect.innerHTML = photos.map(function (slot, index) {
      return '<option value="' + esc(slot.key) + '">Quadro ' + (index + 1) + '</option>';
    }).join('');

    // Mostrar o seletor somente quando houver mais de 1 quadro
    dom.slotSelectorWrap.hidden = photos.length <= 1;

    if (photos.some(function (s) { return s.key === currentKey; })) {
      dom.slotSelect.value = currentKey;
    } else if (photos.length) {
      dom.slotSelect.selectedIndex = 0;
      state.activeSlot[state.activePage] = photos[0].key;
    }
  }

  function renderLeftPanelVisibility() {
    var model    = curModel();
    var hasTexts = model.texts && model.texts.length > 0;
    dom.sectionTexts.hidden = !hasTexts;
  }

  function renderEditorZoom() {
    dom.editorWrap.style.transform = 'scale(' + state.editorZoom.toFixed(2) + ')';
    dom.zoomVal.textContent = Math.round(state.editorZoom * 100) + '%';
  }

  // ── Textos no preview ──────────────────────────────────────

  function renderTextsLayer() {
    var model = curModel();
    dom.textsLayer.innerHTML = '';

    if (!model.texts || !model.texts.length) {
      dom.textsLayer.hidden = true;
      return;
    }

    dom.textsLayer.hidden = false;
    var editorH = dom.editorWrap.offsetHeight || 1;

    model.texts.forEach(function (txt) {
      var el = document.createElement('div');
      el.className = 'text-block';
      el.setAttribute('data-text-key', txt.key);
      el.style.cssText =
        'left:'        + txt.left   + '%;' +
        'top:'         + txt.top    + '%;' +
        'width:'       + txt.width  + '%;' +
        'height:'      + txt.height + '%;' +
        'font-family:' + txt.fontFamily + ';' +
        'text-align:'  + (txt.align || 'left') + ';' +
        'font-style:'  + (txt.italic ? 'italic' : 'normal') + ';' +
        'line-height:' + (txt.lineHeight || 1.2) + ';' +
        'overflow:hidden;';

      var content = state.texts[textStateKey(state.activePage, txt.key)] || '';
      el.textContent = content;
      dom.textsLayer.appendChild(el);

      // Ajustar tamanho da fonte para caber no bloco
      applyTextFontSize(el, txt, editorH);
    });
  }

  function renderTextsForm() {
    var model = curModel();
    dom.textsForm.innerHTML = '';
    if (!model.texts || !model.texts.length) return;

    model.texts.forEach(function (txt) {
      var value = state.texts[textStateKey(state.activePage, txt.key)] || '';

      var label = document.createElement('label');
      label.className = 'pz-label';
      label.setAttribute('for', 'txt-' + txt.key);
      label.textContent = txt.label;

      var ta = document.createElement('textarea');
      ta.id          = 'txt-' + txt.key;
      ta.className   = 'pz-textarea';
      ta.setAttribute('data-text-key', txt.key);
      ta.maxLength   = txt.maxChars || 600;
      ta.placeholder = txt.placeholder || '';
      ta.value       = value;
      ta.rows        = txt.key === 'bio' ? 5 : 2;

      var counter = document.createElement('span');
      counter.className   = 'pz-char-counter';
      counter.textContent = value.length + ' / ' + (txt.maxChars || 600);

      dom.textsForm.appendChild(label);
      dom.textsForm.appendChild(ta);
      dom.textsForm.appendChild(counter);

      // Fechar sobre txtConfig, ta, counter
      (function (txtConfig, textarea, cnt) {
        textarea.addEventListener('input', function () {
          var v = textarea.value;
          state.texts[textStateKey(state.activePage, txtConfig.key)] = v;
          cnt.textContent = v.length + ' / ' + (txtConfig.maxChars || 600);
          updateTextBlockInPreview(txtConfig.key);
        });
      }(txt, ta, counter));
    });
  }

  // ── Auto-fit de texto ──────────────────────────────────────

  /**
   * Aplica font-size no elemento de texto do preview.
   * Começa no máximo e reduz gradualmente até o texto caber no bloco.
   */
  function applyTextFontSize(el, txtConf, editorH) {
    var maxPx = editorH * (txtConf.fontSize    / 100);
    var minPx = editorH * (txtConf.fontSizeMin / 100);
    var size  = maxPx;
    el.style.fontSize = size + 'px';

    // Reduz até caber — limite mínimo para não quebrar o layout
    while (size > minPx && el.scrollHeight > el.offsetHeight) {
      size -= 0.5;
      el.style.fontSize = size + 'px';
    }
  }

  function updateTextBlockInPreview(textKey) {
    var el = dom.textsLayer.querySelector('[data-text-key="' + textKey + '"]');
    if (!el) return;

    var value   = state.texts[textStateKey(state.activePage, textKey)] || '';
    el.textContent = value;

    var model   = curModel();
    var txtConf = null;
    for (var i = 0; i < model.texts.length; i++) {
      if (model.texts[i].key === textKey) { txtConf = model.texts[i]; break; }
    }
    if (!txtConf) return;

    var editorH = dom.editorWrap.offsetHeight || 1;
    applyTextFontSize(el, txtConf, editorH);
  }

  // ============================================================
  // FOTO: RENDERIZAÇÃO E TRANSFORM
  // ============================================================

  /**
   * Cria ou atualiza o elemento <img> dentro do slot e aplica o transform.
   * Se o slot ainda não tiver dimensões calculadas, adia via rAF.
   */
  function renderPhotoInSlot(slotEl, slotKey, imgState) {
    var isFade = slotEl.classList.contains('slot-fade');
    var imgEl  = slotEl.querySelector('.foto-img');
    if (!imgEl) {
      imgEl           = document.createElement('img');
      imgEl.className = 'foto-img' + (isFade ? ' img-fade' : '');
      imgEl.draggable = false;
      slotEl.appendChild(imgEl);
    }
    imgEl.src = imgState.src;

    if (slotEl.offsetWidth > 0 && slotEl.offsetHeight > 0) {
      applyPhotoTransform(slotEl, imgEl, imgState);
    } else {
      // Layout ainda não calculado — aguardar próximo frame
      requestAnimationFrame(function () {
        applyPhotoTransform(slotEl, imgEl, imgState);
      });
    }
  }

  /**
   * Calcula e aplica o posicionamento da imagem no slot.
   * Usa cover-fit como base: a imagem sempre preenche o slot.
   * O usuário pode aplicar zoom (scale) e offset via arraste.
   */
  function applyPhotoTransform(slotEl, imgEl, imgState) {
    var slotW = slotEl.offsetWidth;
    var slotH = slotEl.offsetHeight;
    if (!slotW || !slotH || !imgState.naturalW || !imgState.naturalH) return;

    // Cover-fit base: escala mínima para cobrir o slot
    var baseScale  = Math.max(slotW / imgState.naturalW, slotH / imgState.naturalH);
    var totalScale = baseScale * imgState.scale;

    var imgW = imgState.naturalW * totalScale;
    var imgH = imgState.naturalH * totalScale;

    // Centralizar + offset do usuário
    var x = (slotW - imgW) / 2 + imgState.offsetX;
    var y = (slotH - imgH) / 2 + imgState.offsetY;

    // Clamp: impede que a imagem deixe bordas vazias
    x = Math.max(Math.min(x, 0), slotW - imgW);
    y = Math.max(Math.min(y, 0), slotH - imgH);

    // Salvar offset clampeado de volta
    imgState.offsetX = x - (slotW - imgW) / 2;
    imgState.offsetY = y - (slotH - imgH) / 2;

    imgEl.style.left   = Math.round(x) + 'px';
    imgEl.style.top    = Math.round(y) + 'px';
    imgEl.style.width  = Math.round(imgW) + 'px';
    imgEl.style.height = Math.round(imgH) + 'px';
  }

  // ── Ações sobre a foto ativa ───────────────────────────────

  function getActiveImgState() {
    var slotKey = state.activeSlot[state.activePage];
    return slotKey ? getImageState(state.activePage, curModelId(), slotKey) : null;
  }

  function centerActivePhoto() {
    var imgState = getActiveImgState();
    if (!imgState) return;
    imgState.offsetX = 0;
    imgState.offsetY = 0;
    refreshActiveSlotTransform(imgState);
  }

  function fillActivePhoto() {
    var imgState = getActiveImgState();
    if (!imgState) return;
    imgState.scale   = Math.min(imgState.scale * 1.25, 4.0);
    imgState.offsetX = 0;
    imgState.offsetY = 0;
    refreshActiveSlotTransform(imgState);
  }

  function resetActivePhoto() {
    var imgState = getActiveImgState();
    if (!imgState) return;
    imgState.scale   = 1.0;
    imgState.offsetX = 0;
    imgState.offsetY = 0;
    refreshActiveSlotTransform(imgState);
  }

  function refreshActiveSlotTransform(imgState) {
    var slotKey = state.activeSlot[state.activePage];
    var slotEl  = findSlotEl(slotKey);
    var imgEl   = slotEl && slotEl.querySelector('.foto-img');
    if (slotEl && imgEl) applyPhotoTransform(slotEl, imgEl, imgState);
  }

  // ============================================================
  // UPLOAD DE ARQUIVO
  // ============================================================

  function onFileChange(event) {
    console.log('[upload] change disparado');

    var file = event.target.files && event.target.files[0];
    if (!file) { console.warn('[upload] Nenhum arquivo selecionado'); return; }
    console.log('[upload] Arquivo:', file.name, Math.round(file.size / 1024) + 'KB');

    // Capturar contexto ANTES de qualquer async ou reset do input
    var pageId  = state.activePage;
    var modelId = curModelId();
    var model   = curModel();

    // Garantir que há um quadro ativo — auto-selecionar o primeiro se necessário
    var slotKey = state.activeSlot[pageId];
    if (!slotKey && model.photos && model.photos.length) {
      slotKey = model.photos[0].key;
      state.activeSlot[pageId] = slotKey;
      console.log('[upload] Auto-selecionado quadro:', slotKey);
    }
    if (!slotKey) {
      console.warn('[upload] Nenhum quadro disponível na página', pageId);
      return;
    }
    console.log('[upload] Quadro:', slotKey, '| Página:', pageId, '| Modelo:', modelId);

    // Criar URL ANTES de limpar o input (evita invalidação em alguns browsers)
    var objectUrl = URL.createObjectURL(file);
    event.target.value = ''; // reset para permitir re-seleção do mesmo arquivo
    console.log('[upload] URL criada:', objectUrl);

    var tmpImg    = new Image();
    tmpImg.onload = function () {
      console.log('[upload] Imagem carregada:', tmpImg.naturalWidth + 'x' + tmpImg.naturalHeight);

      var imgState = {
        src:      objectUrl,
        naturalW: tmpImg.naturalWidth,
        naturalH: tmpImg.naturalHeight,
        scale:    1.0,
        offsetX:  0,
        offsetY:  0
      };

      setImageState(pageId, modelId, slotKey, imgState);
      console.log('[upload] Estado salvo — chave:', imageStateKey(pageId, modelId, slotKey));

      var slotEl = findSlotEl(slotKey);
      if (!slotEl) {
        console.error('[upload] Slot não encontrado no DOM para key:', slotKey);
        // Tentar re-renderizar os slots e aplicar de novo
        renderSlots();
        slotEl = findSlotEl(slotKey);
        if (!slotEl) { toast('Erro: quadro não encontrado.', true); return; }
      }

      console.log('[upload] Aplicando foto no slot:', slotKey,
        '| offsetWidth:', slotEl.offsetWidth, '| offsetHeight:', slotEl.offsetHeight);
      renderPhotoInSlot(slotEl, slotKey, imgState);
      if (dom.canvasHint) dom.canvasHint.hidden = false;
    };

    tmpImg.onerror = function () {
      console.error('[upload] Falha ao carregar blob URL:', objectUrl);
      URL.revokeObjectURL(objectUrl);
      toast('Erro ao carregar imagem.', true);
    };

    tmpImg.src = objectUrl;
  }

  // ============================================================
  // DRAG & ZOOM NOS SLOTS
  // ============================================================

  var DRAG_THRESHOLD = 5; // pixels mínimos para considerar como drag

  function bindSlotEvents(slotEl, slotKey) {
    // ── Mouse ──────────────────────────────────────────────
    slotEl.addEventListener('mousedown', function (e) {
      // Sempre resetar moved para que o click posterior funcione corretamente
      state.drag.moved = false;
      var imgState = getImageState(state.activePage, curModelId(), slotKey);
      if (!imgState) return;
      e.preventDefault();
      state.drag.active       = true;
      state.drag.slotKey      = slotKey;
      state.drag.slotEl       = slotEl;
      state.drag.imgEl        = slotEl.querySelector('.foto-img');
      state.drag.startClientX = e.clientX;
      state.drag.startClientY = e.clientY;
      state.drag.startOffsetX = imgState.offsetX;
      state.drag.startOffsetY = imgState.offsetY;
    });

    slotEl.addEventListener('click', function () {
      // Não abrir file picker se foi um drag real
      if (state.drag.moved) { state.drag.moved = false; return; }
      setActiveSlot(slotKey);
      dom.fotoInput.click();
    });

    // ── Wheel (zoom da foto) ───────────────────────────────
    slotEl.addEventListener('wheel', function (e) {
      e.preventDefault();
      var imgState = getImageState(state.activePage, curModelId(), slotKey);
      if (!imgState) return;
      var delta        = e.deltaY > 0 ? -0.06 : 0.06;
      imgState.scale   = Math.max(1.0, Math.min(4.0, imgState.scale + delta));
      var imgEl        = slotEl.querySelector('.foto-img');
      if (imgEl) applyPhotoTransform(slotEl, imgEl, imgState);
    }, { passive: false });

    // ── Touch ──────────────────────────────────────────────
    slotEl.addEventListener('touchstart', function (e) {
      if (e.touches.length !== 1) return;
      state.drag.moved = false;
      var imgState = getImageState(state.activePage, curModelId(), slotKey);
      if (!imgState) return;
      e.preventDefault();
      var t = e.touches[0];
      state.drag.active       = true;
      state.drag.slotKey      = slotKey;
      state.drag.slotEl       = slotEl;
      state.drag.imgEl        = slotEl.querySelector('.foto-img');
      state.drag.startClientX = t.clientX;
      state.drag.startClientY = t.clientY;
      state.drag.startOffsetX = imgState.offsetX;
      state.drag.startOffsetY = imgState.offsetY;
    }, { passive: false });

    slotEl.addEventListener('touchmove', function (e) {
      if (!state.drag.active || e.touches.length !== 1) return;
      e.preventDefault();
      var t = e.touches[0];
      moveDrag(t.clientX, t.clientY);
    }, { passive: false });

    slotEl.addEventListener('touchend', function () {
      state.drag.active = false;
    });
  }

  function moveDrag(clientX, clientY) {
    if (!state.drag.active || !state.drag.slotKey) return;

    var dx = clientX - state.drag.startClientX;
    var dy = clientY - state.drag.startClientY;

    // Marcar como drag real se passou do threshold
    if (!state.drag.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      state.drag.moved = true;
    }
    if (!state.drag.moved) return;

    var imgState = getImageState(state.activePage, curModelId(), state.drag.slotKey);
    if (!imgState || !state.drag.imgEl) return;

    imgState.offsetX = state.drag.startOffsetX + dx;
    imgState.offsetY = state.drag.startOffsetY + dy;
    applyPhotoTransform(state.drag.slotEl, state.drag.imgEl, imgState);
  }

  // ============================================================
  // EVENTOS GLOBAIS
  // ============================================================

  function bindEvents() {
    // Upload
    dom.fotoInput.addEventListener('change', onFileChange);

    // Grid de modelos
    dom.modelGrid.addEventListener('click', function (e) {
      var card = e.target.closest('[data-model-id]');
      if (!card) return;
      var newId = card.getAttribute('data-model-id');
      if (newId === curModelId()) return;
      state.activeModel[state.activePage] = newId;
      var firstSlot = curModel().photos && curModel().photos[0];
      state.activeSlot[state.activePage] = firstSlot ? firstSlot.key : 'foto1';
      renderModelSwitch();
    });

    // Seletor de quadro
    dom.slotSelect.addEventListener('change', function () {
      setActiveSlot(dom.slotSelect.value);
    });

    // Navegação entre páginas
    dom.pageNav.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-page]');
      if (!btn) return;
      var pageNum = parseInt(btn.getAttribute('data-page'), 10);
      if (pageNum === state.activePage) return;
      state.activePage = pageNum;
      renderPageSwitch();
    });

    // Ações de foto
    dom.btnCenter.addEventListener('click', centerActivePhoto);
    dom.btnFill.addEventListener('click',   fillActivePhoto);
    dom.btnReset.addEventListener('click',  resetActivePhoto);

    // Zoom do editor
    dom.btnZoomIn.addEventListener('click', function () {
      state.editorZoom = Math.min(2.5, +(state.editorZoom + 0.1).toFixed(2));
      renderEditorZoom();
    });
    dom.btnZoomOut.addEventListener('click', function () {
      state.editorZoom = Math.max(0.3, +(state.editorZoom - 0.1).toFixed(2));
      renderEditorZoom();
    });
    dom.btnZoomReset.addEventListener('click', function () {
      state.editorZoom = 1;
      renderEditorZoom();
    });

    // Salvar
    dom.btnSalvar.addEventListener('click', function () {
      toast('Personalização salva!');
    });

    // Avançar
    dom.btnAvancar.addEventListener('click', function () {
      var params = new URLSearchParams(window.location.search);
      var productId = params.get('id') || '';
      window.location.href = 'visualizar.html' + (productId ? '?id=' + encodeURIComponent(productId) : '');
    });

    // Mouse global: drag e release
    document.addEventListener('mousemove', function (e) {
      moveDrag(e.clientX, e.clientY);
    });
    document.addEventListener('mouseup', function () {
      state.drag.active = false;
    });

    // Teclado: Esc sai do modo de ajuste
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && dom.canvasHint) {
        dom.canvasHint.hidden = true;
      }
    });

    // Resize: re-aplicar transforms e textos
    window.addEventListener('resize', function () {
      var model = curModel();
      // Re-aplicar foto transforms
      (model.photos || []).forEach(function (slot) {
        var imgState = getImageState(state.activePage, curModelId(), slot.key);
        if (!imgState) return;
        var slotEl = findSlotEl(slot.key);
        var imgEl  = slotEl && slotEl.querySelector('.foto-img');
        if (slotEl && imgEl) applyPhotoTransform(slotEl, imgEl, imgState);
      });
      // Re-aplicar tamanhos de texto
      if (!dom.textsLayer.hidden) {
        var editorH = dom.editorWrap.offsetHeight || 1;
        dom.textsLayer.querySelectorAll('.text-block').forEach(function (el) {
          var key     = el.getAttribute('data-text-key');
          var txtConf = null;
          for (var i = 0; i < model.texts.length; i++) {
            if (model.texts[i].key === key) { txtConf = model.texts[i]; break; }
          }
          if (txtConf) applyTextFontSize(el, txtConf, editorH);
        });
      }
    });
  }

  // ============================================================
  // HELPERS
  // ============================================================

  function curModelId() {
    return state.activeModel[state.activePage];
  }

  function curModel() {
    var page = PAGES[state.activePage];
    var id   = curModelId();
    for (var i = 0; i < page.models.length; i++) {
      if (page.models[i].id === id) return page.models[i];
    }
    return page.models[0];
  }

  function findSlotEl(slotKey) {
    return dom.slotsLayer.querySelector('[data-slot="' + slotKey + '"]');
  }

  function setActiveSlot(slotKey) {
    state.activeSlot[state.activePage] = slotKey;
    dom.slotsLayer.querySelectorAll('.photo-slot').forEach(function (el) {
      el.classList.toggle('is-active-slot', el.getAttribute('data-slot') === slotKey);
    });
    dom.slotSelect.value = slotKey;
  }

  function imageStateKey(pageId, modelId, slotKey) {
    return pageId + ':' + modelId + ':' + slotKey;
  }

  function textStateKey(pageId, textKey) {
    return pageId + ':' + textKey;
  }

  function getImageState(pageId, modelId, slotKey) {
    return state.images[imageStateKey(pageId, modelId, slotKey)] || null;
  }

  function setImageState(pageId, modelId, slotKey, imgState) {
    state.images[imageStateKey(pageId, modelId, slotKey)] = imgState;
  }

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function toast(message, isError) {
    if (!dom.toastArea) return;
    var el       = document.createElement('div');
    el.className = 'pz-toast' + (isError ? ' is-error' : '');
    el.textContent = message;
    dom.toastArea.appendChild(el);
    setTimeout(function () { el.remove(); }, 2200);
  }

  // ============================================================
  init();
})();
