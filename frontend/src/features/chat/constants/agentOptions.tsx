import React from "react"
import {
  Bot,
  Code,
  FileText,
  FileSpreadsheet,
  Search,
  Eye
} from "lucide-react"
import { type AgentOption } from "../types"

export const AGENT_OPTIONS: AgentOption[] = [
  {
    id: "chat",
    name: "General AI Mode",
    description: "Standard chat mode for questions, coding help, analysis, and general dialogue.",
    icon: <Bot className="h-4 w-4" />,
    color: "bg-indigo-500/10 text-indigo-400 border-indigo-500/25"
  },
  {
    id: "coding",
    name: "Coding Architect",
    description: "Specialized in generating files, projects, code optimization, and architecture mapping.",
    icon: <Code className="h-4 w-4" />,
    color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
  },
  {
    id: "pdf",
    name: "Report Builder",
    description: "Generates fully formatted PDF report documents based on your requirements.",
    icon: <FileText className="h-4 w-4" />,
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
