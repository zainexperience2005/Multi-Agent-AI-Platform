import React, { useState, useEffect } from "react"
import {
  X,
  Code,
  Eye,
  Download,
  ExternalLink,
  FileText,
  Presentation,
  FolderOpen,
  Copy,
  Check,
  Maximize2
} from "lucide-react"
import CodeMirror from "@uiw/react-codemirror"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export interface FileArtifact {
  name: string;
  content: string;
}

export interface ArtifactData {
  id: string;
  type: "Project" | "File";
  title: string;
  files?: FileArtifact[];
  url?: string;
  extension?: "pdf" | "pptx";
}

interface ArtifactPanelProps {
  artifact: ArtifactData | null
  onClose: () => void
}

export const ArtifactPanel: React.FC<ArtifactPanelProps> = ({ artifact, onClose }) => {
  const [activeTab, setActiveTab] = useState<"code" | "preview" | "view">("code")
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  // Reset tab and file index when artifact changes
  useEffect(() => {
    if (artifact) {
      if (artifact.type === "File") {
        setActiveTab("view")
      } else {
        setActiveTab("code")
      }
      setSelectedFileIdx(0)
    }
  }, [artifact])

  if (!artifact) return null

  const files = artifact.files || []
  const activeFile = files[selectedFileIdx]
  const isCodeProject = artifact.type === "Project"
  const isPDF = artifact.extension === "pdf"
  const isPPT = artifact.extension === "pptx"

  const handleCopy = () => {
    if (activeFile) {
      navigator.clipboard.writeText(activeFile.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Helper to compile CSS & JS from project files directly into index.html for live iframe previews
  const generatePreviewDoc = () => {
    const htmlFile = files.find((f) => f.name.endsWith(".html")) || files[0]
    if (!htmlFile) return ""

    let htmlContent = htmlFile.content

    // Inline CSS files
    files.forEach((f) => {
      if (f.name.endsWith(".css")) {
        const fileName = f.name.split("/").pop() || f.name
        const linkRegex = new RegExp(`<link[^>]*href=["'][^"']*${fileName}["'][^>]*>`, "g")
        if (linkRegex.test(htmlContent)) {
          htmlContent = htmlContent.replace(linkRegex, `<style>${f.content}</style>`)
        } else {
          htmlContent = htmlContent.replace("</head>", `<style>${f.content}</style></head>`)
        }
      }
    })

    // Inline JS files
    files.forEach((f) => {
      if (f.name.endsWith(".js") || f.name.endsWith(".jsx")) {
        const fileName = f.name.split("/").pop() || f.name
        const scriptRegex = new RegExp(`<script[^>]*src=["'][^"']*${fileName}["'][^>]*><\/script>`, "g")
        if (scriptRegex.test(htmlContent)) {
          htmlContent = htmlContent.replace(scriptRegex, `<script>${f.content}</script>`)
        } else {
          htmlContent = htmlContent.replace("</body>", `<script>${f.content}</script></body>`)
        }
      }
    })

    return htmlContent
  }

  return (
    <div className="w-[45%] border-l border-slate-800 bg-slate-950 flex flex-col h-full relative z-20 overflow-hidden shadow-2xl">
      {/* Glow animations */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />

      {/* Artifact Panel Header */}
      <header className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md">
        <div className="flex items-center gap-2.5 min-w-0">
          {isCodeProject ? (
            <Code className="h-5 w-5 text-emerald-400 shrink-0" />
          ) : isPDF ? (
            <FileText className="h-5 w-5 text-cyan-400 shrink-0" />
          ) : (
            <Presentation className="h-5 w-5 text-rose-400 shrink-0" />
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-slate-100 truncate tracking-wide">
              {artifact.title}
            </h3>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider block">
              {isCodeProject ? "Interactive Code Artifact" : isPDF ? "PDF Document Preview" : "Slide Presentation Preview"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Download button for static S3 links */}
          {artifact.url && (
            <a
              href={artifact.url}
              download
              target="_blank"
              rel="noreferrer"
              className="flex h-9 items-center justify-center gap-2 px-3 border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900 rounded-lg text-xs font-semibold text-slate-300 hover:text-slate-100 active:scale-95 transition-all"
              title="Download File"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          )}
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-200 cursor-pointer p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
          >
            <X className="h-4.5 w-4.5" />
          </button>
        </div>
      </header>

      {/* Toggles for Code vs Preview (Projects) / presentation toggle (Slides) */}
      {isCodeProject && (
        <div className="flex px-6 py-2 border-b border-slate-900 bg-slate-950/20 gap-2 shrink-0">
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
              activeTab === "code"
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Source Code
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 cursor-pointer ${
              activeTab === "preview"
                ? "bg-emerald-600/20 text-emerald-400 border-emerald-500/40"
                : "bg-transparent text-slate-400 border-transparent hover:text-slate-200"
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            Live Preview
          </button>
        </div>
      )}

      {/* Main Panel Viewport */}
      <div className="flex-1 min-h-0 bg-slate-950/40 relative">
        {activeTab === "code" && isCodeProject && (
          <div className="flex h-full min-h-0 overflow-hidden">
            {/* Folder explorer sidebar */}
            <div className="w-48 bg-slate-950/60 border-r border-slate-800/80 p-2 overflow-y-auto shrink-0 space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider px-2.5 py-1.5">
                <FolderOpen className="h-3.5 w-3.5" />
                Workspace Files
              </div>
              {files.map((file, idx) => {
                const isSelected = idx === selectedFileIdx
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedFileIdx(idx)}
                    className={`w-full text-left truncate px-2.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors block ${
                      isSelected
                        ? "bg-slate-900 text-slate-100 border border-slate-800"
                        : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
                    }`}
                    title={file.name}
                  >
                    📄 {file.name.split("/").pop()}
                  </button>
                )
              })}
            </div>

            {/* CodeEditor Content */}
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              {/* File details banner */}
              <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-[10px] text-slate-400 font-mono border-b border-slate-800/80 shrink-0">
                <span>{activeFile?.name}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 hover:text-slate-200 font-sans cursor-pointer text-emerald-400 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {/* CodeMirror rendering component */}
              <div className="flex-1 overflow-auto bg-slate-950 select-text">
                <CodeMirror
                  value={activeFile?.content || ""}
                  theme="dark"
                  editable={false}
                  readOnly={true}
                  basicSetup={{
                    lineNumbers: true,
                    foldGutter: true,
                    highlightActiveLine: false,
                  }}
                  className="h-full text-xs font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* Live Iframe Sandbox Preview Tab */}
        {activeTab === "preview" && isCodeProject && (
          <div className="w-full h-full p-4 bg-slate-950/20">
            <Card className="w-full h-full border border-slate-800 rounded-xl overflow-hidden bg-slate-950 flex flex-col">
              {/* Sandbox Top Window bar decoration */}
              <div className="h-9 bg-slate-900 border-b border-slate-800 flex items-center px-4 justify-between text-[11px] text-slate-500 font-mono">
                <div className="flex gap-1.5 items-center">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                </div>
                <span>Nexus Localhost Sandbox</span>
                <span />
              </div>
              {/* Iframe Viewport */}
              <iframe
                srcDoc={generatePreviewDoc()}
                title="Code Sandbox Preview"
                sandbox="allow-scripts"
                className="w-full flex-1 bg-white border-none"
              />
            </Card>
          </div>
        )}

        {/* Embedded PDF Viewer Tab */}
        {activeTab === "view" && isPDF && artifact.url && (
          <div className="w-full h-full p-4 bg-slate-950/20">
            <Card className="w-full h-full border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <iframe
                src={`${artifact.url}#toolbar=0&navpanes=0`}
                className="w-full h-full border-none bg-slate-900"
                title="PDF Document"
              />
            </Card>
          </div>
        )}

        {/* Microsoft Office Online Slides Viewer for PPTX files */}
        {activeTab === "view" && isPPT && artifact.url && (
          <div className="w-full h-full p-4 bg-slate-950/20 flex flex-col gap-3">
            <Card className="w-full flex-1 border border-slate-800 rounded-xl overflow-hidden bg-slate-950">
              <iframe
                src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(artifact.url)}`}
                className="w-full h-full border-none bg-slate-900"
                title="PPTX Presentation Slides"
              />
            </Card>
            <div className="flex justify-between items-center px-2">
              <p className="text-[10px] text-slate-500 font-medium">
                Tip: If the preview fails to load, you can download the PPTX file directly to view locally.
              </p>
              <a
                href={artifact.url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1"
              >
                <Maximize2 className="h-3 w-3" />
                Open File
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
export default ArtifactPanel
