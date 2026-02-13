const express = require('express');
const router = express.Router();
const config = require('../config');
const fileStorage = require('../services/fileStorage');

router.get('/', async (req, res) => {
  try {
    const levels = await fileStorage.listProcessedLevels(req.params.projectId);
    res.setHeader('Cache-Control', `private, max-age=${config.CACHE_MAX_AGE_LEVELS}`);
    res.json(levels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
