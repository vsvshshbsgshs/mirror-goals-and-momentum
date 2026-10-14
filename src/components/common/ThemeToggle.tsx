import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented' | 'button';
  size?: 'sm' | 'md';
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  variant = 'icon',
  size = 'md',
  className = '',
  showLabel = false
}) => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 transition-colors select-none ${className}`}
        role="group"
        aria-label="Selecionar tema claro ou escuro"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            !isDark
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          aria-pressed={!isDark}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Claro</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isDark
              ? 'bg-slate-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
          aria-pressed={isDark}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Escuro</span>
        </button>
      </div>
    );
  }

  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 shadow-2xs cursor-pointer ${className}`}
        aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
        title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 animate-spin-once" />
            <span>Tema Claro</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-500" />
            <span>Tema Escuro</span>
          </>
        )}
      </button>
    );
  }

  // Default: Icon button
  const iconSizeClass = size === 'sm' ? 'w-8 h-8' : 'w-9 h-9';
  const iconDim = size === 'sm' ? 'w-4 h-4' : 'w-4.5 h-4.5';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center rounded-xl border transition-all cursor-pointer active:scale-95 ${iconSizeClass} ${
        isDark
          ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700 shadow-xs'
          : 'bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border-slate-200/90 shadow-2xs'
      } ${className}`}
      aria-label={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
      title={isDark ? 'Alternar para tema claro' : 'Alternar para tema escuro'}
    >
      {isDark ? (
        <Sun className={`${iconDim} text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45`} />
      ) : (
        <Moon className={`${iconDim} text-slate-600 transition-transform duration-200 hover:-rotate-12`} />
      )}
      {showLabel && (
        <span className="sr-only">{isDark ? 'Tema claro' : 'Tema escuro'}</span>
      )}
    </button>
  );
};
