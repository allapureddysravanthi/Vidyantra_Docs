import React, { createContext, useContext, useState } from 'react';

const NavigationContext = createContext();

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export const NavigationProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Platform");
  const [showNavbarSearch, setShowNavbarSearch] = useState(true); // Show by default on other pages
  const [searchValue, setSearchValue] = useState("");

  const value = {
    activeTab,
    setActiveTab,
    showNavbarSearch,
    setShowNavbarSearch,
    searchValue,
    setSearchValue
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
