# "Streamer not available" – what it means and how to fix it

If the 3D viewer shows **streamer not available** (or "Waiting for streamer"), the **SignallingWebServer** is running but **no Unreal Engine streamer has connected** to it.

## Why

- **SignallingWebServer** (started by `run-signalling.sh` or `run-all.sh`) only **listens** for streamers on port **8888**. It does not start Unreal Engine.
- The **streamer** is the **Unreal Engine** Pixel Streaming application. It is a **separate process** you must start yourself.
- Until that UE process is running and has connected to the SignallingWebServer, the player has no stream to show.

## Fix

1. Keep SignallingWebServer running (your terminal showing "Listening for streamer connections on port 8888" and "Http server listening on port 80").
2. In **another terminal**, from the workspace root run:
   ```bash
   ./scripts/print-streamer-commands.sh
   ```
   That prints the exact command(s) for your platform.
3. Start the Unreal streamer using one of those commands, for example:
   - **Packaged Linux:**  
     `./UE_3DViewer_Project.sh -PixelStreamingIP=127.0.0.1 -PixelStreamingPort=8888 -RenderOffscreen -ForceRes -ResX=1920 -ResY=1080`
   - **Unreal Editor:** Launch with Pixel Streaming, Signalling URL: `http://127.0.0.1`
4. When the streamer connects, the SignallingWebServer terminal will log something like: **Registered streamer / ids: ["Streamer0"]**. The 3D viewer in the browser will then show the stream.

**Same machine:** use `127.0.0.1` or `localhost` for `-PixelStreamingIP`.  
**UE on another machine:** use the IP of the machine where SignallingWebServer is running, and ensure port 8888 is reachable from the UE machine.
