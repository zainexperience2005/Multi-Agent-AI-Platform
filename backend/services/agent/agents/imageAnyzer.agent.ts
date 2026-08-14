import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import { getModel } from "../config/llmmodel.ts";
import type { AgentState } from "../graph/state.ts";
import fs from "fs";

export const imageAnalyzer = async (state: typeof AgentState.State) => {
  try {
    if (!state.file?.path) {
      throw new Error("No image file provided for analysis.");
    }

    const model = await getModel("imageAnalyzer");
    const imageBuffer = fs.readFileSync(state.file.path);
    const imageBase64 = imageBuffer.toString("base64");

    const messages = [
      new SystemMessage(
        `You are image Anlyzer agent.
        Rules:
        
        - Analyze uploaded image and answer the user's question about the image.
        - if text present in image Extract the text.
        
        if charts or tables present in image Summarize the data in tabular format.
        use markdown when helpful.
        do not hallucinate. if you dont know answer say you dont know.
        `,
      ),
      new HumanMessage({
        content: [
          {
            type: "text",
            text: state.prompt || "Analyze this image",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:${state.file.mimetype};base64,${imageBase64}`,
            },
          },
        ],
      }),
    ];

    const response = await model.invoke(messages);
    return { aiResponse: response.content };
  } catch (error: any) {
    console.error("Image analyzer error:", error);
    return {
      aiResponse: `Error analyzing image: ${error.message || error}`,
    };
  } finally {
    if (state.file?.path && fs.existsSync(state.file.path)) {
      try {
        fs.unlinkSync(state.file.path);
        console.log(`Successfully unlinked temp file: ${state.file.path}`);
      } catch (err) {
        console.error(`Failed to unlink file at ${state.file.path}:`, err);
      }
    }
  }
};
