import { NetworkStateSnapshot } from './types';

export class NetworkMonitor {
  private currentState: NetworkStateSnapshot = {
    isConnected: true,
    isInternetReachable: true,
    connectionType: 'wifi',
    details: {
      ssid: 'FCyT-LabRedes-5G',
      ipAddress: '192.168.1.105',
      subnet: '255.255.255.0',
      isConnectionExpensive: false,
    },
  };

  private listeners: Set<(state: NetworkStateSnapshot) => void> = new Set();

  constructor() {
    // In native runtime: NetInfo.addEventListener(state => this.updateState(state))
  }

  getCurrentState(): NetworkStateSnapshot {
    return { ...this.currentState };
  }

  subscribe(callback: (state: NetworkStateSnapshot) => void): () => void {
    this.listeners.add(callback);
    callback(this.getCurrentState());
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Toggles simulated network state for testing Offline-First behavior in lab/demo
   */
  setSimulatedConnectivity(connected: boolean) {
    this.currentState = {
      ...this.currentState,
      isConnected: connected,
      isInternetReachable: connected,
      connectionType: connected ? 'wifi' : 'none',
    };
    this.listeners.forEach((cb) => cb(this.currentState));
  }
}

export const networkMonitor = new NetworkMonitor();
