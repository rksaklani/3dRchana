# UE 3D Viewer Project

Unreal Engine project used as the **Pixel Streaming streamer**. It connects to **SignallingWebServer** (PixelStreamingInfrastructure) and can load assets from **Storage**.

## How it connects

- **SignallingWebServer:** Run from the workspace (`./scripts/run-signalling.sh`). This project (the “streamer”) connects to it via WebSocket and streams the view to the browser.
- **Storage:** Processed assets (meshes, point clouds) are written by **Backend_API** to `../Storage/processed/{projectId}/`. Configure this project (or a Blueprint) to load from that path so the streamed view shows the uploaded models.

## Running

1. Build **Unreal Engine** from the `UnrealEngine/` source (or use an installed build).
2. Open `UE_3DViewer_Project.uproject` in the Editor.
3. **Pixel Streaming:** Run the project as a **streamer** so it connects to SignallingWebServer:
   - **Editor:** Use “Launch with Pixel Streaming” (or equivalent); set signalling URL to `http://localhost` (player is on port 80; streamers connect on port **8888**).
   - **Packaged:** e.g. `-PixelStreamingIP=localhost -PixelStreamingPort=80` or `-PixelStreamingURL=ws://localhost:8888` (depends on your UE/plugin; see Epic Pixel Streaming docs).
4. Until the streamer connects, the player will show **streamerList "ids":[]**. Once connected, the 3D view appears in the browser. See **../Docs/STREAMER_CONNECT.md** for details.

## Asset path

Point **BP_AssetLoader** (or your load logic) at the processed storage path, e.g.:

`{Workspace}/Storage/processed/{projectId}/Meshes/`  
`{Workspace}/Storage/processed/{projectId}/PointClouds/`

So the streamer loads the same assets that **Backend_API** produces after upload and preprocessing.
