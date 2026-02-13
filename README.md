# UE 3D Viewer – Full Stack (3dRchana)

One workspace that integrates **PixelStreamingInfrastructure**, **Backend_API**, **Frontend_React**, **UnrealEngine**, **Storage**, **UE_3DViewer_Project**, and **scripts** so the web app, API, pixel-streaming player, and Unreal streamer work together.

---

## Integration overview

| Component | Role | Connects to |
|-----------|------|-------------|
| **Frontend_React** | Web UI: auth, dashboard, projects, upload, embedded 3D viewer | Backend_API (REST), SignallingWebServer (iframe) |
| **Backend_API** | REST API: uploads, projects, processing, annotations, sharing, reports | Storage (read/write), Python scripts (preprocess) |
| **PixelStreamingInfrastructure** | SignallingWebServer: player page + WebSocket signalling for Pixel Streaming | UE streamer (WebRTC) |
| **UE_3DViewer_Project** | Unreal project run as Pixel Streaming **streamer** | SignallingWebServer, Storage (load assets) |
| **Storage** | Raw + processed files per project (meshes, point clouds, etc.) | Backend_API (writes), UE_3DViewer_Project (reads) |
| **UnrealEngine** | Engine source; used to build and run UE_3DViewer_Project | UE_3DViewer_Project |

---

## Scripts (run from workspace root)

| Script | What it starts | Use when |
|--------|----------------|----------|
| **`./scripts/run-all.sh`** | Backend_API + SignallingWebServer + Frontend_React | You want the full web stack in one go (API + player + React). Ctrl+C stops all. |
| **`./scripts/run-dev.sh`** | Backend_API + Frontend_React | You only need API + React (e.g. no 3D stream yet). |
| **`./scripts/run-signalling.sh`** | SignallingWebServer (PixelStreamingInfrastructure) | You want the player/signalling server alone (e.g. already running backend/frontend elsewhere). |

**First-time setup:**  
`cd Backend_API && npm install` and `cd Frontend_React && npm install`.  
For SignallingWebServer, see PixelStreamingInfrastructure docs (e.g. Node/npm in that repo if required).

---

## Architecture (how they connect)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  User browser                                                                │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Frontend_React  (e.g. http://localhost:5173)                          │  │
│  │  • Sign in, Dashboard, create project, upload models                   │  │
│  │  • Embeds 3D viewer iframe ← VITE_PIXEL_STREAM_URL                   │  │
│  └───────────────┬────────────────────────────────────┬────────────────────┘  │
│                  │ VITE_API_URL                      │ iframe src            │
│                  ▼                                   ▼                       │
│  ┌──────────────────────────────┐    ┌────────────────────────────────────┐ │
│  │  Backend_API (:3001)         │    │  SignallingWebServer (e.g. :80)    │ │
│  │  • POST /upload              │    │  (PixelStreamingInfrastructure)     │ │
│  │  • GET/POST /projects        │    │  • Serves player UI                 │ │
│  │  • processing, annotations   │    │  • WebSocket signalling              │ │
│  │  • Reads/writes ─────────────┼────┼──► Storage                          │ │
│  └──────────────────────────────┘    └────────────────┬───────────────────┘ │
└─────────────────────────────────────────────────────────┼─────────────────────┘
                                                          │ WebRTC / signalling
                                                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  Same machine (or streamer server)                                           │
│  ┌────────────────────────────────────┐    ┌───────────────────────────────┐  │
│  │  UE_3DViewer_Project               │    │  Storage                       │  │
│  │  (Unreal – Pixel Streaming        │    │  • raw/{projectId}/             │  │
│  │   streamer)                         │◄───│  • processed/{projectId}/     │  │
│  │  • Connects to SignallingWebServer │    │    Meshes, PointClouds, etc.  │  │
│  │  • Loads assets from Storage       │    │                                │  │
│  └────────────────────────────────────┘    └───────────────────────────────┘  │
│  Built with UnrealEngine (UnrealEngine/)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Quick start: run everything (web stack)

### 1. Environment

From the workspace root:

```bash
cp .env.example .env
# Edit .env if you need different ports or paths (defaults work with the scripts).
```

### 2. Start the full web stack (one command)

```bash
chmod +x scripts/*.sh
./scripts/run-all.sh
```

This starts:

- **Backend_API** on port **3001**
- **SignallingWebServer** (PixelStreamingInfrastructure) – player at **http://localhost:80** by default
- **Frontend_React** (Vite) – URL printed in the terminal (e.g. **http://localhost:5173**)

When you press **Ctrl+C**, the script stops the backend and signalling server as well.

### 3. Run the UE streamer (so the 3D view appears)

The player will show **streamerList "ids":[]** until a streamer connects. You must run **UE_3DViewer_Project** as the Pixel Streaming streamer:

- Build **Unreal Engine** from `UnrealEngine/` (or use an installed build).
- Open **UE_3DViewer_Project/UE_3DViewer_Project.uproject** in the Editor.
- Run as Pixel Streaming **streamer** (Editor: “Launch with Pixel Streaming”; packaged: e.g. `-PixelStreamingIP=localhost -PixelStreamingPort=80` or `-PixelStreamingURL=ws://localhost:8888` depending on your UE version).
- SignallingWebServer accepts **streamers on port 8888** and serves the **player on port 80**. Once the UE app connects, the logs will show a non‑empty streamer list and the browser will display the 3D stream.

See **Docs/STREAMER_CONNECT.md** for why `ids: []` appears and how to fix it.

### 4. Use the app

1. Open the frontend URL (e.g. **http://localhost:5173**).
2. Sign up / Sign in → Dashboard.
3. Create a project → Upload a model (OBJ, FBX, PLY, etc.). Backend stores to **Storage** and runs preprocessing.
4. The 3D viewer panel embeds the SignallingWebServer player. Once the **UE_3DViewer_Project** streamer is running and connected, the view will show the stream.

---

## Alternative: run services separately

- **Backend + Frontend only:**  
  `./scripts/run-dev.sh`  
  (No SignallingWebServer; viewer iframe will show “not connected” until you run it.)

- **SignallingWebServer only:**  
  `./scripts/run-signalling.sh`  
  (Use when backend/frontend are already running in another terminal.)

---

## Directory layout

```
Rk_WorkSapace/
├── README.md                    # This file (integration overview)
├── .env.example                 # Shared env (copy to .env)
├── scripts/
│   ├── run-all.sh               # Backend + SignallingWebServer + Frontend
│   ├── run-dev.sh               # Backend + Frontend only
│   └── run-signalling.sh        # SignallingWebServer only
├── Backend_API/                 # Node API → Storage, preprocessing
├── Frontend_React/              # React app, embeds SignallingWebServer player
├── PixelStreamingInfrastructure/ # SignallingWebServer (Wilbur) + player UI
├── Storage/                     # raw/ and processed/ per project
├── UE_3DViewer_Project/         # Unreal project (Pixel Streaming streamer)
├── UnrealEngine/                # UE source (build engine here)
└── Docs/                        # Feature comparison, performance, viewer protocol
```

---

## Env variables (summary)

| Variable | Used by | Purpose |
|----------|---------|--------|
| `STORAGE_ROOT` | Backend_API, scripts | Path to Storage (default: workspace/Storage) |
| `PORT` | Backend_API | API port (default 3001) |
| `VITE_API_URL` | Frontend_React (via scripts) | Backend API URL (e.g. http://localhost:3001) |
| `VITE_PIXEL_STREAM_URL` | Frontend_React (via scripts) | SignallingWebServer player URL (e.g. http://localhost:80) |
| `CORS_ORIGIN` | Backend_API | Optional; comma-separated CORS origins |
| `PYTHON_PATH` | Backend_API | Python for preprocessing (default python3) |
| `LOD_DECIMATE_RATIO` | Backend_API | Optional LOD for mesh preprocessing (e.g. 0.2) |
| `WORKER_MAX_CONCURRENT` | Backend_API | Max concurrent preprocessing jobs (default 2). See **Docs/PERFORMANCE.md**. |

See **.env.example** for all supported variables and comments.

---

## Performance

The stack includes several optimizations (compression, in-memory caches, lazy routes, worker concurrency limit, and others). See **Docs/PERFORMANCE.md** for a full list and tuning options.
