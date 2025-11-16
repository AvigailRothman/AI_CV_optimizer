import { PDFDocument } from "pdf-lib";

export default {
  extract: async (pdfBuffer) => {
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    // 🔹 מאוד בסיסי — אפשר להרחיב לפי צורך
    return {
      pageCount: pages.length,
      defaultFontSize: 12,
      titleSize: 20,
      marginLeft: 50,
      maxWidth: 500,
      lineHeight: 16
    };
  }
};
