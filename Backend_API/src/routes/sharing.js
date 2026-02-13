const express = require('express');
const router = express.Router({ mergeParams: true });
const sharingStore = require('../services/sharingStore');

router.get('/', async (req, res) => {
  try {
    const data = await sharingStore.load();
    const list = data[req.params.projectId] || [];
    res.json({ shares: list });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { email, role = 'viewer' } = req.body;
    const data = await sharingStore.load();
    const key = req.params.projectId;
    if (!data[key]) data[key] = [];
    data[key].push({ email: email || '', role: role === 'editor' ? 'editor' : 'viewer', addedAt: new Date().toISOString() });
    await sharingStore.save(data);
    res.status(201).json({ email, role: data[key][data[key].length - 1].role });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/shared-with-me', async (req, res) => {
  try {
    const data = await sharingStore.load();
    const email = req.query.email || '';
    const projectIds = Object.entries(data).filter(([, list]) => list.some((s) => s.email === email)).map(([id]) => id);
    res.json({ projectIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
