import { Annotation } from "@langchain/langgraph";

export interface AgentFile {
  path: string;
  mimetype: string;
}

export const AgentState = Annotation.Root({
  userId: Annotation<string>(),
  prompt: Annotation<string>(),
  aiResponse: Annotation<string>(),
  agent: Annotation<string>(),
  conversationId: Annotation<string>(),
  searchResults: Annotation<string>(),
  images: Annotation<string[]>(),
  artifacts: Annotation<any[]>(),
  file: Annotation<AgentFile>(),
});
