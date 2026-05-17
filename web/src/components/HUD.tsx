import { useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { Zap, Hexagon, Box, Wind, Hammer, Save, X } from 'lucide-react';
import { BUILDING_TEMPLATES } from '../shared/constants/buildings';
import type { ResourceType } from '../shared/schemas/game';

export const HUD = () => {
  const { resources, colonyName, buildings, saveGame, purchaseBuilding } = useGameStore();
  const [showBuildMenu, setShowBuildMenu] = useState(false);

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 text-cyan-400 font-mono uppercase tracking-widest">
      {/* Top Bar */}
      <div className="flex justify-between items-start pointer-events-auto bg-black/40 backdrop-blur-md p-4 border border-cyan-500/30 rounded-lg">
        <div>
          <h1 className="text-2xl font-bold text-white">{colonyName}</h1>
          <div className="flex gap-4 mt-2">
            <ResourceItem icon={<Zap size={16}/>} label="Energy" value={Math.floor(resources.ENERGY)} color="text-yellow-400" />
            <ResourceItem icon={<Hexagon size={16}/>} label="Metal" value={Math.floor(resources.METAL)} color="text-gray-300" />
            <ResourceItem icon={<Box size={16}/>} label="Crystal" value={Math.floor(resources.CRYSTAL)} color="text-blue-300" />
            <ResourceItem icon={<Wind size={16}/>} label="Gas" value={Math.floor(resources.GAS)} color="text-green-300" />
          </div>
        </div>
        <button
          onClick={saveGame}
          className="bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500 p-2 rounded transition-colors"
        >
          <Save size={24} />
        </button>
      </div>

      {/* Build Menu Overlay */}
      {showBuildMenu && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto z-50">
          <div className="bg-black border-2 border-cyan-500 p-8 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto relative">
            <button
              onClick={() => setShowBuildMenu(false)}
              className="absolute top-4 right-4 text-cyan-500 hover:text-white"
            >
              <X size={32} />
            </button>
            <h2 className="text-3xl font-bold mb-6 border-b border-cyan-500/30 pb-2">Construction Terminal</h2>
            <div className="grid grid-cols-1 gap-4">
              {BUILDING_TEMPLATES.map((template, idx) => {
                const canAfford = Object.entries(template.cost).every(
                  ([res, amt]) => (resources[res as ResourceType] || 0) >= amt
                );

                return (
                  <div key={idx} className="border border-cyan-500/30 p-4 rounded-lg flex justify-between items-center hover:bg-cyan-500/5 transition-colors">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{template.name}</h3>
                      <p className="text-xs text-cyan-200/70 lowercase mb-2">{template.description}</p>
                      <div className="flex gap-4 text-[10px]">
                        {Object.entries(template.cost).map(([res, amt]) => (
                          <span key={res} className={(resources[res as ResourceType] || 0) >= amt ? "text-gray-400" : "text-red-500"}>
                            {res}: {amt}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        if (purchaseBuilding(template)) {
                          setShowBuildMenu(false);
                        }
                      }}
                      className={`px-6 py-2 rounded font-bold transition-all ${
                        canAfford
                        ? "bg-cyan-500 text-black hover:bg-white shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                        : "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
                      }`}
                    >
                      INITIALIZE
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Bar */}
      <div className="flex justify-center gap-4 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/50 p-4 rounded-t-2xl flex gap-6 items-end">
          <button
            onClick={() => setShowBuildMenu(true)}
            className="flex flex-col items-center gap-1 group text-cyan-400 hover:text-white transition-colors"
          >
            <Hammer size={32} className="group-hover:scale-110 transition-transform" />
            <span className="text-xs">Build</span>
          </button>
          <div className="h-10 w-px bg-cyan-500/30 self-center"></div>
          <div className="flex gap-4 overflow-x-auto max-w-md">
            {buildings.slice(-5).map(b => (
              <div key={b.id} className="flex flex-col items-center bg-cyan-500/10 p-2 rounded border border-cyan-500/20 min-w-[80px]">
                <span className="text-[10px] text-cyan-200 truncate w-full text-center">{b.name}</span>
                <span className="text-xs font-bold text-white">LVL {b.level}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ResourceItem = ({ icon, label, value, color }: { icon: any, label: string, value: number, color: string }) => (
  <div className="flex flex-col">
    <div className="flex items-center gap-1 text-[10px] opacity-70">
      {icon} <span>{label}</span>
    </div>
    <div className={`text-lg font-bold ${color}`}>{value.toLocaleString()}</div>
  </div>
);
