# Why is streamerList empty? (ids: [])

When you run `./scripts/run-all.sh`, the SignallingWebServer logs show something like:

```
[14:07:50.453] info: Registered new player: Player0
[14:07:50.455] info: > Player0 :: {"type":"listStreamers"}
[14:07:50.455] info: < Player0 :: {"type":"streamerList","ids":[]}
```

## What this means

- **Player0** = your browser (the React app’s iframe loading the player from port 80). That’s working.
- **listStreamers** = the player asking “who is streaming?”
- **streamerList "ids":[]** = no streamer is connected yet, so the list is empty.

So the **web stack is fine**. The only missing piece is the **Unreal Engine streamer** (UE_3DViewer_Project) connecting to the SignallingWebServer.

## Ports (from your config)

| Port | Role |
|------|------|
| **80** | Player (HTTP). Browser loads the player from here. |
| **8888** | Streamer. The **UE application must connect here**. |
| **8889** | SFU (optional). |

## What to do

1. **Keep** Backend + SignallingWebServer + Frontend running (e.g. `./scripts/run-all.sh`).

2. **Run the UE project as the Pixel Streaming streamer** so it connects to this machine and port **8888**:
   - From **Unreal Editor**: enable Pixel Streaming and use “Launch with Pixel Streaming” (or equivalent). Set the signalling URL to your server, e.g. `http://localhost` or `http://115.241.186.203` (your public IP from the logs). The server will accept the streamer on port 8888.
   - From a **packaged game**: run with Pixel Streaming args. Typical form:
     ```bash
     UE_3DViewer_Project.exe -PixelStreamingIP=localhost -PixelStreamingPort=80
     ```
     Many UE Pixel Streaming setups use the **player port (80)** in the URL; the signalling server then accepts the streamer on 8888. If your UE build expects a **streamer port**, use:
     ```bash
     -PixelStreamingURL=ws://localhost:8888
     ```
     (Exact flags depend on your UE/plugin version; check Epic’s Pixel Streaming docs.)

3. **Check the SignallingWebServer terminal**: when the UE streamer connects, you should see a line like “Streamer connected” or similar, and the next `listStreamers` response will show a non‑empty `ids` list.

4. **Browser**: after a streamer is in the list, the player will connect to it and you’ll see the 3D stream in the Dashboard viewer.

## Summary

| You see | Meaning |
|--------|--------|
| `streamerList "ids":[]` | No UE streamer connected yet. Start UE_3DViewer_Project as the streamer and point it at this SignallingWebServer (port 80 or 8888 as required by your UE setup). |
| `streamerList "ids":["..."]` | A streamer is connected; the player should show the 3D view. |
