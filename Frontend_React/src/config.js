/**
 * Frontend configuration. Values are read from import.meta.env (Vite injects VITE_* at build/dev).
 * Set in .env at workspace root (or Frontend_React/.env) when running via scripts. No hardcoded globals.
 */

function env(key, fallback = '') {
  const v = import.meta.env[key];
  return v !== undefined && v !== '' ? v : fallback;
}

function envInt(key, fallback) {
  const v = import.meta.env[key];
  if (v === undefined || v === '') return fallback;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? fallback : n;
}

export const API_BASE = env('VITE_API_URL', 'http://localhost:3001');
export const PIXEL_STREAM_URL = env('VITE_PIXEL_STREAM_URL', '');
export const AUTH_STORAGE_KEY = env('VITE_AUTH_STORAGE_KEY', 'ue3d_user');
export const DEFAULT_USER_ID = env('VITE_DEFAULT_USER_ID', 'default');
export const PRESENCE_POLL_MS_VISIBLE = envInt('VITE_PRESENCE_POLL_MS_VISIBLE', 5000);
export const PRESENCE_POLL_MS_HIDDEN = envInt('VITE_PRESENCE_POLL_MS_HIDDEN', 10000);
export const PROCESSING_POLL_MS = envInt('VITE_PROCESSING_POLL_MS', 2000);
