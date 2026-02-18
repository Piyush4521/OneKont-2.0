import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { image, mimeType } = await req.json();
    
    // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
    const base64Data = image.split(",")[1];
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze this image for a disaster management app. 
    Return a JSON object ONLY. Do not use Markdown.
    Format:
    { 
      "type": "Flood" | "Fire" | "Accident" | "Collapse" | "Medical" | "None",
      "severity": "Critical" | "High" | "Medium" | "Low",
      "confidence": number (0-100),
      "description": "Short 10-word visual description"
    }
    If it is not a disaster (like a cat or selfie), set type to "None".`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: mimeType || "image/jpeg" } }
    ]);
    
    const text = result.response.text();
    // Clean up any potential markdown formatting from AI
    const jsonStr = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(jsonStr));

  } catch (error) {
    console.error("Vision Error:", error);
    return NextResponse.json(
      { type: "Unknown", severity: "Medium", confidence: 0, description: "Analysis failed" }, 
      { status: 500 }
    );
  }
}