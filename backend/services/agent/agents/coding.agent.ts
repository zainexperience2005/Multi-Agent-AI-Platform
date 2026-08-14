import { getModel } from "../config/llmmodel.ts";
import { AgentState } from "../graph/state.ts";

export const codingAgent = async (state: typeof AgentState.State) => {
  const intentllm = await getModel("intent");
  const codingllm = await getModel("coding");

  const intetntRes = await intentllm.invoke(`
    You are an intent Classifier.
    Return only one of these values.
    CODE_GENERATION
    CODE_REVIEW
    CODE_EXPLANATION
    DEBUG
    OPTIMIZE
    DOCUMENTATION
    TESTING

    User Request:
    ${state.prompt}
    `);

  const intent =
    typeof intetntRes.content === "string"
      ? intetntRes.content.trim().toUpperCase()
      : "";

  if (intent.includes("CODE_GENERATION")) {
    const prompt = `You are Coding agent.
    Generate the requested project.
    Default stack:
    HTML,CSS, javascript
    Using react/Next.js / vue only if explicitly requested
    Rules:
    - Clean and maintainable code
    - Include comments and explanations
    - Provide usage examples
    - Optimize for performance and scalability
    Return only valid json.
    Schema:
    {
    "files": [
      {
        "name": "index.html",
        "content": "file content"
      },
      {
        "name": "style.css",
        "content": "file content"
      },
      {
        "name": "script.js",
        "content": "file content"
      }
    ]
  }
    Rules:
    output must start with {
    output must end with }
    No markdown
    no explanation
    no extra text
    No\`\`\`
    Never mention intent
    User Request:
    ${state.prompt}
    `;

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

  const res = await codingllm.invoke(`
  The user request is:
  ${intent}
  Return Markdown only Never generate project files
  use headings like:
  #overview
  ##Explanation
  ${state.prompt}
  `);

  const data = typeof res.content === "string" ? res.content : "";
  return {
    aiResponse: data,
    artifacts: [],
  };
};
