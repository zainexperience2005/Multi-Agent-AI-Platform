import { getModel } from "../config/llmmodel.ts";
import { AgentState } from "./state.ts";

export const router = async (state: typeof AgentState.State) => {
  if (state.agent && state.agent !== "auto") {
    return { agent: state.agent };
  }

  const llm = await getModel("router");
  const messages = `You are an agent router.
    Available agents: chat, search, coding, pdf, ppt, vision.
     Rules: 
     chat: General Conversations, explanations,learning, questions.
      search:current events, news, recent developments, internet,web lookup
       coding: Generate code, debug code, build projects, architecture, API design.
        pdf: Questions about generate pdfs or document context.
         ppt: Questions about generate presentations.
          vision: Questions about generate images or photos .
           Return only one word: the name of the agent.
            
            User Query ${state.prompt}`;
  const response = await llm.invoke(messages);
  console.log({ response });

  const content = typeof response.content === "string" ? response.content : "";
  return { agent: content.trim().toLowerCase() };
};
