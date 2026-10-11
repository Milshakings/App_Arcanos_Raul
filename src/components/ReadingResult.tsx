import React, { useState } from 'react';
import {
  Sparkles,
  Bookmark,
  Share2,
  Copy,
  Check,
  Compass,
  Heart,
  Briefcase,
  Activity,
  Send,
  HelpCircle,
  RotateCcw,
  BookOpen,
  Shuffle,
  PlusCircle,
  RefreshCw,
  Sun,
  Moon,
  CloudSun,
  Award,
} from 'lucide-react';
import { TarotCardView } from './TarotCardView';
import { DrawnCardSlot } from './DeckShuffler';
import { CardSelectorModal } from './CardSelectorModal';
import { TODAS_LAS_CARTAS, TarotCard, SpreadPosition } from '../data/tarotData';
import { mysticAudio } from '../utils/mysticAudio';

export interface TarotReadingResponse {
  moduloId?: string;
  title: string;
  summary: string;
  cardInsights: Array<{
    cardId: string;
    cardName: string;
    positionName: string;
    category?: string;
    isReversed: boolean;
    directMessage: string;
    symbolism: string;
    energyVibe?: string;
  }>;
  // Módulo 1: ¿Cómo fue mi día?
  dayReview?: {
    overallVerdict: string;
    morningInsight: string;
    afternoonInsight: string;
    eveningInsight: string;
    keyLesson: string;
    restGuidance: string;
  };
  // Módulo 2: 3 Cosas para Agradecer / Gratitud
  gratitudeReview?: {
    gratitudeTheme: string;
    blessing1: { title: string; independentAnswer: string; cardName: string };
    blessing2: { title: string; independentAnswer: string; cardName: string };
    blessing3: { title: string; independentAnswer: string; cardName: string };
    gratitudeMantra: string;
    gratitudeRitual: string;
  };
  // Módulo 3: Amor, Negocios y Salud
  lifePillarsReview?: {
    loveSection: { status: string; independentAdvice: string };
    businessSection: { status: string; independentAdvice: string };
    healthSection: { status: string; independentAdvice: string };
    harmonySynthesis: string;
  };
  // Módulo 4: Pregunta Libre
  questionReview?: {
    directAnswer: string;
    rootCause: string;
    currentDynamics: string;
    finalGuidance: string;
  };
  actionableWisdom: {
    practicalStep: string;
    sacredAffirmation: string;
    reflectionPrompt: string;
  };
  mysticQuote: string;
  isDemoReading?: boolean;
}

interface ReadingResultProps {
  reading: TarotReadingResponse;
  drawnCards: DrawnCardSlot[];
  spreadName: string;
  question: string;
  onNewReading: () => void;
  onSaveToJournal: (reading: any) => void;
  isSaved?: boolean;
}

const ORACLE_3_POSITIONS: SpreadPosition[] = [
  { index: 0, name: '1. La Revelación', meaning: 'El origen, raíz o luz sobre tu duda' },
  { index: 1, name: '2. La Advertencia', meaning: 'El obstáculo sutil, punto ciego o sombra a vigilar' },
  { index: 2, name: '3. El Consejo y Desenlace', meaning: 'La respuesta directa y paso sagrado a tomar' },
];

export interface OracleCardSlot {
  card: TarotCard;
  isReversed: boolean;
  position: SpreadPosition;
}

export const ReadingResult: React.FC<ReadingResultProps> = ({
  reading,
  drawnCards,
  spreadName,
  question,
  onNewReading,
  onSaveToJournal,
  isSaved = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [affirmationCopied, setAffirmationCopied] = useState(false);
  const [userNote, setUserNote] = useState('');

  // Estado del Oráculo con 3 Cartas
  const [clarifyQuery, setClarifyQuery] = useState('');
  const [oracleCards, setOracleCards] = useState<(OracleCardSlot | null)[]>([null, null, null]);
  const [selectorTargetIndex, setSelectorTargetIndex] = useState<number | null>(null);
  const [isClarifying, setIsClarifying] = useState(false);
  const [oracleReplies, setOracleReplies] = useState<
    Array<{ q: string; a: string; cards: OracleCardSlot[] }>
  >([]);

  const copyFullReading = () => {
    const text = `✨ ARCANA AI TAROT - LECTURA SAGRADA ✨
Título: ${reading.title}
Tirada: ${spreadName}
${question ? `Consulta: ${question}\n` : ''}

--- SÍNTESIS DEL ORÁCULO ---
${reading.summary}

--- CARTAS DE LA TIRADA ---
${drawnCards
  .map(
    (slot) =>
      `• ${slot.position.name}: ${slot.card.name} (${slot.isReversed ? 'Invertida' : 'Al derecho'})\n  Interpretación: ${
        reading.cardInsights?.find((ci) => ci.cardName === slot.card.name)?.directMessage || ''
      }`
  )
  .join('\n\n')}

--- CONSEJOS SAGRADOS ---
Paso Práctico: ${reading.actionableWisdom?.practicalStep || ''}
Afirmación: "${reading.actionableWisdom?.sacredAffirmation || ''}"
Pregunta de Reflexión: ${reading.actionableWisdom?.reflectionPrompt || ''}

Aforismo: "${reading.mysticQuote}"`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyAffirmation = () => {
    if (reading.actionableWisdom?.sacredAffirmation) {
      navigator.clipboard.writeText(reading.actionableWisdom.sacredAffirmation);
      setAffirmationCopied(true);
      setTimeout(() => setAffirmationCopied(false), 2000);
    }
  };

  const handleAssignOracleCard = (card: TarotCard, isReversed: boolean) => {
    if (selectorTargetIndex === null) return;
    setOracleCards((prev) => {
      const next = [...prev];
      next[selectorTargetIndex] = {
        card,
        isReversed,
        position: ORACLE_3_POSITIONS[selectorTargetIndex],
      };
      return next;
    });
    setSelectorTargetIndex(null);
  };

  const handleQuickDealOracle = () => {
    mysticAudio.playShuffleSound();
    const shuffled = [...TODAS_LAS_CARTAS].sort(() => Math.random() - 0.5);
    setOracleCards([
      { card: shuffled[0], isReversed: Math.random() < 0.25, position: ORACLE_3_POSITIONS[0] },
      { card: shuffled[1], isReversed: Math.random() < 0.25, position: ORACLE_3_POSITIONS[1] },
      { card: shuffled[2], isReversed: Math.random() < 0.25, position: ORACLE_3_POSITIONS[2] },
    ]);
  };

  const toggleReverseOracleCard = (idx: number) => {
    setOracleCards((prev) =>
      prev.map((c, i) => (i === idx && c ? { ...c, isReversed: !c.isReversed } : c))
    );
  };

  const handleAskClarification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarifyQuery.trim() || isClarifying) return;

    const query = clarifyQuery.trim();
    setIsClarifying(true);
    const activeOracleCards = oracleCards.filter((c): c is OracleCardSlot => c !== null);

    try {
      const res = await fetch('/api/tarot/clarify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          readingSummary: reading.summary,
          userQuery: query,
          cards: drawnCards.map((c) => ({
            name: c.card.name,
            position: c.position.name,
            isReversed: c.isReversed,
          })),
          oracleCards: activeOracleCards.map((c) => ({
            name: c.card.name,
            isReversed: c.isReversed,
            role: c.position.name,
          })),
        }),
      });
      const data = await res.json();
      setOracleReplies((prev) => [
        ...prev,
        {
          q: query,
          a: data.answer || 'Confía en tu sabiduría interior.',
          cards: activeOracleCards,
        },
      ]);
      setClarifyQuery('');
    } catch {
      setOracleReplies((prev) => [
        ...prev,
        {
          q: query,
          a: 'El velo permanece en silencio. Mira dentro de tu corazón para hallar la verdad.',
          cards: activeOracleCards,
        },
      ]);
    } finally {
      setIsClarifying(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ============================================================== */}
      {/* 1. ENCABEZADO Y SÍNTESIS DE LA LECTURA */}
      {/* ============================================================== */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-purple-950/40 via-[#0a0a20]/80 to-[#050512] border border-amber-500/30 gold-glow backdrop-blur-md overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel text-xs text-amber-300 uppercase tracking-widest">
                Resultado Sagrado • {spreadName}
              </span>
            </div>
            <h1 className="font-cinzel-decorative text-2xl sm:text-3xl font-bold text-amber-200 tracking-wide">
              {reading.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                onSaveToJournal({
                  id: Date.now().toString(),
                  dateKey: new Date().toISOString().split('T')[0],
                  timestamp: new Date().toISOString(),
                  spreadName,
                  moduleName: spreadName,
                  question,
                  title: reading.title,
                  summary: reading.summary,
                  drawnCards,
                  practicalStep: reading.actionableWisdom?.practicalStep || '',
                  practicalStepCompleted: false,
                  sacredAffirmation: reading.actionableWisdom?.sacredAffirmation || '',
                  reflectionPrompt: reading.actionableWisdom?.reflectionPrompt || '',
                  userNotes: userNote,
                  actionableWisdom: reading.actionableWisdom,
                  mysticQuote: reading.mysticQuote,
                })
              }
              className={`px-3.5 py-1.5 rounded-xl border text-xs font-cinzel flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-amber-500/20'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-300' : ''}`} />
              {isSaved ? '✓ Guardada en Avances' : 'Guardar en Avances'}
            </button>

            <button
              onClick={copyFullReading}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-amber-500/20 text-slate-200 text-xs font-cinzel flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-amber-300" />}
              {copied ? 'Copiada' : 'Compartir / Copiar'}
            </button>
          </div>
        </div>

        {question && (
          <div className="mb-4 inline-block px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 font-garamond italic">
            Consulta del consultante: "{question}"
          </div>
        )}

        <div className="border-t border-amber-500/20 pt-4">
          <h3 className="text-xs uppercase font-cinzel tracking-wider text-amber-400/90 font-bold mb-2">
            Síntesis y Mensaje del Oráculo
          </h3>
          <p className="text-slate-200 text-base font-garamond leading-relaxed whitespace-pre-line text-justify">
            {reading.summary}
          </p>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. SECCIONES INDEPENDIENTES SEGÚN EL MÓDULO */}
      {/* ============================================================== */}

      {/* A) MÓDULO 1: ¿CÓMO FUE MI DÍA? (RESULTADO INDEPENDIENTE POR ETAPAS) */}
      {reading.dayReview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-xl font-bold text-amber-200">
              Resultado Independiente: Balance Completo de tu Jornada
            </h2>
          </div>

          {/* Veredicto General del Día */}
          {reading.dayReview.overallVerdict && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-center">
              <span className="text-[10px] font-cinzel text-amber-400 uppercase tracking-wider block mb-1">
                Veredicto General de tu Día
              </span>
              <p className="text-sm font-cinzel font-bold text-amber-200 italic">
                "{reading.dayReview.overallVerdict}"
              </p>
            </div>
          )}

          {/* Las 3 Respuestas Independientes: Mañana, Tarde y Noche */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Mañana */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-[#0e0e24] border border-amber-500/30 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <h3 className="font-cinzel text-sm font-bold text-amber-300 uppercase tracking-wider">
                    1. La Mañana: Inicio e Intención
                  </h3>
                </div>
                <p className="text-xs text-slate-200 font-garamond leading-relaxed whitespace-pre-line">
                  {reading.dayReview.morningInsight}
                </p>
              </div>
              <span className="mt-4 text-[10px] text-amber-400/80 font-cinzel">
                Carta asociada: {drawnCards[0]?.card.name} ({drawnCards[0]?.isReversed ? 'Invertida' : 'Al derecho'})
              </span>
            </div>

            {/* Tarde */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-[#0e0e24] border border-purple-500/30 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CloudSun className="w-4 h-4 text-purple-300" />
                  <h3 className="font-cinzel text-sm font-bold text-purple-200 uppercase tracking-wider">
                    2. La Tarde: Desafío y Tensión
                  </h3>
                </div>
                <p className="text-xs text-slate-200 font-garamond leading-relaxed whitespace-pre-line">
                  {reading.dayReview.afternoonInsight}
                </p>
              </div>
              <span className="mt-4 text-[10px] text-purple-300/80 font-cinzel">
                Carta asociada: {drawnCards[1]?.card.name} ({drawnCards[1]?.isReversed ? 'Invertida' : 'Al derecho'})
              </span>
            </div>

            {/* Noche */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/30 to-[#08081a] border border-indigo-500/30 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Moon className="w-4 h-4 text-indigo-300" />
                  <h3 className="font-cinzel text-sm font-bold text-indigo-200 uppercase tracking-wider">
                    3. La Noche: Cierre y Sabiduría
                  </h3>
                </div>
                <p className="text-xs text-slate-200 font-garamond leading-relaxed whitespace-pre-line">
                  {reading.dayReview.eveningInsight}
                </p>
              </div>
              <span className="mt-4 text-[10px] text-indigo-300/80 font-cinzel">
                Carta asociada: {drawnCards[2]?.card.name} ({drawnCards[2]?.isReversed ? 'Invertida' : 'Al derecho'})
              </span>
            </div>
          </div>

          {/* Lección y Consejo de Descanso */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-black/50 border border-amber-500/20">
              <span className="text-[10px] font-cinzel text-amber-400 font-bold uppercase tracking-wider block mb-1">
                La Lección Central del Día
              </span>
              <p className="text-xs text-slate-200 font-garamond leading-relaxed">
                {reading.dayReview.keyLesson}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-black/50 border border-indigo-500/25">
              <span className="text-[10px] font-cinzel text-indigo-300 font-bold uppercase tracking-wider block mb-1">
                Consejo Sagrado para tu Descanso Esta Noche
              </span>
              <p className="text-xs text-slate-200 font-garamond leading-relaxed">
                {reading.dayReview.restGuidance}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* B) MÓDULO 2: 3 COSAS PARA AGRADECER / GRATITUD (RESPUESTAS TOTALMENTE INDEPENDIENTES) */}
      {reading.gratitudeReview && (
        <div className="space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-300" />
            <h2 className="font-cinzel text-xl font-bold text-amber-200">
              Respuestas Independientes de Gratitud Sagrada
            </h2>
          </div>

          {reading.gratitudeReview.gratitudeTheme && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-amber-500/10 border border-amber-500/30 text-center">
              <p className="text-xs font-garamond italic text-amber-200/95 leading-relaxed">
                "{reading.gratitudeReview.gratitudeTheme}"
              </p>
            </div>
          )}

          {/* Las 3 Cosas a Agradecer (Respuestas Independientes) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Gratitud 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-[#0e0c1f] border border-amber-400/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] uppercase font-cinzel font-bold text-amber-400 block mb-1">
                  1ra Respuesta Independiente
                </span>
                <h3 className="font-cinzel text-sm font-bold text-amber-200 mb-2">
                  {reading.gratitudeReview.blessing1?.title || 'Bendición Concreta y Tangible'}
                </h3>
                <p className="text-xs text-slate-200 font-garamond leading-relaxed whitespace-pre-line">
                  {reading.gratitudeReview.blessing1?.independentAnswer}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-amber-500/20 text-[10px] text-amber-300 font-cinzel">
                Carta: {drawnCards[0]?.card.name} ({drawnCards[0]?.isReversed ? 'Invertida' : 'Al derecho'})
              </div>
            </div>

            {/* Gratitud 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-purple-950/30 to-[#0e0c1f] border border-purple-400/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] uppercase font-cinzel font-bold text-purple-300 block mb-1">
                  2da Respuesta Independiente
                </span>
                <h3 className="font-cinzel text-sm font-bold text-purple-200 mb-2">
                  {reading.gratitudeReview.blessing2?.title || 'Fortaleza y Reto Superado'}
                </h3>
                <p className="text-xs text-slate-200 font-garamond leading-relaxed whitespace-pre-line">
                  {reading.gratitudeReview.blessing2?.independentAnswer}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-purple-500/20 text-[10px] text-purple-300 font-cinzel">
                Carta: {drawnCards[1]?.card.name} ({drawnCards[1]?.isReversed ? 'Invertida' : 'Al derecho'})
              </div>
            </div>

            {/* Gratitud 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-sky-950/30 to-[#0e0c1f] border border-sky-400/40 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <span className="text-[10px] uppercase font-cinzel font-bold text-sky-300 block mb-1">
                  3ra Respuesta Independiente
                </span>
                <h3 className="font-cinzel text-sm font-bold text-sky-200 mb-2">
                  {reading.gratitudeReview.blessing3?.title || 'Regalo Espiritual y Sincronía'}
                </h3>
                <p className="text-xs text-slate-200 font-garamond leading-relaxed whitespace-pre-line">
                  {reading.gratitudeReview.blessing3?.independentAnswer}
                </p>
              </div>
              <div className="mt-4 pt-2 border-t border-sky-500/20 text-[10px] text-sky-300 font-cinzel">
                Carta: {drawnCards[2]?.card.name} ({drawnCards[2]?.isReversed ? 'Invertida' : 'Al derecho'})
              </div>
            </div>
          </div>

          {/* Mantra y Gesto de Gratitud */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 text-center">
              <span className="text-[10px] font-cinzel font-bold text-amber-400 uppercase tracking-wider block mb-1">
                Decreto / Mantra de Agradecimiento
              </span>
              <p className="text-xs font-cinzel italic text-amber-200">
                "{reading.gratitudeReview.gratitudeMantra}"
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-950/25 border border-purple-500/30 text-center">
              <span className="text-[10px] font-cinzel font-bold text-purple-300 uppercase tracking-wider block mb-1">
                Ritual / Gesto Sagrado de Gratitud
              </span>
              <p className="text-xs font-garamond italic text-purple-200">
                {reading.gratitudeReview.gratitudeRitual}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* C) MÓDULO 3: AMOR, NEGOCIOS Y SALUD (3 PILARES INDEPENDIENTES) */}
      {reading.lifePillarsReview && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-xl font-bold text-amber-200">
              Respuestas Independientes en Amor, Negocios y Salud
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Amor */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-rose-950/30 to-[#0e0714] border border-rose-500/35 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="w-4 h-4 text-rose-400" />
                  <h3 className="font-cinzel text-sm font-bold text-rose-200 uppercase tracking-wider">
                    Pilar 1: Amor y Vínculos
                  </h3>
                </div>
                <div className="space-y-2 text-xs font-garamond text-slate-200 leading-relaxed">
                  <p><strong>Diagnóstico:</strong> {reading.lifePillarsReview.loveSection?.status}</p>
                  <p className="border-t border-rose-500/20 pt-2 text-rose-100">
                    <strong>Consejo Independiente:</strong> {reading.lifePillarsReview.loveSection?.independentAdvice}
                  </p>
                </div>
              </div>
              <span className="mt-4 text-[10px] text-rose-300/80 font-cinzel">
                Cartas 1 y 2: {drawnCards[0]?.card.name} & {drawnCards[1]?.card.name}
              </span>
            </div>

            {/* Negocios */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-[#120e06] border border-amber-500/35 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-amber-400" />
                  <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider">
                    Pilar 2: Negocios y Finanzas
                  </h3>
                </div>
                <div className="space-y-2 text-xs font-garamond text-slate-200 leading-relaxed">
                  <p><strong>Diagnóstico:</strong> {reading.lifePillarsReview.businessSection?.status}</p>
                  <p className="border-t border-amber-500/20 pt-2 text-amber-100">
                    <strong>Consejo Independiente:</strong> {reading.lifePillarsReview.businessSection?.independentAdvice}
                  </p>
                </div>
              </div>
              <span className="mt-4 text-[10px] text-amber-300/80 font-cinzel">
                Cartas 3 y 4: {drawnCards[2]?.card.name} & {drawnCards[3]?.card.name}
              </span>
            </div>

            {/* Salud */}
            <div className="p-6 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-[#06120c] border border-emerald-500/35 backdrop-blur-md flex flex-col justify-between shadow-xl">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <h3 className="font-cinzel text-sm font-bold text-emerald-200 uppercase tracking-wider">
                    Pilar 3: Salud y Vitalidad
                  </h3>
                </div>
                <div className="space-y-2 text-xs font-garamond text-slate-200 leading-relaxed">
                  <p><strong>Diagnóstico:</strong> {reading.lifePillarsReview.healthSection?.status}</p>
                  <p className="border-t border-emerald-500/20 pt-2 text-emerald-100">
                    <strong>Consejo Independiente:</strong> {reading.lifePillarsReview.healthSection?.independentAdvice}
                  </p>
                </div>
              </div>
              <span className="mt-4 text-[10px] text-emerald-300/80 font-cinzel">
                Cartas 5 y 6: {drawnCards[4]?.card.name} & {drawnCards[5]?.card.name}
              </span>
            </div>
          </div>

          {reading.lifePillarsReview.harmonySynthesis && (
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-500/20 text-center">
              <span className="text-[10px] font-cinzel text-amber-400 uppercase tracking-wider block mb-1">
                Síntesis de Armonía de los 3 Pilares
              </span>
              <p className="text-xs text-slate-300 font-garamond italic">
                {reading.lifePillarsReview.harmonySynthesis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* D) MÓDULO 4: PREGUNTA LIBRE (RESPUESTA DIRECTA) */}
      {reading.questionReview && (
        <div className="p-6 rounded-3xl bg-gradient-to-b from-sky-950/30 via-[#0a0f24] to-[#040816] border border-sky-400/40 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 mb-1">
            <HelpCircle className="w-5 h-5 text-sky-400" />
            <h2 className="font-cinzel text-xl font-bold text-sky-200">
              Respuesta Directa del Oráculo a tu Pregunta
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30">
            <span className="text-[10px] font-cinzel text-sky-300 font-bold uppercase tracking-wider block mb-1">
              Veredicto del Oráculo
            </span>
            <p className="text-sm font-cinzel font-bold text-sky-100">
              {reading.questionReview.directAnswer}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-black/50 border border-sky-500/20">
              <span className="text-xs font-cinzel text-sky-300 font-bold block mb-1">
                1. La Raíz del Asunto
              </span>
              <p className="text-xs text-slate-200 font-garamond">{reading.questionReview.rootCause}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-sky-500/20">
              <span className="text-xs font-cinzel text-sky-300 font-bold block mb-1">
                2. Las Fuerzas del Presente
              </span>
              <p className="text-xs text-slate-200 font-garamond">{reading.questionReview.currentDynamics}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/50 border border-sky-500/20">
              <span className="text-xs font-cinzel text-sky-300 font-bold block mb-1">
                3. El Desenlace y Consejo
              </span>
              <p className="text-xs text-slate-200 font-garamond">{reading.questionReview.finalGuidance}</p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. VISUALIZACIÓN DE TODAS LAS CARTAS DE LA CONSULTA */}
      {/* ============================================================== */}
      <div>
        <h2 className="font-cinzel text-xl font-bold text-amber-200 mb-6 flex items-center gap-2">
          <Compass className="w-5 h-5 text-amber-400" />
          Las Cartas Seleccionadas en la Tirada
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drawnCards.map((slot, idx) => {
            const insight = reading.cardInsights?.find(
              (ci) => ci.cardName.toLowerCase() === slot.card.name.toLowerCase()
            ) || reading.cardInsights?.[idx];

            return (
              <div
                key={slot.card.id + idx}
                className="p-5 rounded-2xl bg-gradient-to-b from-[#101026] to-[#070716] border border-amber-500/20 flex flex-col items-center justify-between shadow-xl"
              >
                <div className="w-full flex justify-center mb-4">
                  <TarotCardView
                    card={slot.card}
                    isReversed={slot.isReversed}
                    isFlipped={true}
                    positionLabel={slot.position.name}
                    positionMeaning={slot.position.meaning}
                    category={slot.position.category}
                    size="sm"
                    interactive={false}
                  />
                </div>

                <div className="w-full border-t border-amber-500/20 pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-cinzel text-xs font-bold text-amber-300">
                      {slot.position.name}
                    </span>
                    {insight?.energyVibe && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-900/40 text-purple-200 border border-purple-500/30">
                        {insight.energyVibe}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-amber-100/90 font-garamond italic leading-snug">
                    {insight?.directMessage || slot.card.uprightMeaning}
                  </p>

                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {insight?.symbolism || slot.card.symbolism}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 4. ACCIÓN PRÁCTICA Y AFIRMACIÓN SAGRADA */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-purple-950/20 border border-amber-500/20 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Compass className="w-4 h-4 text-amber-400" />
              <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider">
                Acción Práctica del Día
              </h3>
            </div>
            <p className="text-xs text-slate-200 font-garamond leading-relaxed">
              {reading.actionableWisdom?.practicalStep}
            </p>
          </div>
          <span className="mt-4 text-[10px] text-amber-300/70 font-cinzel">
            Queda registrada en tus Avances Diarios para que marques su cumplimiento
          </span>
        </div>

        <div className="p-6 rounded-2xl bg-gradient-to-b from-amber-950/30 to-purple-950/30 border border-amber-500/30 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-cinzel text-sm font-bold text-amber-200 uppercase tracking-wider">
                Afirmación Sagrada
              </h3>
              <button
                onClick={copyAffirmation}
                title="Copiar afirmación"
                className="text-amber-400 hover:text-amber-200 p-1 rounded"
              >
                {affirmationCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <p className="text-sm font-cinzel italic text-amber-300 leading-relaxed text-center my-2">
              "{reading.actionableWisdom?.sacredAffirmation}"
            </p>
          </div>
          <p className="text-[10px] text-slate-400 text-center font-garamond">
            Recita tres veces al comenzar o concluir tu jornada
          </p>
        </div>
      </div>

      {/* Reflexión y Diario Personal */}
      {reading.actionableWisdom?.reflectionPrompt && (
        <div className="p-6 rounded-2xl bg-[#09091b] border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="font-cinzel text-sm font-bold text-amber-200">
              Pregunta para tu Diario Personal
            </h3>
          </div>
          <p className="text-sm text-slate-300 font-garamond italic mb-3">
            "{reading.actionableWisdom.reflectionPrompt}"
          </p>

          <textarea
            value={userNote}
            onChange={(e) => setUserNote(e.target.value)}
            placeholder="Escribe tus reflexiones sobre esta tirada (se guardarán en tus Avances Diarios)..."
            rows={3}
            className="w-full p-3 rounded-xl bg-black/40 border border-amber-500/20 text-slate-200 text-xs font-sans focus:outline-none focus:border-amber-400/60 placeholder:text-slate-600 resize-none"
          />
        </div>
      )}

      {/* Aforismo Esotérico */}
      <div className="text-center py-4 px-6 border-y border-amber-500/20">
        <p className="font-garamond italic text-base text-amber-300/90">
          "{reading.mysticQuote}"
        </p>
      </div>

      {/* ============================================================== */}
      {/* 5. CONSULTA AL ORÁCULO CON 3 CARTAS DE TAROT */}
      {/* ============================================================== */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-[#141434] via-[#0d0d26] to-[#070716] border border-amber-400/35 gold-glow space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="font-cinzel text-base sm:text-lg font-bold text-amber-200">
                Consulta al Oráculo con 3 Cartas
              </h3>
            </div>
            <p className="text-xs text-slate-300 font-garamond italic">
              Introduce o extrae 3 cartas específicas para profundizar o resolver cualquier inquietud con el Oráculo Gemini.
            </p>
          </div>

          <button
            onClick={handleQuickDealOracle}
            className="px-3.5 py-1.5 rounded-xl bg-purple-950/50 hover:bg-purple-900/60 border border-amber-500/30 text-amber-200 text-xs font-cinzel flex items-center gap-1.5 transition-all self-end sm:self-auto"
          >
            <Shuffle className="w-3.5 h-3.5 text-amber-300" />
            Tirada Rápida de 3 Cartas
          </button>
        </div>

        {/* Las 3 Ranuras de Cartas del Oráculo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ORACLE_3_POSITIONS.map((pos, idx) => {
            const slot = oracleCards[idx];

            if (slot) {
              return (
                <div
                  key={pos.index}
                  className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/25 flex flex-col items-center justify-between"
                >
                  <TarotCardView
                    card={slot.card}
                    isReversed={slot.isReversed}
                    isFlipped={true}
                    positionLabel={pos.name}
                    positionMeaning={pos.meaning}
                    size="sm"
                    interactive={false}
                  />

                  <div className="flex items-center gap-2 mt-2 w-full justify-center">
                    <button
                      onClick={() => toggleReverseOracleCard(idx)}
                      className="text-[10px] px-2 py-0.5 rounded bg-black/60 hover:bg-purple-950/80 text-amber-300/80 border border-amber-500/30 font-cinzel flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      {slot.isReversed ? 'Invertida' : 'Al derecho'}
                    </button>
                    <button
                      onClick={() => setSelectorTargetIndex(idx)}
                      className="text-[10px] px-2 py-0.5 rounded bg-black/60 hover:bg-amber-950/80 text-amber-300/90 border border-amber-500/30 font-cinzel"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={pos.index}
                onClick={() => setSelectorTargetIndex(idx)}
                className="cursor-pointer p-4 rounded-2xl border-2 border-dashed border-amber-500/30 hover:border-amber-400/70 bg-purple-950/15 hover:bg-purple-950/30 flex flex-col items-center justify-center text-center transition-all min-h-[220px]"
              >
                <span className="text-[11px] font-cinzel font-bold text-amber-300/90 uppercase tracking-wider block mb-1">
                  {pos.name}
                </span>
                <span className="text-[10px] text-slate-400 font-garamond italic mb-3">
                  {pos.meaning}
                </span>
                <div className="w-9 h-9 rounded-full border border-amber-500/30 flex items-center justify-center text-amber-300 mb-2">
                  <PlusCircle className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-cinzel font-semibold text-amber-200">
                  Introducir Carta {idx + 1}
                </span>
              </div>
            );
          })}
        </div>

        {/* Historial de Respuestas del Oráculo con sus 3 cartas */}
        {oracleReplies.length > 0 && (
          <div className="space-y-4 pt-2">
            {oracleReplies.map((reply, i) => (
              <div key={i} className="p-5 rounded-2xl bg-black/60 border border-amber-500/25 space-y-3">
                <span className="text-xs font-cinzel font-bold text-amber-300 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Pregunta al Oráculo: "{reply.q}"
                </span>

                {reply.cards.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-[11px] font-cinzel text-slate-300">
                    <span className="text-amber-400/80">3 Cartas del Oráculo:</span>
                    {reply.cards.map((c, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-purple-950/40 border border-amber-500/20 text-amber-200"
                      >
                        {c.card.name} ({c.isReversed ? 'Invertida' : 'Al derecho'})
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-200 font-garamond whitespace-pre-line leading-relaxed border-t border-amber-500/15 pt-2">
                  {reply.a}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Formulario de Pregunta al Oráculo */}
        <form onSubmit={handleAskClarification} className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={clarifyQuery}
              onChange={(e) => setClarifyQuery(e.target.value)}
              placeholder="Escribe tu duda para que el Oráculo la responda con estas 3 cartas..."
              className="flex-1 px-4 py-3 rounded-xl bg-black/60 border border-amber-500/25 text-slate-100 text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
            />
            <button
              type="submit"
              disabled={!clarifyQuery.trim() || isClarifying}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-amber-50 text-xs font-cinzel font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all"
            >
              {isClarifying ? (
                <Sparkles className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {isClarifying ? 'Canalizando...' : 'Consultar con las 3 Cartas'}
            </button>
          </div>
        </form>
      </div>

      {/* Selector Modal para las 3 cartas del oráculo */}
      {selectorTargetIndex !== null && (
        <CardSelectorModal
          isOpen={true}
          onClose={() => setSelectorTargetIndex(null)}
          position={ORACLE_3_POSITIONS[selectorTargetIndex]}
          onSelectCard={handleAssignOracleCard}
          currentlyAssignedId={oracleCards[selectorTargetIndex]?.card.id}
        />
      )}

      {/* Botón para Realizar Otra Consulta */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onNewReading}
          className="px-6 py-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/40 text-amber-200 text-xs font-cinzel font-semibold flex items-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Realizar Otra Consulta al Tarot
        </button>
      </div>
    </div>
  );
};
