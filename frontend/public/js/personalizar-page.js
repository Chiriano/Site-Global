(function () {
  const productConfigs = window.productConfigs || {};
  const params = new URLSearchParams(window.location.search);
  const productId = parseInt(params.get("id") || "0", 10);
  const productConfig = productConfigs[productId];
  const storageKey = `alpha_personalizacao_${productId}`;

  const dom = {
    btnVoltar: document.getElementById("btn-voltar"),
    btnAvancar: document.getElementById("btn-avancar"),
    btnSalvar: document.getElementById("btn-salvar"),
    btnFullscreen: document.getElementById("btn-fullscreen"),
    btnZoomPlus: document.getElementById("btn-zoom-plus"),
    btnZoomMinus: document.getElementById("btn-zoom-minus"),
    btnZoomReset: document.getElementById("btn-zoom-reset"),
    zoomValue: document.getElementById("zoom-value"),
    layoutsGrid: document.getElementById("layouts-grid"),
    templatesGrid: document.getElementById("templates-grid"),
    slotSelect: document.getElementById("slot-select"),
    fotoInput: document.getElementById("foto-input"),
    textsForm: document.getElementById("texts-form"),
    canvasWrap: document.getElementById("canvas-wrap"),
    canvas: document.getElementById("preview-canvas")
  };
  const ctx = dom.canvas.getContext("2d");

  if (!productConfig || !productConfig.personalizacao || !Array.isArray(productConfig.personalizacao.layouts) || !productConfig.personalizacao.layouts.length) {
    alert("Produto sem configuracao de personalizacao.");
    window.location.href = `convite-product.html?id=${encodeURIComponent(productId)}`;
    return;
  }

  const personalization = productConfig.personalizacao;
  const backgroundTemplates = getBackgroundTemplates(personalization);
  const print = personalization.print || { canvas: { w: 3000, h: 2200 }, safeArea: { x: 50, y: 50, w: 2100, h: 2900 } };

  const state = {
    selectedLayoutId: personalization.layouts[0].id,
    selectedTemplateId: backgroundTemplates[0].id,
    photos: {},
    texts: {},
    imageCache: {},
    templateImageCache: {},
    photoTransforms: {},
    scale: 1,
    renderQueued: false,
    paperCache: {},
    edit: { activeFrameKey: "", selectedFrameKey: "", dragging: false, hoverFrameKey: "", dropTargetFrameKey: "", lastPoint: null }
  };

  const saved = loadSavedState();
  if (saved) {
    state.selectedLayoutId = saved.layoutId || state.selectedLayoutId;
    state.selectedTemplateId = saved.templateId || state.selectedTemplateId;
    state.photos = saved.photos || {};
    state.texts = saved.texts || {};
    state.photoTransforms = saved.photoTransforms || {};
    state.scale = typeof saved.scale === "number" ? saved.scale : 1;
  }

  dom.btnVoltar.href = `convite-product.html?id=${encodeURIComponent(productId)}`;
  ensureCurrentTemplate();
  ensureCurrentLayout();
  renderLayoutCards();
  renderTemplateCards();
  renderSlotOptions();
  renderTextInputs();
  loadImagesFromState().finally(queueRender);
  applyScale();
  centerCanvasView();
  updateCanvasCursor();

  window.addEventListener("resize", centerCanvasView);
  window.addEventListener("mousemove", onWindowMouseMove);
  window.addEventListener("mouseup", onWindowMouseUp);
  window.addEventListener("keydown", onWindowKeyDown);

  dom.layoutsGrid.addEventListener("click", onLayoutClick);
  dom.templatesGrid && dom.templatesGrid.addEventListener("click", onTemplateClick);
  dom.slotSelect.addEventListener("change", function () {
    dom.fotoInput.value = "";
    state.edit.selectedFrameKey = dom.slotSelect.value || "";
    queueRender();
  });
  dom.fotoInput.addEventListener("change", onFileInputChange);
  dom.btnSalvar.addEventListener("click", onSave);
  dom.btnAvancar.addEventListener("click", onAdvance);
  dom.btnZoomPlus.addEventListener("click", function () { state.scale = Math.min(2.2, state.scale + 0.1); applyScale(); centerCanvasView(); });
  dom.btnZoomMinus.addEventListener("click", function () { state.scale = Math.max(0.6, state.scale - 0.1); applyScale(); centerCanvasView(); });
  dom.btnZoomReset && dom.btnZoomReset.addEventListener("click", function () {
    state.scale = 1;
    applyScale();
    centerCanvasView();
  });
  dom.btnFullscreen.addEventListener("click", function () {
    if (!document.fullscreenElement) {
      dom.canvasWrap.requestFullscreen && dom.canvasWrap.requestFullscreen();
      return;
    }
    document.exitFullscreen && document.exitFullscreen();
  });

  dom.canvas.addEventListener("dblclick", onCanvasDoubleClick);
  dom.canvas.addEventListener("click", onCanvasClick);
  dom.canvas.addEventListener("mousedown", onCanvasMouseDown);
  dom.canvas.addEventListener("mousemove", onCanvasMouseMove);
  dom.canvas.addEventListener("dragover", onCanvasDragOver);
  dom.canvas.addEventListener("dragleave", onCanvasDragLeave);
  dom.canvas.addEventListener("drop", onCanvasDrop);
  dom.canvasWrap.addEventListener("dragover", onCanvasDragOver);
  dom.canvasWrap.addEventListener("dragleave", onCanvasDragLeave);
  dom.canvasWrap.addEventListener("drop", onCanvasDrop);

  function onLayoutClick(event) {
    const card = event.target.closest(".pz-layout-card");
    if (!card) return;
    const nextId = card.getAttribute("data-layout-id");
    if (!nextId || nextId === state.selectedLayoutId) return;
    state.selectedLayoutId = nextId;
    state.edit = { activeFrameKey: "", selectedFrameKey: "", dragging: false, hoverFrameKey: "", dropTargetFrameKey: "", lastPoint: null };
    ensureCurrentLayout();
    renderLayoutCards();
    renderSlotOptions();
    renderTextInputs();
    updateCanvasCursor();
    queueRender();
  }

  function onTemplateClick(event) {
    const card = event.target.closest(".pz-template-card");
    if (!card) return;
    const nextId = card.getAttribute("data-template-id");
    if (!nextId || nextId === state.selectedTemplateId) return;
    state.selectedTemplateId = nextId;
    state.paperCache = {};
    renderTemplateCards();
    renderLayoutCards();
    queueRender();
  }

  function onFileInputChange(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const slotKey = dom.slotSelect.value;
    if (!slotKey) {
      alert("Selecione um quadro para editar.");
      return;
    }
    assignFileToSlot(file, slotKey);
  }

  function onSave() {
    savePersonalization();
    alert("Personalizacao salva.");
  }

  function onAdvance() {
    const layout = getCurrentLayout();
    const requiredPhoto = layout.photos && layout.photos[0] ? layout.photos[0].key : null;
    if (requiredPhoto && !state.photos[requiredPhoto]) {
      alert("Envie ao menos a primeira foto para avancar.");
      return;
    }
    savePersonalization();
    window.location.href = `visualizar.html?id=${encodeURIComponent(productId)}`;
  }

  function renderLayoutCards() {
    dom.layoutsGrid.innerHTML = personalization.layouts.map(function (layout) {
      const isActive = layout.id === state.selectedLayoutId;
      return `<button class="pz-layout-card${isActive ? " is-active" : ""}" data-layout-id="${escapeHtml(layout.id)}" type="button"><img src="${buildLayoutThumb(layout)}" alt="${escapeHtml(layout.name)}"><span>${escapeHtml(layout.name)}</span></button>`;
    }).join("");
  }

  function renderTemplateCards() {
    if (!dom.templatesGrid) return;
    dom.templatesGrid.innerHTML = backgroundTemplates.map(function (template) {
      const isActive = template.id === state.selectedTemplateId;
      return `<button class="pz-template-card${isActive ? " is-active" : ""}" data-template-id="${escapeHtml(template.id)}" type="button"><img src="${buildTemplateThumb(template)}" alt="${escapeHtml(template.name)}"><span>${escapeHtml(template.name)}</span></button>`;
    }).join("");
  }

  function renderSlotOptions() {
    const layout = getCurrentLayout();
    const current = dom.slotSelect.value;
    const options = (layout.photos || []).map(function (frame, index) {
      return `<option value="${escapeHtml(frame.key)}">${escapeHtml(frame.key)} (${index + 1})</option>`;
    }).join("");
    dom.slotSelect.innerHTML = options;
    dom.slotSelect.disabled = !options;
    dom.fotoInput.disabled = !options;
    if (options && getFrameByKey(layout, current)) {
      dom.slotSelect.value = current;
    } else if (options) {
      dom.slotSelect.selectedIndex = 0;
    }
    state.edit.selectedFrameKey = dom.slotSelect.value || "";
  }

  function renderTextInputs() {
    const layout = getCurrentLayout();
    dom.textsForm.innerHTML = (layout.texts || []).map(function (txt) {
      const value = state.texts[txt.key] || "";
      return `<label class="pz-label" for="txt-${escapeHtml(txt.key)}">${escapeHtml(txt.key)}</label><input id="txt-${escapeHtml(txt.key)}" data-key="${escapeHtml(txt.key)}" class="pz-input" type="text" placeholder="Digite ${escapeHtml(txt.key)}" value="${escapeHtml(value)}">`;
    }).join("");
    dom.textsForm.querySelectorAll("input[data-key]").forEach(function (input) {
      input.addEventListener("input", function () {
        const key = input.getAttribute("data-key");
        state.texts[key] = input.value;
        queueRender();
      });
    });
  }

  function loadImagesFromState() {
    const jobs = Object.keys(state.photos).map(function (slotKey) {
      return loadImage(state.photos[slotKey]).then(function (img) {
        state.imageCache[slotKey] = img;
      }).catch(function () {
        delete state.imageCache[slotKey];
      });
    });
    return Promise.all(jobs);
  }

  function queueRender() {
    if (state.renderQueued) return;
    state.renderQueued = true;
    requestAnimationFrame(function () {
      state.renderQueued = false;
      renderCanvas();
    });
  }

  function renderCanvas() {
    const layout = getCurrentLayout();
    const template = getCurrentTemplate();
    const canvasSize = layout.canvas || print.canvas;
    if (dom.canvas.width !== canvasSize.w || dom.canvas.height !== canvasSize.h) {
      dom.canvas.width = canvasSize.w;
      dom.canvas.height = canvasSize.h;
    }

    drawBackgroundPaper(ctx, dom.canvas.width, dom.canvas.height, template);
    drawPageBorder(ctx, dom.canvas.width, dom.canvas.height);
    drawLayoutDecorations(ctx, layout);

    (layout.photos || []).forEach(function (frame) {
      const image = state.imageCache[frame.key];
      if (image) {
        drawImageInFrame(ctx, image, frame, layout);
      } else {
        drawEmptyFrame(ctx, frame, layout);
      }
    });

    (layout.texts || []).forEach(function (txt) {
      const content = state.texts[txt.key] || "";
      if (!content) return;
      ctx.fillStyle = txt.color || "#4d3f2d";
      ctx.font = txt.font || "56px serif";
      ctx.textAlign = txt.align || "center";
      ctx.textBaseline = "alphabetic";
      ctx.fillText(content.slice(0, 120), txt.x, txt.y, txt.maxW || 1600);
    });
  }

  function drawLayoutDecorations(ctx2, layout) {
    if (!layout || !layout.style) return;
    const gold = "rgba(182,152,82,0.75)";
    if (layout.style === "text-photo-framed" || layout.style === "text-photo-free") {
      ctx2.save();
      ctx2.strokeStyle = gold;
      ctx2.lineWidth = 2.5;
      ctx2.beginPath();
      ctx2.moveTo(1060, 700);
      ctx2.lineTo(1060, 2430);
      ctx2.stroke();
      ctx2.strokeRect(150, 760, 860, 1560);
      ctx2.globalAlpha = 0.45;
      ctx2.strokeRect(178, 788, 804, 1504);
      ctx2.restore();
      return;
    }

    if (layout.style === "album") {
      ctx2.save();
      ctx2.strokeStyle = "rgba(182,152,82,0.58)";
      ctx2.lineWidth = 2;
      ctx2.beginPath();
      ctx2.moveTo(280, 540);
      ctx2.lineTo(1920, 540);
      ctx2.stroke();
      ctx2.restore();
    }
  }

  function drawImageInFrame(ctx2, image, frame, layout) {
    const drawArea = getFrameDrawArea(frame);
    const radius = Number(frame.radius || 0);
    if (frame.free) {
      if (frame.shadow) {
        ctx2.save();
        roundedRectPath(ctx2, drawArea.x, drawArea.y, drawArea.w, drawArea.h, radius);
        ctx2.shadowColor = "rgba(0,0,0,0.28)";
        ctx2.shadowBlur = 28;
        ctx2.shadowOffsetY = 12;
        ctx2.fillStyle = "rgba(0,0,0,0.01)";
        ctx2.fill();
        ctx2.restore();
      }
      ctx2.save();
      roundedRectPath(ctx2, drawArea.x, drawArea.y, drawArea.w, drawArea.h, radius);
      ctx2.clip();
      drawImageCoverWithTransform(ctx2, image, drawArea, frame);
      ctx2.restore();
    } else {
      ctx2.save();
      roundedRectPath(ctx2, frame.x, frame.y, frame.w, frame.h, radius);
      ctx2.clip();
      drawImageCoverWithTransform(ctx2, image, frame, frame);
      ctx2.restore();
    }

    drawFrameOverlay(ctx2, frame);
    if (shouldDrawFrameBorder(frame, layout)) drawFrameBorder(ctx2, frame);
    if (state.edit.activeFrameKey === frame.key) drawEditFrameHighlight(ctx2, frame);
    drawSelectionHighlights(ctx2, frame);
  }

  function drawEmptyFrame(ctx2, frame, layout) {
    const drawArea = getFrameDrawArea(frame);
    const radius = Math.max(Number(frame.radius || 0), 2);
    const lw = Math.max(7, drawArea.w * 0.009);
    ctx2.save();
    roundedRectPath(ctx2, drawArea.x, drawArea.y, drawArea.w, drawArea.h, radius);
    ctx2.fillStyle = frame.free ? "rgba(215,210,203,0.52)" : "rgba(228,224,218,0.72)";
    ctx2.fill();
    if (shouldDrawFrameBorder(frame, layout)) {
      ctx2.strokeStyle = "rgba(182,152,82,0.85)";
      ctx2.lineWidth = lw;
      ctx2.stroke();
    }
    const cx = drawArea.x + drawArea.w / 2;
    const cy = drawArea.y + drawArea.h / 2;
    const arm = Math.min(drawArea.w, drawArea.h) * 0.13;
    ctx2.strokeStyle = "rgba(182,152,82,0.38)";
    ctx2.lineWidth = lw * 0.65;
    ctx2.lineCap = "round";
    ctx2.beginPath();
    ctx2.moveTo(cx - arm, cy); ctx2.lineTo(cx + arm, cy);
    ctx2.moveTo(cx, cy - arm); ctx2.lineTo(cx, cy + arm);
    ctx2.stroke();
    ctx2.restore();
    drawSelectionHighlights(ctx2, frame);
  }

  function drawSelectionHighlights(ctx2, frame) {
    if (state.edit.dropTargetFrameKey === frame.key) {
      drawFrameAccent(ctx2, frame, "rgba(90,158,255,0.95)", 5, 10);
      return;
    }
    if (state.edit.selectedFrameKey === frame.key) {
      drawFrameAccent(ctx2, frame, "rgba(241,220,168,0.88)", 4, 8);
      return;
    }
    if (state.edit.hoverFrameKey === frame.key && !state.edit.activeFrameKey) {
      drawFrameAccent(ctx2, frame, "rgba(255,255,255,0.55)", 3, 6);
    }
  }

  function drawFrameAccent(ctx2, frame, color, width, offset) {
    const area = getFrameDrawArea(frame);
    const radius = Math.max(Number(frame.radius || 0), 2);
    ctx2.save();
    roundedRectPath(ctx2, area.x - offset, area.y - offset, area.w + offset * 2, area.h + offset * 2, radius + offset);
    ctx2.strokeStyle = color;
    ctx2.lineWidth = width;
    ctx2.stroke();
    ctx2.restore();
  }

  function drawFrameBorder(ctx2, frame) {
    const radius = Math.max(Number(frame.radius || 0), 2);
    const lw = Math.max(7, frame.w * 0.009);
    ctx2.save();
    roundedRectPath(ctx2, frame.x, frame.y, frame.w, frame.h, radius);
    ctx2.strokeStyle = "rgba(182,152,82,0.88)";
    ctx2.lineWidth = lw;
    ctx2.stroke();
    ctx2.restore();
  }

  function drawFrameOverlay(ctx2, frame) {
    if (!frame.overlayGradient || !Array.isArray(frame.overlayGradient.stops)) return;
    const gradient = ctx2.createLinearGradient(frame.x, frame.y, frame.x, frame.y + frame.h);
    frame.overlayGradient.stops.forEach(function (stop) {
      gradient.addColorStop(typeof stop.at === "number" ? clamp(stop.at, 0, 1) : 0, stop.color || "rgba(255,255,255,0)");
    });
    ctx2.save();
    roundedRectPath(ctx2, frame.x, frame.y, frame.w, frame.h, Number(frame.radius || 0));
    ctx2.clip();
    ctx2.fillStyle = gradient;
    ctx2.fillRect(frame.x, frame.y, frame.w, frame.h);
    ctx2.restore();
  }

  function drawEditFrameHighlight(ctx2, frame) {
    const radius = Math.max(Number(frame.radius || 0), 2);
    ctx2.save();
    roundedRectPath(ctx2, frame.x - 6, frame.y - 6, frame.w + 12, frame.h + 12, radius + 8);
    ctx2.strokeStyle = "rgba(90,158,255,0.9)";
    ctx2.lineWidth = 5;
    ctx2.stroke();
    ctx2.restore();
  }

  function drawPageBorder(ctx2, w, h) {
    const gold = "rgba(182,152,82,0.80)";
    const lw = Math.max(2, w * 0.0014);
    const m = Math.round(w * 0.027);
    const gap = lw * 3.5;
    ctx2.save();
    ctx2.strokeStyle = gold;
    ctx2.lineWidth = lw;
    ctx2.strokeRect(m, m, w - m * 2, h - m * 2);
    const inner = m + gap + lw;
    ctx2.strokeRect(inner, inner, w - inner * 2, h - inner * 2);
    drawOrnament(ctx2, w / 2, m + (gap + lw) / 2, gold, lw);
    ctx2.restore();
  }

  function drawOrnament(ctx2, cx, cy, color, lw) {
    const s = Math.max(6, lw * 7);
    ctx2.save();
    ctx2.fillStyle = color;
    ctx2.strokeStyle = color;
    ctx2.lineWidth = lw;
    ctx2.beginPath();
    ctx2.moveTo(cx, cy - s * 0.65);
    ctx2.lineTo(cx + s * 0.38, cy);
    ctx2.lineTo(cx, cy + s * 0.65);
    ctx2.lineTo(cx - s * 0.38, cy);
    ctx2.closePath();
    ctx2.fill();
    ctx2.beginPath();
    ctx2.moveTo(cx - s * 1.7, cy);
    ctx2.lineTo(cx - s * 0.5, cy);
    ctx2.moveTo(cx + s * 0.5, cy);
    ctx2.lineTo(cx + s * 1.7, cy);
    ctx2.stroke();
    ctx2.restore();
  }

  function buildLayoutThumb(layout) {
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 120;
    thumbCanvas.height = 90;
    const thumbCtx = thumbCanvas.getContext("2d");
    drawBackgroundPaper(thumbCtx, 120, 90, getCurrentTemplate());
    drawPageBorder(thumbCtx, 120, 90);
    drawLayoutThumbDecorations(thumbCtx, layout, 120 / print.canvas.w, 90 / print.canvas.h);
    const sx = thumbCanvas.width / print.canvas.w;
    const sy = thumbCanvas.height / print.canvas.h;
    (layout.photos || []).forEach(function (frame) {
      drawThumbFrame(thumbCtx, {
        key: frame.key,
        x: frame.x * sx,
        y: frame.y * sy,
        w: frame.w * sx,
        h: frame.h * sy,
        radius: (frame.radius || 0) * sx,
        border: frame.border,
        free: frame.free,
        bleedBottom: (frame.bleedBottom || 0) * sy
      }, layout);
    });
    return thumbCanvas.toDataURL("image/png");
  }

  function drawThumbFrame(ctx2, frame, layout) {
    const drawArea = getFrameDrawArea(frame);
    const radius = Math.max(Number(frame.radius || 0), 1.5);
    ctx2.save();
    roundedRectPath(ctx2, drawArea.x, drawArea.y, drawArea.w, drawArea.h, radius);
    ctx2.fillStyle = frame.free ? "rgba(215,210,203,0.60)" : "rgba(228,224,218,0.85)";
    ctx2.fill();
    if (shouldDrawFrameBorder(frame, layout)) {
      ctx2.strokeStyle = "rgba(182,152,82,0.88)";
      ctx2.lineWidth = Math.max(1.5, drawArea.w * 0.05);
      ctx2.stroke();
    }
    ctx2.restore();
  }

  function drawLayoutThumbDecorations(ctx2, layout, sx, sy) {
    if (!layout || !layout.style) return;
    ctx2.save();
    ctx2.strokeStyle = "rgba(182,152,82,0.6)";
    ctx2.lineWidth = 1;
    if (layout.style === "text-photo-framed" || layout.style === "text-photo-free") {
      ctx2.beginPath();
      ctx2.moveTo(1060 * sx, 700 * sy);
      ctx2.lineTo(1060 * sx, 2430 * sy);
      ctx2.stroke();
      ctx2.strokeRect(150 * sx, 760 * sy, 860 * sx, 1560 * sy);
    } else if (layout.style === "album") {
      ctx2.beginPath();
      ctx2.moveTo(280 * sx, 540 * sy);
      ctx2.lineTo(1920 * sx, 540 * sy);
      ctx2.stroke();
    }
    ctx2.restore();
  }

  function buildTemplateThumb(template) {
    const thumbCanvas = document.createElement("canvas");
    thumbCanvas.width = 100;
    thumbCanvas.height = 70;
    const thumbCtx = thumbCanvas.getContext("2d");
    drawBackgroundPaper(thumbCtx, 100, 70, template);
    drawPageBorder(thumbCtx, 100, 70);
    return thumbCanvas.toDataURL("image/png");
  }

  function drawBackgroundPaper(ctx2, w, h, template) {
    const safeTemplate = template || backgroundTemplates[0];
    const cacheKey = `${safeTemplate.id}_${w}x${h}`;
    if (!state.paperCache[cacheKey]) {
      const cacheCanvas = document.createElement("canvas");
      cacheCanvas.width = w;
      cacheCanvas.height = h;
      const c = cacheCanvas.getContext("2d");
      const colors = Array.isArray(safeTemplate.colors) && safeTemplate.colors.length ? safeTemplate.colors : ["#f6f1e7", "#eadfc9"];
      const base = c.createLinearGradient(0, 0, 0, h);
      colors.forEach(function (color, index) { base.addColorStop(colors.length === 1 ? 1 : index / (colors.length - 1), color); });
      c.fillStyle = base;
      c.fillRect(0, 0, w, h);

      if (safeTemplate.src) {
        const image = state.templateImageCache[safeTemplate.id];
        if (image) {
          drawImageCover(c, image, 0, 0, w, h);
        } else if (!state.templateImageCache[`loading_${safeTemplate.id}`]) {
          state.templateImageCache[`loading_${safeTemplate.id}`] = true;
          loadImage(safeTemplate.src).then(function (img) {
            state.templateImageCache[safeTemplate.id] = img;
            delete state.templateImageCache[`loading_${safeTemplate.id}`];
            state.paperCache = {};
            queueRender();
            renderTemplateCards();
            renderLayoutCards();
          }).catch(function () {
            delete state.templateImageCache[`loading_${safeTemplate.id}`];
          });
        }
      }
      state.paperCache[cacheKey] = cacheCanvas;
    }
    ctx2.clearRect(0, 0, w, h);
    ctx2.drawImage(state.paperCache[cacheKey], 0, 0);
  }

  function drawImageCover(ctx2, image, x, y, w, h) {
    const boxRatio = w / h;
    const imageRatio = image.width / image.height;
    let sx; let sy; let sw; let sh;
    if (imageRatio > boxRatio) {
      sh = image.height; sw = sh * boxRatio; sx = (image.width - sw) / 2; sy = 0;
    } else {
      sw = image.width; sh = sw / boxRatio; sx = 0; sy = (image.height - sh) / 2;
    }
    ctx2.drawImage(image, sx, sy, sw, sh, x, y, w, h);
  }

  function drawImageCoverWithTransform(ctx2, image, drawRect, frame) {
    const boxRatio = drawRect.w / drawRect.h;
    const imageRatio = image.width / image.height;
    const tr = getPhotoTransform(frame);
    let sx; let sy; let sw; let sh;
    if (imageRatio > boxRatio) {
      sh = image.height; sw = sh * boxRatio;
      const excessX = image.width - sw;
      sx = clamp(excessX / 2 + tr.x * (excessX / 2), 0, excessX); sy = 0;
    } else {
      sw = image.width; sh = sw / boxRatio;
      const excessY = image.height - sh;
      sx = 0; sy = clamp(excessY / 2 + tr.y * (excessY / 2), 0, excessY);
    }
    ctx2.drawImage(image, sx, sy, sw, sh, drawRect.x, drawRect.y, drawRect.w, drawRect.h);
  }

  function roundedRectPath(ctx2, x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius || 0, Math.min(w, h) / 2));
    ctx2.beginPath();
    ctx2.moveTo(x + r, y);
    ctx2.lineTo(x + w - r, y);
    ctx2.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx2.lineTo(x + w, y + h - r);
    ctx2.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx2.lineTo(x + r, y + h);
    ctx2.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx2.lineTo(x, y + r);
    ctx2.quadraticCurveTo(x, y, x + r, y);
    ctx2.closePath();
  }

  function onCanvasDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
    dom.canvasWrap.classList.add("is-dragover");
    const layout = getCurrentLayout();
    const point = getCanvasPoint(event);
    const frame = point ? findFrameAtPoint(layout, point.x, point.y) : null;
    state.edit.dropTargetFrameKey = frame ? frame.key : "";
    if (frame) {
      state.edit.selectedFrameKey = frame.key;
      dom.slotSelect.value = frame.key;
    }
    queueRender();
  }

  function onCanvasDragLeave(event) {
    if (event.target === dom.canvas || event.target === dom.canvasWrap) {
      dom.canvasWrap.classList.remove("is-dragover");
      state.edit.dropTargetFrameKey = "";
      queueRender();
    }
  }

  function onCanvasDrop(event) {
    event.preventDefault();
    dom.canvasWrap.classList.remove("is-dragover");
    const files = event.dataTransfer && event.dataTransfer.files;
    const file = files && files[0];
    if (!file || !file.type.startsWith("image/")) return;
    const point = getCanvasPoint(event);
    const layout = getCurrentLayout();
    const frame = point ? findFrameAtPoint(layout, point.x, point.y) : null;
    const slotKey = frame ? frame.key : dom.slotSelect.value;
    state.edit.dropTargetFrameKey = "";
    if (!slotKey) return alert("Selecione um quadro para enviar a foto.");
    if (frame) {
      dom.slotSelect.value = frame.key;
      state.edit.selectedFrameKey = frame.key;
    }
    assignFileToSlot(file, slotKey);
    queueRender();
  }

  function onCanvasClick(event) {
    if (state.edit.dragging) return;
    const layout = getCurrentLayout();
    const point = getCanvasPoint(event);
    const frame = point ? findFrameAtPoint(layout, point.x, point.y) : null;
    if (!frame) return;
    state.edit.selectedFrameKey = frame.key;
    dom.slotSelect.value = frame.key;
    queueRender();
  }

  function onCanvasDoubleClick(event) {
    const layout = getCurrentLayout();
    const point = getCanvasPoint(event);
    const frame = point ? findFrameAtPoint(layout, point.x, point.y) : null;
    if (!frame || !state.imageCache[frame.key]) {
      if (state.edit.activeFrameKey) {
        state.edit.activeFrameKey = "";
        state.edit.dragging = false;
        state.edit.lastPoint = null;
        updateCanvasCursor();
        queueRender();
      }
      return;
    }
    state.edit.selectedFrameKey = frame.key;
    state.edit.activeFrameKey = state.edit.activeFrameKey === frame.key ? "" : frame.key;
    state.edit.dragging = false;
    state.edit.lastPoint = null;
    dom.slotSelect.value = frame.key;
    updateCanvasCursor();
    queueRender();
  }

  function onCanvasMouseDown(event) {
    if (event.button !== 0 || !state.edit.activeFrameKey) return;
    const layout = getCurrentLayout();
    const point = getCanvasPoint(event);
    const frame = point ? findFrameAtPoint(layout, point.x, point.y) : null;
    if (!frame || frame.key !== state.edit.activeFrameKey || !state.imageCache[frame.key]) return;
    state.edit.dragging = true;
    state.edit.lastPoint = point;
    updateCanvasCursor();
    event.preventDefault();
  }

  function onCanvasMouseMove(event) {
    const layout = getCurrentLayout();
    const point = getCanvasPoint(event);
    const frame = point ? findFrameAtPoint(layout, point.x, point.y) : null;
    if (state.edit.dragging) return;
    const nextHover = frame ? frame.key : "";
    const changed = nextHover !== state.edit.hoverFrameKey;
    state.edit.hoverFrameKey = nextHover;
    updateCanvasCursor();
    if (changed) queueRender();
  }

  function onWindowMouseMove(event) {
    if (!state.edit.dragging || !state.edit.activeFrameKey) return;
    const layout = getCurrentLayout();
    const frame = getFrameByKey(layout, state.edit.activeFrameKey);
    const image = frame ? state.imageCache[frame.key] : null;
    if (!frame || !image || !state.edit.lastPoint) return;
    const point = getCanvasPoint(event);
    if (!point) return;
    const dx = point.x - state.edit.lastPoint.x;
    const dy = point.y - state.edit.lastPoint.y;
    state.edit.lastPoint = point;
    shiftFrameTransform(frame, image, dx, dy);
    queueRender();
  }

  function onWindowMouseUp() {
    if (!state.edit.dragging) return;
    state.edit.dragging = false;
    state.edit.lastPoint = null;
    updateCanvasCursor();
  }

  function onWindowKeyDown(event) {
    if (event.key !== "Escape" || !state.edit.activeFrameKey) return;
    state.edit.activeFrameKey = "";
    state.edit.dragging = false;
    state.edit.lastPoint = null;
    updateCanvasCursor();
    queueRender();
  }

  function assignFileToSlot(file, slotKey) {
    state.edit.selectedFrameKey = slotKey;
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = String(e.target.result || "");
      state.photos[slotKey] = dataUrl;
      state.photoTransforms[`${state.selectedLayoutId}::${slotKey}`] = { x: 0, y: 0 };
      loadImage(dataUrl).then(function (img) {
        state.imageCache[slotKey] = img;
        queueRender();
      }).catch(function () {
        delete state.imageCache[slotKey];
        queueRender();
      });
    };
    reader.readAsDataURL(file);
  }

  function shiftFrameTransform(frame, image, dx, dy) {
    const drawArea = getFrameDrawArea(frame);
    const boxRatio = drawArea.w / drawArea.h;
    const imageRatio = image.width / image.height;
    const tr = getPhotoTransform(frame);
    if (imageRatio > boxRatio) {
      const sh = image.height;
      const sw = sh * boxRatio;
      const excessX = image.width - sw;
      if (excessX <= 0) return;
      let sx = excessX / 2 + tr.x * (excessX / 2);
      sx -= dx * (sw / drawArea.w);
      tr.x = clamp((clamp(sx, 0, excessX) - excessX / 2) / (excessX / 2), -1, 1);
      tr.y = 0;
    } else {
      const sw = image.width;
      const sh = sw / boxRatio;
      const excessY = image.height - sh;
      if (excessY <= 0) return;
      let sy = excessY / 2 + tr.y * (excessY / 2);
      sy -= dy * (sh / drawArea.h);
      tr.y = clamp((clamp(sy, 0, excessY) - excessY / 2) / (excessY / 2), -1, 1);
      tr.x = 0;
    }
    state.photoTransforms[getTransformKey(frame)] = { x: tr.x, y: tr.y };
  }

  function getCanvasPoint(event) {
    if (!event || typeof event.clientX !== "number" || typeof event.clientY !== "number") return null;
    const rect = dom.canvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    return {
      x: (event.clientX - rect.left) * (dom.canvas.width / rect.width),
      y: (event.clientY - rect.top) * (dom.canvas.height / rect.height)
    };
  }

  function findFrameAtPoint(layout, x, y) {
    const frames = (layout.photos || []).slice().reverse();
    for (let i = 0; i < frames.length; i += 1) {
      const area = getFrameDrawArea(frames[i]);
      if (x >= area.x && x <= area.x + area.w && y >= area.y && y <= area.y + area.h) return frames[i];
    }
    return null;
  }

  function getCurrentLayout() {
    return personalization.layouts.find(function (layout) { return layout.id === state.selectedLayoutId; }) || personalization.layouts[0];
  }

  function getCurrentTemplate() {
    return backgroundTemplates.find(function (template) { return template.id === state.selectedTemplateId; }) || backgroundTemplates[0];
  }

  function ensureCurrentTemplate() {
    state.selectedTemplateId = getCurrentTemplate().id;
  }

  function ensureCurrentLayout() {
    const layout = getCurrentLayout();
    state.selectedLayoutId = layout.id;
    (layout.texts || []).forEach(function (txt) {
      if (typeof state.texts[txt.key] !== "string") state.texts[txt.key] = "";
    });
    if (state.edit.activeFrameKey && !getFrameByKey(layout, state.edit.activeFrameKey)) state.edit.activeFrameKey = "";
    if (state.edit.selectedFrameKey && !getFrameByKey(layout, state.edit.selectedFrameKey)) state.edit.selectedFrameKey = "";
    if (!state.edit.selectedFrameKey && Array.isArray(layout.photos) && layout.photos.length) state.edit.selectedFrameKey = layout.photos[0].key;
  }

  function getFrameByKey(layout, key) {
    return (layout.photos || []).find(function (frame) { return frame.key === key; }) || null;
  }

  function getFrameDrawArea(frame) {
    return { x: Number(frame.x || 0), y: Number(frame.y || 0), w: Number(frame.w || 0), h: Number(frame.h || 0) + Number(frame.bleedBottom || 0) };
  }

  function shouldDrawFrameBorder(frame, layout) {
    if (typeof frame.border === "boolean") return frame.border;
    return layout.style !== "cover";
  }

  function getTransformKey(frame) {
    return `${state.selectedLayoutId}::${frame.key}`;
  }

  function getPhotoTransform(frame) {
    const key = getTransformKey(frame);
    const existing = state.photoTransforms[key];
    if (existing && typeof existing === "object") return { x: clamp(Number(existing.x || 0), -1, 1), y: clamp(Number(existing.y || 0), -1, 1) };
    state.photoTransforms[key] = { x: 0, y: 0 };
    return state.photoTransforms[key];
  }

  function updateCanvasCursor() {
    if (state.edit.dragging) {
      dom.canvas.style.cursor = "grabbing";
      dom.canvasWrap.classList.add("is-editing-photo");
      return;
    }
    if (state.edit.activeFrameKey) {
      dom.canvas.style.cursor = state.edit.hoverFrameKey === state.edit.activeFrameKey ? "grab" : "crosshair";
      dom.canvasWrap.classList.add("is-editing-photo");
      return;
    }
    dom.canvas.style.cursor = state.edit.hoverFrameKey ? "pointer" : "default";
    dom.canvasWrap.classList.remove("is-editing-photo");
  }

  function applyScale() {
    dom.canvas.style.transform = `scale(${state.scale.toFixed(2)})`;
    dom.zoomValue.textContent = `${Math.round(state.scale * 100)}%`;
  }

  function centerCanvasView() {
    const wrap = dom.canvasWrap;
    if (!wrap) return;
    wrap.scrollLeft = Math.max(0, wrap.scrollWidth - wrap.clientWidth) / 2;
    wrap.scrollTop = Math.max(0, wrap.scrollHeight - wrap.clientHeight) / 2;
  }

  function savePersonalization() {
    const payload = {
      productId: productId,
      layoutId: state.selectedLayoutId,
      templateId: state.selectedTemplateId,
      photos: state.photos,
      texts: state.texts,
      photoTransforms: state.photoTransforms,
      scale: state.scale,
      canvas: print.canvas,
      safeArea: print.safeArea,
      previewPng: dom.canvas.toDataURL("image/png"),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  }

  function loadSavedState() {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      const image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error("Erro ao carregar imagem.")); };
      image.src = src;
    });
  }

  function getBackgroundTemplates(personalizationConfig) {
    if (Array.isArray(personalizationConfig.templates) && personalizationConfig.templates.length) {
      return personalizationConfig.templates.map(function (template, index) {
        const id = template.id || `template-${index + 1}`;
        return {
          id: String(id),
          name: template.name || `Template ${index + 1}`,
          colors: Array.isArray(template.colors) && template.colors.length ? template.colors : ["#f6f1e7", "#eadfc9"],
          src: template.src || "",
          noise: template.noise !== false
        };
      });
    }
    return [{ id: "template-fundo-branco", name: "Fundo Branco", colors: ["#ffffff"], src: "assets/templates/fundo-branco.png", noise: false }];
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function escapeHtml(text) {
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
  }
})();
