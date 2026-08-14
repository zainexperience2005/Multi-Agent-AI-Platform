import React, { useState, useEffect, useRef } from "react"
import { Send, Paperclip, X, Loader2, Bot } from "lucide-react"
import { getMessages, sendAgentMessage, type Message } from "../api/chatApi"
import { type ArtifactData } from "./ArtifactPanel"
import { AGENT_OPTIONS as AGENTS } from "../constants/agentOptions"
import { MessageItem } from "./MessageItem"
import { Button } from "@/components/ui/button"

interface ChatAreaProps {
  conversationId: string;
  conversationTitle: string;
  onOpenArtifact: (artifact: ArtifactData | null) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversationId,
  conversationTitle,
  onOpenArtifact
}) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [selectedAgent, setSelectedAgent] = useState<string>("chat")
  const [loading, setLoading] = useState(false)
  const [fetchingMessages, setFetchingMessages] = useState(true)
  const [attachedFile, setAttachedFile] = useState<File | null>(null)

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
      if (
        (selectedAgent === "vision" || selectedAgent === "imageAnalyzer") &&
        !file.type.startsWith("image/")
      ) {
        alert("Please select an image file.")
        return
      }
      if (
        selectedAgent === "chat" &&
        file.type !== "application/pdf" &&
        !file.type.startsWith("image/")
      ) {
        alert("Please select either a PDF document or an image file.")
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

    let finalPrompt = userPrompt
    if (attachedFile && !attachedFile.type.startsWith("image/")) {
      finalPrompt = `📎 Attached File: ${attachedFile.name}\n\n${userPrompt}`
    }

    // Optimistically add user message in frontend UI
    const tempUserMsg: Message = {
      conversationId,
      role: "user",
      content: finalPrompt,
      images: attachedFile && attachedFile.type.startsWith("image/")
        ? [URL.createObjectURL(attachedFile)]
        : undefined
    }
    setMessages((prev) => [...prev, tempUserMsg])

    const fileToUpload = attachedFile
    setAttachedFile(null)

    // Call Backend Agent Service via Gateway
    const response = await sendAgentMessage(conversationId, finalPrompt, selectedAgent, fileToUpload)

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

  const currentAgent = AGENTS.find((a) => a.id === selectedAgent) || AGENTS[0]

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950 relative overflow-hidden">
      {/* Background radial gradients for clean premium tech aesthetics */}
      <div className="absolute top-0 right-1/4 h-96 w-96 rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Dynamic Agent Selector Row */}
      <div className="border-b border-slate-800/80 px-6 py-3 bg-slate-950/40 backdrop-blur-md z-10 flex flex-wrap items-center justify-between gap-4 shrink-0">
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
              <h3 className="text-base font-bold text-slate-200">Start a new discussion</h3>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                Choose an agent category above, attach any necessary files, and ask your query below.
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
        <div ref={messagesEndRef} />
      </div>

      {/* Active typing loader indicator */}
      {loading && (
        <div className="px-6 py-2 shrink-0 flex items-center gap-2 text-slate-400 text-xs font-medium bg-slate-950/20">
          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
          <span>Nexus workflow nodes executing, generating response...</span>
        </div>
      )}

      {/* Footer Textarea Input Box */}
      <footer className="p-6 border-t border-slate-900 bg-slate-950/40 backdrop-blur-md shrink-0">
        <form onSubmit={handleSend} className="relative bg-slate-900 border border-slate-800 focus-within:border-indigo-500/50 rounded-2xl p-2 transition-colors">
          
          {/* File upload preview box */}
          {attachedFile && (
            <div className="flex items-center justify-between p-2 mb-2 bg-slate-950/60 border border-slate-800 rounded-xl max-w-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold text-indigo-400 shrink-0">📎 File Attached:</span>
                <span className="text-xs text-slate-300 truncate" title={attachedFile.name}>
                  {attachedFile.name}
                </span>
                <span className="text-[10px] text-slate-500 shrink-0">
                  ({(attachedFile.size / 1024).toFixed(1)} KB)
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveAttachment}
                className="text-slate-500 hover:text-slate-200 cursor-pointer p-1 rounded-md hover:bg-slate-900"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          )}

          {/* Actual textarea input */}
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedAgent === "pdf"
                ? "Enter PDF report requirements..."
                : selectedAgent === "ppt"
                ? "What presentation outline or slides should I generate?"
                : selectedAgent === "coding"
                ? "Describe the code/project you want generated..."
                : (selectedAgent === "vision" || selectedAgent === "imageAnalyzer")
                ? "Attach an image and ask a question..."
                : selectedAgent === "pdfRag"
                ? "Attach a PDF and ask questions about its content..."
                : "Ask General AI agent, search, or attach a PDF/Image for automated RAG/analysis routing..."
            }
            className="w-full bg-transparent text-slate-200 placeholder-slate-500 text-xs px-3 py-2 focus:outline-none resize-none min-h-[44px] max-h-[120px] scrollbar-none"
            rows={2}
          />

          {/* Interactive footer action bar */}
          <div className="flex items-center justify-between px-2 pt-2 border-t border-slate-950/40">
            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept={
                  selectedAgent === "pdfRag"
                    ? "application/pdf"
                    : (selectedAgent === "vision" || selectedAgent === "imageAnalyzer")
                    ? "image/*"
                    : selectedAgent === "chat"
                    ? "application/pdf,image/*"
                    : "*/*"
                }
              />
              {/* Only show upload icon for agents that accept file arguments */}
              {(selectedAgent === "pdfRag" || selectedAgent === "vision" || selectedAgent === "imageAnalyzer" || selectedAgent === "coding" || selectedAgent === "chat") && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900 active:scale-95 transition-all cursor-pointer"
                  title="Upload Attachment"
                >
                  <Paperclip className="h-4 w-4" />
                </button>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading || (!input.trim() && !attachedFile)}
              className="flex h-8 items-center justify-center gap-1.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer disabled:opacity-40 disabled:hover:bg-indigo-600 active:scale-95 transition-all"
            >
              <Send className="h-3.5 w-3.5" />
              Send
            </Button>
          </div>
        </form>
      </footer>
    </div>
  )
}
export default ChatArea
