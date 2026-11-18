'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { BUTTON_SECONDARY } from './styles';

const STORAGE_KEY = 'pathly-theme';

export function ThemeToggle(): React.JSX.Element {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const dark = window.localStorage.getItem(STORAGE_KEY) === 'dark';
    document.documentElement.classList.toggle('dark', dark);
    setIsDark(dark);
  }, []);

  const toggle = (): void => {
    const next = !isDark;
    document.documentElement.classList.toggle('dark', next);
    window.localStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
    setIsDark(next);
  };

  return (
    <button type="button" onClick={toggle} aria-pressed={isDark} className={BUTTON_SECONDARY}>
      {isDark ? <Sun className="h-4 w-4 text-amber-400" aria-hidden="true" /> : <Moon className="h-4 w-4 text-indigo-600" aria-hidden="true" />}
      <span>{isDark ? 'Mode jour' : 'Mode nuit'}</span>
    </button>
  );
}
