// Generates PNG icons using only Node.js built-ins (no extra packages)
import { deflateSync } from "zlib";
import { writeFileSync } from "fs";

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const byte of buf) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])));
  return Buffer.concat([len, t, data, crcBuf]);
}

function createIcon(size) {
  const cx = size / 2;
  const cy = size / 2;
  const circleR = size * 0.42;

  // Play triangle vertices (pointing right, inside circle)
  const tr = size * 0.22;
  const tx = cx + tr * 0.15;
  const ty = cy;
  const v1 = [tx - tr * 0.9, ty - tr];
  const v2 = [tx - tr * 0.9, ty + tr];
  const v3 = [tx + tr, ty];

  function inTriangle(x, y) {
    const [x1, y1] = v1, [x2, y2] = v2, [x3, y3] = v3;
    const d1 = (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
    const d2 = (x - x3) * (y2 - y3) - (x2 - x3) * (y - y3);
    const d3 = (x - x1) * (y3 - y1) - (x3 - x1) * (y - y1);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB

  const raw = Buffer.alloc(size * (1 + size * 3));
  let pos = 0;
  for (let y = 0; y < size; y++) {
    raw[pos++] = 0;
    for (let x = 0; x < size; x++) {
      const dist = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (dist <= circleR) {
        if (inTriangle(x, y)) {
          // white play triangle
          raw[pos++] = 255; raw[pos++] = 255; raw[pos++] = 255;
        } else {
          // red-500 circle
          raw[pos++] = 239; raw[pos++] = 68; raw[pos++] = 68;
        }
      } else {
        // gray-950 background
        raw[pos++] = 3; raw[pos++] = 7; raw[pos++] = 18;
      }
    }
  }

  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

writeFileSync("public/icon-192.png", createIcon(192));
writeFileSync("public/icon-512.png", createIcon(512));
writeFileSync("public/apple-touch-icon.png", createIcon(180));
console.log("Generated: icon-192.png, icon-512.png, apple-touch-icon.png");
