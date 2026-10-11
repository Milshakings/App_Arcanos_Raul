import React, { useState, useEffect } from 'react';
import { Sparkles, Shuffle, Eye, Wand2, Layers, PlusCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { TarotCard, TarotSpread, TODAS_LAS_CARTAS, SpreadPosition } from '../data/tarotData';
import { TarotCardView } from './TarotCardView';
import { CardSelectorModal } from './CardSelectorModal';
import { mysticAudio } from '../utils/mysticAudio';

export interface DrawnCardSlot {
  card: TarotCard;
  isReversed: boolean;
  isFlipped: boolean;
  position: SpreadPosition;
}

interface DeckShufflerProps {
  spread: TarotSpread;
  question: string;
  onReadingComplete: (drawnCards: DrawnCardSlot[]) => void;
  isLoadingAI: boolean;
}

export const DeckShuffler: React.FC<DeckShufflerProps> = ({
  spread,
  question,
  onReadingComplete,
  isLoadingAI,
}) => {
  const [deck, setDeck] = useState<TarotCard[]>([]);
  const [slots, setSlots] = useState<(DrawnCardSlot | null)[]>([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectorTargetIndex, setSelectorTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    resetDeck();
  }, [spread]);

  const resetDeck = () => {
    const shuffled = [...TODAS_LAS_CARTAS].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setSlots(new Array(spread.cardCount).fill(null));
  };

  const handleShuffleRandom = () => {
    setIsShuffling(true);
    mysticAudio.playShuffleSound();

    setTimeout(() => {
      const shuffled = [...TODAS_LAS_CARTAS].sort(() => Math.random() - 0.5);
      const newSlots: DrawnCardSlot[] = [];

      for (let i = 0; i < spread.cardCount; i++) {
        newSlots.push({
          card: shuffled[i],
          isReversed: Math.random() < 0.25,
          isFlipped: true,
          position: spread.positions[i],
        });
      }

      setSlots(newSlots);
      setIsShuffling(false);
    }, 500);
  };

  const handleOpenSelectorForIndex = (index: number) => {
    setSelectorTargetIndex(index);
  };

  const handleAssignCard = (card: TarotCard, isReversed: boolean) => {
    if (selectorTargetIndex === null) return;

    setSlots((prev) => {
      const next = [...prev];
      next[selectorTargetIndex] = {
        card,
        isReversed,
        isFlipped: true,
        position: spread.positions[selectorTargetIndex],
      };
      return next;
    });

    setSelectorTargetIndex(null);
  };

  const toggleFlipCard = (index: number) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index && slot ? { ...slot, isFlipped: !slot.isFlipped } : slot
      )
    );
  };

  const toggleReversed = (index: number) => {
    setSlots((prev) =>
      prev.map((slot, i) =>
        i === index && slot ? { ...slot, isReversed: !slot.isReversed } : slot
      )
    );
  };

  const revealAllCards = () => {
    mysticAudio.playCardFlip();
    setSlots((prev) => prev.map((s) => (s ? { ...s, isFlipped: true } : s)));
  };

  const assignedCount = slots.filter((s) => s !== null).length;
  const isReady = assignedCount === spread.cardCount;

  return (
    <div className="w-full flex flex-col items-center">
      {/* Barra Superior de Control */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-purple-950/25 border border-amber-500/25 backdrop-blur-md mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-cinzel text-amber-300 font-bold text-base sm:text-lg">
              {spread.name}
            </span>
            <span className="text-xs bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full font-mono">
              {assignedCount} / {spread.cardCount} Cartas Introducidas
            </span>
          </div>
          <p className="text-xs text-slate-300 font-garamond italic mt-1">
            {spread.description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Opción 1: Introducir / Barajar al Azar */}
          <button
            onClick={handleShuffleRandom}
            disabled={isShuffling || isLoadingAI}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-xs font-cinzel flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
          >
            <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin' : ''}`} />
            Tirada Aleatoria
          </button>

          {/* Opción 2: Resetear ranuras */}
          {assignedCount > 0 && (
            <button
              onClick={resetDeck}
              className="px-3 py-2 rounded-xl bg-black/40 hover:bg-black/70 border border-slate-700 text-slate-300 text-xs font-cinzel transition-all"
            >
              Limpiar Cartas
            </button>
          )}

          {isReady && slots.some((s) => s && !s.isFlipped) && (
            <button
              onClick={revealAllCards}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-cinzel flex items-center gap-1.5 transition-all"
            >
              <Eye className="w-3.5 h-3.5" />
              Revelar Todas
            </button>
          )}
        </div>
      </div>

      {/* Explicación de cómo introducir las cartas */}
      <div className="w-full max-w-5xl mb-6 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between gap-3 text-xs text-amber-200/90 font-garamond">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong>¿Tienes cartas físicas o deseas cartas específicas?</strong> Haz clic en el botón <em>"Introducir Carta"</em> en cada posición para elegir tu carta exacta (al derecho o invertida). O presiona <em>"Tirada Aleatoria"</em> arriba.
          </span>
        </div>
      </div>

      {/* Cuadrícula de Posiciones de la Tirada */}
      <div className="w-full max-w-5xl mb-8">
        <div className="flex flex-wrap justify-center gap-5 sm:gap-6 min-h-[360px] items-start p-4 sm:p-6 rounded-2xl bg-black/35 border border-amber-500/20 backdrop-blur-sm">
          {spread.positions.map((pos, idx) => {
            const slot = slots[idx];

            if (slot) {
              return (
                <div key={pos.index} className="flex flex-col items-center">
                  <TarotCardView
                    card={slot.card}
                    isReversed={slot.isReversed}
                    isFlipped={slot.isFlipped}
                    positionLabel={pos.name}
                    positionMeaning={pos.meaning}
                    category={pos.category}
                    onFlip={() => toggleFlipCard(idx)}
                    onChangeCard={() => handleOpenSelectorForIndex(idx)}
                    onToggleReversed={() => toggleReversed(idx)}
                    size={spread.cardCount > 4 ? 'sm' : 'md'}
                    showKeywords={slot.isFlipped}
                  />
                </div>
              );
            }

            // Ranura Vacía esperando ser asignada
            return (
              <div key={pos.index} className="flex flex-col items-center justify-center">
                <div className="mb-2 text-center max-w-[200px]">
                  {pos.category && (
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded-full bg-purple-950/60 text-purple-300 border border-purple-500/30 font-cinzel font-semibold inline-block mb-1">
                      {pos.category}
                    </span>
                  )}
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-400/80 font-cinzel block truncate">
                    {pos.name}
                  </span>
                  <span className="text-[10px] text-slate-400 font-garamond italic line-clamp-1">
                    {pos.meaning}
                  </span>
                </div>

                <div
                  onClick={() => handleOpenSelectorForIndex(idx)}
                  className={`cursor-pointer rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400/70 bg-purple-950/15 hover:bg-purple-950/30 flex flex-col items-center justify-center p-3 sm:p-4 text-center transition-all group active:scale-95 ${
                    spread.cardCount > 4 ? 'w-24 h-38 sm:w-28 sm:h-44' : 'w-36 h-60 sm:w-48 sm:h-80'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full border border-amber-500/30 group-hover:border-amber-400 flex items-center justify-center text-amber-300 group-hover:scale-110 transition-transform mb-2">
                    <PlusCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-xs font-cinzel font-bold text-amber-200 group-hover:text-amber-100">
                    Introducir Carta
                  </span>
                  <span className="text-[10px] text-slate-400 font-garamond italic mt-1 leading-snug">
                    Toca para elegir de las 78 cartas
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón para obtener la lectura cuando todas las cartas estén listas */}
      {isReady && (
        <div className="mb-8 flex flex-col items-center text-center animate-fade-in">
          <p className="text-xs text-amber-200/90 font-garamond italic mb-3">
            Tus cartas han sido dispuestas exactamente como elegiste. Solicita la revelación del tarot para obtener tu lectura detallada.
          </p>
          <button
            onClick={() => onReadingComplete(slots as DrawnCardSlot[])}
            disabled={isLoadingAI}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-purple-600 to-amber-500 bg-[length:200%_auto] hover:bg-right font-cinzel font-bold text-sm tracking-wider uppercase text-amber-50 shadow-[0_0_30px_rgba(212,175,55,0.4)] border border-amber-300/50 transition-all duration-500 transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2.5"
          >
            <Sparkles className="w-5 h-5 text-amber-200 animate-spin [animation-duration:10s]" />
            {isLoadingAI ? 'Interpretando Arcanos...' : 'Obtener Lectura del Tarot'}
          </button>
        </div>
      )}

      {/* Modal Selector de Cartas */}
      {selectorTargetIndex !== null && (
        <CardSelectorModal
          isOpen={true}
          onClose={() => setSelectorTargetIndex(null)}
          position={spread.positions[selectorTargetIndex]}
          onSelectCard={handleAssignCard}
          currentlyAssignedId={slots[selectorTargetIndex]?.card.id}
        />
      )}
    </div>
  );
};
