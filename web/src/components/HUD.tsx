import { useState, type ReactNode } from 'react';
import {
  Zap, Hexagon, Box, Wind, Atom, Bot, Skull,
  Save, Hammer, Shield, Send, X,
  ChevronLeft, Layout, Cpu, Activity, Settings as SettingsIcon
} from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import { BUILDING_TEMPLATES } from '../../../shared/constants/buildings';
import type { Building, ResourceType, Technology } from '../../../shared/schemas/game';
import { SettingsMenu } from './SettingsMenu';
import { MultiplayerPanel } from './MultiplayerPanel';

const resourceColors: Record<ResourceType, string> = {
  ENERGY: 'text-yellow-400',
  METAL: 'text-zinc-400',
  CRYSTAL: 'text-cyan-300',
  GAS: 'text-green-400',
  DARK_MATTER: 'text-purple-500',
  QUANTUM_DUST: 'text-blue-400',
  ALIEN_BIOMASS: 'text-lime-500',
  SCIENCE_POINTS: 'text-fuchsia-400',
};

export const HUD = () => {
  const {
    resources, buildings, technologies, chatLog, drones, shields, maxShields, threatLevel,
    playerId, militaryRank,
    saveGame, purchaseBuilding, unlockTechnology, sendChatMessage
  } = useGameStore();

  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [sidePanelOpen, setSidePanelOpen] = useState(true);

  const defenseRating = buildings.reduce((total, b) => total + (b.defense || 0) * (b.level || 1), shields);

  return (
    <div className="fixed inset-0 pointer-events-none p-4 flex flex-col justify-between font-mono uppercase tracking-wider text-cyan-500 overflow-hidden">
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
            <div className="flex gap-2">
                <button
                onClick={() => setShowSettings(true)}
                className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                aria-label="Settings"
                >
                <SettingsIcon size={20} />
                </button>
                <button
                onClick={saveGame}
                className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500 p-2 rounded-xl transition-all hover:scale-110 active:scale-95"
                aria-label="Save colony"
                >
                <Save size={20} />
                </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2 mt-4">
            <ResourceItem icon={<Zap size={14} />} label="ENERGY" value={resources.ENERGY} color={resourceColors.ENERGY} />
            <ResourceItem icon={<Hexagon size={14} />} label="METAL" value={resources.METAL} color={resourceColors.METAL} />
            <ResourceItem icon={<Box size={14} />} label="CRYSTAL" value={resources.CRYSTAL} color={resourceColors.CRYSTAL} />
            <ResourceItem icon={<Wind size={14} />} label="GAS" value={resources.GAS} color={resourceColors.GAS} />
            <ResourceItem icon={<Atom size={14} />} label="DARK" value={resources.DARK_MATTER} color={resourceColors.DARK_MATTER} />
            <ResourceItem icon={<Bot size={14} />} label="Q-DUST" value={resources.QUANTUM_DUST} color={resourceColors.QUANTUM_DUST} />
            <ResourceItem icon={<Skull size={14} />} label="BIOMASS" value={resources.ALIEN_BIOMASS} color={resourceColors.ALIEN_BIOMASS} />
            <ResourceItem icon={<Activity size={14} />} label="SCIENCE" value={resources.SCIENCE_POINTS} color={resourceColors.SCIENCE_POINTS} />
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

      <div className="flex-1 flex flex-row gap-4 my-4 overflow-hidden">
        <div className="flex-1" />

        <div className={`pointer-events-auto transition-all duration-500 ease-in-out flex flex-col gap-4 ${sidePanelOpen ? 'w-full lg:w-[28rem]' : 'w-0 opacity-0 lg:w-0'}`}>
          <div className="bg-black/70 backdrop-blur-2xl border-l border-cyan-500/50 rounded-2xl p-4 flex-1 flex flex-col gap-4 overflow-hidden">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <h2 className="text-sm font-bold flex items-center gap-2"><Cpu size={16} /> COLONY COMMAND</h2>
              <button onClick={() => setSidePanelOpen(false)} className="lg:hidden text-cyan-500"><X size={20} /></button>
            </div>

            <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2 scrollbar-hide">
              <TechPanel technologies={technologies} resources={resources} unlockTechnology={unlockTechnology} />

              <MultiplayerPanel />

              <ChatPanel
                chatLog={chatLog}
                sendChatMessage={sendChatMessage}
                playerId={playerId}
              />
            </div>
          </div>
        </div>

        {!sidePanelOpen && (
          <button
            onClick={() => setSidePanelOpen(true)}
            className="pointer-events-auto absolute right-4 top-1/2 -translate-y-1/2 bg-black/80 border border-cyan-500 p-3 rounded-full text-cyan-400 hover:text-white transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <ChevronLeft size={24} />
          </button>
        )}
      </div>

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
      {showSettings && (
        <SettingsMenu onClose={() => setShowSettings(false)} />
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
}) => (
  <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center pointer-events-auto z-50 p-4">
    <div className="bg-black border-2 border-cyan-500 p-8 rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col relative shadow-[0_0_50px_rgba(6,182,212,0.4)]">
      <button onClick={onClose} className="absolute top-6 right-6 text-cyan-500 hover:text-white transition-transform hover:rotate-90" aria-label="Close build menu">
        <X size={40} />
      </button>
      <div className="mb-8">
        <h2 className="text-4xl font-black mb-2 flex items-center gap-4"><Hammer size={36} /> CONSTRUCTION TERMINAL</h2>
      </div>
      <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pr-2 scrollbar-hide">
        {BUILDING_TEMPLATES.map((template) => {
          const canAffordBuilding = Object.entries(template.cost).every(
            ([res, amount]) => (resources[res as ResourceType] || 0) >= (amount || 0),
          );
          return (
            <div key={template.name} className="group border border-cyan-500/20 p-5 rounded-2xl flex flex-col gap-4 bg-cyan-950/10 hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all duration-300">
              <h3 className="text-xl font-black text-white">{template.name}</h3>
              <p className="text-[10px] text-cyan-100/60 mb-4">{template.description}</p>
              <button
                disabled={!canAffordBuilding}
                onClick={() => { if (onPurchase(template)) onClose(); }}
                className={`w-full py-3 rounded-xl font-black transition-all ${canAffordBuilding ? 'bg-cyan-500 text-black hover:bg-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
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

const TechPanel = ({ technologies, resources, unlockTechnology }: { technologies: Technology[], resources: Record<ResourceType, number>, unlockTechnology: (id: string) => boolean }) => (
  <div className="bg-purple-950/10 border border-purple-500/30 rounded-2xl p-4">
    <div className="flex items-center gap-2 text-xs text-white mb-4 font-black"><Atom size={16} className="text-purple-400" /> SELF-EVOLVING TECH</div>
    <div className="space-y-3">
      {technologies.map((tech) => {
        const canAfford = Object.entries(tech.cost).every(([res, amt]) => (resources[res as ResourceType] || 0) >= (amt || 0));
        return (
          <button
            key={tech.id}
            disabled={tech.unlocked || !canAfford}
            onClick={() => unlockTechnology(tech.id)}
            className={`block w-full text-left rounded-xl border p-3 transition-all ${tech.unlocked ? 'border-green-400/40 bg-green-500/10 text-green-200' : canAfford ? 'border-purple-400/60 bg-purple-500/20 text-purple-100 hover:bg-purple-500/40' : 'border-gray-800 bg-gray-900/60 text-gray-600'}`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-black text-white">{tech.name}</span>
            </div>
            <div className="text-[9px] opacity-70 normal-case mb-2">{tech.benefits[0]}</div>
          </button>
        );
      })}
    </div>
  </div>
);

const ChatPanel = ({ chatLog, playerId }: { chatLog: any[], sendChatMessage: (m: string) => void, playerId: string }) => (
  <div className="bg-blue-950/10 border border-blue-500/30 rounded-2xl p-4 flex flex-col min-h-[200px]">
    <div className="flex items-center gap-2 text-xs text-white mb-3 font-black"><Send size={14} className="text-blue-400" /> LOCAL GALAXY UPLINK</div>
    <div className="flex-1 h-32 overflow-y-auto space-y-2 pr-2 scrollbar-hide text-[10px] normal-case tracking-normal">
      {chatLog.map((chat) => (
        <div key={chat.id} className={`border-l-2 ${chat.playerId === playerId ? 'border-blue-400 bg-blue-500/5' : 'border-cyan-500/30'} pl-2 py-1`}>
          <p className="text-cyan-100/90 leading-relaxed">{chat.message}</p>
        </div>
      ))}
    </div>
  </div>
);
