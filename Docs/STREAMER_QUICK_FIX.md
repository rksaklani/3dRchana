# "No streamers available. Click to try again" – Quick fix

That message means the **Unreal Engine streamer is not running**. The browser player is fine; it just has no streamer to connect to. The signalling server accepts streamers on **port 8888**.

## Fix in 2 steps

### 1. Signalling server (if not already running)

From the workspace root:

```bash
./scripts/run-all.sh
```

Or only the signalling server: `./scripts/run-signalling.sh`. Leave it running.

### 2. Run the UE project as the streamer

**Print exact commands anytime:**

```bash
./scripts/print-streamer-commands.sh
```

**Unreal Editor**

1. Open `UE_3DViewer_Project/UE_3DViewer_Project.uproject` in Unreal Editor.
2. **Edit → Plugins** → enable **Pixel Streaming**, restart editor.
3. **Launch with Pixel Streaming** (or your editor’s equivalent).
4. Set the **signalling URL** to: `http://localhost` (same machine) or `http://YOUR_SERVER_IP` (remote). Streamer will connect to port 8888.

**Packaged Linux build** (from your `LinuxNoEditor` folder):

```bash
./UE_3DViewer_Project.sh -PixelStreamingIP=127.0.0.1 -PixelStreamingPort=8888 -RenderOffscreen -ForceRes -ResX=1920 -ResY=1080
```

If your UE build expects the player port (80) instead:

```bash
./UE_3DViewer_Project.sh -PixelStreamingIP=127.0.0.1 -PixelStreamingPort=80 -RenderOffscreen -ForceRes -ResX=1920 -ResY=1080
```

**Packaged Windows build:**

```bash
UE_3DViewer_Project.exe -PixelStreamingIP=127.0.0.1 -PixelStreamingPort=8888 -RenderOffscreen -ForceRes -ResX=1920 -ResY=1080
```

Or with WebSocket URL: `-PixelStreamingURL=ws://127.0.0.1:8888`

**When it works:** SignallingWebServer logs will show e.g. `Registered streamer: Streamer0` and `"ids":["Streamer0"]`. The Dashboard 3D viewer will then show the stream (click “try again” in the player if needed).

**Firewall:** If UE is on another machine, allow port 8888 (and 80) on the server, e.g. `sudo ufw allow 8888 && sudo ufw allow 80`.

More detail: [STREAMER_CONNECT.md](./STREAMER_CONNECT.md).
