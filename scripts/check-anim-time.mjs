import fs from 'fs';
import * as THREE from 'three';

const buf = fs.readFileSync('./public/cpr_new.glb');
const jsonChunkLen = buf.readUInt32LE(12);
const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLen);
const json = JSON.parse(jsonStr);

console.log('Animation count:', json.animations.length);
json.animations.forEach((a, i) => {
  console.log(`Anim ${i}: duration=${a.samplers[0] ? 'sampler duration' : 'none'}`);
  const inputAccessor = json.accessors[a.samplers[0].input];
  console.log(`  Min time: ${inputAccessor.min[0]}, Max time: ${inputAccessor.max[0]}`);
});
