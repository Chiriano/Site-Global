const fs = require('fs');
const path = require('path');
const { createId } = require('../common/id');
const { ensureDir, readCollection, writeCollection, upsert } = require('../common/storage');

const EXPORT_DIR = path.resolve(__dirname, '..', '..', 'uploads', 'editor-exports');
const TEMPLATE_NAMESPACE = 'editor_templates';
const SESSION_NAMESPACE = 'editor_sessions';

const defaultTemplates = [
  {
    id: 'tpl_cartao_frente_verso',
    name: 'Cartao de Visita Frente e Verso',
    width_mm: 90,
    height_mm: 50,
    bleed_mm: 3,
    sides: ['front', 'back'],
  },
  {
    id: 'tpl_flyer_a5',
    name: 'Flyer A5',
    width_mm: 148,
    height_mm: 210,
    bleed_mm: 3,
    sides: ['front'],
  },
];

function ensureDefaultTemplates() {
  const existing = readCollection(TEMPLATE_NAMESPACE);
  if (!existing.length) {
    writeCollection(TEMPLATE_NAMESPACE, defaultTemplates);
    return defaultTemplates;
  }
  return existing;
}

function listTemplates() {
  return ensureDefaultTemplates();
}

function createSession(payload) {
  const templates = ensureDefaultTemplates();
  const template = templates.find((item) => item.id === payload.template_id) || null;

  const session = {
    id: createId('eds'),
    product_id: payload.product_id || null,
    template_id: template ? template.id : null,
    width_mm: Number(payload.width_mm || template?.width_mm || 0),
    height_mm: Number(payload.height_mm || template?.height_mm || 0),
    bleed_mm: Number(payload.bleed_mm || template?.bleed_mm || 3),
    sides: Array.isArray(payload.sides) && payload.sides.length ? payload.sides : (template?.sides || ['front']),
    layers: Array.isArray(payload.layers) ? payload.layers : [],
    metadata: payload.metadata || {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const current = readCollection(SESSION_NAMESPACE);
  current.push(session);
  writeCollection(SESSION_NAMESPACE, current);
  return session;
}

function getSession(sessionId) {
  const sessions = readCollection(SESSION_NAMESPACE);
  return sessions.find((item) => item.id === sessionId) || null;
}

function updateSession(sessionId, payload) {
  const current = getSession(sessionId);
  if (!current) return null;

  const next = {
    ...current,
    layers: Array.isArray(payload.layers) ? payload.layers : current.layers,
    metadata: payload.metadata ? { ...current.metadata, ...payload.metadata } : current.metadata,
    sides: Array.isArray(payload.sides) && payload.sides.length ? payload.sides : current.sides,
    width_mm: payload.width_mm ? Number(payload.width_mm) : current.width_mm,
    height_mm: payload.height_mm ? Number(payload.height_mm) : current.height_mm,
    bleed_mm: payload.bleed_mm ? Number(payload.bleed_mm) : current.bleed_mm,
    updated_at: new Date().toISOString(),
  };

  return upsert(SESSION_NAMESPACE, (item) => item.id === sessionId, next);
}

function exportSession(sessionId) {
  const session = getSession(sessionId);
  if (!session) return null;

  ensureDir(EXPORT_DIR);
  const exportId = createId('exp');
  const exportPath = path.join(EXPORT_DIR, `${exportId}.json`);
  const exportPayload = {
    export_id: exportId,
    session_id: session.id,
    export_mode: 'print-ready',
    color_profile: 'CMYK',
    dpi: 300,
    bleed_mm: session.bleed_mm || 3,
    trim_size_mm: {
      width: session.width_mm,
      height: session.height_mm,
    },
    sides: session.sides,
    layers: session.layers,
    metadata: session.metadata,
    created_at: new Date().toISOString(),
  };

  fs.writeFileSync(exportPath, JSON.stringify(exportPayload, null, 2), 'utf8');
  return {
    ...exportPayload,
    export_url: `/uploads/editor-exports/${path.basename(exportPath)}`,
  };
}

module.exports = {
  listTemplates,
  createSession,
  getSession,
  updateSession,
  exportSession,
};
