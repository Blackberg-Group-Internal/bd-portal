import { createContext, useContext } from 'react';

const SEOContext = createContext();

export const SEOProvider = ({ children, seo }) => {
  return (
    <SEOContext.Provider value={seo}>
      {children}
    </SEOContext.Provider>
  );
};

export const useSEO = () => useContext(SEOContext);