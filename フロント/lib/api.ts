import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

export async function fetchGPTResponse(prompt: string): Promise<string> {
    const res = await fetch('http://localhost:3000/api/chatAI', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    })
  
    if (!res.ok) {
        throw new Error('APIよびっだし失敗');
    }
  
    const data = await res.json();
    return data.reply;
  }
  