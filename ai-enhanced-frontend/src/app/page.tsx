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

const sampleConversation: Message[] = [
  { role: "ai", content: "Hello! How can I assist you today?" },
];

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(sampleConversation);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);

      for (const file of newFiles) {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        setProcessingFiles((prev) => [...prev, file.name]);

        const formData = new FormData();
        formData.append("file", file);

        try {
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percentComplete = (event.loaded / event.total) * 100;
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: percentComplete,
              }));
            }
          };

          // Set up the request
          xhr.open("POST", `${apiUrl}/chat/upload`, true);

          xhr.onload = () => {
            if (xhr.status === 200) {
              setProcessingFiles((prev) => prev.filter((f) => f !== file.name));
              setMessages((prev) => [
                ...prev,
                {
                  role: "user",
                  content: `Uploaded and processed file: ${file.name}`,
                },
                {
                  role: "ai",
                  content: `I've processed the file ${file.name}. You can now ask questions about its contents.`,
                },
              ]);
            } else {
              setError("Failed to upload file, Please try again");
              setUploadedFiles([]);
              setProcessingFiles([]);
            }
          };

          xhr.onerror = (error) => {
            console.error("Error uploading file:", error);
            setError("Failed to upload file, Please try again");
            setUploadedFiles([]);
            setProcessingFiles([]);
          };

          // Send the request with the form data
          xhr.send(formData);
        } catch (error) {
          console.error("Error uploading file:", error);
          setError("Failed to upload file, Please try again");
          setUploadedFiles([]);
          setProcessingFiles([]);
        }
      }
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() !== "") {
      const newMessages: Message[] = [
        ...messages,
        { role: "user", content: inputMessage },
      ];
      setIsAiThinking(true);
      setMessages(newMessages);
      setInputMessage("");

      try {
        const response = await fetch(`${apiUrl}/chat/ask`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ question: inputMessage }),
        });

        if (response.ok) {
          const data = await response.json();

          const processedChunks = data.documentChunks?.map((chunk: any) => {
            const text = chunk.pageContent.replaceAll("\n", " ");
            const confidence = chunk.confidence || 0;
            return { text, confidence };
          });

          setMessages((prev) => [
            ...prev,
            {
              role: "ai",
              content: data.answer,
              documentChunks: processedChunks || [],
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
          <Input
            type="file"
            onChange={handleFileUpload}
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
          </label>
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
              {message.documentChunks && (
                <div className="mt-2 text-sm">
                  <p className="font-semibold">Relevant Document Chunks:</p>
                  {message.documentChunks.map((chunk, i) => (
                    <div key={i} className="mt-1">
                      <p>
                        {chunk.text.length > 100
                          ? chunk.text.slice(0, 80) + "..."
                          : chunk.text}
                      </p>
                      <Progress
                        value={chunk.confidence * 100}
                        className="h-1 mt-1"
                      />
                      <p className="text-xs text-right">
                        Confidence: {(chunk.confidence * 100).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              )}
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

      {(uploadedFiles.length > 0 || processingFiles.length > 0) && (
        <div className="px-6 py-2 bg-muted/50 border-t">
          <h4 className="text-sm font-semibold">Uploaded Files:</h4>
          <ul className="list-disc list-inside">
            {uploadedFiles.map((file, index) => (
              <li key={index} className="text-sm flex items-center">
                <FileText className="inline mr-2 h-4 w-4" />
                {file.name}
                {processingFiles.includes(file.name) ? (
                  <span className="ml-2 flex items-center text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    Processing...
                  </span>
                ) : (
                  <span className="ml-2 text-green-600">Processed</span>
                )}
                <Progress
                  value={uploadProgress[file.name]}
                  className="h-1 w-24 ml-2"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <Input
            type="text"
            placeholder="Ask a question about your documents..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSendMessage();
              }
            }}
            className="flex-grow"
          />
          <Button onClick={handleSendMessage}>
            <Send className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>
      </footer>
    </div>
  );
}
