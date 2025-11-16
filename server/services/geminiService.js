import { GoogleGenAI } from "@google/genai";
import { resumeMatchSchema } from "../schemas/geminiSchema.js";

const ai = new GoogleGenAI({ apiKey:"" });
export default {
  analyze: async (pdfBuffer, jobDescription) => {
    const base64PDF = pdfBuffer.toString("base64");

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

    return JSON.parse(response.output_text);
  }
};
