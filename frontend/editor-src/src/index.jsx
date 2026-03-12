/**
 * index.jsx — Ponto de entrada do editor Polotno.
 */

import React    from 'react';
import ReactDOM from 'react-dom/client';
import { createStore } from 'polotno/model/store';
import { Editor } from './Editor.jsx';
import { initTemplate } from './template.js';

// ─── Helpers de erro ──────────────────────────────────────────────────────────

function showFatalError(msg) {
  const loading = document.getElementById('editor-loading');
  const errBox  = document.getElementById('editor-error');
  const errPre  = document.getElementById('editor-error-detail');
  if (loading) loading.hidden = true;
  if (errBox)  errBox.hidden  = false;
  if (errPre)  errPre.textContent = msg;
  console.error('[Editor] Fatal:', msg);
}

// ─── Inicialização ────────────────────────────────────────────────────────────

try {
  const rootEl = document.getElementById('polotno-editor');
  if (!rootEl) throw new Error('Elemento #polotno-editor não encontrado no DOM.');

  // Chave de desenvolvimento — registre-se em https://polotno.com/cabinet
  const POLOTNO_KEY = 'nFA5H9elEytDyPyvKL7T';
  const store = createStore({ key: POLOTNO_KEY });

  initTemplate(store);

  const root = ReactDOM.createRoot(rootEl);
  root.render(<Editor store={store} />);

  // Sinaliza que o React foi montado
  window.EDITOR_READY = true;
} catch (err) {
  showFatalError(String(err));
}
