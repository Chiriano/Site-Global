import {
  ensureSelection,
  getCurrentModel,
  getPhotoForSlot,
  getSelectedSlot,
  getTextsForModel,
  saveState,
  setPhotoForSlot,
  slotStateKey
} from "./personalizar-state.js";
/* global fabric */
import {
  applyCanvasZoom,
  fitCanvasToStage,
  getAdjustPhotoObject,
  getSlotFromPointer,
  renderCanvas,
  renderSlotSelect,
  renderUI,
  updateEditModeHint
} from "./personalizar-render.js";

export function bindEvents(state, dom) {
  dom.modelGrid.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-model-id]");
    if (!card) return;
    const modelId = card.getAttribute("data-model-id");
    if (!modelId || modelId === state.selectedModelId) return;
    state.selectedModelId = modelId;
    ensureSelection(state);
    exitAdjustMode(state, dom);
    await renderUI(state, dom);
  });

  dom.templateGrid.addEventListener("click", async (event) => {
    const card = event.target.closest("[data-template-id]");
    if (!card) return;
    const templateId = card.getAttribute("data-template-id");
    if (!templateId || templateId === state.selectedTemplateId) return;
    state.selectedTemplateId = templateId;
    await renderUI(state, dom);
  });

  dom.slotSelect.addEventListener("change", async () => {
    state.selectedSlotId = dom.slotSelect.value;
    exitAdjustMode(state, dom);
    await renderCanvas(state, dom);
  });

  dom.fotoInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const slot = getSelectedSlot(state);
    if (!slot) return showToast(dom, "Selecione um quadro.", true);
    const dataUrl = await readFileAsDataUrl(file);
    setPhotoForSlot(state, state.selectedModelId, slot.id, {
      src: dataUrl,
      offsetX: 0,
      offsetY: 0,
      scale: 1
    });
    await renderCanvas(state, dom);
    showToast(dom, "Foto aplicada no quadro selecionado.");
  });

  dom.textsForm.addEventListener("input", async (event) => {
    const input = event.target.closest("[data-text-key]");
    if (!input) return;
    const key = input.getAttribute("data-text-key");
    const bag = getTextsForModel(state, state.selectedModelId);
    bag[key] = input.value;
    await renderCanvas(state, dom);
  });

  dom.btnSalvar.addEventListener("click", () => {
    saveState(state, state.fabricCanvas.toDataURL({ format: "png", quality: 1 }));
    showToast(dom, "Personalização salva.");
  });

  dom.btnAvancar.addEventListener("click", () => {
    saveState(state, state.fabricCanvas.toDataURL({ format: "png", quality: 1 }));
    window.location.href = `visualizar.html?id=${encodeURIComponent(state.productId)}`;
  });

  dom.btnZoomPlus.addEventListener("click", () => applyCanvasZoom(state, dom, state.canvasZoom + 0.08));
  dom.btnZoomMinus.addEventListener("click", () => applyCanvasZoom(state, dom, state.canvasZoom - 0.08));
  dom.btnFit.addEventListener("click", () => fitCanvasToStage(state, dom));
  dom.btnReset.addEventListener("click", async () => {
    await resetSelectedSlotPhoto(state, dom);
  });

  window.addEventListener("resize", () => fitCanvasToStage(state, dom));

  const canvas = state.fabricCanvas;

  canvas.on("mouse:down", async (opt) => {
    const pointer = canvas.getPointer(opt.e);
    const slot = getSlotFromPointer(state, pointer);

    if (slot) {
      state.selectedSlotId = slot.id;
      renderSlotSelect(state, dom);
      await renderCanvas(state, dom);
    }

    if (!state.isAdjustMode) return;

    const adjustPhotoObject = getAdjustPhotoObject(state);
    if (!adjustPhotoObject) {
      exitAdjustMode(state, dom);
      return;
    }

    const activeSlot = getSelectedSlot(state);
    if (!activeSlot) return;
    const key = slotStateKey(state.selectedModelId, activeSlot.id);
    if (key !== state.adjustSlotKey) return;

    state.drag.active = true;
    state.drag.start = pointer;

    const photo = getPhotoForSlot(state, state.selectedModelId, activeSlot.id);
    state.drag.photoStart = { x: photo?.offsetX || 0, y: photo?.offsetY || 0 };
  });

  canvas.on("mouse:move", async (opt) => {
    if (!state.drag.active || !state.isAdjustMode) return;
    const slot = getSelectedSlot(state);
    if (!slot) return;

    const pointer = canvas.getPointer(opt.e);
    const dx = pointer.x - state.drag.start.x;
    const dy = pointer.y - state.drag.start.y;

    const photo = getPhotoForSlot(state, state.selectedModelId, slot.id);
    if (!photo) return;

    const model = getCurrentModel(state);
    const key = slotStateKey(model.id, slot.id);
    const bounds = state.objectRefs.slotBounds[key];
    const imageObj = state.objectRefs.photoObjects[key];
    if (!bounds || !imageObj) return;

    const maxX = Math.max(0, (imageObj.getScaledWidth() - bounds.w) / 2);
    const maxY = Math.max(0, (imageObj.getScaledHeight() - bounds.h) / 2);

    photo.offsetX = clamp(state.drag.photoStart.x + dx, -maxX, maxX);
    photo.offsetY = clamp(state.drag.photoStart.y + dy, -maxY, maxY);
    await renderCanvas(state, dom);
  });

  canvas.on("mouse:up", () => {
    state.drag.active = false;
  });

  canvas.on("mouse:wheel", async (opt) => {
    if (!state.isAdjustMode) return;
    const slot = getSelectedSlot(state);
    if (!slot) return;

    const pointer = canvas.getPointer(opt.e);
    const hitSlot = getSlotFromPointer(state, pointer);
    if (!hitSlot || hitSlot.id !== slot.id) return;

    const photo = getPhotoForSlot(state, state.selectedModelId, slot.id);
    if (!photo) return;

    const delta = opt.e.deltaY;
    const factor = delta < 0 ? 1.05 : 0.95;
    photo.scale = clamp((photo.scale || 1) * factor, 1, 4);
    await renderCanvas(state, dom);

    opt.e.preventDefault();
    opt.e.stopPropagation();
  });

  canvas.upperCanvasEl.addEventListener("dblclick", async (event) => {
    const pointer = canvas.getPointer(event);
    const slot = getSlotFromPointer(state, pointer);
    if (!slot) {
      exitAdjustMode(state, dom);
      await renderCanvas(state, dom);
      return;
    }

    const photo = getPhotoForSlot(state, state.selectedModelId, slot.id);
    if (!photo) {
      showToast(dom, "Envie uma foto para este quadro primeiro.", true);
      return;
    }

    state.selectedSlotId = slot.id;
    renderSlotSelect(state, dom);

    const key = slotStateKey(state.selectedModelId, slot.id);
    if (state.isAdjustMode && state.adjustSlotKey === key) {
      exitAdjustMode(state, dom);
    } else {
      state.isAdjustMode = true;
      state.adjustSlotKey = key;
    }
    updateEditModeHint(state, dom);
    await renderCanvas(state, dom);
  });

  document.addEventListener("keydown", async (event) => {
    if (event.key === "Escape" && state.isAdjustMode) {
      exitAdjustMode(state, dom);
      await renderCanvas(state, dom);
    }
  });

  dom.canvasStage.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  dom.canvasStage.addEventListener("drop", async (event) => {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !/^image\//.test(file.type)) return;

    const point = pointerFromClient(state, event.clientX, event.clientY);
    if (!point) return;

    const slot = getSlotFromPointer(state, point);
    if (slot) {
      state.selectedSlotId = slot.id;
      renderSlotSelect(state, dom);
    }

    const selected = getSelectedSlot(state);
    if (!selected) return showToast(dom, "Selecione um quadro para upload.", true);

    const dataUrl = await readFileAsDataUrl(file);
    setPhotoForSlot(state, state.selectedModelId, selected.id, { src: dataUrl, offsetX: 0, offsetY: 0, scale: 1 });
    await renderCanvas(state, dom);
    showToast(dom, "Foto enviada com sucesso.");
  });
}

export function exitAdjustMode(state, dom) {
  state.isAdjustMode = false;
  state.adjustSlotKey = "";
  state.drag.active = false;
  state.drag.start = null;
  state.drag.photoStart = null;
  updateEditModeHint(state, dom);
}

async function resetSelectedSlotPhoto(state, dom) {
  const slot = getSelectedSlot(state);
  if (!slot) return showToast(dom, "Selecione um quadro para resetar.", true);
  const photo = getPhotoForSlot(state, state.selectedModelId, slot.id);
  if (!photo) return showToast(dom, "Esse quadro ainda não tem foto.", true);

  photo.offsetX = 0;
  photo.offsetY = 0;
  photo.scale = 1;
  await renderCanvas(state, dom);
  showToast(dom, "Enquadramento resetado.");
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Falha ao ler arquivo"));
    reader.readAsDataURL(file);
  });
}

function showToast(dom, message, isError = false) {
  const el = document.createElement("div");
  el.className = `pz-toast${isError ? " is-error" : ""}`;
  el.textContent = message;
  dom.toastArea.appendChild(el);
  requestAnimationFrame(() => el.classList.add("show"));
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 220);
  }, 1700);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pointerFromClient(state, clientX, clientY) {
  const canvas = state.fabricCanvas;
  if (!canvas) return null;
  const rect = canvas.upperCanvasEl.getBoundingClientRect();
  if (!rect.width || !rect.height) return null;
  const x = (clientX - rect.left) * (canvas.getWidth() / rect.width);
  const y = (clientY - rect.top) * (canvas.getHeight() / rect.height);
  const inv = fabric.util.invertTransform(canvas.viewportTransform);
  return fabric.util.transformPoint(new fabric.Point(x, y), inv);
}
