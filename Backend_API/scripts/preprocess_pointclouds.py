#!/usr/bin/env python3
"""
Preprocess point cloud files for UE 3D Viewer.
Supports: LAS, LAZ, E57, PLY. Converts to PLY (or mesh) for UE / streaming.
"""
import argparse
import os
import sys


def load_las_laz(path: str):
    """Load LAS/LAZ via laspy."""
    try:
        import laspy
        import numpy as np
        las = laspy.read(path)
        x = np.array(las.x)
        y = np.array(las.y)
        z = np.array(las.z)
        try:
            r = np.array(las.red) if hasattr(las, "red") else None
            g = np.array(las.green) if hasattr(las, "green") else None
            b = np.array(las.blue) if hasattr(las, "blue") else None
        except Exception:
            r = g = b = None
        return x, y, z, r, g, b
    except Exception as e:
        raise RuntimeError(f"laspy load failed: {e}") from e


def load_e57(path: str):
    """Load E57 via pye57."""
    try:
        import pye57
        e57 = pye57.E57(path)
        if e57.scan_count == 0:
            raise RuntimeError("E57 has no scans")
        points = e57.read_scan_raw(0)
        x = points["cartesianX"]
        y = points["cartesianY"]
        z = points["cartesianZ"]
        r = points.get("colorRed")
        g = points.get("colorGreen")
        b = points.get("colorBlue")
        return x, y, z, r, g, b
    except Exception as e:
        raise RuntimeError(f"pye57 load failed: {e}") from e


def main():
    parser = argparse.ArgumentParser(description="Preprocess point clouds for UE")
    parser.add_argument("input", help="Input point cloud path (LAS, LAZ, E57, PLY)")
    parser.add_argument("-o", "--output", required=True, help="Output directory")
    parser.add_argument("--lod-ratio", type=float, default=None, metavar="0.0-1.0",
                        help="Optional LOD: voxel downsample to this ratio of points; writes *_LOD1.ply")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        return 1

    os.makedirs(args.output, exist_ok=True)
    ext = os.path.splitext(args.input)[1].lower()

    try:
        import numpy as np
        import open3d as o3d
    except ImportError as e:
        print(f"Error: need numpy and open3d: {e}", file=sys.stderr)
        return 1

    x, y, z, r, g, b = None, None, None, None, None, None

    if ext in {".las", ".laz"}:
        x, y, z, r, g, b = load_las_laz(args.input)
    elif ext == ".e57":
        x, y, z, r, g, b = load_e57(args.input)
    elif ext == ".ply":
        pcd = o3d.io.read_point_cloud(args.input)
        pts = np.asarray(pcd.points)
        x, y, z = pts[:, 0], pts[:, 1], pts[:, 2]
        cols = np.asarray(pcd.colors, dtype=np.float64)
        if cols.size > 0:
            r = (cols[:, 0] * 255).astype(np.uint8)
            g = (cols[:, 1] * 255).astype(np.uint8)
            b = (cols[:, 2] * 255).astype(np.uint8)
    else:
        print(f"Unsupported point cloud format: {ext}", file=sys.stderr)
        return 1

    # Build Open3D point cloud and export to PLY for UE / downstream
    pts = np.column_stack([x, y, z])
    pcd = o3d.geometry.PointCloud()
    pcd.points = o3d.utility.Vector3dVector(pts)
    if r is not None and g is not None and b is not None:
        try:
            rr = np.asarray(r).flatten()
            gg = np.asarray(g).flatten()
            bb = np.asarray(b).flatten()
            if len(rr) == len(pts) and len(gg) == len(pts) and len(bb) == len(pts):
                if rr.max() > 1 or gg.max() > 1 or bb.max() > 1:
                    rgb = np.column_stack([rr, gg, bb]) / 255.0
                else:
                    rgb = np.column_stack([rr, gg, bb])
                pcd.colors = o3d.utility.Vector3dVector(rgb.astype(np.float64))
        except Exception:
            pass

    base_name = os.path.splitext(os.path.basename(args.input))[0]
    out_name = base_name + "_ue.ply"
    out_path = os.path.join(args.output, out_name)
    o3d.io.write_point_cloud(out_path, pcd, write_ascii=False)
    print(f"Exported: {out_path}", file=sys.stderr)

    if args.lod_ratio is not None and 0 < args.lod_ratio < 1:
        try:
            n = len(np.asarray(pcd.points))
            target = max(100, int(n * args.lod_ratio))
            voxel_size = (n / target) ** (1 / 3) * 0.01
            pcd_lod = pcd.voxel_down_sample(voxel_size)
            if len(pcd_lod.points) > 0:
                lod_path = os.path.join(args.output, base_name + "_LOD1.ply")
                o3d.io.write_point_cloud(lod_path, pcd_lod, write_ascii=False)
                print(f"Exported LOD: {lod_path}", file=sys.stderr)
        except Exception as e:
            print(f"Point cloud LOD failed: {e}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
