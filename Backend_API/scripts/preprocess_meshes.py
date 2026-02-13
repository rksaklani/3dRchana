#!/usr/bin/env python3
"""
Preprocess mesh files for UE 3D Viewer.
Supports: OBJ, FBX, STL, PLY, GLB/GLTF (via trimesh). Exports UE-friendly OBJ.
DAE/ABC: copied to output if conversion not available; UE can import DAE.
"""
import argparse
import os
import shutil
import sys


def main():
    parser = argparse.ArgumentParser(description="Preprocess meshes for UE")
    parser.add_argument("input", help="Input mesh path")
    parser.add_argument("-o", "--output", required=True, help="Output directory")
    parser.add_argument("--decimate-ratio", type=float, default=None, metavar="0.0-1.0",
                        help="Optional LOD: keep this ratio of faces (e.g. 0.2 for mobile); writes *_LOD1.obj")
    args = parser.parse_args()

    if not os.path.isfile(args.input):
        print(f"Error: input file not found: {args.input}", file=sys.stderr)
        return 1

    os.makedirs(args.output, exist_ok=True)
    ext = os.path.splitext(args.input)[1].lower()

    # Formats trimesh can load and we export to OBJ for UE
    trimesh_formats = {".obj", ".stl", ".ply", ".glb", ".gltf", ".off"}
    if ext in trimesh_formats:
        try:
            import trimesh
            mesh = trimesh.load(args.input, force="mesh")
            if mesh is None:
                print("Error: could not load as single mesh", file=sys.stderr)
                return 1
            if isinstance(mesh, trimesh.Scene):
                meshes = list(mesh.geometry.values())
                if not meshes:
                    print("Error: scene has no geometry", file=sys.stderr)
                    return 1
                mesh = trimesh.util.concatenate(meshes)
            base_name = os.path.splitext(os.path.basename(args.input))[0]
            out_name = base_name + "_ue.obj"
            out_path = os.path.join(args.output, out_name)
            mesh.export(out_path, file_type="obj")
            print(f"Exported: {out_path}", file=sys.stderr)

            if args.decimate_ratio is not None and 0 < args.decimate_ratio < 1:
                try:
                    n_faces = len(mesh.faces)
                    target = max(4, int(n_faces * args.decimate_ratio))
                    simplified = mesh.simplify_quadric_decimation(target)
                    lod_path = os.path.join(args.output, base_name + "_LOD1.obj")
                    simplified.export(lod_path, file_type="obj")
                    print(f"Exported LOD: {lod_path}", file=sys.stderr)
                except Exception as e:
                    print(f"LOD decimation failed: {e}", file=sys.stderr)

            return 0
        except Exception as e:
            print(f"trimesh conversion failed: {e}", file=sys.stderr)
            return 1

    # FBX, DAE, ABC: copy to output for UE to import (or use Assimp/Blender in future)
    if ext in {".fbx", ".dae", ".abc"}:
        out_name = os.path.basename(args.input)
        out_path = os.path.join(args.output, out_name)
        shutil.copy2(args.input, out_path)
        print(f"Copied for UE import: {out_path}", file=sys.stderr)
        return 0

    # Any other allowed mesh format: copy so UE or external tools can be used
    out_name = os.path.basename(args.input)
    out_path = os.path.join(args.output, out_name)
    shutil.copy2(args.input, out_path)
    print(f"Copied for UE import: {out_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
