"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Upload, Send, FileText, Bot, Loader2 } from "lucide-react";

interface Message {
  role: "user" | "ai";
  content: string;
  documentChunks?: Array<{ text: string; confidence: number }>;
}

const sampleConversation: Message[] = [
  {
    role: "ai",
    content: "Hello! I'm your AI assistant. How can I help you today?",
  },
  {
    role: "user",
    content:
      "Hi! I'm working on a project about climate change. Can you help me understand its main causes?",
  },
  {
    role: "ai",
    content:
      "Of course! The main causes of climate change are:\n\n1. Greenhouse gas emissions, primarily from burning fossil fuels\n2. Deforestation and land-use changes\n3. Industrial processes and agriculture\n4. Increased livestock farming\n5. Use of fertilizers containing nitrogen\n\nWould you like me to elaborate on any of these points?",
  },
];

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessages(sampleConversation);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);

      newFiles.forEach((file) => {
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        setProcessingFiles((prev) => [...prev, file.name]);

        // Simulate upload progress
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = Math.min((prev[file.name] || 0) + 10, 100);
            return { ...prev, [file.name]: newProgress };
          });
        }, 500);

        // Simulate processing completion
        setTimeout(() => {
          clearInterval(interval);
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
        }, 5000);
      });
    }
  };

  const handleSendMessage = () => {
    if (inputMessage.trim() !== "") {
      const newMessages = [
        ...messages,
        { role: "user", content: inputMessage },
      ];
      setMessages(newMessages);
      setInputMessage("");

      // Simulate AI response with document chunks and confidence scores
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            role: "ai",
            content:
              "Based on the documents you've uploaded, here's what I found:",
            documentChunks: [
              {
                text: "Climate change is primarily caused by greenhouse gas emissions.",
                confidence: 0.95,
              },
              {
                text: "Deforestation contributes significantly to climate change.",
                confidence: 0.87,
              },
              {
                text: "Industrial processes are a major source of greenhouse gases.",
                confidence: 0.92,
              },
            ],
          },
        ]);
      }, 1500);
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
                      <p>{chunk.text}</p>
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
