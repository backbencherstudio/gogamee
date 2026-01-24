// import { NextRequest, NextResponse } from 'next/server';

// // Google Cloud Translation API
// const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

// export async function POST(request: NextRequest) {
//   let text = '';
//   try {
//     const body = await request.json();
//     text = body.text;
//     const { targetLanguage, sourceLanguage } = body;

//     // Validate input
//     if (!text || !targetLanguage) {
//       return NextResponse.json(
//         { error: 'Missing required fields: text and targetLanguage' },
//         { status: 400 }
//       );
//     }

//     // If source and target are the same, return original text
//     if (sourceLanguage === targetLanguage) {
//       return NextResponse.json({ translatedText: text });
//     }

//     // If no API key is set, return original text (fallback)
//     if (!GOOGLE_TRANSLATE_API_KEY) {
//       console.warn('GOOGLE_TRANSLATE_API_KEY not set. Using original text.');
//       return NextResponse.json({ translatedText: text });
//     }

//     // Call Google Cloud Translation API
//     const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`;

//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         q: text,
//         source: sourceLanguage || 'es',
//         target: targetLanguage,
//         format: 'text',
//       }),
//     });

//     if (!response.ok) {
//       throw new Error(`Translation API error: ${response.statusText}`);
//     }

//     const data = await response.json();
//     const translatedText = data.data?.translations?.[0]?.translatedText || text;

//     return NextResponse.json({ translatedText });
//   } catch (error) {
//     console.error('Translation error:', error);
//     return NextResponse.json(
//       { error: 'Translation failed', translatedText: text },
//       { status: 500 }
//     );
//   }
// }
