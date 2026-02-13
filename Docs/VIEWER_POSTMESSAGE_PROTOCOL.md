# Viewer postMessage protocol

The React app embeds the Pixel Streaming player in an iframe. For **in-viewer measurement**, the following postMessage contract is used so the UE player (or a custom wrapper) can send click positions to the parent.

## Messages from viewer (iframe) → parent

- **`viewerClick`**  
  When the user clicks in the 3D view (and measure mode is active), the viewer should post:

  ```js
  window.parent.postMessage({
    type: 'viewerClick',
    position: { x, y, z }  // world or hit position in your scene units
  }, '*');
  ```

  The parent (React app) will add this as a measure point and show distance between the last two points.

## Messages from parent → viewer (iframe)

- **`startMeasure`**  
  Parent tells the viewer to enter “measure mode”: subsequent clicks should be sent as `viewerClick` with the hit position.

  ```js
  { type: 'startMeasure' }
  ```

- **`stopMeasure`**  
  Parent tells the viewer to leave measure mode.

  ```js
  { type: 'stopMeasure' }
  ```

## Implementing in UE / custom player

1. In your player page (or the SignallingWebServer UI), listen for `window.addEventListener('message', (e) => { ... })`.
2. If `e.data?.type === 'startMeasure'`, set a flag so that on the next click (or raycast hit) you call `window.parent.postMessage({ type: 'viewerClick', position: { x, y, z } }, '*')` with the hit position in world space.
3. If `e.data?.type === 'stopMeasure'`, clear the flag.
4. Use your engine’s raycast from mouse to get the 3D position (e.g. Unreal’s hit result) and send that as `position`.

This allows the Dashboard Measure panel’s “Click in viewer” mode to work with any player that implements the protocol.

---

## Real-time collaboration (camera sync)

- **Viewer → parent `cameraUpdate`**  
  When the camera moves, the viewer can post so other users can follow:

  ```js
  window.parent.postMessage({
    type: 'cameraUpdate',
    position: { x, y, z },
    rotation: { x, y, z, w }  // or euler
  }, '*');
  ```

  The parent sends this to the collab WebSocket; other clients receive it and send `setCamera` to their iframe.

- **Parent → viewer `setCamera`**  
  To sync another user’s camera, the parent posts:

  ```js
  { type: 'setCamera', position: { x, y, z }, rotation: { x, y, z, w } }
  ```

  The viewer should apply this to the active camera when received.

---

## Mobile / performance

- **Parent → viewer `setQuality`**  
  The Dashboard “Performance mode” toggle sends:

  ```js
  { type: 'setQuality', quality: 'low' | 'high' }
  ```

  The viewer should switch to LOD or reduce stream quality when `quality === 'low'`.
