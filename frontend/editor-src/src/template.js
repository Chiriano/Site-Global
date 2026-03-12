/**
 * template.js — Template do convite usando APENAS tipos suportados pelo Polotno 0.30:
 *   • 'image' — imagens (inclui SVG data URLs para elementos coloridos)
 *   • 'text'  — textos
 *
 * Propriedades suportadas pelo modelo base Element:
 *   id, type, x, y, rotation, opacity, locked, blurEnabled, ...
 *   NÃO inclui: selectable, draggable, resizable, visible
 *
 * ImageElement adiciona: width, height, src, cropX/Y/W/H, cornerRadius, flipX/Y
 * TextElement adiciona: text, fontSize, fontFamily, fontStyle, fontWeight, fill,
 *                       align, width, height, letterSpacing, lineHeight, stroke...
 */

// ── Paleta ────────────────────────────────────────────────────────────────────
const PURPLE_DARK  = '#1E0B3B';
const PURPLE_MED   = '#3B1A72';
const PURPLE_LIGHT = '#7C4BC4';
const GOLD         = '#C9A84C';
const CREAM        = '#FAF7F2';
const GRAY_TEXT    = '#6B6B7B';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Gera um data URL SVG com um retângulo de cor sólida. */
function colorBlock(fill, w, h, rx = 0) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${rx}" ry="${rx}" fill="${fill}"/></svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

/** SVG de placeholder de foto (círculo com ícone de câmera). */
function photoPlaceholder(w, h) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <circle cx="${w/2}" cy="${h/2}" r="${Math.min(w,h)/2}" fill="#E8DFF7"/>
    <text x="${w/2}" y="${h/2 + 10}" font-family="system-ui" font-size="64" text-anchor="middle" fill="#7C4BC4">📷</text>
    <text x="${w/2}" y="${h/2 + 70}" font-family="system-ui" font-size="28" text-anchor="middle" fill="#7C4BC4">Adicionar foto</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Todas as propriedades de elemento bloqueado (somente as do modelo)
const L = { locked: true };

// ── initTemplate ──────────────────────────────────────────────────────────────

/** Popula o store com o template inicial do convite. */
export function initTemplate(store) {
  store.setSize(1200, 1697);

  const page = store.addPage();

  // Background do convite (cor creme)
  page.set({ background: CREAM });

  // ── Barra superior ──────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'topo_barra',
    x: 0, y: 0, width: 1200, height: 110,
    src: colorBlock(PURPLE_DARK, 1200, 110),
  });

  // ── Barra inferior ──────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'rodape_barra',
    x: 0, y: 1587, width: 1200, height: 110,
    src: colorBlock(PURPLE_DARK, 1200, 110),
  });

  // ── Anel externo da foto ────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'foto_ring_ext',
    x: 336, y: 148, width: 528, height: 528,
    src: colorBlock(PURPLE_MED, 528, 528, 264),
    cornerRadius: 264,
  });
  page.addElement({
    ...L, type: 'image', id: 'foto_ring_gold',
    x: 348, y: 160, width: 504, height: 504,
    src: colorBlock(GOLD, 504, 504, 252),
    cornerRadius: 252,
  });

  // ── Placeholder da foto (visível antes do upload) ────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'foto_placeholder',
    x: 360, y: 172, width: 480, height: 480,
    src: photoPlaceholder(480, 480),
    cornerRadius: 240,
  });

  // ── Imagem real da foto (substituída via upload; começa com placeholder) ──
  // Começa com a mesma imagem do placeholder; ao fazer upload, o src muda
  page.addElement({
    ...L, type: 'image', id: 'foto_formando',
    x: 360, y: 172, width: 480, height: 480,
    src: '',         // vazio = transparente; placeholder mostra abaixo
    cornerRadius: 240,
    opacity: 0,      // invisível até ter foto
  });

  // ── Texto do topo ────────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'topo_texto',
    x: 0, y: 28, width: 1200, height: 56,
    text: 'CONVITE DE FORMATURA',
    fontSize: 32, fontFamily: 'Roboto', fontWeight: 'bold',
    align: 'center', letterSpacing: 6, fill: GOLD,
  });

  // ── Divisor 1 ────────────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'divisor_1',
    x: 350, y: 706, width: 500, height: 4,
    src: colorBlock(GOLD, 500, 4),
  });

  // ── Nome do formando (EDITÁVEL) ──────────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'nome_formando',
    x: 60, y: 724, width: 1080, height: 130,
    text: 'Nome do Formando',
    fontSize: 80, fontFamily: 'Roboto', fontWeight: 'bold',
    align: 'center', fill: PURPLE_DARK,
  });

  // ── Curso (EDITÁVEL) ─────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'curso',
    x: 60, y: 868, width: 1080, height: 90,
    text: 'Curso de Formação',
    fontSize: 46, fontFamily: 'Roboto', fontStyle: 'italic',
    align: 'center', fill: PURPLE_LIGHT,
  });

  // ── Divisor 2 ────────────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'divisor_2',
    x: 350, y: 975, width: 500, height: 4,
    src: colorBlock(GOLD, 500, 4),
  });

  // ── Texto fixo ───────────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'convida_texto',
    x: 80, y: 995, width: 1040, height: 70,
    text: 'com prazer convida para a sua Solenidade de Colação de Grau',
    fontSize: 28, fontFamily: 'Roboto', fontStyle: 'italic',
    align: 'center', fill: GRAY_TEXT,
  });

  // ── Data / horário / local (EDITÁVEL) ────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'data_evento',
    x: 60, y: 1082, width: 1080, height: 90,
    text: 'Data · Horário · Local',
    fontSize: 40, fontFamily: 'Roboto', fontWeight: 'bold',
    align: 'center', fill: PURPLE_DARK,
  });

  // ── Divisor 3 ────────────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'image', id: 'divisor_3',
    x: 350, y: 1194, width: 500, height: 4,
    src: colorBlock(GOLD, 500, 4),
  });

  // ── Mensagem pessoal (EDITÁVEL) ──────────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'mensagem',
    x: 100, y: 1215, width: 1000, height: 340,
    text: 'Escreva aqui uma mensagem especial para os seus convidados. Este texto pode ter várias linhas.',
    fontSize: 34, fontFamily: 'Roboto', fontStyle: 'italic',
    align: 'center', fill: GRAY_TEXT,
    lineHeight: 1.5,
  });

  // ── Rodapé ───────────────────────────────────────────────────────────────
  page.addElement({
    ...L, type: 'text', id: 'rodape_texto',
    x: 0, y: 1608, width: 1200, height: 60,
    text: 'Alpha Convites · Sua memória em cada detalhe',
    fontSize: 24, fontFamily: 'Roboto',
    align: 'center', fill: GOLD,
  });
}

// ── Campos editáveis ──────────────────────────────────────────────────────────

export const EDITABLE_FIELDS = [
  { id: 'nome_formando', label: 'Nome do formando',     type: 'input',    maxLen: 60,  baseSize: 80, minSize: 36, scaleAt: 20 },
  { id: 'curso',         label: 'Curso',                type: 'input',    maxLen: 80,  baseSize: 46, minSize: 24, scaleAt: 30 },
  { id: 'data_evento',   label: 'Data, horário e local',type: 'input',    maxLen: 100, baseSize: 40, minSize: 22, scaleAt: 35 },
  { id: 'mensagem',      label: 'Mensagem pessoal',     type: 'textarea', maxLen: 320, baseSize: 34, minSize: 18, scaleAt: 80 },
];

/** Calcula o fontSize ideal baseado no comprimento do texto. */
export function calcFontSize(text, { baseSize, minSize, scaleAt, maxLen }) {
  const len = text.length;
  if (len <= scaleAt) return baseSize;
  const progress = Math.min(1, (len - scaleAt) / (maxLen - scaleAt));
  return Math.round(baseSize - (baseSize - minSize) * progress);
}
