const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router({ mergeParams: true });
const annotationsStore = require('../services/annotationsStore');

router.get('/', async (req, res) => {
  try {
    const list = await annotationsStore.load(req.params.projectId);
    res.json({ annotations: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { position, text, authorId, authorName } = req.body;
    const list = await annotationsStore.load(req.params.projectId);
    const id = uuidv4();
    const annotation = {
      id,
      position: position || { x: 0, y: 0, z: 0 },
      text: text || '',
      authorId: authorId || '',
      authorName: authorName || 'Anonymous',
      createdAt: new Date().toISOString()
    };
    list.push(annotation);
    await annotationsStore.save(req.params.projectId, list);
    res.status(201).json(annotation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const list = await annotationsStore.load(req.params.projectId);
    const next = list.filter((a) => a.id !== req.params.id);
    if (next.length === list.length) return res.status(404).json({ error: 'Annotation not found' });
    await annotationsStore.save(req.params.projectId, next);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
