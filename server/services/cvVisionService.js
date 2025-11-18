// // import { GoogleGenAI } from "@google/genai";
// // import fs from "fs";
// // console.log("MY API KEY:", process.env.GEMINI_API_KEY);

// // const genAI = new GoogleGenAI({
// //   apiKey: process.env.GEMINI_API_KEY
// // });

// // export async function analyzeResumeImages(imagePaths, jobDescription) {
// //   const imageParts = imagePaths.map((img) => {
// //     const buffer = fs.readFileSync(img);
// //     return {
// //       inlineData: {
// //         data: buffer.toString("base64"),
// //         mimeType: "image/png",
// //       }
// //     };
// //   });

// //   const prompt = `
// //     Analyze the resume images above.
// //     Extract the following:
// //     - full name
// //     - contact details
// //     - all sections (skills, education, experience, languages, projects)
// //     - preserve original order and structure
// //     - rewrite all content to better match the job description:
// //       ${jobDescription}

// //     IMPORTANT:
// //     Return only strict JSON in this format:

// //     {
// //       "name": "",
// //       "contact": "",
// //       "sections": [
// //         { "title": "", "content": "" }
// //       ]
// //     }
// //   `;

// //   const result = await genAI.models.generateContent({
// //     model: "gemini-2.5-flash",
// //     contents: [
// //       ...imageParts,
// //       { text: prompt }
// //     ],
// //   });

// //   const text = result.response.text();
// //   return JSON.parse(text);
// // }
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import fs from "fs";

// console.log("MY API KEY:", process.env.GEMINI_API_KEY);

// // Initialize Gemini with API key only (no Google Cloud!)
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function analyzeResumeImages(imagePaths, jobDescription) {
//   const model = genAI.getGenerativeModel({
//     // model: "gemini-1.5-flash", // יציב ומהיר לניתוח תמונות
//     // model: "gemini-1.0-pro-vision",
//     model: "gemini-2.0-flash"

//   });

//   // Convert images to inlineData parts
//   const imageParts = imagePaths.map((img) => {
//     const buffer = fs.readFileSync(img);
//     return {
//       inlineData: {
//         data: buffer.toString("base64"),
//         mimeType: "image/png",
//       }
//     };
//   });

//   const prompt = `
//     Analyze the resume images above.
//     Extract and return:
//     - full name
//     - contact details
//     - ALL sections (skills, education, experience, languages, projects, etc.)
//     - preserve original order and structure from the resume
//     - rewrite/improve content to better match the job description:
//       ${jobDescription}

//     VERY IMPORTANT:
//     Return ONLY valid JSON in the following structure:

//     {
//       "name": "",
//       "contact": "",
//       "sections": [
//         { "title": "", "content": "" }
//       ]
//     }
//   `;

//   const result = await model.generateContent([
//     ...imageParts,
//     { text: prompt }
//   ]);

//   const raw = result.response.text();

//   console.log("---- AI RESPONSE ----");
//   console.log(raw);

//   // Remove markdown code fences if present
//   const cleanJSON = raw.replace(/```json|```/g, "").trim();

//   return JSON.parse(cleanJSON);
// }
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

console.log("MY API KEY:", process.env.GEMINI_API_KEY);

// initialize with API key only

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);



export async function analyzeResumeImages(imagePaths, jobDescription) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash"   // ← שורה קריטית
  });
  console.log("ENV KEY: ", process.env.GEMINI_API_KEY);

  const imageParts = imagePaths.map((img) => {
    const buffer = fs.readFileSync(img);
    return {
      inlineData: {
        data: buffer.toString("base64"),
        mimeType: "image/png",
      }
    };
  });

  const prompt = `
    Analyze the resume images above.
    Extract:
    - name
    - contact
    - all sections
    Keep original resume order.
    Improve text to match job:
      ${jobDescription}

    Return ONLY JSON:
    {
      "name": "",
      "contact": "",
      "sections": [
        { "title": "", "content": "" }
      ]
    }
  `;

  const result = await model.generateContent([
    ...imageParts,
    { text: prompt }
  ]);

  const raw = result.response.text();
  const clean = raw.replace(/```json|```/g, "").trim();

  return JSON.parse(clean);
}
