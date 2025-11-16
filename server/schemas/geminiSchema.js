import { Type } from "@google/genai";

export const resumeMatchSchema = {
  type: Type.OBJECT,
  properties: {
    matchedTitle: { type: Type.STRING },
    summary: { type: Type.STRING },
    sections: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          content: { type: Type.STRING }
        },
        required: ["title", "content"]
      }
    },
    keywordsUsed: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    },
    strengthsDetected: {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    }
  },
  required: ["matchedTitle", "summary", "sections"]
};
