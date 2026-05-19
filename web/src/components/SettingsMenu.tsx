import { X, Settings, Monitor, Thermometer, Volume2, Bell, Zap } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';
import type { GameSettings } from '../../../shared/schemas/game';

export const SettingsMenu = ({ onClose }: { onClose: () => void }) => {
  const { settings, updateSettings } = useGameStore();

  const handleQualityChange = (quality: GameSettings['graphicsQuality']) => {
    updateSettings({ graphicsQuality: quality });
  };

  return (
    <div className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center pointer-events-auto z-[100] p-4">
      <div className="bg-black border-2 border-cyan-500 p-8 rounded-3xl max-w-2xl w-full relative shadow-[0_0_50px_rgba(6,182,212,0.4)]">
        <button onClick={onClose} aria-label="Close settings" className="absolute top-6 right-6 text-cyan-500 hover:text-white transition-transform hover:rotate-90">
          <X size={32} />
        </button>

        <h2 className="text-3xl font-black mb-8 border-b border-cyan-500/20 pb-4 flex items-center gap-4">
          <Settings size={28} className="text-cyan-500" /> SYSTEM PREFERENCES
        </h2>

        <div className="space-y-8">
          {/* Graphics Quality */}
          <div>
            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-cyan-300">
              <Monitor size={18} /> GRAPHICS FIDELITY
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(['LITE', 'MEDIUM', 'ULTRA'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQualityChange(q)}
                  className={`py-3 rounded-xl border-2 font-black transition-all ${settings.graphicsQuality === q ? 'bg-cyan-500 text-black border-cyan-500' : 'border-cyan-500/20 text-cyan-500/60 hover:border-cyan-500/50'}`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Thermal Protection & Notifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between bg-cyan-950/20 p-4 rounded-2xl border border-cyan-500/10">
              <div className="flex items-center gap-3">
                <Thermometer size={20} className="text-orange-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">THERMAL PROTECTION</span>
                  <span className="text-[10px] opacity-50">Auto-throttle on heat</span>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ thermalProtection: !settings.thermalProtection })}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.thermalProtection ? 'bg-cyan-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.thermalProtection ? 'right-1' : 'left-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between bg-cyan-950/20 p-4 rounded-2xl border border-cyan-500/10">
              <div className="flex items-center gap-3">
                <Bell size={20} className="text-blue-400" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold">NOTIFICATIONS</span>
                  <span className="text-[10px] opacity-50">Raid & Tech alerts</span>
                </div>
              </div>
              <button
                onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
                className={`w-12 h-6 rounded-full relative transition-colors ${settings.notificationsEnabled ? 'bg-cyan-500' : 'bg-zinc-800'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.notificationsEnabled ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Sound Volume */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-cyan-300">
              <Volume2 size={18} /> AUDIO TRANSMISSION
            </div>
            <div className="flex items-center gap-4">
               <input
                 type="range" min="0" max="1" step="0.01"
                 value={settings.soundVolume}
                 onChange={(e) => updateSettings({ soundVolume: parseFloat(e.target.value) })}
                 className="flex-1 accent-cyan-500 h-1 bg-cyan-950 rounded-full appearance-none cursor-pointer"
               />
               <span className="text-xs font-black w-8 text-right">{Math.round(settings.soundVolume * 100)}%</span>
            </div>
          </div>

          {/* Simulation Speed */}
          <div>
            <div className="flex items-center gap-2 mb-3 text-sm font-bold text-cyan-300">
              <Zap size={18} /> TEMPORAL OVERCLOCK
            </div>
             <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5].map(speed => (
                    <button
                      key={speed}
                      onClick={() => updateSettings({ simulationSpeed: speed })}
                      className={`py-2 rounded-lg border font-black text-xs ${settings.simulationSpeed === speed ? 'bg-cyan-500 text-black border-cyan-500' : 'border-cyan-500/20 text-cyan-500/60'}`}
                    >
                        {speed}X
                    </button>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
