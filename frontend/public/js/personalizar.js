/* ============================================================================
   Alpha Convites — Editor de Personalização (Fabric.js)
   Sistema multipágina com miniaturas inferiores e exportação PDF
   ============================================================================ */

(function () {
  'use strict';

  var CANVAS_W = 1181;
  var CANVAS_H = 866;
  var INITIAL_PAGE_ID = 'page1';
  var PAGE_ORDER = ['page1', 'page2', 'page3'];
  var STAGE_FIT = {
    paddingX: 26,
    paddingY: 20,
    offsetX: 0,
    offsetY: -8,
    pageScale: {
      page1: 1.04,
      page2: 1.03,
      page3: 0.96
    }
  };

  var UI_LIMITS = {
    titulo: { min: 12, max: 60 },
    parents: { min: 12, max: 30 },
    bio: { min: 12, max: 45 },
    subtitulo: { min: 12, max: 30 }
  };

  var PANEL_SECTIONS = {
    upload: {
      title: 'Upload',
      sub: 'Envie e troque imagens do convite a partir da seção ativa.'
    },
    pages: {
      title: 'Páginas',
      sub: 'Navegue pelos modelos e alterne rapidamente entre as páginas do convite.'
    },
    text: {
      title: 'Texto',
      sub: 'Edite títulos, nomes e mensagem principal da página atual.'
    },
    export: {
      title: 'Exportar',
      sub: 'Finalize o convite e baixe o PDF com as páginas na ordem configurada.'
    }
  };

  var state = {
    canvas: null,
    pages: {},
    pageOrder: [],
    activePageId: INITIAL_PAGE_ID,
    cropSession: null,
    activePanelSection: null
  };

  var el = {};

  // ---- History (undo/redo for page1 text edits) ----
  var editHistory = [];
  var editHistoryIndex = -1;
  var MAX_HISTORY = 60;

  // The text object currently selected/being edited
  var activeTextObject = null;

  // Reusable probe for measureTextHeight — avoids allocating a new Textbox per call
  var _measureProbe = null;
  // Timer for debounced thumbnail updates during typing
  var _thumbDebounceTimer = null;
  // Timer for debounced font-size recalculation during body text input
  var _bodyFitTimer = null;
  var BODY_CHAR_LIMIT = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function getRegistry() {
    return window.AlphaConvitesPageTemplates || {};
  }

  function getShared() {
    return window.AlphaConvitesTemplateShared || {};
  }

  function getPage(pageId) {
    return state.pages[pageId] || null;
  }

  function getActivePage() {
    return getPage(state.activePageId);
  }

  function hasSelectablePhotoSlot(page) {
    return !!(page && page.data && page.data.selectedSlotId);
  }

  function getSlotState(pageId, slotId) {
    var page = getPage(pageId);
    return page && page.data && page.data.photoSlots ? page.data.photoSlots[slotId] : null;
  }

  function isCropActive() {
    return !!(state.cropSession && state.cropSession.pageId === state.activePageId);
  }

  function clearCropFlags(page) {
    if (!page || !page.data || !page.data.photoSlots) return;
    Object.keys(page.data.photoSlots).forEach(function (slotId) {
      var slot = page.data.photoSlots[slotId];
      if (!slot.crop) {
        slot.crop = { offsetX: 0, offsetY: 0, zoom: 1, isCropping: false };
      }
      slot.crop.isCropping = false;
    });
  }

  function setCropMode(pageId, slotId, enabled) {
    var page = getPage(pageId);
    var slot = getSlotState(pageId, slotId);

    if (!page || !slot) return;

    clearCropFlags(page);
    if (!slot.crop) {
      slot.crop = { offsetX: 0, offsetY: 0, zoom: 1, isCropping: false };
    }
    slot.crop.isCropping = !!enabled;
    state.cropSession = enabled ? { pageId: pageId, slotId: slotId } : null;

    if (state.activePageId === pageId) {
      renderActivePage();
    }
    updateSingleThumbnail(pageId);
  }

  // ---- History helpers ----

  function snapshotPage1() {
    var page = getPage('page1');
    if (!page) return null;
    return {
      title: page.data.title,
      subtitle: page.data.subtitle,
      parents: page.data.parents,
      body: page.data.body,
      titleFontSize: page.data.titleFontSize,
      parentsFontSize: page.data.parentsFontSize,
      bodyFontSize: page.data.bodyFontSize,
      // per-text styling (stored in refs because page.data doesn't hold them yet)
      titleStyle: activeTextObject && activeTextObject.name === 'page1-title'
        ? { fontWeight: activeTextObject.fontWeight, fontStyle: activeTextObject.fontStyle, underline: activeTextObject.underline, textAlign: activeTextObject.textAlign, lineHeight: activeTextObject.lineHeight }
        : null,
      subtitleStyle: activeTextObject && activeTextObject.name === 'page1-subtitle'
        ? { fontWeight: activeTextObject.fontWeight, fontStyle: activeTextObject.fontStyle, underline: activeTextObject.underline, textAlign: activeTextObject.textAlign, lineHeight: activeTextObject.lineHeight }
        : null,
      bodyStyle: activeTextObject && activeTextObject.name === 'page1-body'
        ? { fontWeight: activeTextObject.fontWeight, fontStyle: activeTextObject.fontStyle, underline: activeTextObject.underline, textAlign: activeTextObject.textAlign, lineHeight: activeTextObject.lineHeight }
        : null
    };
  }

  function pushEditHistory() {
    var snap = snapshotPage1();
    if (!snap) return;
    // Discard redo branch
    if (editHistoryIndex < editHistory.length - 1) {
      editHistory.splice(editHistoryIndex + 1);
    }
    editHistory.push(snap);
    if (editHistory.length > MAX_HISTORY) editHistory.shift();
    else editHistoryIndex += 1;
  }

  function applyEditSnapshot(snap) {
    var page = getPage('page1');
    var refs;
    if (!page || !snap) return;

    page.data.title = snap.title;
    page.data.subtitle = snap.subtitle;
    page.data.parents = snap.parents;
    page.data.body = snap.body;
    page.data.titleFontSize = snap.titleFontSize;
    page.data.parentsFontSize = snap.parentsFontSize;
    page.data.bodyFontSize = snap.bodyFontSize;

    if (state.activePageId === 'page1') {
      renderActivePage();
      refs = getEditablePage1ObjectMap();
      // Restore per-object styles after rebuild
      if (refs && snap.titleStyle && refs.title) {
        refs.title.set(snap.titleStyle);
        refs.title.initDimensions();
      }
      if (refs && snap.subtitleStyle && refs.subtitle) {
        refs.subtitle.set(snap.subtitleStyle);
        refs.subtitle.initDimensions();
      }
      if (refs && snap.bodyStyle && refs.body) {
        refs.body.set(snap.bodyStyle);
        refs.body.initDimensions();
      }
      state.canvas && state.canvas.renderAll();
    }
    syncSidebarControls();
    updateSingleThumbnail('page1');
  }

  function undoEdit() {
    if (editHistoryIndex <= 0) return;
    editHistoryIndex -= 1;
    applyEditSnapshot(editHistory[editHistoryIndex]);
  }

  function redoEdit() {
    if (editHistoryIndex >= editHistory.length - 1) return;
    editHistoryIndex += 1;
    applyEditSnapshot(editHistory[editHistoryIndex]);
  }

  // ---- Toolbar helpers ----

  function getTextLimitsFor(obj) {
    if (!obj) return { min: 8, max: 120 };
    if (obj.dataKey === 'title') return UI_LIMITS.titulo;
    if (obj.dataKey === 'parents') return UI_LIMITS.parents;
    if (obj.dataKey === 'body') return UI_LIMITS.bio;
    return { min: 8, max: 120 };
  }

  function positionTextToolbar(obj) {
    if (!el.textToolbar || !state.canvas) return;
    var canvasEl = state.canvas.getElement();
    var canvasRect = canvasEl.getBoundingClientRect();
    var bound = obj.getBoundingRect(true, true);
    var vt = state.canvas.viewportTransform;
    var zoom = vt ? vt[0] : 1;
    var objScreenLeft = canvasRect.left + bound.left * zoom;
    var objScreenTop = canvasRect.top + bound.top * zoom;
    var toolbarH = el.textToolbar.offsetHeight || 40;
    var gap = 8;
    var topPos = objScreenTop - toolbarH - gap;

    // If it would go above the viewport, put it below the object instead
    if (topPos < 4) {
      topPos = canvasRect.top + (bound.top + bound.height) * zoom + gap;
    }

    // Clamp horizontally so it stays within window
    var toolbarW = el.textToolbar.offsetWidth || 460;
    var leftPos = Math.max(4, Math.min(window.innerWidth - toolbarW - 4, objScreenLeft));

    el.textToolbar.style.top = topPos + 'px';
    el.textToolbar.style.left = leftPos + 'px';
  }

  function updateTextToolbarState(obj) {
    if (!el.textToolbar || !obj) return;

    var limits = getTextLimitsFor(obj);
    var fontSize = Math.round(obj.fontSize || 16);

    if (el.ttbFontSize) {
      el.ttbFontSize.min = limits.min;
      el.ttbFontSize.max = limits.max;
      el.ttbFontSize.value = clamp(fontSize, limits.min, limits.max);
    }
    if (el.ttbLineHeight) {
      el.ttbLineHeight.value = (obj.lineHeight || 1.2).toFixed(1);
    }
    if (el.ttbBold) {
      el.ttbBold.setAttribute('aria-pressed', obj.fontWeight === 'bold' ? 'true' : 'false');
    }
    if (el.ttbItalic) {
      el.ttbItalic.setAttribute('aria-pressed', obj.fontStyle === 'italic' ? 'true' : 'false');
    }
    if (el.ttbUnderline) {
      el.ttbUnderline.setAttribute('aria-pressed', obj.underline ? 'true' : 'false');
    }
    var align = obj.textAlign || 'left';
    if (el.ttbAlignLeft)   el.ttbAlignLeft.setAttribute('aria-pressed', align === 'left'   ? 'true' : 'false');
    if (el.ttbAlignCenter) el.ttbAlignCenter.setAttribute('aria-pressed', align === 'center' ? 'true' : 'false');
    if (el.ttbAlignRight)  el.ttbAlignRight.setAttribute('aria-pressed', align === 'right'  ? 'true' : 'false');
  }

  function showTextToolbar(obj) {
    if (!el.textToolbar || !obj) return;
    activeTextObject = obj;
    el.textToolbar.hidden = false;
    updateTextToolbarState(obj);
    updateBodyCounter(obj);
    positionTextToolbar(obj);
  }

  function hideTextToolbar() {
    if (!el.textToolbar) return;
    el.textToolbar.hidden = true;
    updateBodyCounter(null);
    activeTextObject = null;
  }

  function applyToolbarFontSize(value) {
    var obj = activeTextObject;
    var page = getPage('page1');
    if (!obj || !page) return;

    var limits = getTextLimitsFor(obj);
    var size = clamp(parseInt(value, 10) || limits.min, limits.min, limits.max);

    if (obj.dataKey === 'title') {
      page.data.titleFontSize = size;
      obj.set('fontSize', size);
      obj.initDimensions();
      obj.setCoords();
      if (el.titleRange) el.titleRange.value = size;
      if (el.titleNumber) el.titleNumber.value = size;
    } else if (obj.dataKey === 'parents') {
      page.data.parentsFontSize = size;
      obj.set('fontSize', size);
      obj.initDimensions();
      obj.setCoords();
    } else if (obj.dataKey === 'body') {
      page.data.bodyFontSize = size;
      var fit = getPage1BodyFit(page.data.body, size);
      applyBodyLayout(obj, fit);
      if (el.bioRange) el.bioRange.value = size;
      if (el.bioNumber) el.bioNumber.value = size;
    } else {
      obj.set('fontSize', size);
      obj.initDimensions();
      obj.setCoords();
    }

    if (el.ttbFontSize) el.ttbFontSize.value = size;
    state.canvas && state.canvas.renderAll();
    updateSingleThumbnail('page1');
  }

  function applyToolbarLineHeight(value) {
    var obj = activeTextObject;
    if (!obj) return;
    var lh = Math.max(0.8, Math.min(3, parseFloat(value) || 1.2));
    obj.set('lineHeight', lh);
    obj.initDimensions();
    obj.setCoords();
    if (el.ttbLineHeight) el.ttbLineHeight.value = lh.toFixed(1);
    state.canvas && state.canvas.renderAll();
    updateSingleThumbnail('page1');
  }

  function applyToolbarBold() {
    var obj = activeTextObject;
    if (!obj) return;
    var next = obj.fontWeight === 'bold' ? 'normal' : 'bold';
    obj.set('fontWeight', next);
    obj.initDimensions();
    obj.setCoords();
    if (el.ttbBold) el.ttbBold.setAttribute('aria-pressed', next === 'bold' ? 'true' : 'false');
    state.canvas && state.canvas.renderAll();
    updateSingleThumbnail('page1');
  }

  function applyToolbarItalic() {
    var obj = activeTextObject;
    if (!obj) return;
    var next = obj.fontStyle === 'italic' ? 'normal' : 'italic';
    obj.set('fontStyle', next);
    obj.initDimensions();
    obj.setCoords();
    if (el.ttbItalic) el.ttbItalic.setAttribute('aria-pressed', next === 'italic' ? 'true' : 'false');
    state.canvas && state.canvas.renderAll();
    updateSingleThumbnail('page1');
  }

  function applyToolbarUnderline() {
    var obj = activeTextObject;
    if (!obj) return;
    var next = !obj.underline;
    obj.set('underline', next);
    obj.initDimensions();
    obj.setCoords();
    if (el.ttbUnderline) el.ttbUnderline.setAttribute('aria-pressed', next ? 'true' : 'false');
    state.canvas && state.canvas.renderAll();
    updateSingleThumbnail('page1');
  }

  function applyToolbarAlign(align) {
    var obj = activeTextObject;
    if (!obj) return;
    obj.set('textAlign', align);
    obj.initDimensions();
    obj.setCoords();
    if (el.ttbAlignLeft)   el.ttbAlignLeft.setAttribute('aria-pressed', align === 'left'   ? 'true' : 'false');
    if (el.ttbAlignCenter) el.ttbAlignCenter.setAttribute('aria-pressed', align === 'center' ? 'true' : 'false');
    if (el.ttbAlignRight)  el.ttbAlignRight.setAttribute('aria-pressed', align === 'right'  ? 'true' : 'false');
    state.canvas && state.canvas.renderAll();
    updateSingleThumbnail('page1');
  }

  function measureTextHeight(text, cfg) {
    if (!_measureProbe) {
      _measureProbe = new fabric.Textbox(text || '', {
        width: cfg.width,
        fontSize: cfg.fontSize,
        lineHeight: cfg.lineHeight,
        fontFamily: cfg.fontFamily,
        fontWeight: cfg.fontWeight || 'normal',
        splitByGrapheme: true,
        textAlign: cfg.textAlign || 'left'
      });
    } else {
      _measureProbe.set({
        text: text || '',
        width: cfg.width,
        fontSize: cfg.fontSize,
        lineHeight: cfg.lineHeight,
        fontFamily: cfg.fontFamily,
        fontWeight: cfg.fontWeight || 'normal',
        textAlign: cfg.textAlign || 'left'
      });
    }
    _measureProbe.initDimensions();
    return _measureProbe.calcTextHeight();
  }

  function debounceThumbnail(pageId) {
    clearTimeout(_thumbDebounceTimer);
    _thumbDebounceTimer = setTimeout(function () {
      updateSingleThumbnail(pageId);
    }, 350);
  }

  // Quick single-measurement check: does `text` fit in the body box at `fontSize`?
  // Costs exactly 1 measureTextHeight call — used to skip full fitTextToBox loops.
  function quickBodyFits(text, fontSize) {
    return measureTextHeight(text, {
      width: 418,
      fontSize: fontSize,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fontWeight: '400',
      textAlign: 'left'
    }) <= 508;
  }

  function trimTextToBox(text, cfg) {
    var normalized = text || '';
    while (normalized && measureTextHeight(normalized, cfg) > cfg.height) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  }

  function fitTextToBox(cfg) {
    var size;
    var measuredCfg = {
      width: cfg.width,
      height: cfg.height,
      lineHeight: cfg.lineHeight,
      fontFamily: cfg.fontFamily,
      fontWeight: cfg.fontWeight,
      textAlign: cfg.textAlign
    };

    for (size = cfg.maxFontSize; size >= cfg.minFontSize; size -= 1) {
      measuredCfg.fontSize = size;
      if (measureTextHeight(cfg.text, measuredCfg) <= cfg.height) {
        return {
          fontSize: size,
          text: cfg.text
        };
      }
    }

    measuredCfg.fontSize = cfg.minFontSize;
    return {
      fontSize: cfg.minFontSize,
      text: trimTextToBox(cfg.text, measuredCfg)
    };
  }

  function createPageMap() {
    var registry = getRegistry();
    var order = PAGE_ORDER.filter(function (pageId) {
      return !!registry[pageId];
    });
    var pages = {};

    order.forEach(function (pageId) {
      var template = registry[pageId];
      pages[pageId] = {
        id: pageId,
        template: template,
        refs: {},
        data: template.createState()
      };
    });

    state.pages = pages;
    state.pageOrder = order;
    if (!pages[state.activePageId]) {
      state.activePageId = order[0] || null;
    }
  }

  function getCanvasApi(canvas, page, refs) {
    return {
      fabric: fabric,
      canvas: canvas,
      refs: refs,
      page: page,
      size: {
        width: CANVAS_W,
        height: CANVAS_H
      },
      selectedSlotId: page.data.selectedSlotId,
      clamp: clamp,
      fitTextToBox: fitTextToBox,
      shared: getShared()
    };
  }

  function buildPage(canvas, page, refs) {
    refs = refs || {};
    canvas.clear();
    page.refs = refs;
    page.template.build(getCanvasApi(canvas, page, refs));
    canvas.renderAll();
  }

  function getStageBounds() {
    if (!el.canvasArea) {
      return {
        width: CANVAS_W,
        height: CANVAS_H
      };
    }

    return {
      width: Math.max(el.canvasArea.clientWidth, 320),
      height: Math.max(el.canvasArea.clientHeight, 320)
    };
  }

  function applyStageViewport(pageId) {
    var pageScale = STAGE_FIT.pageScale[pageId] || 1;
    var bounds = getStageBounds();
    var usableWidth = Math.max(bounds.width - (STAGE_FIT.paddingX * 2), 160);
    var usableHeight = Math.max(bounds.height - (STAGE_FIT.paddingY * 2), 160);
    var fitZoom = Math.min(usableWidth / CANVAS_W, usableHeight / CANVAS_H);
    var zoom = fitZoom * pageScale;
    var scaledWidth = CANVAS_W * zoom;
    var scaledHeight = CANVAS_H * zoom;
    var offsetX = Math.round((bounds.width - scaledWidth) / 2 + STAGE_FIT.offsetX);
    var offsetY = Math.round((bounds.height - scaledHeight) / 2 + STAGE_FIT.offsetY);

    if (!state.canvas) return;

    state.canvas.setDimensions({
      width: bounds.width,
      height: bounds.height
    });
    state.canvas.setViewportTransform([zoom, 0, 0, zoom, offsetX, offsetY]);
    state.canvas.calcOffset();
    state.canvas.requestRenderAll();
  }

  function getEditablePage1ObjectMap() {
    var page = getPage('page1');
    return page ? page.refs : null;
  }

  function getPage1BodyFit(text, maxFontSize) {
    return fitTextToBox({
      text: text,
      width: 418,
      height: 508,
      maxFontSize: clamp(maxFontSize, 12, 45),
      minFontSize: 12,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fontWeight: '400',
      textAlign: 'left'
    });
  }

  function computeBodyCharLimit() {
    var sample = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. ';
    var seed = '';
    var cfg = {
      width: 418,
      height: 508,
      fontSize: 12,
      lineHeight: 1.2,
      fontFamily: 'Georgia, serif',
      fontWeight: '400',
      textAlign: 'left'
    };

    while (seed.length < 2500) {
      seed += sample;
    }

    return trimTextToBox(seed, cfg).length;
  }

  function updateBodyCounter(obj) {
    if (!el.bodyCounter || !el.bodyCounterCurrent || !el.bodyCounterLimit) return;

    if (!obj || obj.dataKey !== 'body') {
      el.bodyCounter.hidden = true;
      if (el.bodyCounterSep) el.bodyCounterSep.hidden = true;
      return;
    }

    el.bodyCounter.hidden = false;
    if (el.bodyCounterSep) el.bodyCounterSep.hidden = false;
    el.bodyCounterCurrent.textContent = String((obj.text || '').length);
    el.bodyCounterLimit.textContent = String(BODY_CHAR_LIMIT || 0);
  }

  function preparePageAssets() {
    var shared = getShared();

    state.pageOrder.forEach(function (pageId) {
      var page = getPage(pageId);
      var bg = page && page.data ? page.data.templateBackground : null;

      if (!bg || !bg.src || bg.element || !shared.buildPhotoElement) return;

      bg.element = shared.buildPhotoElement(bg.src);

      if (!bg.element || bg.element.complete) {
        return;
      }

      bg.element.onload = function () {
        if (state.activePageId === pageId) {
          renderActivePage();
        }
        updateSingleThumbnail(pageId);
      };
    });
  }

  function applyBodyLayout(textbox, fit) {
    if (!textbox || !fit) return;
    textbox.set({
      text: fit.text,
      fontSize: fit.fontSize,
      lineHeight: 1.2
    });
    textbox.initDimensions();
    textbox.setCoords();
  }

  function syncPage1Object(field) {
    var page = getPage('page1');
    var refs = getEditablePage1ObjectMap();
    var fit;

    if (!page || !refs) return;

    if (field === 'title' && refs.title) {
      refs.title.set('text', page.data.title || 'Nome Destaque');
      refs.title.initDimensions();
      refs.title.setCoords();
    }

    if (field === 'subtitle' && refs.subtitle) {
      refs.subtitle.set('text', page.data.subtitle || 'Curso · Data de Formatura');
      refs.subtitle.initDimensions();
      refs.subtitle.setCoords();
    }

    if (field === 'parents' && refs.parents) {
      refs.parents.set('text', page.data.parents || 'Nome do Pai\nNome da Mãe');
      refs.parents.initDimensions();
      refs.parents.setCoords();
    }

    if (field === 'parentsFontSize' && refs.parents) {
      refs.parents.set('fontSize', clamp(page.data.parentsFontSize, UI_LIMITS.parents.min, UI_LIMITS.parents.max));
      refs.parents.initDimensions();
      refs.parents.setCoords();
    }

    if (field === 'body' && refs.body) {
      fit = getPage1BodyFit(page.data.body || '', page.data.bodyFontSize);
      applyBodyLayout(refs.body, fit);
    }

    if (field === 'titleFontSize' && refs.title) {
      refs.title.set('fontSize', clamp(page.data.titleFontSize, UI_LIMITS.titulo.min, UI_LIMITS.titulo.max));
      refs.title.initDimensions();
      refs.title.setCoords();
    }

    if (field === 'bodyFontSize' && refs.body) {
      fit = getPage1BodyFit(page.data.body || '', page.data.bodyFontSize);
      applyBodyLayout(refs.body, fit);
    }

    if (state.activePageId === 'page1' && state.canvas) {
      applyStageViewport('page1');
      state.canvas.renderAll();
    }
  }

  function renderActivePage() {
    var page = getActivePage();
    if (!page || !state.canvas) return;
    buildPage(state.canvas, page, {});
    applyStageViewport(page.id);
    updateWorkspaceStatus();
    syncSidebarControls();
    syncPageButtons();
  }

  function updateWorkspaceStatus() {
    var page = getActivePage();
    if (el.canvasDims) {
      el.canvasDims.textContent = CANVAS_W + ' × ' + CANVAS_H + ' px';
    }
    if (el.pageStatus && page) {
      el.pageStatus.textContent = page.template.label + ' ativa';
    }
    if (el.slotStatus && page) {
      if (hasSelectablePhotoSlot(page)) {
        el.slotStatus.textContent = 'Upload direcionado para ' + page.data.selectedSlotId;
      } else {
        el.slotStatus.textContent = 'Esta página ainda não possui área de foto editável';
      }
    }
  }

  function syncPhotoPreview() {
    var page = getActivePage();
    var slotId = page && page.data ? page.data.selectedSlotId : '';
    var slot = page && slotId && page.data.photoSlots ? page.data.photoSlots[slotId] : null;
    var hasImage = !!(slot && slot.src);

    if (el.photoPreviewWrap) {
      el.photoPreviewWrap.hidden = !hasImage;
    }
    if (el.photoUpload) {
      el.photoUpload.hidden = hasImage;
    }
    if (el.photoPreviewImg && hasImage) {
      el.photoPreviewImg.src = slot.src;
    }
  }

  function syncSidebarControls() {
    var page = getActivePage();
    var isTextPage = !!(page && page.id === 'page1');
    var titleValue = isTextPage ? page.data.title : '';
    var subtitleValue = isTextPage ? page.data.subtitle : '';
    var parentsValue = isTextPage ? page.data.parents : '';
    var bodyValue = isTextPage ? page.data.body : '';
    var titleSize = isTextPage ? page.data.titleFontSize : UI_LIMITS.titulo.min;
    var bodySize = isTextPage ? page.data.bodyFontSize : UI_LIMITS.bio.max;

    if (el.inputNome) {
      el.inputNome.value = titleValue;
      el.inputNome.disabled = !isTextPage;
    }
    if (el.inputBio) {
      el.inputBio.value = bodyValue;
      el.inputBio.disabled = !isTextPage;
    }
    if (el.inputCurso) {
      el.inputCurso.value = subtitleValue;
      el.inputCurso.disabled = !isTextPage;
    }
    if (el.inputParents) {
      el.inputParents.value = parentsValue;
      el.inputParents.disabled = !isTextPage;
    }
    if (el.titleRange) {
      el.titleRange.value = titleSize;
      el.titleRange.disabled = !isTextPage;
    }
    if (el.titleNumber) {
      el.titleNumber.value = titleSize;
      el.titleNumber.disabled = !isTextPage;
    }
    if (el.bioRange) {
      el.bioRange.value = bodySize;
      el.bioRange.disabled = !isTextPage;
    }
    if (el.bioNumber) {
      el.bioNumber.value = bodySize;
      el.bioNumber.disabled = !isTextPage;
    }

    if (el.textSectionHint) {
      el.textSectionHint.textContent = isTextPage
        ? 'Página 1 com título e caixa principal ativos.'
        : 'Os controles de texto ficam reservados para a Página 1.';
    }

    if (el.uploadTargetHint) {
      if (page && hasSelectablePhotoSlot(page)) {
        el.uploadTargetHint.textContent = 'Foto selecionada: ' + page.data.selectedSlotId;
      } else {
        el.uploadTargetHint.textContent = 'Selecione uma página com slot de foto para enviar imagens.';
      }
    }

    syncPhotoPreview();
    updateBodyCounter(activeTextObject);
  }

  function updatePanelUI() {
    var sectionId = state.activePanelSection;
    var sectionMeta = sectionId ? PANEL_SECTIONS[sectionId] : null;

    if (el.editorLayout) {
      el.editorLayout.classList.toggle('is-panel-open', !!sectionId);
    }

    if (el.panelShell) {
      el.panelShell.hidden = !sectionId;
    }

    if (el.panelTitle) {
      el.panelTitle.textContent = sectionMeta ? sectionMeta.title : '';
    }

    if (el.panelSub) {
      el.panelSub.textContent = sectionMeta ? sectionMeta.sub : '';
    }

    Array.prototype.forEach.call(el.panelRailItems || [], function (button) {
      var isActive = button.getAttribute('data-panel-toggle') === sectionId;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    });

    Array.prototype.forEach.call(el.panelSections || [], function (section) {
      section.hidden = section.getAttribute('data-panel-section') !== sectionId;
    });
  }

  function togglePanelSection(sectionId) {
    state.activePanelSection = state.activePanelSection === sectionId ? null : sectionId;
    updatePanelUI();
    if (state.canvas && state.activePageId) {
      setTimeout(function () {
        applyStageViewport(state.activePageId);
      }, 10);
    }
  }

  function setPageButtonState(container, activeId, attr) {
    if (!container) return;
    Array.prototype.forEach.call(container.querySelectorAll('[' + attr + ']'), function (button) {
      button.classList.toggle('is-active', button.getAttribute(attr) === activeId);
    });
  }

  function syncPageButtons() {
    setPageButtonState(document, state.activePageId, 'data-page');
  }

  function switchPage(pageId) {
    if (!state.pages[pageId] || state.activePageId === pageId) return;
    if (isCropActive()) {
      setCropMode(state.cropSession.pageId, state.cropSession.slotId, false);
    }
    state.activePageId = pageId;
    renderActivePage();
    renderThumbnailStrip();
  }

  function updateTextPage(field, value) {
    var page = getPage('page1');
    if (!page) return;
    page.data[field] = value;
    if (state.activePageId === 'page1') {
      syncPage1Object(field);
      updateSingleThumbnail('page1');
    } else {
      updateSingleThumbnail('page1');
    }
  }

  function updateTextPageSize(field, value) {
    var page = getPage('page1');
    if (!page) return;
    page.data[field] = value;
    if (state.activePageId === 'page1') {
      syncPage1Object(field);
      updateSingleThumbnail('page1');
    } else {
      updateSingleThumbnail('page1');
    }
  }

  function setPageSlotSource(pageId, slotId, src) {
    var page = getPage(pageId);
    var slot = page && page.data.photoSlots ? page.data.photoSlots[slotId] : null;
    var shared = getShared();
    if (!slot) return;

    function refreshAfterLoad() {
      if (state.activePageId === pageId) {
        renderActivePage();
        renderThumbnailStrip();
      } else {
        updateSingleThumbnail(pageId);
      }
    }

    slot.src = src;
    slot.element = shared.buildPhotoElement ? shared.buildPhotoElement(src) : null;
    slot.crop = {
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
      isCropping: false
    };

    if (!slot.element) {
      refreshAfterLoad();
      return;
    }

    if (slot.element.complete) {
      refreshAfterLoad();
      return;
    }

    slot.element.onload = refreshAfterLoad;
  }

  function handlePhotoFile(file) {
    var reader = new FileReader();
    var page = getActivePage();
    var targetSlotId = page && page.data ? page.data.selectedSlotId : '';

    if (!page || !targetSlotId) return;

    reader.onload = function (evt) {
      var src = evt.target.result;
      if (el.photoPreviewImg) el.photoPreviewImg.src = src;
      if (el.photoPreviewWrap) el.photoPreviewWrap.hidden = false;
      if (el.photoUpload) el.photoUpload.hidden = true;
      setPageSlotSource(page.id, targetSlotId, src);
    };

    reader.readAsDataURL(file);
  }

  function renderPageImage(pageId, multiplier) {
    var page = getPage(pageId);
    var tmpCanvas;
    var dataUrl;

    if (!page) return '';

    tmpCanvas = new fabric.StaticCanvas(null, {
      width: CANVAS_W,
      height: CANVAS_H,
      enableRetinaScaling: false
    });

    buildPage(tmpCanvas, page, {});
    dataUrl = tmpCanvas.toDataURL({
      format: 'png',
      multiplier: multiplier || 1
    });

    tmpCanvas.dispose();
    return dataUrl;
  }

  function renderThumbnailStrip() {
    if (!el.pageStripList) return;

    el.pageStripList.innerHTML = '';

    state.pageOrder.forEach(function (pageId, index) {
      var page = getPage(pageId);
      var button = document.createElement('button');
      var preview = document.createElement('span');
      var previewImg = document.createElement('img');
      var meta = document.createElement('span');
      var title = document.createElement('strong');
      var subtitle = document.createElement('small');

      button.type = 'button';
      button.className = 'page-thumb' + (pageId === state.activePageId ? ' is-active' : '');
      button.setAttribute('data-page', pageId);
      button.addEventListener('click', function () {
        switchPage(pageId);
      });

      preview.className = 'page-thumb__preview';
      previewImg.src = renderPageImage(pageId, 0.22);
      previewImg.alt = page.template.label;
      preview.appendChild(previewImg);

      meta.className = 'page-thumb__meta';
      title.textContent = 'Página ' + (index + 1);
      subtitle.textContent = page.template.thumbLabel;
      meta.appendChild(title);
      meta.appendChild(subtitle);

      button.appendChild(preview);
      button.appendChild(meta);
      el.pageStripList.appendChild(button);
    });
  }

  function updateSingleThumbnail(pageId) {
    if (!el.pageStripList) return;
    var node = el.pageStripList.querySelector('[data-page="' + pageId + '"] img');
    if (node) node.src = renderPageImage(pageId, 0.22);
  }

  function exportPDF() {
    var jsPDF = window.jspdf && window.jspdf.jsPDF;
    var doc;

    if (!jsPDF) return;

    doc = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [CANVAS_W, CANVAS_H]
    });

    state.pageOrder.forEach(function (pageId, index) {
      var image = renderPageImage(pageId, 1);
      if (index > 0) doc.addPage([CANVAS_W, CANVAS_H], 'landscape');
      doc.addImage(image, 'PNG', 0, 0, CANVAS_W, CANVAS_H);
    });

    doc.save('alpha-convite.pdf');
  }

  function bindToolbarEvents() {
    // Prevent canvas from losing focus when clicking toolbar controls
    function preventDefault(evt) { evt.preventDefault(); }

    [el.ttbBold, el.ttbItalic, el.ttbUnderline,
     el.ttbAlignLeft, el.ttbAlignCenter, el.ttbAlignRight,
     el.ttbFontDec, el.ttbFontInc, el.ttbUndo, el.ttbRedo
    ].forEach(function (btn) {
      if (btn) btn.addEventListener('mousedown', preventDefault);
    });

    if (el.ttbFontDec) {
      el.ttbFontDec.addEventListener('click', function () {
        var cur = parseInt(el.ttbFontSize ? el.ttbFontSize.value : 16, 10) || 16;
        applyToolbarFontSize(cur - 1);
      });
    }

    if (el.ttbFontInc) {
      el.ttbFontInc.addEventListener('click', function () {
        var cur = parseInt(el.ttbFontSize ? el.ttbFontSize.value : 16, 10) || 16;
        applyToolbarFontSize(cur + 1);
      });
    }

    if (el.ttbFontSize) {
      el.ttbFontSize.addEventListener('change', function () {
        applyToolbarFontSize(this.value);
      });
      el.ttbFontSize.addEventListener('mousedown', preventDefault);
    }

    if (el.ttbLineHeight) {
      el.ttbLineHeight.addEventListener('change', function () {
        applyToolbarLineHeight(this.value);
      });
      el.ttbLineHeight.addEventListener('mousedown', preventDefault);
    }

    if (el.ttbBold)        el.ttbBold.addEventListener('click', applyToolbarBold);
    if (el.ttbItalic)      el.ttbItalic.addEventListener('click', applyToolbarItalic);
    if (el.ttbUnderline)   el.ttbUnderline.addEventListener('click', applyToolbarUnderline);
    if (el.ttbAlignLeft)   el.ttbAlignLeft.addEventListener('click', function () { applyToolbarAlign('left'); });
    if (el.ttbAlignCenter) el.ttbAlignCenter.addEventListener('click', function () { applyToolbarAlign('center'); });
    if (el.ttbAlignRight)  el.ttbAlignRight.addEventListener('click', function () { applyToolbarAlign('right'); });

    if (el.ttbUndo) el.ttbUndo.addEventListener('click', undoEdit);
    if (el.ttbRedo) el.ttbRedo.addEventListener('click', redoEdit);
  }

  function bindPanelEvents() {
    Array.prototype.forEach.call(el.panelRailItems || [], function (button) {
      button.addEventListener('click', function () {
        togglePanelSection(this.getAttribute('data-panel-toggle'));
      });
    });
  }

  function bindSidebarEvents() {
    if (el.inputNome) {
      el.inputNome.addEventListener('input', function () {
        updateTextPage('title', this.value.slice(0, 36) || 'Nome Destaque');
      });
    }

    if (el.inputCurso) {
      el.inputCurso.addEventListener('input', function () {
        updateTextPage('subtitle', this.value.slice(0, 58) || 'Curso · Data de Formatura');
      });
    }

    if (el.inputParents) {
      el.inputParents.addEventListener('input', function () {
        updateTextPage('parents', this.value.slice(0, 120) || 'Nome do Pai\nNome da Mãe');
      });
    }

    if (el.inputBio) {
      el.inputBio.addEventListener('input', function () {
        updateTextPage('body', this.value);
      });
    }

    function bindRangePair(rangeEl, numberEl, limits, handler) {
      function sync(value) {
        var normalized = clamp(parseInt(value, 10) || limits.min, limits.min, limits.max);
        rangeEl.value = normalized;
        numberEl.value = normalized;
        handler(normalized);
      }

      if (rangeEl) {
        rangeEl.addEventListener('input', function () {
          sync(this.value);
        });
      }

      if (numberEl) {
        numberEl.addEventListener('input', function () {
          sync(this.value);
        });
      }
    }

    bindRangePair(el.titleRange, el.titleNumber, UI_LIMITS.titulo, function (value) {
      updateTextPageSize('titleFontSize', value);
    });

    bindRangePair(el.bioRange, el.bioNumber, UI_LIMITS.bio, function (value) {
      updateTextPageSize('bodyFontSize', value);
    });

    Array.prototype.forEach.call(document.querySelectorAll('[data-page]'), function (button) {
      button.addEventListener('click', function () {
        switchPage(this.getAttribute('data-page'));
      });
    });

    function openPicker() {
      if (el.fotoInput) el.fotoInput.click();
    }

    if (el.photoUpload) {
      el.photoUpload.addEventListener('click', openPicker);
      el.photoUpload.addEventListener('keydown', function (evt) {
        if (evt.key === 'Enter' || evt.key === ' ') {
          evt.preventDefault();
          openPicker();
        }
      });

      ['dragenter', 'dragover'].forEach(function (eventName) {
        el.photoUpload.addEventListener(eventName, function (evt) {
          evt.preventDefault();
          el.photoUpload.classList.add('is-dragover');
        });
      });

      ['dragleave', 'drop'].forEach(function (eventName) {
        el.photoUpload.addEventListener(eventName, function (evt) {
          evt.preventDefault();
          el.photoUpload.classList.remove('is-dragover');
        });
      });

      el.photoUpload.addEventListener('drop', function (evt) {
        var file = evt.dataTransfer && evt.dataTransfer.files && evt.dataTransfer.files[0];
        if (file) handlePhotoFile(file);
      });
    }

    if (el.btnPhotoChange) {
      el.btnPhotoChange.addEventListener('click', openPicker);
    }

    if (el.fotoInput) {
      el.fotoInput.addEventListener('change', function (evt) {
        var file = evt.target.files && evt.target.files[0];
        if (!file) return;
        evt.target.value = '';
        handlePhotoFile(file);
      });
    }

    if (el.btnDownload) {
      el.btnDownload.addEventListener('click', exportPDF);
    }

    if (el.btnHeaderDownload) {
      el.btnHeaderDownload.addEventListener('click', exportPDF);
    }
  }

  function bindCanvasEvents() {
    state.canvas.on('mouse:dblclick', function (evt) {
      var target = evt.target;
      var page = getActivePage();
      var slot;

      if (!page || !target || !target.slotId || !target.photoSlot) return;

      slot = getSlotState(page.id, target.slotId);
      if (!slot || !slot.src) return;

      setCropMode(page.id, target.slotId, true);
    });

    state.canvas.on('text:changed', function (evt) {
      var target = evt.target;
      var page;

      if (!target || target.pageId !== 'page1' || !target.dataKey) return;

      page = getPage('page1');
      if (!page) return;

      if (target.dataKey === 'title') {
        page.data.title = (target.text || '').slice(0, 36) || 'Nome Destaque';
        if (target.text !== page.data.title) {
          target.set('text', page.data.title);
        }
        if (el.inputNome) el.inputNome.value = page.data.title;
      }

      if (target.dataKey === 'subtitle') {
        page.data.subtitle = (target.text || '').slice(0, 58) || 'Curso · Data de Formatura';
        if (target.text !== page.data.subtitle) {
          target.set('text', page.data.subtitle);
        }
        if (el.inputCurso) el.inputCurso.value = page.data.subtitle;
      }

      if (target.dataKey === 'parents') {
        page.data.parents = (target.text || '').slice(0, 120) || 'Nome do Pai\nNome da Mãe';
        if (target.text !== page.data.parents) {
          target.set('text', page.data.parents);
          target.initDimensions();
          target.setCoords();
        }
        target.set('fontSize', clamp(target.fontSize || page.data.parentsFontSize || 18, UI_LIMITS.parents.min, UI_LIMITS.parents.max));
        page.data.parentsFontSize = clamp(target.fontSize || page.data.parentsFontSize || 18, UI_LIMITS.parents.min, UI_LIMITS.parents.max);
        if (el.inputParents) el.inputParents.value = page.data.parents;
      }

      if (target.dataKey === 'body') {
        var newText = target.text || '';
        var curSize = target.fontSize || 12;
        var previousText = page.data.body || '';

        clearTimeout(_bodyFitTimer);

        if (newText.length > BODY_CHAR_LIMIT && newText.length > previousText.length) {
          target.set('text', previousText);
          target.initDimensions();
          target.setCoords();
          if (el.inputBio) el.inputBio.value = previousText;
          updateBodyCounter(target);
          state.canvas.requestRenderAll();
          return;
        }

        if (quickBodyFits(newText, curSize)) {
          // Caso 1 — cabe no tamanho atual: aceitar sem recalcular fonte.
          // Debounce 200ms para checar se a fonte pode crescer (usuário apagou texto).
          page.data.body = newText;
          if (el.inputBio) el.inputBio.value = newText;
          _bodyFitTimer = setTimeout(function () {
            var p = getPage('page1');
            var obj = activeTextObject;
            if (!p || !obj || obj.name !== 'page1-body') return;
            var fit = getPage1BodyFit(p.data.body, p.data.bodyFontSize);
            if (fit.fontSize !== obj.fontSize) {
              applyBodyLayout(obj, fit);
              state.canvas && state.canvas.requestRenderAll();
            }
          }, 200);

        } else if (!quickBodyFits(newText, 12)) {
          // Caso 3 — não cabe nem na fonte mínima: reverter imediatamente.
          // Font já está correta no objeto (último estado válido); apenas reseta o texto.
          target.set('text', page.data.body);
          target.initDimensions();
          target.setCoords();
          if (el.inputBio) el.inputBio.value = page.data.body;
          updateBodyCounter(target);

        } else {
          // Caso 2 — ultrapassa fonte atual mas cabe em 12: debounce 150ms para recalcular.
          // O clipPath esconde o overflow visual durante a espera.
          _bodyFitTimer = setTimeout(function () {
            var p = getPage('page1');
            var obj = activeTextObject;
            if (!p || !obj || obj.name !== 'page1-body') return;
            var latestText = obj.text || '';
            var fit = getPage1BodyFit(latestText, p.data.bodyFontSize);
            if (fit.text === latestText) {
              p.data.body = latestText;
              applyBodyLayout(obj, fit);
              if (el.inputBio) el.inputBio.value = p.data.body;
            } else {
              // Texto acumulado no buffer ainda não cabe: reverter
              obj.set('text', p.data.body);
              obj.initDimensions();
              obj.setCoords();
              if (el.inputBio) el.inputBio.value = p.data.body;
            }
            state.canvas && state.canvas.requestRenderAll();
            updateBodyCounter(obj);
          }, 150);
        }
        updateBodyCounter(target);
      } else {
        target.initDimensions();
        target.setCoords();
      }

      state.canvas.requestRenderAll();
      debounceThumbnail('page1');
    });

    state.canvas.on('selection:created', function (evt) {
      var target = evt.selected && evt.selected[0];
      if (target && target.pageId === 'page1' && target.dataKey) {
        showTextToolbar(target);
      } else {
        hideTextToolbar();
      }
    });

    state.canvas.on('selection:updated', function (evt) {
      var target = evt.selected && evt.selected[0];
      if (target && target.pageId === 'page1' && target.dataKey) {
        showTextToolbar(target);
      } else {
        hideTextToolbar();
      }
    });

    state.canvas.on('selection:cleared', function () {
      hideTextToolbar();
    });

    state.canvas.on('text:editing:entered', function (evt) {
      var target = evt.target;
      if (target && target.pageId === 'page1' && target.dataKey) {
        showTextToolbar(target);
      }
    });

    state.canvas.on('text:editing:exited', function (evt) {
      var target = evt.target;
      if (!target || target.pageId !== 'page1' || !target.dataKey) return;
      pushEditHistory();
      syncSidebarControls();
      updateSingleThumbnail('page1');
      // Keep toolbar visible while the object remains selected
      if (activeTextObject === target) {
        updateTextToolbarState(target);
      }
    });

    state.canvas.on('object:moving', function (evt) {
      var target = evt.target;
      var page;
      var slot;
      var shared;

      if (!target || !target.photoSlotImage || !target.slotId || !target.cropMode) return;

      page = getActivePage();
      slot = page ? getSlotState(page.id, target.slotId) : null;
      shared = getShared();

      if (!page || !slot || !shared.clampSlotImage || !shared.syncSlotCropFromImage) return;

      shared.clampSlotImage(target, target.frameRect);
      shared.syncSlotCropFromImage(slot, target, target.frameRect);
      state.canvas.requestRenderAll();
    });

    state.canvas.on('mouse:down', function (evt) {
      var target = evt.target;
      var page = getActivePage();
      var activeCrop = state.cropSession;
      var sameCropTarget = activeCrop && target && target.slotId === activeCrop.slotId;

      if (activeCrop && (!sameCropTarget || !target || !target.photoSlot)) {
        setCropMode(activeCrop.pageId, activeCrop.slotId, false);
        if (!target || !target.photoSlot || !target.slotId) return;
      }

      if (activeCrop && sameCropTarget) {
        return;
      }

      if (!page || !target || !target.photoSlot || !target.slotId) return;

      page.data.selectedSlotId = target.slotId;
      renderActivePage();
      renderThumbnailStrip();
    });

    state.canvas.on('mouse:up', function (evt) {
      var target = evt.target;
      if (!target || !target.photoSlotImage || !target.slotId) return;
      updateSingleThumbnail(state.activePageId);
    });

    // Zoom da foto dentro do frame com scroll (só ativo no modo de ajuste)
    state.canvas.on('mouse:wheel', function (evt) {
      var e = evt.e;
      var activeCrop = state.cropSession;
      var slot;

      if (!activeCrop || !e) return;

      slot = getSlotState(activeCrop.pageId, activeCrop.slotId);
      if (!slot || !slot.src) return;

      e.preventDefault();

      slot.crop = slot.crop || { offsetX: 0, offsetY: 0, zoom: 1, isCropping: true };
      var delta = e.deltaY > 0 ? -0.08 : 0.08;
      slot.crop.zoom = Math.max(0.8, Math.min(4, (slot.crop.zoom || 1) + delta));

      if (state.activePageId === activeCrop.pageId) {
        renderActivePage();
        updateSingleThumbnail(activeCrop.pageId);
      }
    });
  }

  function cacheElements() {
    el.inputNome = document.getElementById('txt-nome');
    el.inputCurso = document.getElementById('txt-curso');
    el.inputParents = document.getElementById('txt-parents');
    el.inputBio = document.getElementById('txt-bio-input');
    el.titleRange = document.getElementById('title-size-range');
    el.titleNumber = document.getElementById('title-size-number');
    el.bioRange = document.getElementById('bio-size-range');
    el.bioNumber = document.getElementById('bio-size-number');
    el.fotoInput = document.getElementById('foto-input');
    el.photoUpload = document.getElementById('photo-upload');
    el.photoPreviewWrap = document.getElementById('photo-preview-wrap');
    el.photoPreviewImg = document.getElementById('photo-preview-img');
    el.btnPhotoChange = document.getElementById('btn-photo-change');
    el.btnDownload = document.getElementById('btn-download');
    el.btnHeaderDownload = document.getElementById('btn-header-download');
    el.pageStripList = document.getElementById('page-strip-list');
    el.canvasArea = document.getElementById('canvas-area');
    el.canvasWrapper = document.getElementById('canvas-wrapper');
    el.canvasDims = document.getElementById('canvas-dims');
    el.pageStatus = document.getElementById('page-status');
    el.slotStatus = document.getElementById('slot-status');
    el.uploadTargetHint = document.getElementById('upload-target-hint');
    el.textSectionHint = document.getElementById('text-section-hint');
    el.editorLayout = document.getElementById('editor-layout');
    el.panelShell = document.getElementById('panel-shell');
    el.panelTitle = document.getElementById('panel-title');
    el.panelSub = document.getElementById('panel-sub');
    el.panelRailItems = document.querySelectorAll('[data-panel-toggle]');
    el.panelSections = document.querySelectorAll('[data-panel-section]');
    // Toolbar
    el.textToolbar    = document.getElementById('text-toolbar');
    el.ttbFontDec     = document.getElementById('ttb-font-dec');
    el.ttbFontSize    = document.getElementById('ttb-font-size');
    el.ttbFontInc     = document.getElementById('ttb-font-inc');
    el.ttbLineHeight  = document.getElementById('ttb-line-height');
    el.ttbBold        = document.getElementById('ttb-bold');
    el.ttbItalic      = document.getElementById('ttb-italic');
    el.ttbUnderline   = document.getElementById('ttb-underline');
    el.ttbAlignLeft   = document.getElementById('ttb-align-left');
    el.ttbAlignCenter = document.getElementById('ttb-align-center');
    el.ttbAlignRight  = document.getElementById('ttb-align-right');
    el.ttbUndo        = document.getElementById('ttb-undo');
    el.ttbRedo        = document.getElementById('ttb-redo');
    el.bodyCounter    = document.getElementById('body-counter');
    el.bodyCounterSep = document.getElementById('ttb-counter-sep');
    el.bodyCounterCurrent = document.getElementById('body-counter-current');
    el.bodyCounterLimit   = document.getElementById('body-counter-limit');
  }

  function initCanvas() {
    var bounds = getStageBounds();

    state.canvas = new fabric.Canvas('editor-canvas', {
      width: bounds.width,
      height: bounds.height,
      preserveObjectStacking: true,
      selection: false
    });
  }

  function bindViewportEvents() {
    window.addEventListener('resize', function () {
      if (!state.canvas || !state.activePageId) return;
      applyStageViewport(state.activePageId);
    });
  }

  function init() {
    if (typeof fabric === 'undefined') {
      console.error('[Editor] Fabric.js não carregou.');
      return;
    }

    cacheElements();
    updatePanelUI();
    BODY_CHAR_LIMIT = computeBodyCharLimit();
    createPageMap();
    preparePageAssets();
    initCanvas();
    bindPanelEvents();
    bindSidebarEvents();
    bindCanvasEvents();
    bindToolbarEvents();
    bindViewportEvents();
    renderActivePage();
    renderThumbnailStrip();
    pushEditHistory(); // initial snapshot so undo never goes below baseline
  }

  document.addEventListener('DOMContentLoaded', init);
}());
