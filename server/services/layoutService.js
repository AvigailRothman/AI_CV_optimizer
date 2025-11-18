import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function extractLayoutFromImage(imagePath) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"
  });

  const buffer = fs.readFileSync(imagePath);

  const prompt = `
    Analyze this resume page.
    Identify ALL text blocks.

    For each block return:
    - "text": extracted text
    - "bbox": { "x": <number>, "y": <number>, "width": <number>, "height": <number> }

    Coordinates MUST be in PDF A4 units:
    width = 595, height = 842.

    Return ONLY pure JSON:
    {
      "blocks": [
        { "text": "", "bbox": { "x":0, "y":0, "width":0, "height":0 } }
      ]
    }
  `;

  const result = await model.generateContent([
    {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "image/png",
      }
    },
    { text: prompt }
  ]);

  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(clean).blocks;
}
