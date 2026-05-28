import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper for lazy loading Gemini API Client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is not configured in the Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// 1. Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 2. Chat with Gateway Assistant using real Gemini API
app.post("/api/gateway/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Missing or invalid 'messages' array in request body." });
    }

    const ai = getGeminiClient();

    // Map message roles so they are compatible with @google/genai formats
    // Gemini role must be either 'user' or 'model'
    const formattedHistory = messages.map(msg => {
      const gRole = msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user';
      return {
        role: gRole,
        parts: [{ text: msg.content }]
      };
    });

    const systemInstruction = `You are the chief AI Architect and Engineer of Agent Gateway (also known as Agent PitStop).
Agent Gateway is a modern, light-weight, high-performance control plane proxy positioned active between AI Agents (CrewAI, LangChain, AutoGen) and LLM providers.

Its core architecture is governed by two complementary phases, referred to as the "Wax and Wash" loop:
1. "Semantic Waxing" (Prompt Injection/Enrichment):
   Before an agent's request hits the standard LLM provider, Agent Gateway intercepts it. It automatically runs a semantic vector similarity search via pgvector on a database (using memories.sql schema) to find relevant policies, guardrails, historical lessons, or security constraints matching the current user-intent. It dynamically injects these into the system prompt of the LLM as 'AGENT PITSTOP GUARDRAILS' block.
2. "Execution Washing" (Telemetry and Tracing):
   Once the model responds, the Gateway asynchronously captures the response and full trace context (prompt history, outcome, token metrics). It streams this back to the clean vector database to create a continuous reinforcement learning loop.

You are highly technical, professional, and friendly. Answer questions about the provided Python and SQL code blocks:
- docker-compose.yml: Runs pgvector database and Python services.
- Dockerfile: Slim container setup for the agent code.
- app/main.py: App entry point using PitStopOpenAI wrapper.
- app/config.py: Settings modeling via Pydantic.
- app/requirements.txt: App deps (httpx, openai, pydantic-settings, python-dotenv).
- app/middleware/pitstop.py: Contains PitStopOpenAI, inheriting from standard OpenAI library, and overrides chat_completions_create to handle both the sync _intercept_and_wax() and async _async_wash_pipeline() traces.
- app/schemas/memories.sql: pgvector table structure for 'public.agent_memories'.

Keep answers crisp, conversational, and direct. Code examples of extending the wrapper to other wrappers are highly welcomed.`;

    const chatHistory = [...formattedHistory];
    const lastMsg = chatHistory.pop();

    if (!lastMsg) {
      return res.status(400).json({ error: "Empty messages list." });
    }

    // Convert the previous messages to the correct form for chat
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...chatHistory,
        { role: lastMsg.role, parts: lastMsg.parts }
      ],
      config: {
        systemInstruction: systemInstruction,
      },
    });

    res.json({
      role: "model",
      content: response.text || "I was unable to generate a response at this time.",
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error("Gemini Chat API Error:", err);
    res.status(500).json({
      error: err.message || "An error occurred with the Gemini API.",
      isConfigError: err.message?.includes("GEMINI_API_KEY")
    });
  }
});

// 3. Simulate real semantic waxing prompt injection with actual LLM generation
app.post("/api/gateway/simulate", async (req, res) => {
  try {
    const { task, selectedPolicies, customModel } = req.body;

    if (!task) {
      return res.status(400).json({ error: "Task description is required." });
    }

    const ai = getGeminiClient();

    // Prepare simulated pgvector retrieval times
    const simRecallStart = Date.now();
    const retrievedPolicies = selectedPolicies && selectedPolicies.length > 0 
      ? selectedPolicies 
      : ["No custom policies matches found."];
    
    const recallLatencyMs = Math.floor(Math.random() * 45) + 12; // 12-57ms database call simulation

    // Construct the waxed system block resembling pitstop.py
    const memoryBlock = "\n### AGENT PITSTOP GUARDRAILS:\n" + retrievedPolicies.map((p: string) => `- ${p}`).join("\n");
    const waxedSystemPrompt = `You are simulated running as the LLM inside the Agent Gateway proxy. 
Your active task request from the AI Agent is:
"${task}"

However, you must strictly follow the injected guardrails and policies retrieved from the memory bank:
${memoryBlock}

Provide a direct, compliant response to the task that explicitly reflects adherence to these corporate/agent policies. Keep the answer professional and tailored to the task context.`;

    const modelGenerationStart = Date.now();
    
    // Call Gemini to generate the actual response satisfying the guardrails! 
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: waxedSystemPrompt,
      config: {
        temperature: 0.7,
      }
    });

    const modelLatencyMs = Date.now() - modelGenerationStart;
    const totalLatencyMs = recallLatencyMs + modelLatencyMs;

    const generatedText = response.text || "Execution finished with no output.";
    
    // Estimate token sizing
    const responseTokens = Math.floor(generatedText.length / 4);
    const inputTokens = Math.floor((waxedSystemPrompt.length + task.length) / 4);
    const totalTokens = inputTokens + responseTokens;
    // Estimate pricing
    const costSimulated = (inputTokens * 0.000000075) + (responseTokens * 0.0000003);

    const trace = {
      id: "trace_" + Math.random().toString(36).substring(2, 11),
      timestamp: new Date().toISOString(),
      task: task,
      model: customModel || "gemini-3.5-flash",
      policiesApplied: retrievedPolicies,
      originalPrompt: task,
      waxedPrompt: `[System Block injected via pgvector]\n${memoryBlock}\n\n[User Prompt]\n${task}`,
      response: generatedText,
      status: "success",
      latencyMs: totalLatencyMs,
      tokensUsed: totalTokens,
      costSimulated: parseFloat(costSimulated.toFixed(6))
    };

    res.json({
      trace,
      databaseRecallMs: recallLatencyMs
    });

  } catch (err: any) {
    console.error("Simulation API Error:", err);
    res.status(500).json({
      error: err.message || "An error occurred during simulation.",
      isConfigError: err.message?.includes("GEMINI_API_KEY")
    });
  }
});

// Setup Vite & static serving
async function startViteMiddleware() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startViteMiddleware();
