import fs from 'fs';

function inspectDetails(path) {
  const buf = fs.readFileSync(path);
  const jsonChunkLen = buf.readUInt32LE(12);
  const jsonStr = buf.toString('utf8', 20, 20 + jsonChunkLen);
  const json = JSON.parse(jsonStr);
  const binOffset = 20 + jsonChunkLen + 8;

  console.log(`=== ${path} breakdown ===`);
  if (json.images) {
    let totalImgSize = 0;
    json.images.forEach((img, i) => {
      const bv = json.bufferViews[img.bufferView];
      totalImgSize += bv.byteLength;
      console.log(`  Img ${i} [${img.name}]: ${(bv.byteLength / (1024 * 1024)).toFixed(2)} MB`);
    });
    console.log(`Total Images Size: ${(totalImgSize / (1024 * 1024)).toFixed(2)} MB`);
  }
}

inspectDetails('../cpr new glb.glb');
inspectDetails('../Bleeding (1).glb');
