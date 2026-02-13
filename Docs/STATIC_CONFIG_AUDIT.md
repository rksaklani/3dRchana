# Static / hardcoded configuration audit

This document lists **every place** in the application codebase where static or hardcoded global values are used (URLs, ports, limits, file names, intervals, defaults, etc.).  
**Scope:** `Backend_API/src`, `Frontend_React/src`, `scripts/`, and workspace root. Excludes `node_modules`, `UnrealEngine`, and third-party library code.

Use this list to move all such values into `.env` and load them at runtime. Do **not** refactor until this list is complete and approved.

---

## 1. URLs and hosts

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Frontend_React/src/services/api.js` | `API_BASE` fallback | `'http://localhost:3001'` | Backend API base URL when `VITE_API_URL` is unset |
| `Frontend_React/src/hooks/useCollab.js` | `base` (getWsUrl) | `import.meta.env.VITE_API_URL \|\| 'http://localhost:3001'` | WebSocket URL for collab (derived from API URL) |
| `scripts/run-all.sh` | `VITE_API_URL` default | `http://localhost:3001` | Default when not in `.env` |
| `scripts/run-all.sh` | `VITE_PIXEL_STREAM_URL` default | `http://localhost:80` | Default when not in `.env` |
| `scripts/run-all.sh` | echo message | `http://localhost:5173` | Example frontend URL in console message |
| `scripts/run-dev.sh` | `VITE_API_URL` default | `http://localhost:3001` | Default when not in `.env` |
| `scripts/run-dev.sh` | `VITE_PIXEL_STREAM_URL` default | `http://localhost:80` | Default when not in `.env` |
| `scripts/print-streamer-commands.sh` | `STREAMER_IP` default | `127.0.0.1` | Default host for UE streamer connection |
| `scripts/print-streamer-commands.sh` | port in echo | `8888` | Streamer port in printed commands and messages |
| `scripts/print-streamer-commands.sh` | port in echo (alt) | `80` | Player port in alternate UE command |
| `scripts/print-streamer-commands.sh` | WebSocket URL template | `ws://$STREAMER_IP:8888` | WebSocket URL for streamer in printed command |
| `scripts/push_asset.py` | `--base-url` default | `http://localhost:3001` | Backend API base URL for push script |
| `Docs/DIRECT_INTEGRATIONS.md` | curl examples | `http://localhost:3001` | Example API base URL in docs |
| `Frontend_React/src/components/PixelStreamViewer.jsx` | comment / placeholder text | `http://localhost:80`, `http://localhost:1025` | Example player URLs in comments/UI text |

---

## 2. Ports

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Backend_API/src/app.js` | `PORT` fallback | `3001` | API server listen port when `process.env.PORT` unset |
| `scripts/run-all.sh` | `PORT` default | `3001` | Default when not in `.env` |
| `scripts/run-dev.sh` | `PORT` default | `3001` | Default when not in `.env` |
| `PixelStreamingInfrastructure/SignallingWebServer` | config / CLI | `streamer_port` 8888, `player_port` 80, `https_port` 443, `sfu_port` 8889 | Signalling server ports (from config.json / start.sh; not in our app code but used by our scripts) |

---

## 3. Paths and file names

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Backend_API/src/services/fileStorage.js` | `STORAGE_ROOT` fallback | `path.join(__dirname, '../..', '..', 'Storage')` | Default Storage root when `process.env.STORAGE_ROOT` unset |
| `Backend_API/src/services/fileStorage.js` | subdir names | `'raw'`, `'processed'`, `'annotations'`, `'config'` | Subdirectories under STORAGE_ROOT (could be env for flexibility) |
| `Backend_API/src/services/projectsStore.js` | `PROJECTS_FILE` | `'projects.json'` | Filename for projects list |
| `Backend_API/src/services/sharingStore.js` | `FILE` | `'sharing.json'` | Filename for sharing data |
| `Backend_API/src/services/integrationsStore.js` | `FILE` | `'integrations.json'` | Filename for integrations (API keys, webhooks) |
| `Backend_API/src/services/annotationsStore.js` | `DIR` | `'annotations'` | Directory name for annotation files |
| `Backend_API/src/services/sceneConfigStore.js` | `DIR` | `'config'` | Directory name for scene config files |
| `Backend_API/src/workers/meshProcessor.js` | `SCRIPTS_DIR` | `path.join(__dirname, '../../scripts')` | Path to scripts dir (relative to worker) |
| `Backend_API/src/workers/meshProcessor.js` | `SCRIPT_PATH` | `preprocess_meshes.py` | Mesh preprocessing script name |
| `Backend_API/src/workers/pointCloudProcessor.js` | `SCRIPTS_DIR` | `path.join(__dirname, '../../scripts')` | Path to scripts dir |
| `Backend_API/src/workers/pointCloudProcessor.js` | `SCRIPT_PATH` | `preprocess_pointclouds.py` | Point cloud preprocessing script name |
| `Backend_API/src/workers/gaussianSplatProcessor.js` | `SCRIPTS_DIR` | `path.join(__dirname, '../../scripts')` | Path to scripts dir |
| `Backend_API/src/workers/gaussianSplatProcessor.js` | `SCRIPT_PATH` | `generate_gaussian_splats.py` | Gaussian splat script name |

---

## 4. Limits and numeric constants

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Backend_API/src/routes/upload.js` | `limits.fileSize` | `500 * 1024 * 1024` (500 MB) | Max upload size for multer |
| `Backend_API/src/services/workerConcurrency.js` | `MAX_CONCURRENT` fallback | `'2'` (parsed to int) | Max concurrent preprocessing jobs when `WORKER_MAX_CONCURRENT` unset |
| `Backend_API/src/services/presenceStore.js` | `STALE_MS` | `20000` | Presence entry considered stale after 20 seconds |
| `Backend_API/src/routes/levels.js` | Cache-Control | `'private, max-age=10'` | Browser cache TTL (seconds) for levels response |
| `Backend_API/src/routes/sceneConfig.js` | Cache-Control | `'private, max-age=10'` | Browser cache TTL (seconds) for config response |
| `Frontend_React/src/pages/Dashboard.jsx` | presence interval (visible) | `5000` | Presence poll interval (ms) when tab visible |
| `Frontend_React/src/pages/Dashboard.jsx` | presence interval (hidden) | `10000` | Presence poll interval (ms) when tab hidden |
| `Frontend_React/src/components/ProcessingStatus.jsx` | polling interval | `2000` | Job status poll interval (ms) |
| `scripts/print-streamer-commands.sh` | ResX / ResY in echo | `1920`, `1080` | Example resolution in printed UE commands |

---

## 5. Default identifiers and strings

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Frontend_React/src/services/api.js` | `getApiKey(userId = …)` | `'default'` | Default userId when not provided |
| `Frontend_React/src/services/api.js` | `getWebhook(userId = …)` | `'default'` | Default userId when not provided |
| `Frontend_React/src/pages/Integrations.jsx` | fallback userId | `user?.email \|\| 'default'` | User id for integrations API when no user |
| `Backend_API/src/routes/integrations.js` | userId fallback (multiple) | `req.query.userId \|\| req.headers['x-user-id'] \|\| 'default'` | Default userId for API key / webhook endpoints |
| `Frontend_React/src/context/AuthContext.jsx` | localStorage key | `'ue3d_user'` | Key for storing current user in browser |

---

## 6. Auth / API contract strings (optional to externalize)

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Backend_API/src/middleware/auth.js` | header names | `'x-api-key'`, `'authorization'`, `'x-user-id'` | Auth header names (API contract) |
| `Backend_API/src/middleware/auth.js` | Bearer prefix | `'Bearer '` | Authorization scheme |
| `Backend_API/src/middleware/auth.js` | 401 message | `'Authentication required (X-API-Key, Bearer token, or X-User-Id)'` | Error message when unauthenticated |
| `Backend_API/src/middleware/projectAccess.js` | 401 message | `'Authentication required'` | Error when no userId |
| `Backend_API/src/middleware/projectAccess.js` | 403 message | `'Access denied to this project'` | Error when no access |
| `Backend_API/src/routes/projects.js` | 403 messages | `'Only the owner can update/delete this project'`, `'Access denied'` | Error messages |
| `Backend_API/src/routes/upload.js` | 401 message | `'Authentication required'` | Error when no userId |

---

## 7. Python / runtime

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `Backend_API/src/workers/meshProcessor.js` | `PYTHON` | `process.env.PYTHON_PATH \|\| 'python3'` | Python executable (fallback hardcoded) |
| `Backend_API/src/workers/pointCloudProcessor.js` | `PYTHON` | `process.env.PYTHON_PATH \|\| 'python3'` | Same |
| `Backend_API/src/workers/gaussianSplatProcessor.js` | `PYTHON` | `process.env.PYTHON_PATH \|\| 'python3'` | Same |
| `Backend_API/src/workers/meshProcessor.js` | `cwd` | `path.join(__dirname, '../..')` | Working directory for spawn (Backend_API root) |
| `Backend_API/src/workers/pointCloudProcessor.js` | `cwd` | `path.join(__dirname, '../..')` | Same |
| `Backend_API/src/workers/gaussianSplatProcessor.js` | `cwd` | `path.join(__dirname, '../..')` | Same |
| `Backend_API/src/workers/*.js` | `LOD_DECIMATE_RATIO` / `LOD_POINTCLOUD_RATIO` | read from `process.env` only | No hardcoded default in code (optional env doc in .env.example) |

---

## 8. PixelStreamingInfrastructure (SignallingWebServer)

| File | Variable / literal | Current value | Purpose |
|------|--------------------|---------------|---------|
| `PixelStreamingInfrastructure/SignallingWebServer/src/index.ts` | Permissions-Policy header | `'xr-spatial-tracking=(self), xr=(self)'` | Fixed policy string (could be env if ever needed) |
| `PixelStreamingInfrastructure/SignallingWebServer/config.json` | Various | `streamer_port`, `player_port`, `sfu_port`, etc. | Server config (their repo; overridden by start.sh / CLI) |

Our scripts assume **player on 80** and **streamer on 8888** unless overridden via SignallingWebServer config or env.

---

## 9. Documentation and examples only (no code change required for env)

- **README.md**, **Docs/STREAMER_CONNECT.md**, **Docs/STREAMER_QUICK_FIX.md**, **Docs/UE_VIEWER_MEASURE_SETUP.md**, **Docs/DIRECT_INTEGRATIONS.md**: contain example URLs (e.g. `http://localhost:3001`, `http://localhost:5173`, port 80, 8888). These can stay as examples or be updated to reference “set in .env” once refactor is done.

---

## Summary counts

- **URLs/hosts:** 14+ usages across 7 files (api.js, useCollab.js, run-all.sh, run-dev.sh, print-streamer-commands.sh, push_asset.py, PixelStreamViewer, docs).
- **Ports:** 4+ in app code (PORT 3001; script defaults 3001, 80; print-streamer 8888, 80).
- **Paths/filenames:** 9 (STORAGE_ROOT fallback, subdirs, projects.json, sharing.json, integrations.json, annotations dir, config dir, scripts path, preprocess_meshes.py).
- **Limits/numbers:** 8 (upload 500MB, WORKER_MAX_CONCURRENT 2, STALE_MS 20000, max-age 10, presence 5000/10000 ms, processing 2000 ms, ResX/ResY 1920/1080 in script).
- **Default ids/strings:** 5 (userId `'default'`, localStorage key `'ue3d_user'`).
- **Auth/API strings:** 7 (header names and error messages; optional to move to .env).
- **Python:** 1 fallback (`'python3'`).

**Total:** 40+ distinct static/hardcoded usages to consider for .env and config loading.

---

## Recommended .env variables (after refactor)

Consolidated list of variables that the refactor should define and document in `.env` / `.env.example`:

- **Already in .env.example:** `STORAGE_ROOT`, `PORT`, `CORS_ORIGIN`, `PYTHON_PATH`, `LOD_DECIMATE_RATIO`, `VITE_API_URL`, `VITE_PIXEL_STREAM_URL`, `WORKER_MAX_CONCURRENT`.
- **To add or make explicit:**  
  `UPLOAD_MAX_BYTES`, `PRESENCE_STALE_MS`, `CACHE_CONTROL_LEVELS_MAX_AGE`, `CACHE_CONTROL_CONFIG_MAX_AGE`,  
  `PRESENCE_POLL_MS_VISIBLE`, `PRESENCE_POLL_MS_HIDDEN`, `PROCESSING_STATUS_POLL_MS`,  
  `STREAMER_PORT`, `PLAYER_PORT`, `STREAMER_IP_DEFAULT`,  
  `DEFAULT_USER_ID` (for integrations), `AUTH_STORAGE_KEY` (for frontend localStorage),  
  optional: `RESOLUTION_X`, `RESOLUTION_Y` for script-printed UE commands.

Once this list is **approved**, the next step is to: (1) extend `.env` / `.env.example` with all required and optional variables, (2) replace every hardcoded value in the table with loading from env (or from a single config module that reads env), and (3) document each variable in the repo.
