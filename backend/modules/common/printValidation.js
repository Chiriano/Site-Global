const MM_PER_INCH = 25.4;
const PRINT_DPI = 300;
const DEFAULT_BLEED_MM = 3;

function mmToPixels(mm, dpi = PRINT_DPI) {
  return Math.ceil((Number(mm) / MM_PER_INCH) * dpi);
}

function getRequiredPixels(widthMm, heightMm, bleedMm = DEFAULT_BLEED_MM) {
  const totalWidth = Number(widthMm) + (Number(bleedMm) * 2);
  const totalHeight = Number(heightMm) + (Number(bleedMm) * 2);
  return {
    minWidthPx: mmToPixels(totalWidth),
    minHeightPx: mmToPixels(totalHeight),
  };
}

function validatePrintResolution(meta, spec) {
  const widthMm = Number(spec.width_mm || 0);
  const heightMm = Number(spec.height_mm || 0);
  const bleedMm = Number(spec.bleed_mm || DEFAULT_BLEED_MM);
  const widthPx = Number(meta.width || 0);
  const heightPx = Number(meta.height || 0);

  if (!widthMm || !heightMm || !widthPx || !heightPx) {
    return {
      ok: false,
      reason: 'Dados insuficientes para validar resolução de impressão.',
      required: null,
      actual: { widthPx, heightPx },
    };
  }

  const required = getRequiredPixels(widthMm, heightMm, bleedMm);
  const ok = widthPx >= required.minWidthPx && heightPx >= required.minHeightPx;

  return {
    ok,
    reason: ok ? null : 'Arquivo abaixo da resolução mínima para 300 DPI com sangria.',
    required,
    actual: { widthPx, heightPx },
    printDpi: PRINT_DPI,
    bleedMm,
  };
}

module.exports = {
  MM_PER_INCH,
  PRINT_DPI,
  DEFAULT_BLEED_MM,
  mmToPixels,
  getRequiredPixels,
  validatePrintResolution,
};
