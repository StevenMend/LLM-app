"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Paperclip, Send, Mic, StopCircle, RefreshCw, Plus, Menu } from "lucide-react"
import ChatMessage from "@/components/chat-message"
import ChatSidebar from "@/components/chat-sidebar"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

interface Message {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isStreaming?: boolean
  references?: {
    text: string
    page: number
    source: string
  }[]
  attachments?: {
    name: string
    url: string
    type: string
  }[]
}

interface Session {
  id: string
  name: string
  lastActive: Date
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content:
        "Hello and welcome! I'm your AI assistant, here to help you with anything you need. Upload a PDF document and ask me questions about it. I'll analyze the content and provide relevant answers based on the document.",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [files, setFiles] = useState<File[]>([])
  const [isProcessingFiles, setIsProcessingFiles] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([
    { id: "1", name: "Financial Report", lastActive: new Date(Date.now() - 86400000) },
    { id: "2", name: "Estudio Kennedy", lastActive: new Date(Date.now() - 172800000) },
    { id: "3", name: "Research Paper", lastActive: new Date(Date.now() - 259200000) },
  ])
  const [currentSession, setCurrentSession] = useState<Session>({
    id: "new",
    name: "New Conversation",
    lastActive: new Date(),
  })
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const isMobile = useMobile()

  // Auto-hide sidebar on mobile or when conversation starts
  useEffect(() => {
    if (isMobile || messages.length > 1) {
      setSidebarVisible(false)
    }
  }, [isMobile, messages.length])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible)
  }

  const handleSendMessage = async () => {
    if ((!input.trim() && files.length === 0) || isGenerating) return

    // Create attachments from files
    const attachments = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }))

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Auto-hide sidebar on first message on desktop
    if (messages.length <= 1 && !isMobile) {
      setSidebarVisible(false)
    }

    // If files are being uploaded, process them first
    if (files.length > 0) {
      setIsProcessingFiles(true)

      // Simulate file processing (in real app, this would be an API call to your Python backend)
      toast({
        title: "Processing PDF files",
        description: "Extracting content and creating embeddings...",
      })

      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setIsProcessingFiles(false)
      setFiles([])

      toast({
        title: "PDF processing complete",
        description: "You can now ask questions about the documents.",
      })
    }

    // Start generating AI response
    const aiMessageId = (Date.now() + 1).toString()

    // Add initial empty message that will be streamed
    setMessages((prev) => [
      ...prev,
      {
        id: aiMessageId,
        content: "",
        sender: "ai",
        timestamp: new Date(),
        isStreaming: true,
      },
    ])

    setIsGenerating(true)

    // Simulate streaming response (in real app, this would be a streaming API call to your Python backend)
    let responseText = ""
    const fullResponse =
      attachments.length > 0
        ? "I've analyzed the PDF documents you provided. Based on the content, I can see several key points:\n\n1. The document discusses various aspects of data analysis and visualization techniques.\n\n2. There are sections covering statistical methods and their applications in research.\n\n3. The conclusion summarizes findings related to the effectiveness of these methods in real-world scenarios.\n\nWhat specific information would you like to know about these documents?"
        : "I understand you're asking about " +
          input +
          ". To provide a comprehensive answer, I would need some context from relevant documents. Could you please upload a PDF that contains information about this topic?"

    const references =
      attachments.length > 0
        ? [
            {
              text: "...statistical methods showed significant improvements in accuracy compared to traditional approaches...",
              page: 12,
              source: attachments[0].name,
            },
            {
              text: "...visualization techniques enabled researchers to identify patterns that were previously undetectable...",
              page: 24,
              source: attachments[0].name,
            },
          ]
        : undefined

    // Simulate streaming by updating the message character by character
    for (let i = 0; i < fullResponse.length; i++) {
      if (!isGenerating) break // Allow stopping generation

      responseText += fullResponse[i]

      setMessages((prev) => prev.map((msg) => (msg.id === aiMessageId ? { ...msg, content: responseText } : msg)))

      // Slow down the streaming simulation
      await new Promise((resolve) => setTimeout(resolve, 20))
    }

    // Update the final message with references
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === aiMessageId ? { ...msg, content: responseText, isStreaming: false, references } : msg,
      ),
    )

    setIsGenerating(false)
  }

  const stopGeneration = () => {
    setIsGenerating(false)
    toast({
      title: "Generation stopped",
      description: "The response generation has been stopped.",
    })
  }

  const regenerateResponse = () => {
    if (isGenerating) return

    // Find the last AI message and remove it
    const messagesReversed = [...messages].reverse()
    const lastAiMessageIndex = messagesReversed.findIndex((m) => m.sender === "ai")

    if (lastAiMessageIndex !== -1) {
      const newMessages = [...messages]
      newMessages.pop() // Remove the last AI message
      setMessages(newMessages)

      // Trigger generation again
      handleSendMessage()
    }
  }

  const createNewSession = () => {
    // Add current session to history if it has messages
    if (messages.length > 1) {
      const newSessionName = `Session ${new Date().toLocaleDateString()}`
      const newSession = {
        id: Date.now().toString(),
        name: newSessionName,
        lastActive: new Date(),
      }

      setSessions((prev) => [newSession, ...prev])
    }

    // Create new session
    setCurrentSession({
      id: "new",
      name: "New Conversation",
      lastActive: new Date(),
    })

    // Clear messages except welcome
    setMessages([
      {
        id: "welcome",
        content:
          "Hello and welcome! I'm your AI assistant, here to help you with anything you need. Upload a PDF document and ask me questions about it. I'll analyze the content and provide relevant answers based on the document.",
        sender: "ai",
        timestamp: new Date(),
      },
    ])

    setFiles([])
    setInput("")
    setIsGenerating(false)
    setIsProcessingFiles(false)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files)

      // Filter for PDFs only
      const pdfFiles = newFiles.filter((file) => file.type === "application/pdf")
      const nonPdfFiles = newFiles.filter((file) => file.type !== "application/pdf")

      if (nonPdfFiles.length > 0) {
        toast({
          title: "Only PDF files are supported",
          description: "Please upload PDF files only for analysis.",
          variant: "destructive",
        })
      }

      if (pdfFiles.length > 0) {
        setFiles((prev) => [...prev, ...pdfFiles])
        toast({
          title: `${pdfFiles.length} PDF${pdfFiles.length > 1 ? "s" : ""} added`,
          description: "Your PDFs are ready to be analyzed.",
        })
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const loadSession = (sessionId: string) => {
    const session = sessions.find((s) => s.id === sessionId)
    if (!session) return

    // In a real app, this would load messages from the backend
    setCurrentSession(session)

    // Simulate loading messages for this session
    setMessages([
      {
        id: "welcome",
        content: "Welcome back to your session. How can I help you today?",
        sender: "ai",
        timestamp: new Date(),
      },
      {
        id: "previous-1",
        content: "Can you analyze this financial report?",
        sender: "user",
        timestamp: new Date(Date.now() - 3600000),
        attachments: [
          {
            name: "financial_report_2023.pdf",
            url: "#",
            type: "application/pdf",
          },
        ],
      },
      {
        id: "previous-2",
        content:
          "I've analyzed the financial report. The company shows a 15% increase in revenue compared to last year, with significant growth in the technology sector. The debt-to-equity ratio has improved from 1.8 to 1.5, indicating better financial stability.",
        sender: "ai",
        timestamp: new Date(Date.now() - 3500000),
        references: [
          {
            text: "Annual revenue increased by 15% year-over-year, primarily driven by expansion in technology services.",
            page: 4,
            source: "financial_report_2023.pdf",
          },
          {
            text: "Debt-to-equity ratio improved from 1.8 to 1.5, reflecting the company's focus on reducing leverage.",
            page: 12,
            source: "financial_report_2023.pdf",
          },
        ],
      },
    ])

    // Auto-hide sidebar on mobile after loading a session
    if (isMobile) {
      setSidebarVisible(false)
    }
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar with transition */}
      <div
        className={`sidebar-transition fixed md:relative z-10 h-full bg-gray-50 border-r border-gray-200 ${
          sidebarVisible ? "w-64" : "sidebar-hidden"
        }`}
      >
        <ChatSidebar
          sessions={sessions}
          currentSession={currentSession}
          onSessionSelect={loadSession}
          onNewSession={createNewSession}
        />
      </div>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-gray-200 p-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <div className={`avatar-energy ${isGenerating ? "animate-pulse-energy" : ""}`}></div>
              <h1 className="font-medium ml-3">{currentSession.name}</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={createNewSession}>
              <Plus className="h-4 w-4 mr-1" />
              New Chat
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {files.length > 0 && (
          <div className="px-4 py-2 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                  <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                  <button onClick={() => removeFile(index)} className="ml-2 text-gray-500 hover:text-gray-700">
                    &times;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {isGenerating && (
          <div className="px-4 py-2 flex justify-center">
            <Button variant="outline" size="sm" onClick={stopGeneration} className="flex items-center">
              <StopCircle className="h-4 w-4 mr-1 text-red-500" />
              Stop generating
            </Button>
          </div>
        )}

        {!isGenerating && messages.length > 1 && messages[messages.length - 1].sender === "ai" && (
          <div className="px-4 py-2 flex justify-center">
            <Button variant="outline" size="sm" onClick={regenerateResponse} className="flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" />
              Regenerate response
            </Button>
          </div>
        )}

        <div className="p-4 border-t border-gray-200">
          <div className="relative flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2"
              onClick={handleFileUpload}
              disabled={isGenerating || isProcessingFiles}
            >
              <Paperclip className="h-5 w-5 text-gray-500" />
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={isGenerating || isProcessingFiles}
            />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isProcessingFiles ? "Processing files..." : "Ask me anything about your documents"}
              className="pl-10 pr-10 py-6 rounded-full"
              disabled={isGenerating || isProcessingFiles}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2"
              onClick={handleSendMessage}
              disabled={isGenerating || isProcessingFiles}
            >
              {input.trim() || files.length > 0 ? (
                <Send className="h-5 w-5 text-gray-500" />
              ) : (
                <Mic className="h-5 w-5 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
