import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const InputTypes = z.enum([
  "interview",
  "data",
  "quote",
  "snippet",
  "research",
  "background"
]);

const StoryUnit = z.object({
  type: InputTypes,
  content: z.string(),
});

const StoryObject = z.object({
  story: z.string(),
  storyUnits: z.array(StoryUnit),
});

const ResponseSchema = z.object({
  story: StoryObject,
});


export async function POST(request) {
  try {
    const { inputs } = await request.json();
    
    // Validate inputs array against StoryUnit schema
    const validatedInputs = z.array(StoryUnit).parse(inputs);

    let prompt = `Write a professional news article based on the following details:\n\n`;
    validatedInputs.forEach((input, index) => {
      prompt += `Detail ${index + 1} (${input.type}): ${input.content}\n`;
    });
    prompt += `\nThe article should be objective, well-structured, and informative. Include an engaging lead paragraph, followed by a well-organized body with clear transitions, and a concluding paragraph that summarizes the impact of the event. When incorporating different types of inputs:
    - Interview transcripts should be quoted appropriately
    - Data/statistics should be presented clearly with context
    - Quotes should be attributed properly
    - Writing snippets should be integrated smoothly
    - Research notes should be synthesized into the narrative
    - Background information should provide context`;

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 800
    });
    
    const generatedStory = response.choices[0].message.content;

    // Create a StoryObject with the generated story and original inputs
    const storyObject = StoryObject.parse({
      story: generatedStory,
      storyUnits: validatedInputs
    });

    return Response.json(storyObject);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}