import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { NextRequest } from "next/server";

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

// Define the output types enum
const OutputTypes = z.enum([
  "article",
  "blog",
  "social"
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
    const { inputs, config = {}, storyType } = await request.json();
    
    // Use the storyType from the request body, or default to 'article'
    const outputTypeParam = storyType || 'article';
    
    // Validate the output type
    const outputType = OutputTypes.parse(outputTypeParam.toLowerCase());

    console.log(outputType);
    
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

    // Define the initial prompt based on output type
    let prompt = '';
    let contentType = '';
    
    switch(outputType) {
      case 'article':
        contentType = 'article';
        prompt = `Write a professional news article based on the following details, prioritizing them in the order listed (higher priority items should be featured more prominently in the article):\n\n`;
        break;
      case 'blog':
        contentType = 'blog post';
        prompt = `Write a blog post based on the following details, prioritizing them in the order listed (higher priority items should be featured more prominently in the blog post):\n\n`;
        break;
      case 'social':
        contentType = 'Instagram caption';
        prompt = `Write an Instagram caption based on the following details, prioritizing them in the order listed (higher priority items should be featured more prominently in the caption):\n\n`;
        break;
    }
    
    sortedInputs.forEach((input, index) => {
      const priorityText = input.priority !== undefined ? `(Priority: ${input.priority})` : '';
      prompt += `Detail ${index + 1} ${priorityText} (${input.type}): ${input.content}\n`;
    });
    
    // Add output type specific instructions
    prompt += '\n';
    
    switch(outputType) {
      case 'article':
        prompt += `The article should be objective, well-structured, and informative. Include an engaging lead paragraph, followed by a well-organized body with clear transitions, and a concluding paragraph that summarizes the impact of the event.`;
        break;
      case 'blog':
        prompt += `The blog post should be opinionated, well-structured, and informative. Include an engaging lead paragraph, with clear arguments for the point the author wants to bring across.`;
        break;
      case 'social':
        prompt += `The Instagram caption should be concise and easy to read with relevant hashtags.`;
        break;
    }
    
    prompt += `\n\nIMPORTANT: Give more emphasis and space to higher priority items (lower priority numbers). The highest priority items should form the core of the ${contentType}, with lower priority items providing supporting details.

When incorporating different types of inputs:
    - Interview transcripts should be quoted appropriately
    - Data/statistics should be presented clearly with context
    - Quotes should be attributed properly
    - Writing snippets should be integrated smoothly
    - Research notes should be synthesized into the narrative
    - Background information should provide context`;

    // Add length constraints if provided
    if (minLength && maxLength) {
      prompt += `\n\nThe ${contentType} should be between ${minLength} and ${maxLength} words in length.`;
    } else if (minLength) {
      prompt += `\n\nThe ${contentType} should be at least ${minLength} words in length.`;
    } else if (maxLength) {
      prompt += `\n\nThe ${contentType} should be at most ${maxLength} words in length.`;
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





// prompt = """
// The following details each have a rank. The higher the ranking (closer to 1), the more important the detail.\n 

// """

// #Type of story
// if story_type == "Article":
//     prompt += "Write a professional news article based on the details, prioritizing higher rankings."
//     prompt += "\nThe article should be objective, well-structured, and informative. Include an engaging lead paragraph, followed by a well-organized body with clear transitions, and a concluding paragraph that summarizes the impact of the event."
// elif story_type == "Blog":
//     prompt += "Write a Blog post based on the details, prioritizing higher rankings."
//     prompt += "\nThe blog should be opinionated, well-structured, and informative. Include an engaging lead paragraph, with clear arguments for the point the author wants to bring across."
// elif story_type == "Social":
//     prompt += "Write a Instagram caption based on the details, prioritizing higher rankings."
//     prompt += "\nThe post should be concise and easy to read with relevant hashtags."
