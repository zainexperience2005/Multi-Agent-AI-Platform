import axios from "axios";
import { getModel } from "../config/llmmodel.ts";
import { AgentState } from "../graph/state.ts";
import { uploadFileToS3 } from "../utils/uploadtos3.ts";
import { getFromS3 } from "../utils/getFroms3.ts";
export const visionAgent = async (state: typeof AgentState.State) => {
  try {
    // 1. Enhance the prompt using LLM
    const llm = await getModel("vision");
    const enhancementResponse = await llm.invoke([
      {
        role: "system",
        content:
          "You are an AI prompt engineer specializing in image generation. Take the user's description and expand it into a detailed, vivid, and descriptive prompt for an image generation model. Focus on style, lighting, composition, and specific details. Only return the enhanced prompt text, without any introductory or concluding text.",
      },
      {
        role: "user",
        content: state.prompt,
      },
    ]);

    const contentStr =
      typeof enhancementResponse.content === "string"
        ? enhancementResponse.content
        : Array.isArray(enhancementResponse.content)
          ? enhancementResponse.content
              .map((c) => ("text" in c ? c.text : ""))
              .join("")
          : "";

    const enhancedPrompt = contentStr.trim() || state.prompt;

    // 2. Generate the image using Nano Banana 2 (gemini-3.1-flash-image) model
    const apiKey = process.env.GOOGLE_API_KEY?.replace(/^"|"$/g, "");
    if (!apiKey) {
      throw new Error("GOOGLE_API_KEY is not defined in the environment.");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`;
    const response = await axios.post(url, {
      contents: [
        {
          parts: [
            {
              text: `Generate an image based on this description: ${enhancedPrompt}`,
            },
          ],
        },
      ],
    });

    const part = response.data.candidates?.[0]?.content?.parts?.[0];
    if (!part?.inlineData?.data) {
      // Check if there's an error message in response payload
      const errorMsg = response.data.error?.message;
      throw new Error(
        errorMsg || "No image data returned from Gemini Nano Banana 2 model.",
      );
    }

    const mimeType = part.inlineData.mimeType || "image/png";
    const buffer = Buffer.from(part.inlineData.data, "base64");

    // 3. Upload the generated image to S3
    const filename = `generated-images/image-${Date.now()}.png`;
    await uploadFileToS3(filename, buffer, mimeType);

    // 4. Get the signed download URL from S3 (valid for 24 hours)
    const downloadUrl = await getFromS3(filename, 24 * 60 * 60);

    return {
      ...state,
      aiResponse: `Image generated successfully for: "${enhancedPrompt}"`,
      images: [downloadUrl],
    };
  } catch (error: any) {
    console.error("Vision agent error:", error);
    return {
      ...state,
      aiResponse: `Sorry, I encountered an error while generating your image: ${error.message || error}`,
      images: [],
    };
  }
};
