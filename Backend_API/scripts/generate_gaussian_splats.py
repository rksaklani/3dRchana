#!/usr/bin/env python3
"""
Gaussian splat pipeline for UE 3D Viewer.
- If input is a .ply or .splat file (e.g. from gsplat, nerfstudio, or export): copy to output for UE.
- If input is a directory of images: try to run an external pipeline (gsplat/nerfstudio) when available;
  otherwise write a stub manifest and document that users should run the pipeline externally and upload the result.
"""
import argparse
import os
import shutil
import sys


def main():
    parser = argparse.ArgumentParser(description="Generate or copy Gaussian splat assets for UE")
    parser.add_argument("input", help="Input path: .ply / .splat file, or directory of images for training")
    parser.add_argument("-o", "--output", required=True, help="Output directory (e.g. processed/projectId/Splats)")
    args = parser.parse_args()

    os.makedirs(args.output, exist_ok=True)

    if os.path.isfile(args.input):
        ext = os.path.splitext(args.input)[1].lower()
        if ext in (".ply", ".splat"):
            base = os.path.splitext(os.path.basename(args.input))[0]
            out_name = base + "_splats.ply" if ext == ".ply" else base + ".splat"
            out_path = os.path.join(args.output, out_name)
            shutil.copy2(args.input, out_path)
            print(f"Copied splat asset: {out_path}", file=sys.stderr)
            return 0
        print(f"Unsupported splat file type: {ext}. Use .ply or .splat.", file=sys.stderr)
        return 1

    if os.path.isdir(args.input):
        # Optional: run gsplat/nerfstudio if installed (pip install gsplat or nerfstudio)
        try:
            import subprocess
            # Prefer gsplat CLI if available
            result = subprocess.run(
                [sys.executable, "-m", "gsplat", "train", args.input, "--output", args.output],
                capture_output=True,
                text=True,
                timeout=3600,
                cwd=args.output,
            )
            if result.returncode == 0:
                print("gsplat training completed", file=sys.stderr)
                return 0
        except Exception as e:
            pass
        # Stub: write a readme so UE knows the folder is for splats; user runs pipeline externally
        readme = os.path.join(args.output, "README_splats.txt")
        with open(readme, "w") as f:
            f.write("Gaussian splat input: images directory was uploaded.\n")
            f.write("Run gsplat or nerfstudio externally, then upload the output .ply/.splat to this project.\n")
        print("Images directory: run gsplat/nerfstudio externally and upload the output .ply/.splat.", file=sys.stderr)
        return 0

    print(f"Error: input not found or not a file/dir: {args.input}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    sys.exit(main())
