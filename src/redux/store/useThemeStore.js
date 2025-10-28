import { create } from 'zustand';

const useThemeChange = create((set) => ({
  themeMode: 'light',
  setThemeMode: (theme) => set({ themeMode: theme }),
}));

export default useThemeChange;
