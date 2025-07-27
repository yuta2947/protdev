import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({});
const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

export async function GET() {
    return  new NextResponse(
        JSON.stringify({ message: 'Get API Response'}),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: "あなたについて200字で紹介して"
        })
    const aiResponse = result.text;
        return new NextResponse(
            JSON.stringify({ 
                received: {
                    postMessage: body.text,
                    body: 'サーバからの返答',
                    text: aiResponse

                }
             }),
            {
                status: 200,
                headers:corsHeaders,
            }
        );
    } catch (error) {
        return new NextResponse(
            JSON.stringify({ error: 'Invalid JSON' }),
            {
                status: 400,
                headers: corsHeaders,
            }
        );
    }
}


  export async function OPTIONS() {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }