# Billion-scale and mobile

This doc describes how the stack supports large scenes and mobile/tablet use.

## Level / chunk streaming

- **API:** `GET /projects/:projectId/levels` returns `{ categories, levels }`.  
  - `categories`: folder names under `Storage/processed/{projectId}/` (e.g. Meshes, PointClouds).  
  - `levels`: from `Storage/processed/{projectId}/levels.json` if present, otherwise same as categories.  
- **UE:** Load levels/chunks on demand by calling this API or reading from the processed path. Use level streaming so only visible chunks are loaded.

## Mesh LOD

- Set **`LOD_DECIMATE_RATIO`** (e.g. `0.2`) in the backend environment. The mesh preprocessor writes `*_LOD1.obj` alongside `*_ue.obj`. Use LOD1 for distance or mobile.

## Point cloud LOD

- Set **`LOD_POINTCLOUD_RATIO`** (e.g. `0.2`) in the backend environment. The point cloud preprocessor writes `*_LOD1.ply` (voxel downsampled). Use for mobile or overview.

## Mobile and touch

- **Frontend:** The viewer area uses `touch-action: manipulation` for better touch responsiveness. A **Performance mode** / **Low quality** toggle in the viewer bar sends `postMessage` to the iframe: `{ type: 'setQuality', quality: 'low' | 'high' }`.  
- **UE:** Implement a listener for `setQuality` and switch to LOD assets or reduce Pixel Streaming resolution/bitrate when `quality === 'low'`.  
- **Viewport:** The app uses `width=device-width, initial-scale=1.0` for mobile viewports.

## Summary

| Feature | How |
|--------|-----|
| Level streaming | `GET /projects/:id/levels`; UE loads chunks on demand. |
| Mesh LOD | `LOD_DECIMATE_RATIO` → `*_LOD1.obj`. |
| Point cloud LOD | `LOD_POINTCLOUD_RATIO` → `*_LOD1.ply`. |
| Mobile quality | Toggle sends `setQuality`; UE should use LOD or lower stream quality. |
| Touch | `touch-action: manipulation` on viewer container. |
