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
  const messages = `You are an agent router.
     Available agents: chat, search, coding, pdf, ppt, vision.
     Rules: 
     chat: General Conversations, explanations, learning, questions.
     search: current events, weather, news, recent developments, live information, internet, web lookup.
     coding: Generate code, debug code, build projects, architecture, API design.
     pdf: Questions about generating pdfs or document context.
     ppt: Questions about generating presentations.
     vision: Questions about generating images or photos.
     
     Return only one word: the name of the agent.
     
     User Query: ${state.prompt}`;

  const response = await llm.invoke(messages);
  console.log({ routerResponse: response });

  const content =
    typeof response.content === "string"
      ? response.content.trim().toLowerCase()
      : "";

  return { agent: content || "chat" };
};
