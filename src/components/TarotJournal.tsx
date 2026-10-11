import React from 'react';
import { BookOpen, Calendar, Trash2, ExternalLink } from 'lucide-react';

export interface JournalEntry {
  id: string;
  timestamp: string;
  spreadName: string;
  question: string;
  title: string;
  summary: string;
  drawnCards: any[];
  actionableWisdom: {
    practicalStep: string;
    sacredAffirmation: string;
    reflectionPrompt: string;
  };
  mysticQuote: string;
  userNote?: string;
}

interface TarotJournalProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onDeleteEntry: (id: string) => void;
}

export const TarotJournal: React.FC<TarotJournalProps> = ({
  entries,
  onSelectEntry,
  onDeleteEntry,
}) => {
  if (entries.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto p-12 rounded-3xl bg-purple-950/20 border border-amber-500/20 backdrop-blur-md text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-300 mb-4">
          <BookOpen className="w-8 h-8" />
        </div>
        <h3 className="font-cinzel text-xl font-bold text-amber-200 mb-2">
          Tu Diario Sagrado está Vacío
        </h3>
        <p className="text-sm text-slate-400 font-garamond italic max-w-md">
          Realiza una tirada de tarot y guárdala para preservar las orientaciones recibidas, notar patrones sincrónicos y revisar tus aprendizajes.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-purple-950/20 border border-amber-500/20 backdrop-blur-md flex items-center justify-between">
        <div>
          <h2 className="font-cinzel text-xl font-bold text-amber-200 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            Diario Sagrado de Consultas
          </h2>
          <p className="text-xs text-slate-400 font-garamond italic mt-0.5">
            {entries.length} consulta{entries.length !== 1 ? 's' : ''} registrada{entries.length !== 1 ? 's' : ''} en tu archivo personal.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-6 rounded-2xl bg-gradient-to-b from-[#101026] to-[#080816] border border-amber-500/20 hover:border-amber-400/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(entry.timestamp).toLocaleDateString('es-ES', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-xs font-cinzel text-purple-300 font-semibold">
                  {entry.spreadName}
                </span>
              </div>

              <h3
                className="font-cinzel font-bold text-lg text-amber-200 hover:text-amber-100 transition-colors cursor-pointer"
                onClick={() => onSelectEntry(entry)}
              >
                {entry.title}
              </h3>

              {entry.question && (
                <p className="text-xs text-slate-400 font-garamond italic">
                  Pregunta: "{entry.question}"
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-1">
                {entry.drawnCards.map((slot, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-black/40 border border-amber-500/20 text-slate-300"
                  >
                    {slot.card.name} {slot.isReversed ? '(Inv)' : ''}
                  </span>
                ))}
              </div>

              {entry.userNote && (
                <p className="text-[11px] text-amber-200/80 font-sans italic bg-purple-950/30 p-2 rounded border border-purple-500/20">
                  Notas personales: {entry.userNote}
                </p>
              )}
            </div>

            <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => onSelectEntry(entry)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-cinzel border border-amber-400/40 flex items-center gap-1.5 transition-all w-full sm:w-auto justify-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Revisar
              </button>
              <button
                onClick={() => onDeleteEntry(entry.id)}
                className="p-1.5 rounded-xl bg-slate-900/80 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 transition-colors"
                title="Eliminar del diario"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
