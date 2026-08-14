import React, { useState, useEffect, useRef } from "react"
import {
  Send,
  Paperclip,
  X,
  Bot,
  User as UserIcon,
  Code,
  FileText,
  FileSpreadsheet,
  Search,
  Eye,
  MessageSquare,
  Download,
  Terminal,
  ChevronDown,
  ChevronUp,
  FolderOpen
} from "lucide-react"
import { getMessages, sendAgentMessage, type Message, type Artifact, type FileArtifact } from "../api/chatApi"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"

import { type ArtifactData } from "./ArtifactPanel"

interface ChatAreaProps {
  conversationId: string
  conversationTitle: string
  onOpenArtifact: (artifact: ArtifactData | null) => void
}

interface AgentOption {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const AGENTS: AgentOption[] = [
  {
    id: "chat",
    name: "General AI",
    description: "General-purpose chat assistant for reasoning, explaining, and conversation.",
    icon: <Bot className="h-4 w-4" />,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/25"
  },
  {
    id: "coding",
    name: "Coding Agent",
    description: "Generates full software project code artifacts and technical documentation.",
    icon: <Code className="h-4 w-4" />,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  },
  {
    id: "pdfRag",
    name: "PDF RAG",
    description: "Performs semantic search and questions-answering on your uploaded PDF documents.",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-amber-500/10 text-amber-400 border-amber-500/25"
  },
  {
    id: "pdf",
    name: "PDF Generator",
    description: "Generates fully formatted PDF report documents based on your requirements.",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25"
  },
  {
    id: "ppt",
    name: "Slides Generator",
    description: "Creates formatted PowerPoint PPTX slides and presentation outline templates.",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    color: "bg-rose-500/10 text-rose-400 border-rose-500/25"
  },
  {
    id: "search",
    name: "Search Agent",
    description: "Uses Google search engine to look up live information and references from the web.",
    icon: <Search className="h-4 w-4" />,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
  },
  {
    id: "vision",
    name: "Vision Agent",
    description: "Processes uploaded images to perform visual question-answering and analysis.",
    icon: <Eye className="h-4 w-4" />,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/25"
  }
]

export const ChatArea: React.FC<ChatAreaProps> = ({ conversationId, conversationTitle, onOpenArtifact }) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>("chat")
  const [loading, setLoading] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(true)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)
  
  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Load messages when conversation ID changes
  useEffect(() => {
    const fetchHistory = async () => {
      setFetchingMessages(true)
      const data = await getMessages(conversationId)
      setMessages(data)
      setFetchingMessages(false)
    }
    fetchHistory()
    setAttachedFile(null)
  }, [conversationId])

  // Auto-scroll to bottom of messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      // Validate based on selected agent
      if (selectedAgent === "pdfRag" && file.type !== "application/pdf") {
        alert("Please select a PDF document for RAG.")
        return
      }
      if (selectedAgent === "vision" && !file.type.startsWith("image/")) {
        alert("Please select an image file for vision analysis.")
        return
      }
      setAttachedFile(file)
    }
  }

  const handleRemoveAttachment = () => {
    setAttachedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() && !attachedFile) return
    
    const userPrompt = input
    setInput("")
    setLoading(true)

    // Optimistically add user message in frontend UI
    const tempUserMsg: Message = {
      conversationId,
      role: "user",
      content: userPrompt,
      images: attachedFile && attachedFile.type.startsWith("image/") 
        ? [URL.createObjectURL(attachedFile)] 
        : undefined
    }
    setMessages((prev) => [...prev, tempUserMsg])
    
    const fileToUpload = attachedFile
    setAttachedFile(null)

    // Call Backend Agent Service via Gateway
    const response = await sendAgentMessage(conversationId, userPrompt, selectedAgent, fileToUpload)
    
    if (response) {
      // Add agent reply to messages list
      const tempAgentMsg: Message = {
        conversationId,
        role: "assistant",
        content: response.answer,
        images: response.images,
        artifacts: response.artifacts,
        agent: response.agent
      }
      setMessages((prev) => [...prev, tempAgentMsg])
    } else {
      // Render error message fallback
      const errorMsg: Message = {
        conversationId,
        role: "assistant",
        content: "Sorry, I encountered an issue invoking the AI workflow agents. Please make sure the service is running and try again."
      }
      setMessages((prev) => [...prev, errorMsg])
    }
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentAgent = AGENTS.find(a => a.id === selectedAgent) || AGENTS[0]

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Background radial gradients for clean premium tech aesthetics */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      
      {/* Dynamic Agent Selector Row */}
      <div className="border-b border-slate-800/80 px-6 py-3 bg-slate-950/40 backdrop-blur-md z-10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {AGENTS.map((agent) => {
            const isSelected = agent.id === selectedAgent
            return (
              <button
                key={agent.id}
                onClick={() => {
                  setSelectedAgent(agent.id)
                  setAttachedFile(null) // Reset files if switching agents
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide border cursor-pointer transition-all active:scale-[0.97] ${
                  isSelected
                    ? "bg-indigo-600/20 text-indigo-400 border-indigo-500/40 shadow-inner"
                    : "bg-slate-900/40 text-slate-400 border-slate-800/80 hover:bg-slate-900 hover:text-slate-200"
                }`}
              >
                {agent.icon}
                {agent.name}
              </button>
            )
          })}
        </div>
        <div className="text-right hidden md:block">
          <p className="text-[11px] text-slate-500 italic max-w-xs">{currentAgent.description}</p>
        </div>
      </div>

      {/* Messages Window */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {fetchingMessages ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
            <Bot className="h-8 w-8 animate-pulse text-indigo-500" />
            <p className="text-xs font-medium animate-pulse">Loading discussion history...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Bot className="h-6 w-6 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-200">Start a chat with {currentAgent.name}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Type your instructions below. You can switch agents on the top row at any time during this discussion session.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg, i) => (
              <MessageItem key={i} message={msg} onOpenArtifact={onOpenArtifact} />
            ))}
          </div>
        )}
        
        {/* Agent Thinking Loader */}
        {loading && (
          <div className="flex gap-4 items-start animate-pulse">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/25">
              <Bot className="h-4.5 w-4.5 text-indigo-400 animate-spin" />
            </div>
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-300">Agent {currentAgent.name}</span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">Thinking...</span>
              </div>
              <div className="h-3 bg-slate-900 rounded-md w-3/4 animate-pulse" />
              <div className="h-3 bg-slate-900 rounded-md w-1/2 animate-pulse" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80 backdrop-blur-md z-10 space-y-3">
        
        {/* Attachment preview bar */}
        {attachedFile && (
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 px-3 py-2 rounded-xl text-xs max-w-sm">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
              <span className="truncate text-slate-300 font-medium">{attachedFile.name}</span>
              <span className="text-slate-500 text-[10px] shrink-0">({(attachedFile.size / 1024).toFixed(1)} KB)</span>
            </div>
            <button
              onClick={handleRemoveAttachment}
              className="text-slate-500 hover:text-slate-300 cursor-pointer p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSend} className="flex gap-3 items-end">
          {/* File Picker button */}
          {(selectedAgent === "pdfRag" || selectedAgent === "vision") && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={selectedAgent === "pdfRag" ? ".pdf" : "image/*"}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 cursor-pointer transition-all"
                title={selectedAgent === "pdfRag" ? "Attach PDF Document" : "Attach Image"}
              >
                <Paperclip className="h-4.5 w-4.5" />
              </Button>
            </div>
          )}

          {/* Text input area */}
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder={
                selectedAgent === "pdfRag"
                  ? "Attach a PDF and ask a question about its contents..."
                  : selectedAgent === "vision"
                  ? "Attach an image and ask visual details..."
                  : selectedAgent === "coding"
                  ? "Instruct to generate code (e.g. 'Build a React dashboard component')...."
                  : `Ask ${currentAgent.name} agent a prompt...`
              }
              rows={1}
              className="w-full bg-slate-900 border border-slate-800/80 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 resize-none max-h-32 min-h-11 scrollbar-none"
            />
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading || (!input.trim() && !attachedFile)}
            className="h-11 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.97] transition-all cursor-pointer font-semibold px-4 flex items-center justify-center gap-2 border-none shadow-md shadow-indigo-600/10 shrink-0"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">Run Agent</span>
          </Button>
        </form>
      </div>
    </div>
  )
}

// Nested Message Item Component to render user vs assistant roles
const MessageItem: React.FC<{
  message: Message
  onOpenArtifact: (artifact: ArtifactData | null) => void
}> = ({ message, onOpenArtifact }) => {
  const isUser = message.role === "user"

  return (
    <div className={`flex gap-4 items-start ${isUser ? "justify-end" : ""}`}>
      {/* Icon/Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 border border-slate-800">
          <Bot className="h-4.5 w-4.5 text-indigo-400" />
        </div>
      )}

      {/* Bubble */}
      <div className={`space-y-2 max-w-[85%] ${isUser ? "items-end" : ""}`}>
        {/* Name Header */}
        <div className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
          <span className="text-xs font-semibold text-slate-300">
            {isUser ? "You" : "Nexus Assistant"}
          </span>
          {!isUser && message.agent && (
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 border font-semibold tracking-wide capitalize ${
                message.agent === "coding"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : message.agent === "search"
                  ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                  : message.agent === "pdf"
                  ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/30"
                  : message.agent === "ppt"
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : message.agent === "pdfRag"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : message.agent === "vision"
                  ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                  : "bg-blue-500/10 text-blue-400 border-blue-500/30"
              }`}
            >
              {message.agent} Agent
            </Badge>
          )}
          {message.createdAt && (
            <span className="text-[10px] text-slate-500">
              {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
        </div>

        {/* Content body */}
        <Card className={`p-4 rounded-xl border leading-relaxed text-sm ${
          isUser
            ? "bg-indigo-600/10 text-slate-200 border-indigo-500/20"
            : "bg-slate-900/60 text-slate-300 border-slate-800/80"
        }`}>
          {/* Markdown Content Renderer */}
          <div className="prose prose-invert max-w-none text-slate-300 break-words text-sm leading-relaxed">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="text-slate-300">{children}</li>,
                h1: ({ children }) => <h1 className="text-base font-bold my-3 text-slate-100">{children}</h1>,
                h2: ({ children }) => <h2 className="text-sm font-semibold my-2 text-slate-100">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xs font-semibold my-2 text-slate-200">{children}</h3>,
                code: ({ className, children }) => {
                  const inline = !className;
                  return inline ? (
                    <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-xs">{children}</code>
                  ) : (
                    <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 my-2 overflow-x-auto text-xs font-mono text-slate-300 select-text">
                      <code>{children}</code>
                    </pre>
                  );
                },
                table: ({ children }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
                    <table className="min-w-full divide-y divide-slate-800 text-left text-xs">{children}</table>
                  </div>
                ),
                thead: ({ children }) => <thead className="bg-slate-900 text-slate-400">{children}</thead>,
                tbody: ({ children }) => <tbody className="divide-y divide-slate-800 bg-slate-950/20">{children}</tbody>,
                tr: ({ children }) => <tr>{children}</tr>,
                th: ({ children }) => <th className="px-3 py-2 font-semibold">{children}</th>,
                td: ({ children }) => <td className="px-3 py-2 text-slate-300">{children}</td>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-500/50 pl-3 italic my-2 text-slate-400">{children}</blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 hover:underline font-semibold">
                    {children}
                  </a>
                )
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* S3 Download Links extractor */}
          {!isUser && message.content && message.content.includes("http") && (
            <div className="mt-3 flex flex-wrap gap-2">
              {extractDownloadLinks(message.content).map((link, idx) => (
                <div key={idx} className="flex flex-wrap gap-2 items-center">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download {link.ext.toUpperCase()}
                  </a>
                  <button
                    onClick={() => onOpenArtifact({
                      id: link.url,
                      type: "File",
                      title: link.ext.toUpperCase() === "PDF" ? "PDF Document Report" : "PowerPoint Slides",
                      url: link.url,
                      extension: link.ext as any
                    })}
                    className="inline-flex items-center gap-1.5 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-indigo-400 font-semibold text-xs py-1.5 px-3 rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Open in Workspace
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Generated Images */}
          {message.images && message.images.length > 0 && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {message.images.map((imgUrl, idx) => (
                <div key={idx} className="rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
                  <img
                    src={imgUrl}
                    alt="Agent output"
                    className="w-full h-auto object-cover max-h-64 hover:scale-[1.02] transition-transform duration-200 cursor-pointer"
                    onClick={() => window.open(imgUrl, "_blank")}
                  />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Project Code Artifacts Explorer */}
        {message.artifacts && message.artifacts.length > 0 && (
          <div className="w-full space-y-2 mt-2">
            {message.artifacts.map((art, idx) => (
              <div
                key={idx}
                className="p-3 bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-xl flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/60 active:scale-[0.99] transition-all"
                onClick={() => onOpenArtifact({
                  id: art.id,
                  type: "Project",
                  title: `Code Project: ${art.id}`,
                  files: art.files
                })}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <FolderOpen className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Interactive Workspace Project</p>
                    <p className="text-[10px] text-slate-500">{art.files?.length || 0} files generated</p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wide">Open Project</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600/10 border border-indigo-500/25">
          <UserIcon className="h-4.5 w-4.5 text-indigo-400" />
        </div>
      )}
    </div>
  )
}

// Simple regex extractor for download URLs (S3 buckets / static routes)
function extractDownloadLinks(content: string): { url: string; ext: string }[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const matches = content.match(urlRegex)
  if (!matches) return []

  return matches
    .map((url) => {
      // clean trailing punctuation if any
      const cleanedUrl = url.replace(/[.,;:)\]]$/, "")
      const lower = cleanedUrl.toLowerCase()
      let ext = "file"
      if (lower.includes(".pdf")) ext = "pdf"
      else if (lower.includes(".pptx")) ext = "pptx"
      else if (lower.includes(".docx")) ext = "docx"
      else if (lower.includes(".xlsx")) ext = "xlsx"
      else if (lower.includes(".png") || lower.includes(".jpg") || lower.includes(".jpeg")) ext = "img"
      
      return { url: cleanedUrl, ext }
    })
    .filter((item) => item.ext === "pdf" || item.ext === "pptx") // Priority focus on generated assets
}
