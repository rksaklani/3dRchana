# Direct app integrations

External apps (RealityCapture, Metashape, Revit, CloudCompare, etc.) can push assets into UE 3D Viewer without using the web UI.

## API key

Get an API key from the Dashboard → Integrations (or `GET /integrations/apikey?userId=...` with `X-User-Id`). Use it for all push requests.

## Push upload

**Endpoint:** `POST /integrations/push` (same as `POST /upload`).

- **Headers:** `X-API-Key: <your-key>` or `Authorization: Bearer <your-key>`.
- **Body:** `multipart/form-data` with `file` and `projectId`.

The server stores the file and enqueues preprocessing (mesh, point cloud, or Gaussian splat).

## Create project

```http
POST /projects
Content-Type: application/json
X-API-Key: <your-key>

{"name": "My Scan"}
```

Use the returned `id` as `projectId` in push.

## Example: cURL

```bash
PROJECT_ID=$(curl -s -X POST http://localhost:3001/projects \
  -H "Content-Type: application/json" -H "X-API-Key: YOUR_KEY" \
  -d '{"name":"Exported Scan"}' | jq -r .id)

curl -X POST http://localhost:3001/integrations/push \
  -H "X-API-Key: YOUR_KEY" \
  -F "file=@/path/to/model.obj" \
  -F "projectId=$PROJECT_ID"
```

## Example: Python script

Use **scripts/push_asset.py**: `python push_asset.py --api-key KEY --project-id PROJECT_ID --file /path/to/model.obj`. Use `--project-name "My Project"` to create a project instead of `--project-id`.

## Native plugins

Native plugins (e.g. inside RealityCapture or Revit) would call the same REST API (create project + push) using the user's API key. This doc is the integration spec.
