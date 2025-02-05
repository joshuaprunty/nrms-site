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

const COPY_TEXT =
`
Lecture 3: Application-Layer Protocols, HTTP - Key Points
Application-Layer Protocols
Purpose:
Enable applications on different devices to communicate.
Examples: HTTP, SMTP, DNS.
Two Architectures:
Client-Server:
Servers handle requests and are always powered on.
Clients initiate requests but do not communicate directly with other clients.
Peer-to-Peer (P2P):
Peers share equal responsibilities (e.g., BitTorrent, Skype).
Scalable but challenging due to churn, IP changes, and upload limitations.

HTTP (HyperText Transfer Protocol)
Overview:
Client-server protocol built on top of TCP.
Stateless: Each request is independent and self-contained.
Key Features:
Request:
Includes a method (e.g., GET, POST), headers, and an optional body.
Response:
Includes a status code (e.g., 200 OK, 404 Not Found), headers, and an optional body.
HTTP Transaction:
Client opens a TCP socket to the server.
Sends an HTTP request.
Server processes the request and sends a response.
Client reads and processes the response.

HTTP Methods and Status Codes
Methods:
GET: Retrieve data.
POST: Send data to the server.
PUT: Create/replace a resource.
DELETE: Remove a resource.
HEAD: Retrieve headers only.
Status Codes:
2xx: Success (e.g., 200 OK).
3xx: Redirection (e.g., 301 Moved Permanently).
4xx: Client errors (e.g., 404 Not Found).
5xx: Server errors (e.g., 500 Internal Server Error).

Cookies
Purpose:
Maintain user state across stateless HTTP requests.
Process:
Server sends a Set-Cookie header in the HTTP response.
Client stores the cookie locally and includes it in subsequent requests.
Server identifies the user using the cookie.
Uses:
Authentication, session tracking, personalization.
Security Concerns:
Vulnerable to impersonation attacks (e.g., CSRF).
Best practices include setting SameSite attributes to prevent misuse.

HTTP Evolution and REST APIs
Evolution:
HTTP/1.0 (1991): Basic document fetching.
HTTP/1.1 (1997): Keep-alive connections.
HTTP/2 (2014): Binary framing and pipelining.
HTTP/3 (2022): Built on QUIC for better performance.
REST APIs:
Use HTTP for client-server communication.
Enable interaction with services via structured requests (e.g., GET, POST).
Often return JSON data for programmatic use.

SMTP (Simple Mail Transfer Protocol)
Purpose:
Enables email transfer between servers using TCP (port 25).
Process:
Stateful communication where the server remembers past interactions.
Commands like MAIL FROM, RCPT TO, and DATA establish and send messages.
Differences from HTTP:
SMTP is stateful, while HTTP is stateless.


Lecture 4: Domain Name Service (DNS) - Key Points
DNS: The Internet's Directory Service
Goals of DNS:
Translate human-readable domain names to machine-readable IP addresses (e.g., northwestern.edu → 129.105.136.48).
Provide portability by allowing domain names to remain constant even as server IP addresses change.
Distributed and Hierarchical Design:
Decentralized structure for scalability and fault tolerance.
Hierarchical levels:
Root Servers: Manage top-level domains (TLDs) like .com, .edu.
TLD Servers: Direct queries to authoritative servers.
Authoritative Servers: Store mappings for specific domains (e.g., example.com).

How DNS Works
Iterative Querying:
Queries traverse the hierarchy:
Client contacts the root server.
Root server directs the client to the TLD server.
TLD server points to the authoritative server.
Authoritative server provides the requested IP address.
Caching:
Local DNS resolvers cache responses to reduce query times and network traffic.
Cached records have a TTL (Time to Live) after which they expire.

DNS Records
Types of Resource Records (RRs):
A: Maps domain names to IPv4 addresses.
AAAA: Maps domain names to IPv6 addresses.
CNAME: Canonical name alias for another domain.
MX: Mail exchange records for email routing.
PTR: Reverse lookup, mapping IP to domain name.
TXT: Key-value pairs for arbitrary data (e.g., SPF, DKIM).
SRV: Defines servers for specific services.
`

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
    <div className="space-y-4 my-12 max-w-4xl">
      <Button 
        onClick={copyTest}
        variant="outline"
        className="w-[100px]"
      >
        Copy Sample Input
      </Button>
      <Textarea
        placeholder="Paste your study materials here..."
        className="min-h-[300px]"
        value={studyText}
        onChange={(e) => setStudyText(e.target.value)}
      />
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          onClick={() => setIsConfigModalOpen(true)}
          className="w-1/3"
        >
          Configure Questions
        </Button>
        <Button 
          onClick={generateQuestions}
          disabled={isGenerating}
          className="w-1/3"
        >
          {isGenerating ? "Generating..." : "Generate Questions"}
        </Button>
        <Button 
          onClick={analyzeText} 
          className="w-1/3" 
          disabled={isAnalyzing}
        >
          {isAnalyzing ? "Analyzing..." : "Analyze Topics"}
        </Button>
      </div>
      <QuizConfigModal 
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        onSave={setQuestionConfig}
      />

      {topics && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Main Topics Identified:</h2>
          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="font-semibold">{topic.topic}</h3>
                <p className="text-gray-600 mt-2">{topic.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {questions && (
        <div className="mt-8 space-y-4">
          <h2 className="text-xl font-bold">Practice Questions:</h2>
          <div className="grid gap-6">
            {questions.map((question, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <div className="flex flex-row justify-between items-center">
                    <h3 className="font-semibold text-lg">
                      Question {index + 1}
                    </h3>
                    <div className="flex gap-2">
                      {pendingRegeneration[index] ? (
                        <>
                          <Button
                            onClick={() => handleAcceptRegeneration(index)}
                            variant="save"
                            size="sm"
                          >
                            Keep New
                          </Button>
                          <Button
                            onClick={() => handleRevertRegeneration(index)}
                            variant="outline"
                            size="sm"
                          >
                            Revert
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleRegenerateQuestion(index)}
                            variant="outline"
                            size="sm"
                            disabled={loadingStates[index]}
                          >
                            {loadingStates[index] ? "Regenerating..." : "Regenerate"}
                          </Button>
                          <Button
                            onClick={() => handleDeleteQuestion(index)}
                            variant="destructive"
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  {editingIndex === index ? (
                    <input
                      type="text"
                      value={question.question}
                      onChange={(e) =>
                        handleEditChange(index, "question", e.target.value)
                      }
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  ) : (
                    <p>{question.question}</p>
                  )}
                </CardHeader>
                <CardContent>
                  {editingIndex === index ? (
                    question.type === 'short-answer' ? (
                      <div className="space-y-2">
                        <Label>Correct Answer</Label>
                        <input
                          type="text"
                          value={editingCorrectAnswer || ''}
                          onChange={(e) => setEditingCorrectAnswer(e.target.value)}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Enter correct answer..."
                        />
                      </div>
                    ) : (
                      <RadioGroup>
                        {question.answers.map((answer, ansIndex) => (
                          <div key={ansIndex} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={answer}
                              onChange={(e) =>
                                handleEditChange(
                                  index,
                                  `answers[${ansIndex}]`,
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded px-3 py-2"
                            />
                            <input
                              type="checkbox"
                              checked={editingCorrectAnswer === answer}
                              onChange={() =>
                                handleCorrectAnswerSelection(index, answer)
                              }
                              className="h-6 w-6 checked:border-blue-500"
                            />
                          </div>
                        ))}
                      </RadioGroup>
                    )
                  ) : (
                    question.type === 'short-answer' ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={selectedAnswers[index] || ''}
                          onChange={(e) => 
                            setSelectedAnswers({
                              ...selectedAnswers,
                              [index]: e.target.value
                            })
                          }
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          placeholder="Type your answer here..."
                        />
                      </div>
                    ) : (
                      <RadioGroup
                        value={selectedAnswers[index]}
                        onValueChange={(value) =>
                          setSelectedAnswers({
                            ...selectedAnswers,
                            [index]: value,
                          })
                        }
                      >
                        {question.answers.map((answer, ansIndex) => (
                          <div
                            key={ansIndex}
                            className="flex items-center space-x-2"
                          >
                            <RadioGroupItem
                              value={answer}
                              id={`q${index}-a${ansIndex}`}
                            />
                            <Label htmlFor={`q${index}-a${ansIndex}`}>
                              {answer}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )
                  )}
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  {editingIndex === index ? (
                    <Button onClick={handleSaveEdit} variant="save">
                      Save
                    </Button>
                  ) : (
                    <div className="flex flex-row justify-between items-center w-full">
                      <div className="flex flex-row items-center gap-4">
                        <Button
                          onClick={() => checkAnswer(index)}
                          disabled={!selectedAnswers[index]}
                        >
                          Check Answer
                        </Button>
                        {checkedAnswers[index] !== undefined && (
                          <p
                            className={
                              checkedAnswers[index]
                                ? "text-green-600"
                                : "text-red-600"
                            }
                          >
                            {checkedAnswers[index] ? "Correct!" : "Incorrect"}
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleEditClick(index)}
                        variant="edit"
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                  {/* Row with the Explanation Button */}
                  <div className="mt-2">
                    <Button
                      onClick={() => {
                        if (!selectedAnswers[index]) {
                          toast({
                            variant: "destructive",
                            title: "Error",
                            description:
                              "Please answer the question first to view the explanation.",
                          });
                          return;
                        }
                        setExplanationVisible((prev) => ({
                          ...prev,
                          [index]: !prev[index],
                        }));
                      }}
                    >
                      {explanationVisible[index]
                        ? "Hide Explanation"
                        : "View Explanation"}
                    </Button>

                    {/* Explanation Box */}
                    {explanationVisible[index] && (
                      <div className="mt-2 p-3 bg-gray-100 rounded-lg">
                        <p>{question.explanation}</p>
                      </div>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
          <Button
            onClick={() => setIsSaveModalOpen(true)}
            className="mt-4"
            disabled={saveDisabled}
          >
            Save Quiz
          </Button>
        </div>
      )}

      <SaveQuizModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveQuiz}
        loading={isSaving}
      />
      <Toaster />
    </div>
  );
}
