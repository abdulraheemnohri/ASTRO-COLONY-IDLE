import { useState } from 'react';
import { aiClient } from '../ai/webLlmClient';
import { applyAIPatch, type AIPatch } from '../ai/patchEngine';
import { useGameStore } from '../store/useGameStore';
import { Bot, Terminal, Loader2, Sparkles } from 'lucide-react';
import type { Technology } from '../../../shared/schemas/game';

export const AITerminal = () => {
  const [log, setLog] = useState<string[]>(['AI Core Online. Awaiting local model initialization...']);
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const resources = useGameStore((state) => state.resources);
  const buildings = useGameStore((state) => state.buildings);
  const technologies = useGameStore((state) => state.technologies);

  const context = `Resources ${JSON.stringify(resources)}. Buildings ${buildings.length}. Unlocked tech ${technologies.filter((tech: Technology) => tech.unlocked).map((tech: Technology) => tech.name).join(', ') || 'none'}.`;

  const initAI = async () => {
    setIsInitializing(true);
    try {
      await aiClient.initialize((p) => setProgress(Math.floor(p * 100)));
      setLog((prev) => [...prev, 'AI Core synchronized. TinyLlama local inference ready.']);
    } catch {
      setLog((prev) => [...prev, 'Critical Error: Local model unavailable. Use cached model files for fully offline play.']);
    } finally {
      setIsInitializing(false);
    }
  };

  const generateLore = async () => {
    setIsGenerating(true);
    try {
      const lore = await aiClient.generateGameLore(context);
      setLog((prev) => [...prev.slice(-8), `AI: ${lore}`]);
    } catch {
      setLog((prev) => [...prev.slice(-8), 'System: Please initialize AI Core first.']);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePatch = async () => {
    setIsGenerating(true);
    try {
      const patchText = await aiClient.proposeJsonPatch(context);
      const jsonStart = patchText.indexOf('{');
      const jsonEnd = patchText.lastIndexOf('}');
      const patch = JSON.parse(patchText.slice(jsonStart, jsonEnd + 1)) as AIPatch;
      const result = applyAIPatch(patch);
      setLog((prev) => [...prev.slice(-8), `Patch ${result.accepted ? 'accepted' : 'rejected'}: ${result.reason}`]);
    } catch {
      setLog((prev) => [...prev.slice(-8), 'Safety Layer: AI patch was not valid JSON and was rejected.']);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed top-36 right-6 w-80 bg-black/60 backdrop-blur-md border border-cyan-500/30 rounded-lg p-4 font-mono text-[10px] text-cyan-300 z-40 hidden xl:block">
      <div className="flex items-center gap-2 mb-4 border-b border-cyan-500/20 pb-2">
        <Bot size={16} />
        <span className="font-bold">AI GOVERNOR TERMINAL</span>
      </div>

      <div className="h-40 overflow-y-auto mb-4 space-y-2 scrollbar-thin scrollbar-thumb-cyan-500/20">
        {log.map((line, i) => (
          <div key={`${line}-${i}`} className="border-l border-cyan-500/30 pl-2 py-1 normal-case tracking-normal">
            {line}
          </div>
        ))}
        {isInitializing && (
          <div className="flex items-center gap-2 text-yellow-500">
            <Loader2 size={12} className="animate-spin" />
            <span>Preparing Local Weights: {progress}%</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={initAI}
          disabled={isInitializing}
          className="bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 py-2 rounded flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Terminal size={14} />
          {isInitializing ? 'Init...' : 'Init'}
        </button>
        <button
          onClick={generateLore}
          disabled={isGenerating || isInitializing}
          className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 py-2 rounded flex items-center justify-center gap-1 disabled:opacity-50"
        >
          {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
          Lore
        </button>
        <button
          onClick={generatePatch}
          disabled={isGenerating || isInitializing}
          className="bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/40 py-2 rounded flex items-center justify-center gap-1 disabled:opacity-50"
        >
          <Sparkles size={14} />
          Patch
        </button>
      </div>
    </div>
  );
};
