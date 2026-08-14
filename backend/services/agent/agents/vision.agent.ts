import axios from "axios"
import { getModel } from "../config/llmmodel.ts"
import { AgentState } from "../graph/state.ts"
import { uploadFileToS3 } from "../utils/uploadtos3.ts"
import { getFromS3 } from "../utils/getFroms3.ts"
import { RunnableLambda } from "@langchain/core/runnables"
import { ChatPromptTemplate } from "@langchain/core/prompts"

export const visionAgent = async (state: typeof AgentState.State) => {
  try {
    const llm = await getModel("vision")

    // 1. Define prompt template for prompt enhancement
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an AI prompt engineer specializing in image generation. Take the user's description and expand it into a detailed, vivid, and descriptive prompt for an image generation model. Focus on style, lighting, composition, and specific details. Only return the enhanced prompt text, without any introductory or concluding text."
      ],
      ["user", "{input}"]
    ])

    // 2. Define the image generation and S3 upload lambda step
    const imageGenerator = new RunnableLambda({
      func: async (enhancedPrompt: string) => {
        const apiKey = process.env.GOOGLE_API_KEY?.replace(/^"|"$/g, "")
        if (!apiKey) {
          throw new Error("GOOGLE_API_KEY is not defined in the environment.")
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-image:generateContent?key=${apiKey}`
        
        let response
        let retries = 3
        let delay = 2000
        
        while (retries > 0) {
          try {
            response = await axios.post(url, {
              contents: [
                {
                  parts: [
                    {
                      text: `Generate an image based on this description: ${enhancedPrompt}`
                    }
                  ]
                }
              ]
            })
            break // Success
          } catch (err: any) {
            if (err.response?.status === 429 && retries > 1) {
              console.warn(`Gemini rate limited (429). Retrying in ${delay}ms...`)
              await new Promise((res) => setTimeout(res, delay))
              retries--
              delay *= 2 // Exponential backoff
            } else {
              throw err
            }
          }
        }

        if (!response) {
          throw new Error("Failed to receive response from Gemini image generation model.")
        }

        const part = response.data.candidates?.[0]?.content?.parts?.[0]
        if (!part?.inlineData?.data) {
          const errorMsg = response.data.error?.message
          throw new Error(errorMsg || "No image data returned from Gemini model.")
        }

        const mimeType = part.inlineData.mimeType || "image/png"
        const buffer = Buffer.from(part.inlineData.data, "base64")

        // Upload to S3 bucket
        const filename = `generated-images/image-${Date.now()}.png`
        await uploadFileToS3(filename, buffer, mimeType)

        // Get a signed download URL
        const downloadUrl = await getFromS3(filename, 24 * 60 * 60)
        return { downloadUrl, enhancedPrompt }
      }
    })

    // 3. Chain components using LangChain pipe (|) syntax
    const chain = prompt
      .pipe(llm)
      .pipe(
        new RunnableLambda({
          func: (output: any) => {
            return typeof output.content === "string" ? output.content.trim() : ""
          }
        })
      )
      .pipe(imageGenerator)

    // 4. Invoke the LangChain runnable chain
    const result = await chain.invoke({ input: state.prompt })

    return {
      aiResponse: `Image generated successfully for: "${result.enhancedPrompt}"`,
      images: [result.downloadUrl]
    }
  } catch (error: any) {
    console.error("Vision agent error:", error)
    return {
      aiResponse: `Sorry, I encountered an error while generating your image: ${error.message || error}`,
      images: []
    }
  }
}
export default visionAgent
