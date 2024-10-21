import { IUser } from '@/types/user';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface UserContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  return useContext(UserContext);
};

const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser_] = useState<IUser | null>(null);

  const setUser = (user: IUser | null) => {
    setUser_(user);
  };

  const value = { user, setUser };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
