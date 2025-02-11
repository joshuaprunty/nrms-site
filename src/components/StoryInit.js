"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/toaster";
import { useAuthContext } from "@/context/AuthContext";
import saveQuiz from "@/firebase/firestore/saveQuiz";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import SaveQuizModal from "./SaveQuizModal";
import QuizConfigModal from "./QuizConfigModal";
import FormatCard from "./FormatCard";
import Link from "next/link";
export default function TextInput() {
  const [studyText, setStudyText] = useState("");
  const [topics, setTopics] = useState(null);
  const [questions, setQuestions] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedAnswers, setCheckedAnswers] = useState({});
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingCorrectAnswer, setEditingCorrectAnswer] = useState(null);
  const [saveDisabled, setSaveDisabled] = useState(false);
  const [explanationVisible, setExplanationVisible] = useState({});
  const [questionType, setQuestionType] = useState("multiple-choice");

  const { user } = useAuthContext();
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [questionConfig, setQuestionConfig] = useState({
    'multiple-choice': 4,
    'true-false': 2,
    'short-answer': 2
  });

  // Separate loading states for different operations
  const [loadingStates, setLoadingStates] = useState({}); // For individual question regeneration
  const [isGenerating, setIsGenerating] = useState(false); // For main question generation
  const [isAnalyzing, setIsAnalyzing] = useState(false); // For topic analysis

  // Add state for storing previous questions during regeneration
  const [pendingRegeneration, setPendingRegeneration] = useState({});

  const handleEditClick = (index) => {
    setEditingIndex(index);
    const question = questions[index];
    setEditingCorrectAnswer(question.correct_answer);
  };

  const handleEditChange = (index, field, value) => {
    setQuestions((prevQuestions) => {
      return prevQuestions.map((q, i) => {
        if (i === index) {
          if (field.startsWith("answers")) {
            const match = field.match(/answers\[(\d+)\]/);
            if (match) {
              const answerIndex = parseInt(match[1], 10);
              const updatedAnswers = [...q.answers];
              updatedAnswers[answerIndex] = value;

              if (q.answers[answerIndex] === editingCorrectAnswer) {
                setEditingCorrectAnswer(value);
              }

              return { ...q, answers: updatedAnswers };
            }
          }
          return { ...q, [field]: value };
        }
        return q;
      });
    });
  };

  const handleCorrectAnswerSelection = (index, answer) => {
    setEditingCorrectAnswer(answer);
  };

  const handleSaveEdit = () => {
    const question = questions[editingIndex];
    
    if (question.type === 'short-answer') {
      if (!editingCorrectAnswer?.trim()) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please enter a correct answer before saving.",
        });
        return;
      }
    } else {
      // For multiple choice and true-false questions
      if (!question.answers.includes(editingCorrectAnswer)) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Please select a correct answer before saving.",
        });
        return;
      }

      if (question.answers.some((answer) => !answer.trim())) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "All answer choices must be filled out before saving.",
        });
        return;
      }
    }

    setQuestions((prevQuestions) =>
      prevQuestions.map((q, i) => {
        if (i === editingIndex) {
          return { ...q, correct_answer: editingCorrectAnswer };
        }
        return q;
      })
    );

    setEditingIndex(null);
    setEditingCorrectAnswer(null);
    setCheckedAnswers({});
  };

  const analyzeText = async () => {
    if (!studyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text before analyzing.",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: studyText }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const rawData = await response.json();

      if (rawData.error) {
        throw new Error(rawData.error);
      }

      try {
        const parsedData = JSON.parse(rawData);
        setTopics(parsedData.topics);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        setTopics([
          {
            topic: "Response",
            description: rawData,
          },
        ]);
      }
    } catch (error) {
      console.error("Error analyzing text:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateQuestions = async () => {
    if (!studyText.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter some text before generating questions.",
      });
      return;
    }
  
    setIsGenerating(true);
    try {
      const response = await fetch("/api/questiongen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: studyText,
          config: questionConfig 
        }),
      });
  
      if (!response.ok) throw new Error("Question generation failed");
  
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setQuestions(data);
      setSelectedAnswers({});
      setCheckedAnswers({});
    } catch (error) {
      console.error("Error generating questions:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const checkAnswer = (questionIndex) => {
    const question = questions[questionIndex];
    let isCorrect;
    
    if (question.type === 'short-answer') {
      const userAnswer = (selectedAnswers[questionIndex] || '').toLowerCase().trim();
      const correctAnswer = question.correct_answer.toLowerCase().trim();
      isCorrect = userAnswer === correctAnswer;
    } else {
      isCorrect = selectedAnswers[questionIndex] === question.correct_answer;
    }
    
    setCheckedAnswers({
      ...checkedAnswers,
      [questionIndex]: isCorrect,
    });
  };

  const handleSaveQuiz = async (title) => {
    if (!user) {
      console.error("User not authenticated");
      return;
    }

    // Validate that all questions have non-empty answers
    for (const question of questions) {
      if (question.type !== 'short-answer' && question.answers.some((answer) => !answer.trim())) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "All answer choices in the quiz must be filled out.",
        });
        return;
      }
    }

    setIsSaving(true);
    try {
      const quizData = {
        title,
        questions,
        originalText: studyText,
      };

      const { error } = await saveQuiz(user.uid, quizData);

      // quiz already exists with title
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error,
        });
        return;
      }

      setIsSaveModalOpen(false);
      setSaveDisabled(true);

      toast({
        variant: "success",
        title: "Quiz Saved",
        description:
          "Your quiz has been successfully saved. Navigating to dashboard...",
      });

      setTimeout(() => {
        router.push("/dashboard");
      }, 3000);
    } catch (error) {
      console.error("Error saving quiz:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteQuestion = (index) => {
    if (confirm(`Delete Question ${index + 1}?`)) {
      setQuestions((prevQuestions) =>
        prevQuestions.filter((_, i) => i !== index)
      );

      if (editingIndex === index) {
        setEditingIndex(null);
        setEditingCorrectAnswer(null);
      }

      setCheckedAnswers({});
    }
  };

  const copyTest = () => {
    navigator.clipboard.writeText(COPY_TEXT)
      .then(() => {
        toast({
          title: "Copied",
          description: `Sample notes copied to clipboard`,
        });
      })
      .catch(() => {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy text",
        });
      });
  };

  const handleRegenerateQuestion = async (index) => {
    setLoadingStates(prev => ({ ...prev, [index]: true }));
    
    try {
      const question = questions[index];
      const response = await fetch("/api/regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          text: studyText,
          questionType: question.type
        }),
      });

      if (!response.ok) throw new Error("Question regeneration failed");

      const newQuestion = await response.json();
      if (newQuestion.error) {
        throw new Error(newQuestion.error);
      }

      // Store the current question before replacing it
      setPendingRegeneration(prev => ({
        ...prev,
        [index]: {
          previous: questions[index],
          new: newQuestion
        }
      }));

      setQuestions(prevQuestions => 
        prevQuestions.map((q, i) => 
          i === index ? newQuestion : q
        )
      );

      // Reset states for this question
      setSelectedAnswers(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setCheckedAnswers(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
      setExplanationVisible(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });

    } catch (error) {
      console.error("Error regenerating question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate question",
      });
    } finally {
      setLoadingStates(prev => {
        const updated = { ...prev };
        delete updated[index];
        return updated;
      });
    }
  };

  const handleAcceptRegeneration = (index) => {
    // Clear the pending regeneration state
    setPendingRegeneration(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  const handleRevertRegeneration = (index) => {
    // Revert to the previous question
    setQuestions(prevQuestions =>
      prevQuestions.map((q, i) =>
        i === index ? pendingRegeneration[index].previous : q
      )
    );

    // Clear the pending regeneration state
    setPendingRegeneration(prev => {
      const updated = { ...prev };
      delete updated[index];
      return updated;
    });
  };

  return (
    <div className="space-y-8 my-12 max-w-7xl">
      <h1 className="text-4xl font-semibold text-center">Select the format that best matches your project.</h1>
      <div className="grid grid-cols-1 gap-4">
        <Link href="/dashboard/createstory/upload">
          <FormatCard title="Article" description="Create an article covering a specific topic." />
        </Link>
        {/* <Link href="/dashboard/createstory/upload">
          <FormatCard title="Blog Post" description="Create a blog-style post with a narrative structure." />
        </Link>
        <Link href="/dashboard/createstory/upload">
          <FormatCard title="Social Media Post" description="Create captions or standalone posts for common platforms." />
        </Link> */}
      </div>
      <div className="flex justify-center">
        <Button>
          Advanced Configuration
        </Button>
      </div>
    </div>
  );
}
