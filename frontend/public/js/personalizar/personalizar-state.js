import { FALLBACK_TEMPLATE, buildEditorModels } from "./personalizar-models.js";

export function createEditorState({ productId, productConfig }) {
  const personalization = productConfig?.personalizacao || {};
  const print = personalization.print || { canvas: { w: 2200, h: 3000 }, safeArea: { x: 50, y: 50, w: 2100, h: 2900 } };
  const templates = normalizeTemplates(personalization.templates);
  const models = buildEditorModels();

  const state = {
    productId,
    productConfig,
    print,
    templates,
    models,
    selectedTemplateId: templates[0].id,
    selectedModelId: models[0].id,
    selectedSlotId: models[0].slots[0]?.id || "",
    photosByKey: {},
    textsByModel: {},
    canvasZoom: 1,
    isAdjustMode: false,
    adjustSlotKey: "",
    drag: { active: false, start: null, photoStart: null },
    fabricCanvas: null,
    objectRefs: { slotBounds: {}, slotFrames: {}, photoObjects: {}, textObjects: {} },
    assets: { images: {} },
    renderVersion: 0,
    storageKey: `alpha_personalizacao_${productId}`
  };

  seedTextDefaults(state);
  hydrateState(state);
  ensureSelection(state);
  return state;
}

export function getCurrentModel(state) {
  return state.models.find((m) => m.id === state.selectedModelId) || state.models[0];
}

export function getCurrentTemplate(state) {
  return state.templates.find((t) => t.id === state.selectedTemplateId) || state.templates[0];
}

export function slotStateKey(modelId, slotId) {
  return `${modelId}::${slotId}`;
}

export function getSelectedSlot(state) {
  const model = getCurrentModel(state);
  return model.slots.find((s) => s.id === state.selectedSlotId) || model.slots[0] || null;
}

export function setPhotoForSlot(state, modelId, slotId, payload) {
  const key = slotStateKey(modelId, slotId);
  state.photosByKey[key] = {
    src: payload.src,
    offsetX: payload.offsetX || 0,
    offsetY: payload.offsetY || 0,
    scale: payload.scale || 1
  };
}

export function getPhotoForSlot(state, modelId, slotId) {
  return state.photosByKey[slotStateKey(modelId, slotId)] || null;
}

export function getTextsForModel(state, modelId) {
  if (!state.textsByModel[modelId]) state.textsByModel[modelId] = {};
  return state.textsByModel[modelId];
}

export function ensureSelection(state) {
  const model = getCurrentModel(state);
  if (!model) return;
  const hasSlot = model.slots.some((slot) => slot.id === state.selectedSlotId);
  if (!hasSlot) state.selectedSlotId = model.slots[0]?.id || "";
}

export function saveState(state, previewPng) {
  const payload = {
    productId: state.productId,
    selectedModelId: state.selectedModelId,
    selectedTemplateId: state.selectedTemplateId,
    selectedSlotId: state.selectedSlotId,
    photosByKey: state.photosByKey,
    textsByModel: state.textsByModel,
    canvasZoom: state.canvasZoom,
    previewPng,
    updatedAt: new Date().toISOString(),
    layoutId: state.selectedModelId,
    templateId: state.selectedTemplateId
  };
  localStorage.setItem(state.storageKey, JSON.stringify(payload));
}

function seedTextDefaults(state) {
  state.models.forEach((model) => {
    const bag = getTextsForModel(state, model.id);
    model.textFields.forEach((field) => {
      if (typeof bag[field.id] !== "string") bag[field.id] = "";
    });
  });
}

function hydrateState(state) {
  try {
    const raw = localStorage.getItem(state.storageKey);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved.selectedModelId) state.selectedModelId = saved.selectedModelId;
    if (saved.selectedTemplateId) state.selectedTemplateId = saved.selectedTemplateId;
    if (saved.selectedSlotId) state.selectedSlotId = saved.selectedSlotId;
    if (saved.photosByKey && typeof saved.photosByKey === "object") state.photosByKey = saved.photosByKey;
    if (saved.textsByModel && typeof saved.textsByModel === "object") state.textsByModel = saved.textsByModel;
    if (typeof saved.canvasZoom === "number") state.canvasZoom = clamp(saved.canvasZoom, 0.35, 2.2);
  } catch (_error) {
    // ignore malformed cache
  }
}

function normalizeTemplates(inputTemplates) {
  if (!Array.isArray(inputTemplates) || !inputTemplates.length) return [FALLBACK_TEMPLATE];
  return inputTemplates.map((template, index) => ({
    id: String(template.id || `template-${index + 1}`),
    name: template.name || `Template ${index + 1}`,
    src: template.src || FALLBACK_TEMPLATE.src
  }));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
