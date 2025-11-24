import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ----- חישוב נכון של __dirname ב-ESM (Windows + Node 20) -----
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ----- תיקיות -----
const uploadsDir = path.join(__dirname, "uploads");
const generatedDir = path.join(__dirname, "generated");

app.use(
  cors({
    origin: ["http://localhost:3001", "http://localhost:5173"],
  })
);

app.use(express.json());

// יצירת התיקיות אם לא קיימות
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(generatedDir)) {
  fs.mkdirSync(generatedDir, { recursive: true });
}

// ----------------------------------------------------
// Multer — העלאת קובץ CV
// ----------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".pdf";
    cb(null, `cv-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed"));
    }
    cb(null, true);
  },
});

// ----------------------------------------------------
// Gemini AI
// ----------------------------------------------------
const apiKey = process.env.GEMINI_API_KEY;
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ Missing GEMINI_API_KEY in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({
  apiKey,
  vertexai: false,
});

// ----------------------------------------------------
// עזר: המרת PDF ל-base64
// ----------------------------------------------------
function pdfToBase64(filePath) {
  const fileData = fs.readFileSync(filePath);
  return fileData.toString("base64");
}

// ----------------------------------------------------
// עזר: יצירת PDF חדש מטקסט
// ----------------------------------------------------
function createPdfFromText(text, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 40,
      size: "A4", // עמוד A4 סטנדרטי
    });
    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);
    doc
      .font("Helvetica")
      .fontSize(11) // קצת קטן יותר מ־12 כדי להכניס יותר בשורה
      .text(text, {
        align: "left",
        lineGap: 4, // ריווח סביר בין שורות
      });

    doc.end();

    stream.on("finish", () => resolve());
    stream.on("error", (err) => reject(err));
  });
}

// ----------------------------------------------------
// ROUTE: אופטימיזציה למשרה ספציפית
// ----------------------------------------------------
app.post("/api/optimize-for-job", upload.single("cv"), async (req, res) => {
    console.log("🚀 /api/optimize-for-job hit");
  try {
    const jobDescription = req.body.jobDescription;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: "CV PDF file is required" });
    }
    if (!jobDescription || jobDescription.trim().length === 0) {
      return res.status(400).json({ error: "Job description is required" });
    }

    const pdfPath = file.path;
    const pdfBase64 = pdfToBase64(pdfPath);

    // ---- פרומפט למודל ----
    const prompt = `
You are a professional technical recruiter and CV optimization expert.

You receive:
1) A detailed job description.
2) A CV in PDF form (attached as a file).

Your goal:
Analyze how well the CV matches THIS SPECIFIC job.
Optimize the CV text so it is strongly aligned with the job description.

You MUST:
Compare the required skills and responsibilities in the job description with the CV content.
Identify which skills / technologies from the job description appear in the CV and should be highlighted more.
Identify missing or weak skills relative to the job description.
Suggest concrete, actionable changes that will increase the match for THIS job.
Rewrite the entire CV text ("improvedResumeText") to be fully optimized for this job.
Keep the CV realistic based on the original content (do NOT invent degrees, jobs, or technologies that are not implied).
Maintain a professional, clear, and concise tone.

Output rules (VERY IMPORTANT):
You MUST return ONLY valid JSON.
Do NOT wrap the JSON in Markdown code fences (no triple backticks).
Do NOT add explanations, comments, or any extra text outside the JSON.
Use EXACTLY this JSON structure:

{
  "skillsToHighlight": [],
  "suggestedChanges": [],
  "missingSkills": [],
  "matchScore": 0,
  "specificRecommendations": [],
  "improvedResumeText": ""
}

Keep the CV sections in this order:
1. SUMMARY
2. EDUCATION
3. PROJECTS/EXPERIENCE
4. SKILLS
5. LANGUAGES
...

"matchScore" should be a number between 0 and 100 representing how well the ORIGINAL CV fits the job.
Formatting rules:
- Use only basic ASCII characters. Do NOT use bullets like •, emojis, or any special Unicode symbols.
- For bullet lists, start lines with "- " (dash and space).
- Keep the resume concise enough to fit in a single page in a standard PDF (around 1–1.5 A4 pages of plain text).

Job description:
${jobDescription}
`;

   const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64,
              },
            },
          ],
        },
      ],
    });

    // הטקסט שהמודל מחזיר
    let responseText = (result.text || "").trim();

    // ---- ניקוי גדרות קוד ```json ... ``` אם יש ----
    let cleaned = responseText.trim();

    // אם מתחיל ב-``` או ```json – מורידים את השורה הראשונה
    if (cleaned.startsWith("```")) {
      const firstNewline = cleaned.indexOf("\n");
      if (firstNewline !== -1) {
        cleaned = cleaned.slice(firstNewline + 1);
      }
    }

    // אם נגמר ב-``` – מורידים את זה
    if (cleaned.endsWith("```")) {
      cleaned = cleaned.slice(0, cleaned.lastIndexOf("```")).trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("❌ Failed to parse JSON:", cleaned);
      return res.status(500).json({
        error: "Failed to parse AI response as JSON",
        rawResponse: cleaned,
      });
    }

    if (!parsed.improvedResumeText) {
      return res
        .status(500)
        .json({ error: "Missing improvedResumeText in AI output" });
    }

    // ---- יצירת PDF משופר ----
    const optimizedFilename = `optimized-${Date.now()}.pdf`;
    const optimizedPath = path.join(generatedDir, optimizedFilename);

    // ניקוי תווים שהפונט של pdfkit לא אוהב
let cleanText = parsed.improvedResumeText
  // bullets → מקפים פשוטים
  .replace(/•/g, "- ")
  // גרשיים חכמים → רגילים
  .replace(/[“”]/g, '"')
  .replace(/[’]/g, "'")
  // כל תו לא-ASCII לגמרי → רווח (ממש ליתר ביטחון)
  .replace(/[^\x00-\x7F]/g, " ");

await createPdfFromText(cleanText, optimizedPath);

    // מחיקת המקורי (אופציונלי)
    fs.unlink(pdfPath, () => {});

    // ---- החזרה ל-client ----
    return res.json({
      analysis: {
        skillsToHighlight: parsed.skillsToHighlight || [],
        suggestedChanges: parsed.suggestedChanges || [],
        missingSkills: parsed.missingSkills || [],
        matchScore:
          typeof parsed.matchScore === "number" ? parsed.matchScore : null,
        specificRecommendations: parsed.specificRecommendations || [],
      },
      pdfFilename: optimizedFilename,
    });
    }catch (err) {
    console.error("❌ Error in /api/optimize-for-job:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// ----------------------------------------------------
// הורדת PDF
// ----------------------------------------------------
app.get("/api/download/:filename", (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(generatedDir, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.setHeader("Content-Type", "application/pdf");
  // כאן השורה המתוקנת – מחרוזת אחת, בלי משתנה attachment
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

  fs.createReadStream(filePath).pipe(res);
});

// ----------------------------------------------------
app.get("/", (req, res) => {
  res.send("CV Optimizer backend is running");
});

// ----------------------------------------------------
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});