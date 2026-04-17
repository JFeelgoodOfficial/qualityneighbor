import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

const systemPrefersDark =
  typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;

export function useDarkMode() {
  const [isDark, setIsDark] = useLocalStorage<boolean>('dark-mode', systemPrefersDark);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle };
}
