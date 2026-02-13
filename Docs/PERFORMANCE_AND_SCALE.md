# Performance and scale (“Billion polygons/points in your pocket”)

This doc outlines how the stack can aim for very large scenes and better mobile support.

## Current stack

- **UE + Pixel Streaming:** Good for high-quality rendering; streamer does the heavy work; client gets video + input.
- **Asset pipeline:** Preprocessing (meshes → OBJ, point clouds → PLY) does not yet include LOD or level streaming.

## Recommended directions

1. **LOD (level of detail)**  
   Optional mesh LOD is implemented: set `LOD_DECIMATE_RATIO` (e.g. `0.2`) in the backend environment; the mesh preprocessor writes a reduced `*_LOD1.obj` alongside the full `*_ue.obj`. UE can switch LOD by distance. Outputs live under `Storage/processed/{projectId}/Meshes/`.

2. **Level / chunk streaming**  
   For massive scenes, split the world into chunks and stream only visible chunks. UE supports level streaming; the backend could expose “chunks” and the UE project loads them on demand.

3. **Point cloud scaling**  
   For billion-point clouds: voxelize or decimate in preprocessing (e.g. Open3D); stream levels of detail or tiled data; use UE instancing or a point-cloud plugin that supports LOD.

4. **Mobile tuning**  
   - **LOD / mobile quality:** Use `LOD_DECIMATE_RATIO` (e.g. `0.2`) so preprocessing produces a lighter `*_LOD1.obj`; load this in UE for mobile or “performance” mode.  
   - Reduce Pixel Streaming resolution/bitrate on small screens.  
   - Touch-friendly controls in the player UI.  
   - Optional “lite” mode (lower poly count, fewer effects) when running on mobile.

5. **Gaussian splats**  
   The `generate_gaussian_splats.py` script is still a stub. Completing it (e.g. with gsplat or nerfstudio) and loading splats in UE would add Nira-style splat support.

## Status

- **Present:** Single-asset preprocessing, optional mesh LOD (`LOD_DECIMATE_RATIO` → `*_LOD1.obj`), Pixel Streaming for visualization.  
- **Not yet implemented:** Level streaming, point-cloud LOD/tiling, mobile presets, Gaussian splat generation.  
- **Next steps:** Document chunk/streaming strategy for UE; implement and wire Gaussian splat script.
