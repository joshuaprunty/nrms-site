import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { content } = await request.json();
    let prompt = `Summarize the following text. Try to reduce the length of the text to 100 words or less.


Text to summarize:
${content}`;

    console.log(prompt);
    console.log(content);

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a text summarizer. You only respond with a summary of the text. Never include any other text or explanation."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.1 // Lower temperature for more consistent formatting
    });
    
    const summary = response.choices[0].message.content;
    console.log('Raw GPT Response:', summary); // Log the raw response for debugging



    return Response.json(summary);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ 
      error: 'Failed to summarize text',
      details: error.message 
    }, { status: 500 });
  }
}