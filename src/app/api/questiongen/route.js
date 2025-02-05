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
    const { text, config } = await request.json();
    
    const systemPrompt = `You are a helpful teaching assistant. Analyze the provided study materials and generate questions according to the following configuration:

    ${config['multiple-choice']} multiple choice questions in this format:
    {
      "type": "multiple-choice",
      "question": "question text",
      "answers": ["option1", "option2", "option3", "option4"],
      "correct_answer": "exact text of correct answer",
      "explanation": "The correct answer is <correct_answer>. It is correct because ..."
    }

    ${config['true-false']} true/false questions in this format:
    {
      "type": "true-false",
      "question": "question text",
      "answers": ["True", "False"],
      "correct_answer": "True" or "False",
      "explanation": "The correct answer is <true/false>. It is correct because ..."
    }

    ${config['short-answer']} short answer questions in this format:
    {
      "type": "short-answer",
      "question": "question text",
      "correct_answer": "exact text of correct answer",
      "explanation": "The correct answer is <correct_answer>. It is correct because ..."
    }`;

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
      response_format: zodResponseFormat(ResponseSchema, "questions"),
    });
    
    const questions = response.choices[0].message.parsed.questions;
    return Response.json(questions);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return Response.json({ error: 'Failed to analyze text' }, { status: 500 });
  }
}