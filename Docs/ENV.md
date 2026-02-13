# Environment variables reference

All configuration is driven by environment variables. Copy `.env.example` to `.env` at the workspace root and adjust. Scripts `run-all.sh` and `run-dev.sh` source `.env` before starting Backend_API and Frontend_React.

## Required (for typical dev)

| Variable | Where used | Default | Description |
|----------|------------|---------|-------------|
| `VITE_API_URL` | Frontend | `http://localhost:3001` | Backend API base URL |
| `VITE_PIXEL_STREAM_URL` | Frontend | (empty) | Pixel Streaming player URL (e.g. `http://localhost:80`) |
| `PORT` | Backend | `3001` | API server port |
| `STORAGE_ROOT` | Backend | `workspace/Storage` | Storage root path |

## Optional – Backend

| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGIN` | (allow-all) | Comma-separated origins for CORS |
| `PROJECTS_FILENAME` | `projects.json` | Filename under STORAGE_ROOT |
| `SHARING_FILENAME` | `sharing.json` | Sharing store filename |
| `INTEGRATIONS_FILENAME` | `integrations.json` | Integrations store filename |
| `UPLOAD_MAX_BYTES` | `524288000` (500 MB) | Max upload size in bytes |
| `PRESENCE_STALE_MS` | `20000` | Presence entry stale after (ms) |
| `CACHE_MAX_AGE_LEVELS` | `10` | Cache-Control max-age for levels (seconds) |
| `CACHE_MAX_AGE_CONFIG` | `10` | Cache-Control max-age for scene config (seconds) |
| `WORKER_MAX_CONCURRENT` | `2` | Max concurrent preprocessing jobs |
| `PYTHON_PATH` | `python3` | Python executable for workers |
| `SCRIPTS_DIR` | `Backend_API/scripts` | Path to preprocessing scripts |
| `SCRIPT_NAME_MESH` | `preprocess_meshes.py` | Mesh script name |
| `SCRIPT_NAME_POINTCLOUD` | `preprocess_pointclouds.py` | Point cloud script name |
| `SCRIPT_NAME_GAUSSIAN` | `generate_gaussian_splats.py` | Gaussian splat script name |
| `LOD_DECIMATE_RATIO` | (none) | Mesh LOD decimation ratio (e.g. 0.2) |
| `LOD_POINTCLOUD_RATIO` | (none) | Point cloud LOD ratio |
| `DEFAULT_USER_ID` | `default` | Default userId for integrations when header not set |
| `AUTH_ERROR_*` | (see config.js) | Override auth error messages |

## Optional – Frontend

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_AUTH_STORAGE_KEY` | `ue3d_user` | localStorage key for auth |
| `VITE_DEFAULT_USER_ID` | `default` | Default userId when not logged in |
| `VITE_PRESENCE_POLL_MS_VISIBLE` | `5000` | Presence poll interval when tab visible (ms) |
| `VITE_PRESENCE_POLL_MS_HIDDEN` | `10000` | Presence poll interval when tab hidden (ms) |
| `VITE_PROCESSING_POLL_MS` | `2000` | Processing status poll interval (ms) |

## Optional – Scripts

| Variable | Default | Description |
|----------|---------|-------------|
| `STREAMER_IP` | `127.0.0.1` | Host for UE streamer in printed commands |
| `STREAMER_PORT` | `8888` | Streamer port in printed commands |
| `PLAYER_PORT` | `80` | Player port in alternate UE command |
| `RESOLUTION_X`, `RESOLUTION_Y` | `1920`, `1080` | Example resolution in print-streamer-commands |
| `API_BASE_URL` | (none; push_asset.py uses `--base-url` or `http://localhost:3001`) | Default API base for `scripts/push_asset.py` |

## Environment-agnostic usage

- **Dev:** Use `.env` with `VITE_API_URL=http://localhost:3001`, `VITE_PIXEL_STREAM_URL=http://localhost:80`, `PORT=3001`.
- **Staging/Prod:** Set `VITE_API_URL` and `VITE_PIXEL_STREAM_URL` to your deployed URLs, `PORT` as needed, and `STORAGE_ROOT` to a persistent path. Rebuild the frontend so Vite embeds the correct `VITE_*` values.

No URLs, ports, or credentials are hardcoded in application code; they are read from config that loads from `process.env` (Backend) or `import.meta.env` (Frontend).
