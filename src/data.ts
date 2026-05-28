import { ProjectFile, Policy } from "./types";

export const INITIAL_FILES: ProjectFile[] = [
  {
    name: "pitstop.py",
    path: "app/middleware/pitstop.py",
    language: "python",
    content: `import httpx
from openai import OpenAI
from typing import List, Dict, Any

class PitStopOpenAI(OpenAI):
    def __init__(self, pitstop_api_key: str, fleet_id: str, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.pitstop_key = pitstop_api_key
        self.fleet_id = fleet_id
        self.pitstop_url = "https://api.agentpitstop.com/v1"
        self.http_client = httpx.Client()

    def _intercept_and_wax(self, messages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Intercept outbound prompt, execute semantic similarity search via vector DB
        to find fleet guardrails, policies, warnings, and dynamically inject them.
        """
        try:
            if not messages:
                return messages
            user_intent = messages[-1].get("content", "")
            response = self.http_client.get(
                f"{self.pitstop_url}/wax",
                params={"fleet_id": self.fleet_id, "task": user_intent},
                headers={"Authorization": f"Bearer {self.pitstop_key}"},
                timeout=1.5
            )
            if response.status_code == 200:
                injections = response.json().get("injected_context", [])
                if injections:
                    memory_block = "\\n### AGENT PITSTOP GUARDRAILS:\\n" + "\\n".join(f"- {m}" for m in injections)
                    system_msg_found = False
                    for msg in messages:
                        if msg.get("role") == "system":
                            msg["content"] = str(msg.get("content", "")) + memory_block
                            system_msg_found = True
                            break
                    if not system_msg_found:
                        messages.insert(0, {"role": "system", "content": memory_block.strip()})
        except Exception as e:
            print(f"[AgentPitStop Warning] Skipped context injection: {e}")
        return messages

    def _async_wash_pipeline(self, messages: List[Dict[str, Any]], response_text: str):
        """
        Send raw telemetry prompt + outcome asynchronously back to the Clean Plane
        to reinforce future optimization loops.
        """
        try:
            last_message = messages[-1].get("content", "") if messages else ""
            payload = {
                "fleet_id": self.fleet_id,
                "task_description": last_message,
                "execution_trace": {"prompt_history": messages, "response": response_text},
                "outcome": "failure" if "error" in response_text.lower() else "success"
            }
            self.http_client.post(
                f"{self.pitstop_url}/wash",
                json=payload,
                headers={"Authorization": f"Bearer {self.pitstop_key}"},
                timeout=0.1
            )
        except Exception:
            pass

    def chat_completions_create(self, model: str, messages: List[Dict[str, Any]], **kwargs):
        enriched_messages = self._intercept_and_wax(list(messages))
        response = super().chat.completions.create(model=model, messages=enriched_messages, **kwargs)
        generated_text = response.choices[0].message.content or ""
        self._async_wash_pipeline(enriched_messages, generated_text)
        return response`
  },
  {
    name: "main.py",
    path: "app/main.py",
    language: "python",
    content: `import os
from app.middleware.pitstop import PitStopOpenAI
from app.config import settings

# Initialize the Agent Gateway (AgentPitStop) wrapper
client = PitStopOpenAI(
    api_key=settings.OPENAI_API_KEY,
    pitstop_api_key=settings.PITSTOP_API_KEY,
    fleet_id=settings.FLEET_ID
)

# Example usage
if __name__ == "__main__":
    messages = [{"role": "user", "content": "Analyze the market trends for Bitcoin."}]
    response = client.chat_completions_create(
        model="gpt-4",
        messages=messages
    )
    print(response.choices[0].message.content)`
  },
  {
    name: "config.py",
    path: "app/config.py",
    language: "python",
    content: `from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    OPENAI_API_KEY: str
    PITSTOP_API_KEY: str
    FLEET_ID: str = "base_arbitrage_bots"

    class Config:
        env_file = ".env"

settings = Settings()`
  },
  {
    name: "requirements.txt",
    path: "app/requirements.txt",
    language: "txt",
    content: `httpx
openai
pydantic-settings
python-dotenv`
  },
  {
    name: "memories.sql",
    path: "app/schemas/memories.sql",
    language: "sql",
    content: `-- SQL for pgvector extension integration
create extension if not exists vector;

create table if not exists public.agent_memories (
    id uuid default gen_random_uuid() primary key,
    agent_id text not null,
    fleet_id text not null,
    memory_text text not null,
    severity integer not null default 3,
    utility_count integer not null default 0,
    last_retrieved_at integer not null,
    created_at integer not null,
    status text not null default 'active',
    embedding vector(1536)
);

create index on public.agent_memories using ivfflat (embedding vector_cosine_ops) with (lists = 100);`
  },
  {
    name: "Dockerfile",
    path: "Dockerfile",
    language: "docker",
    content: `FROM python:3.10-slim
WORKDIR /app
COPY app/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app/main.py"]`
  },
  {
    name: "docker-compose.yml",
    path: "docker-compose.yml",
    language: "yaml",
    content: `version: '3.8'
services:
  agent:
    build: .
    env_file:
      - .env
    volumes:
      - .:/app`
  }
];

export const INITIAL_POLICIES: Policy[] = [
  {
    id: "p1",
    text: "Strictly prohibit leverage exceeding 3x on all high-frequency cryptocurrency trades.",
    severity: 5,
    status: "active",
    category: "Risk Management"
  },
  {
    id: "p2",
    text: "Verify the funding rate anomalies across Bybit and dYdX before placing any spot-arbitrage limit orders.",
    severity: 4,
    status: "active",
    category: "Arbitrage Safety"
  },
  {
    id: "p3",
    text: "Corporate Compliance guideline: Do not store, log, or pipe confidential customer API credentials into prompt payload.",
    severity: 5,
    status: "active",
    category: "Information Security"
  },
  {
    id: "p4",
    text: "Ensure all analytical summaries explicitly flag liquidity slippage warnings if volume is lower than 50 BTC/hour.",
    severity: 3,
    status: "active",
    category: "Data Integrity"
  },
  {
    id: "p5",
    text: "Avoid submitting execution prompts that refer directly to high-risk geopolitical entities without an associated compliance ID.",
    severity: 4,
    status: "active",
    category: "Trading Compliance"
  },
  {
    id: "p6",
    text: "Enforce a pause/sleep delta of at least 500ms between consecutive API write actions on server databases.",
    severity: 3,
    status: "active",
    category: "System Stability"
  }
];

export const ROADMAP_ITEMS = [
  {
    quarter: "Q4 2026",
    title: "Core System Integration",
    completed: true,
    features: [
      "OpenAI Compatible proxy layer with instant subclass wrapping interface.",
      "Primary pgvector connection logic for instant embedding lookup.",
      "Asynchronous washing queue with custom HTTP telemetries."
    ]
  },
  {
    quarter: "Q1 2027",
    title: "Enterprise Resiliency Engine",
    completed: false,
    features: [
      "Dynamic prompt budget optimization and automated compression of injected blocks.",
      "Interactive multi-model fallbacks (switch to backup providers live upon failure codes).",
      "SOC-2 Type II audit logging & end-to-end encrypted trace wash streams."
    ]
  },
  {
    quarter: "Q2 2027",
    title: "Autonomous Reinforcement",
    completed: false,
    features: [
      "Self-updating policy embeddings generated automatically by mining historical trace success data.",
      "Integration with Google Maps Routing & Places Platform for local geospatial routing optimization.",
      "Global distributed memory syncing across multi-region multi-fleet instances."
    ]
  }
];
