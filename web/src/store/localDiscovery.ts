import { Capacitor } from '@capacitor/core';
import { useGameStore } from './useGameStore';

export interface Peer {
  id: string;
  name: string;
  isHost: boolean;
}

class LocalDiscovery {
  private peers: Peer[] = [];
  private interval: any = null;

  startDiscovery() {
    if (this.interval) return;

    // Simulate finding peers every 10 seconds
    this.interval = setInterval(() => {
      if (Math.random() < 0.3) {
        const newPeer: Peer = {
          id: `peer-${Math.floor(Math.random() * 1000)}`,
          name: `Colony-${Math.random().toString(36).substring(7).toUpperCase()}`,
          isHost: Math.random() > 0.5,
        };

        this.peers = [...this.peers.slice(-4), newPeer];

        if (Capacitor.isNativePlatform()) {
          useGameStore.getState().sendChatMessage(
            `Local colony signature detected: ${newPeer.name}`,
            'SYSTEM'
          );
        }
      }
    }, 10000);
  }

  stopDiscovery() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  getAvailablePeers() {
    return this.peers;
  }
}

export const localDiscovery = new LocalDiscovery();
