const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const fileStorage = require('./fileStorage');

let cache = null;

function getFilePath() {
  return path.join(fileStorage.STORAGE_ROOT, config.SHARING_FILENAME);
}

async function load() {
  if (cache !== null) return cache;
  try {
    const p = getFilePath();
    const data = await fs.readFile(p, 'utf8');
    const obj = JSON.parse(data);
    cache = obj && typeof obj === 'object' ? obj : {};
    return cache;
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = {};
      return cache;
    }
    throw err;
  }
}

async function save(data) {
  const p = getFilePath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(data, null, 2), 'utf8');
  cache = data;
}

async function getProjectIdsSharedWith(userId) {
  const data = await load();
  return Object.entries(data).filter(([, list]) => Array.isArray(list) && list.some((s) => s.email === userId)).map(([id]) => id);
}

async function removeProject(projectId) {
  const data = await load();
  delete data[projectId];
  await save(data);
}

function invalidateCache() {
  cache = null;
}

module.exports = { load, save, getProjectIdsSharedWith, removeProject, invalidateCache };
