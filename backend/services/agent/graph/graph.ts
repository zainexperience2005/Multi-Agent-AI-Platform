import { StateGraph, END, START } from "@langchain/langgraph";
import { AgentState } from "./state.ts";
import { chatAgent } from "../agents/chat.agent.ts";
import { searchAgent } from "../agents/search.agent.ts";
import { codingAgent } from "../agents/coding.agent.ts";
import { pdfAgent } from "../agents/pdf.agent.ts";
import { pptAgent } from "../agents/ppt.agent.ts";
import { visionAgent } from "../agents/vision.agent.ts";
import { pdfRag } from "../agents/pdfRag.agent.ts";
import { imageAnalyzer } from "../agents/imageAnyzer.agent.ts";
import { router } from "./router.ts";

export const graph = new StateGraph(AgentState)
  .addNode("chat", chatAgent)
  .addNode("search", searchAgent)
  .addNode("coding", codingAgent)
  .addNode("pdf", pdfAgent)
  .addNode("ppt", pptAgent)
  .addNode("vision", visionAgent)
  .addNode("router", router)
  .addNode("pdfRag", pdfRag)
  .addNode("imageAnalyzer", imageAnalyzer)
  .addEdge(START, "router")
  .addConditionalEdges(
    "router",
    (state) => {
      switch (state.agent) {
        case "chat":
          return "chat";
        case "search":
          return "search";
        case "coding":
          return "coding";
        case "pdf":
          return "pdf";
        case "ppt":
          return "ppt";
        case "pdfRag":
          return "pdfRag";
        case "vision":
          return "vision";
        case "imageAnalyzer":
          return "imageAnalyzer";
        default:
          return END;
      }
    },
    {
      chat: "chat",
      search: "search",
      coding: "coding",
      pdf: "pdf",
      ppt: "ppt",
      pdfRag: "pdfRag",
      vision: "vision",
      imageAnalyzer: "imageAnalyzer",
    },
  )
  .addEdge("search", "chat")
  .addEdge("chat", END)
  .addEdge("coding", END)
  .addEdge("pdf", END)
  .addEdge("ppt", END)
  .addEdge("pdfRag", END)
  .addEdge("vision", END)
  .addEdge("imageAnalyzer", END)
  .compile();
