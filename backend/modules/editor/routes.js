const express = require('express');
const service = require('./service');

const router = express.Router();

router.get('/templates', (req, res) => {
  const templates = service.listTemplates();
  return res.status(200).json({ templates });
});

router.post('/sessions', (req, res) => {
  const session = service.createSession(req.body || {});
  return res.status(201).json({ session });
});

router.get('/sessions/:sessionId', (req, res) => {
  const session = service.getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ error: 'Sessao do editor nao encontrada.' });
  }
  return res.status(200).json({ session });
});

router.put('/sessions/:sessionId', (req, res) => {
  const session = service.updateSession(req.params.sessionId, req.body || {});
  if (!session) {
    return res.status(404).json({ error: 'Sessao do editor nao encontrada.' });
  }
  return res.status(200).json({ session });
});

router.post('/sessions/:sessionId/export', (req, res) => {
  const exported = service.exportSession(req.params.sessionId);
  if (!exported) {
    return res.status(404).json({ error: 'Sessao do editor nao encontrada.' });
  }
  return res.status(200).json({ exported });
});

module.exports = router;
