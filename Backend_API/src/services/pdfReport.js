const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

async function generate({ projectName, projectId, annotations, config, generatedAt }) {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  let y = 750;
  const line = (text, opts = {}) => {
    const size = opts.size || 12;
    const f = opts.bold ? bold : font;
    doc.getPages()[0].drawText(text, { x: 50, y, size, font: f, color: rgb(0, 0, 0) });
    y -= size + 4;
  };

  line('3D Viewer – Project Report', { size: 18, bold: true });
  y -= 8;
  line(`Project: ${projectName}`);
  line(`ID: ${projectId}`);
  line(`Generated: ${generatedAt}`);
  y -= 16;
  line('Annotations / Markups', { bold: true });
  y -= 8;
  if (annotations.length === 0) {
    line('(No annotations)');
  } else {
    annotations.forEach((a, i) => {
      line(`${i + 1}. ${a.text || '(no text)'} — ${a.authorName} at (${a.position.x?.toFixed(1)}, ${a.position.y?.toFixed(1)}, ${a.position.z?.toFixed(1)})`);
    });
  }
  y -= 16;
  line('Scene config', { bold: true });
  line(`Presets: ${(config.presets && config.presets.length) || 0}`);
  line(`Layers: ${(config.layers && config.layers.length) || 0}`);

  const pdfBytes = await doc.save();
  return Buffer.from(pdfBytes);
}

module.exports = { generate };
