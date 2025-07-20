
import OpenAI from "openai";

export default async  function Home() {
  console.log(process.env.My_Key, 'aaaaaaaaaa');
  const client = new OpenAI({apiKey: process.env.My_Key});

const response = await client.responses.create({
    model: "gpt-4.1",
    input: "Write a one-sentence bedtime story about a unicorn."
});


  return (
    <div>{response.output_text}</div>
    );
}

