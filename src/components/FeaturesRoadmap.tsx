import React from "react";
import { ROADMAP_ITEMS } from "../data";
import { Activity, Layers, Calendar, CheckSquare, ShieldCheck } from "lucide-react";

export default function FeaturesRoadmap() {
  return (
    <div className="space-y-12">
      {/* 1. Features Bento Grid */}
      <div>
        <div className="flex items-center gap-2.5 mb-6 border-b border-sky-900/40 pb-3">
          <Layers className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold font-display text-white tracking-tight uppercase">Core Operations Capabilities</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-[#0f172a]/20 hover:bg-[#0f172a]/45 border border-sky-950 hover:border-sky-500/30 transition-all rounded-2xl group flex flex-col justify-between glass-panel">
            <div>
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform mb-5 border border-sky-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 font-display mb-2">Semantic Waxing Prompt Block</h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Automatic retrieval and injection of relevant fleet-level context based on the current task intent. Reduces hallucinations, enforces risk margins, and ensures corporate policy/compliance rules.
              </p>
            </div>
            <div className="text-[10px] uppercase font-bold text-sky-400 tracking-widest font-mono">
              PGVECTOR CORES CONNECTED
            </div>
          </div>

          <div className="p-6 bg-[#0f172a]/20 hover:bg-[#0f172a]/45 border border-sky-950 hover:border-emerald-500/30 transition-all rounded-2xl group flex flex-col justify-between glass-panel">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-450 group-hover:scale-105 transition-transform mb-5 border border-emerald-500/10">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 font-display mb-2">Execution Washing Pipeline</h3>
              <p className="text-xs text-slate-405 leading-relaxed mb-4">
                Asynchronous capture of completion results and trace data. Feeds the reinforcement loop to improve future model performance, token budgets, and audit conformity log metrics.
              </p>
            </div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest font-mono">
              ASYNC TELEMETRY PORT BUFFERED
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Enterprise Roadmap */}
      <div>
        <div className="flex items-center gap-2.5 mb-6 border-b border-sky-900/40 pb-3">
          <Calendar className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold font-display text-white tracking-tight uppercase">Control Plane Roadmap</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {ROADMAP_ITEMS.map((item, idx) => (
            <div 
              key={idx}
              className={`p-5 rounded-2xl border ${
                item.completed 
                  ? 'bg-slate-900/30 border-sky-500/20' 
                  : 'bg-slate-900/10 border-sky-950/40'
              } space-y-4`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                  item.completed 
                    ? 'bg-sky-950/40 text-sky-400 border border-sky-900/25' 
                    : 'bg-[#030712] border border-sky-950 text-slate-500'
                }`}>
                  {item.quarter}
                </span>
                
                <span className="text-[10px] text-slate-550 font-medium">
                  {item.completed ? 'Active Production' : 'Research Pipeline'}
                </span>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-200 font-display">{item.title}</h4>
                <ul className="mt-3.5 space-y-2 text-xs">
                  {item.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex gap-2 items-start">
                      <div className="mt-0.5 flex-shrink-0">
                        {item.completed ? (
                          <CheckSquare className="w-3.5 h-3.5 text-sky-450" />
                        ) : (
                          <div className="w-3.5 h-3.5 rounded bg-slate-950 border border-sky-950/50" />
                        )}
                      </div>
                      <span className="text-slate-400 leading-normal">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
