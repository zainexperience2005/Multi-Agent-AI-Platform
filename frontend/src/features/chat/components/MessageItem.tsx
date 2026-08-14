import React from "react"
import { Bot, User as UserIcon, Download, Eye, FolderOpen } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { type Message } from "../api/chatApi"
import { type ArtifactData } from "./ArtifactPanel"
import { extractDownloadLinks } from "../utils/chatUtils"

interface MessageItemProps {
  message: Message;
  onOpenArtifact: (artifact: ArtifactData | null) => void;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message, onOpenArtifact }) => {
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
                  : message.agent === "imageAnalyzer"
                  ? "bg-pink-500/10 text-pink-400 border-pink-500/30"
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
export default MessageItem
