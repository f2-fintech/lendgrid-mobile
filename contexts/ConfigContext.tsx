import React, { createContext, useContext, useState, useEffect } from 'react';

export type AppConfig = {
  isReviewMode: boolean;
  showEmiCalculator: boolean;
  showCibilCheck: boolean;
  terminology: {
    loanWord: string;
    loansWord: string;
    bankerWord: string;
    eligibilityWord: string;
  };
};

const defaultConfig: AppConfig = {
  isReviewMode: true,
  showEmiCalculator: false,
  showCibilCheck: false,
  terminology: {
    loanWord: 'Service',
    loansWord: 'Services',
    bankerWord: 'Manager',
    eligibilityWord: 'Client Leads',
  },
};

const ConfigContext = createContext<{
  config: AppConfig;
  isLoading: boolean;
}>({
  config: defaultConfig,
  isLoading: true,
});

export const useAppConfig = () => useContext(ConfigContext);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<AppConfig>(defaultConfig);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        // We use the base URL from env, removing /api/v1 or /graphql if present, since our endpoint is at root
        const baseUrl = (process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.5:4000')
          .replace('/api/v1', '')
          .replace('/graphql', '');
        const response = await fetch(`${baseUrl}/app-config`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        } else {
          console.warn('Failed to fetch app-config, using defaults.');
        }
      } catch (err) {
        console.error('Error fetching app-config:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading }}>
      {children}
    </ConfigContext.Provider>
  );
};
