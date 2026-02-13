/**
 * Application configuration. All values are read from process.env with fallbacks.
 * Set variables in .env (or environment) to override. No hardcoded globals in app code.
 */
const path = require('path');

const env = (key, fallback) => {
  const v = process.env[key];
  return v !== undefined && v !== '' ? v : fallback;
};

const envInt = (key, fallback) => {
  const v = process.env[key];
  if (v === undefined || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
};

// Server
const PORT = envInt('PORT', 3001);
const CORS_ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
  : true;

// Storage paths (under STORAGE_ROOT)
const STORAGE_ROOT = process.env.STORAGE_ROOT || path.join(__dirname, '..', '..', 'Storage');
const STORAGE_SUBDIR_RAW = env('STORAGE_SUBDIR_RAW', 'raw');
const STORAGE_SUBDIR_PROCESSED = env('STORAGE_SUBDIR_PROCESSED', 'processed');
const STORAGE_SUBDIR_ANNOTATIONS = env('STORAGE_SUBDIR_ANNOTATIONS', 'annotations');
const STORAGE_SUBDIR_CONFIG = env('STORAGE_SUBDIR_CONFIG', 'config');

// Store filenames (under STORAGE_ROOT)
const PROJECTS_FILENAME = env('PROJECTS_FILENAME', 'projects.json');
const SHARING_FILENAME = env('SHARING_FILENAME', 'sharing.json');
const INTEGRATIONS_FILENAME = env('INTEGRATIONS_FILENAME', 'integrations.json');

// Limits
const UPLOAD_MAX_BYTES = envInt('UPLOAD_MAX_BYTES', 500 * 1024 * 1024); // 500 MB
const PRESENCE_STALE_MS = envInt('PRESENCE_STALE_MS', 20000);
const CACHE_MAX_AGE_LEVELS = envInt('CACHE_MAX_AGE_LEVELS', 10);
const CACHE_MAX_AGE_CONFIG = envInt('CACHE_MAX_AGE_CONFIG', 10);
const WORKER_MAX_CONCURRENT = envInt('WORKER_MAX_CONCURRENT', 2);

// Workers (Python scripts)
const PYTHON_PATH = env('PYTHON_PATH', 'python3');
const SCRIPTS_DIR = process.env.SCRIPTS_DIR || path.join(__dirname, '..', 'scripts');
const SCRIPT_NAME_MESH = env('SCRIPT_NAME_MESH', 'preprocess_meshes.py');
const SCRIPT_NAME_POINTCLOUD = env('SCRIPT_NAME_POINTCLOUD', 'preprocess_pointclouds.py');
const SCRIPT_NAME_GAUSSIAN = env('SCRIPT_NAME_GAUSSIAN', 'generate_gaussian_splats.py');

// Integrations / auth
const DEFAULT_USER_ID = env('DEFAULT_USER_ID', 'default');

// Auth error messages (optional override for i18n)
const AUTH_ERROR_REQUIRED = env('AUTH_ERROR_REQUIRED', 'Authentication required');
const AUTH_ERROR_REQUIRED_DETAIL = env(
  'AUTH_ERROR_REQUIRED_DETAIL',
  'Authentication required (X-API-Key, Bearer token, or X-User-Id)'
);
const AUTH_ERROR_ACCESS_DENIED = env('AUTH_ERROR_ACCESS_DENIED', 'Access denied to this project');

module.exports = {
  PORT,
  CORS_ORIGIN,
  STORAGE_ROOT,
  STORAGE_SUBDIR_RAW,
  STORAGE_SUBDIR_PROCESSED,
  STORAGE_SUBDIR_ANNOTATIONS,
  STORAGE_SUBDIR_CONFIG,
  PROJECTS_FILENAME,
  SHARING_FILENAME,
  INTEGRATIONS_FILENAME,
  UPLOAD_MAX_BYTES,
  PRESENCE_STALE_MS,
  CACHE_MAX_AGE_LEVELS,
  CACHE_MAX_AGE_CONFIG,
  WORKER_MAX_CONCURRENT,
  PYTHON_PATH,
  SCRIPTS_DIR,
  SCRIPT_NAME_MESH,
  SCRIPT_NAME_POINTCLOUD,
  SCRIPT_NAME_GAUSSIAN,
  DEFAULT_USER_ID,
  AUTH_ERROR_REQUIRED,
  AUTH_ERROR_REQUIRED_DETAIL,
  AUTH_ERROR_ACCESS_DENIED,
};
