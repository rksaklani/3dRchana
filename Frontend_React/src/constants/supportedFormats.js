/**
 * Supported upload formats (aligned with Backend_API allowedFormats).
 * Meshes: OBJ, FBX, GLTF, GLB, DAE, PLY, STL, ABC
 * Point clouds: LAS, LAZ, E57
 * Gaussian splats: .splat
 * Images: JPG, PNG, TIFF, TGA, EXR, BMP, DDS
 * Alignment: CSV, TXT, XML
 */
export const ACCEPT_EXTENSIONS = [
  '.obj', '.fbx', '.gltf', '.glb', '.dae', '.ply', '.stl', '.abc',
  '.las', '.laz', '.e57',
  '.splat',
  '.jpg', '.jpeg', '.png', '.tiff', '.tif', '.tga', '.exr', '.bmp', '.dds',
  '.csv', '.txt', '.xml'
].join(',');

export const FORMAT_HINT = 'OBJ, FBX, GLB, PLY, STL, LAS, E57, .splat (Gaussian splats), images, etc.';
