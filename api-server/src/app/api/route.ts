import { NextResponse } from 'next/server';

const corsHeaders = {
    'Access-Control-Allow-Origin': 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

export async function GET() {
    return  new NextResponse(
        JSON.stringify({ message: 'Hello from API'}),
        {
            status: 200,
            headers: corsHeaders,
        }
    );
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        return new NextResponse(
            JSON.stringify({ received: body }),
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