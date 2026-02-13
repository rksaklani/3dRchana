#!/usr/bin/env python3
"""
Push an asset file to UE 3D Viewer via the integrations API.
Usage:
  python push_asset.py --api-key KEY --project-id PROJECT_ID --file /path/to/model.obj
  python push_asset.py --api-key KEY --project-name "My Project" --file /path/to/scan.las
"""
import argparse
import os
import sys

try:
    import requests
except ImportError:
    print("Install requests: pip install requests", file=sys.stderr)
    sys.exit(1)


def main():
    p = argparse.ArgumentParser(description="Push asset to UE 3D Viewer")
    p.add_argument("--api-key", required=True, help="API key (from Integrations page)")
    p.add_argument("--project-id", help="Existing project ID")
    p.add_argument("--project-name", help="Create project with this name (used if --project-id not set)")
    p.add_argument("--file", required=True, help="Path to file (e.g. .obj, .fbx, .las, .splat)")
    p.add_argument("--base-url", default=None, help="Backend API base URL (default: API_BASE_URL from env or http://localhost:3001)")
    args = p.parse_args()

    base = (os.environ.get("API_BASE_URL") or args.base_url or "http://localhost:3001").rstrip("/")
    headers = {"X-API-Key": args.api_key}

    project_id = args.project_id
    if not project_id and args.project_name:
        r = requests.post(f"{base}/projects", headers={**headers, "Content-Type": "application/json"}, json={"name": args.project_name})
        r.raise_for_status()
        project_id = r.json().get("id")
        if not project_id:
            print("Failed to create project", file=sys.stderr)
            sys.exit(1)
        print(f"Created project: {project_id}", file=sys.stderr)
    if not project_id:
        print("Provide --project-id or --project-name", file=sys.stderr)
        sys.exit(1)

    with open(args.file, "rb") as f:
        files = {"file": (args.file.split("/")[-1], f)}
        data = {"projectId": project_id}
        r = requests.post(f"{base}/integrations/push", headers=headers, files=files, data=data)
    r.raise_for_status()
    out = r.json()
    print(f"Uploaded: {out.get('path')} jobId={out.get('jobId')} status={out.get('status')}")


if __name__ == "__main__":
    main()
