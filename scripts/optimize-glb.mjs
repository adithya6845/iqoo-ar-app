import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function optimizeGlb(inputPath, outputPath, maxTextureDim = 1024) {
  console.log(`\n========================================`);
  console.log(`Processing: ${inputPath} -> ${outputPath}`);
  const inputBuffer = fs.readFileSync(inputPath);
  
  const magic = inputBuffer.readUInt32LE(0);
  const version = inputBuffer.readUInt32LE(4);
  const totalLength = inputBuffer.readUInt32LE(8);
  
  if (magic !== 0x46546C67) {
    throw new Error('Not a valid GLB file');
  }
  
  const jsonChunkLen = inputBuffer.readUInt32LE(12);
  const jsonChunkType = inputBuffer.readUInt32LE(16);
  const jsonStr = inputBuffer.toString('utf8', 20, 20 + jsonChunkLen);
  const json = JSON.parse(jsonStr);
  
  const binHeaderOffset = 20 + jsonChunkLen;
  const binChunkLen = inputBuffer.readUInt32LE(binHeaderOffset);
  const binChunkType = inputBuffer.readUInt32LE(binHeaderOffset + 4);
  const binDataOffset = binHeaderOffset + 8;
  const binBuffer = inputBuffer.subarray(binDataOffset, binDataOffset + binChunkLen);
  
  console.log(`Original GLB Size: ${(inputBuffer.length / (1024 * 1024)).toFixed(2)} MB`);
  
  if (!json.images || json.images.length === 0) {
    console.log('No images found in GLB. Copying directly.');
    fs.copyFileSync(inputPath, outputPath);
    return;
  }
  
  // We will rebuild the binary buffer
  const newBufferViews = [];
  const newBuffers = [];
  let currentBinOffset = 0;
  
  // Map old bufferViews to new ones or reconstruct
  // First, find which bufferViews are images vs geometry/animations
  const imageBufferViewIndices = new Set();
  json.images.forEach(img => {
    if (img.bufferView !== undefined) {
      imageBufferViewIndices.add(img.bufferView);
    }
  });
  
  // Process all bufferViews
  // To keep references simple and robust, let's process each bufferView
  const oldToNewOffsets = new Map();
  const bufferViewDataMap = new Map();
  
  for (let i = 0; i < json.bufferViews.length; i++) {
    const bv = json.bufferViews[i];
    const rawData = binBuffer.subarray(bv.byteOffset || 0, (bv.byteOffset || 0) + bv.byteLength);
    
    if (imageBufferViewIndices.has(i)) {
      // Find corresponding image
      const imgIdx = json.images.findIndex(img => img.bufferView === i);
      const img = json.images[imgIdx];
      const imgName = img.name || `Image_${imgIdx}`;
      const isNormal = imgName.toLowerCase().includes('normal');
      
      try {
        const metadata = await sharp(rawData).metadata();
        console.log(`  Optimizing Image ${imgIdx} [${imgName}]: ${metadata.width}x${metadata.height} (${(bv.byteLength / (1024 * 1024)).toFixed(2)} MB)`);
        
        let pipeline = sharp(rawData);
        if (metadata.width > maxTextureDim || metadata.height > maxTextureDim) {
          pipeline = pipeline.resize({
            width: metadata.width > metadata.height ? maxTextureDim : undefined,
            height: metadata.height >= metadata.width ? maxTextureDim : undefined,
            fit: 'inside'
          });
        }
        
        let optimizedImgBuf;
        if (isNormal) {
          // Keep normal maps sharp and artifact-free using PNG or high-quality WebP
          optimizedImgBuf = await pipeline.png({ compressionLevel: 9 }).toBuffer();
          img.mimeType = 'image/png';
        } else {
          // Diffuse / Gloss / Opacity textures can be compressed as JPEG/WebP
          optimizedImgBuf = await pipeline.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
          img.mimeType = 'image/jpeg';
        }
        
        console.log(`    -> Reduced to: ${(optimizedImgBuf.length / (1024 * 1024)).toFixed(2)} MB`);
        bufferViewDataMap.set(i, optimizedImgBuf);
      } catch (err) {
        console.warn(`    Failed to optimize image ${imgName}, keeping original:`, err.message);
        bufferViewDataMap.set(i, rawData);
      }
    } else {
      // Non-image data (vertex buffer, index buffer, animation keyframes, skins)
      bufferViewDataMap.set(i, rawData);
    }
  }
  
  // Reassemble binary buffer with proper 4-byte alignment
  const outputBinChunks = [];
  let newByteLength = 0;
  
  for (let i = 0; i < json.bufferViews.length; i++) {
    const data = bufferViewDataMap.get(i);
    const byteOffset = newByteLength;
    
    json.bufferViews[i].byteOffset = byteOffset;
    json.bufferViews[i].byteLength = data.length;
    
    outputBinChunks.push(data);
    newByteLength += data.length;
    
    // 4-byte alignment padding
    const padding = (4 - (data.length % 4)) % 4;
    if (padding > 0) {
      const padBuf = Buffer.alloc(padding, 0);
      outputBinChunks.push(padBuf);
      newByteLength += padding;
    }
  }
  
  // Update buffer length in json
  if (json.buffers && json.buffers.length > 0) {
    json.buffers[0].byteLength = newByteLength;
  }
  
  const combinedBin = Buffer.concat(outputBinChunks, newByteLength);
  
  // Prepare JSON Chunk
  let newJsonStr = JSON.stringify(json);
  let jsonBuffer = Buffer.from(newJsonStr, 'utf8');
  const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
  if (jsonPadding > 0) {
    newJsonStr += ' '.repeat(jsonPadding);
    jsonBuffer = Buffer.from(newJsonStr, 'utf8');
  }
  
  // Create GLB Header
  const headerBuf = Buffer.alloc(12);
  const finalGlbSize = 12 + 8 + jsonBuffer.length + 8 + combinedBin.length;
  headerBuf.writeUInt32LE(0x46546C67, 0); // 'glTF'
  headerBuf.writeUInt32LE(2, 4); // version 2
  headerBuf.writeUInt32LE(finalGlbSize, 8);
  
  // JSON Chunk header
  const jsonChunkHeader = Buffer.alloc(8);
  jsonChunkHeader.writeUInt32LE(jsonBuffer.length, 0);
  jsonChunkHeader.writeUInt32LE(0x4E4F534A, 4); // 'JSON'
  
  // BIN Chunk header
  const binChunkHeader = Buffer.alloc(8);
  binChunkHeader.writeUInt32LE(combinedBin.length, 0);
  binChunkHeader.writeUInt32LE(0x004E4942, 4); // 'BIN\0'
  
  const finalGlb = Buffer.concat([
    headerBuf,
    jsonChunkHeader,
    jsonBuffer,
    binChunkHeader,
    combinedBin
  ]);
  
  fs.writeFileSync(outputPath, finalGlb);
  console.log(`Saved: ${outputPath}`);
  console.log(`Final GLB Size: ${(finalGlb.length / (1024 * 1024)).toFixed(2)} MB (${((finalGlb.length / inputBuffer.length) * 100).toFixed(1)}% of original)`);
}

async function run() {
  await optimizeGlb('../Bleeding (1).glb', './public/Bleeding.glb', 1024);
  await optimizeGlb('../Bleeding (1).glb', './public/Bleeding (1).glb', 1024);
  await optimizeGlb('../cpr new glb.glb', './public/cpr_new.glb', 1024);
  await optimizeGlb('../cpr new glb.glb', './public/cpr new glb.glb', 1024);
  console.log('\nAll models optimized successfully!');
}

run().catch(console.error);
