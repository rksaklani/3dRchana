/**
 * Supported file formats for UE 3D Viewer pipeline.
 * Aligned with UE import + preprocessing (conversion where needed).
 */

const MESH_EXTENSIONS = [
  'obj', 'fbx', 'gltf', 'glb', 'dae', 'ply', 'stl', 'abc'
];

// PLY is mesh-only here; for point-cloud PLY use a separate pipeline or re-upload as LAS/E57.
const POINTCLOUD_EXTENSIONS = [
  'las', 'laz', 'e57'
];

const IMAGE_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'tiff', 'tif', 'tga', 'exr', 'bmp', 'dds'
];

const ALIGNMENT_EXTENSIONS = [
  'csv', 'txt', 'xml'
];

const SPLAT_EXTENSIONS = [
  'splat'
];

const ALL_EXTENSIONS = [
  ...new Set([...MESH_EXTENSIONS, ...POINTCLOUD_EXTENSIONS, ...IMAGE_EXTENSIONS, ...ALIGNMENT_EXTENSIONS, ...SPLAT_EXTENSIONS])
];

function getCategory(ext) {
  const e = (ext || '').toLowerCase().replace(/^\./, '');
  if (MESH_EXTENSIONS.includes(e)) return 'Meshes';
  if (POINTCLOUD_EXTENSIONS.includes(e)) return 'PointClouds';
  if (SPLAT_EXTENSIONS.includes(e)) return 'Splats';
  if (IMAGE_EXTENSIONS.includes(e)) return 'Textures';
  if (ALIGNMENT_EXTENSIONS.includes(e)) return 'Alignment';
  return null;
}

function isAllowed(ext) {
  return getCategory(ext) !== null;
}

function getAllowedExtensionsForAccept() {
  return ALL_EXTENSIONS.map(e => `.${e}`).join(',');
}

module.exports = {
  MESH_EXTENSIONS,
  POINTCLOUD_EXTENSIONS,
  IMAGE_EXTENSIONS,
  ALIGNMENT_EXTENSIONS,
  SPLAT_EXTENSIONS,
  ALL_EXTENSIONS,
  getCategory,
  isAllowed,
  getAllowedExtensionsForAccept
};
