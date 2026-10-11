import React, { useState } from 'react';
import { Sparkles, Moon, Sun, Flame, Droplets, Wind, Mountain, RefreshCw } from 'lucide-react';
import { TarotCard } from '../data/tarotData';
import { mysticAudio } from '../utils/mysticAudio';

interface TarotCardViewProps {
  card: TarotCard;
  isReversed?: boolean;
  isFlipped?: boolean;
  positionLabel?: string;
  positionMeaning?: string;
  category?: string;
  onFlip?: () => void;
  onChangeCard?: () => void;
  onToggleReversed?: () => void;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  showKeywords?: boolean;
}

export const TarotCardView: React.FC<TarotCardViewProps> = ({
  card,
  isReversed = false,
  isFlipped = true,
  positionLabel,
  positionMeaning,
  category,
  onFlip,
  onChangeCard,
  onToggleReversed,
  size = 'md',
  interactive = true,
  showKeywords = false,
}) => {
  const getElementIcon = (element: string) => {
    switch (element) {
      case 'Fuego':
        return <Flame className="w-3.5 h-3.5 text-amber-400" />;
      case 'Agua':
        return <Droplets className="w-3.5 h-3.5 text-cyan-400" />;
      case 'Aire':
        return <Wind className="w-3.5 h-3.5 text-emerald-300" />;
      case 'Tierra':
        return <Mountain className="w-3.5 h-3.5 text-yellow-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-300" />;
    }
  };

  const getElementColor = (element: string) => {
    switch (element) {
      case 'Fuego':
        return 'from-amber-950/50 via-red-950/40 to-purple-950/50 text-amber-300 border-amber-500/40';
      case 'Agua':
        return 'from-blue-950/50 via-cyan-950/40 to-indigo-950/50 text-cyan-300 border-cyan-500/40';
      case 'Aire':
        return 'from-indigo-950/50 via-sky-950/40 to-slate-950/50 text-sky-200 border-sky-400/40';
      case 'Tierra':
        return 'from-emerald-950/50 via-amber-950/40 to-zinc-950/50 text-emerald-300 border-emerald-500/40';
      default:
        return 'from-purple-950/60 via-violet-950/50 to-slate-950/60 text-amber-200 border-amber-400/40';
    }
  };

  const sizeClasses = {
    sm: 'w-28 h-44 text-xs',
    md: 'w-48 h-80 text-sm',
    lg: 'w-64 h-[26rem] text-base',
  }[size];

  const handleCardClick = () => {
    if (interactive && onFlip) {
      mysticAudio.playCardFlip();
      onFlip();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {positionLabel && (
        <div className="mb-2 text-center max-w-[220px]">
          {category && (
            <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 font-cinzel font-semibold inline-block mb-1">
              {category}
            </span>
          )}
          <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400/90 font-cinzel block truncate">
            {positionLabel}
          </span>
          {positionMeaning && size !== 'sm' && (
            <span className="text-[10px] text-slate-400 font-garamond italic line-clamp-1">
              {positionMeaning}
            </span>
          )}
        </div>
      )}

      <div
        onClick={handleCardClick}
        className={`relative ${sizeClasses} perspective-1000 select-none ${
          interactive ? 'cursor-pointer transform transition-transform duration-300 hover:scale-[1.03]' : ''
        }`}
      >
        <div
          className={`w-full h-full duration-700 transform-style-preserve-3d transition-transform relative rounded-xl shadow-2xl ${
            isFlipped ? '' : 'rotate-y-180'
          }`}
        >
          {/* FRENTE DE LA CARTA */}
          <div
            className={`absolute inset-0 w-full h-full backface-hidden rounded-xl overflow-hidden card-gold-border bg-gradient-to-b ${getElementColor(
              card.element
            )} flex flex-col justify-between p-3 transition-all ${
              isReversed ? 'rotate-180' : ''
            }`}
          >
            {/* Encabezado Superior */}
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-1.5">
              <span className="font-cinzel text-xs font-bold text-amber-300">
                {card.arcana === 'Mayor' ? `No. ${card.number}` : `${card.suit || ''}`}
              </span>
              <div className="flex items-center gap-1">
                {getElementIcon(card.element)}
                {card.astrology && (
                  <span className="text-[10px] text-amber-200/70 font-garamond italic">
                    {card.astrology}
                  </span>
                )}
              </div>
            </div>

            {/* Ilustración Esotérica Central */}
            <div className="relative my-auto flex flex-col items-center justify-center p-2 rounded-lg bg-black/45 border border-amber-500/20 backdrop-blur-sm overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="w-28 h-28 rounded-full border border-amber-400" />
                <div className="absolute w-20 h-20 rotate-45 border border-amber-400" />
              </div>

              <div className="relative z-10 my-2 p-2.5 rounded-full bg-gradient-to-tr from-amber-500/20 to-purple-500/20 border border-amber-400/40 text-amber-200 shadow-inner">
                {card.arcana === 'Mayor' ? (
                  card.number % 2 === 0 ? (
                    <Moon className={size === 'sm' ? 'w-5 h-5' : 'w-9 h-9'} />
                  ) : (
                    <Sun className={size === 'sm' ? 'w-5 h-5' : 'w-9 h-9'} />
                  )
                ) : card.suit === 'Bastos' ? (
                  <Flame className={size === 'sm' ? 'w-5 h-5' : 'w-9 h-9'} />
                ) : card.suit === 'Copas' ? (
                  <Droplets className={size === 'sm' ? 'w-5 h-5' : 'w-9 h-9'} />
                ) : card.suit === 'Espadas' ? (
                  <Wind className={size === 'sm' ? 'w-5 h-5' : 'w-9 h-9'} />
                ) : (
                  <Mountain className={size === 'sm' ? 'w-5 h-5' : 'w-9 h-9'} />
                )}
              </div>

              <div className="text-center z-10 px-1">
                <span className="text-[10px] text-amber-300/80 font-cinzel uppercase tracking-wider block">
                  {card.archetype}
                </span>
                {size !== 'sm' && (
                  <p className="text-[11px] text-slate-300 font-garamond italic line-clamp-2 mt-1 leading-snug">
                    "{isReversed ? card.reversedMeaning : card.uprightMeaning}"
                  </p>
                )}
              </div>
            </div>

            {/* Pie de Carta */}
            <div className="border-t border-amber-500/20 pt-1 text-center">
              <h4 className="font-cinzel font-bold text-amber-200 text-xs sm:text-sm tracking-wide leading-tight truncate">
                {card.name}
              </h4>
              <div className="flex items-center justify-center gap-1.5 mt-0.5">
                <span
                  className={`text-[9px] uppercase px-1.5 py-0.5 rounded tracking-wider font-semibold ${
                    isReversed
                      ? 'bg-purple-900/70 text-purple-300 border border-purple-500/30'
                      : 'bg-amber-900/70 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isReversed ? 'Invertida' : 'Al derecho'}
                </span>
              </div>
            </div>
          </div>

          {/* REVERSO DE LA CARTA (DORSO CÓSMICO) */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 rounded-xl overflow-hidden card-gold-border bg-[#0d0d24] flex flex-col items-center justify-center p-2.5">
            <div className="w-full h-full border border-amber-500/30 rounded-lg p-2 flex flex-col items-center justify-center relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/80 via-[#0a0a1f] to-[#04040d]">
              <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t border-l border-amber-400/60" />
              <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t border-r border-amber-400/60" />
              <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b border-l border-amber-400/60" />
              <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b border-r border-amber-400/60" />

              <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-amber-500/40 animate-spin [animation-duration:25s]" />
                <div className="absolute w-12 h-12 rounded-full border border-dashed border-amber-400/40" />
                <Sparkles className="w-6 h-6 text-amber-300 drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              </div>

              <span className="mt-2 font-cinzel text-[9px] tracking-widest text-amber-300/70 uppercase">
                Arcana
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controles rápidos para invertir o cambiar si interactivo */}
      {interactive && isFlipped && (onToggleReversed || onChangeCard) && (
        <div className="flex items-center gap-1.5 mt-2">
          {onToggleReversed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleReversed();
              }}
              title="Alternar al derecho o invertida"
              className="text-[10px] px-2 py-0.5 rounded bg-black/60 hover:bg-purple-950/80 text-amber-300/80 border border-amber-500/30 font-cinzel flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              {isReversed ? 'Invertida' : 'Al derecho'}
            </button>
          )}
          {onChangeCard && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onChangeCard();
              }}
              className="text-[10px] px-2 py-0.5 rounded bg-black/60 hover:bg-amber-950/80 text-amber-300/90 border border-amber-500/30 font-cinzel transition-colors"
            >
              Cambiar
            </button>
          )}
        </div>
      )}

      {showKeywords && (
        <div className="mt-2 text-center max-w-[200px]">
          <div className="flex flex-wrap gap-1 justify-center">
            {(isReversed ? card.reversedKeywords : card.uprightKeywords)
              .slice(0, 3)
              .map((kw, i) => (
                <span
                  key={i}
                  className="text-[10px] bg-amber-950/40 text-amber-300/80 border border-amber-500/20 rounded px-1.5 py-0.5"
                >
                  {kw}
                </span>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
