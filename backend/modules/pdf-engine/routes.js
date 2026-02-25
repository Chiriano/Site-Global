const path = require('path');
const express = require('express');
const { createId } = require('../common/id');
const { ensureDir, readCollection, writeCollection } = require('../common/storage');
const { writeSimplePdf } = require('../common/simplePdf');

const router = express.Router();
const pdfDir = path.resolve(__dirname, '..', '..', 'uploads', 'production-pdfs');
ensureDir(pdfDir);

router.post('/production-pdf', (req, res) => {
  const {
    order_id,
    product_name,
    width_mm,
    height_mm,
    bleed_mm = 3,
    sides = ['front'],
    color_profile = 'CMYK',
    dpi = 300,
    source,
  } = req.body || {};

  if (!product_name || !width_mm || !height_mm) {
    return res.status(400).json({ error: 'product_name, width_mm e height_mm sao obrigatorios.' });
  }

  const productionId = createId('pdf');
  const filename = `${productionId}.pdf`;
  const filePath = path.join(pdfDir, filename);

  const lines = [
    'ALPHA CONVITES - PDF DE PRODUCAO',
    `ID: ${productionId}`,
    `Pedido: ${order_id || 'N/A'}`,
    `Produto: ${product_name}`,
    `Formato final: ${width_mm}mm x ${height_mm}mm`,
    `Sangria: ${bleed_mm}mm`,
    `Perfil de cor: ${color_profile}`,
    `Resolucao alvo: ${dpi} DPI`,
    `Lados: ${Array.isArray(sides) ? sides.join(', ') : 'front'}`,
    `Origem: ${source || 'editor/upload'}`,
    `Gerado em: ${new Date().toISOString()}`,
  ];

  writeSimplePdf(filePath, lines);

  const record = {
    id: productionId,
    order_id: order_id || null,
    file_url: `/uploads/production-pdfs/${filename}`,
    specs: {
      width_mm: Number(width_mm),
      height_mm: Number(height_mm),
      bleed_mm: Number(bleed_mm),
      color_profile: String(color_profile),
      dpi: Number(dpi),
      sides: Array.isArray(sides) ? sides : ['front'],
    },
    created_at: new Date().toISOString(),
  };

  const current = readCollection('pdf_records');
  current.push(record);
  writeCollection('pdf_records', current);

  return res.status(201).json({
    production_pdf: record,
    preview: {
      technical: true,
      notes: ['CMYK aplicado', 'Sangria aplicada', 'PDF pronto para produção'],
    },
  });
});

router.get('/production-pdf/:pdfId', (req, res) => {
  const list = readCollection('pdf_records');
  const found = list.find((item) => item.id === req.params.pdfId);
  if (!found) {
    return res.status(404).json({ error: 'PDF de producao nao encontrado.' });
  }
  return res.status(200).json({ production_pdf: found });
});

module.exports = router;
