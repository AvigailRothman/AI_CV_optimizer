// // // import geminiService from "../services/geminiService.js";
// // // import pdfService from "../services/pdfService.js";
// // // import extractStructureService from "../services/extractStructureService.js";
// // // import fs from "fs";

// // // export default {
// // //   processUpload: async (req, res) => {
// // //     try {
// // //       // שלב 1: קריאת הקובץ
// // //       console.log("שלב 1: טוענים את ה-PDF...");

// // //       const filePath = req.file.path;
// // //       console.log("PDF uploaded to:", filePath);  // לוג של הנתיב

// // //       const pdfBuffer = fs.readFileSync(filePath);

// // //       // שלב 2: ניתוח ה־PDF
// // //       console.log("שלב 2: מנתחים את מבנה ה־PDF...");
// // //       const template = await extractStructureService.extract(pdfBuffer);
// // //       console.log("Structure extracted:", template);

// // //       // שלב 3: שליחה ל-Gemini לעיבוד התוכן
// // //       console.log("שלב 3: שולחים ל-Gemini...");
// // //       const jobDescription = req.body.jobDescription || "";
// // //       const aiResult = await geminiService.analyze(pdfBuffer, jobDescription);
// // //       console.log("Gemini result received:", aiResult);

// // //       // שלב 4: בניית PDF חדש
// // //       console.log("שלב 4: בונים PDF חדש...");
// // //       const newPdfPath = await pdfService.build(pdfBuffer, aiResult, template);
// // //       console.log("New PDF created:", newPdfPath);

// // //       // שלב 5: מחזירים את התוצאה ללקוח
// // //       res.json({
// // //         status: "success",
// // //         jobDescription: aiResult,
// // //         pdfUrl: `http://localhost:5000/${newPdfPath}` // לינק להורדת PDF החדש
// // //       });

// // //     } catch (err) {
// // //       console.error("Error during upload processing:", err.message);  // לוג של שגיאות
// // //       res.status(500).json({ error: err.message });
// // //     }
// // //   }
// // // };
// // import path from "path";
// // import { pdfToImages } from "../services/pdfToImages.js";
// // import { analyzeResumeImages } from "../services/cvVisionService.js";
// // import { buildUpdatedPDF } from "../services/pdfBuildService.js";

// // export const uploadResume = async (req, res) => {
// //   try {
// //     const uploadedFile = req.file;

// //     if (!uploadedFile) {
// //       return res.status(400).json({ error: "No PDF uploaded" });
// //     }

// //     const jobDescription = req.body.jobDescription || "";

// //     console.log("1) Converting PDF to images...");
// //     const imagePaths = await pdfToImages(uploadedFile.path);

// //     console.log("2) Analyzing resume using Gemini Vision...");
// //     const analyzed = await analyzeResumeImages(imagePaths, jobDescription);

// //     const updatedSections = analyzed.sections;

// //     console.log("3) Building final PDF...");
// //     const outputPath = await buildUpdatedPDF(imagePaths, updatedSections);

// //     console.log("4) Sending PDF URL...");

// //     return res.json({
// //       success: true,
// //       downloadUrl: `http://localhost:5000/output/${path.basename(outputPath)}`
// //     });

// //   } catch (err) {
// //     console.error("Upload error:", err);
// //     return res.status(500).json({
// //       error: "Server error",
// //       details: err.message
// //     });
// //   }
// // };
// import path from "path";
// import { pdfToImages } from "../services/pdfToImages.js";
// import { analyzeResumeImages } from "../services/cvVisionService.js";
// import { buildUpdatedPDF } from "../services/pdfBuildService.js";
// import { extractLayoutFromImage } from "../services/layoutService.js";


// export const uploadResume = async (req, res) => {
//   try {
//     const uploadedFile = req.file;
//     if (!uploadedFile) {
//       return res.status(400).json({ error: "No PDF uploaded" });
//     }

//     const jobDescription = req.body.jobDescription || "";

//     console.log("1) Converting PDF to images...");
//     const imagePaths = await pdfToImages(uploadedFile.path);

//     console.log("2) Analyzing resume using Gemini Vision...");
//     const analyzed = await analyzeResumeImages(imagePaths, jobDescription);

//     console.log("3) Building new PDF...");
//     const outputPath = await buildUpdatedPDF(imagePaths, analyzed.sections);

//     return res.json({
//       success: true,
//       downloadUrl: `http://localhost:5000/output/${path.basename(outputPath)}`,
//     });

//   } catch (err) {
//     console.error("Upload error:", err);
//     return res.status(500).json({ error: err.message });
//   }
// };
import path from "path";
import { pdfToImages } from "../services/pdfToImages.js";
import { analyzeResumeImages } from "../services/cvVisionService.js";
import { buildUpdatedPDF } from "../services/pdfBuildService.js";
import { extractLayoutFromImage } from "../services/layoutService.js";

export const uploadResume = async (req, res) => {
  try {
    const uploadedFile = req.file;
    if (!uploadedFile) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const jobDescription = req.body.jobDescription || "";

    // --------------------------------------------------
    // 1) PDF -> Images
    // --------------------------------------------------
    console.log("1) Converting PDF to images...");
    const imagePaths = await pdfToImages(uploadedFile.path);

    // --------------------------------------------------
    // 2) Analyze resume with Gemini Vision (content only)
    // --------------------------------------------------
    console.log("2) Analyzing resume using Gemini Vision...");
    const analyzed = await analyzeResumeImages(imagePaths, jobDescription);

    // --------------------------------------------------
    // 3) NEW: Extract layout (bbox blocks) from every page
    // --------------------------------------------------
    console.log("3) Extracting layout blocks from PDF pages...");
    const allBlocks = [];

    for (let i = 0; i < imagePaths.length; i++) {
      const blocks = await extractLayoutFromImage(imagePaths[i]);

      // נוסיף pageIndex לכל בלוק
      blocks.forEach(b => b.pageIndex = i);

      allBlocks.push(...blocks);
    }

    // --------------------------------------------------
    // 4) NEW: Match content sections to detected blocks
    // --------------------------------------------------
    console.log("4) Matching analyzed sections to PDF layout blocks...");

    const updatedSectionsWithBlocks = analyzed.sections.map(section => {

      // נמצא בלוק שהטקסט שלו מכיל את הכותרת
      const match = allBlocks.find(b =>
        b.text.toLowerCase().includes(section.title.toLowerCase())
      );

      if (!match) {
        console.log("⚠ No block found for:", section.title);
        return { ...section, blocks: [] };
      }

      return {
        ...section,
        blocks: [
          {
            pageIndex: match.pageIndex,
            bbox: match.bbox,
            newContent: section.content
          }
        ]
      };
    });

    // --------------------------------------------------
    // 5) Build new PDF using detected positions
    // --------------------------------------------------
    console.log("5) Building updated PDF...");
    const outputPath = await buildUpdatedPDF(imagePaths, updatedSectionsWithBlocks);

    return res.json({
      success: true,
      downloadUrl: `http://localhost:5000/output/${path.basename(outputPath)}`,
    });

  } catch (err) {
    console.error("Upload error:", err);
    return res.status(500).json({ error: err.message });
  }
};
