import { useMemo, useState, type ReactNode } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Zap, Hexagon, Box, Wind, Hammer, Save, X, Shield, Bot, Wifi, Send, Atom, Skull } from 'lucide-react';
import { BUILDING_TEMPLATES } from '../../../shared/constants/buildings';
import type { Building, ResourceType, Technology } from '../../../shared/schemas/game';

const resourceColors: Record<ResourceType, string> = {
  ENERGY: 'text-yellow-400',
  METAL: 'text-gray-300',
  CRYSTAL: 'text-blue-300',
  GAS: 'text-green-300',
  DARK_MATTER: 'text-purple-300',
  QUANTUM_DUST: 'text-fuchsia-300',
  ALIEN_BIOMASS: 'text-lime-300',
};

export const HUD = () => {
  const {
    resources,
    colonyName,
    buildings,
    technologies,
    drones,
    shields,
    threatLevel,
    hostMode,
    chatLog,
    saveGame,
    purchaseBuilding,
    unlockTechnology,
    setHostMode,
    sendChatMessage,
  } = useGameStore();
  const [showBuildMenu, setShowBuildMenu] = useState(false);
  const [chatDraft, setChatDraft] = useState('');

  const defenseRating = useMemo(
    () => buildings.reduce((total, building) => total + (building.defense || 0) * building.level, shields),
    [buildings, shields],
  );

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6 text-cyan-400 font-mono uppercase tracking-widest">
      <div className="grid gap-4 pointer-events-auto lg:grid-cols-[1fr_24rem]">
        <div className="bg-black/45 backdrop-blur-md p-4 border border-cyan-500/30 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.12)]">
          <div className="flex justify-between items-start gap-4">
            <div>
              <p className="text-[10px] text-cyan-300/70">Offline AI-Powered P2P Space Civilization</p>
              <h1 className="text-2xl font-bold text-white">{colonyName}</h1>
            </div>
            <button
              onClick={saveGame}
              className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500 p-2 rounded transition-colors"
              aria-label="Save colony"
            >
              <Save size={22} />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3 mt-4">
            <ResourceItem icon={<Zap size={16} />} label="Energy" value={resources.ENERGY} color={resourceColors.ENERGY} />
            <ResourceItem icon={<Hexagon size={16} />} label="Metal" value={resources.METAL} color={resourceColors.METAL} />
            <ResourceItem icon={<Box size={16} />} label="Crystal" value={resources.CRYSTAL} color={resourceColors.CRYSTAL} />
            <ResourceItem icon={<Wind size={16} />} label="Gas" value={resources.GAS} color={resourceColors.GAS} />
            <ResourceItem icon={<Atom size={16} />} label="Dark" value={resources.DARK_MATTER} color={resourceColors.DARK_MATTER} />
            <ResourceItem icon={<Bot size={16} />} label="Q-Dust" value={resources.QUANTUM_DUST} color={resourceColors.QUANTUM_DUST} />
            <ResourceItem icon={<Skull size={16} />} label="Biomass" value={resources.ALIEN_BIOMASS} color={resourceColors.ALIEN_BIOMASS} />
          </div>
        </div>

        <div className="bg-black/45 backdrop-blur-md p-4 border border-cyan-500/30 rounded-lg">
          <div className="grid grid-cols-3 gap-2 text-center">
            <Metric icon={<Bot size={16} />} label="Drones" value={drones} />
            <Metric icon={<Shield size={16} />} label="Defense" value={defenseRating} />
            <Metric icon={<Skull size={16} />} label="Threat" value={`${threatLevel}%`} />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
            {(['SOLO', 'HOTSPOT_HOST', 'WIFI_DIRECT_PEER', 'LAN_CLIENT'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setHostMode(mode)}
                className={`rounded border px-2 py-1 transition-colors ${hostMode === mode ? 'border-cyan-300 bg-cyan-500/30 text-white' : 'border-cyan-500/20 bg-cyan-500/5 text-cyan-300/70'}`}
              >
                <Wifi size={12} className="inline mr-1" />{mode.replaceAll('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-auto grid gap-4 lg:grid-cols-[18rem_1fr_22rem] items-end">
        <TechPanel technologies={technologies} resources={resources} unlockTechnology={unlockTechnology} />

        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/50 p-4 rounded-2xl flex gap-5 items-end justify-center">
          <button
            onClick={() => setShowBuildMenu(true)}
            className="flex flex-col items-center gap-1 group text-cyan-400 hover:text-white transition-colors"
          >
            <Hammer size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">Build</span>
          </button>
          <div className="h-12 w-px bg-cyan-500/30 self-center" />
          <div className="flex gap-3 overflow-x-auto max-w-xl">
            {buildings.slice(-6).map((building) => (
              <BuildingChip key={building.id} building={building} />
            ))}
          </div>
        </div>

        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/40 rounded-2xl p-3">
          <div className="flex items-center gap-2 text-xs text-white mb-2"><Wifi size={14} /> Local Galaxy Chat</div>
          <div className="h-28 overflow-y-auto space-y-1 text-[10px] normal-case tracking-normal">
            {chatLog.slice(-5).map((chat) => (
              <div key={chat.id} className="border-l border-cyan-500/30 pl-2 text-cyan-100/80">
                <span className="text-cyan-400 uppercase">[{chat.channel}]</span> {chat.message}
              </div>
            ))}
          </div>
          <form
            className="mt-2 flex gap-2"
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
              className="min-w-0 flex-1 bg-cyan-950/40 border border-cyan-500/20 rounded px-2 py-1 text-[10px] normal-case outline-none focus:border-cyan-300"
              placeholder="Local message..."
            />
            <button className="border border-cyan-500/30 rounded px-2 hover:bg-cyan-500/20" aria-label="Send chat">
              <Send size={13} />
            </button>
          </form>
        </div>
      </div>

      {showBuildMenu && (
        <BuildMenu resources={resources} onClose={() => setShowBuildMenu(false)} onPurchase={purchaseBuilding} />
      )}
    </div>
  );
};

const ResourceItem = ({ icon, label, value, color }: { icon: ReactNode; label: string; value: number; color: string }) => (
  <div className="rounded border border-cyan-500/20 bg-cyan-950/20 p-2">
    <div className="flex items-center gap-1 text-[10px] opacity-70">
      {icon} <span>{label}</span>
    </div>
    <div className={`text-lg font-bold ${color}`}>{Math.floor(value).toLocaleString()}</div>
  </div>
);

const Metric = ({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) => (
  <div className="rounded border border-cyan-500/20 bg-cyan-950/20 p-2">
    <div className="flex justify-center gap-1 text-cyan-300/70 text-[10px]">{icon}{label}</div>
    <div className="text-white font-bold">{value}</div>
  </div>
);

const BuildingChip = ({ building }: { building: Building }) => (
  <div className="flex flex-col items-center bg-cyan-500/10 p-2 rounded border border-cyan-500/20 min-w-[88px]">
    <span className="text-[10px] text-cyan-200 truncate w-full text-center">{building.name}</span>
    <span className="text-xs font-bold text-white">LVL {building.level}</span>
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
  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50 p-4">
    <div className="bg-black border-2 border-cyan-500 p-6 rounded-xl max-w-4xl w-full max-h-[84vh] overflow-y-auto relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-cyan-500 hover:text-white" aria-label="Close build menu">
        <X size={32} />
      </button>
      <h2 className="text-3xl font-bold mb-6 border-b border-cyan-500/30 pb-2">Construction Terminal</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {BUILDING_TEMPLATES.map((template) => {
          const canAffordBuilding = Object.entries(template.cost).every(
            ([res, amount]) => (resources[res as ResourceType] || 0) >= (amount || 0),
          );

          return (
            <div key={template.name} className="border border-cyan-500/30 p-4 rounded-lg flex flex-col gap-4 hover:bg-cyan-500/5 transition-colors">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white">{template.name}</h3>
                <p className="text-xs text-cyan-200/70 normal-case tracking-normal mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-2 text-[10px]">
                  {Object.entries(template.cost).map(([res, amount]) => (
                    <span key={res} className={(resources[res as ResourceType] || 0) >= (amount || 0) ? 'text-gray-400' : 'text-red-500'}>
                      {res}: {amount}
                    </span>
                  ))}
                </div>
              </div>
              <button
                disabled={!canAffordBuilding}
                onClick={() => {
                  if (onPurchase(template)) onClose();
                }}
                className={`px-6 py-2 rounded font-bold transition-all ${canAffordBuilding ? 'bg-cyan-500 text-black hover:bg-white shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'}`}
              >
                INITIALIZE
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const TechPanel = ({
  technologies,
  resources,
  unlockTechnology,
}: {
  technologies: Technology[];
  resources: Record<ResourceType, number>;
  unlockTechnology: (techId: string) => boolean;
}) => (
  <div className="bg-black/60 backdrop-blur-xl border border-purple-500/40 rounded-2xl p-3 max-h-56 overflow-y-auto">
    <div className="flex items-center gap-2 text-xs text-white mb-2"><Atom size={14} /> Self-Evolving Tech</div>
    <div className="space-y-2">
      {technologies.map((tech) => {
        const canAffordTech = Object.entries(tech.cost).every(([res, amount]) => (resources[res as ResourceType] || 0) >= (amount || 0));
        return (
          <button
            key={tech.id}
            disabled={tech.unlocked || !canAffordTech}
            onClick={() => unlockTechnology(tech.id)}
            className={`block w-full text-left rounded border p-2 text-[10px] normal-case tracking-normal ${tech.unlocked ? 'border-green-400/40 bg-green-500/10 text-green-200' : canAffordTech ? 'border-purple-400/40 bg-purple-500/10 text-purple-100 hover:bg-purple-500/20' : 'border-gray-600 bg-gray-900/60 text-gray-500'}`}
          >
            <span className="uppercase tracking-widest text-white">{tech.name}</span>
            <span className="ml-2 text-purple-300">{tech.rarity}</span>
            <div>{tech.benefits[0]}</div>
          </button>
        );
      })}
    </div>
  </div>
);
