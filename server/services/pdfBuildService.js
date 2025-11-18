// // import { PDFDocument, rgb } from "pdf-lib";
// // import fs from "fs";

// // export async function buildUpdatedPDF(backgroundImages, updatedSections) {
// //   const pdfDoc = await PDFDocument.create();

// //   for (let i = 0; i < backgroundImages.length; i++) {
// //     const page = pdfDoc.addPage([595, 842]);

// //     const bgBytes = fs.readFileSync(backgroundImages[i]);
// //     const bgImage = await pdfDoc.embedJpg(bgBytes);
// //     page.drawImage(bgImage, { x: 0, y: 0, width: 595, height: 842 });
// //   }

// //   updatedSections.forEach(section => {
// //     section.blocks.forEach(block => {
// //       const { x, y, width, height } = block.bbox;

// //       // שקף לבן
// //       page.drawRectangle({
// //         x,
// //         y,
// //         width,
// //         height,
// //         color: rgb(1, 1, 1)
// //       });

// //       page.drawText(block.newContent, {
// //         x,
// //         y: y + height - 12,
// //         size: 10,
// //         color: rgb(0, 0, 0),
// //         maxWidth: width
// //       });
// //     });
// //   });

// //   const pdfBytes = await pdfDoc.save();
// //   const outputPath = "output/resume_" + Date.now() + ".pdf";
// //   fs.writeFileSync(outputPath, pdfBytes);
// //   return outputPath;
// // }
// import { PDFDocument, rgb } from "pdf-lib";
// import fs from "fs";
// import path from "path";

// export async function buildUpdatedPDF(backgroundImages, updatedSections) {
  
//   console.log("===== BACKGROUND IMAGES RECEIVED =====");
//   console.log(backgroundImages);
//   backgroundImages.forEach(img => {
//     console.log("Image:", img, "Exists:", fs.existsSync(img));
//   });
//   console.log("======================================");
//   const pdfDoc = await PDFDocument.create();
//   const pages = [];

//   // --- יצירת הדפים והטמעת התמונות ---
//   for (let i = 0; i < backgroundImages.length; i++) {
//     const page = pdfDoc.addPage([595, 842]);
//     pages.push(page);

//     const bgBytes = fs.readFileSync(backgroundImages[i]);

//     let bgImage;
//     const ext = path.extname(backgroundImages[i]).toLowerCase();

//     if (ext === ".jpg" || ext === ".jpeg") {
//       bgImage = await pdfDoc.embedJpg(bgBytes);
//     } else if (ext === ".png") {
//       bgImage = await pdfDoc.embedPng(bgBytes);
//     } else {
//       throw new Error("Unsupported image format: " + ext);
//     }

//     page.drawImage(bgImage, {
//       x: 0,
//       y: 0,
//       width: 595,
//       height: 842
//     });
//   }
// // --- ציור טקסט על הדפים ---
// console.log("===== UPDATED SECTIONS =====");
// console.log(JSON.stringify(updatedSections, null, 2));
// console.log("================================");

// // הוספת בלוקים דיפולטיים אם לא הגיעו מה-AI
// updatedSections.forEach((section, idx) => {
//   if (!section.blocks) {
//     section.blocks = [
//       {
//         pageIndex: 0, // תמיד דף ראשון בשלב זה
//         bbox: {
//           x: 50,
//           y: 700 - idx * 120,  // כל סקשן יורד 120 פיקסלים
//           width: 500,
//           height: 100
//         },
//         newContent: section.content
//       }
//     ];
//   }

//   section.blocks.forEach(block => {
//     const { pageIndex, bbox, newContent } = block;
//     const page = pages[pageIndex];
//     if (!page) return;

//     const { x, y, width, height } = bbox;

//     page.drawRectangle({ x, y, width, height, color: rgb(1, 1, 1) });

//     page.drawText(newContent, {
//       x: x + 5,
//       y: y + height - 14,
//       size: 10,
//       color: rgb(0, 0, 0),
//       maxWidth: width - 10,
//       lineHeight: 12
//     });
//   });
// });

// //   // --- ציור טקסט על הדפים ---
// //   console.log("===== UPDATED SECTIONS =====");
// // console.log(JSON.stringify(updatedSections, null, 2));
// // console.log("================================");

// //   updatedSections.forEach(section => {
// //     section.blocks.forEach(block => {
// //       const { pageIndex, bbox, newContent } = block;

// //       const page = pages[pageIndex];
// //       if (!page) return;

// //       const { x, y, width, height } = bbox;

// //       // רקע לבן
// //       page.drawRectangle({
// //         x,
// //         y,
// //         width,
// //         height,
// //         color: rgb(1, 1, 1)
// //       });

// //       // כתיבת טקסט
// //       page.drawText(newContent, {
// //         x: x + 5,
// //         y: y + height - 14,
// //         size: 10,
// //         color: rgb(0, 0, 0),
// //         maxWidth: width - 10,
// //         lineHeight: 12
// //       });
// //     });
// //   });

//   // --- שמירת PDF ---
//   const outputPath = "output/resume_" + Date.now() + ".pdf";
//   fs.writeFileSync(outputPath, await pdfDoc.save());
//   return outputPath;
// }
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import fs from "fs";
import path from "path";

export async function buildUpdatedPDF(backgroundImages, updatedSections) {

  const pdfDoc = await PDFDocument.create();
  const pages = [];

  // --- יצירת דפים עם תמונות רקע ---
  for (let i = 0; i < backgroundImages.length; i++) {
    const page = pdfDoc.addPage([595, 842]);
    pages.push(page);

    const bgBytes = fs.readFileSync(backgroundImages[i]);
    const ext = path.extname(backgroundImages[i]).toLowerCase();

    let bgImage;
    if (ext === ".png") bgImage = await pdfDoc.embedPng(bgBytes);
    else bgImage = await pdfDoc.embedJpg(bgBytes);

    page.drawImage(bgImage, {
      x: 0, y: 0, width: 595, height: 842
    });
  }

  // --- הטמעת טקסט חדש בתוך בלוקים ---
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;
  const lineHeight = 12;

  // פונקציה גנרית לפיצול שורות לפי רוחב
  function splitIntoLines(text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let current = "";

    for (const word of words) {
      const test = current ? current + " " + word : word;
      const w = font.widthOfTextAtSize(test, fontSize);

      if (w > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  updatedSections.forEach(section => {
    if (!section.blocks) return;
    if (section.blocks.length === 0) return;

    section.blocks.forEach(block => {
      const page = pages[block.pageIndex];
      if (!page) return;

      const { x, y, width } = block.bbox;
      const newContent = block.newContent;

      const lines = splitIntoLines(newContent, width - 10);
      const blockHeight = lines.length * lineHeight;

      // לבן שמכסה את הישן — גנרי לכל PDF
      page.drawRectangle({
        x: x,
        y: y - (blockHeight - block.bbox.height),
        width: width,
        height: blockHeight,
        color: rgb(1, 1, 1)
      });

      // כתיבת טקסט מחדש
      let cursorY = y + (blockHeight - lineHeight);
      for (const line of lines) {
        page.drawText(line, {
          x: x + 5,
          y: cursorY,
          size: fontSize,
          font,
          color: rgb(0, 0, 0)
        });
        cursorY -= lineHeight;
      }
    });
  });

  // --- שמירת PDF ---
  const outputPath = "output/resume_" + Date.now() + ".pdf";
  fs.writeFileSync(outputPath, await pdfDoc.save());
  return outputPath;
}
