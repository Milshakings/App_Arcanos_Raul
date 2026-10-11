import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  BookOpen,
  Compass,
  Volume2,
  VolumeX,
  Key,
  Flame,
  Sun,
  Activity,
  RotateCcw,
  Layers,
  ArrowRight,
  PlusCircle,
  Award,
} from 'lucide-react';
import { MODULOS_TAROT, TarotSpread } from './data/tarotData';
import { DeckShuffler, DrawnCardSlot } from './components/DeckShuffler';
import { ReadingResult, TarotReadingResponse } from './components/ReadingResult';
import { CardGrimoire } from './components/CardGrimoire';
import { DailyProgressTracker, DailyProgressEntry } from './components/DailyProgressTracker';
import { KeyInfoModal } from './components/KeyInfoModal';
import { mysticAudio } from './utils/mysticAudio';

type AppTab = 'altar' | 'avances' | 'grimorio';
type AltarStep = 'seleccion' | 'introduccion' | 'lectura';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('altar');
  const [altarStep, setAltarStep] = useState<AltarStep>('seleccion');

  // Estado del Módulo Seleccionado
  const [selectedSpread, setSelectedSpread] = useState<TarotSpread>(MODULOS_TAROT[0]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [drawnCards, setDrawnCards] = useState<DrawnCardSlot[]>([]);

  // Estado de la Lectura IA
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [activeReading, setActiveReading] = useState<TarotReadingResponse | null>(null);
  const [dailyProgressEntries, setDailyProgressEntries] = useState<DailyProgressEntry[]>([]);
  const [currentReadingSaved, setCurrentReadingSaved] = useState(false);

  // Modales y Sonido
  const [isKeyInfoOpen, setIsKeyInfoOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Cargar avances diarios guardados en localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('arcana_avances_diarios_es');
      if (stored) {
        setDailyProgressEntries(JSON.parse(stored));
      }
    } catch {
      // storage vacío
    }
  }, []);

  const saveEntriesToStorage = (entries: DailyProgressEntry[]) => {
    setDailyProgressEntries(entries);
    try {
      localStorage.setItem('arcana_avances_diarios_es', JSON.stringify(entries));
    } catch {
      // noop
    }
  };

  const handleToggleAudio = () => {
    const isPlaying = mysticAudio.toggleDrone();
    setIsAudioPlaying(isPlaying);
  };

  const handleStartIntroduction = (spread: TarotSpread) => {
    setSelectedSpread(spread);
    if (spread.id !== 'pregunta-libre') {
      setCustomQuestion(spread.defaultQuestion);
    }
    setDrawnCards([]);
    setActiveReading(null);
    setCurrentReadingSaved(false);
    setAltarStep('introduccion');
  };

  const handleGenerateReading = async (slots: DrawnCardSlot[]) => {
    setIsLoadingAI(true);
    setDrawnCards(slots);

    try {
      const payload = {
        moduloId: selectedSpread.id,
        spreadName: selectedSpread.name,
        spreadDescription: selectedSpread.description,
        question: customQuestion || selectedSpread.defaultQuestion,
        cards: slots.map((s) => ({
          id: s.card.id,
          name: s.card.name,
          arcana: s.card.arcana,
          suit: s.card.suit,
          element: s.card.element,
          positionName: s.position.name,
          positionMeaning: s.position.meaning,
          category: s.position.category,
          isReversed: s.isReversed,
          keywords: s.isReversed ? s.card.reversedKeywords : s.card.uprightKeywords,
        })),
      };

      const res = await fetch('/api/tarot/reading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Error al solicitar la lectura');
      }

      const data: TarotReadingResponse = await res.json();
      setActiveReading(data);

      // Auto-guardar automáticamente el avance diario
      const newEntry: DailyProgressEntry = {
        id: Date.now().toString(),
        dateKey: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        moduleName: selectedSpread.name,
        title: data.title,
        summary: data.summary,
        drawnCards: slots,
        practicalStep: data.actionableWisdom.practicalStep,
        practicalStepCompleted: false,
        sacredAffirmation: data.actionableWisdom.sacredAffirmation,
        reflectionPrompt: data.actionableWisdom.reflectionPrompt,
        userNotes: '',
      };
      saveEntriesToStorage([newEntry, ...dailyProgressEntries]);
      setCurrentReadingSaved(true);

      setAltarStep('lectura');
    } catch (err) {
      console.error('Error al invocar oráculo:', err);
      const fallbackData: TarotReadingResponse = {
        title: `La Revelación de los Arcanos: ${selectedSpread.name}`,
        summary: `Tus cartas han manifestado un mensaje de profunda sincronía. Con ${slots.map((s) => s.card.name).join(', ')}, el oráculo te recuerda que cada vivencia contiene una lección de oro para tu despertar.`,
        cardInsights: slots.map((s) => ({
          cardId: s.card.id,
          cardName: s.card.name,
          positionName: s.position.name,
          category: s.position.category,
          isReversed: s.isReversed,
          directMessage: s.isReversed ? s.card.reversedMeaning : s.card.uprightMeaning,
          symbolism: s.card.symbolism,
          energyVibe: s.card.element,
        })),
        moduloId: selectedSpread.id,
        lifePillarsReview: {
          loveSection: {
            status: 'En el amor, tus vínculos buscan autenticidad y comprensión mutua.',
            independentAdvice: 'Escucha con empatía y expresa tu verdad desde el afecto sincero.',
          },
          businessSection: {
            status: 'En los negocios, tus proyectos avanzan con paso firme hacia la consolidación.',
            independentAdvice: 'Cuida los detalles contractuales y mantén la disciplina de ahorro.',
          },
          healthSection: {
            status: 'En la salud, tu nivel de vitalidad pide atención a los tiempos de descanso.',
            independentAdvice: 'Hidrátate bien, camina al aire libre y suelta la sobrecarga mental.',
          },
          harmonySynthesis: 'El balance se logra cuando no sacrificas tu bienestar físico por exigencias externas.',
        },
        dayReview: {
          overallVerdict: 'Un día de contrastes donde la perseverancia fue tu mayor aliada.',
          morningInsight: `La Mañana (${slots[0]?.card.name}): Comenzaste con energía orientada a poner en orden tus prioridades.`,
          afternoonInsight: `La Tarde (${slots[1]?.card.name}): El punto de inflexión te exigió paciencia y flexibilidad ante los imprevistos.`,
          eveningInsight: `La Noche (${slots[2]?.card.name}): Cierras la jornada en asimilación; es momento de descansar.`,
          keyLesson: 'Aceptar los cambios de ritmo sin perder tu centro de paz.',
          restGuidance: 'Permite que tu mente y cuerpo se regeneren en silencio esta noche.',
        },
        gratitudeReview: {
          gratitudeTheme: 'La gratitud transmuta lo que tenemos en suficiente y multiplica la bendición.',
          blessing1: {
            title: '1. Bendición Concreta y Tangible',
            independentAnswer: `Agradece con ${slots[0]?.card.name} el sustento y los momentos de paz recibidos hoy.`,
            cardName: slots[0]?.card.name || 'Carta 1',
          },
          blessing2: {
            title: '2. Fortaleza Interior y Aprendizaje',
            independentAnswer: `Agradece con ${slots[1]?.card.name} tu valentía para afrontar los retos.`,
            cardName: slots[1]?.card.name || 'Carta 2',
          },
          blessing3: {
            title: '3. Regalo Espiritual y Sincronía',
            independentAnswer: `Agradece con ${slots[2]?.card.name} la protección sutil y los milagros cotidianos.`,
            cardName: slots[2]?.card.name || 'Carta 3',
          },
          gratitudeMantra: 'Doy gracias por todo lo vivido y bendigo mi camino.',
          gratitudeRitual: 'Coloca tu mano en el corazón y pronuncia gracias tres veces antes de descansar.',
        },
        actionableWisdom: {
          practicalStep: 'Dedica unos minutos esta noche a respirar hondo y soltar las cargas del día.',
          sacredAffirmation: 'Agradezco el camino recorrido y confío en la luz de mi destino.',
          reflectionPrompt: '¿Qué lección valiosa me dejó la experiencia vivida hoy?',
        },
        mysticQuote: 'Como es arriba, es abajo; como es adentro, es afuera.',
      };
      setActiveReading(fallbackData);

      const fallbackEntry: DailyProgressEntry = {
        id: Date.now().toString(),
        dateKey: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        moduleName: selectedSpread.name,
        title: fallbackData.title,
        summary: fallbackData.summary,
        drawnCards: slots,
        practicalStep: fallbackData.actionableWisdom.practicalStep,
        practicalStepCompleted: false,
        sacredAffirmation: fallbackData.actionableWisdom.sacredAffirmation,
        reflectionPrompt: fallbackData.actionableWisdom.reflectionPrompt,
        userNotes: '',
      };
      saveEntriesToStorage([fallbackEntry, ...dailyProgressEntries]);
      setCurrentReadingSaved(true);

      setAltarStep('lectura');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleToggleStepCompleted = (id: string) => {
    const updated = dailyProgressEntries.map((e) =>
      e.id === id ? { ...e, practicalStepCompleted: !e.practicalStepCompleted } : e
    );
    saveEntriesToStorage(updated);
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    const updated = dailyProgressEntries.map((e) =>
      e.id === id ? { ...e, userNotes: notes } : e
    );
    saveEntriesToStorage(updated);
  };

  const handleDeleteProgressEntry = (id: string) => {
    const updated = dailyProgressEntries.filter((e) => e.id !== id);
    saveEntriesToStorage(updated);
  };

  const handleReviewProgressEntry = (entry: DailyProgressEntry) => {
    setActiveReading({
      title: entry.title,
      summary: entry.summary,
      cardInsights: entry.drawnCards.map((c: any) => ({
        cardId: c.card.id,
        cardName: c.card.name,
        positionName: c.position.name,
        category: c.position.category,
        isReversed: c.isReversed,
        directMessage: c.isReversed ? c.card.reversedMeaning : c.card.uprightMeaning,
        symbolism: c.card.symbolism,
      })),
      actionableWisdom: {
        practicalStep: entry.practicalStep,
        sacredAffirmation: entry.sacredAffirmation,
        reflectionPrompt: entry.reflectionPrompt,
      },
      mysticQuote: 'Como es arriba, es abajo; como es adentro, es afuera.',
    });
    setDrawnCards(entry.drawnCards);
    setCustomQuestion(entry.moduleName);
    setCurrentReadingSaved(true);
    setActiveTab('altar');
    setAltarStep('lectura');
  };

  const getModuleIcon = (id: string) => {
    switch (id) {
      case 'como-fue-mi-dia':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'agradecimiento-3-cosas':
        return <Sparkles className="w-5 h-5 text-amber-300" />;
      case 'amor-negocios-salud':
        return <Compass className="w-5 h-5 text-purple-400" />;
      default:
        return <Layers className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070714] text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Fondo Cósmico y Nebulosa */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full bg-purple-900/15 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] rounded-full bg-amber-900/12 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-950/20 blur-[130px]" />
      </div>

      {/* Barra de Navegación Superior */}
      <header className="relative z-20 border-b border-amber-500/20 bg-[#070718]/90 backdrop-blur-md sticky top-0 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo / Marca */}
          <div
            onClick={() => {
              setActiveTab('altar');
              setAltarStep('seleccion');
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-amber-300/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 animate-spin [animation-duration:15s]" />
            </div>
            <div>
              <h1 className="font-cinzel-decorative font-bold text-lg sm:text-xl text-amber-200 tracking-wider flex items-center gap-2">
                Arcana AI
                <span className="text-[10px] font-sans font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Tarot & Oráculo
                </span>
              </h1>
              <p className="text-[10px] text-slate-400 font-garamond italic -mt-1 hidden sm:block">
                Lecturas de 3 Cartas & Avances Diarios Guardados
              </p>
            </div>
          </div>

          {/* Pestañas Principales */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('altar')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'altar'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Altar <span className="hidden sm:inline">de Tiradas</span>
            </button>

            <button
              onClick={() => setActiveTab('avances')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'avances'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Avances Diarios
              {dailyProgressEntries.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[10px] flex items-center justify-center font-mono">
                  {dailyProgressEntries.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('grimorio')}
              className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'grimorio'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Grimorio (78)
            </button>
          </nav>

          {/* Controles de Audio y Clave Gemini */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleAudio}
              title={isAudioPlaying ? 'Silenciar sonido 432Hz' : 'Activar sonido armónico 432Hz'}
              className={`p-2 rounded-xl border transition-all ${
                isAudioPlaying
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                  : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsKeyInfoOpen(true)}
              title="Información de la Clave Gemini"
              className="px-2.5 py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-amber-500/30 text-amber-300 text-xs font-cinzel flex items-center gap-1.5 transition-all"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Clave Gemini</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor Principal */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 py-8 max-w-7xl mx-auto w-full">
        {/* PESTAÑA 1: ALTAR SAGRADO */}
        {activeTab === 'altar' && (
          <div>
            {/* FASE 1: SELECCIÓN DE MÓDULO */}
            {altarStep === 'seleccion' && (
              <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
                {/* Banner Hero */}
                <div className="text-center space-y-3 pt-2 pb-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-cinzel tracking-wider uppercase">
                    <Sparkles className="w-3.5 h-3.5" />
                    Oráculo & Tiradas de Tarot
                  </div>
                  <h2 className="font-cinzel-decorative text-3xl sm:text-5xl font-extrabold text-amber-200 tracking-wide drop-shadow-[0_2px_15px_rgba(212,175,55,0.2)]">
                    Consulta los 4 Módulos Sagrados
                  </h2>
                  <p className="font-garamond text-base sm:text-lg text-slate-300 italic max-w-2xl mx-auto leading-relaxed">
                    Introduce tus cartas físicas exactas o baraja para obtener la lectura. Todos tus <strong className="text-amber-300">avances diarios quedan guardados</strong> de forma automática.
                  </p>
                </div>

                {/* Grid de los 4 Módulos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {MODULOS_TAROT.map((mod) => (
                    <div
                      key={mod.id}
                      onClick={() => handleStartIntroduction(mod)}
                      className="group cursor-pointer p-6 rounded-3xl bg-gradient-to-b from-[#12122c] to-[#0a0a1c] border border-amber-500/25 hover:border-amber-400/70 gold-glow transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between shadow-xl"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500/20 transition-colors">
                            {getModuleIcon(mod.id)}
                          </div>
                          <span className="text-xs font-mono px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                            {mod.cardCount} {mod.cardCount === 1 ? 'Carta' : 'Cartas'}
                          </span>
                        </div>

                        <h3 className="font-cinzel font-bold text-xl text-amber-200 group-hover:text-amber-100 mb-1">
                          {mod.name}
                        </h3>
                        <span className="text-xs text-amber-400/80 font-cinzel block mb-3 font-semibold">
                          {mod.subtitle}
                        </span>

                        <p className="text-xs text-slate-300 font-garamond italic leading-relaxed mb-4">
                          {mod.description}
                        </p>
                      </div>

                      <div className="border-t border-amber-500/20 pt-4 flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {mod.positions.map((p, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded bg-black/40 text-slate-300 border border-amber-500/15"
                            >
                              {p.name.split(':')[0]}
                            </span>
                          ))}
                        </div>

                        <span className="font-cinzel text-xs text-amber-300 font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0 ml-2">
                          Iniciar <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Banner de Avances Guardados */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-amber-950/30 to-purple-950/40 border border-amber-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-cinzel font-bold text-amber-200 block">
                        Registro de Avances y Hábitos Diarios
                      </span>
                      <p className="text-[11px] text-slate-300 font-garamond italic">
                        Tus consultas se guardan con fecha, acciones prácticas y reflexiones en la pestaña "Avances Diarios".
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('avances')}
                    className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-cinzel border border-amber-400/40 transition-all shrink-0"
                  >
                    Ver Mis Avances
                  </button>
                </div>
              </div>
            )}

            {/* FASE 2: INTRODUCIR CARTAS */}
            {altarStep === 'introduccion' && (
              <div className="animate-fade-in space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
                  <button
                    onClick={() => setAltarStep('seleccion')}
                    className="text-xs font-cinzel text-slate-400 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Volver a los 4 Módulos
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="font-cinzel text-sm text-amber-300 font-bold">
                      {selectedSpread.name}
                    </span>
                    <span className="text-xs text-slate-400">({selectedSpread.cardCount} cartas)</span>
                  </div>
                </div>

                {/* Campo de Pregunta */}
                <div className="p-5 rounded-2xl bg-black/40 border border-amber-500/25 max-w-4xl mx-auto space-y-2">
                  <label className="font-cinzel text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    {selectedSpread.id === 'pregunta-libre'
                      ? 'Escribe tu pregunta para el oráculo:'
                      : 'Intención o enfoque de tu tirada:'}
                  </label>
                  <input
                    type="text"
                    value={customQuestion}
                    onChange={(e) => setCustomQuestion(e.target.value)}
                    placeholder={
                      selectedSpread.id === 'pregunta-libre'
                        ? 'ej. ¿Qué debo saber sobre la propuesta que recibí hoy?'
                        : selectedSpread.defaultQuestion
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-amber-500/20 text-slate-100 text-xs focus:outline-none focus:border-amber-400 placeholder:text-slate-600"
                  />
                </div>

                {/* Selector / Introductor de Cartas */}
                <DeckShuffler
                  spread={selectedSpread}
                  question={customQuestion || selectedSpread.defaultQuestion}
                  onReadingComplete={handleGenerateReading}
                  isLoadingAI={isLoadingAI}
                />
              </div>
            )}

            {/* FASE 3: LECTURA RESULTANTE Y ORÁCULO DE 3 CARTAS */}
            {altarStep === 'lectura' && activeReading && (
              <ReadingResult
                reading={activeReading}
                drawnCards={drawnCards}
                spreadName={selectedSpread.name}
                question={customQuestion || selectedSpread.defaultQuestion}
                onNewReading={() => {
                  setAltarStep('seleccion');
                  setActiveReading(null);
                }}
                onSaveToJournal={() => {}}
                isSaved={currentReadingSaved}
              />
            )}
          </div>
        )}

        {/* PESTAÑA 2: AVANCES DIARIOS */}
        {activeTab === 'avances' && (
          <DailyProgressTracker
            entries={dailyProgressEntries}
            onToggleStepCompleted={handleToggleStepCompleted}
            onUpdateNotes={handleUpdateNotes}
            onDeleteEntry={handleDeleteProgressEntry}
            onReviewReading={handleReviewProgressEntry}
          />
        )}

        {/* PESTAÑA 3: GRIMORIO DE CARTAS */}
        {activeTab === 'grimorio' && <CardGrimoire />}
      </main>

      {/* Modal de Información de Clave Gemini */}
      <KeyInfoModal
        isOpen={isKeyInfoOpen}
        onClose={() => setIsKeyInfoOpen(false)}
        isAudioPlaying={isAudioPlaying}
        onToggleAudio={handleToggleAudio}
      />

      {/* Pie de Página */}
      <footer className="relative z-10 border-t border-amber-500/15 py-6 px-4 text-center text-xs text-slate-500 font-garamond bg-[#060610]">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-cinzel text-amber-200/80">Arcana AI</span>
            <span>• Desarrollado en Google AI Studio</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Oráculo Gemini (<code className="text-amber-300">gemini-3.8-flash</code>) • Tiradas de 3 Cartas & Avances Guardados
          </div>
        </div>
      </footer>
    </div>
  );
}
