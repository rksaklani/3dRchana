# Running Unreal Engine on GPU (Vulkan)

Two scripts let you run UE_3DViewer_Project with GPU (Vulkan on Linux).

## 1. Unreal Editor (with GPU/Vulkan)

From workspace root:

```bash
./scripts/run-ue-editor.sh
```

- Opens **UE_3DViewer_Project** in the Unreal Editor using **Vulkan** (GPU).
- Requires the Engine to be built; Editor path is `UnrealEngine/Engine/Binaries/Linux/UnrealEditor` by default.
- Optional in `.env`: **`UE_ROOT`** (engine root), **`UE_EDITOR_BIN`** (full path to UnrealEditor).

For Pixel Streaming from the Editor: after it opens, enable the Pixel Streaming plugin, then use **Launch → Pixel Streaming** and set Signalling URL (e.g. `http://127.0.0.1`).

## 2. Packaged Linux streamer (GPU/Vulkan)

From workspace root (SignallingWebServer must already be running, e.g. `./scripts/run-all.sh`):

```bash
./scripts/run-ue-streamer.sh
```

- Runs the **packaged** Linux build as Pixel Streaming streamer with **-vulkan** and the usual streamer flags.
- Default path: **`UE_3DViewer_Project/LinuxNoEditor`** (must contain `UE_3DViewer_Project.sh`).
- Optional in `.env`: **`UE_LINUX_NO_EDITOR`** (path to your LinuxNoEditor folder), **`STREAMER_IP`**, **`STREAMER_PORT`**, **`RESOLUTION_X`**, **`RESOLUTION_Y`**.

If the packaged build is not found, the script prints the manual commands (same as `print-streamer-commands.sh`).

## Env vars (optional)

| Variable | Purpose |
|----------|---------|
| `UE_ROOT` | Unreal Engine root (default: workspace/UnrealEngine) |
| `UE_EDITOR_BIN` | Full path to UnrealEditor binary |
| `UE_LINUX_NO_EDITOR` | Path to LinuxNoEditor folder for run-ue-streamer.sh |
| `STREAMER_IP` | Signalling server IP (default 127.0.0.1) |
| `STREAMER_PORT` | Signalling streamer port (default 8888) |
| `RESOLUTION_X`, `RESOLUTION_Y` | Resolution (default 1920x1080) |

See `.env.example` for all optional variables.
