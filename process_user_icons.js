const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

/**
 * Parses a 32-bit RGBA PNG buffer into raw pixel RGBA data array.
 */
function parsePNG(buffer) {
  let offset = 8; // skip 8-byte PNG header
  let width = 0, height = 0;
  const idatChunks = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const chunkData = buffer.slice(offset + 8, offset + 8 + length);
    offset += 8 + length + 4; // length + type + data + crc

    if (type === 'IHDR') {
      width = chunkData.readUInt32BE(0);
      height = chunkData.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(chunkData);
    }
  }

  const compressedData = Buffer.concat(idatChunks);
  const decompressed = zlib.inflateSync(compressedData);

  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1;
  const pixels = Buffer.alloc(width * height * bytesPerPixel);

  const prevRow = Buffer.alloc(width * bytesPerPixel);

  for (let y = 0; y < height; y++) {
    const rowStart = y * rowSize;
    const filter = decompressed[rowStart];
    const currentRow = decompressed.slice(rowStart + 1, rowStart + rowSize);
    const decodedRow = Buffer.alloc(width * bytesPerPixel);

    for (let x = 0; x < width * bytesPerPixel; x++) {
      let left = x >= bytesPerPixel ? decodedRow[x - bytesPerPixel] : 0;
      let up = prevRow[x];
      let upLeft = x >= bytesPerPixel ? prevRow[x - bytesPerPixel] : 0;
      let val = currentRow[x];

      if (filter === 1) {
        val = (val + left) & 0xff;
      } else if (filter === 2) {
        val = (val + up) & 0xff;
      } else if (filter === 3) {
        val = (val + Math.floor((left + up) / 2)) & 0xff;
      } else if (filter === 4) {
        val = (val + paethPredictor(left, up, upLeft)) & 0xff;
      }

      decodedRow[x] = val;
    }

    decodedRow.copy(prevRow);
    decodedRow.copy(pixels, y * width * bytesPerPixel);
  }

  return { width, height, pixels };
}

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

/**
 * Encodes raw RGBA pixel data buffer to a PNG buffer.
 */
function encodePNG(width, height, pixels) {
  const bytesPerPixel = 4;
  const rowSize = width * bytesPerPixel + 1;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter type 0 (None)
    pixels.copy(rawData, rowOffset + 1, y * width * bytesPerPixel, (y + 1) * width * bytesPerPixel);
  }

  const compressedData = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);

  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([Buffer.from(type), data]));
  chunk.writeInt32BE(crc, 8 + length);
  return chunk;
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

/**
 * Composites the user's car logo onto a 100% solid, high-contrast, full-bleed background.
 * Mode:
 * 'dark_background_white_logo': Solid #0b1329 / #0f62fe background with the user's car logo in bright white #ffffff.
 * 'light_background_black_logo': Solid #ffffff background with safe padding and dark navy #0b1329 car logo.
 */
function processUserIconToFullBleed(srcPngPath, targetSize, mode = 'dark_background_white_logo') {
  const srcBuffer = fs.readFileSync(srcPngPath);
  const { width: srcW, height: srcH, pixels: srcPixels } = parsePNG(srcBuffer);

  const outPixels = Buffer.alloc(targetSize * targetSize * 4);
  const paddingRatio = 0.15; // 15% safe margin around logo
  const drawableSize = targetSize * (1 - paddingRatio * 2);

  for (let y = 0; y < targetSize; y++) {
    for (let x = 0; x < targetSize; x++) {
      const outIdx = (y * targetSize + x) * 4;

      // 1. Solid Opaque Background (NO Transparency!)
      let bgR, bgG, bgB;

      if (mode === 'dark_background_white_logo') {
        // Gradient from Electric Indigo #0f62fe to Midnight #052370
        const t = (x * 0.4 + y * 0.6) / targetSize;
        bgR = Math.round(15 * (1 - t) + 5 * t);
        bgG = Math.round(98 * (1 - t) + 35 * t);
        bgB = Math.round(254 * (1 - t) + 112 * t);
      } else {
        // Crisp Solid Pure White
        bgR = 255; bgG = 255; bgB = 255;
      }

      // Map (x, y) to original logo pixel space
      const logoX = Math.floor(((x - targetSize * paddingRatio) / drawableSize) * srcW);
      const logoY = Math.floor(((y - targetSize * paddingRatio) / drawableSize) * srcH);

      let fgR = 0, fgG = 0, fgB = 0, fgA = 0;

      if (logoX >= 0 && logoX < srcW && logoY >= 0 && logoY < srcH) {
        const srcIdx = (logoY * srcW + logoX) * 4;
        const r = srcPixels[srcIdx];
        const g = srcPixels[srcIdx + 1];
        const b = srcPixels[srcIdx + 2];
        const a = srcPixels[srcIdx + 3];

        // Determine if pixel belongs to car logo artwork
        // The user's original image is black car drawing (r,g,b low) on transparent background (a=0 or near 0)
        // Or if pixel has opacity (a > 30) and is dark
        if (a > 30) {
          fgA = a / 255;
          if (mode === 'dark_background_white_logo') {
            // Convert black car artwork to crisp pure white emblem for dark background
            fgR = 255; fgG = 255; fgB = 255;
          } else {
            // Keep original black/dark car logo for light background
            fgR = r; fgG = g; fgB = b;
          }
        }
      }

      // Alpha Blend Foreground Logo over Solid Background
      const finalR = Math.round(fgR * fgA + bgR * (1 - fgA));
      const finalG = Math.round(fgG * fgA + bgG * (1 - fgA));
      const finalB = Math.round(fgB * fgA + bgB * (1 - fgA));

      outPixels[outIdx] = finalR;
      outPixels[outIdx + 1] = finalG;
      outPixels[outIdx + 2] = finalB;
      outPixels[outIdx + 3] = 255; // 100% FULL BLEED OPAQUE - CRITICAL FOR IOS
    }
  }

  return encodePNG(targetSize, targetSize, outPixels);
}

// MAIN PROCESSOR EXECUTION
const iconsDir = path.join(__dirname, 'icons');
const sourceIcon = path.join(iconsDir, 'icon-512.png');

if (fs.existsSync(sourceIcon)) {
  console.log('Processing user provided icon:', sourceIcon);

  // Generate full bleed iOS and Android icons using the user's exact car logo!
  const appleTouchBuffer = processUserIconToFullBleed(sourceIcon, 180, 'dark_background_white_logo');
  const icon192Buffer = processUserIconToFullBleed(sourceIcon, 192, 'dark_background_white_logo');
  const icon512Buffer = processUserIconToFullBleed(sourceIcon, 512, 'dark_background_white_logo');

  fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), appleTouchBuffer);
  fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), icon192Buffer);
  fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), icon512Buffer);
  fs.writeFileSync(path.join(iconsDir, 'favicon.png'), appleTouchBuffer);

  console.log('Successfully generated full-bleed iOS & Android app icons from user PNG!');
} else {
  console.error('Source icon file not found at:', sourceIcon);
}
