const path = require('path');
const express = require('express');
const multer = require('multer');
const { createId } = require('../common/id');
const { ensureDir, readCollection, writeCollection } = require('../common/storage');
const { readImageMeta } = require('../common/imageMeta');
const { validatePrintResolution } = require('../common/printValidation');

const router = express.Router();
const uploadDir = path.resolve(__dirname, '..', '..', 'uploads', 'customer-files');
ensureDir(uploadDir);

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'application/pdf',
  'application/postscript',
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || '').toLowerCase();
      cb(null, `${Date.now()}-${createId('upl')}${ext}`);
    },
  }),
  limits: {
    fileSize: 25 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error('Tipo de arquivo invalido. Envie PNG, JPG, PDF ou AI/PS.'));
    }
    return cb(null, true);
  },
});

router.post('/file', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Arquivo nao enviado.' });
  }

  const validationSpec = {
    width_mm: req.body.width_mm,
    height_mm: req.body.height_mm,
    bleed_mm: req.body.bleed_mm,
  };

  let printValidation = null;
  if (req.file.mimetype === 'image/png' || req.file.mimetype === 'image/jpeg') {
    const imageMeta = readImageMeta(req.file.path);
    if (imageMeta) {
      printValidation = validatePrintResolution(imageMeta, validationSpec);
    }
  }

  const record = {
    id: createId('file'),
    original_name: req.file.originalname,
    mime_type: req.file.mimetype,
    size_bytes: req.file.size,
    file_url: `/uploads/customer-files/${req.file.filename}`,
    file_path: req.file.path,
    validation: printValidation,
    created_at: new Date().toISOString(),
  };

  const current = readCollection('upload_files');
  current.push(record);
  writeCollection('upload_files', current);

  return res.status(201).json({
    file: {
      id: record.id,
      original_name: record.original_name,
      mime_type: record.mime_type,
      size_bytes: record.size_bytes,
      file_url: record.file_url,
      validation: record.validation,
      warnings: printValidation && !printValidation.ok ? [printValidation.reason] : [],
    },
  });
});

router.get('/files/:fileId', (req, res) => {
  const files = readCollection('upload_files');
  const found = files.find((item) => item.id === req.params.fileId);
  if (!found) {
    return res.status(404).json({ error: 'Arquivo nao encontrado.' });
  }

  return res.status(200).json({
    file: {
      id: found.id,
      original_name: found.original_name,
      mime_type: found.mime_type,
      size_bytes: found.size_bytes,
      file_url: found.file_url,
      validation: found.validation,
      created_at: found.created_at,
    },
  });
});

module.exports = router;
