import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const InputTypes = z.enum([
  "interview",
  "quote",
  "snippet",
  "background",
  "note"
]);

const StoryUnit = z.object({
  type: InputTypes,
  content: z.string(),
  priority: z.number().int().positive().optional(),
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
    const { inputs, config = {} } = await request.json();
    
    // Extract configuration options
    const { minLength, maxLength, additionalInstructions } = config;
    
    // Validate inputs array against StoryUnit schema
    const validatedInputs = z.array(StoryUnit).parse(inputs);

    // Sort inputs by priority (lower number = higher priority)
    const sortedInputs = [...validatedInputs].sort((a, b) => {
      // If priority is not defined, default to a high number
      const priorityA = a.priority !== undefined ? a.priority : 999;
      const priorityB = b.priority !== undefined ? b.priority : 999;
      return priorityA - priorityB;
    });

    let prompt = `Write a professional news article based on the following details, prioritizing them in the order listed (higher priority items should be featured more prominently in the article):\n\n`;
    
    sortedInputs.forEach((input, index) => {
      const priorityText = input.priority !== undefined ? `(Priority: ${input.priority})` : '';
      prompt += `Detail ${index + 1} ${priorityText} (${input.type}): ${input.content}\n`;
    });
    
    prompt += `\nThe article should be objective, well-structured, and informative. Include an engaging lead paragraph, followed by a well-organized body with clear transitions, and a concluding paragraph that summarizes the impact of the event. 

IMPORTANT: Give more emphasis and space to higher priority items (lower priority numbers). The highest priority items should form the core of the article, with lower priority items providing supporting details.

When incorporating different types of inputs:
    - Interview transcripts should be quoted appropriately
    - Data/statistics should be presented clearly with context
    - Quotes should be attributed properly
    - Writing snippets should be integrated smoothly
    - Research notes should be synthesized into the narrative
    - Background information should provide context`;

    // Add length constraints if provided
    if (minLength && maxLength) {
      prompt += `\n\nThe article should be between ${minLength} and ${maxLength} words in length.`;
    } else if (minLength) {
      prompt += `\n\nThe article should be at least ${minLength} words in length.`;
    } else if (maxLength) {
      prompt += `\n\nThe article should be at most ${maxLength} words in length.`;
    }
    
    // Add additional instructions if provided
    if (additionalInstructions) {
      prompt += `\n\nAdditional instructions: ${additionalInstructions}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "user", content: prompt }
      ],
      max_tokens: 1500
    });
    
    const generatedStory = response.choices[0].message.content;

    // Create a StoryObject with the generated story and original inputs
    const storyObject = StoryObject.parse({
      story: generatedStory,
      storyUnits: validatedInputs // Keep the original order in the response
    });

    return Response.json(storyObject);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to generate story' }, { status: 500 });
  }
}