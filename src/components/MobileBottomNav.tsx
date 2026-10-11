import React from 'react';
import { Sun, Sparkles, Compass, HelpCircle, Activity, BookOpen } from 'lucide-react';

export type AppTab = 'resumen-dia' | 'gratitud' | 'consejos' | 'pregunta' | 'avances' | 'grimorio';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  avancesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  avancesCount,
}) => {
  const tabs: {
    id: AppTab;
    label: string;
    icon: (isActive: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'resumen-dia',
      label: 'Día',
      icon: (active) => (
        <Sun className={`w-5 h-5 transition-transform ${active ? 'text-amber-300 scale-110' : 'text-slate-400'}`} />
      ),
    },
    {
      id: 'gratitud',
      label: 'Gratitud',
      icon: (active) => (
        <Sparkles className={`w-5 h-5 transition-transform ${active ? 'text-purple-300 scale-110' : 'text-slate-400'}`} />
      ),
    },
    {
      id: 'consejos',
      label: 'Consejos',
      icon: (active) => (
        <Compass className={`w-5 h-5 transition-transform ${active ? 'text-rose-300 scale-110' : 'text-slate-400'}`} />
      ),
    },
    {
      id: 'pregunta',
      label: 'Pregunta',
      icon: (active) => (
        <HelpCircle className={`w-5 h-5 transition-transform ${active ? 'text-sky-300 scale-110' : 'text-slate-400'}`} />
      ),
    },
    {
      id: 'avances',
      label: 'Avances',
      icon: (active) => (
        <div className="relative">
          <Activity className={`w-5 h-5 transition-transform ${active ? 'text-emerald-300 scale-110' : 'text-slate-400'}`} />
          {avancesCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-3.5 h-3.5 bg-emerald-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center font-mono">
              {avancesCount > 9 ? '9+' : avancesCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'grimorio',
      label: 'Grimorio',
      icon: (active) => (
        <BookOpen className={`w-5 h-5 transition-transform ${active ? 'text-amber-300 scale-110' : 'text-slate-400'}`} />
      ),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a1a]/95 backdrop-blur-xl border-t border-white/10 px-1 py-1.5 safe-bottom shadow-[0_-8px_25px_rgba(0,0,0,0.6)]">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all min-w-[50px] active:scale-95 ${
                isActive
                  ? 'text-amber-200 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className={`p-1 rounded-lg ${isActive ? 'bg-white/10 shadow-sm' : ''}`}>
                {tab.icon(isActive)}
              </div>
              <span className={`text-[10px] font-cinzel tracking-tight mt-0.5 truncate ${isActive ? 'text-amber-200' : 'text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
