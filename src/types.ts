export interface ProjectFile {
  name: string;
  path: string;
  content: string;
  language: 'python' | 'sql' | 'docker' | 'txt' | 'yaml';
}

export interface Policy {
  id: string;
  text: string;
  severity: number; // 1 to 5
  status: 'active' | 'inactive';
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: string;
}

export interface ExecutionTrace {
  id: string;
  timestamp: string;
  task: string;
  model: string;
  policiesApplied: string[];
  originalPrompt: string;
  waxedPrompt: string;
  response: string;
  status: 'success' | 'failure';
  latencyMs: number;
  tokensUsed: number;
  costSimulated: number;
}
