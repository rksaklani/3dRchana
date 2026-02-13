# Connecting the app to Unreal Editor Pixel Streaming

You can connect in two ways: use **UE’s embedded signalling server** (Editor on 80/8888) or use **our SignallingWebServer** (run-all.sh on 1025/18888).

---

## Option A: Use UE’s embedded server (your current setup)

Your Editor is using **embedded** signalling: **Viewer port 80**, **Streamer port 8888**.

### 1. In Unreal Editor (keep as in your screenshot)

- Leave **“Use Remote Signalling Server”** unchecked (embedded server).
- **Streamer Port:** 8888  
- **Viewer Port:** 80  
- Start the embedded server and **“Stream the Level Editor viewport”** (or equivalent).

### 2. In this project

- The React app must load the player from **port 80** (where UE’s embedded server serves it).
- **Either** set in `.env`:
  ```bash
  VITE_PIXEL_STREAM_URL=http://localhost:80
  ```
- **Or** run only Backend + Frontend (no SignallingWebServer), so nothing else uses port 80. `run-dev.sh` already defaults to port 80:
  ```bash
  ./scripts/run-dev.sh
  ```
  (Optionally set `VITE_PIXEL_STREAM_URL=http://localhost:80` in `.env`; run-dev.sh uses this by default.)

- Ensure **nothing else** (e.g. our SignallingWebServer, nginx) is using port 80 on this machine.

### 3. Open the app

- Open **http://localhost:5173**, sign in, open a project. The 3D viewer iframe will load **http://localhost:80** (UE’s embedded player) and show the Editor stream.

**Summary:** UE = embedded server (80 + 8888). App = Backend + Frontend only; `VITE_PIXEL_STREAM_URL=http://localhost:80`. Do **not** start our SignallingWebServer so port 80 is free for UE.

---

## Option B: Use our SignallingWebServer (run-all.sh)

Our script uses **player port 1025** and **streamer port 18888** (to avoid conflicts with 80/8888).

### 1. Start the stack

```bash
./scripts/run-all.sh
```

This starts Backend, SignallingWebServer (player 1025, streamer 18888), and Frontend. The app will use `VITE_PIXEL_STREAM_URL=http://localhost:1025`.

### 2. In Unreal Editor

- Enable **“Use Remote Signalling Server”**.
- Set **Signalling Server URL** to: **http://127.0.0.1:1025** (or `http://YOUR_IP:1025` if the app runs on another machine).
- If the Editor has a separate **“Streamer port” or “Remote streamer port”** for remote mode, set it to **18888**. If it only has one URL, our server uses 18888 for streamer connections on the same host.
- Start streaming (e.g. “Stream the Level Editor viewport”).

### 3. Open the app

- Open **http://localhost:5173**. The 3D viewer loads the player from **http://localhost:1025** and should show the Editor stream once UE is connected.

**Summary:** run-all.sh = SignallingWebServer on 1025 (player) + 18888 (streamer). UE = remote signalling URL `http://127.0.0.1:1025`, streamer port **18888** if configurable.

---

## Quick reference

| Setup              | Viewer (player) URL   | Streamer port | What to set in .env / run |
|--------------------|------------------------|--------------|----------------------------|
| UE embedded (your screenshot) | http://localhost:80   | 8888         | `VITE_PIXEL_STREAM_URL=http://localhost:80`; run **run-dev.sh** only (no run-all.sh) |
| Our SignallingWebServer       | http://localhost:1025 | 18888        | Use **run-all.sh** (sets 1025/18888 and VITE_PIXEL_STREAM_URL) |
