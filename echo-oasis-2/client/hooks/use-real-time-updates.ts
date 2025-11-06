// Real-time updates hook - SSE removed for stability
export function useRealTimeUpdates() {
  // Return a stub implementation that indicates real-time is disabled
  return {
    isConnected: false,
    isConnecting: false,
    error: null,
    lastEvent: null,
    reconnectCount: 0,
    connect: () => console.log("Real-time updates disabled"),
    disconnect: () => console.log("Real-time updates disabled"),
    forceReconnect: () => console.log("Real-time updates disabled"),
    isRealTimeEnabled: false,
  };
}

export default useRealTimeUpdates;
