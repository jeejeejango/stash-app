import { GoogleGenAI, Type } from "@google/genai";

// The GoogleGenAI class will automatically use the API key from `process.env.API_KEY`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalysisResult {
  title: string;
  summary: string;
  tags: string[];
}

export async function analyzeContent(articleText: string): Promise<AnalysisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following article content and provide a title, a concise summary (3-4 bullet points), and a list of 3-5 relevant keyword tags.

      Article Content:
      ---
      ${articleText}
      ---
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "A short, descriptive title for the article."
            },
            summary: {
              type: Type.STRING,
              description: "A concise summary of the article, formatted as 3-4 bullet points starting with a hyphen."
            },
            tags: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING
              },
              description: "An array of 3-5 relevant keyword tags."
            }
          },
          required: ["title", "summary", "tags"]
        }
      }
    });

    const jsonText = response.text.trim();
    const result: AnalysisResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error analyzing content with Gemini:", error);
    throw new Error("Failed to analyze content. Please try again.");
  }
}