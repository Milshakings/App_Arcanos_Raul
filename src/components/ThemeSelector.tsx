import React, { useState, useRef, useEffect } from 'react';
import { Palette, Flame, Sparkles, Check, ChevronDown, Feather } from 'lucide-react';
import { useTheme, ColorTheme } from '../context/ThemeContext';

interface ThemeOption {
  id: ColorTheme;
  title: string;
  badge: string;
  desc: string;
  icon: (active: boolean) => React.ReactNode;
  previewBg: string;
  previewBorder: string;
  activeClass: string;
}

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: ThemeOption[] = [
    {
      id: 'mystic',
      title: 'Modo Cósmico',
      badge: 'Original',
      desc: 'Púrpura noche y destellos dorados marianos',
      icon: (active) => (
        <Sparkles className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-purple-400'}`} />
      ),
      previewBg: 'from-purple-950 via-[#070718] to-amber-950/40',
      previewBorder: 'border-purple-500/50',
      activeClass: 'bg-purple-950/60 text-amber-200 border-amber-400/60 shadow-[0_0_15px_rgba(212,175,55,0.25)]',
    },
    {
      id: 'soft',
      title: 'Modo Menos Fuerte',
      badge: 'Suave & Mate',
      desc: 'Colores atenuados y relajados para descansar la vista',
      icon: (active) => (
        <Feather className={`w-4 h-4 ${active ? 'text-sky-200' : 'text-slate-400'}`} />
      ),
      previewBg: 'from-slate-800 via-[#0f141c] to-slate-900',
      previewBorder: 'border-slate-500/50',
      activeClass: 'bg-slate-800/80 text-slate-100 border-slate-400/60 shadow-[0_0_15px_rgba(148,163,184,0.2)]',
    },
    {
      id: 'warm',
      title: 'Modo Cálido',
      badge: 'Vela & Canela',
      desc: 'Ámbar acogedor, terracota terrosa y luz de vela',
      icon: (active) => (
        <Flame className={`w-4 h-4 ${active ? 'text-amber-300' : 'text-amber-500'}`} />
      ),
      previewBg: 'from-amber-950 via-[#1c120c] to-orange-950/50',
      previewBorder: 'border-amber-600/50',
      activeClass: 'bg-amber-950/70 text-amber-100 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.25)]',
    },
  ];

  const currentOption = options.find((o) => o.id === theme) || options[0];

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Botón Principal Claramente Señalizado */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Cambiar Modo de Color (Cósmico, Menos Fuerte, Cálido)"
        aria-label="Selector de Modo de Color"
        className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl border flex items-center gap-1.5 sm:gap-2 transition-all active:scale-95 shadow-md ${
          isOpen
            ? 'bg-amber-500/20 text-amber-200 border-amber-400/70'
            : 'bg-black/60 hover:bg-black/80 text-slate-200 border-amber-500/30 hover:border-amber-400/50'
        }`}
      >
        <div className="p-1 rounded-lg bg-white/5 flex items-center justify-center">
          <Palette className="w-3.5 h-3.5 text-amber-300" />
        </div>

        <div className="flex flex-col text-left">
          <span className="text-[9px] uppercase tracking-wider text-amber-300/80 font-cinzel leading-none hidden xs:block">
            Modo de Color
          </span>
          <span className="text-xs font-cinzel font-bold text-amber-100 leading-tight">
            {currentOption.title.replace('Modo ', '')}
          </span>
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Menú Desplegable con las 3 opciones detalladas y previsualización */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-[#0b0b18]/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl p-2 z-50 animate-fade-in space-y-1.5">
          <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[11px] font-cinzel uppercase tracking-widest text-amber-300 font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Selecciona el Modo de Color
            </span>
            <span className="text-[10px] text-slate-400 font-mono">3 modos</span>
          </div>

          <div className="space-y-1 pt-1">
            {options.map((opt) => {
              const isSelected = theme === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl border text-left transition-all flex items-start gap-3 group active:scale-[0.98] ${
                    isSelected
                      ? opt.activeClass
                      : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/5 hover:border-amber-500/25 text-slate-300'
                  }`}
                >
                  {/* Ícono con contenedor */}
                  <div
                    className={`p-2 rounded-xl border shrink-0 bg-gradient-to-br ${opt.previewBg} ${opt.previewBorder} flex items-center justify-center`}
                  >
                    {opt.icon(isSelected)}
                  </div>

                  {/* Textos y descripción clara */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-cinzel text-xs font-bold text-amber-200 group-hover:text-amber-100 truncate">
                        {opt.title}
                      </span>
                      <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-black/40 text-slate-300 border border-white/10 font-mono shrink-0">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-[11px] font-garamond italic text-slate-400 group-hover:text-slate-300 mt-0.5 leading-tight">
                      {opt.desc}
                    </p>
                  </div>

                  {/* Indicador de Selección Activa */}
                  <div className="shrink-0 self-center pl-1">
                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-amber-400 text-black flex items-center justify-center shadow-md">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-white/20 group-hover:border-amber-400/50" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="px-2 pt-1 pb-1 text-[10px] text-center text-slate-400 font-garamond italic border-t border-white/10">
            Se guarda automáticamente para tus próximas sesiones en smartphone o web.
          </div>
        </div>
      )}
    </div>
  );
};
