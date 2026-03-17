
import { GoogleGenAI, Type } from "@google/genai";
import { ResearchMode, AstronomicalObject, ExplanationLevel, ObjectClass } from "../types";

export interface ObservationAnalysis {
  name: string;
  objectClass: ObjectClass;
  ra: string;
  dec: string;
  type: string;
  distance: number;
  isSimulated: boolean;
  properties: any;
  spatialDiagnostics?: any;
  groundingSources?: any[];
  entotoVisibility?: any;
  simulationData?: any[];
}

export const performDeepAnalysis = async (query: string, mode: ResearchMode | string, imageData?: string): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-3-pro-preview for high-fidelity scientific reasoning
  const model = 'gemini-3-pro-preview';

  const systemInstruction = `You are the MILO Stellar Research Engine, a professional astrophysical analyzer.
  
  TASK:
  Generate a high-fidelity research report for an astronomical target. 
  
  CONSTRAINTS:
  - Return ONLY valid JSON. 
  - The "lightCurve" must contain EXACTLY 100 data points.
  - Keep the "report" concise but technically dense (approx 200 words).
  - Use standard IAU designations and J2000 coordinates.
  - If visual data is provided, perform plate solving to estimate RA/DEC.
  - Ensure all numeric values are physically plausible for the object class.`;

  const prompt = `Target Inquiry: ${query || 'Visual Field Solve'}. Mode: ${mode}. Context: Multi-spectral Archive Sync (Gaia/TESS).`;

  const parts: any[] = [{ text: prompt }];
  if (imageData) {
    parts.push({ 
      inlineData: { 
        mimeType: 'image/jpeg', 
        data: imageData.includes(',') ? imageData.split(',')[1] : imageData 
      } 
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        systemInstruction,
        thinkingConfig: { thinkingBudget: 4000 },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            objectClass: { type: Type.STRING, enum: ['Star', 'Galaxy', 'Nebula', 'Black Hole'] },
            confidence: { type: Type.NUMBER },
            report: { type: Type.STRING },
            ra: { type: Type.STRING },
            dec: { type: Type.STRING },
            type: { type: Type.STRING },
            distance: { type: Type.NUMBER },
            properties: {
              type: Type.OBJECT,
              properties: {
                mass: { type: Type.NUMBER },
                radius: { type: Type.NUMBER },
                temperature: { type: Type.NUMBER },
                luminosity: { type: Type.NUMBER },
                period: { type: Type.NUMBER }
              }
            },
            lightCurve: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  time: { type: Type.NUMBER },
                  flux: { type: Type.NUMBER }
                },
                required: ["time", "flux"]
              }
            }
          },
          required: ["name", "objectClass", "report", "lightCurve", "ra", "dec"],
          propertyOrdering: ["name", "objectClass", "confidence", "ra", "dec", "type", "distance", "properties", "report", "lightCurve"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Research Error:", error);
    // Return a fallback object to keep the UI from crashing if JSON parsing fails
    return {
      name: "Analysis Failure",
      objectClass: "Star",
      report: "Neural core failed to stabilize JSON payload. Check telemetry logs.",
      ra: "00h 00m 00s",
      dec: "+00° 00' 00\"",
      lightCurve: Array.from({length: 100}, (_, i) => ({time: i, flux: 1 + Math.random() * 0.1}))
    };
  }
};

export const getScientificInsight = async (data: AstronomicalObject, level: ExplanationLevel, speculate: boolean = false): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = speculate ? 'gemini-3-pro-preview' : 'gemini-3-flash-preview';

  const prompt = `Synthesize astrophysical insight for: ${data.name}. 
  Class: ${data.objectClass}. Technical Level: ${level}.
  Properties: ${JSON.stringify(data.physicalProperties)}.
  Return 4 bullet points starting with •. Use precise IAU terminology.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: "You are a senior research fellow. Provide dense, data-driven synthesis."
      }
    });
    return response.text || "Insight processing timeout.";
  } catch (error) {
    console.error("Gemini Insight Error:", error);
    return "• Neural link interrupted during synthesis.";
  }
};
