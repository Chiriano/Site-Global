/* global fabric */
import {
  ensureSelection,
  getCurrentModel,
  getCurrentTemplate,
  getPhotoForSlot,
  getSelectedSlot,
  getTextsForModel,
  slotStateKey
} from "./personalizar-state.js";

export function initFabric(state, dom) {
  const canvas = new fabric.Canvas(dom.canvas, {
    selection: false,
    preserveObjectStacking: true,
    renderOnAddRemove: false
  });

  const printCanvas = state.print.canvas;
  canvas.setWidth(printCanvas.w);
  canvas.setHeight(printCanvas.h);

  canvas.on("selection:created", (event) => {
    if (event.target) canvas.discardActiveObject();
  });

  state.fabricCanvas = canvas;
  return canvas;
}

export async function renderUI(state, dom) {
  ensureSelection(state);
  renderModelCards(state, dom);
  renderTemplateCards(state, dom);
  renderSlotSelect(state, dom);
  renderTextInputs(state, dom);
  updateZoomLabel(state, dom);
  await renderCanvas(state, dom);
}

export async function renderCanvas(state, dom) {
  const canvas = state.fabricCanvas;
  if (!canvas) return;

  const requestId = ++state.renderVersion;
  canvas.clear();
  state.objectRefs.slotBounds = {};
  state.objectRefs.slotFrames = {};
  state.objectRefs.photoObjects = {};
  state.objectRefs.textObjects = {};

  const printCanvas = state.print.canvas;
  const model = getCurrentModel(state);
  const template = getCurrentTemplate(state);

  const bg = await buildBackgroundObject(state, template, printCanvas.w, printCanvas.h);
  if (state.renderVersion !== requestId) return;
  canvas.add(bg);

  if (model.type !== "moldura") {
    addOuterBorder(canvas, printCanvas.w, printCanvas.h);
    addModelDecorations(canvas, model);
  }

  for (const slot of model.slots) {
    if (model.type !== "moldura") addSlotFrame(canvas, state, model, slot);
    else registerSlotBounds(state, model, slot);
    await addSlotPhoto(canvas, state, model, slot);
    addSlotOverlay(canvas, state, model, slot);
  }

  addTextFields(canvas, state, model);

  if (model.type === "moldura" && model.src) {
    if (state.renderVersion !== requestId) return;
    await addMolduraOverlay(canvas, state, model, printCanvas);
  }

  canvas.requestRenderAll();
}

export function fitCanvasToStage(state, dom) {
  const canvas = state.fabricCanvas;
  if (!canvas) return;
  const stage = dom.canvasStage;
  const bounds = stage.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;

  const pad = 0.96;
  const zoom = Math.min((bounds.width / canvas.getWidth()) * pad, (bounds.height / canvas.getHeight()) * pad);
  applyCanvasZoom(state, dom, clamp(zoom, 0.35, 2.2));
}

export function applyCanvasZoom(state, dom, zoom) {
  const canvas = state.fabricCanvas;
  if (!canvas) return;
  state.canvasZoom = clamp(zoom, 0.35, 2.2);
  const cw = canvas.getWidth();
  const ch = canvas.getHeight();
  canvas.setViewportTransform([state.canvasZoom, 0, 0, state.canvasZoom, (cw - cw * state.canvasZoom) / 2, (ch - ch * state.canvasZoom) / 2]);
  canvas.requestRenderAll();
  updateZoomLabel(state, dom);
}

export function resetView(state, dom) {
  state.canvasZoom = 1;
  applyCanvasZoom(state, dom, 1);
  fitCanvasToStage(state, dom);
}

export function renderSlotSelect(state, dom) {
  const model = getCurrentModel(state);
  const current = state.selectedSlotId;
  dom.slotSelect.innerHTML = model.slots
    .map((slot, index) => `<option value="${escapeHtml(slot.id)}">${escapeHtml(slot.id)} (${index + 1})</option>`)
    .join("");
  if (model.slots.some((slot) => slot.id === current)) {
    dom.slotSelect.value = current;
  } else {
    dom.slotSelect.selectedIndex = 0;
    state.selectedSlotId = model.slots[0]?.id || "";
  }
}

export function renderTextInputs(state, dom) {
  const model = getCurrentModel(state);
  const bag = getTextsForModel(state, model.id);
  dom.textsForm.innerHTML = model.textFields
    .map((field) => {
      const value = bag[field.id] || "";
      return `
        <label class="pz-label" for="txt-${escapeHtml(field.id)}">${escapeHtml(field.label)}</label>
        <input class="pz-input" id="txt-${escapeHtml(field.id)}" data-text-key="${escapeHtml(field.id)}" value="${escapeHtml(value)}" maxlength="140" type="text">
      `;
    })
    .join("");
}

export async function renderModelCards(state, dom) {
  dom.modelGrid.innerHTML = state.models
    .map((model) => {
      const isActive = model.id === state.selectedModelId ? " is-active" : "";
      const thumbSrc = escapeHtml(model.src || "");
      return `<button class="pz-card${isActive}" data-model-id="${escapeHtml(model.id)}" type="button"><img src="${thumbSrc}" alt="${escapeHtml(model.name)}"><span>${escapeHtml(model.name)}</span></button>`;
    })
    .join("");
}

export async function renderTemplateCards(state, dom) {
  const cards = [];
  for (const template of state.templates) {
    const isActive = template.id === state.selectedTemplateId ? " is-active" : "";
    const thumb = await buildTemplateThumbnail(state, template);
    cards.push(`<button class="pz-card${isActive}" data-template-id="${escapeHtml(template.id)}" type="button"><img src="${thumb}" alt="${escapeHtml(template.name)}"><span>${escapeHtml(template.name)}</span></button>`);
  }
  dom.templateGrid.innerHTML = cards.join("");
}

export function updateEditModeHint(state, dom) {
  dom.editModeHint.hidden = !state.isAdjustMode;
}

function updateZoomLabel(state, dom) {
  dom.zoomValue.textContent = `${Math.round(state.canvasZoom * 100)}%`;
}

async function buildBackgroundObject(state, template, w, h) {
  const img = await loadImageElement(state, template.src);
  const bg = new fabric.Image(img, {
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
    hoverCursor: "default"
  });
  bg.scaleToWidth(w);
  if (bg.getScaledHeight() < h) bg.scaleToHeight(h);
  bg.left = (w - bg.getScaledWidth()) / 2;
  bg.top = (h - bg.getScaledHeight()) / 2;
  return bg;
}

function addOuterBorder(canvas, width, height) {
  const margin = Math.round(width * 0.027);
  const lineWidth = Math.max(2, width * 0.0014);
  const gap = lineWidth * 4;

  const r1 = new fabric.Rect({
    left: margin,
    top: margin,
    width: width - margin * 2,
    height: height - margin * 2,
    fill: "transparent",
    stroke: "rgba(182,152,82,0.82)",
    strokeWidth: lineWidth,
    selectable: false,
    evented: false
  });

  const inner = margin + gap;
  const r2 = new fabric.Rect({
    left: inner,
    top: inner,
    width: width - inner * 2,
    height: height - inner * 2,
    fill: "transparent",
    stroke: "rgba(182,152,82,0.7)",
    strokeWidth: lineWidth,
    selectable: false,
    evented: false
  });

  canvas.add(r1, r2, new fabric.Circle({
    left: width / 2 - 7,
    top: margin + gap / 2 - 7,
    radius: 7,
    fill: "rgba(182,152,82,0.85)",
    selectable: false,
    evented: false
  }));
}

function addModelDecorations(canvas, model) {
  if (model.type === "text-photo") {
    canvas.add(new fabric.Line([1060, 720, 1060, 2420], {
      stroke: "rgba(182,152,82,0.75)",
      strokeWidth: 2,
      selectable: false,
      evented: false
    }));
  }
  if (model.type === "album") {
    canvas.add(new fabric.Line([300, 540, 1900, 540], {
      stroke: "rgba(182,152,82,0.6)",
      strokeWidth: 2,
      selectable: false,
      evented: false
    }));
  }
}

function registerSlotBounds(state, model, slot) {
  const key = slotStateKey(model.id, slot.id);
  state.objectRefs.slotBounds[key] = {
    x: slot.x,
    y: slot.y,
    w: slot.width,
    h: slot.height + (slot.bleedBottom || 0),
    r: slot.borderRadius || 0,
    border: false
  };
}

async function addMolduraOverlay(canvas, state, model, printCanvas) {
  const imageEl = await loadImageElement(state, model.src);
  const image = new fabric.Image(imageEl, {
    left: 0,
    top: 0,
    selectable: false,
    evented: false,
    hoverCursor: "default"
  });
  image.scaleToWidth(printCanvas.w);
  if (image.getScaledHeight() < printCanvas.h) image.scaleToHeight(printCanvas.h);
  canvas.add(image);
}

function addSlotFrame(canvas, state, model, slot) {
  const frame = new fabric.Rect({
    left: slot.x,
    top: slot.y,
    width: slot.width,
    height: slot.height + (slot.bleedBottom || 0),
    rx: slot.borderRadius || 0,
    ry: slot.borderRadius || 0,
    fill: "rgba(255,255,255,0.18)",
    stroke: slot.border === false ? "transparent" : "rgba(182,152,82,0.92)",
    strokeWidth: slot.border === false ? 0 : Math.max(2, slot.width * 0.004),
    selectable: false,
    evented: false
  });
  canvas.add(frame);
  const key = slotStateKey(model.id, slot.id);
  state.objectRefs.slotFrames[key] = frame;
  state.objectRefs.slotBounds[key] = {
    x: slot.x,
    y: slot.y,
    w: slot.width,
    h: slot.height + (slot.bleedBottom || 0),
    r: slot.borderRadius || 0,
    border: slot.border !== false
  };
}

async function addSlotPhoto(canvas, state, model, slot) {
  const photo = getPhotoForSlot(state, model.id, slot.id);
  if (!photo?.src) return;

  const key = slotStateKey(model.id, slot.id);
  const bounds = state.objectRefs.slotBounds[key];
  const imageEl = await loadImageElement(state, photo.src);
  const image = new fabric.Image(imageEl, {
    selectable: false,
    evented: false,
    originX: "center",
    originY: "center",
    left: bounds.x + bounds.w / 2,
    top: bounds.y + bounds.h / 2
  });

  const baseScale = Math.max(bounds.w / image.width, bounds.h / image.height);
  const finalScale = baseScale * clamp(photo.scale || 1, 1, 4);
  image.scale(finalScale);
  image.left = bounds.x + bounds.w / 2 + (photo.offsetX || 0);
  image.top = bounds.y + bounds.h / 2 + (photo.offsetY || 0);

  image.clipPath = new fabric.Rect({
    left: bounds.x,
    top: bounds.y,
    width: bounds.w,
    height: bounds.h,
    rx: bounds.r,
    ry: bounds.r,
    absolutePositioned: true
  });

  if (slot.type === "free") image.shadow = "0 12px 26px rgba(0,0,0,0.32)";

  canvas.add(image);
  state.objectRefs.photoObjects[key] = image;

  if (Array.isArray(slot.overlayGradient) && slot.overlayGradient.length) {
    const overlay = new fabric.Rect({
      left: bounds.x,
      top: bounds.y,
      width: bounds.w,
      height: bounds.h,
      selectable: false,
      evented: false
    });

    const gradient = new fabric.Gradient({
      type: "linear",
      gradientUnits: "pixels",
      coords: { x1: bounds.x, y1: bounds.y, x2: bounds.x, y2: bounds.y + bounds.h },
      colorStops: slot.overlayGradient.map(([offset, color]) => ({ offset, color }))
    });

    overlay.set("fill", gradient);
    overlay.clipPath = image.clipPath;
    canvas.add(overlay);
  }
}

function addSlotOverlay(canvas, state, model, slot) {
  const key = slotStateKey(model.id, slot.id);
  const bounds = state.objectRefs.slotBounds[key];
  const isSelected = state.selectedSlotId === slot.id;
  const isAdjust = state.adjustSlotKey === key;

  const overlay = new fabric.Rect({
    left: bounds.x - 6,
    top: bounds.y - 6,
    width: bounds.w + 12,
    height: bounds.h + 12,
    rx: bounds.r + 8,
    ry: bounds.r + 8,
    fill: "transparent",
    stroke: isAdjust ? "rgba(90,158,255,0.95)" : isSelected ? "rgba(241,220,168,0.88)" : "transparent",
    strokeWidth: isAdjust || isSelected ? 4 : 0,
    selectable: false,
    evented: false
  });

  canvas.add(overlay);
}

function addTextFields(canvas, state, model) {
  const texts = getTextsForModel(state, model.id);
  model.textFields.forEach((field) => {
    const value = texts[field.id] || "";
    if (!value) return;
    const text = new fabric.Textbox(value.slice(0, 140), {
      left: field.x,
      top: field.y,
      width: field.maxWidth,
      originX: field.align === "center" ? "center" : "left",
      originY: "top",
      fill: field.fill,
      fontFamily: field.family,
      fontSize: field.fontSize,
      textAlign: field.align,
      selectable: false,
      evented: false,
      editable: false
    });

    canvas.add(text);
    state.objectRefs.textObjects[`${model.id}::${field.id}`] = text;
  });
}

function buildModelThumbnail(templateImg, model, printCanvas) {
  const width = 132;
  const height = 96;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");

  drawImageCover(ctx, templateImg, 0, 0, width, height);
  drawThumbBorder(ctx, width, height);

  const sx = width / printCanvas.w;
  const sy = height / printCanvas.h;
  model.slots.forEach((slot) => {
    const x = slot.x * sx;
    const y = slot.y * sy;
    const w = slot.width * sx;
    const h = (slot.height + (slot.bleedBottom || 0)) * sy;
    roundRect(ctx, x, y, w, h, (slot.borderRadius || 0) * sx);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fill();
    if (slot.border !== false) {
      ctx.strokeStyle = "rgba(182,152,82,0.9)";
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }
  });

  return c.toDataURL("image/png");
}

async function buildTemplateThumbnail(state, template) {
  const width = 132;
  const height = 96;
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  const ctx = c.getContext("2d");
  const img = await loadImageElement(state, template.src);
  drawImageCover(ctx, img, 0, 0, width, height);
  drawThumbBorder(ctx, width, height);
  return c.toDataURL("image/png");
}

function drawThumbBorder(ctx, width, height) {
  const m = 4;
  ctx.strokeStyle = "rgba(182,152,82,0.85)";
  ctx.lineWidth = 1;
  ctx.strokeRect(m, m, width - m * 2, height - m * 2);
  ctx.strokeRect(m + 3, m + 3, width - (m + 3) * 2, height - (m + 3) * 2);
}

export function getSlotFromPointer(state, pointer) {
  const model = getCurrentModel(state);
  const slots = model.slots.slice().reverse();
  for (const slot of slots) {
    const key = slotStateKey(model.id, slot.id);
    const b = state.objectRefs.slotBounds[key];
    if (!b) continue;
    if (pointer.x >= b.x && pointer.x <= b.x + b.w && pointer.y >= b.y && pointer.y <= b.y + b.h) return slot;
  }
  return null;
}

export function getAdjustPhotoObject(state) {
  if (!state.isAdjustMode || !state.adjustSlotKey) return null;
  return state.objectRefs.photoObjects[state.adjustSlotKey] || null;
}

export function getSelectedSlotPhoto(state) {
  const model = getCurrentModel(state);
  return getPhotoForSlot(state, model.id, state.selectedSlotId);
}

export async function loadImageElement(state, src) {
  if (!src) throw new Error("Imagem inválida");
  if (state.assets.images[src]) return state.assets.images[src];
  const image = await new Promise((resolve, reject) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error("Falha ao carregar imagem"));
    el.src = src;
  });
  state.assets.images[src] = image;
  return image;
}

function drawImageCover(ctx, image, x, y, w, h) {
  const boxRatio = w / h;
  const imageRatio = image.width / image.height;
  let sx;
  let sy;
  let sw;
  let sh;
  if (imageRatio > boxRatio) {
    sh = image.height;
    sw = sh * boxRatio;
    sx = (image.width - sw) / 2;
    sy = 0;
  } else {
    sw = image.width;
    sh = sw / boxRatio;
    sx = 0;
    sy = (image.height - sh) / 2;
  }
  ctx.drawImage(image, sx, sy, sw, sh, x, y, w, h);
}

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, Math.min(w, h) / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
