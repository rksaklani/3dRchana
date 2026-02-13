# Backend API – UE 3D Viewer

Handles uploads, projects, and preprocessing for the 3D viewer.

## Supported formats

- **Meshes:** OBJ, FBX, GLTF, GLB, DAE, PLY, STL, ABC → preprocessed to UE-friendly OBJ (or copied for FBX/DAE/ABC).
- **Point clouds:** LAS, LAZ, E57 → converted to PLY for UE. (PLY is treated as mesh.)
- **Images:** JPG, PNG, TIFF, TGA, EXR, BMP, DDS (stored under Textures).
- **Alignment:** CSV, TXT, XML (stored under Alignment).

## Setup

```bash
npm install
```

For mesh and point cloud preprocessing, install Python deps:

```bash
pip install -r requirements.txt
```

Requires **Python 3** and: `trimesh`, `numpy` (meshes); `open3d`, `laspy`, `pye57`, `numpy` (point clouds).

## Run

```bash
npm start
```

Default port: 3001.

**Env:** `STORAGE_ROOT` (default: workspace `Storage`), `PORT`, `PYTHON_PATH` (default: `python3`), `CORS_ORIGIN` (comma-separated origins; omit for reflect). Projects persist to `Storage/projects.json`.

## Endpoints

- `POST /upload` – multipart file upload (field `file`, body `projectId`). Returns `{ ok, projectId, path, type, jobId?, status }`. Mesh/point cloud uploads are auto-queued for processing.
- `GET /upload/formats` – returns allowed extensions and `accept` string.
- `GET/POST /projects` – list / create projects.
- `POST /processing/mesh`, `POST /processing/pointcloud` – enqueue a job (body: `projectId`, `filePath`).
- `GET /processing/status/:jobId` – job status.
