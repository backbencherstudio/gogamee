import { NextRequest, NextResponse } from "next/server";

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

    // If source and target are the same, return original text
    if (sourceLanguage === targetLanguage) {
      return NextResponse.json({ translatedText: text });
    }

    // Use free Google Translate endpoint (client=gtx)
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage || "auto"}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Translation API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Parse 'gtx' response format: [[["Hola","Hello",null,null,1]], ... ]
    // It returns an array of arrays. The first element is an array of translated sentences.
    let translatedText = "";
    if (data && data[0]) {
      data[0].forEach((sentence: any) => {
        if (sentence[0]) translatedText += sentence[0];
      });
    }

    return NextResponse.json({ translatedText: translatedText || text });
  } catch (error) {
    console.error("Translation error:", error);
    return NextResponse.json(
      { error: "Translation failed", translatedText: text },
      { status: 500 },
    );
  }
}
