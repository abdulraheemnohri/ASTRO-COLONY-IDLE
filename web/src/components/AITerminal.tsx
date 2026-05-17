import { useState } from 'react';
import { aiClient } from '../ai/webLlmClient';
import { Bot, Terminal, Loader2 } from 'lucide-react';

export const AITerminal = () => {
  const [log, setLog] = useState<string[]>(["AI Core Online. Awaiting initialization..."]);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const initAI = async () => {
    setIsInitializing(true);
    try {
      await aiClient.initialize((p) => setProgress(Math.floor(p * 100)));
      setLog(prev => [...prev, "AI Core Synchronized. TinyLlama-1.1B Loaded."]);
    } catch (e) {
      setLog(prev => [...prev, "Critical Error: Failed to load local LLM."]);
    } finally {
      setIsInitializing(false);
    }
  };

  const generateLore = async () => {
    setIsGenerating(true);
    try {
      const lore = await aiClient.generateGameLore("The colony has multiple solar hubs and a mining station. Current metal production is high.");
      setLog(prev => [...prev, "AI: " + lore]);
    } catch (e) {
      setLog(prev => [...prev, "System: Please initialize AI Core first."]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed top-24 right-6 w-80 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 font-mono text-[10px] text-cyan-300 z-40">
      <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2">
        <Bot size={16} />
        <span className="font-bold">AI GOVERNOR TERMINAL</span>
      </div>

      <div className="h-40 overflow-y-auto mb-4 space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/20">
        {log.map((line, i) => (
          <div key={i} className="border-l border-cyan-500/30 pl-2 py-1">
            {line}
          </div>
        ))}
        {isInitializing && (
          <div className="flex items-center gap-2 text-yellow-500">
            <Loader2 size={12} className="animate-spin" />
            <span>Downloading Neural Weights: {progress}%</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={initAI}
          disabled={isInitializing}
          className="flex-1 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Terminal size={14} />
          {isInitializing ? "Initing..." : "Init AI"}
        </button>
        <button
          onClick={generateLore}
          disabled={isGenerating || isInitializing}
          className="flex-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 py-2 rounded flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
          Analyze
        </button>
      </div>
    </div>
  );
};
