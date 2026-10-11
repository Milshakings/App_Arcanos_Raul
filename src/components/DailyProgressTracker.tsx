import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Circle,
  Flame,
  Sparkles,
  BookOpen,
  Trash2,
  ExternalLink,
  Edit3,
  Save,
  Download,
  Award,
} from 'lucide-react';
import { TarotCardView } from './TarotCardView';

export interface DailyProgressEntry {
  id: string;
  dateKey: string; // YYYY-MM-DD
  timestamp: string;
  moduleName: string;
  title: string;
  summary: string;
  drawnCards: any[];
  practicalStep: string;
  practicalStepCompleted: boolean;
  sacredAffirmation: string;
  reflectionPrompt: string;
  userNotes: string;
}

interface DailyProgressTrackerProps {
  entries: DailyProgressEntry[];
  onToggleStepCompleted: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteEntry: (id: string) => void;
  onReviewReading: (entry: DailyProgressEntry) => void;
}

export const DailyProgressTracker: React.FC<DailyProgressTrackerProps> = ({
  entries,
  onToggleStepCompleted,
  onUpdateNotes,
  onDeleteEntry,
  onReviewReading,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState<string>('');

  // Calcular racha de días consecutivos
  const calculateStreak = () => {
    if (entries.length === 0) return 0;
    const uniqueDates = Array.from(new Set(entries.map((e) => e.dateKey))).sort().reverse();
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Si hay entrada hoy o ayer, contamos
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      streak = 1;
      for (let i = 0; i < uniqueDates.length - 1; i++) {
        const d1 = new Date(uniqueDates[i]);
        const d2 = new Date(uniqueDates[i + 1]);
        const diffDays = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          streak++;
        } else {
          break;
        }
      }
    }
    return streak;
  };

  const streak = calculateStreak();
  const completedTasksCount = entries.filter((e) => e.practicalStepCompleted).length;

  const handleStartEdit = (entry: DailyProgressEntry) => {
    setEditingId(entry.id);
    setTempNotes(entry.userNotes || '');
  };

  const handleSaveNotes = (id: string) => {
    onUpdateNotes(id, tempNotes);
    setEditingId(null);
  };

  const exportProgressAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `avances_diarios_tarot_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Panel Superior: Estadísticas de Avance y Racha */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141432] via-[#0b0b22] to-[#060614] border border-amber-500/30 gold-glow backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel text-xs uppercase tracking-widest text-amber-300">
                Evolución & Autoconocimiento
              </span>
            </div>
            <h2 className="font-cinzel-decorative font-bold text-2xl sm:text-3xl text-amber-200">
              Registro de Avances Diarios
            </h2>
            <p className="text-xs text-slate-300 font-garamond italic mt-1">
              Guarda tus lecturas diarias, el cumplimiento de tus acciones terrenales y las reflexiones acumuladas.
            </p>
          </div>

          {entries.length > 0 && (
            <button
              onClick={exportProgressAsJSON}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-xs font-cinzel flex items-center gap-1.5 transition-all self-end sm:self-auto"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar Avances
            </button>
          )}
        </div>

        {/* Tarjetas de Métricas de Avance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-black/45 border border-amber-500/20 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-cinzel text-slate-400 block">
                Racha de Días Activos
              </span>
              <span className="text-2xl font-cinzel font-bold text-amber-200">
                {streak} {streak === 1 ? 'Día' : 'Días'}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/45 border border-amber-500/20 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-300">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-cinzel text-slate-400 block">
                Consultas Guardadas
              </span>
              <span className="text-2xl font-cinzel font-bold text-amber-200">
                {entries.length} Registros
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/45 border border-amber-500/20 flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-cinzel text-slate-400 block">
                Acciones Cumplidas
              </span>
              <span className="text-2xl font-cinzel font-bold text-amber-200">
                {completedTasksCount} / {entries.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Entradas de Avance Diario */}
      {entries.length === 0 ? (
        <div className="p-12 rounded-3xl bg-purple-950/20 border border-amber-500/20 text-center flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-amber-400/50 mb-3" />
          <h3 className="font-cinzel text-lg font-bold text-amber-200 mb-1">
            Aún no tienes avances diarios registrados
          </h3>
          <p className="text-xs text-slate-400 font-garamond italic max-w-md">
            Al realizar tu primera tirada (como "¿Cómo fue mi día?" o "3 Cosas para Agradecer"), se guardará automáticamente aquí para que lleves tu registro día a día.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="p-6 rounded-2xl bg-gradient-to-b from-[#101026] to-[#080816] border border-amber-500/20 hover:border-amber-400/40 transition-all shadow-xl space-y-4"
            >
              {/* Encabezado de la Entrada */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-500/15 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-semibold">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(entry.timestamp).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span className="text-xs font-cinzel text-purple-300 font-bold">
                    {entry.moduleName}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onReviewReading(entry)}
                    className="px-3 py-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-cinzel border border-amber-400/40 flex items-center gap-1 transition-all"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Ver Tirada
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-400 hover:text-red-300 border border-slate-700 hover:border-red-500/40 transition-colors"
                    title="Eliminar este avance"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Título y Síntesis */}
              <div>
                <h3 className="font-cinzel font-bold text-lg text-amber-200">
                  {entry.title}
                </h3>
                <p className="text-xs text-slate-300 font-garamond italic mt-1 leading-relaxed line-clamp-3">
                  {entry.summary}
                </p>
              </div>

              {/* Miniatura de Cartas */}
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] font-cinzel text-slate-400 uppercase tracking-wider">
                  Cartas del Día:
                </span>
                {entry.drawnCards.map((slot, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/25 text-amber-200 font-cinzel flex items-center gap-1"
                  >
                    <strong>{slot.card.name}</strong>
                    <span className="text-[10px] text-purple-300">
                      ({slot.isReversed ? 'Invertida' : 'Al derecho'})
                    </span>
                  </span>
                ))}
              </div>

              {/* Tarea / Acción Práctica con Checkbox Interactivo */}
              {entry.practicalStep && (
                <div
                  onClick={() => onToggleStepCompleted(entry.id)}
                  className={`cursor-pointer p-3.5 rounded-xl border transition-all flex items-start gap-3 select-none ${
                    entry.practicalStepCompleted
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                      : 'bg-black/40 border-amber-500/20 text-slate-200 hover:border-amber-400/50'
                  }`}
                >
                  <div className="shrink-0 mt-0.5">
                    {entry.practicalStepCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-xs font-cinzel font-bold block mb-0.5">
                      Acción Terrenal del Día: {entry.practicalStepCompleted ? '(✓ Cumplida)' : '(Pendiente)'}
                    </span>
                    <p className={`text-xs font-garamond leading-snug ${entry.practicalStepCompleted ? 'line-through opacity-80' : ''}`}>
                      {entry.practicalStep}
                    </p>
                  </div>
                </div>
              )}

              {/* Afirmación */}
              {entry.sacredAffirmation && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/20 text-center">
                  <span className="text-[10px] font-cinzel text-amber-400 uppercase tracking-wider block mb-0.5">
                    Mantra / Afirmación Sagrada
                  </span>
                  <p className="text-xs font-cinzel italic text-amber-200">
                    "{entry.sacredAffirmation}"
                  </p>
                </div>
              )}

              {/* Notas Personales y Edición */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/15 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-cinzel text-slate-400 flex items-center gap-1.5">
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                    Tus Notas y Reflexiones del Día:
                  </span>
                  {editingId !== entry.id && (
                    <button
                      onClick={() => handleStartEdit(entry)}
                      className="text-[11px] text-amber-300 hover:text-amber-200 underline font-cinzel"
                    >
                      Editar Notas
                    </button>
                  )}
                </div>

                {editingId === entry.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="Registra tus sensaciones, logros o eventos que ocurrieron durante el día..."
                      rows={3}
                      className="w-full p-2.5 rounded-lg bg-black/60 border border-amber-500/30 text-slate-100 text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600 resize-none font-sans"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1 rounded-lg bg-slate-800 text-slate-300 text-xs font-cinzel"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleSaveNotes(entry.id)}
                        className="px-3 py-1 rounded-lg bg-amber-500/30 text-amber-200 border border-amber-400/50 text-xs font-cinzel flex items-center gap-1"
                      >
                        <Save className="w-3 h-3" />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-garamond italic text-slate-300 leading-relaxed">
                    {entry.userNotes || 'Sin notas registradas aún. Haz clic en "Editar Notas" para agregar tus reflexiones.'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
