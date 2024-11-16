"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, Plus, Upload, Loader2 } from "lucide-react";
import { apiUrl } from "@/lib/utils";
import axios from "axios";

// Mock book data

// Mock file upload function
const mockFileUpload = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(`mock-document-url-${Date.now()}.${file.name.split(".").pop()}`);
    }, 1500);
  });
};

export default function DigitalLibrary() {
  const [books, setBooks] = useState<any>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddBookDialogOpen, setIsAddBookDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<(typeof books)[0] | null>(
    null
  );

  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "ai"; content: string }[]
  >([]);
  const [userInput, setUserInput] = useState("");
  const [newBook, setNewBook] = useState({
    title: "",
    description: "",
    imageUrl: "",
    documentUrl: "",
  });
  const [isUploading, setIsUploading] = useState(false);

  const [messages, setMessages] = useState<any>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [isAiThinking, setIsAiThinking] = useState(false);

  useEffect(() => {
    axios.get(`${apiUrl}/chat/getDocuments`).then((response) => {
      console.log("response", response);
      setBooks(response.data);
    });
  }, []);

  const handleChatIconClick = (book: (typeof books)[0]) => {
    setSelectedBook(book);
    setChatMessages([]);
    setIsDialogOpen(true);
  };

  const handleSendMessage = () => {
    if (!userInput.trim() || !selectedBook) return;
    setIsAiThinking(true);

    const newUserMessage = { role: "user" as const, content: userInput };
    setChatMessages((prev) => [...prev, newUserMessage]);

    console.log("newAiMessage", userInput);
    console.log("selectedBook", selectedBook);

    axios
      .post(`${apiUrl}/chat/askQuestionAboutBook`, {
        question: userInput,
        title: selectedBook?.title,
      })
      .then((response) => {
        // console.log("response", response);
        // setBooks(response.data);
        setIsAiThinking(false);
        setUserInput("");

        setChatMessages((prev) => [
          ...prev,
          { role: "ai", content: response.data.answer },
        ]);
      })
      .catch((error) => {
        console.error("Error processing message:", error);
        setError("Failed to process your message, Please try again");

        setIsAiThinking(false);
      });
  };

  const handleAddBook = async () => {
    setIsUploading(true);
    // console.log("handleAddBook");
    if (newBook.title && newBook.description) {
      // console.log("newBook", newBook);

      if (uploadedFiles) {
        // console.log("uploadedFiles", uploadedFiles);
        const newFiles = Array.from(uploadedFiles);
        // setUploadedFiles([...uploadedFiles, ...newFiles]);

        for (const file of newFiles) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
          setProcessingFiles((prev) => [...prev, file.name]);

          const formData = new FormData();
          formData.append("file", file);
          formData.append("title", newBook.title);
          formData.append("description", newBook.description);

          axios
            .post(`${apiUrl}/chat/upload`, formData, {
              headers: {
                "Content-Type": "multipart/form-data",
              },
            })
            .then((response) => {
              setBooks(response.data);

              setIsUploading(false);
              setIsAddBookDialogOpen(false);

              setUploadedFiles([]);
              setProcessingFiles([]);
              setNewBook({
                title: "",
                description: "",
                imageUrl: "",
                documentUrl: "",
              });
            })
            .catch((error) => {
              console.error("Error uploading file:", error);
              setError("Failed to upload file, Please try again");
              setUploadedFiles([]);
              setProcessingFiles([]);
              setIsAddBookDialogOpen(false);
            });
        }
      }

      // setIsAddBookDialogOpen(false);
    }
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUploadedFiles([...event?.target?.files]);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Digital Library</h1>
        <Button onClick={() => setIsAddBookDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Book
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books?.map((book: any, index: number) => (
          <Card key={index} className="flex flex-col">
            <CardHeader>
              <CardTitle>{book.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow">
              <p>{book.description}</p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="ghost" onClick={() => handleChatIconClick(book)}>
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask questions
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedBook?.title} - AI Assistant</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[300px] p-4 border rounded">
            <div
              className={`mb-4 
              text-blue-600"
                `}
            >
              <strong> AI: </strong>
              {`I'm an AI assistant for ${selectedBook?.title}. How can I help you with this book?`}
            </div>
            {chatMessages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === "ai" ? "text-blue-600" : "text-green-600"
                }`}
              >
                <strong>{message.role === "ai" ? "AI: " : "You: "}</strong>
                {message.content}
              </div>
            ))}

            {isAiThinking && (
              <div className="flex items-center text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                Thinking...
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <div className="flex w-full items-center space-x-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={userInput}
                disabled={isAiThinking}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button type="submit" size="icon" onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddBookDialogOpen} onOpenChange={setIsAddBookDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Book</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newBook.title}
                onChange={(e) =>
                  setNewBook((prev) => ({ ...prev, title: e.target.value }))
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={newBook.description}
                onChange={(e) =>
                  setNewBook((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="col-span-3"
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="document" className="text-right">
                Upload Document
              </Label>
              <div className="col-span-3">
                <Input
                  id="document"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                  accept=".pdf,.doc,.docx,.txt"
                />
                {isUploading && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Uploading...
                  </p>
                )}
                {newBook.documentUrl && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Document uploaded successfully
                  </p>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleAddBook}
              disabled={
                isUploading || !newBook.description || newBook.title === ""
              }
            >
              {isUploading && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
              Add Book
            </Button>

            {isUploading && (
              <p className="text-sm text-muted-foreground mt-2">Uploading...</p>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
