import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { text } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful teaching assistant. Analyze the provided study materials and identify the main topics and key concepts. Format your response as a JSON array of topics, where each topic is an object containing 'topic' and 'description' fields."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    // Parse the JSON from OpenAI before sending it to the client
    const parsedResponse = response.choices[0].message.content;
    console.log('api')
    console.log(Response.json(parsedResponse));
    return Response.json(parsedResponse);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to analyze text' }, { status: 500 });
  }
}