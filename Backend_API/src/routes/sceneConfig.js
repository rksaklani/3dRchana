const express = require('express');
const router = express.Router({ mergeParams: true });
const config = require('../config');
const sceneConfigStore = require('../services/sceneConfigStore');

router.get('/', async (req, res) => {
  try {
    const sceneConfig = await sceneConfigStore.load(req.params.projectId);
    res.setHeader('Cache-Control', `private, max-age=${config.CACHE_MAX_AGE_CONFIG}`);
    res.json(sceneConfig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/', async (req, res) => {
  try {
    const body = req.body || { presets: [], layers: [] };
    await sceneConfigStore.save(req.params.projectId, body);
    res.json(body);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
