const path = require('path');
const fs = require('fs').promises;
const config = require('../config');
const fileStorage = require('./fileStorage');

function getFilePath(projectId) {
  return path.join(fileStorage.STORAGE_ROOT, config.STORAGE_SUBDIR_CONFIG, `${projectId}.json`);
}

async function load(projectId) {
  try {
    const p = getFilePath(projectId);
    const data = await fs.readFile(p, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') return { presets: [], layers: [] };
    throw err;
  }
}

async function save(projectId, config) {
  const p = getFilePath(projectId);
  await fs.mkdir(path.dirname(p), { recursive: true });
  await fs.writeFile(p, JSON.stringify(config, null, 2), 'utf8');
}

module.exports = { load, save };
