import { NextRequest, NextResponse } from "next/server";
import { translateTextBackend } from "../../../backend/lib/translation";

export async function POST(request: NextRequest) {
  let text = "";
  try {
    const body = await request.json();
    text = body.text;
    const { targetLanguage, sourceLanguage } = body;

    // Validate input
    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing required fields: text and targetLanguage" },
        { status: 400 },
      );
    }

    const finalResult = await translateTextBackend(
      text,
      targetLanguage,
      sourceLanguage,
    );

    return NextResponse.json(
      { translatedText: finalResult },
      { headers: { "Cache-Control": "public, max-age=86400, mutable" } },
    );
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed", translatedText: text },
      { status: 500 },
    );
  }
}
