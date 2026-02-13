const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const fileStorage = require('./fileStorage');

let cache = null;

function getProjectsPath() {
  return path.join(fileStorage.STORAGE_ROOT, config.PROJECTS_FILENAME);
}

async function load() {
  if (cache !== null) return cache;
  try {
    const p = getProjectsPath();
    const data = await fs.readFile(p, 'utf8');
    const list = JSON.parse(data);
    cache = Array.isArray(list) ? list : [];
    return cache;
  } catch (err) {
    if (err.code === 'ENOENT') {
      cache = [];
      return cache;
    }
    throw err;
  }
}

async function save(projects) {
  const p = getProjectsPath();
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(projects, null, 2), 'utf8');
  cache = projects;
}

function invalidateCache() {
  cache = null;
}

module.exports = { load, save, getProjectsPath, invalidateCache };
