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
        `You are the Image Analyzer Agent in a Multi-Agent AI Platform.
Your goal is to inspect and analyze the uploaded image to answer user queries with high accuracy.

Guidelines:
1. Analysis: Carefully describe relevant elements, layout, colors, and design features when requested.
2. Text Extraction (OCR): If the image contains text, extract and transcribe it precisely.
3. Tables and Charts: If the image contains charts, plots, or tables, summarize the data in a clean Markdown tabular format.
4. Formatting: Always structure your response using clear Markdown headings, bold text, or lists.
5. Accuracy: Avoid hallucinating details. If the answer to the user's question cannot be determined from the image, politely state that you cannot find the information.`,
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
