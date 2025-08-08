import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:5173',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function GET() {
  return new NextResponse(JSON.stringify({ message: 'Get API Response' }), {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `5x5の五目並べです。あなたはO(オー)で、相手はX(エックス)です。
                    ${body.text}
                    ルール:
                    - 5つ同じ記号を縦、横、斜めに並べると勝利
                    - '.'は空のマス目を表します
                    - 座標は[行,列]の形式で、0から4の範囲です
                    - 座標にX(エックス)またはO(オー)が既に配置されている場合は選択不可となります

                    あなたの次の一手を[行,列]の形式で答えてください。例: [2,3]
                    座標のみを回答し、他の説明は不要です。`,
            },
          ],
        },
      ],
    });
    const aiResponse = result.text;
    return new NextResponse(
      JSON.stringify({
        received: {
          postMessage: body.text,
          body: 'サーバからの返答',
          text: aiResponse,
          timestamp: new Date().toLocaleString('ja-JP'),
        },
      }),
      {
        status: 200,
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: corsHeaders,
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}
