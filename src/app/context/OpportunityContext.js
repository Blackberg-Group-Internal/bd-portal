import { createContext, useState, useContext } from 'react';

const OpportunityContext = createContext();

export const OpportunityProvider = ({ children }) => {
  const [selectedOpportunity, setSelectedOpportunity] = useState(null);

  return (
    <OpportunityContext.Provider value={{ selectedOpportunity, setSelectedOpportunity }}>
      {children}
    </OpportunityContext.Provider>
  );
};

export const useOpportunity = () => {
  const context = useContext(OpportunityContext);
  if (!context) {
    throw new Error('useOpportunity must be used within an OpportunityProvider');
  }
  return context;
};
