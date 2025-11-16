// import geminiService from "../services/geminiService.js";
// import pdfService from "../services/pdfService.js";
// import extractStructureService from "../services/extractStructureService.js";
// import fs from "fs";

// export default {
//   processUpload: async (req, res) => {
//     try {
//       const filePath = req.file.path;

//       // 1. Read PDF
//       const pdfBuffer = fs.readFileSync(filePath);

//       // 2. Extract structure from original resume
//       const template = await extractStructureService.extract(pdfBuffer);

//       // 3. Analyze & optimize resume to job description
//       const jobDescription = req.body.jobDescription || "";
//       const aiResult = await geminiService.analyze(pdfBuffer, jobDescription);

//       // 4. Build new PDF
//       const newPdfPath = await pdfService.build(pdfBuffer, aiResult, template);

//       res.json({
//         status: "success",
//         jobDescription: aiResult,
//         pdfUrl: `http://localhost:5000/${newPdfPath}`
//       });

//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   }
// };
import geminiService from "../services/geminiService.js";
import pdfService from "../services/pdfService.js";
import extractStructureService from "../services/extractStructureService.js";
import fs from "fs";

export default {
  processUpload: async (req, res) => {
    try {
      // שלב 1: קריאת הקובץ
      console.log("שלב 1: טוענים את ה-PDF...");

      const filePath = req.file.path;
      console.log("PDF uploaded to:", filePath);  // לוג של הנתיב

      const pdfBuffer = fs.readFileSync(filePath);

      // שלב 2: ניתוח ה־PDF
      console.log("שלב 2: מנתחים את מבנה ה־PDF...");
      const template = await extractStructureService.extract(pdfBuffer);
      console.log("Structure extracted:", template);

      // שלב 3: שליחה ל-Gemini לעיבוד התוכן
      console.log("שלב 3: שולחים ל-Gemini...");
      const jobDescription = req.body.jobDescription || "";
      const aiResult = await geminiService.analyze(pdfBuffer, jobDescription);
      console.log("Gemini result received:", aiResult);

      // שלב 4: בניית PDF חדש
      console.log("שלב 4: בונים PDF חדש...");
      const newPdfPath = await pdfService.build(pdfBuffer, aiResult, template);
      console.log("New PDF created:", newPdfPath);

      // שלב 5: מחזירים את התוצאה ללקוח
      res.json({
        status: "success",
        jobDescription: aiResult,
        pdfUrl: `http://localhost:5000/${newPdfPath}` // לינק להורדת PDF החדש
      });

    } catch (err) {
      console.error("Error during upload processing:", err.message);  // לוג של שגיאות
      res.status(500).json({ error: err.message });
    }
  }
};
