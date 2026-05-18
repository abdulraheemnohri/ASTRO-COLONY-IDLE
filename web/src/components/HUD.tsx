import { useState, type ReactNode } from 'react';
import {
  Zap, Hexagon, Box, Wind, Atom, Bot, Skull,
  Save, Hammer, Shield, Wifi, Send, X,
  ChevronLeft, Layout, Cpu, Activity
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BUILDING_TEMPLATES } from '../../../shared/constants/buildings';
import type { Building, ResourceType, Technology } from '../../../shared/schemas/game';

const resourceColors: Record<ResourceType, string> = {
  ENERGY: 'text-yellow-400',
  METAL: 'text-zinc-400',
  CRYSTAL: 'text-cyan-300',
  GAS: 'text-green-400',
  DARK_MATTER: 'text-purple-500',
  QUANTUM_DUST: 'text-blue-400',
  ALIEN_BIOMASS: 'text-lime-500',
};

export const HUD = () => {
  const {
    resources, buildings, technologies, chatLog, drones, shields, maxShields, threatLevel, hostMode,
    playerId, militaryRank,
    saveGame, purchaseBuilding, unlockTechnology, setHostMode, sendChatMessage
  } = useGameStore();

  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [chatDraft, setChatDraft] = useState('');
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const defenseRating = buildings.reduce((total, b) => total + (b.defense || 0) * (b.level || 1), shields);

  return (
    <div className="fixed inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono uppercase tracking-wider text-cyan-500 overflow-hidden">
      {/* Top Bar: Resource Monitor & Stats */}
      <div className="flex flex-col lg:flex-row gap-4 pointer-events-auto items-start lg:items-center justify-between">
        <div className="bg-black/60 backdrop-blur-xl border-l-4 border-cyan-500 p-4 rounded-r-2xl shadow-[0_0_30px_rgba(6,182,212,0.2)] flex-1 w-full lg:w-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500 animate-pulse">
                <Activity size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black text-white leading-tight">ASTRO COLONY <span className="text-cyan-500">IDLE+</span></h1>
                <p className="text-[10px] text-cyan-500/70">SECTOR: LOCAL-7 | RANK: {militaryRank}</p>
              </div>
            </div>
            <button
              onClick={saveGame}
              className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
              aria-label="Save colony"
            >
              <Save size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mt-4">
            <ResourceItem icon={<Zap size={14} />} label="ENERGY" value={resources.ENERGY} color={resourceColors.ENERGY} />
            <ResourceItem icon={<Hexagon size={14} />} label="METAL" value={resources.METAL} color={resourceColors.METAL} />
            <ResourceItem icon={<Box size={14} />} label="CRYSTAL" value={resources.CRYSTAL} color={resourceColors.CRYSTAL} />
            <ResourceItem icon={<Wind size={14} />} label="GAS" value={resources.GAS} color={resourceColors.GAS} />
            <ResourceItem icon={<Atom size={14} />} label="DARK" value={resources.DARK_MATTER} color={resourceColors.DARK_MATTER} />
            <ResourceItem icon={<Bot size={14} />} label="Q-DUST" value={resources.QUANTUM_DUST} color={resourceColors.QUANTUM_DUST} />
            <ResourceItem icon={<Skull size={14} />} label="BIOMASS" value={resources.ALIEN_BIOMASS} color={resourceColors.ALIEN_BIOMASS} />
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl p-4 border border-cyan-500/30 rounded-2xl flex flex-row lg:flex-col gap-4 lg:gap-2 items-center lg:items-stretch w-full lg:w-48">
          <div className="flex-1 flex flex-col gap-1">
             <div className="flex justify-between text-[10px]">
                <span>SHIELDS</span>
                <span>{Math.round((shields/maxShields)*100)}%</span>
             </div>
             <div className="h-1.5 w-full bg-cyan-950 rounded-full overflow-hidden border border-cyan-500/20">
                <div className="h-full bg-cyan-500 shadow-[0_0_10px_cyan]" style={{ width: `${(shields/maxShields)*100}%` }} />
             </div>
          </div>
          <div className="flex gap-4 lg:justify-between items-center text-xs">
            <Metric icon={<Bot size={14} />} label="DRONES" value={drones} />
            <Metric icon={<Shield size={14} />} label="DEFENSE" value={defenseRating} />
            <Metric icon={<Skull size={14} />} label="THREAT" value={`${threatLevel}%`} color={threatLevel > 70 ? 'text-red-500' : ''} />
          </div>
        </div>
      </div>

      {/* Main Layout Area: Central UI and Side Panel */}
      <div className="flex-1 flex flex-row gap-4 my-4 overflow-hidden">
        {/* Left Spacer for 3D View */}
        <div className="flex-1" />

        {/* Dynamic Side Panel for Tablet/Desktop */}
        <div className={`pointer-events-auto transition-all duration-500 ease-in-out flex flex-col gap-4 ${sidePanelOpen ? 'w-full lg:w-[28rem]' : 'w-0 opacity-0 lg:w-0'}`}>
          <div className="bg-black/70 backdrop-blur-2xl border-l border-cyan-500/50 rounded-2xl p-4 flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <h2 className="text-sm font-bold flex items-center gap-2"><Cpu size={16} /> COLONY COMMAND</h2>
              <button onClick={() => setSidePanelOpen(false)} className="lg:hidden text-cyan-500"><X size={20} /></button>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
              <TechPanel technologies={technologies} resources={resources} unlockTechnology={unlockTechnology} />

              <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs mb-3 font-black"><Wifi size={14} /> MULTIPLAYER UPLINK</div>
                <div className="grid grid-cols-2 gap-2">
                  {(['SOLO', 'HOTSPOT_HOST', 'WIFI_DIRECT_PEER', 'LAN_CLIENT'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setHostMode(mode)}
                      className={`rounded-lg border px-3 py-2 text-[10px] transition-all flex items-center gap-2 ${hostMode === mode ? 'border-cyan-400 bg-cyan-500/30 text-white shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'border-cyan-500/10 bg-black/40 text-cyan-300/60 hover:border-cyan-500/40 hover:bg-cyan-500/5'}`}
                    >
                      <Wifi size={10} /> {mode.replaceAll('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <ChatPanel
                chatLog={chatLog}
                chatDraft={chatDraft}
                setChatDraft={setChatDraft}
                sendChatMessage={sendChatMessage}
                playerId={playerId}
              />
            </div>
          </div>
        </div>

        {/* Toggle Panel Button (Floating on Mobile) */}
        {!sidePanelOpen && (
          <button
            onClick={() => setSidePanelOpen(true)}
            className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 border border-cyan-500 p-3 rounded-full text-cyan-400 hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

      {/* Bottom Bar: Quick Actions & Construction */}
      <div className="pointer-events-auto flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/30 p-2 rounded-2xl flex gap-2 overflow-x-auto max-w-[50vw] scrollbar-hide">
            {buildings.slice(-5).map((building) => (
              <BuildingChip key={building.id} building={building} />
            ))}
          </div>
        </div>

        <div className="bg-black/80 backdrop-blur-2xl border-t-2 border-cyan-500 p-4 rounded-t-3xl shadow-[0_-10px_40px_rgba(6,182,212,0.2)] flex items-center gap-6">
          <button
            onClick={() => setShowBuildMenu(true)}
            className="flex flex-col items-center gap-1 group text-cyan-400 hover:text-white transition-all transform hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center border-2 border-cyan-500 group-hover:bg-cyan-500 group-hover:text-black transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Hammer size={32} />
            </div>
            <span className="text-[10px] font-black">CONSTRUCTION</span>
          </button>

          <div className="h-12 w-px bg-cyan-500/20" />

          <button
            onClick={() => setSidePanelOpen(!sidePanelOpen)}
            className="flex flex-col items-center gap-1 group text-purple-400 hover:text-white transition-all"
          >
             <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center border-2 border-purple-500 group-hover:bg-purple-500 group-hover:text-black transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Layout size={28} />
            </div>
            <span className="text-[10px] font-black">PANELS</span>
          </button>
        </div>
      </div>

      {showBuildMenu && (
        <BuildMenu resources={resources} onClose={() => setShowBuildMenu(false)} onPurchase={purchaseBuilding} />
      )}
    </div>
  );
};

const ResourceItem = ({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) => (
  <div className="flex flex-col border border-cyan-500/10 bg-black/40 p-2 rounded-lg hover:border-cyan-500/30 transition-colors">
    <div className="flex items-center gap-1 text-[8px] opacity-60 mb-1">
      {icon} <span>{label}</span>
    </div>
    <div className={`text-sm font-black ${color}`}>{Math.floor(value).toLocaleString()}</div>
  </div>
);

const Metric = ({ icon, label, value, color = 'text-white' }: { icon: ReactNode; label: string; value: string | number; color?: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-cyan-500 opacity-60">{icon}</span>
    <div className="flex flex-col">
       <span className="text-[8px] opacity-50">{label}</span>
       <span className={`font-black ${color}`}>{value}</span>
    </div>
  </div>
);

const BuildingChip = ({ building }: { building: Building }) => (
  <div className="flex flex-col items-center bg-cyan-500/5 px-4 py-2 rounded-xl border border-cyan-500/20 min-w-[100px]">
    <span className="text-[8px] text-cyan-300/70 truncate w-full text-center mb-1">{building.category}</span>
    <span className="text-xs font-black text-white">{building.name}</span>
    <div className="mt-1 h-0.5 w-full bg-cyan-900 overflow-hidden rounded-full">
      <div className="h-full bg-cyan-400" style={{ width: '100%' }} />
    </div>
  </div>
);

const BuildMenu = ({
  resources,
  onClose,
  onPurchase,
}: {
  resources: Record<ResourceType, number>;
  onClose: () => void;
  onPurchase: (building: Omit<Building, 'id'>) => boolean;
}) => {
  const [filter, setFilter] = useState<string | null>(null);
  const categories = Array.from(new Set(BUILDING_TEMPLATES.map(t => t.category)));

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4">
      <div className="bg-black border-2 border-cyan-500 p-8 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(6,182,212,0.4)]">
        <button onClick={onClose} className="absolute top-6 right-6 text-cyan-500 hover:text-white transition-transform hover:rotate-90" aria-label="Close build menu">
          <X size={40} />
        </button>

        <div className="mb-8">
          <h2 className="text-4xl font-black mb-2 flex items-center gap-4"><Hammer size={36} /> CONSTRUCTION TERMINAL</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setFilter(null)}
              className={`px-4 py-1 rounded-full border text-[10px] font-black transition-all ${!filter ? 'bg-cyan-500 text-black border-cyan-500' : 'border-cyan-500/30 text-cyan-500 hover:border-cyan-500'}`}
            >
              ALL SYSTEMS
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1 rounded-full border text-[10px] font-black transition-all ${filter === cat ? 'bg-cyan-500 text-black border-cyan-500' : 'border-cyan-500/30 text-cyan-500 hover:border-cyan-500'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-2 scrollbar-hide">
          {BUILDING_TEMPLATES.filter(t => !filter || t.category === filter).map((template) => {
            const canAffordBuilding = Object.entries(template.cost).every(
              ([res, amount]) => (resources[res as ResourceType] || 0) >= (amount || 0),
            );

            return (
              <div key={template.name} className="group border border-cyan-500/20 p-5 rounded-2xl flex flex-col gap-4 bg-cyan-950/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white group-hover:text-cyan-400 transition-colors">{template.name}</h3>
                    <span className="text-[8px] bg-cyan-500/20 px-2 py-0.5 rounded-full text-cyan-300">{template.category}</span>
                  </div>
                  <p className="text-[10px] text-cyan-100/60 normal-case tracking-normal mb-4 line-clamp-2">{template.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(template.cost).map(([res, amount]) => (
                      <div key={res} className="flex items-center justify-between border-b border-cyan-500/10 pb-1">
                        <span className="text-[8px] opacity-60">{res}</span>
                        <span className={`text-[10px] font-black ${(resources[res as ResourceType] || 0) >= (amount || 0) ? 'text-cyan-200' : 'text-red-500'}`}>
                          {amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  disabled={!canAffordBuilding}
                  onClick={() => {
                    if (onPurchase(template)) onClose();
                  }}
                  className={`w-full py-3 rounded-xl font-black transition-all ${canAffordBuilding ? 'bg-cyan-500 text-black hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                >
                  INITIALIZE {template.type}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const TechPanel = ({
  technologies,
  resources,
  unlockTechnology,
}: {
  technologies: Technology[];
  resources: Record<ResourceType, number>;
  unlockTechnology: (techId: string) => boolean;
}) => (
  <div className="bg-purple-950/10 border border-purple-500/30 rounded-2xl p-4">
    <div className="flex items-center gap-2 text-xs text-white mb-4 font-black"><Atom size={16} className="text-purple-400" /> SELF-EVOLVING TECH</div>
    <div className="space-y-3">
      {technologies.map((tech) => {
        const canAffordTech = Object.entries(tech.cost).every(([res, amount]) => (resources[res as ResourceType] || 0) >= (amount || 0));
        return (
          <button
            key={tech.id}
            disabled={tech.unlocked || !canAffordTech}
            onClick={() => unlockTechnology(tech.id)}
            className={`block w-full text-left rounded-xl border p-3 transition-all ${tech.unlocked ? 'border-green-400/40 bg-green-500/10 text-green-200' : canAffordTech ? 'border-purple-400/60 bg-purple-500/20 text-purple-100 hover:bg-purple-500/40 hover:scale-[1.02]' : 'border-gray-800 bg-gray-900/60 text-gray-600'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-white">{tech.name}</span>
              <span className="text-[8px] uppercase tracking-tighter text-purple-400">{tech.rarity}</span>
            </div>
            <div className="text-[9px] opacity-70 normal-case mb-2">{tech.benefits[0]}</div>
            <div className="h-1 w-full bg-purple-950/50 rounded-full overflow-hidden">
               <div className={`h-full ${tech.unlocked ? 'bg-green-400' : 'bg-purple-400'}`} style={{ width: tech.unlocked ? '100%' : `${tech.progress}%` }} />
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

const ChatPanel = ({
  chatLog, chatDraft, setChatDraft, sendChatMessage, playerId
}: {
  chatLog: any[], chatDraft: string, setChatDraft: (v: string) => void, sendChatMessage: (m: string) => void, playerId: string
}) => (
  <div className="bg-blue-950/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col min-h-[200px]">
    <div className="flex items-center gap-2 text-xs text-white mb-3 font-black"><Send size={14} className="text-blue-400" /> LOCAL GALAXY UPLINK</div>
    <div className="flex-1 h-32 overflow-y-auto space-y-2 pr-2 scrollbar-hide text-[10px] normal-case tracking-normal">
      {chatLog.map((chat) => (
        <div key={chat.id} className={`border-l-2 ${chat.playerId === playerId ? 'border-blue-400 bg-blue-500/5' : 'border-cyan-500/30'} pl-2 py-1`}>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest">{chat.channel}</span>
            <span className="text-[7px] opacity-40">{new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <p className="text-cyan-100/90 leading-relaxed">{chat.message}</p>
        </div>
      ))}
    </div>
    <form
      className="mt-4 flex gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!chatDraft.trim()) return;
        sendChatMessage(chatDraft.trim());
        setChatDraft('');
      }}
    >
      <input
        value={chatDraft}
        onChange={(event) => setChatDraft(event.target.value)}
        className="min-w-0 flex-1 bg-black/40 border border-blue-500/30 rounded-xl px-4 py-2 text-[10px] normal-case outline-none focus:border-blue-400 focus:bg-blue-500/5 transition-all"
        placeholder="Broadcast message..."
      />
      <button className="bg-blue-500 text-black rounded-xl px-4 hover:bg-white transition-all shadow-[0_0_15px_rgba(59,130,246,0.4)]" aria-label="Send chat">
        <Send size={14} />
      </button>
    </form>
  </div>
);
