const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const fileStorage = require('./fileStorage');
const { v4: uuidv4 } = require('uuid');

function getFilePath() {
  return path.join(fileStorage.STORAGE_ROOT, config.INTEGRATIONS_FILENAME);
}

async function load() {
  try {
    const p = getFilePath();
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return { apiKeys: {}, webhooks: {} };
    throw err;
  }
}

async function save(data) {
  const p = getFilePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
}

async function getOrCreateApiKey(userId) {
  const data = await load();
  if (!data.apiKeys) data.apiKeys = {};
  if (!data.apiKeys[userId]) data.apiKeys[userId] = { key: uuidv4().replace(/-/g, ''), createdAt: new Date().toISOString() };
  await save(data);
  return data.apiKeys[userId].key;
}

async function getWebhook(userId) {
  const data = await load();
  return (data.webhooks && data.webhooks[userId]) || null;
}

async function setWebhook(userId, url) {
  const data = await load();
  if (!data.webhooks) data.webhooks = {};
  data.webhooks[userId] = url ? { url, updatedAt: new Date().toISOString() } : null;
  await save(data);
  return data.webhooks[userId];
}

async function getUserIdByApiKey(apiKey) {
  if (!apiKey) return null;
  const data = await load();
  if (!data.apiKeys) return null;
  for (const [userId, obj] of Object.entries(data.apiKeys)) {
    if (obj && obj.key === apiKey) return userId;
  }
  return null;
}

module.exports = { load, save, getOrCreateApiKey, getWebhook, setWebhook, getUserIdByApiKey };
