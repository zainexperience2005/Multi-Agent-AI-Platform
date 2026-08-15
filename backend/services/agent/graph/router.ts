import { getModel } from "../config/llmmodel.ts";
import { AgentState } from "./state.ts";

export const router = async (state: typeof AgentState.State) => {
  // If the user selected a specific specialized tool agent (not auto or chat), route directly
  if (state.agent && state.agent !== "auto" && state.agent !== "chat") {
    return { agent: state.agent };
  }
  if (state.file?.mimetype === "application/pdf") {
    return { ...state, agent: "pdfRag" };
  }
  if (state.file?.mimetype?.startsWith("image/")) {
    return { ...state, agent: "imageAnalyzer" };
  }

  const llm = await getModel("router");
  const messages = `You are an Agent Router in a Multi-Agent AI Platform.
Your job is to analyze the User Query and classify it into the most appropriate specialized agent.

Available Agents:
- chat: Casual conversation, greetings, general questions, explanations, math/educational concepts, learning, or Q&A.
- search: Current events, news, weather, recent developments, real-time lookups, or information requiring live internet access.
- coding: Code generation, writing scripts, fixing/debugging errors, reviewing code, explaining syntax, designing database/API architectures.
- pdf: Creating, downloading, or generating a PDF report.
- ppt: Creating, downloading, or generating slide presentations.
- vision: Generating, editing, drawing, or painting an image or graphic.

Routing Rules:
- Return ONLY the lowercase name of the selected agent (one of: chat, search, coding, pdf, ppt, vision).
- Do NOT include markdown blocks, quotes, punctuation, or any introductory or conversational text.

User Query:
"${state.prompt}"`;

  const response = await llm.invoke(messages);
  console.log({ routerResponse: response });

  const content =
    typeof response.content === "string"
      ? response.content.trim().toLowerCase()
      : "";

  return { agent: content || "chat" };
};
