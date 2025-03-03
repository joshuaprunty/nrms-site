import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define validation schema for the request
const EditRequestSchema = z.object({
  originalStory: z.string(),
  editInstructions: z.string(),
  storyUnits: z.array(
    z.object({
      type: z.string(),
      content: z.string(),
      title: z.string().optional(),
      priority: z.number().int().positive().optional(),
    })
  ).optional(),
});

export async function POST(request) {
  try {
    // Parse and validate the request body
    const body = await request.json();
    const { originalStory, editInstructions, storyUnits } = EditRequestSchema.parse(body);

    // Construct the prompt for the AI
    let prompt = `You are a professional editor. I have a story that needs to be edited according to specific instructions.

Original Story:
"""
${originalStory}
"""

Edit Instructions:
"""
${editInstructions}
"""

Please provide an edited version of the story that follows these instructions. Maintain the professional tone and quality of the original while implementing the requested changes.`;

    // Add story units context if provided
    if (storyUnits && storyUnits.length > 0) {
      prompt += `\n\nFor reference, here are the original source materials used to create this story:`;
      
      // Sort by priority if available
      const sortedUnits = [...storyUnits].sort((a, b) => {
        const priorityA = a.priority !== undefined ? a.priority : 999;
        const priorityB = b.priority !== undefined ? b.priority : 999;
        return priorityA - priorityB;
      });
      
      sortedUnits.forEach((unit, index) => {
        const title = unit.title || `Unit ${index + 1}`;
        const priorityText = unit.priority !== undefined ? `(Priority: ${unit.priority})` : '';
        prompt += `\n\n${title} ${priorityText} (${unit.type}): ${unit.content}`;
      });
    }

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a professional editor who helps improve stories while maintaining their original intent and style." },
        { role: "user", content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });
    
    const editedStory = response.choices[0].message.content;
    
    // Return both the original and edited versions
    return Response.json({
      originalStory,
      editedStory,
      editInstructions
    });
  } catch (error) {
    console.error('Story edit API error:', error);
    return Response.json({ 
      error: 'Failed to edit story',
      details: error.message 
    }, { status: 500 });
  }
} 