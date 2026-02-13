# UE 3D Viewer – Frontend

Web UI for creating projects, uploading 3D models, and viewing them in the browser. The 3D viewer is **diverted** into this app: it is embedded here and powered by **SignallingWebServer** (Pixel Streaming).

## Running both (Frontend_React + SignallingWebServer)

Create project and upload use the **Backend API**. The 3D viewer on the right is streamed by **SignallingWebServer**—you need both running.

### 1. SignallingWebServer (Pixel Streaming)

From the repo root:

```bash
./PixelStreamingInfrastructure/SignallingWebServer/platform_scripts/bash/start.sh
```

This serves the player UI (e.g. at `http://localhost:80`). The frontend **embeds** that URL in the Dashboard, so users never leave this app.

### 2. Frontend_React (this app)

```bash
cp .env.example .env
# Edit .env: set VITE_PIXEL_STREAM_URL to the SignallingWebServer URL (e.g. http://localhost:80)
npm install
npm run dev
```

Open the app (e.g. `http://localhost:5173`), sign in, go to **Dashboard**, create a project, upload a model. The 3D viewer panel loads the SignallingWebServer player in an iframe—so the flow is: **Frontend_React** (projects + upload) + **SignallingWebServer** (streaming) running together.

### 3. Backend API (optional, for upload/projects)

```bash
cd ../Backend_API && npm install && npm start
```

Set `VITE_API_URL` in `.env` if the API is on another host/port.

## Summary

| Action              | Uses                    |
|---------------------|-------------------------|
| Create project      | Backend API             |
| Upload model        | Backend API             |
| 3D viewer in browser | SignallingWebServer (embedded in Frontend_React) |

The SignallingWebServer UI is **diverted** into Frontend_React: it appears only inside the Dashboard viewer panel, not as a separate tab.
