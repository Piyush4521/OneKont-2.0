import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { audio, mimeType } = await req.json();
    
    // Clean base64 string
    const base64Data = audio.split(",")[1];
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are an Emergency Dispatch AI for Solapur, India. 
    Listen to this audio report. The user may speak in **Marathi, Hindi, or English**.
    
    1. Transcribe the speech exactly in the original language (Devanagari if Marathi/Hindi).
    2. Translate it to English for the report.
    3. Analyze the situation.
    4. Return a JSON object ONLY. Do not use Markdown.
    
    Format:
    {
      "transcription": "Original Marathi/Hindi text here (English translation here)",
      "type": "Flood" | "Fire" | "Medical" | "Collapse" | "Other",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "sentiment": "Panicked" | "Calm" | "Unconscious" | "Angry",
      "keywords": ["english", "keywords", "only"]
    }`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Data, mimeType: mimeType || "audio/webm" } }
    ]);
    
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    
    return NextResponse.json(JSON.parse(jsonStr));

  } catch (error) {
    console.error("Audio AI Error:", error);
    return NextResponse.json(
      { 
        transcription: "Audio unintelligible or connection failed.", 
        type: "Unknown", 
        priority: "Medium", 
        sentiment: "Unknown",
        keywords: []
      }, 
      { status: 500 }
    );
  }
}