'use client';
import { createContext, useContext, useState } from 'react';

// Define the possible tab values
export type Tab = 'profile' | 'addresses' | 'orders' | 'support';

// Define the context type
interface TabContextType {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

// Create the context
const TabContext = createContext<TabContextType | undefined>(undefined);

// Create the provider component
export function TabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  const value = {
    activeTab,
    setActiveTab: (tab: Tab) => {
      setActiveTab(tab);
      // Optionally save to localStorage if you want to persist the tab state
      localStorage.setItem('activeTab', tab);
    }
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
}

// Create the hook for using the context
export function useTab() {
  const context = useContext(TabContext);
  if (context === undefined) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
} 