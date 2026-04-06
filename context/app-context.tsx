'use client';
import { createContext, ReactNode, useContext } from 'react';
import {IConfig} from "@/models/config.model";

type ContextType = { config: IConfig }

const AppContext = createContext<ContextType | null>(null);

export const AppContextProvider = ({
                                     children,
                                     config,
                                   }: {
  children: ReactNode
  config: IConfig
}) => {
  return (
    <AppContext.Provider value={{ config }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used inside AppContextProvider');
  return ctx;
};
