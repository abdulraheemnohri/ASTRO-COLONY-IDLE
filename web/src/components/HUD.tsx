import { useGameStore } from '../store/useGameStore';
import { Zap, Hexagon, Box, Wind, Hammer, Save } from 'lucide-react';

export const HUD = () => {
  const { resources, colonyName, buildings, saveGame } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none flex flex-col justify-between p-6 text-cyan-400 font-mono uppercase tracking-widest">
      {/* Top Bar: Colony Info and Resources */}
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

      {/* Bottom Bar: Buildings and Actions */}
      <div className="flex justify-center gap-4 pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-xl border border-cyan-500/50 p-4 rounded-t-2xl flex gap-6">
          <div className="flex flex-col items-center gap-1 cursor-pointer hover:text-white transition-colors">
            <Hammer size={32} />
            <span className="text-xs">Build</span>
          </div>
          <div className="h-10 w-px bg-cyan-500/30 self-center"></div>
          <div className="flex gap-4 overflow-x-auto max-w-md">
            {buildings.map(b => (
              <div key={b.id} className="flex flex-col items-center bg-cyan-500/10 p-2 rounded border border-cyan-500/20 min-w-[80px]">
                <span className="text-[10px] text-cyan-200">{b.name}</span>
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
