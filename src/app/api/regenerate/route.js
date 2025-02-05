import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MCQuestion = z.object({
  type: z.literal('multiple-choice'),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});

const TFQuestion = z.object({
  type: z.literal('true-false'),
  question: z.string(),
  answers: z.array(z.string()),
  correct_answer: z.string(),
  explanation: z.string(),
});

const SAQuestion = z.object({
  type: z.literal('short-answer'),
  question: z.string(),
  correct_answer: z.string(),
  explanation: z.string(),
});

const Question = z.union([MCQuestion, TFQuestion, SAQuestion]);

const ResponseSchema = z.object({
  questions: z.array(Question)
});

export async function POST(request) {
  try {
    const { text, questionType } = await request.json();
    
    const systemPrompt = `You are a helpful teaching assistant. Generate 1 ${questionType} question based on the provided study materials. The question should test understanding of the core concepts. Format as:

    {
      "type": "${questionType}",
      "question": "question text",
      ${questionType === 'short-answer' ? `
      "correct_answer": "exact text of correct answer",
      "explanation": "The correct answer is <correct_answer>. It is correct because ..."` 
      : `
      "answers": ${questionType === 'true-false' ? '["True", "False"]' : '["option1", "option2", "option3", "option4"]'},
      "correct_answer": "exact text of correct answer",
      "explanation": "The correct answer is <correct_answer>. It is correct because ..."`}
    }`;

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(ResponseSchema, "questions"),
    });
    
    const question = response.choices[0].message.parsed.questions[0];
    return Response.json(question);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to regenerate question' }, { status: 500 });
  }
}