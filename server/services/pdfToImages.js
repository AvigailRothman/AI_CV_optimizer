// import { fromPath } from "pdf2pic";
// import path from "path";
// import fs from "fs";

// export async function pdfToImages(pdfPath) {
//   const outputDir = path.join("extract", `img_${Date.now()}`);
//   fs.mkdirSync(outputDir, { recursive: true });

//   const convert = fromPath(pdfPath, {
//     density: 200,
//     saveFilename: "page",
//     savePath: outputDir,
//     format: "png",
//   });

//   const totalPages = await convert(1); // לבדוק כמה דפים יש
//   const pageCount = totalPages.pageCount || 1;

//   let imagePaths = [];

//   for (let i = 1; i <= pageCount; i++) {
//     const result = await convert(i);
//     imagePaths.push(result.path);
//   }

//   return imagePaths;
// }
import pdf from "pdf-poppler";
import fs from "fs";
import path from "path";

export async function pdfToImages(pdfPath) {
  const outputDir = path.join("extract", `img_${Date.now()}`);
  fs.mkdirSync(outputDir, { recursive: true });

  const options = {
    format: "png",
    out_dir: outputDir,
    out_prefix: "page",
    page: null
  };

  await pdf.convert(pdfPath, options);

  const files = fs.readdirSync(outputDir);
  const images = files
    .filter(f => f.endsWith(".png"))
    .map(f => path.join(outputDir, f));

  return images.sort();  // להבטיח סדר דפים
}
