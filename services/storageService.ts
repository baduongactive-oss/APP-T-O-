import { SavedConfig, ExamConfig } from '../types';

const STORAGE_KEY = 'examgen_saved_configs';

export const saveConfig = (config: ExamConfig, name: string): SavedConfig => {
  const savedConfigs = loadConfigs();
  
  const newConfig: SavedConfig = {
    ...config,
    id: crypto.randomUUID(),
    name,
    createdAt: Date.now(),
  };

  savedConfigs.push(newConfig);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(savedConfigs));
  return newConfig;
};

export const loadConfigs = (): SavedConfig[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to load configs", e);
    return [];
  }
};

export const deleteConfig = (id: string): void => {
  const savedConfigs = loadConfigs();
  const filtered = savedConfigs.filter(c => c.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};
