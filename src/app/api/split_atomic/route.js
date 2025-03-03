import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { input } = await request.json();
    let prompt = `Split the following interview into question and answer pairs. Format your response EXACTLY as a JSON array of objects, with each object having a "question" and "answer" property. Do not include any other text or explanation in your response.

Example format:
[
  {
    "question": "What is your name?",
    "answer": "John Doe"
  }
]

Interview to split:
${input}`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a JSON formatting assistant. You only respond with valid JSON arrays containing question-answer pairs. Never include any other text or explanation."
        },
        { role: "user", content: prompt }
      ],
      max_tokens: 4000,
      temperature: 0.1 // Lower temperature for more consistent formatting
    });
    
    const splitInterview = response.choices[0].message.content;
    console.log('Raw GPT Response:', splitInterview); // Log the raw response for debugging

    // Clean the response before parsing (moved outside try block)
    const cleanedResponse = splitInterview
      .replace(/```json\n?/g, '')  // Remove JSON code block markers
      .replace(/```\n?/g, '')      // Remove ending code block marker
      .trim();                     // Remove whitespace

    let splitInterviewArray;
    try {
      splitInterviewArray = JSON.parse(cleanedResponse);
      
      // Validate the structure
      if (!Array.isArray(splitInterviewArray)) {
        throw new Error('Response is not an array');
      }
      
      // Validate each object has the required properties
      splitInterviewArray.forEach((item, index) => {
        if (!item.question || !item.answer) {
          throw new Error(`Invalid object structure at index ${index}`);
        }
      });

    } catch (parseError) {
      console.error('Parse Error:', parseError);
      console.error('Attempted to parse:', cleanedResponse);
      return Response.json({ 
        error: 'Failed to parse interview splits',
        details: parseError.message
      }, { status: 500 });
    }
    
    return Response.json(splitInterviewArray);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ 
      error: 'Failed to split interview',
      details: error.message 
    }, { status: 500 });
  }
}