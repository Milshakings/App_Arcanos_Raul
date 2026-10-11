import React, { useState } from 'react';
import { Search, Sparkles, X, BookOpen } from 'lucide-react';
import { TODAS_LAS_CARTAS, TarotCard } from '../data/tarotData';
import { TarotCardView } from './TarotCardView';

export const CardGrimoire: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'Todos' | 'Mayor' | 'Bastos' | 'Copas' | 'Espadas' | 'Oros'>('Todos');
  const [inspectCard, setInspectCard] = useState<TarotCard | null>(null);

  const filteredCards = TODAS_LAS_CARTAS.filter((card) => {
    const matchesSearch =
      card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.archetype.toLowerCase().includes(searchTerm.toLowerCase()) ||
      card.uprightKeywords.some((k) => k.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'Todos') return true;
    if (selectedFilter === 'Mayor') return card.arcana === 'Mayor';
    return card.suit === selectedFilter;
  });

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Encabezado y Controles */}
      <div className="p-6 rounded-2xl bg-purple-950/20 border border-amber-500/20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-cinzel text-xl font-bold text-amber-200 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-400" />
              El Grimorio Sagrado del Tarot (78 Arcanos)
            </h2>
            <p className="text-xs text-slate-400 font-garamond italic mt-0.5">
              Explora los arquetipos, significados al derecho e invertidos, y la sabiduría esotérica de cada arcano.
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar cartas, conceptos (ej. El Loco, As de Copas)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/50 border border-amber-500/20 text-slate-200 text-xs focus:outline-none focus:border-amber-400/60 placeholder:text-slate-600"
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
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {(['Todos', 'Mayor', 'Bastos', 'Copas', 'Espadas', 'Oros'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-cinzel transition-all ${
                selectedFilter === filter
                  ? 'bg-amber-500/30 text-amber-200 border border-amber-400/50 shadow-sm'
                  : 'bg-black/30 hover:bg-black/50 text-slate-400 border border-amber-500/10'
              }`}
            >
              {filter === 'Todos' && 'Todas las Cartas'}
              {filter === 'Mayor' && 'Arcanos Mayores'}
              {filter === 'Bastos' && 'Bastos (Fuego)'}
              {filter === 'Copas' && 'Copas (Agua)'}
              {filter === 'Espadas' && 'Espadas (Aire)'}
              {filter === 'Oros' && 'Oros (Tierra)'}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Cartas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.id}
            onClick={() => setInspectCard(card)}
            className="group cursor-pointer p-3 rounded-xl bg-gradient-to-b from-[#101026] to-[#080816] border border-amber-500/20 hover:border-amber-400/60 transition-all hover:scale-105 flex flex-col items-center shadow-lg"
          >
            <TarotCardView card={card} isFlipped={true} size="sm" interactive={false} />
            <span className="mt-2 text-xs font-cinzel font-semibold text-amber-200 text-center truncate w-full group-hover:text-amber-100">
              {card.name}
            </span>
            <span className="text-[10px] text-slate-400 font-garamond italic truncate w-full text-center">
              {card.archetype}
            </span>
          </div>
        ))}
      </div>

      {/* Modal de Detalle */}
      {inspectCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl bg-gradient-to-b from-[#151532] via-[#0b0b20] to-[#060612] border border-amber-500/40 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setInspectCard(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <TarotCardView card={inspectCard} isFlipped={true} size="md" interactive={false} />

              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-cinzel uppercase text-amber-400 font-bold tracking-wider">
                      Arcano {inspectCard.arcana} {inspectCard.suit ? `• ${inspectCard.suit}` : ''}
                    </span>
                    {inspectCard.astrology && (
                      <span className="text-[11px] text-amber-200/60 font-garamond italic">
                        ({inspectCard.astrology})
                      </span>
                    )}
                  </div>
                  <h3 className="font-cinzel text-2xl font-bold text-amber-200">
                    {inspectCard.name}
                  </h3>
                  <p className="text-xs text-amber-300/80 font-cinzel uppercase tracking-wider">
                    {inspectCard.archetype}
                  </p>
                </div>

                {/* Significado Al Derecho */}
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20">
                  <span className="text-xs font-cinzel font-bold text-amber-300 block mb-1">
                    Significado Al Derecho
                  </span>
                  <p className="text-xs text-slate-200 font-garamond leading-relaxed">
                    {inspectCard.uprightMeaning}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {inspectCard.uprightKeywords.map((k, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Significado Invertida */}
                <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
                  <span className="text-xs font-cinzel font-bold text-purple-300 block mb-1">
                    Significado Invertida
                  </span>
                  <p className="text-xs text-slate-200 font-garamond leading-relaxed">
                    {inspectCard.reversedMeaning}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {inspectCard.reversedKeywords.map((k, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded border border-purple-500/20"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Simbolismo */}
                <div>
                  <span className="text-xs font-cinzel font-bold text-amber-400 block mb-1">
                    Simbolismo Esotérico
                  </span>
                  <p className="text-xs text-slate-300 font-sans leading-relaxed">
                    {inspectCard.symbolism}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
