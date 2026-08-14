import { AgentState } from "../graph/state.ts";
import { searchTool } from "../graph/tools/search-tool.ts";

export const searchAgent = async (state: typeof AgentState.State) => {
  const response = await searchTool.invoke({
    query: state.prompt,
  });
  return {
    ...state,
    searchResults: response.results || [],
    images: response.images || [],
  };
};
