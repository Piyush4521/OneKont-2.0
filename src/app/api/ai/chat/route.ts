import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Connect to Google AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // Use the basic text model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Give the AI a "Persona" so it acts like a rescue expert
    const prompt = `You are a Disaster Response AI for Solapur District. 
    User asks: "${message}". 
    Answer in less than 40 words. Be direct, calm, and use bullet points if needed. Do not use markdown symbols like **.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ text: response });
  } catch (error) {
    return NextResponse.json({ text: "⚠️ System Overload. Please use standard specific queries." }, { status: 500 });
  }
}