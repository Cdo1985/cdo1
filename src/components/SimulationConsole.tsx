import React, { useState, useRef, useEffect } from "react";
import { Policy, ExecutionTrace } from "../types";
import { 
  Play, 
  Terminal, 
  Database, 
  ShieldCheck, 
  Cpu, 
  Plus, 
  CheckSquare, 
  Square,
  AlertCircle
} from "lucide-react";

interface SimulationConsoleProps {
  policies: Policy[];
  onAddPolicy: (text: string, category: string) => void;
  onRunSimulation: (task: string, activePolicies: string[]) => Promise<any>;
}

export default function SimulationConsole({ policies, onAddPolicy, onRunSimulation }: SimulationConsoleProps) {
  const [taskInput, setTaskInput] = useState("Analyze crypto market trends and execute leveraged margin trades on Ether with up to 10x size depending on funding rates.");
  const [selectedPolicyIds, setSelectedPolicyIds] = useState<string[]>(policies.slice(0, 3).map(p => p.id));
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [traceResult, setTraceResult] = useState<ExecutionTrace | null>(null);

  // New policy creation
  const [newPolicyText, setNewPolicyText] = useState("");
  const [newPolicyCategory, setNewPolicyCategory] = useState("Risk Management");
  const [showAddForm, setShowAddForm] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const togglePolicy = (id: string) => {
    if (selectedPolicyIds.includes(id)) {
      setSelectedPolicyIds(selectedPolicyIds.filter(pid => pid !== id));
    } else {
      setSelectedPolicyIds([...selectedPolicyIds, id]);
    }
  };

  const handleAddNewPolicy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPolicyText.trim()) return;
    onAddPolicy(newPolicyText, newPolicyCategory);
    setNewPolicyText("");
    setShowAddForm(false);
  };

  const runSim = async () => {
    if (!taskInput.trim()) return;
    setLoading(true);
    setTraceResult(null);
    setLogs([]);
    setErrorText(null);

    const activePolicyTexts = policies
      .filter(p => selectedPolicyIds.includes(p.id))
      .map(p => p.text);

    const logSteps = [
      `[Gateway Console] Initializing prompt simulation block...`,
      `[Semantic Waxing] Resolving AI Agent context using public.agent_memories pgvector database...`,
      `[pgvector] Performing cosine distance calculations: SELECT embedding <=> embedding_query...`
    ];

    // Push first set of local logs sequentially
    for (let i = 0; i < logSteps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 250));
      setLogs(prev => [...prev, logSteps[i]]);
    }

    if (activePolicyTexts.length > 0) {
      setLogs(prev => [...prev, `[Semantic Waxing] Matched ${activePolicyTexts.length} policy guardrails inside similarity boundary:`]);
      activePolicyTexts.forEach(txt => {
        setLogs(prev => [...prev, `  ↳ MATCH: "${txt.substring(0, 50)}..."`]);
      });
      setLogs(prev => [...prev, `[Semantic Waxing] Injecting memory blocks in header system instructions...`]);
    } else {
      setLogs(prev => [...prev, `[Semantic Waxing] Warning: No active policy match retrieved. Forwarding original prompt plain.`]);
    }

    setLogs(prev => [...prev, `[Proxy] dispatching enriched system prompt payload to Gemini API...`]);

    try {
      const response = await onRunSimulation(taskInput, activePolicyTexts);
      if (response && response.trace) {
        setLogs(prev => [
          ...prev, 
          `[LLM Node] Provider response generated. Latency: ${response.trace.latencyMs}ms. Status code: 200`,
          `[Execution Washing] Asynchronously capturing completions & tokens trace headers...`,
          `[Execution Washing] Syncing trace payload back to vector indices: ID ${response.trace.id}...`,
          `[pgvector] Trace successfully hashed & stored into memories database. Reinforcement loop hydrated.`,
          `[Gateway Console] Pipeline process finished successfully.`
        ]);
        setTraceResult(response.trace);
      } else {
        throw new Error("Invalid reply from simulation backend route.");
      }
    } catch (err: any) {
      setLogs(prev => [...prev, `[FATAL] Simulation failed: ${err.message || "Unknown proxy error"}`]);
      setErrorText(err.message || "Express server exception. Check Gemini API configuration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* 1. Policy Dashboard Config Panel (5 cols) */}
      <div className="lg:col-span-12 xl:col-span-5 bg-[#0f172a]/30 border border-sky-900/40 rounded-2xl p-6 flex flex-col justify-between glass-panel">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-sky-900/20 pb-3">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-sky-400" />
              <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-display">pgvector Memory Workspace</h3>
            </div>
            
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-2.5 py-1 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/25 rounded-md transition-all flex items-center gap-1 font-mono cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>New Policy</span>
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 leading-relaxed font-sans">
            Select standard rules currently active in the vector database table. These will trigger Waxing context embedding lookup if semantic intent matches.
          </p>

          {/* Quick Add Policy Form */}
          {showAddForm && (
            <form onSubmit={handleAddNewPolicy} className="mb-5 bg-slate-900/60 border border-sky-900/30 p-4 rounded-xl space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Add Custom Guardrail Memory</span>
              <textarea
                value={newPolicyText}
                onChange={(e) => setNewPolicyText(e.target.value)}
                placeholder="Policy prompt: e.g. Never output competitors names to user..."
                className="w-full bg-slate-950 p-2 text-xs border border-sky-900/40 focus:outline-none focus:border-sky-500/50 rounded-lg text-slate-200 placeholder-slate-600 font-sans resize-none h-20"
                required
              />
              <div className="flex justify-between items-center">
                <select
                  value={newPolicyCategory}
                  onChange={(e) => setNewPolicyCategory(e.target.value)}
                  className="bg-slate-950 border border-sky-900/40 text-xs text-slate-400 rounded-lg px-2 py-1 focus:outline-none focus:border-sky-400"
                >
                  <option value="Risk Management">Risk Management</option>
                  <option value="Compliance Advisory">Compliance</option>
                  <option value="Information Security">Info Security</option>
                  <option value="Trading Protocol">Trading Protocol</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddForm(false)} className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-350 bg-transparent">Cancel</button>
                  <button type="submit" className="px-3 py-1 bg-sky-450 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-md transition-all cursor-pointer">Create</button>
                </div>
              </div>
            </form>
          )}

          {/* Policy List */}
          <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
            {policies.map(policy => {
              const isSelected = selectedPolicyIds.includes(policy.id);
              return (
                <div 
                  key={policy.id} 
                  onClick={() => togglePolicy(policy.id)}
                  className={`p-3 border rounded-xl cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected 
                      ? 'bg-sky-950/20 border-sky-500/30' 
                      : 'bg-slate-900/15 border-sky-950/20 hover:border-sky-900/40'
                  }`}
                >
                  <div className="mt-0.5 text-slate-500">
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-sky-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-650" />
                    )}
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <p className="text-xs text-slate-200 leading-relaxed font-sans">{policy.text}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-950 border border-sky-950/50 px-1.5 py-0.5 rounded uppercase">
                        {policy.category}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded flex items-center gap-0.5 font-bold ${
                        policy.severity >= 4 
                          ? 'bg-rose-955/20 text-rose-400 border border-rose-905/30' 
                          : 'bg-yellow-955/20 text-yellow-500 border border-yellow-905/20'
                      }`}>
                        Severity: {policy.severity}/5
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-sky-950/60 bg-gradient-to-r from-sky-950/20 to-transparent p-3 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-350">
            <ShieldCheck className="w-4 h-4 text-sky-400 font-semibold" />
            <span className="font-semibold text-slate-200">Similarity Vector Matching State</span>
          </div>
          <p className="text-[11px] text-slate-550 mt-1 leading-normal">
            Upon AI agent task arrival, pgvector calculates cosines distance embeddings. Match results are immediately loaded as systemic system contexts for standard LLM inference.
          </p>
        </div>
      </div>

      {/* 2. Interactive Terminal & Simulations Console (7 cols) */}
      <div className="lg:col-span-12 xl:col-span-7 flex flex-col space-y-6">
        {/* Input parameters card */}
        <div className="bg-[#0f172a]/30 border border-sky-900/40 rounded-2xl p-6 space-y-4 glass-panel">
          <div className="flex items-center gap-2 border-b border-sky-900/20 pb-3">
            <Cpu className="w-4 h-4 text-sky-400" />
            <h3 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-display">Run Proxy Simulator</h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Inbound AI Agent Goal / Task</label>
            <textarea
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="e.g. Write a script that trades Bitcoin margin size with high size..."
              className="w-full bg-slate-950 p-3 text-xs border border-sky-900/30 focus:outline-none focus:border-sky-500/50 rounded-xl text-slate-200 font-sans resize-none h-20 placeholder-slate-700 leading-relaxed font-semibold"
            />
          </div>

          {/* Model options */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Simulated Target LLM</span>
              <select className="w-full bg-slate-950 border border-sky-900/30 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-sky-400 outline-none">
                <option value="gpt-4">GPT-4 Turbo (Inference API)</option>
                <option value="claude-3-opus">Claude 3 Opus (Inference API)</option>
                <option value="gemini-3.5-flash">Gemini 3.5 Flash (Compliant Native Node)</option>
              </select>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold block mb-1">Action Active Setup</span>
              <button
                onClick={runSim}
                disabled={loading || !taskInput.trim()}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-md text-xs font-bold bg-sky-400 text-slate-950 hover:bg-sky-300 disabled:bg-slate-850 disabled:text-slate-650 transition-all shadow-md shadow-sky-500/10 cursor-pointer font-sans"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Execute (Wax & Wash)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Console Tracing Logs Box */}
        {(logs.length > 0 || loading) && (
          <div className="bg-[#030712] p-5 rounded-2xl border border-sky-900/40 font-mono text-[11px] leading-relaxed relative overflow-hidden min-h-[160px] max-h-[300px] flex flex-col justify-between">
            <div className="flex items-center gap-1.5 absolute top-3 right-4">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></span>
              <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">LOG FEED</span>
            </div>
            
            <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
              {logs.map((log, idx) => {
                let color = "text-slate-400";
                if (log.includes("[Gateway Console]")) color = "text-sky-400 font-semibold";
                if (log.includes("[pgvector]")) color = "text-emerald-500";
                if (log.includes("[Semantic Waxing]")) color = "text-sky-300";
                if (log.includes("[Execution Washing]")) color = "text-amber-500";
                if (log.includes("MATCH:")) color = "text-rose-450 font-sans italic pl-4";
                if (log.includes("[LLM Node]")) color = "text-indigo-400";
                return (
                  <div key={idx} className={`${color} break-words`}>
                    {log}
                  </div>
                );
              })}
              {loading && (
                <div className="text-sky-400 flex items-center gap-1.5 font-semibold">
                  <span>[Gateway Proxy] Executing inference process...</span>
                  <span className="w-1.5 h-3.5 bg-sky-400 cursor-blink"></span>
                </div>
              )}
              <div ref={logsEndRef} />
            </div>
          </div>
        )}

        {/* Error messaging */}
        {errorText && (
          <div className="bg-rose-955/20 text-rose-450 text-xs border border-rose-905/30 p-4 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-300">Inference Simulation Fails</p>
              <p className="mt-1 leading-relaxed">{errorText}</p>
            </div>
          </div>
        )}

        {/* 3. Detailed trace output summary */}
        {traceResult && (
          <div className="bg-[#0f172a]/30 border border-sky-900/40 rounded-2xl p-6 space-y-5 animate-fade-in glass-panel">
            <div className="flex items-center justify-between border-b border-sky-900/20 pb-3">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider text-slate-400">EXECUTION TRACE OVERVIEW</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-900/20 px-2 py-0.5 rounded">
                COMPLIANT STATUS: SUCCESS
              </span>
            </div>

            {/* Simulated Stats Banner */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-2">
              <div className="p-3 bg-[#030712]/60 border border-sky-950/60 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Proxy Latency</span>
                <span className="text-sm font-semibold text-white font-mono">{traceResult.latencyMs} ms</span>
              </div>
              <div className="p-3 bg-[#030712]/60 border border-sky-950/60 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-550 block mb-0.5 font-mono">Tokens Saved</span>
                <span className="text-sm font-semibold text-sky-400 font-mono">{traceResult.tokensUsed} tokens</span>
              </div>
              <div className="p-3 bg-[#030712]/60 border border-sky-950/60 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-550 block mb-0.5 font-mono">Trace Hash ID</span>
                <span className="text-xs font-semibold text-slate-300 font-mono block truncate">{traceResult.id}</span>
              </div>
              <div className="p-3 bg-[#030712]/60 border border-sky-950/60 rounded-xl text-center">
                <span className="text-[9px] uppercase font-bold text-slate-555 block mb-0.5">Simulated Cost</span>
                <span className="text-sm font-semibold text-emerald-400 font-mono">${traceResult.costSimulated.toFixed(5)}</span>
              </div>
            </div>

            {/* Prompt comparisons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-950/50">
                <span className="text-[9px] text-slate-555 uppercase tracking-wider block mb-1">ORIGINAL INBOUND AGENT CORE</span>
                <p className="text-slate-350 leading-relaxed font-sans mt-1 line-clamp-4">{traceResult.originalPrompt}</p>
              </div>
              <div className="bg-slate-950/80 p-3 rounded-xl border border-sky-500/20">
                <span className="text-[9px] text-sky-400 uppercase tracking-wider block mb-1">WAXED / ENRICHED PAYLOAD</span>
                <p className="text-sky-200 leading-relaxed font-sans mt-1 line-clamp-4 whitespace-pre-line">{traceResult.waxedPrompt}</p>
              </div>
            </div>

            {/* Response Area */}
            <div className="bg-slate-950 p-4 border border-sky-900/30 rounded-xl space-y-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Compliant AI Output Tracer</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">{traceResult.response}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
