import React from 'react';
import { Sun, Palette, Flame, Sparkles } from 'lucide-react';
import { useTheme, ColorTheme } from '../context/ThemeContext';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const themes: { id: ColorTheme; label: string; icon: React.ReactNode; desc: string; badgeColor: string }[] = [
    {
      id: 'mystic',
      label: 'Cósmico',
      icon: <Sparkles className="w-3.5 h-3.5 text-purple-300" />,
      desc: 'Púrpura y dorado místico',
      badgeColor: 'bg-purple-900/60 text-purple-200 border-purple-500/40',
    },
    {
      id: 'soft',
      label: 'Suave',
      icon: <Palette className="w-3.5 h-3.5 text-slate-300" />,
      desc: 'Menos fuerte, descanso visual',
      badgeColor: 'bg-slate-800 text-slate-200 border-slate-600',
    },
    {
      id: 'warm',
      label: 'Cálido',
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
      desc: 'Ámbar, canela y luz de vela',
      badgeColor: 'bg-amber-950 text-amber-200 border-amber-600/40',
    },
  ];

  return (
    <div className="flex items-center gap-1 bg-black/40 border border-white/10 rounded-xl p-0.5 backdrop-blur-md">
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={`${t.label}: ${t.desc}`}
            className={`px-2 py-1 sm:px-2.5 sm:py-1 rounded-lg text-xs font-cinzel flex items-center gap-1 transition-all ${
              isActive
                ? `${t.badgeColor} border font-bold shadow-sm`
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
            }`}
          >
            {t.icon}
            <span className="hidden xs:inline sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
};
