import { IUser } from '@/types/user';
import React, { createContext, ReactNode, useContext, useState } from 'react';

interface ProfileContextType {
  user: IUser | null;
  setUser: (user: IUser | null) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  return useContext(ProfileContext);
};

const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser_] = useState<IUser | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setUser = (user: IUser | null) => {
    setUser_(user);
  };

  const value = { user, setUser };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
};

export default ProfileProvider;
