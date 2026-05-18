
export interface PeerColony {
  id: string;
  name: string;
  threatLevel: number;
  rank: number;
  lastSeen: number;
}

class LocalDiscovery {
  private peers: PeerColony[] = [];
  private onPeersUpdated: (peers: PeerColony[]) => void = () => {};

  startDiscovery(callback?: (peers: PeerColony[]) => void) {
    if (callback) this.onPeersUpdated = callback;

    // Simulate finding peers over WiFi Direct / Hotspot
    setInterval(() => {
      if (Math.random() < 0.1 && this.peers.length < 5) {
        this.addMockPeer();
      }
      this.peers = this.peers.filter(p => (Date.now() - p.lastSeen) < 30000);
      this.onPeersUpdated([...this.peers]);
    }, 5000);
  }

  private addMockPeer() {
    const names = ['Nebula Outpost', 'Void Station', 'Zenith Colony', 'Titan Base'];
    const newPeer: PeerColony = {
      id: `peer-${Math.random().toString(36).substr(2, 5)}`,
      name: names[Math.floor(Math.random() * names.length)],
      threatLevel: Math.floor(Math.random() * 100),
      rank: Math.floor(Math.random() * 10) + 1,
      lastSeen: Date.now()
    };
    this.peers.push(newPeer);
  }

  getPeers() {
    return this.peers;
  }
}

export const localDiscovery = new LocalDiscovery();
