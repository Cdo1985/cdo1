import React, { useState } from "react";
import { ProjectFile } from "../types";
import { Copy, Check, Code, Edit2, Save, FileCode } from "lucide-react";

interface CodeExplorerProps {
  files: ProjectFile[];
  onUpdateFile: (path: string, newContent: string) => void;
}

export default function CodeExplorer({ files, onUpdateFile }: CodeExplorerProps) {
  const [selectedPath, setSelectedPath] = useState<string>("app/middleware/pitstop.py");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editContent, setEditContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  const activeFile = files.find(f => f.path === selectedPath) || files[0];

  const handleSelectFile = (path: string) => {
    setSelectedPath(path);
    setIsEditing(false);
  };

  const handleStartEdit = () => {
    setEditContent(activeFile.content);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    onUpdateFile(activeFile.path, editContent);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Directory grouping helper
  const rootFiles = files.filter(f => !f.path.includes("/"));
  const appFiles = files.filter(f => f.path.startsWith("app/") && f.path.split("/").length === 2);
  const middlewareFiles = files.filter(f => f.path.startsWith("app/middleware/"));
  const schemaFiles = files.filter(f => f.path.startsWith("app/schemas/"));

  return (
    <div id="code-sandbox-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#0f172a]/30 border border-sky-900/40 p-6 rounded-2xl glass-panel">
      {/* File Tree Explorer (4 cols) */}
      <div className="lg:col-span-4 bg-[#030712]/60 border border-sky-900/20 rounded-xl p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-sky-900/20 pb-2">
            <Code className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-mono text-sky-30 tracking-widest text-slate-500 uppercase">FS DIRECTORY SYSTEM</span>
          </div>
          
          <nav className="space-y-3">
            {/* Root Files */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Root Space</span>
              <div className="space-y-1">
                {rootFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => handleSelectFile(file.path)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                      selectedPath === file.path 
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/25' 
                        : 'text-slate-400 hover:bg-sky-500/5 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    <FileCode className="w-3.5 h-3.5 text-slate-550" />
                    <span>{file.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* App Subdir */}
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">app/ folder</span>
              <div className="space-y-1 border-l border-sky-950/60 pl-2 ml-1">
                {appFiles.map(file => (
                  <button
                    key={file.path}
                    onClick={() => handleSelectFile(file.path)}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                      selectedPath === file.path 
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/25' 
                        : 'text-slate-400 hover:bg-sky-500/5 hover:text-slate-200 border-transparent'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-blue-400">PY</span>
                    <span>{file.name}</span>
                  </button>
                ))}

                {/* middleware folder */}
                {middlewareFiles.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-600 block pl-2 mb-1">middleware/</span>
                    <div className="space-y-1 pl-1">
                      {middlewareFiles.map(file => (
                        <button
                          key={file.path}
                          onClick={() => handleSelectFile(file.path)}
                          className={`w-full flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                            selectedPath === file.path 
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/25' 
                              : 'text-slate-405 hover:bg-sky-500/5 hover:text-slate-200 border-transparent'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-sky-400">PY</span>
                          <span>{file.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* schemas folder */}
                {schemaFiles.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[9px] font-bold text-slate-600 block pl-2 mb-1">schemas/</span>
                    <div className="space-y-1 pl-1">
                      {schemaFiles.map(file => (
                        <button
                          key={file.path}
                          onClick={() => handleSelectFile(file.path)}
                          className={`w-full flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-mono transition-all text-left cursor-pointer border ${
                            selectedPath === file.path 
                              ? 'bg-sky-500/10 text-sky-400 border-sky-500/25' 
                              : 'text-slate-405 hover:bg-sky-500/5 hover:text-slate-200 border-transparent'
                          }`}
                        >
                          <span className="text-[9px] font-bold text-emerald-400">SQL</span>
                          <span>{file.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </nav>
        </div>

        <div className="mt-6 p-3 bg-slate-900/60 border border-sky-950 rounded-lg text-xs text-slate-400">
          <p className="leading-relaxed">
            ✏️ <b className="text-slate-200">Interactive Code:</b> Fully editable. Any modifications you make will instantly affect the live "Wax and Wash" similarity simulation logic!
          </p>
        </div>
      </div>

      {/* Code Viewer / Editor Area (8 cols) */}
      <div className="lg:col-span-8 flex flex-col justify-between bg-[#030712]/60 rounded-xl border border-sky-900/20 overflow-hidden min-h-[480px]">
        {/* Code Block Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-[#020512] border-b border-sky-900/20">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-sky-400 bg-sky-950/40 border border-sky-900/30 px-2.5 py-0.5 rounded-md">
              {activeFile.language.toUpperCase()}
            </span>
            <span className="text-xs font-mono text-slate-300 font-medium">
              {activeFile.path}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <button
                onClick={handleSaveEdit}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-md transition-all font-mono cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            ) : (
              <button
                onClick={handleStartEdit}
                className="text-xs flex items-center gap-1.5 px-2.5 py-1 bg-sky-900/20 hover:bg-sky-900/35 text-sky-305 border border-sky-850 rounded-md transition-all font-mono cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit Source</span>
              </button>
            )}
            
            <button
              onClick={handleCopy}
              className="text-xs flex items-center gap-1.5 px-2.5 py-1 bg-sky-900/20 hover:bg-sky-900/35 text-sky-305 border border-sky-850 rounded-md transition-all font-mono cursor-pointer"
              title="Copy to clipboard"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Code Block Content */}
        <div className="flex-1 overflow-auto p-4 bg-[#030712]/45">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-[380px] p-3 text-xs text-slate-200 font-mono bg-slate-950 focus:outline-none focus:ring-1 focus:ring-sky-500/30 rounded-lg border border-sky-900/30 resize-none whitespace-pre leading-relaxed"
              spellCheck={false}
            />
          ) : (
            <pre className="font-mono text-xs leading-relaxed text-slate-300 overflow-x-auto">
              {activeFile.content.split("\n").map((line, idx) => (
                <div key={idx} className="flex hover:bg-sky-950/25 py-0.5 rounded px-1 group">
                  <span className="w-8 select-none text-slate-600 text-right pr-3 font-semibold text-[10px] sm:text-xs">
                    {idx + 1}
                  </span>
                  <span className="flex-1 select-text text-slate-200">
                    {line || " "}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
