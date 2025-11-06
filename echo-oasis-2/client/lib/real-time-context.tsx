import React, { createContext, useContext, ReactNode } from "react";
import useRealTimeUpdates from "@/hooks/use-real-time-updates";

interface RealTimeContextType {
  isRealTimeEnabled: boolean;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectCount: number;
  forceReconnect: () => void;
}

const RealTimeContext = createContext<RealTimeContextType | undefined>(
  undefined,
);

export const useRealTime = () => {
  const context = useContext(RealTimeContext);
  if (context === undefined) {
    throw new Error("useRealTime must be used within a RealTimeProvider");
  }
  return context;
};

interface RealTimeProviderProps {
  children: ReactNode;
}

export const RealTimeProvider: React.FC<RealTimeProviderProps> = ({
  children,
}) => {
  const realTimeHook = useRealTimeUpdates();

  const value: RealTimeContextType = {
    isRealTimeEnabled: realTimeHook.isRealTimeEnabled,
    isConnected: realTimeHook.isConnected,
    isConnecting: realTimeHook.isConnecting,
    error: realTimeHook.error,
    reconnectCount: realTimeHook.reconnectCount,
    forceReconnect: realTimeHook.forceReconnect,
  };

  return (
    <RealTimeContext.Provider value={value}>
      {children}
    </RealTimeContext.Provider>
  );
};
