import { GoogleGenAI } from "@google/genai";
import { FileData } from "../types";

const MODEL_NAME = 'gemini-3-pro-preview';

// Helper to initialize the client
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Stage 1: Create comprehensive notes
export const generateStage1 = async (files: FileData[], text: string): Promise<string> => {
  const ai = getClient();
  
  const prompt = `
    TASK: Create notes from the provided content.
    
    GUIDELINES:
    1.  **Completeness**: Don't miss anything. Data loss is fatal. Cover every detail.
    2.  **Structure**: Use hierarchical headings, bullet points, and numbered lists.
    3.  **Visuals**: Include "diagrammatic presentations", tables, or clear structured layouts.
    4.  **Math**: Use LaTeX for ALL math equations and scientific formulas.
        - **CRITICAL**: Use DOUBLE dollar signs ($$) for ALL math, including INLINE equations.
        - **FORBIDDEN**: Do NOT use single dollar signs ($) for inline math.
        - Example Inline: "The force is $$F = ma$$ in this case."
        - Example Block: 
          $$E = mc^2$$
    5.  **Code**: Use standard Markdown code blocks for programming code.
    6.  **Mermaid**: Do not use brackets when writing mermaid other than for the syntax.
    
    Input content follows.
    ${text ? `\nTEXT CONTENT:\n${text}` : ''}
  `;

  const parts: any[] = [{ text: prompt }];

  // Add files
  files.forEach(file => {
    // Strip base64 prefix if present (e.g., "data:image/png;base64,")
    const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
    parts.push({
      inlineData: {
        mimeType: file.type,
        data: base64Data
      }
    });
  });

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: {
      parts: parts
    }
  });

  return response.text || "No output generated for Stage 1.";
};

// Stage 2: Simplify and add Etymology
export const generateStage2 = async (previousNotes: string): Promise<string> => {
  const ai = getClient();

  const prompt = `
    TASK: Add to the following notes to reduce cognitive load and add etymological context.
    
    GUIDELINES:
    1.  **Simplify**: For complex "fancy" writing, add simple, clear, easy-to-understand language.
    2.  **Etymology**: Add etymological breakdowns for complex terms or jargon introduced in the notes.
    3.  **Preservation**: Do NOT change the structure. Do NOT remove any information.
    4.  **CRITICAL**: Ensure ALL math uses DOUBLE dollar signs ($$).
    5.  **Mermaid**: Do not use brackets when writing mermaid other than for the syntax.
    
    INPUT NOTES:
    ${previousNotes}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });

  return response.text || "No output generated for Stage 2.";
};

// Stage 3: Add Mnemonics
export const generateStage3 = async (previousNotes: string): Promise<string> => {
  const ai = getClient();

  const prompt = `
    TASK: Finalize the notes by adding abbreviation-based mnemonics.
    
    GUIDELINES:
    1.  **Mnemonics**: Insert abbreviation-based mnemonics wherever they aid memory.
    2.  **Synonyms**: You may swap words with synonyms to make the abbreviations fit better or be semantically related to the topic.
    3.  **Preservation**: Do NOT change the structure. Do NOT remove any information.
    4.  **Math**: **MUST** use DOUBLE dollar signs ($$) for ALL math (inline and block).
    5.  **Mermaid**: Do not use brackets when writing mermaid other than for the syntax.
    
    INPUT NOTES:
    ${previousNotes}
  `;

  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: prompt
  });

  return response.text || "No output generated for Stage 3.";
};