import { PDFDocument, StandardFonts } from "pdf-lib";
import fs from "fs";

export default {
  build: async (originalPDF, aiResult, template) => {
    const pdfDoc = await PDFDocument.load(originalPDF);

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    let y = 750;
    const x = template.marginLeft;

    // Title
    firstPage.drawText(aiResult.matchedTitle, {
      x,
      y,
      size: template.titleSize,
      font
    });

    y -= 40;

    // Summary
    firstPage.drawText(aiResult.summary, {
      x,
      y,
      size: template.defaultFontSize,
      font,
      maxWidth: template.maxWidth,
      lineHeight: template.lineHeight
    });

    const outputPath = `output/optimized_${Date.now()}.pdf`;

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputPath, pdfBytes);

    return outputPath;
  }
};
