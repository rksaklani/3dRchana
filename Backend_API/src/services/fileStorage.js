const path = require('path');
const fs = require('fs').promises;
const config = require('../config');

const STORAGE_ROOT = config.STORAGE_ROOT;
const RAW = config.STORAGE_SUBDIR_RAW;
const PROCESSED = config.STORAGE_SUBDIR_PROCESSED;
const ANNOTATIONS_DIR = config.STORAGE_SUBDIR_ANNOTATIONS;
const CONFIG_DIR = config.STORAGE_SUBDIR_CONFIG;

async function getRawPath(projectId, ...subpaths) {
  const p = path.join(STORAGE_ROOT, RAW, projectId, ...subpaths);
  await fs.mkdir(p, { recursive: true });
  return p;
}

async function getProcessedPath(projectId, ...subpaths) {
  const p = path.join(STORAGE_ROOT, PROCESSED, projectId, ...subpaths);
  await fs.mkdir(p, { recursive: true });
  return p;
}

function getRawFilePath(projectId, relativePath) {
  return path.join(STORAGE_ROOT, RAW, projectId, relativePath);
}

async function listProcessedLevels(projectId) {
  const base = path.join(STORAGE_ROOT, PROCESSED, projectId);
  try {
    const entries = await fs.readdir(base, { withFileTypes: true });
    const dirs = entries.filter((e) => e.isDirectory()).map((e) => e.name);
    let levels = [];
    const levelsPath = path.join(base, 'levels.json');
    try {
      const raw = await fs.readFile(levelsPath, 'utf8');
      const data = JSON.parse(raw);
      levels = Array.isArray(data.levels) ? data.levels : data.chunks || [];
    } catch {
      levels = dirs.length ? dirs : [];
    }
    return { categories: dirs, levels };
  } catch (err) {
    if (err.code === 'ENOENT') return { categories: [], levels: [] };
    throw err;
  }
}

async function deleteProjectData(projectId) {
  const dirs = [
    path.join(STORAGE_ROOT, RAW, projectId),
    path.join(STORAGE_ROOT, PROCESSED, projectId),
  ];
  const files = [
    path.join(STORAGE_ROOT, ANNOTATIONS_DIR, `${projectId}.json`),
    path.join(STORAGE_ROOT, CONFIG_DIR, `${projectId}.json`),
  ];
  for (const dir of dirs) {
    try {
      await fs.rm(dir, { recursive: true });
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
  for (const file of files) {
    try {
      await fs.unlink(file);
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }
}

module.exports = { getRawPath, getProcessedPath, getRawFilePath, listProcessedLevels, deleteProjectData, STORAGE_ROOT };
