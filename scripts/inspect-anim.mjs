import fs from 'fs';

const buf = fs.readFileSync('./public/cpr_new.glb');
const jsonChunkLen = buf.readUInt32LE(12);
const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLen);
const json = JSON.parse(jsonStr);

console.log('Animations:', json.animations ? json.animations.length : 0);
if (json.animations) {
  json.animations.forEach((anim, i) => {
    console.log(`\nAnim ${i} (${anim.name}): ${anim.channels.length} channels, ${anim.samplers.length} samplers`);
    // Print first 5 channels
    anim.channels.slice(0, 5).forEach((ch, ci) => {
      const node = json.nodes[ch.target.node];
      console.log(`  Channel ${ci}: target node #${ch.target.node} (${node?.name || 'unknown'}), path=${ch.target.path}`);
    });
  });
}
