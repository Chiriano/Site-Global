const fs = require('fs');

function escapeText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function makeObject(id, body) {
  return `${id} 0 obj\n${body}\nendobj\n`;
}

function buildSimplePdf(lines) {
  const content = [
    'BT',
    '/F1 12 Tf',
    '50 790 Td',
    ...lines.map((line, index) => `${index === 0 ? '' : '0 -18 Td'}(${escapeText(line)}) Tj`).filter(Boolean),
    'ET',
  ].join('\n');

  const objects = [];
  objects.push(makeObject(1, '<< /Type /Catalog /Pages 2 0 R >>'));
  objects.push(makeObject(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>'));
  objects.push(
    makeObject(
      3,
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>'
    )
  );
  objects.push(makeObject(4, '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'));
  objects.push(makeObject(5, `<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream`));

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  for (const obj of objects) {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += obj;
  }

  const xrefStart = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, 'utf8');
}

function writeSimplePdf(filePath, lines) {
  const buffer = buildSimplePdf(lines);
  fs.writeFileSync(filePath, buffer);
}

module.exports = {
  writeSimplePdf,
};
