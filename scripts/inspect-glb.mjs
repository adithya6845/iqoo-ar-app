import fs from 'fs';

function inspectGlb(path) {
  const buf = fs.readFileSync(path);
  const magic = buf.readUInt32LE(0);
  const version = buf.readUInt32LE(4);
  const length = buf.readUInt32LE(8);
  const jsonChunkLen = buf.readUInt32LE(12);
  const jsonChunkType = buf.readUInt32LE(16);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLen);
  const json = JSON.parse(jsonStr);
  console.log(`=== ${path} ===`);
  console.log(`Total Size: ${(length / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`Meshes: ${json.meshes ? json.meshes.length : 0}`);
  console.log(`Nodes: ${json.nodes ? json.nodes.length : 0}`);
  console.log(`Animations: ${json.animations ? json.animations.length : 0}`);
  console.log(`Images: ${json.images ? json.images.length : 0}`);
  if (json.images) {
    json.images.forEach((img, i) => console.log(`  Image ${i}: ${img.name || img.uri || 'bufferView ' + img.bufferView} (${img.mimeType})`));
  }
  if (json.animations) {
    json.animations.forEach((anim, i) => console.log(`  Anim ${i}: ${anim.name || 'unnamed'} with ${anim.channels.length} channels`));
  }
}

inspectGlb('../Bleeding (1).glb');
inspectGlb('../cpr new glb.glb');
