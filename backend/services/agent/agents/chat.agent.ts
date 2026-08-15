import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from "@langchain/core/messages";
import { getModel } from "../config/llmmodel.ts";
import { getMemory } from "../config/memory.ts";
import { AgentState } from "../graph/state.ts";

/**
 * General Chat Agent: Handles casual conversation, Q&A, and general user interactions.
 * Integrates conversation history from memory and optional web search results.
 * 
 * @param {typeof AgentState.State} state - Current graph state containing prompt and optional search context
 * @returns {Promise<{ aiResponse: string }>} State slice update containing generated AI markdown text
 */
export const chatAgent = async (state: typeof AgentState.State) => {
  // Load standard LLM configured for general chat tasks
  const llm = await getModel("chat");
  // Fetch conversation messages history from memory store
  const history = (await getMemory(state.conversationId)) || [];
  
  // Format web search context if available
  const searchContext = state.searchResults
    ? `[WEB SEARCH CONTEXT]
The following recent information is retrieved from the web:
${JSON.stringify(state.searchResults, null, 2)}`
    : "[WEB SEARCH CONTEXT]\nNo recent web search context is available.";
    
  // Build system prompt injects defining character profile and instructions
  const systemPrompt = `You are the General Chat Agent in a Multi-Agent AI Platform.

${searchContext}

Your goal is to provide rich, well-structured, comprehensive, and highly informative responses to general user conversations, educational questions, technical explanations, and learning queries.

Guidelines:
- Tone: Friendly, warm, professional, and intellectually engaging.
- Formatting: Always use clean, semantic Markdown formatting (bold text, lists, headers, code blocks, or blockquotes) to structure your response.
- Clarity: Explain complex concepts clearly, using helpful analogies where appropriate. Keep responses engaging and structured, avoiding large walls of text.`;

  // Construct standard LangChain message schema structure
  const messages: (SystemMessage | HumanMessage | AIMessage)[] = [
    new SystemMessage(systemPrompt),
  ];
  
  // Append historical messages to maintain conversational flow
  history.forEach((msg: { role: string; content: string }) => {
    if (msg.role === "user") {
      messages.push(new HumanMessage(msg.content));
    } else if (msg.role === "assistant") {
      messages.push(new AIMessage(msg.content));
    }
  });
  
  // Append current user message prompt
  messages.push(new HumanMessage(state.prompt));

  // Dispatch prompt requests to model
  const response = await llm.invoke(messages);
  const aiResponse =
    typeof response.content === "string" ? response.content : "";
  return { aiResponse };
};
