# Feature comparison: UE 3D Viewer vs Nira

This document compares the UE 3D Viewer project with [Nira](https://nira.app/) and summarizes what is implemented after closing the previous gaps.

## Implemented in this project

| Feature | Status | Notes |
|--------|--------|--------|
| **Store** | ✅ | Upload to Backend, Storage (raw + processed). |
| **Visualize** | ✅ | Embedded 3D viewer (Pixel Streaming + UE). |
| **Measure** | ✅ | Measure panel: add points A/B, distance; “Click in viewer” mode via postMessage; UE doc + test page. |
| **Compare** | ✅ | Compare page: side-by-side two viewer iframes. |
| **Markup / Annotate** | ✅ | Annotations panel: add/delete; stored in backend; in PDF; **Focus** broadcasts to collab. |
| **PDF reports** | ✅ | Export PDF (project, annotations, scene config). |
| **Collaboration / Share** | ✅ | Share by email (Viewer/Editor); presence (“Also viewing”); **real-time collab** (WebSocket: shared camera + annotation focus). |
| **Configure / Curate** | ✅ | Scene config: camera presets per project. |
| **Integrations** | ✅ | API key, webhook; **push upload** (`POST /integrations/push`); **Direct integrations** doc + **scripts/push_asset.py**. |
| **Point clouds & meshes** | ✅ | LAS, LAZ, E57, OBJ, FBX, PLY, etc.; preprocessing; **mesh LOD** (`LOD_DECIMATE_RATIO`); **point-cloud LOD** (`LOD_POINTCLOUD_RATIO`). |
| **Gaussian splats** | ✅ | **.splat** upload; pipeline script (copy/prepare for UE); worker + `processed/…/Splats`. |
| **Billion-scale / mobile** | ✅ | **Levels API** (`GET /projects/:id/levels`); mesh + point-cloud LOD; **Performance mode** toggle (postMessage `setQuality`); touch-friendly viewer area; **Docs/MOBILE_AND_SCALE.md**. |
| **Auth** | ✅ | Auth middleware; projects scoped by owner + shared; requireAuth on projects, upload, presence. |
| **In-viewer measure** | ✅ | postMessage protocol; **Docs/UE_VIEWER_MEASURE_SETUP.md**; **viewer_measure_test.html** for testing without UE. |

## Comparison summary

- **At parity with Nira (conceptually):** Store, Visualize, Measure (including click-in-viewer protocol), Compare, Markup/Annotate, PDF reports, Share + presence, **real-time collaboration** (shared camera + annotation focus), Scene config, Integrations (API key, webhook, push, direct-integration doc + script), point clouds & meshes with LOD, **Gaussian splats** pipeline, **billion-scale/mobile** (levels API, LOD, performance mode, mobile UX), auth/scoping, and in-viewer measure (protocol + UE setup doc + test page).
- **Remaining gap:** **Native plugins** inside third-party apps (e.g. “Export to UE 3D Viewer” inside RealityCapture or Revit) are not part of this repo; the REST API and **Docs/DIRECT_INTEGRATIONS.md** define the contract for such plugins.

## References

- **Levels / LOD / mobile:** `Docs/MOBILE_AND_SCALE.md`
- **Viewer postMessage (measure, camera, setQuality):** `Docs/VIEWER_POSTMESSAGE_PROTOCOL.md`
- **UE in-viewer measure setup:** `Docs/UE_VIEWER_MEASURE_SETUP.md`
- **Direct integrations:** `Docs/DIRECT_INTEGRATIONS.md`, `scripts/push_asset.py`
- **Performance / scale:** `Docs/PERFORMANCE_AND_SCALE.md`
