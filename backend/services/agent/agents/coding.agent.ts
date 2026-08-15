import { getModel } from "../config/llmmodel.ts";
import { AgentState } from "../graph/state.ts";

export const codingAgent = async (state: typeof AgentState.State) => {
  const intentllm = await getModel("intent");
  const codingllm = await getModel("coding");

  const intetntRes = await intentllm.invoke(`
    You are an intent Classifier.
    Analyze the User Request below and classify the intent into exactly one of these categories:
    CODE_GENERATION: If the user wants a new app, new component, or to build a new script/page from scratch.
    CODE_REVIEW: If the user wants feedback on existing code.
    CODE_EXPLANATION: If the user asks how a piece of code works.
    DEBUG: If the user has an error or bug and wants to fix it.
    OPTIMIZE: If the user wants to make their code faster or more efficient.
    DOCUMENTATION: If the user wants docstrings, comments, or a README/API guide.
    TESTING: If the user wants unit tests or integration tests.

    Rules:
    - Respond with ONLY the category name (e.g., CODE_GENERATION).
    - Do NOT include any quotes, markdown backticks, explanation, or extra text.

    User Request:
    ${state.prompt}
    `);

  const intent =
    typeof intetntRes.content === "string"
      ? intetntRes.content.trim().toUpperCase()
      : "";

  if (intent.includes("CODE_GENERATION")) {
    const prompt = `You are a Coding Agent in a Multi-Agent AI Platform.
Your goal is to generate clean, professional, fully functioning code for the user's project request.

Default Tech Stack:
- Core structure: HTML
- Styling: CSS (design a beautiful, premium visual interface)
- Logic: Vanilla JavaScript
- Frameworks (React, Next.js, Vue): Use ONLY if explicitly requested by the user.

Key Architecture Rules:
1. Ensure all files generated integrate seamlessly (e.g., HTML references style.css and script.js correctly).
2. Write clean, modular, and well-commented code.
3. Optimize for performance, readability, and responsiveness.

Format Requirement:
You must return ONLY a valid JSON object matching the schema below. No explanation, no markdown wraps, and no markdown code blocks (\`\`\`json). Just raw JSON starting with '{' and ending with '}'.

JSON Schema:
{
  "files": [
    {
      "name": "filename (e.g., index.html)",
      "content": "Full source code of the file"
    }
  ]
}

User Request:
${state.prompt}`;

    const res = await codingllm.invoke(prompt);
    const contentStr = typeof res.content === "string" ? res.content : "";

    // Safely extract JSON block between first '{' and last '}'
    const cleanJSON = (text: string) => {
      const match = text.match(/\{[\s\S]*\}/);
      return match ? match[0] : text;
    };

    let data;
    try {
      data = JSON.parse(cleanJSON(contentStr));
    } catch (e) {
      console.error("Failed to parse code generation JSON:", e);
      data = { files: [] };
    }

    return {
      aiResponse: "code generated successfully",
      artifacts: [
        {
          id: Date.now().toString(),
          type: "Project",
          files: data.files || [],
        },
      ],
    };
  }

  const prompt = `You are a Senior Software Engineer.
Your task is to perform a coding analysis: ${intent}

User Request:
${state.prompt}

Guidelines:
- Return ONLY markdown response. Do NOT generate project JSON structures or full download files.
- Structure your response using clean markdown headings (e.g., # Overview, ## Explanation, ## Recommendations, ## Improved Code).
- Provide detailed analysis, security checks, and code snippets demonstrating your solution where appropriate.`;

  const res = await codingllm.invoke(prompt);

  const data = typeof res.content === "string" ? res.content : "";
  return {
    aiResponse: data,
    artifacts: [],
  };
};
