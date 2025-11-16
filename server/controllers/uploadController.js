import geminiService from "../services/geminiService.js";
import pdfService from "../services/pdfService.js";
import extractStructureService from "../services/extractStructureService.js";
import fs from "fs";

export default {
  processUpload: async (req, res) => {
    try {
      const filePath = req.file.path;

      // 1. Read PDF
      const pdfBuffer = fs.readFileSync(filePath);

      // 2. Extract structure from original resume
      const template = await extractStructureService.extract(pdfBuffer);

      // 3. Analyze & optimize resume to job description
      const jobDescription = req.body.jobDescription || "";
      const aiResult = await geminiService.analyze(pdfBuffer, jobDescription);

      // 4. Build new PDF
      const newPdfPath = await pdfService.build(pdfBuffer, aiResult, template);

      res.json({
        status: "success",
        jobDescription: aiResult,
        pdfUrl: `http://localhost:5000/${newPdfPath}`
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
};
