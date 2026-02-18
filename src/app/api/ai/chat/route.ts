import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a Disaster Response AI for Solapur District.
User asks: "${message}".
Answer in less than 40 words. Be direct, calm, and use bullet points if needed. Do not use markdown symbols like **.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ text: response });
  } catch {
    return NextResponse.json({ text: "System overload. Please use specific emergency queries." }, { status: 500 });
  }
}
