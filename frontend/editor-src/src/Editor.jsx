/**
 * Editor.jsx — Componente principal do editor de convites.
 *
 * Layout:
 *  ┌──────────────────────────────┬─────────────────────┐
 *  │  Workspace (canvas preview)  │   Painel de edição  │
 *  └──────────────────────────────┴─────────────────────┘
 *
 * O canvas é apenas para visualização (todos os elementos estão locked).
 * A edição acontece exclusivamente pelo painel da direita.
 */

import React, { useState, useRef, useCallback } from 'react';
import { observer } from 'mobx-react-lite';
import { Workspace } from 'polotno/canvas/workspace';
import { EDITABLE_FIELDS, calcFontSize } from './template.js';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Localiza um elemento no primeiro page pelo id. */
function getEl(store, id) {
  return store.pages[0]?.children?.find(e => e.id === id) ?? null;
}

/** Lê um arquivo como Data URL. */
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── PhotoUpload ───────────────────────────────────────────────────────────────

const PhotoUpload = observer(({ store }) => {
  const inputRef   = useRef(null);
  const [preview, setPreview] = useState(null);
  const [loading,  setLoading]  = useState(false);

  const handleChange = useCallback(async e => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const dataUrl = await readFileAsDataURL(file);
      setPreview(dataUrl);

      // Atualiza o elemento de imagem no canvas
      const imgEl  = getEl(store, 'foto_formando');
      const pTxt   = getEl(store, 'foto_placeholder_txt');
      const pRect  = getEl(store, 'foto_placeholder');

      if (imgEl)  imgEl.set({ src: dataUrl, opacity: 1 });
      if (pRect)  pRect.set({ opacity: 0 });
    } catch (err) {
      console.error('[Editor] Erro ao carregar foto:', err);
    } finally {
      setLoading(false);
      // Limpa input para permitir re-upload do mesmo arquivo
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [store]);

  return (
    <div className="ctrl-photo">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleChange}
        id="photo-file-input"
        style={{ display: 'none' }}
      />

      {preview ? (
        <div className="photo-preview-wrap">
          <img src={preview} alt="Foto selecionada" className="photo-preview-img" />
          <button
            className="photo-change-btn"
            onClick={() => inputRef.current?.click()}
            type="button"
          >
            Trocar foto
          </button>
        </div>
      ) : (
        <button
          className="photo-upload-btn"
          onClick={() => inputRef.current?.click()}
          type="button"
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" aria-label="Carregando" />
          ) : (
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          )}
          <span>{loading ? 'Carregando...' : 'Escolher foto'}</span>
          <small>JPG, PNG ou WEBP</small>
        </button>
      )}
    </div>
  );
});

// ── TextField ─────────────────────────────────────────────────────────────────

const TextField = observer(({ store, field }) => {
  const [value, setValue] = useState('');

  const handleChange = useCallback(e => {
    const text = e.target.value;
    // Limita ao máximo
    if (text.length > field.maxLen) return;

    setValue(text);

    const el = getEl(store, field.id);
    if (!el) return;

    const displayText = text || getPlaceholder(field.id);
    const fontSize    = calcFontSize(text, field);

    el.set({ text: displayText, fontSize });
  }, [store, field]);

  const count    = value.length;
  const atLimit  = count >= field.maxLen;
  const nearLimit = count >= field.maxLen * 0.85;

  if (field.type === 'textarea') {
    return (
      <div className="ctrl-field">
        <label className="ctrl-label" htmlFor={`field-${field.id}`}>
          {field.label}
        </label>
        <textarea
          id={`field-${field.id}`}
          className="ctrl-textarea"
          value={value}
          onChange={handleChange}
          placeholder={`Digite ${field.label.toLowerCase()}...`}
          rows={4}
        />
        <span className={`ctrl-counter ${nearLimit ? (atLimit ? 'ctrl-counter--full' : 'ctrl-counter--near') : ''}`}>
          {count}/{field.maxLen}
        </span>
      </div>
    );
  }

  return (
    <div className="ctrl-field">
      <label className="ctrl-label" htmlFor={`field-${field.id}`}>
        {field.label}
      </label>
      <input
        id={`field-${field.id}`}
        type="text"
        className="ctrl-input"
        value={value}
        onChange={handleChange}
        placeholder={`Digite ${field.label.toLowerCase()}...`}
        maxLength={field.maxLen}
      />
      <span className={`ctrl-counter ${nearLimit ? (atLimit ? 'ctrl-counter--full' : 'ctrl-counter--near') : ''}`}>
        {count}/{field.maxLen}
      </span>
    </div>
  );
});

/** Texto exibido no canvas quando o campo está vazio. */
function getPlaceholder(id) {
  const map = {
    nome_formando: 'Nome do Formando',
    curso:         'Curso de Formação',
    data_evento:   'Data · Horário · Local',
    mensagem:      'Escreva aqui uma mensagem especial para os seus convidados.',
  };
  return map[id] ?? '';
}

// ── ExportPanel ───────────────────────────────────────────────────────────────

const ExportPanel = observer(({ store }) => {
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);

  const handleExport = useCallback(async () => {
    setLoading(true);
    setDone(false);
    try {
      // Renderiza em 2× para qualidade de impressão
      const dataUrl = await store.toDataURL({ mimeType: 'image/png', pixelRatio: 2 });
      const link    = document.createElement('a');
      link.download = 'meu-convite-alpha.png';
      link.href     = dataUrl;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDone(true);
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      console.error('[Editor] Erro ao exportar:', err);
      alert('Não foi possível gerar o arquivo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [store]);

  return (
    <div className="ctrl-export">
      <button
        className={`btn-export ${loading ? 'btn-export--loading' : ''} ${done ? 'btn-export--done' : ''}`}
        onClick={handleExport}
        disabled={loading}
        type="button"
      >
        {loading ? (
          <>
            <span className="spinner" />
            Gerando PNG...
          </>
        ) : done ? (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Arquivo baixado!
          </>
        ) : (
          <>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Baixar convite (PNG)
          </>
        )}
      </button>
      <p className="export-note">Alta resolução · pronto para impressão</p>
    </div>
  );
});

// ── Editor (componente raiz) ──────────────────────────────────────────────────

export const Editor = observer(({ store }) => {
  return (
    <div className="editor-layout">

      {/* ── Canvas / preview ── */}
      <section className="editor-workspace" aria-label="Preview do convite">
        <div className="workspace-label">
          <span className="workspace-dot"></span>
          Preview ao vivo
        </div>
        <div className="workspace-frame">
          <Workspace
            store={store}
            components={{
              Toolbar:      () => null,
              PageControls: () => null,
            }}
          />
        </div>
        <p className="workspace-hint">
          O preview atualiza enquanto você edita
        </p>
      </section>

      {/* ── Painel de edição ── */}
      <aside className="editor-panel" aria-label="Controles de edição">

        <div className="panel-header">
          <h2 className="panel-title">Personalizar convite</h2>
          <p className="panel-sub">Edite os campos abaixo — o preview atualiza automaticamente.</p>
        </div>

        {/* Foto */}
        <div className="ctrl-section">
          <h3 className="ctrl-section-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Foto do formando
          </h3>
          <PhotoUpload store={store} />
        </div>

        <div className="ctrl-divider" />

        {/* Textos */}
        <div className="ctrl-section">
          <h3 className="ctrl-section-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
            Textos do convite
          </h3>
          {EDITABLE_FIELDS.map(field => (
            <TextField key={field.id} store={store} field={field} />
          ))}
        </div>

        <div className="ctrl-divider" />

        {/* Export */}
        <ExportPanel store={store} />

      </aside>
    </div>
  );
});
