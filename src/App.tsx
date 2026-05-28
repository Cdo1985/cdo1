import React, { useState } from "react";
import JSZip from "jszip";
import { INITIAL_FILES, INITIAL_POLICIES } from "./data";
import { ProjectFile, Policy, ChatMessage } from "./types";
import CodeExplorer from "./components/CodeExplorer";
import SimulationConsole from "./components/SimulationConsole";
import ArchitectChat from "./components/ArchitectChat";
import FeaturesRoadmap from "./components/FeaturesRoadmap";
import { 
  Download, 
  Terminal, 
  Layers, 
  Settings, 
  Cpu, 
  Compass, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";

export default function App() {
  const [files, setFiles] = useState<ProjectFile[]>(INITIAL_FILES);
  const [policies, setPolicies] = useState<Policy[]>(INITIAL_POLICIES);
  
  // Interactive tabs: 'sandbox' | 'docs' | 'roadmap'
  const [activeTab, setActiveTab] = useState<'sandbox' | 'docs' | 'roadmap'>('sandbox');

  // Interactive documentation sub-tabs: 'docker' | 'crew' | 'sdk'
  const [docSubTab, setDocSubTab] = useState<'docker' | 'crew' | 'sdk'>('docker');

  // Integrations with Real Backend Chat & Simulation
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // File modification hook
  const handleUpdateFile = (path: string, newContent: string) => {
    setFiles(prev => prev.map(f => f.path === path ? { ...f, content: newContent } : f));
  };

  // Policy insertion hook
  const handleAddPolicy = (text: string, category: string) => {
    const newId = "p" + (policies.length + 1);
    const newPol: Policy = {
      id: newId,
      text,
      category,
      severity: Math.floor(Math.random() * 2) + 4, // random high severity (4 or 5)
      status: "active"
    };
    setPolicies(prev => [newPol, ...prev]);
  };

  // REAL ZIP DOWNLOAD COMPLIANCY
  const handleDownloadScaffold = async () => {
    try {
      const zip = new JSZip();
      
      // Pack files directly from active state
      files.forEach(file => {
        zip.file(file.path, file.content);
      });
      
      // Render as blob
      const blob = await zip.generateAsync({ type: "blob" });
      
      // Auto-trigger browser download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "agent-gateway-control-plane.zip";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Error packaging files into ZIP scaffold.");
    }
  };

  // REAL SIMULATION TRIGGER API
  const handleRunSimulation = async (task: string, activePolicies: string[]) => {
    const response = await fetch("/api/gateway/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task,
        selectedPolicies: activePolicies,
        customModel: "gemini-3.5-flash"
      })
    });
    return await response.json();
  };

  // REAL CHAT BRIDGE
  const handleSendChatMessage = async (text: string): Promise<ChatMessage | null> => {
    setChatLoading(true);
    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString()
    };
    
    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);

    try {
      const response = await fetch("/api/gateway/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory })
      });
      
      if (!response.ok) {
        throw new Error("Backend query failed or key unconfigured.");
      }

      const received = await response.json();
      const modelMsg: ChatMessage = {
        id: "model_" + Date.now(),
        role: "model",
        content: received.content,
        timestamp: new Date().toISOString()
      };
      
      setChatHistory(prev => [...prev, modelMsg]);
      return modelMsg;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col justify-between selection:bg-sky-500/25 selection:text-sky-300">
      
      {/* 1. Static Glass Header from Immersive UI */}
      <header className="sticky top-0 z-55 border-b border-sky-900/50 bg-[#020617]/80 backdrop-blur-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-lg shadow-sky-500/10 active:scale-95 transition-all">
              <Zap className="w-5 h-5" fill="currentColor" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-sky-400 tracking-widest uppercase block mb-0.5">Deep Space Navigation Node // DSNN-Gateway</span>
              <h1 className="text-sm sm:text-base font-bold font-display tracking-tight text-white flex items-center gap-1.5 leading-none">
                AGENT GATEWAY <span className="text-sky-400 font-light">// K-2179b</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 font-mono text-right text-xs">
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">System Time</span>
              <span className="text-xs text-sky-300">244.18.99.04</span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase">Signal Strength</span>
              <span className="text-xs text-emerald-400 font-bold uppercase">Stable</span>
            </div>
            <button
              onClick={handleDownloadScaffold}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-sky-400 hover:bg-sky-300 active:scale-97 border border-sky-500/25 rounded-md transition-all shadow-md shadow-sky-500/20 flex items-center gap-2 cursor-pointer font-sans"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Download Project Scaffold</span>
              <span className="sm:hidden font-sans">Scaffold</span>
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Page Layout Grid with Grid Star Background */}
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-12">
        
        {/* Intro Hero Section */}
        <div className="max-w-4xl space-y-4 animate-fade-in">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-950/40 border border-sky-500/25 text-sky-400 text-xs font-bold rounded-full font-mono uppercase">
            <Settings className="w-3.5 h-3.5 animate-spin text-sky-400" style={{ animationDuration: '6s' }} />
            <span>Active Middleware Interceptor // Deep Space Control Plane</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight font-display">
            The Intelligent Proxy for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-400 to-blue-500">Autonomous AI Fleets</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-400 max-w-3xl leading-relaxed">
            Configure risk margins, policies, and semantic safety guidelines in a clean pgvector database memory workspace. Agent Gateway automatically intercepts agent payloads, loads relevant memories on intent matching (<b className="text-sky-400">Semantic Waxing</b>), and streams trace traces back to monitor status (<b className="text-emerald-400 font-medium">Execution Washing</b>).
          </p>
        </div>

        {/* Dynamic Topology Chart & Planet Glow from Immersive UI */}
        <section className="bg-slate-900/50 border border-sky-900/40 p-6 sm:p-8 rounded-3xl relative overflow-hidden glass-panel">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Visual Planet Orbital Section from Immersive UI */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative p-6 bg-slate-950/60 rounded-2xl border border-sky-900/30 overflow-hidden h-[240px]">
              <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
              <div className="relative w-[130px] h-[130px] rounded-full planet-glow flex items-center justify-center">
                <div className="absolute w-[160px] h-[160px] border border-sky-400/10 rounded-full animate-pulse"></div>
                <div className="absolute w-[190px] h-[190px] border border-sky-400/5 rounded-full"></div>
                <div className="absolute w-full h-[1px] bg-sky-400/20 rotate-[23.5deg]"></div>
              </div>
              <div className="mt-4 flex flex-col items-center gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse"></div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300">Axial Tilt Locked // K-2179b</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500">Live Telemetry Sync: 124.9 GB/s</span>
              </div>
            </div>

            {/* Topology Plane */}
            <div className="lg:col-span-7 space-y-4">
              <span className="text-[10px] font-mono text-sky-400 tracking-wider uppercase font-bold block">Active Pipeline Topology</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] text-sky-300 uppercase tracking-wider font-mono font-bold block mb-1">Agent Plane</span>
                  <p className="text-xs font-semibold text-white font-display">CrewAI / LangChain Fleet</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Dispatches prompt tasks</p>
                </div>

                <div className="p-4 bg-sky-950/20 border border-sky-500/20 rounded-xl text-center">
                  <span className="text-[9px] text-emerald-400 uppercase tracking-wider font-mono font-bold block mb-1">Gateway Proxy</span>
                  <p className="text-xs font-semibold text-slate-100 font-display font-mono">PitStop Interceptor</p>
                  <span className="text-[9px] text-sky-350 block mt-1 font-mono">Wax & Wash Cored</span>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-850 rounded-xl text-center">
                  <span className="text-[9px] text-purple-400 uppercase tracking-wider font-mono font-bold block mb-1">Standard LLM</span>
                  <p className="text-xs font-semibold text-white font-display">Gemini 3.5 compliant</p>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">Refined output trace</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-slate-850 gap-4">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold font-display tracking-tight transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'sandbox' 
                ? 'border-sky-400 text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Control Sandboxes
          </button>
          
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold font-display tracking-tight transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'docs' 
                ? 'border-sky-400 text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Setup & Integrations Docs
          </button>

          <button
            onClick={() => setActiveTab('roadmap')}
            className={`px-4 py-3 text-xs sm:text-sm font-semibold font-display tracking-tight transition-all relative border-b-2 cursor-pointer ${
              activeTab === 'roadmap' 
                ? 'border-sky-400 text-sky-400' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Product Roadmap
          </button>
        </div>

        {/* Interactive Workspace Grid Layout (left is tab workspace, right is active Assistant Chatbot) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace panels (8 cols on desktop) */}
          <div className="lg:col-span-12 xl:col-span-8 space-y-10">
            
            {activeTab === 'sandbox' && (
              <div className="space-y-12 animate-fade-in">
                {/* 1. Simulation Controls Console */}
                <SimulationConsole 
                  policies={policies}
                  onAddPolicy={handleAddPolicy}
                  onRunSimulation={handleRunSimulation}
                />

                {/* 2. File Explorer Editor Space */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Terminal className="w-4 h-4 text-sky-450" />
                    <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-display">Codebase Sandbox</h3>
                  </div>
                  <CodeExplorer 
                    files={files}
                    onUpdateFile={handleUpdateFile}
                  />
                </div>
              </div>
            )}

            {activeTab === 'docs' && (
              <div className="bg-[#0f172a]/40 border border-slate-800 p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in font-sans">
                <div className="border-b border-slate-850 pb-4">
                  <h3 className="text-lg font-bold text-slate-150 font-display">Configuring & Running Agent Gateway</h3>
                  <p className="text-xs text-slate-400 mt-1">Implement the wrapper cleanly across your python-agent containers in Minutes.</p>
                </div>

                <div className="flex border-b border-slate-850 gap-2">
                  <button 
                    onClick={() => setDocSubTab('docker')}
                    className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${docSubTab === 'docker' ? 'bg-slate-900 border-x border-t border-slate-800 text-sky-400' : 'text-slate-500 hover:text-slate-350'}`}
                  >
                    Local Docker Compose
                  </button>
                  <button 
                    onClick={() => setDocSubTab('crew')}
                    className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${docSubTab === 'crew' ? 'bg-slate-900 border-x border-t border-slate-800 text-sky-400' : 'text-slate-500 hover:text-slate-350'}`}
                  >
                    CrewAI Integration
                  </button>
                  <button 
                    onClick={() => setDocSubTab('sdk')}
                    className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-all ${docSubTab === 'sdk' ? 'bg-slate-900 border-x border-t border-slate-800 text-sky-400' : 'text-slate-500 hover:text-slate-350'}`}
                  >
                    Python Subclass Wrap
                  </button>
                </div>

                {docSubTab === 'docker' && (
                  <div className="space-y-4 font-sans">
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Spin up the local containerized sandbox which hosts the pgvector PostgreSQL database and sets ready port listening.
                    </p>
                    <div className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-emerald-400 border border-slate-850">
                      $ docker-compose up --build
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      <div className="p-3.5 bg-slate-900/30 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">Vector DB Port</span>
                        <code className="text-xs text-white font-mono break-all">5432 (Public access mapped)</code>
                      </div>
                      <div className="p-3.5 bg-slate-900/30 border border-slate-850 rounded-xl">
                        <span className="text-[10px] text-slate-500 font-bold block mb-1">Proxy Listening</span>
                        <code className="text-xs text-white font-mono break-all">http://localhost:3000</code>
                      </div>
                    </div>
                  </div>
                )}

                {docSubTab === 'crew' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Instantly inject corporate compliance laws directly into any CrewAI orchestrators by wrapping the standard model connector inside our custom subclass.
                    </p>
                    <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-blue-300 border border-slate-850 overflow-x-auto leading-relaxed">
{`from crewai import Agent
from app.middleware.pitstop import PitStopOpenAI

wrapped_llm = PitStopOpenAI(
    api_key="sk-openai-key...", 
    pitstop_api_key="gw-key-10292",
    fleet_id="marketing_agents"
)

analyst_agent = Agent(
    role='Compliance Analyst',
    goal='Validate marketing disclosures',
    llm=wrapped_llm
)`}
                    </pre>
                  </div>
                )}

                {docSubTab === 'sdk' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-450 leading-relaxed">
                      Our Python `PitStopOpenAI` completely inherits from the official openai package. Simply update your constructor imports:
                    </p>
                    <pre className="bg-slate-950 p-4 rounded-xl font-mono text-xs text-slate-300 border border-slate-850 overflow-x-auto leading-relaxed">
{`# Legacy: from openai import OpenAI
# Upgrade:
from app.middleware.pitstop import PitStopOpenAI

client = PitStopOpenAI(
    api_key="...",
    pitstop_api_key="...",
    fleet_id="finance_arbitrage_bots"
)`}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'roadmap' && (
              <div className="animate-fade-in">
                <FeaturesRoadmap />
              </div>
            )}

          </div>

          {/* Side chatbot panel (4 cols on desktop) */}
          <div className="lg:col-span-12 xl:col-span-4 space-y-6">
            <div className="sticky top-24">
              <ArchitectChat 
                onSendMessage={handleSendChatMessage}
                history={chatHistory}
                loading={chatLoading}
              />
              
              <div className="mt-4 p-4 bg-slate-900/40 border border-slate-850 rounded-2xl flex items-start gap-3">
                <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  <p className="font-semibold text-slate-350">Adheres to Active File Workspace</p>
                  <p className="mt-1">
                    The live expert is trained on the exact files in your editor tab. Changing file contents allows you to ask the chatbot about your custom code versions!
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* 3. Humble Footer from Immersive UI */}
      <footer className="border-t border-sky-900/40 bg-[#020512] py-8 text-center text-xs text-slate-500 font-mono tracking-wider">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sky-400">● Live System Feed Sync Phase Locked // BUFF: 100%</span>
          <span className="flex items-center gap-1 text-slate-500">
            Build 2026 UTC • Live Active Proxy Plane • Telemetry: 124.9 GB/s
          </span>
        </div>
      </footer>

    </div>
  );
}
