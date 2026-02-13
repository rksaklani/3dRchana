# Performance and optimizations

This document summarizes the performance-related behavior and tuning options in the UE 3D Viewer stack.

---

## Backend (Backend_API)

| Optimization | Description |
|--------------|-------------|
| **Response compression** | `compression()` middleware gzips JSON and other responses when the client supports it. Reduces payload size over the network. |
| **Projects store cache** | `projectsStore.load()` uses an in-memory cache; `save()` updates the cache. Reduces repeated disk reads for `projects.json`. |
| **Sharing store cache** | `sharingStore.load()` uses an in-memory cache; `save()` and `removeProject()` update it. Fewer reads of `sharing.json`. |
| **Worker concurrency limit** | Mesh, point cloud, and Gaussian splat jobs run through a queue. Default: **2** concurrent workers. Set `WORKER_MAX_CONCURRENT` (e.g. in `.env`) to change. Prevents CPU/memory spikes when many files are uploaded at once. |
| **Cache-Control on GET** | `GET /projects/:id/levels` and `GET /projects/:id/config` send `Cache-Control: private, max-age=10` so browsers can cache for 10 seconds. |

### Env variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `WORKER_MAX_CONCURRENT` | `2` | Max concurrent preprocessing jobs (mesh, pointcloud, splat). Increase on powerful servers; decrease to avoid overload. |

---

## Frontend (Frontend_React)

| Optimization | Description |
|--------------|-------------|
| **Lazy routes** | All page components (Home, Dashboard, Compare, etc.) are loaded with `React.lazy()`. Initial bundle is smaller; route code loads on demand. |
| **Projects API cache** | `getProjects()` caches the response in memory. Cache is cleared after `createProject`, `updateProject`, and `deleteProject`. Reduces repeated `/projects` calls when switching views. |
| **ProcessingStatus polling** | Polling stops when job status is `completed` or `failed`. No more 2s interval after the job is done. |
| **Presence polling** | Interval is **5s** when the tab is visible and **10s** when hidden (`document.visibilitychange`). Fewer requests when the user is not viewing the tab. |
| **Memoized project rows** | Dashboard project list uses a `React.memo`-wrapped row component and stable callbacks so only the changed row re-renders when selecting or editing. |

---

## SignallingWebServer

- **Permissions-Policy** header is set for the player page so WebXR checks don’t trigger console errors when the player is embedded in an iframe.

---

## Summary

- **First load:** Lazy routes reduce initial JS size.
- **Network:** Compression and Cache-Control reduce bandwidth.
- **Server:** In-memory caches and worker concurrency limit reduce disk I/O and CPU spikes.
- **Client:** Fewer API calls (cache, stop polling when done, slower presence when tab hidden) and fewer re-renders (memoized list rows).

For env and script details, see the main **README.md** and **.env.example**.
