"use client";

import React, { useState, useEffect } from "react";
import { Bot, Upload, FileText, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { apiUrl } from "@/lib/utils";

interface Message {
  role: "user" | "ai";
  content: string;
  documentChunks?: {
    text: string;
    confidence: number;
  }[];
}

const initialQuestions = [
  "What was the last book you read?",
  "What genre of books do you usually prefer?",
  "How old are you?",
  "Do you prefer fiction or non-fiction?",
  "Which books have influenced you the most?",
];

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [answers, setAnswers] = useState<String[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isInitialQuestionsComplete, setIsInitialQuestionsComplete] =
    useState(false);

  useEffect(() => {
    if (questionIndex < initialQuestions.length) {
      setMessages((prev) => {
        // Prevent duplicate messages if questionIndex changes quickly
        if (
          prev.some(
            (message) => message.content === initialQuestions[questionIndex]
          )
        ) {
          return prev;
        }
        return [
          ...prev,
          { role: "ai", content: initialQuestions[questionIndex] },
        ];
      });
    }
  }, [questionIndex]);

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: inputMessage },
      ];
      setMessages(newMessages);
      setInputMessage("");

      // If the user is still answering initial questions
      if (questionIndex < initialQuestions.length - 1) {
        setQuestionIndex(questionIndex + 1);

        setAnswers((prev) => [...prev, inputMessage]);
      } else if (questionIndex === initialQuestions.length - 1) {
        setIsInitialQuestionsComplete(true);
        setQuestionIndex(questionIndex + 1);

        let userResponse = "";

        for (let i = 0; i < initialQuestions.length; i++) {
          userResponse += `${initialQuestions[i]}: ${answers[i]}\n`;
        }

        // console.log("users", userResponse);
        // All questions answered, proceed with normal AI response
        setIsAiThinking(true);
        try {
          const response = await fetch(`${apiUrl}/chat/recommendBooks`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ questions: userResponse }),
          });

          if (response.ok) {
            const data = await response.json();

            console.log("data", data.content);

            setMessages((prev) => [
              ...prev,
              {
                role: "ai",
                content: data.answer,
              },
            ]);
            setIsAiThinking(false);
          } else {
            setError("Failed to process your message, Please try again");
            setIsAiThinking(false);
          }
        } catch (error) {
          console.error("Error processing message:", error);
          setError("Failed to process your message, Please try again");
          setIsAiThinking(false);
        }
      } else {
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center">
          <Bot className="w-6 h-6 mr-2 text-primary" />
          <h1 className="text-xl font-bold">AI Research Assistant</h1>
        </div>
        <div>
          {/* <Input
            type="file"
            onChange={() => {}}
            className="hidden"
            id="file-upload"
            accept="application/pdf"
            multiple
          />
          <label htmlFor="file-upload">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="mr-2 h-4 w-4" /> Upload Documents
              </span>
            </Button>
          </label> */}
        </div>
      </header>

      <ScrollArea className="flex-grow p-6">
        {error && (
          <Alert variant="destructive" className="relative mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-2 right-2 z-10"
              onClick={() => setError(null)}
            >
              <span className="sr-only">Dismiss</span>✕{" "}
              {/* Or any icon or text you'd like to use */}
            </Button>
          </Alert>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-3 rounded-lg ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.content.split("\n").map((line, i) => (
                <p key={i} className={i > 0 ? "mt-2" : ""}>
                  {line}
                </p>
              ))}
            </span>
          </div>
        ))}
        {isAiThinking && (
          <div className="flex items-center text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin mr-1" />
            Thinking...
          </div>
        )}
      </ScrollArea>

      <footer className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask a Recommendation question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            // className="flex-grow"
            disabled={isAiThinking}
          />
          <Button onClick={handleSendMessage} disabled={isAiThinking}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}
