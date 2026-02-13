const express = require('express');
const router = express.Router();
const config = require('../config');
const integrationsStore = require('../services/integrationsStore');

router.get('/apikey', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || config.DEFAULT_USER_ID;
    const key = await integrationsStore.getOrCreateApiKey(userId);
    res.json({ apiKey: key });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/webhook', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-user-id'] || config.DEFAULT_USER_ID;
    const webhook = await integrationsStore.getWebhook(userId);
    res.json(webhook || { url: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/webhook', async (req, res) => {
  try {
    const userId = req.body.userId || req.headers['x-user-id'] || config.DEFAULT_USER_ID;
    const url = req.body.url || null;
    const webhook = await integrationsStore.setWebhook(userId, url);
    res.json(webhook || { url: null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
