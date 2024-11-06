import { io, Socket } from 'socket.io-client';
import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useProfile } from './ProfileContext';

interface SocketContextType {
  socket: Socket;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

const socket = io(import.meta.env.VITE_API_URL, {
  autoConnect: false
});

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const profile = useProfile();

  useEffect(() => {
    if (profile?.user?._id) {
      socket.auth = { _id: profile.user._id };
      socket.connect();
    } else {
      socket.disconnect();
    }

    return () => {
      socket.disconnect();
    };
  }, [profile?.user?._id]);

  return <SocketContext.Provider value={{ socket }}>{children}</SocketContext.Provider>;
};

export default SocketProvider;
