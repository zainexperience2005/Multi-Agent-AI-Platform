import { AgentState } from "../graph/state.ts";
import { searchTool } from "../graph/tools/search-tool.ts";

/**
 * Web Search Agent: Executes Google/Tavily search requests to retrieve 
 * live contextual information to enhance general agent prompts.
 * 
 * @param {typeof AgentState.State} state - Current graph state containing user prompt
 * @returns {Promise<Partial<typeof AgentState.State>>} State slice update containing search results and related image links
 */
export const searchAgent = async (state: typeof AgentState.State) => {
  // Query web search tools using the current prompt string
  const response = await searchTool.invoke({
    query: state.prompt,
  });
  // Return updated state keys containing results lists
  return {
    ...state,
    searchResults: response.results || [],
    images: response.images || [],
  };
};
