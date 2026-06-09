import React, { createContext, useState, useCallback, ReactNode } from 'react';
import { I18nManager } from 'react-native';
import { Language, translations, TranslationKey } from '@/constants/i18n';
import { Colors } from '@/constants/theme';

interface AppTheme {
  isDark: boolean;
  colors: typeof Colors.dark;
}

interface AppContextType {
  language: Language;
  isRTL: boolean;
  theme: AppTheme;
  isDark: boolean;
  t: (key: TranslationKey) => string;
  toggleLanguage: () => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isDark, setIsDark] = useState(true);

  const isRTL = language === 'ar';

  const theme: AppTheme = {
    isDark,
    colors: isDark ? Colors.dark : Colors.light,
  };

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] as string;
    },
    [language]
  );

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  return (
    <AppContext.Provider
      value={{
        language,
        isRTL,
        theme,
        isDark,
        t,
        toggleLanguage,
        toggleTheme,
        setLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
