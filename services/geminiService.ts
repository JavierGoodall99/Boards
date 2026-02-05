import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  if (!process.env.API_KEY) {
    throw new Error("API Key not found");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateTasksForColumn = async (columnTitle: string, existingTasks: string[]) => {
  const ai = getAiClient();
  
  const prompt = `
    I am managing a Kanban board. I have a column named "${columnTitle}".
    Current tasks in this context include: ${existingTasks.join(', ')}.
    Generate 3 distinct, relevant, and actionable new tasks for this column.
    Return only the task titles as a list of strings.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tasks: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const json = JSON.parse(response.text || '{"tasks": []}');
    return json.tasks || [];
  } catch (error) {
    console.error("Gemini Task Gen Error:", error);
    return [];
  }
};

export const enhanceTaskDescription = async (taskContent: string) => {
  const ai = getAiClient();
  const prompt = `
    Write a concise but professional description for a project task titled: "${taskContent}".
    Include a checklist of 3 sub-steps.
    Return plain text with markdown formatting.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return "Could not generate description.";
  }
};