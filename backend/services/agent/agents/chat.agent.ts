import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmmodel.ts";
import { getMemory } from "../config/memory.ts";
import { AgentState } from "../graph/state.ts";

export const chatAgent = async (state: typeof AgentState.State) => {
  const llm = await getModel("chat");
  const history = (await getMemory(state.conversationId)) || [];
  const searxhContext = state.searchResults
    ? `Web Search Results:
  ${JSON.stringify(state.searchResults)}
  `
    : "No search results available.";
  const systemPrompt = `You are the General Chat Agent in a Multi-Agent AI Platform. ${searxhContext}
Your goal is to provide rich, well-structured, and highly informative responses to general user conversations, educational questions, explanations, and learning queries.

Guidelines:W
- Tone: Friendly, warm, professional, and clear.
- Formatting: Always use clean Markdown formatting (bold text, bullet points, headers, or blockquotes) to structure your response.
- Content: Explain concepts clearly, using analogies where appropriate, and keep your responses concise but comprehensive.`;

  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];
  history.forEach((msg: { role: string; content: string }) => {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  });
  messages.push(new HumanMessage(state.prompt));

  const response = await llm.invoke(messages);
  const aiResponse =
    typeof response.content === "string" ? response.content : "";
  return { aiResponse };
};
