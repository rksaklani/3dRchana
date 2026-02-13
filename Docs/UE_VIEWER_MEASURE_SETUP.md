# In-viewer measure: UE setup

For the Dashboard "Click in viewer" measure mode to work, the UE Pixel Streaming player (or your custom streamer UI) must send click positions to the parent window.

## Contract

1. **Parent → viewer:** `{ type: 'startMeasure' }` — enable measure mode (next clicks send position).
2. **Parent → viewer:** `{ type: 'stopMeasure' }` — disable measure mode.
3. **Viewer → parent:** `window.parent.postMessage({ type: 'viewerClick', position: { x, y, z } }, '*')` on each click in the 3D view (world-space hit).

## In Unreal Engine (Blueprint or C++)

1. **Listen for postMessage from parent**  
   In your player HTML/JS (or in UE if you expose a JS callback), listen for `message` events. When `e.data?.type === 'startMeasure'`, set a boolean `MeasureMode = true`; when `e.data?.type === 'stopMeasure'`, set `MeasureMode = false`.

2. **On click in viewport**  
   When the user clicks the 3D view and `MeasureMode` is true:
   - Run a line trace (raycast) from the camera through the mouse position into the scene.
   - Get the hit result world location (FVector or equivalent).
   - Send to parent:  
     `window.parent.postMessage({ type: 'viewerClick', position: { x: Hit.X, y: Hit.Y, z: Hit.Z } }, '*')`  
     (Use your engine’s API to call into the player page’s JavaScript, e.g. Pixel Streaming’s “Execute JavaScript” or equivalent.)

3. **Blueprint sketch**  
   - On “Message from UI” (or your postMessage handler): if message type is `startMeasure` / `stopMeasure`, set the measure-mode flag.
   - On “Mouse click” (or viewport click): if measure mode is on, LineTraceByChannel (or similar), get Hit Location, then “Execute JavaScript” (or inject script) with:
     `window.parent.postMessage({ type: 'viewerClick', position: { x: ..., y: ..., z: ... } }, '*');`

## Pixel Streaming (Epic) player

If you use Epic’s default player HTML, you may need to customize it to add the message listener and the click handler that performs the raycast and posts `viewerClick`. The raycast itself is done in UE; the result is then passed back to the page (e.g. via a UE→JS bridge) and the page calls `window.parent.postMessage(...)`.

## Test without UE

1. Run the frontend (e.g. `npm run dev`).
2. Set `VITE_PIXEL_STREAM_URL` to `http://localhost:5173/viewer_measure_test.html` (or serve **Frontend_React/public/viewer_measure_test.html** at the same origin).
3. Open the Dashboard, select a project, open the Measure section, and click “Click in viewer”.
4. In the embedded test page, click “Start measure” then click in the gray area. The test page sends `viewerClick` with mock positions; the Measure panel should show points and distance.
