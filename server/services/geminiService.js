
import { GoogleGenAI } from "@google/genai";
import { resumeMatchSchema } from "../schemas/geminiSchema.js";

const ai = new GoogleGenAI({ apiKey: "" });

export default {
  analyze: async (pdfBuffer, jobDescription) => {
    try {
      // ממירים את ה-PDF לבסיס 64
      const base64PDF = pdfBuffer.toString("base64");

      // שולחים את הנתונים לג'מיני
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            inlineData: {
              data: base64PDF,
              mimeType: "application/pdf"
            }
          },
          `
You are an expert resume-job matching system.
Rewrite and optimize this resume for the following job:

${jobDescription}

Return JSON only.
        `
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: resumeMatchSchema
        }
      });

      // לוג של התשובה שהתקבלה
      console.log("Gemini Response:", response);

      // בודקים אם התשובה מ־Gemini קיימת ומבנה התשובה תקין
      if (response && response.text) {
        // מחזירים את התשובה כ־JSON
        return JSON.parse(response.text);
      } else {
        console.error("Gemini returned an invalid response:", response);
        throw new Error("Gemini response is invalid or empty.");
      }
    } catch (error) {
      // טיפול בשגיאות והדפסתם בלוג
      console.error("Error during Gemini processing:", error.message);
      throw error;  // חשוב להעביר את השגיאה הלאה כדי לא להחביא בעיות
    }
  }
};
