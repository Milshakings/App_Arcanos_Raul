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
  Heart,
  HelpCircle,
} from 'lucide-react';
import { MODULOS_TAROT, TarotSpread } from './data/tarotData';
import { DeckShuffler, DrawnCardSlot } from './components/DeckShuffler';
import { ReadingResult, TarotReadingResponse } from './components/ReadingResult';
import { CardGrimoire } from './components/CardGrimoire';
import { DailyProgressTracker, DailyProgressEntry } from './components/DailyProgressTracker';
import { KeyInfoModal } from './components/KeyInfoModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { ThemeSelector } from './components/ThemeSelector';
import { MobileBottomNav, AppTab } from './components/MobileBottomNav';
import { mysticAudio } from './utils/mysticAudio';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('resumen-dia');

  // Estado independiente de lectura para cada una de las 4 pestañas
  const [readingsByTab, setReadingsByTab] = useState<{
    'resumen-dia': { reading: TarotReadingResponse | null; cards: DrawnCardSlot[]; isReadingView: boolean };
    gratitud: { reading: TarotReadingResponse | null; cards: DrawnCardSlot[]; isReadingView: boolean };
    consejos: { reading: TarotReadingResponse | null; cards: DrawnCardSlot[]; isReadingView: boolean };
    pregunta: { reading: TarotReadingResponse | null; cards: DrawnCardSlot[]; isReadingView: boolean };
  }>({
    'resumen-dia': { reading: null, cards: [], isReadingView: false },
    gratitud: { reading: null, cards: [], isReadingView: false },
    consejos: { reading: null, cards: [], isReadingView: false },
    pregunta: { reading: null, cards: [], isReadingView: false },
  });

  const [customQuestions, setCustomQuestions] = useState<{ [key: string]: string }>({
    'resumen-dia': '¿Qué energías, aprendizajes y acontecimientos marcaron mi día de hoy?',
    gratitud: '¿Por cuáles 3 bendiciones y enseñanzas sagradas debo dar gracias hoy?',
    consejos: '¿Qué guía, advertencias y consejos tienen los arcanos para mi Amor, mis Negocios y mi Salud?',
    pregunta: '',
  });

  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [dailyProgressEntries, setDailyProgressEntries] = useState<DailyProgressEntry[]>([]);

  // Modales y Sonido
  const [isKeyInfoOpen, setIsKeyInfoOpen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  // Cargar avances de localStorage
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

  // Obtener el spread correspondiente a la pestaña activa
  const getSpreadForTab = (tab: 'resumen-dia' | 'gratitud' | 'consejos' | 'pregunta'): TarotSpread => {
    switch (tab) {
      case 'resumen-dia':
        return MODULOS_TAROT[0]; // ¿Cómo fue mi día? (3 cartas)
      case 'gratitud':
        return MODULOS_TAROT[1]; // 3 cosas para agradecer (3 cartas)
      case 'consejos':
        return MODULOS_TAROT[2]; // Consejos en Amor, Negocios y Salud (6 cartas)
      case 'pregunta':
        return MODULOS_TAROT[3]; // Pregunta lo que sea (3 cartas)
    }
  };

  // Generar lectura para la pestaña activa
  const handleGenerateReadingForTab = async (
    tab: 'resumen-dia' | 'gratitud' | 'consejos' | 'pregunta',
    slots: DrawnCardSlot[]
  ) => {
    const spread = getSpreadForTab(tab);
    setIsLoadingAI(true);

    try {
      const payload = {
        moduloId: spread.id,
        spreadName: spread.name,
        spreadDescription: spread.description,
        question: customQuestions[tab] || spread.defaultQuestion,
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
      data.moduloId = spread.id;

      // Actualizar el estado de esta pestaña
      setReadingsByTab((prev) => ({
        ...prev,
        [tab]: {
          reading: data,
          cards: slots,
          isReadingView: true,
        },
      }));

      // Auto-guardar en los avances diarios
      const newEntry: DailyProgressEntry = {
        id: Date.now().toString(),
        dateKey: new Date().toISOString().split('T')[0],
        timestamp: new Date().toISOString(),
        moduleName: spread.name,
        title: data.title,
        summary: data.summary,
        drawnCards: slots,
        practicalStep: data.actionableWisdom?.practicalStep || '',
        practicalStepCompleted: false,
        sacredAffirmation: data.actionableWisdom?.sacredAffirmation || '',
        reflectionPrompt: data.actionableWisdom?.reflectionPrompt || '',
        userNotes: '',
      };
      saveEntriesToStorage([newEntry, ...dailyProgressEntries]);
    } catch (err) {
      console.error('Error al solicitar lectura de tarot:', err);
      // Fallback rico y extenso
      const fallbackReading: TarotReadingResponse = {
        moduloId: spread.id,
        title: `Resultado Sagrado: ${spread.name}`,
        summary: `Los arcanos del tarot han manifestado una respuesta certera para tu consulta.\nCada una de las cartas seleccionadas refleja las corrientes profundas que operan en tu interior.\nConfía en la sabiduría del universo y permite que estas revelaciones asienten en tu corazón.`,
        cardInsights: slots.map((s) => ({
          cardId: s.card.id,
          cardName: s.card.name,
          positionName: s.position.name,
          category: s.position.category,
          isReversed: s.isReversed,
          directMessage: `${s.card.name} en posición ${s.isReversed ? 'invertida' : 'al derecho'} llega a tu tirada para indicarte que en "${s.position.name}" debes mantener la calma y la perseverancia.\nNo te apresures a juzgar los acontecimientos recientes antes de que revelen su propósito superior.\nPermite que tu discernimiento silencioso guíe tus pasos con seguridad y nobleza.`,
          symbolism: s.card.symbolism,
          energyVibe: s.card.element,
        })),
        actionableWisdom: {
          practicalStep: 'Toma unos minutos esta noche para respirar profundo y asimilar las enseñanzas recibidas.',
          sacredAffirmation: 'Agradezco el camino recorrido y confío en la luz de mi destino.',
          reflectionPrompt: '¿Qué lección valiosa resuena en mi corazón hoy?',
        },
        mysticQuote: 'Como es arriba, es abajo; como es adentro, es afuera.',
      };

      if (spread.id === 'como-fue-mi-dia') {
        fallbackReading.dayReview = {
          overallVerdict: 'Un día de aprendizaje profundo donde la perseverancia fue tu mayor aliada ante las exigencias del entorno.',
          morningInsight: `La Mañana (${slots[0]?.card.name}): Comenzaste tu día enfocado en establecer prioridades claras y definir tus límites con serenidad.`,
          afternoonInsight: `La Tarde (${slots[1]?.card.name}): El momento central te exigió paciencia y cintura emocional para no reaccionar impulsivamente.`,
          eveningInsight: `La Noche (${slots[2]?.card.name}): Al caer el sol, tu mente decanta lo vivido; es hora de soltar el control y descansar en paz.`,
          keyLesson: 'Aceptar que los ritmos externos no deben perturbar tu templo interior de paz.',
          restGuidance: 'Desconecta tus pantallas temprano y permite que tu cuerpo se regenere en reposo.',
        };
      } else if (spread.id === 'agradecimiento-3-cosas') {
        fallbackReading.gratitudeReview = {
          gratitudeTheme: 'La gratitud es la llave que transmuta la rutina en abundancia espiritual.',
          blessing1: {
            title: '1. Bendición Tangible o Alegría Concreta',
            independentAnswer: `Agradece con ${slots[0]?.card.name} el sustento, la salud y los pequeños milagros materiales que te acompañaron hoy.`,
            cardName: slots[0]?.card.name || 'Carta 1',
          },
          blessing2: {
            title: '2. Fortaleza Interior y Reto Superado',
            independentAnswer: `Agradece con ${slots[1]?.card.name} el obstáculo que sorteaste con valentía, pues fortaleció tu carácter.`,
            cardName: slots[1]?.card.name || 'Carta 2',
          },
          blessing3: {
            title: '3. Regalo Espiritual y Sincronía',
            independentAnswer: `Agradece con ${slots[2]?.card.name} la protección sutil e invisible que cuidó tus pasos en todo momento.`,
            cardName: slots[2]?.card.name || 'Carta 3',
          },
          gratitudeMantra: 'Doy gracias por todo lo vivido y bendigo cada paso de mi destino.',
          gratitudeRitual: 'Mano en el pecho y tres veces gracias antes de dormir.',
        };
      } else if (spread.id === 'amor-negocios-salud') {
        fallbackReading.lifePillarsReview = {
          loveSection: {
            status: `En el Amor (${slots[0]?.card.name}): Tus vínculos buscan honestidad y empatía mutua.`,
            independentAdvice: `Consejo en el Amor (${slots[1]?.card.name}): Comunica tus sentimientos sin corazas y escucha al otro con paciencia.`,
          },
          businessSection: {
            status: `En los Negocios (${slots[2]?.card.name}): Tus proyectos avanzan con solidez hacia la maduración.`,
            independentAdvice: `Consejo en Negocios (${slots[3]?.card.name}): Mantén el orden financiero y no te disperses en tareas secundarias.`,
          },
          healthSection: {
            status: `En la Salud (${slots[4]?.card.name}): Tu cuerpo pide equilibrio entre el esfuerzo y el reposo.`,
            independentAdvice: `Consejo en Salud (${slots[5]?.card.name}): Hidrátate bien, camina al aire libre y dale a tu descanso la prioridad que merece.`,
          },
          harmonySynthesis: 'El verdadero éxito integra los tres pilares sin descuidar el bienestar íntimo.',
        };
      } else {
        fallbackReading.questionReview = {
          directAnswer: 'El tarot revela que la situación se resolverá favorablemente si actúas con prudencia e integridad.',
          rootCause: `La raíz con ${slots[0]?.card.name} se originó en la necesidad de clarificar tus verdaderos deseos.`,
          currentDynamics: `En el presente con ${slots[1]?.card.name}, las fuerzas te piden firmeza moral y serenidad.`,
          finalGuidance: `El desenlace con ${slots[2]?.card.name} te augura tranquilidad si no dudas de tu intuición.`,
        };
      }

      setReadingsByTab((prev) => ({
        ...prev,
        [tab]: {
          reading: fallbackReading,
          cards: slots,
          isReadingView: true,
        },
      }));
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleResetTabReading = (tab: 'resumen-dia' | 'gratitud' | 'consejos' | 'pregunta') => {
    setReadingsByTab((prev) => ({
      ...prev,
      [tab]: {
        reading: null,
        cards: [],
        isReadingView: false,
      },
    }));
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
    // Determinar a qué pestaña pertenece
    let targetTab: 'resumen-dia' | 'gratitud' | 'consejos' | 'pregunta' = 'resumen-dia';
    if (entry.moduleName.includes('Agradecer') || entry.moduleName.includes('Gratitud')) {
      targetTab = 'gratitud';
    } else if (entry.moduleName.includes('Amor') || entry.moduleName.includes('Consejos')) {
      targetTab = 'consejos';
    } else if (entry.moduleName.includes('Pregunta')) {
      targetTab = 'pregunta';
    }

    const reconstructedReading: TarotReadingResponse = {
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
    };

    setReadingsByTab((prev) => ({
      ...prev,
      [targetTab]: {
        reading: reconstructedReading,
        cards: entry.drawnCards,
        isReadingView: true,
      },
    }));

    setActiveTab(targetTab);
  };

  return (
    <div className="min-h-screen theme-app-bg text-slate-100 flex flex-col relative selection:bg-amber-500/30 selection:text-amber-200">
      {/* Fondo y Orbes reactivos al tema de color */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-15%] left-[20%] w-[600px] h-[600px] rounded-full theme-orb-1 blur-[140px]" />
        <div className="absolute top-[35%] right-[-10%] w-[500px] h-[500px] rounded-full theme-orb-2 blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full theme-orb-3 blur-[130px]" />
      </div>

      {/* Barra de Navegación Superior: Mobile-First con Selector de Temas, Audio, Clave e Instalador PWA */}
      <header className="relative z-20 border-b theme-header backdrop-blur-md sticky top-0 px-3 sm:px-6 py-2.5 sm:py-3 safe-top">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-3">
          {/* Fila superior en móvil: Logo + Acciones rápidas (Tema, Audio, PWA) */}
          <div className="w-full md:w-auto flex items-center justify-between gap-2">
            <div
              onClick={() => setActiveTab('resumen-dia')}
              className="flex items-center gap-2 cursor-pointer group shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-amber-300/30 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin [animation-duration:15s]" />
              </div>
              <h1 className="font-cinzel-decorative font-bold text-sm sm:text-base md:text-lg text-amber-200 tracking-wider">
                Arcana AI
              </h1>
            </div>

            {/* Acciones en móvil (Selector de Tema + Audio + Clave + PWA) */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <ThemeSelector />

              <PWAInstallButton />

              <button
                onClick={handleToggleAudio}
                title={isAudioPlaying ? 'Silenciar sonido 432Hz' : 'Activar sonido armónico 432Hz'}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                  isAudioPlaying
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800'
                }`}
              >
                {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setIsKeyInfoOpen(true)}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-amber-500/30 text-amber-300 text-xs font-cinzel flex items-center gap-1"
                title="Configuración de Clave Gemini"
              >
                <Key className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clave</span>
              </button>
            </div>
          </div>

          {/* LAS PESTAÑAS DEDICADAS (Visibles en desktop/tablet; en smartphone se complementan con la barra inferior fija) */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none">
            {/* Pestaña 1: Resumen del Día */}
            <button
              onClick={() => setActiveTab('resumen-dia')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'resumen-dia'
                  ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              Resumen del Día
            </button>

            {/* Pestaña 2: Gratitud */}
            <button
              onClick={() => setActiveTab('gratitud')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'gratitud'
                  ? 'bg-purple-900/40 text-purple-200 border border-purple-400/50 shadow-[0_0_12px_rgba(168,85,247,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-300" />
              Gratitud
            </button>

            {/* Pestaña 3: Consejos (Amor, Negocios, Salud) */}
            <button
              onClick={() => setActiveTab('consejos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'consejos'
                  ? 'bg-rose-950/40 text-rose-200 border border-rose-400/50 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-rose-300" />
              Consejos
            </button>

            {/* Pestaña 4: Pregunta al Tarot */}
            <button
              onClick={() => setActiveTab('pregunta')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'pregunta'
                  ? 'bg-sky-950/40 text-sky-200 border border-sky-400/50 shadow-[0_0_12px_rgba(56,189,248,0.25)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-sky-300" />
              Pregunta
            </button>

            <span className="w-[1px] h-4 bg-slate-700 mx-1 shrink-0" />

            {/* Pestaña 5: Avances Diarios */}
            <button
              onClick={() => setActiveTab('avances')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'avances'
                  ? 'bg-emerald-950/40 text-emerald-200 border border-emerald-400/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-300" />
              Avances
              {dailyProgressEntries.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px] flex items-center justify-center font-mono">
                  {dailyProgressEntries.length}
                </span>
              )}
            </button>

            {/* Pestaña 6: Grimorio */}
            <button
              onClick={() => setActiveTab('grimorio')}
              className={`px-3 py-1.5 rounded-xl text-xs font-cinzel font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
                activeTab === 'grimorio'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Grimorio
            </button>
          </nav>
        </div>
      </header>

      {/* Contenido Principal con Aislamiento Estricto por Pestaña */}
      <main className="relative z-10 flex-1 px-4 sm:px-8 py-6 max-w-7xl mx-auto w-full">
        {/* ============================================================== */}
        {/* PESTAÑA 1: RESUMEN DEL DÍA (¿CÓMO FUE MI DÍA? - 3 CARTAS) */}
        {/* ============================================================== */}
        {activeTab === 'resumen-dia' && (
          <div className="space-y-6">
            {!readingsByTab['resumen-dia'].isReadingView ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-cinzel">
                    <Sun className="w-3.5 h-3.5" />
                    Módulo Exclusivo: Balance del Día (3 Cartas)
                  </div>
                  <h2 className="font-cinzel-decorative text-2xl sm:text-4xl font-extrabold text-amber-200">
                    ¿Cómo Fue Mi Día?
                  </h2>
                  <p className="font-garamond text-sm sm:text-base text-slate-300 italic max-w-xl mx-auto">
                    Introduce o baraja 3 cartas para obtener el balance detallado e independiente de tu Mañana, tu Tarde y tu Noche.
                  </p>
                </div>

                <DeckShuffler
                  spread={getSpreadForTab('resumen-dia')}
                  question={customQuestions['resumen-dia']}
                  onReadingComplete={(slots) => handleGenerateReadingForTab('resumen-dia', slots)}
                  isLoadingAI={isLoadingAI}
                />
              </div>
            ) : (
              readingsByTab['resumen-dia'].reading && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleResetTabReading('resumen-dia')}
                    className="text-xs font-cinzel text-slate-400 hover:text-amber-200 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Realizar Otro Balance del Día
                  </button>

                  <ReadingResult
                    reading={readingsByTab['resumen-dia'].reading}
                    drawnCards={readingsByTab['resumen-dia'].cards}
                    spreadName="¿Cómo fue mi día?"
                    question={customQuestions['resumen-dia']}
                    onNewReading={() => handleResetTabReading('resumen-dia')}
                    onSaveToJournal={() => {}}
                    isSaved={true}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 2: GRATITUD (3 COSAS PARA AGRADECER - 3 CARTAS) */}
        {/* ============================================================== */}
        {activeTab === 'gratitud' && (
          <div className="space-y-6">
            {!readingsByTab['gratitud'].isReadingView ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-cinzel">
                    <Sparkles className="w-3.5 h-3.5" />
                    Módulo Exclusivo: Alquimia de Gratitud (3 Cartas)
                  </div>
                  <h2 className="font-cinzel-decorative text-2xl sm:text-4xl font-extrabold text-amber-200">
                    3 Cosas para Agradecer
                  </h2>
                  <p className="font-garamond text-sm sm:text-base text-slate-300 italic max-w-xl mx-auto">
                    Introduce o extrae 3 cartas para recibir 3 respuestas totalmente independientes de gratitud: Bendición concreta, reto superado y regalo espiritual.
                  </p>
                </div>

                <DeckShuffler
                  spread={getSpreadForTab('gratitud')}
                  question={customQuestions['gratitud']}
                  onReadingComplete={(slots) => handleGenerateReadingForTab('gratitud', slots)}
                  isLoadingAI={isLoadingAI}
                />
              </div>
            ) : (
              readingsByTab['gratitud'].reading && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleResetTabReading('gratitud')}
                    className="text-xs font-cinzel text-slate-400 hover:text-purple-300 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Realizar Otra Consulta de Gratitud
                  </button>

                  <ReadingResult
                    reading={readingsByTab['gratitud'].reading}
                    drawnCards={readingsByTab['gratitud'].cards}
                    spreadName="3 Cosas para Agradecer"
                    question={customQuestions['gratitud']}
                    onNewReading={() => handleResetTabReading('gratitud')}
                    onSaveToJournal={() => {}}
                    isSaved={true}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 3: CONSEJOS (AMOR, NEGOCIOS Y SALUD - 6 CARTAS) */}
        {/* ============================================================== */}
        {activeTab === 'consejos' && (
          <div className="space-y-6">
            {!readingsByTab['consejos'].isReadingView ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs font-cinzel">
                    <Compass className="w-3.5 h-3.5" />
                    Módulo Exclusivo: Consejos en Amor, Negocios y Salud (6 Cartas)
                  </div>
                  <h2 className="font-cinzel-decorative text-2xl sm:text-4xl font-extrabold text-amber-200">
                    Consejos en Amor, Negocios y Salud
                  </h2>
                  <p className="font-garamond text-sm sm:text-base text-slate-300 italic max-w-xl mx-auto">
                    Introduce 2 cartas para Amor, 2 cartas para Negocios y 2 cartas para Salud para obtener 3 respuestas exhaustivas e independientes.
                  </p>
                </div>

                <DeckShuffler
                  spread={getSpreadForTab('consejos')}
                  question={customQuestions['consejos']}
                  onReadingComplete={(slots) => handleGenerateReadingForTab('consejos', slots)}
                  isLoadingAI={isLoadingAI}
                />
              </div>
            ) : (
              readingsByTab['consejos'].reading && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleResetTabReading('consejos')}
                    className="text-xs font-cinzel text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Realizar Otra Consulta de Consejos
                  </button>

                  <ReadingResult
                    reading={readingsByTab['consejos'].reading}
                    drawnCards={readingsByTab['consejos'].cards}
                    spreadName="Consejos en Amor, Negocios y Salud"
                    question={customQuestions['consejos']}
                    onNewReading={() => handleResetTabReading('consejos')}
                    onSaveToJournal={() => {}}
                    isSaved={true}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 4: PREGUNTA AL TAROT (CONSULTA LIBRE - 3 CARTAS) */}
        {/* ============================================================== */}
        {activeTab === 'pregunta' && (
          <div className="space-y-6">
            {!readingsByTab['pregunta'].isReadingView ? (
              <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/25 text-sky-300 text-xs font-cinzel">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Módulo Exclusivo: Pregunta lo que sea al Tarot (3 Cartas)
                  </div>
                  <h2 className="font-cinzel-decorative text-2xl sm:text-4xl font-extrabold text-amber-200">
                    Pregunta al Tarot
                  </h2>
                  <p className="font-garamond text-sm sm:text-base text-slate-300 italic max-w-xl mx-auto">
                    Formula cualquier pregunta concreta. Los arcanos analizarán la Raíz, el Presente y el Desenlace con un detalle extenso.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-black/50 border border-sky-500/25 max-w-2xl mx-auto space-y-1.5">
                  <label className="font-cinzel text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Tu Pregunta para el Tarot:
                  </label>
                  <input
                    type="text"
                    value={customQuestions['pregunta']}
                    onChange={(e) =>
                      setCustomQuestions((prev) => ({ ...prev, pregunta: e.target.value }))
                    }
                    placeholder="Escribe aquí tu duda (ej. ¿Debo aceptar este nuevo camino laboral?)..."
                    className="w-full px-4 py-2.5 rounded-xl bg-black/60 border border-sky-500/20 text-slate-100 text-xs focus:outline-none focus:border-sky-400 placeholder:text-slate-600"
                  />
                </div>

                <DeckShuffler
                  spread={getSpreadForTab('pregunta')}
                  question={customQuestions['pregunta']}
                  onReadingComplete={(slots) => handleGenerateReadingForTab('pregunta', slots)}
                  isLoadingAI={isLoadingAI}
                />
              </div>
            ) : (
              readingsByTab['pregunta'].reading && (
                <div className="space-y-4">
                  <button
                    onClick={() => handleResetTabReading('pregunta')}
                    className="text-xs font-cinzel text-slate-400 hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Hacer Otra Pregunta al Tarot
                  </button>

                  <ReadingResult
                    reading={readingsByTab['pregunta'].reading}
                    drawnCards={readingsByTab['pregunta'].cards}
                    spreadName="Pregunta al Tarot"
                    question={customQuestions['pregunta']}
                    onNewReading={() => handleResetTabReading('pregunta')}
                    onSaveToJournal={() => {}}
                    isSaved={true}
                  />
                </div>
              )
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 5: AVANCES DIARIOS */}
        {/* ============================================================== */}
        {activeTab === 'avances' && (
          <DailyProgressTracker
            entries={dailyProgressEntries}
            onToggleStepCompleted={handleToggleStepCompleted}
            onUpdateNotes={handleUpdateNotes}
            onDeleteEntry={handleDeleteProgressEntry}
            onReviewReading={handleReviewProgressEntry}
          />
        )}

        {/* ============================================================== */}
        {/* PESTAÑA 6: GRIMORIO DE CARTAS */}
        {/* ============================================================== */}
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
      <footer className="relative z-10 border-t theme-footer py-5 px-4 mb-16 md:mb-0 text-center text-xs text-slate-500 font-garamond">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-cinzel text-amber-200/80">Arcana AI</span>
            <span>• Pestañas Independientes & Detalle Extenso</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Tarot Asistido por Gemini (<code className="text-amber-300">gemini-3.8-flash</code>)
          </div>
        </div>
      </footer>

      {/* Barra de Navegación Móvil Fija (Mobile-First para Smartphone y PWA) */}
      <MobileBottomNav
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        avancesCount={dailyProgressEntries.length}
      />
    </div>
  );
}
