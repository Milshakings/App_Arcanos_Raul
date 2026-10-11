import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = Number(process.env.PORT) || 3000;
const isProd = process.env.NODE_ENV === 'production';

// Initialize Gemini SDK with User-Agent header
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API status check
app.get('/api/status', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    hasKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    model: 'gemini-3.8-flash',
    language: 'es',
  });
});

// Tarot Reading Endpoint en Español con Respuestas Independientes por Módulo
app.post('/api/tarot/reading', async (req: Request, res: Response) => {
  try {
    const { moduloId, spreadName, spreadDescription, question, cards } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'Se requiere una lista de cartas para realizar la tirada.' });
    }

    const cardsDescription = cards
      .map(
        (c: any, idx: number) =>
          `Carta ${idx + 1}: ${c.name} (${c.isReversed ? 'INVERTIDA' : 'AL DERECHO'})
           Posición: ${c.positionName || `Posición ${idx + 1}`} - ${c.positionMeaning || ''}
           ${c.category ? `Área/Pilar: ${c.category}` : ''}
           Arcano: ${c.arcana || ''}, Palo: ${c.suit || 'Mayor'}
           Palabras clave: ${c.keywords ? c.keywords.join(', ') : ''}`
      )
      .join('\n\n');

    let moduloInstructions = '';
    if (moduloId === 'como-fue-mi-dia') {
      moduloInstructions = `MÓDULO: ¿CÓMO FUE MI DÍA? (3 CARTAS)
Este módulo debe dar un resultado completo e independiente sobre cómo estuvo el día:
- overallVerdict: Un balance general y veredicto claro y poético de cómo se sintió la jornada completa.
- morningInsight: Una respuesta totalmente independiente y detallada sobre la MAÑANA (la energía al despertar, intenciones o primer impulso).
- afternoonInsight: Una respuesta totalmente independiente y detallada sobre la TARDE (el reto, roce, tarea central o punto de inflexión).
- eveningInsight: Una respuesta totalmente independiente y detallada sobre la NOCHE (el cierre, cómo decanta la jornada y la sabiduría asimilada).
- keyLesson: La enseñanza de oro que le dejó este día.
- restGuidance: Consejo sagrado para soltar la mente y descansar en paz esta noche.`;
    } else if (moduloId === 'agradecimiento-3-cosas') {
      moduloInstructions = `MÓDULO: 3 COSAS PARA AGRADECER / GRATITUD (3 CARTAS)
El consultante quiere una respuesta independiente para cada una de las 3 cosas que debe agradecer hoy, y un resultado sagrado de gratitud:
- gratitudeTheme: Síntesis inspiradora de por qué agradecer hoy eleva su vibración.
- blessing1: Objeto con { title: "Primera Bendición Concreta", independentAnswer: "Explicación profunda de este regalo o momento de luz recibido", cardName: nombre de la carta 1 }.
- blessing2: Objeto con { title: "Segunda Bendición: Fortaleza o Reto Superado", independentAnswer: "Explicación profunda del aprendizaje o resiliencia ganada", cardName: nombre de la carta 2 }.
- blessing3: Objeto con { title: "Tercera Bendición: Regalo Espiritual o Sincronía", independentAnswer: "Explicación profunda de la protección sutil o milagro cotidiano", cardName: nombre de la carta 3 }.
- gratitudeMantra: Un decreto o mantra sagrado de agradecimiento.
- gratitudeRitual: Un gesto simple para honrar la gratitud hoy.`;
    } else if (moduloId === 'amor-negocios-salud') {
      moduloInstructions = `MÓDULO: CONSEJOS EN AMOR, NEGOCIOS Y SALUD (6 CARTAS EN TOTAL, 2 POR CADA ÁREA)
Cada una de las tres áreas debe tener su PROPIA RESPUESTA TOTALMENTE INDEPENDIENTE:
- loveSection: Objeto con { status: "Diagnóstico actual del corazón y relaciones", independentAdvice: "Consejo sagrado específico e independiente para el amor" } basado en cartas 1 y 2.
- businessSection: Objeto con { status: "Diagnóstico actual de finanzas y trabajo", independentAdvice: "Consejo estratégico específico e independiente para negocios" } basado en cartas 3 y 4.
- healthSection: Objeto con { status: "Diagnóstico de vitalidad y descanso", independentAdvice: "Consejo específico e independiente para la salud y bienestar" } basado en cartas 5 y 6.
- harmonySynthesis: Cómo equilibrar armoniosamente estas 3 áreas de vida.`;
    } else {
      moduloInstructions = `MÓDULO: PREGUNTA LO QUE SEA / CONSULTA LIBRE (3 CARTAS)
Pregunta formulada: "${question ? question.trim() : 'Orientación general'}"
Debe ofrecer una respuesta independiente y certera a la pregunta:
- directAnswer: Respuesta clara y contundente a la pregunta.
- rootCause: La raíz o causa profunda que originó la situación.
- currentDynamics: La fuerza activa presente ahora mismo.
- finalGuidance: El desenlace y recomendación definitiva.`;
    }

    const prompt = `Eres un sabio y empático Maestro de Tarot y Guía Espiritual en español.

El consultante requiere que cada módulo ofrezca un resultado independiente y adaptado exactamente a su naturaleza.

${moduloInstructions}

Cartas Introducidas en la Tirada:
${cardsDescription}

Pregunta o Intención: "${question ? question.trim() : 'Consulta al oráculo'}"

Devuelve un JSON estrictamente estructurado en español con:
- moduloId: "${moduloId}"
- title: Título evocador y poético
- summary: Síntesis oracular global
- cardInsights: Arreglo de cada carta con { cardId, cardName, positionName, isReversed, directMessage, symbolism, energyVibe }
- dayReview: (Solo si moduloId === 'como-fue-mi-dia') { overallVerdict, morningInsight, afternoonInsight, eveningInsight, keyLesson, restGuidance }
- gratitudeReview: (Solo si moduloId === 'agradecimiento-3-cosas') { gratitudeTheme, blessing1: { title, independentAnswer, cardName }, blessing2: { title, independentAnswer, cardName }, blessing3: { title, independentAnswer, cardName }, gratitudeMantra, gratitudeRitual }
- lifePillarsReview: (Solo si moduloId === 'amor-negocios-salud') { loveSection: { status, independentAdvice }, businessSection: { status, independentAdvice }, healthSection: { status, independentAdvice }, harmonySynthesis }
- questionReview: (Solo si moduloId === 'pregunta-libre') { directAnswer, rootCause, currentDynamics, finalGuidance }
- actionableWisdom: { practicalStep, sacredAffirmation, reflectionPrompt }
- mysticQuote: Aforismo místico en español`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback enriquecido según el módulo
      const fallbackResponse: any = {
        moduloId,
        title: `Lectura Sagrada: ${spreadName}`,
        summary: `Las cartas han respondido a tu consulta revelando las fuerzas que operan en tu esfera. Con ${cards.map((c: any) => c.name).join(', ')}, confía en tu intuición y en la sincronía del momento.`,
        cardInsights: cards.map((c: any) => ({
          cardId: c.id,
          cardName: c.name,
          positionName: c.positionName || 'Posición',
          isReversed: Boolean(c.isReversed),
          directMessage: `${c.name} en posición ${c.isReversed ? 'invertida' : 'al derecho'} te indica que en "${c.positionName}" debes mantener la serenidad y confiar en tu discernimiento.`,
          symbolism: `${c.name} representa la sabiduría arquetípica de la transformación.`,
          energyVibe: c.suit || 'Mayor',
        })),
        actionableWisdom: {
          practicalStep: 'Dedica 5 minutos a la respiración consciente y conecta con tu paz interior.',
          sacredAffirmation: 'Agradezco cada experiencia y avanzo con confianza.',
          reflectionPrompt: '¿Qué aprendizaje esencial resuena en mi corazón hoy?',
        },
        mysticQuote: 'Como es arriba, es abajo; como es adentro, es afuera.',
        isDemoReading: true,
      };

      if (moduloId === 'como-fue-mi-dia') {
        fallbackResponse.dayReview = {
          overallVerdict: 'Un día de contrastes donde la perseverancia fue tu mayor aliada.',
          morningInsight: `La Mañana (${cards[0]?.name}): Comenzaste con energía orientada a poner en orden tus prioridades.`,
          afternoonInsight: `La Tarde (${cards[1]?.name}): El punto de inflexión te exigió paciencia y flexibilidad ante los imprevistos.`,
          eveningInsight: `La Noche (${cards[2]?.name}): Cierras la jornada en asimilación; es momento de soltar la exigencia y descansar.`,
          keyLesson: 'Aceptar los cambios de ritmo sin perder tu centro de paz.',
          restGuidance: 'Apaga las pantallas temprano y permite que tu cuerpo se regenere en silencio.',
        };
      } else if (moduloId === 'agradecimiento-3-cosas') {
        fallbackResponse.gratitudeReview = {
          gratitudeTheme: 'La gratitud transmuta lo que tenemos en suficiente y multiplica la abundancia.',
          blessing1: {
            title: '1. Bendición Concreta y Tangible',
            independentAnswer: `Agradece con ${cards[0]?.name} el sustento, la salud y los pequeños momentos de tranquilidad recibidos hoy.`,
            cardName: cards[0]?.name || 'Carta 1',
          },
          blessing2: {
            title: '2. Fortaleza Interior y Aprendizaje',
            independentAnswer: `Agradece con ${cards[1]?.name} tu capacidad de sobreponerte a los retos con valentía y madurez.`,
            cardName: cards[1]?.name || 'Carta 2',
          },
          blessing3: {
            title: '3. Regalo Espiritual y Sincronía',
            independentAnswer: `Agradece con ${cards[2]?.name} la guía invisible y la paz que te acompañan incluso en momentos de incertidumbre.`,
            cardName: cards[2]?.name || 'Carta 3',
          },
          gratitudeMantra: 'Doy gracias por todo lo que es, todo lo que fue y todo lo que está por llegar.',
          gratitudeRitual: 'Coloca tu mano en el corazón y pronuncia tres veces gracias antes de dormir.',
        };
      } else if (moduloId === 'amor-negocios-salud') {
        fallbackResponse.lifePillarsReview = {
          loveSection: {
            status: `En el amor (${cards[0]?.name}), tus vínculos buscan autenticidad y comprensión mutua.`,
            independentAdvice: `Consejo independiente (${cards[1]?.name}): Escucha con empatía y expresa tu verdad desde el afecto sincero.`,
          },
          businessSection: {
            status: `En los negocios (${cards[2]?.name}), tus proyectos avanzan con paso firme hacia la consolidación.`,
            independentAdvice: `Consejo independiente (${cards[3]?.name}): Cuida los detalles contractuales y mantén la disciplina de ahorro.`,
          },
          healthSection: {
            status: `En la salud (${cards[4]?.name}), tu nivel de vitalidad pide atención a los tiempos de descanso.`,
            independentAdvice: `Consejo independiente (${cards[5]?.name}): Hidrátate bien, camina al aire libre y suelta la sobrecarga mental.`,
          },
          harmonySynthesis: 'El balance se logra cuando no sacrificas tu bienestar físico por exigencias externas.',
        };
      } else {
        fallbackResponse.questionReview = {
          directAnswer: `El oráculo te responde que la situación tiene una resolución positiva si actúas con prudencia.`,
          rootCause: `La raíz con ${cards[0]?.name} se originó en una búsqueda de mayor claridad y verdad.`,
          currentDynamics: `En el presente con ${cards[1]?.name}, las fuerzas te piden firmeza y serenidad.`,
          finalGuidance: `El desenlace con ${cards[2]?.name} te aconseja confiar en tu instinto y dar el paso con determinación.`,
        };
      }

      return res.json(fallbackResponse);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un sabio Maestro de Tarot en español. Cuando el consultante elija ¿Cómo fue mi día?, das un balance del día completo e independiente para mañana, tarde y noche. Cuando elija Gratitud, das respuestas independientes y detalladas para cada una de las 3 cosas a agradecer. Cuando elija Amor, Negocios y Salud, das respuestas independientes y exhaustivas para cada pilar. Devuelve exclusivamente JSON válido.',
        responseMimeType: 'application/json',
      },
    });

    const readingText = response.text?.trim() || '{}';
    const readingData = JSON.parse(readingText);
    readingData.moduloId = moduloId;
    res.json(readingData);
  } catch (error: any) {
    console.error('Error al generar la lectura de tarot:', error);
    res.status(500).json({
      error: 'Las corrientes cósmicas experimentaron una interrupción.',
      details: error?.message || 'Error desconocido',
    });
  }
});

// Follow-up / Clarification Endpoint con 3 Cartas del Oráculo en Español
app.post('/api/tarot/clarify', async (req: Request, res: Response) => {
  try {
    const { question, userQuery, readingSummary, cards, oracleCards } = req.body;

    if (!userQuery) {
      return res.status(400).json({ error: 'Se requiere una pregunta para el oráculo.' });
    }

    const hasOracleCards = Array.isArray(oracleCards) && oracleCards.length > 0;
    const oracleCardsText = hasOracleCards
      ? oracleCards
          .map(
            (c: any, i: number) =>
              `- Carta ${i + 1} del Oráculo (${c.role || `Posición ${i + 1}`}): ${c.name} (${c.isReversed ? 'INVERTIDA' : 'AL DERECHO'})`
          )
          .join('\n')
      : 'Sin cartas adicionales';

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        answer: `El oráculo contempla tu inquietud: "${userQuery}". ${
          hasOracleCards
            ? `A través de las 3 cartas sagradas del oráculo (${oracleCards.map((c: any) => c.name).join(', ')}), se te revela que la paciencia y la coherencia serán tus mejores aliadas. Confía en tu corazón.`
            : 'Recuerda que las cartas señalan una dirección, pero tu voluntad consciente es quien forja el destino.'
        }`,
      });
    }

    const prompt = `Eres el sabio Oráculo del Tarot en español. El consultante tiene una duda o aclaración sobre su consulta y ha consultado 3 cartas específicas al oráculo para responderla.

Consulta Original de la Tirada: "${question || 'Orientación espiritual'}"
Resumen Previo: "${readingSummary || ''}"

Pregunta / Inquietud del Consultante para el Oráculo: "${userQuery}"

Las 3 Cartas que el Consultante Utilizó para el Oráculo:
${oracleCardsText}

Por favor, responde con profunda sabiduría, calidez y precisión en español:
1. Explica directamente cómo responde cada una de las 3 cartas a su inquietud (Carta 1: La raíz o luz, Carta 2: El obstáculo o advertencia, Carta 3: El consejo directo y desenlace).
2. Concluye con un mensaje empoderador y claro para que el consultante sepa exactamente qué paso dar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un Oráculo del Tarot empático, certero y poético que responde siempre en español analizando detalladamente las 3 cartas del oráculo que el consultante introdujo.',
      },
    });

    res.json({
      answer: response.text?.trim() || 'Escucha el susurro silencioso de tu intuición.',
    });
  } catch (error: any) {
    console.error('Error al clarificar con el oráculo:', error);
    res.status(500).json({
      error: 'No se pudo comunicar con el oráculo.',
      details: error?.message,
    });
  }
});

// Set up Vite or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Arcana AI Tarot activo en http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar el servidor:', err);
});
