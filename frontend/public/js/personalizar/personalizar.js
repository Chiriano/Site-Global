import { bindEvents } from "./personalizar-events.js";
import { createEditorState } from "./personalizar-state.js";
import { fitCanvasToStage, initFabric, renderUI, resetView } from "./personalizar-render.js";

const params = new URLSearchParams(window.location.search);
const productId = Number(params.get("id") || 1);
const productConfig = window.productConfigs?.[productId];

if (!productConfig) {
  alert("Produto não encontrado para personalização.");
  window.location.href = "convite-product.html";
} else {
  bootstrap();
}

async function bootstrap() {
  const dom = getDom();
  dom.btnVoltar.href = `convite-product.html?id=${encodeURIComponent(productId)}`;

  const state = createEditorState({ productId, productConfig });
  initFabric(state, dom);
  await renderUI(state, dom);
  fitCanvasToStage(state, dom);

  if (state.canvasZoom === 1) {
    resetView(state, dom);
  }

  bindEvents(state, dom);
}

function getDom() {
  return {
    btnVoltar: document.getElementById("btn-voltar"),
    btnAvancar: document.getElementById("btn-avancar"),
    btnSalvar: document.getElementById("btn-salvar"),
    btnFit: document.getElementById("btn-fit"),
    btnZoomPlus: document.getElementById("btn-zoom-plus"),
    btnZoomMinus: document.getElementById("btn-zoom-minus"),
    btnReset: document.getElementById("btn-reset"),
    zoomValue: document.getElementById("zoom-value"),
    modelGrid: document.getElementById("model-grid"),
    templateGrid: document.getElementById("template-grid"),
    slotSelect: document.getElementById("slot-select"),
    fotoInput: document.getElementById("foto-input"),
    textsForm: document.getElementById("texts-form"),
    canvasStage: document.getElementById("canvas-stage"),
    canvas: document.getElementById("editor-canvas"),
    toastArea: document.getElementById("toast-area"),
    editModeHint: document.getElementById("edit-mode-hint")
  };
}
