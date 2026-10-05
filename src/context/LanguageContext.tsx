import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'bn' | 'en';

interface LanguageContextType {
  lang: Language;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  bn: {
    'home': 'হোম',
    'videos': 'ভিডিও',
    'games': 'গেমস',
    'community': 'কমিউনিটি',
    'nexus': 'নেক্সাস',
    'sonexas_ai': 'সোনেক্সাস এআই',
    'contact': 'যোগাযোগ',
    // Add more translations as needed
  },
  en: {
    'home': 'Home',
    'videos': 'Videos',
    'games': 'Games',
    'community': 'Community',
    'nexus': 'Nexus',
    'sonexas_ai': 'Sonexas AI',
    'contact': 'Contact',
    // Add more translations as needed
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>('bn');
  
  const toggleLang = () => setLang(prev => prev === 'bn' ? 'en' : 'bn');
  
  const t = (key: string) => translations[lang][key] || key;
  
  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};
