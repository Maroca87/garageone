const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Car + Wrench Mechanic Icon PNG Generator for GarageOne
function generateCarWrenchIconPNG(size) {
  const bytesPerPixel = 4;
  const rowSize = size * bytesPerPixel + 1;
  const rawData = Buffer.alloc(size * rowSize);
  const scale = size / 512;
  const center = size / 2;

  const squircleRadius = 110 * scale;

  for (let y = 0; y < size; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < size; x++) {
      const offset = rowOffset + 1 + x * bytesPerPixel;

      // Full Bleed Dark Premium Gradient Fill (#0f172a to #020617) - 100% Solid Opaque
      const gradT = (x * 0.3 + y * 0.7) / size;
      let r = Math.round(15 * (1 - gradT) + 2 * gradT);
      let g = Math.round(23 * (1 - gradT) + 6 * gradT);
      let b = Math.round(42 * (1 - gradT) + 23 * gradT);

      // --- CAR SILHOUETTE (Top Center) ---
      const carCenterX = center;
      const carCenterY = center - 25 * scale;
      const cX = x - carCenterX;
      const cY = y - carCenterY;

      // Car Roof & Windshield
      const roofY = -65 * scale + (cX * cX) / (120 * scale);
      const isRoof = (cY >= -110 * scale && cY <= -20 * scale && cY >= roofY && Math.abs(cX) <= 130 * scale);
      
      const windY = -52 * scale + (cX * cX) / (100 * scale);
      const isWindshieldCutout = (cY >= -95 * scale && cY <= -30 * scale && cY >= windY && Math.abs(cX) <= 110 * scale);

      // Car Body Base
      const isBodyBase = (cY >= -25 * scale && cY <= 60 * scale && Math.abs(cX) <= 170 * scale);
      
      // Side Mirrors
      const isLeftMirror = (cX >= -210 * scale && cX <= -165 * scale && cY >= -28 * scale && cY <= -2 * scale);
      const isRightMirror = (cX >= 165 * scale && cX <= 210 * scale && cY >= -28 * scale && cY <= -2 * scale);

      // Tire Bottom Cutouts
      const isLeftTire = (cX >= -160 * scale && cX <= -105 * scale && cY >= 45 * scale && cY <= 70 * scale);
      const isRightTire = (cX >= 105 * scale && cX <= 160 * scale && cY >= 45 * scale && cY <= 70 * scale);

      // Headlight Cutouts
      const headL = Math.sqrt((cX - (-110 * scale)) ** 2 + (cY - (10 * scale)) ** 2);
      const headR = Math.sqrt((cX - (110 * scale)) ** 2 + (cY - (10 * scale)) ** 2);
      const isHeadlight = (headL <= 22 * scale || headR <= 22 * scale);

      // Grille Cutout
      const isGrille = (cY >= 25 * scale && cY <= 45 * scale && Math.abs(cX) <= 55 * scale);

      const isCarWhite = (isRoof || isBodyBase || isLeftMirror || isRightMirror) && 
                         !isWindshieldCutout && !isLeftTire && !isRightTire && !isHeadlight && !isGrille;

      // --- MECHANIC WRENCH EMBLEM (Bottom Center / Diagonal Cross) ---
      const wX = x - center;
      const wY = y - (center + 105 * scale);

      // Diagonal Wrench handle (from -90,-40 to 90,40)
      const handleDist = distanceToSegment(wX, wY, -100 * scale, -25 * scale, 100 * scale, 25 * scale);
      const isWrenchHandle = (handleDist <= 14 * scale && Math.abs(wX) <= 110 * scale);

      // Wrench Head Ring Left
      const headLeftDist = Math.sqrt((wX - (-100 * scale)) ** 2 + (wY - (-25 * scale)) ** 2);
      const isWrenchHeadLeft = (headLeftDist <= 32 * scale && headLeftDist >= 14 * scale);
      const isWrenchNotchLeft = (headLeftDist < 14 * scale) || (wX <= -100 * scale && wY >= -40 * scale && wY <= -10 * scale);

      // Wrench Head Ring Right
      const headRightDist = Math.sqrt((wX - (100 * scale)) ** 2 + (wY - (25 * scale)) ** 2);
      const isWrenchHeadRight = (headRightDist <= 32 * scale && headRightDist >= 14 * scale);
      const isWrenchNotchRight = (headRightDist < 14 * scale) || (wX >= 100 * scale && wY >= 10 * scale && wY <= 40 * scale);

      const isWrenchWhite = (isWrenchHandle || isWrenchHeadLeft || isWrenchHeadRight) && !isWrenchNotchLeft && !isWrenchNotchRight;

      // COLOR COMPOSITION
      if (isCarWhite || isWrenchWhite) {
        // Bright Solid White (#ffffff)
        r = 255; g = 255; b = 255;
      }

      rawData[offset] = r;
      rawData[offset + 1] = g;
      rawData[offset + 2] = b;
      rawData[offset + 3] = 255;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr.writeUInt8(8, 8);
  ihdr.writeUInt8(6, 9);
  ihdr.writeUInt8(0, 10);
  ihdr.writeUInt8(0, 11);
  ihdr.writeUInt8(0, 12);
  const ihdrChunk = createChunk('IHDR', ihdr);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function distanceToSegment(px, py, x1, y1, x2, y2) {
  const l2 = (x2 - x1) ** 2 + (y2 - y1) ** 2;
  if (l2 === 0) return Math.sqrt((px - x1) ** 2 + (py - y1) ** 2);
  let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * (x2 - x1);
  const projY = y1 + t * (y2 - y1);
  return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
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

const dir = path.join(__dirname, 'icons');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);

fs.writeFileSync(path.join(dir, 'apple-touch-icon.png'), generateCarWrenchIconPNG(180));
fs.writeFileSync(path.join(dir, 'icon-192.png'), generateCarWrenchIconPNG(192));
fs.writeFileSync(path.join(dir, 'icon-512.png'), generateCarWrenchIconPNG(512));
console.log('Car and Wrench Mechanic icons generated successfully!');
