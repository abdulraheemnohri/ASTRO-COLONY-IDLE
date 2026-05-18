import { useState, useEffect } from 'react';
import { Wifi, Shield, Activity, Send, ShoppingCart } from 'lucide-react';
import { localDiscovery, type PeerColony } from '../store/localDiscovery';
import { useGameStore } from '../store/useGameStore';

export const MultiplayerPanel = () => {
  const [peers, setPeers] = useState<PeerColony[]>([]);
  const { hostMode, setHostMode } = useGameStore();

  useEffect(() => {
    localDiscovery.startDiscovery((updated) => setPeers(updated));
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-4">
        <div className="flex items-center gap-2 text-xs mb-4 font-black text-cyan-400">
          <Wifi size={14} /> CONNECTION PROTOCOL
        </div>
        <div className="grid grid-cols-2 gap-2">
          {(['SOLO', 'HOTSPOT_HOST', 'WIFI_DIRECT_PEER', 'LAN_CLIENT'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setHostMode(mode)}
              className={`rounded-lg border px-3 py-2 text-[10px] transition-all flex items-center justify-center gap-2 ${hostMode === mode ? 'border-cyan-400 bg-cyan-500/30 text-white' : 'border-cyan-500/10 bg-black/40 text-cyan-300/60 hover:border-cyan-500/40'}`}
            >
              {mode.replaceAll('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black text-cyan-500/70">NEARBY COLONIES</span>
          <span className="text-[8px] bg-cyan-500/20 px-2 py-0.5 rounded text-cyan-300">{peers.length} ACTIVE</span>
        </div>

        {peers.length === 0 ? (
          <div className="bg-black/40 border border-dashed border-cyan-500/20 rounded-xl p-8 text-center">
            <Activity size={24} className="mx-auto mb-2 opacity-20 animate-pulse" />
            <p className="text-[10px] opacity-40">SCANNING LOCAL SECTOR...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {peers.map(peer => (
              <div key={peer.id} className="bg-cyan-950/20 border border-cyan-500/20 rounded-xl p-3 hover:border-cyan-500/40 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-xs font-black text-white group-hover:text-cyan-400">{peer.name}</h4>
                    <p className="text-[8px] opacity-50">RANK {peer.rank} COMMANDER</p>
                  </div>
                  <Shield size={14} className={peer.threatLevel > 50 ? 'text-red-400' : 'text-green-400'} />
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                   <button className="flex items-center justify-center gap-1 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-[8px] font-bold hover:bg-blue-500/20">
                     <Send size={10} /> COMM
                   </button>
                   <button className="flex items-center justify-center gap-1 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-[8px] font-bold hover:bg-purple-500/20">
                     <ShoppingCart size={10} /> TRADE
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
