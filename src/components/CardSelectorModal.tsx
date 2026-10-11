import React, { useState } from 'react';
import { X, Search, Sparkles, Check, RefreshCw, Shuffle } from 'lucide-react';
import { TODAS_LAS_CARTAS, TarotCard, SpreadPosition } from '../data/tarotData';
import { TarotCardView } from './TarotCardView';
import { mysticAudio } from '../utils/mysticAudio';

interface CardSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: SpreadPosition | null;
  onSelectCard: (card: TarotCard, isReversed: boolean) => void;
  currentlyAssignedId?: string;
}

export const CardSelectorModal: React.FC<CardSelectorModalProps> = ({
  isOpen,
  onClose,
  position,
  onSelectCard,
  currentlyAssignedId,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'Todos' | 'Mayor' | 'Bastos' | 'Copas' | 'Espadas' | 'Oros'>('Todos');
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isReversed, setIsReversed] = useState<boolean>(false);

  if (!isOpen || !position) return null;

  const filteredCards = TODAS_LAS_CARTAS.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.archetype.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.uprightKeywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'Todos') return true;
    if (activeFilter === 'Mayor') return card.arcana === 'Mayor';
    return card.suit === activeFilter;
  });

  const handlePickRandom = () => {
    const randomIndex = Math.floor(Math.random() * TODAS_LAS_CARTAS.length);
    const card = TODAS_LAS_CARTAS[randomIndex];
    setSelectedCard(card);
    setIsReversed(Math.random() < 0.25);
    mysticAudio.playCardFlip();
  };

  const handleConfirm = () => {
    if (!selectedCard) return;
    mysticAudio.playCardFlip();
    onSelectCard(selectedCard, isReversed);
    onClose();
    setSelectedCard(null);
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5 bg-black/85 backdrop-blur-md animate-fade-in safe-top">
      <div className="relative w-full max-w-4xl h-[92vh] sm:h-[90vh] rounded-t-3xl sm:rounded-3xl bg-gradient-to-b from-[#141432] via-[#0a0a20] to-[#040410] border-t sm:border border-amber-500/40 p-3.5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-hidden safe-bottom">
        {/* Encabezado */}
        <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5 sm:pb-3">
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="font-cinzel text-[10px] sm:text-xs uppercase tracking-widest text-amber-300">
                Introducir Carta Física o Elegir Carta
              </span>
            </div>
            <h3 className="font-cinzel font-bold text-base sm:text-xl text-amber-200">
              Posición: {position.name}
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 font-garamond italic line-clamp-1">
              {position.meaning}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="py-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2.5 items-center justify-between">
            {/* Buscador */}
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o palabra clave (ej. El Mago, As de Oros)..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/60 border border-amber-500/25 text-slate-200 text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Botón de Carta al Azar */}
            <button
              onClick={handlePickRandom}
              className="px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-amber-500/30 text-amber-200 text-xs font-cinzel flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-300" />
              Elegir al azar
            </button>
          </div>

          {/* Filtros de Palos */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['Todos', 'Mayor', 'Bastos', 'Copas', 'Espadas', 'Oros'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-3 py-1 rounded-lg text-xs font-cinzel transition-all ${
                  activeFilter === filter
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50'
                    : 'bg-black/40 text-slate-400 border border-amber-500/10 hover:text-slate-200'
                }`}
              >
                {filter === 'Todos' && 'Todas (78)'}
                {filter === 'Mayor' && 'Arcanos Mayores'}
                {filter === 'Bastos' && 'Bastos (Fuego)'}
                {filter === 'Copas' && 'Copas (Agua)'}
                {filter === 'Espadas' && 'Espadas (Aire)'}
                {filter === 'Oros' && 'Oros (Tierra)'}
              </button>
            ))}
          </div>
        </div>

        {/* Lista Cuadrícula de Cartas para seleccionar */}
        <div className="flex-1 overflow-y-auto pr-1 my-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredCards.map((card) => {
            const isSelected = selectedCard?.id === card.id;
            const isCurrentlyAssigned = currentlyAssignedId === card.id;

            return (
              <div
                key={card.id}
                onClick={() => setSelectedCard(card)}
                className={`cursor-pointer p-2.5 rounded-xl border transition-all flex flex-col items-center justify-between text-center select-none ${
                  isSelected
                    ? 'bg-purple-950/60 border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.4)] scale-105'
                    : isCurrentlyAssigned
                    ? 'bg-amber-950/20 border-amber-500/40 opacity-80'
                    : 'bg-black/30 hover:bg-black/60 border-amber-500/15 hover:border-amber-400/40'
                }`}
              >
                <TarotCardView card={card} isFlipped={true} size="sm" interactive={false} />
                <span className="font-cinzel text-xs font-semibold text-amber-200 mt-2 truncate w-full">
                  {card.name}
                </span>
                <span className="text-[10px] text-slate-400 font-garamond italic truncate w-full">
                  {card.archetype}
                </span>
                {isSelected && (
                  <span className="mt-1 text-[9px] px-2 py-0.5 rounded-full bg-amber-500 text-black font-bold uppercase tracking-wider">
                    Seleccionada
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Barra Inferior de Confirmación y Orientación */}
        <div className="border-t border-amber-500/20 pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 bg-black/40 -mx-4 -mb-4 p-4 rounded-b-3xl">
          {selectedCard ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-cinzel text-amber-200 font-bold">
                Carta elegida: <span className="text-amber-400">{selectedCard.name}</span>
              </span>

              {/* Botón para alternar Orientación */}
              <button
                type="button"
                onClick={() => setIsReversed(!isReversed)}
                className={`px-3 py-1.5 rounded-xl text-xs font-cinzel border flex items-center gap-1.5 transition-all ${
                  isReversed
                    ? 'bg-purple-900/60 text-purple-200 border-purple-500/40'
                    : 'bg-amber-900/60 text-amber-200 border-amber-500/40'
                }`}
              >
                <RefreshCw className="w-3 h-3" />
                Orientación: <strong>{isReversed ? 'Invertida' : 'Al derecho'}</strong>
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-garamond italic">
              Haz clic en cualquiera de las cartas arriba para seleccionarla e introducirla en esta posición.
            </span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-cinzel border border-slate-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedCard}
              className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-amber-50 text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-lg disabled:opacity-40 transition-all"
            >
              <Check className="w-4 h-4" />
              Introducir Carta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
