const fs = require('fs');

function readUInt32BE(buffer, offset) {
  return buffer.readUInt32BE(offset);
}

function readUInt16BE(buffer, offset) {
  return buffer.readUInt16BE(offset);
}

function parsePng(buffer) {
  const pngSignature = '89504e470d0a1a0a';
  if (buffer.length < 24) return null;
  if (buffer.slice(0, 8).toString('hex') !== pngSignature) return null;
  const width = readUInt32BE(buffer, 16);
  const height = readUInt32BE(buffer, 20);
  return { format: 'png', width, height };
}

function parseJpeg(buffer) {
  if (buffer.length < 4) return null;
  if (buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;

  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) break;
    const marker = buffer[offset + 1];
    const segmentLength = readUInt16BE(buffer, offset + 2);

    const isSofMarker =
      marker === 0xc0 ||
      marker === 0xc1 ||
      marker === 0xc2 ||
      marker === 0xc3 ||
      marker === 0xc5 ||
      marker === 0xc6 ||
      marker === 0xc7 ||
      marker === 0xc9 ||
      marker === 0xca ||
      marker === 0xcb ||
      marker === 0xcd ||
      marker === 0xce ||
      marker === 0xcf;

    if (isSofMarker) {
      const height = readUInt16BE(buffer, offset + 5);
      const width = readUInt16BE(buffer, offset + 7);
      return { format: 'jpeg', width, height };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

function readImageMeta(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  const png = parsePng(fileBuffer);
  if (png) return png;
  const jpeg = parseJpeg(fileBuffer);
  if (jpeg) return jpeg;
  return null;
}

module.exports = {
  readImageMeta,
};
