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

// Tarot Reading Endpoint en Español
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

    let moduloDirectives = '';
    if (moduloId === 'como-fue-mi-dia') {
      moduloDirectives = `Este es el MÓDULO "¿CÓMO FUE MI DÍA? (3 CARTAS)".
- Carta 1 (Mañana): Explica cómo arrancó el día del consultante, la energía o actitud con que despertó.
- Carta 2 (Tarde): Detalla el desafío, roce o punto de inflexión que vivió en la tarde.
- Carta 3 (Noche): Analiza cómo decanta la jornada, qué lección se lleva y cómo descansar en paz.
Ofrece un resumen muy empático y certero de cómo se sintió su jornada.`;
    } else if (moduloId === 'agradecimiento-3-cosas') {
      moduloDirectives = `Este es el MÓDULO "3 COSAS PARA AGRADECER (GRATITUD) (3 CARTAS)".
- Carta 1: Explica con claridad la primera bendición concreta o momento de luz recibido hoy.
- Carta 2: Revela la lección, reto superado o fortaleza interior por la que debe dar gracias.
- Carta 3: Destaca el regalo espiritual, sincronicidad o protección sutil que lo acompañó.
El tono debe ser de pura alquimia de gratitud y elevación vibratoria.`;
    } else if (moduloId === 'amor-negocios-salud') {
      moduloDirectives = `Este es el MÓDULO "CONSEJOS EN AMOR, NEGOCIOS Y SALUD (6 CARTAS EN TOTAL, 2 POR CADA ÁREA)".
Debes ofrecer secciones y análisis muy claros para:
1. AMOR (Cartas 1 y 2): Situación afectiva actual + Consejo sabio y directo para el corazón y las relaciones.
2. NEGOCIOS / TRABAJO (Cartas 3 y 4): Panorama laboral/financiero + Consejo estratégico concreto para la prosperidad.
3. SALUD / BIENESTAR (Cartas 5 y 6): Estado vital y energético + Consejo de autocuidado, descanso y equilibrio psicofísico.`;
    } else {
      moduloDirectives = `Este es el MÓDULO "PREGUNTA LO QUE SEA / CONSULTA LIBRE (3 CARTAS)".
Pregunta del consultante: "${question ? question.trim() : 'Orientación general sobre mi destino'}".
- Carta 1 (Origen/Raíz): La causa profunda de este dilema o situación.
- Carta 2 (Presente): La fuerza activa en conflicto ahora mismo.
- Carta 3 (Desenlace/Consejo): La respuesta directa y contundente del oráculo a la pregunta formulada.`;
    }

    const prompt = `Eres un sabio y respetado Maestro de Tarot, Astrólogo y Guía Espiritual de gran calidez humana, psicología junguiana y conocimiento esotérico hermético.

Tu misión es interpretar la tirada de cartas exacta que el consultante ha seleccionado o introducido.

${moduloDirectives}

Cartas Seleccionadas en la Tirada:
${cardsDescription}

Pregunta / Intención del consultante: "${question ? question.trim() : 'Mensaje sagrado del oráculo'}"

Devuelve un JSON estrictamente estructurado en español con el siguiente formato:
- title: Un título místico, poético y revelador para esta lectura (ej. "El Espejo del Día: Luces y Aprendizajes", "Trinidad de Gratitud", "La Brújula de Oro: Amor, Trabajo y Salud").
- summary: Una síntesis oracular de 2 a 3 párrafos fluidos, cálidos y profundos tejiendo el relato completo de las cartas y respondiendo exactamente al propósito del módulo.
- cardInsights: Un arreglo con una entrada por cada carta, en idéntico orden, que contenga:
  - cardId: Identificador de la carta
  - cardName: Nombre de la carta
  - positionName: Nombre de la posición en la tirada
  - category: Categoría si aplica (ej. "Amor", "Negocios", "Salud" o general)
  - isReversed: booleano indicando si salió invertida
  - directMessage: Mensaje e interpretación directa para esta posición y el consultante.
  - symbolism: Breve explicación del arquetipo y su simbolismo esotérico.
  - energyVibe: 1 o 2 palabras describiendo la vibración (ej. "Fuego Creador", "Agua Emocional", "Tierra Práctica").
- areaWisdom: Objeto con consejos específicos según el módulo (por ejemplo amor, negocios, salud, o gratitud).
  - loveAdvice: Consejo concreto para el amor (especialmente si es el módulo de amor/negocios/salud, o mensaje afín).
  - businessAdvice: Consejo concreto para negocios/trabajo.
  - healthAdvice: Consejo concreto para salud y bienestar.
- actionableWisdom:
  - practicalStep: Un paso concreto y alcanzable para aplicar en su vida esta semana.
  - sacredAffirmation: Una afirmación o mantra místico para recitar o meditar.
  - reflectionPrompt: Una pregunta profunda para su diario de reflexión personal.
- mysticQuote: Una frase o aforismo esotérico en español que corone la lectura.`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback rico en español si la clave no estuviese presente
      return res.json({
        title: `Alineación de los Arcanos: ${spreadName}`,
        summary: `Los arcanos se han manifestado para develar las corrientes que influyen en tu camino. Con ${cards.map((c: any) => c.name).join(', ')}, el universo te invita a integrar tanto la luz como la sombra de tus vivencias. Confía en la sincronía sagrada.`,
        cardInsights: cards.map((c: any) => ({
          cardId: c.id,
          cardName: c.name,
          positionName: c.positionName || 'Influencia actual',
          category: c.category || 'General',
          isReversed: Boolean(c.isReversed),
          directMessage: `${c.name} en posición ${c.isReversed ? 'invertida' : 'al derecho'} te señala que en "${c.positionName}" es fundamental actuar con serenidad y escuchar tu sabiduría interior.`,
          symbolism: `${c.name} representa el arquetipo de ${c.keywords ? c.keywords.slice(0, 3).join(', ') : 'transformación'}.`,
          energyVibe: c.suit ? `${c.suit}` : 'Arcano Mayor',
        })),
        areaWisdom: {
          loveAdvice: 'Cultiva la honestidad afectiva y el amor propio antes de exigir certezas ajenas.',
          businessAdvice: 'Enfoca tus recursos con disciplina; no disperses tu fuego en batallas estériles.',
          healthAdvice: 'Prioriza el descanso consciente y la respiración profunda para serenar tu mente.',
        },
        actionableWisdom: {
          practicalStep: 'Dedica 10 minutos de silencio hoy para agradecer lo vivido.',
          sacredAffirmation: 'Estoy en perfecta sintonía con las mareas sabias de mi destino.',
          reflectionPrompt: '¿Qué verdad interior está lista para ser reconocida con amor y sin miedo?',
        },
        mysticQuote: 'Como es arriba, es abajo; como es adentro, es afuera.',
        isDemoReading: true,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un sabio y compasivo Maestro de Tarot en español. Ofreces interpretaciones profundas, poéticas, psicológicamente atinadas y libres de fatalismo. Devuelve exclusivamente JSON válido.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            cardInsights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  cardId: { type: Type.STRING },
                  cardName: { type: Type.STRING },
                  positionName: { type: Type.STRING },
                  category: { type: Type.STRING },
                  isReversed: { type: Type.BOOLEAN },
                  directMessage: { type: Type.STRING },
                  symbolism: { type: Type.STRING },
                  energyVibe: { type: Type.STRING },
                },
                required: ['cardId', 'cardName', 'positionName', 'isReversed', 'directMessage', 'symbolism'],
              },
            },
            areaWisdom: {
              type: Type.OBJECT,
              properties: {
                loveAdvice: { type: Type.STRING },
                businessAdvice: { type: Type.STRING },
                healthAdvice: { type: Type.STRING },
              },
            },
            actionableWisdom: {
              type: Type.OBJECT,
              properties: {
                practicalStep: { type: Type.STRING },
                sacredAffirmation: { type: Type.STRING },
                reflectionPrompt: { type: Type.STRING },
              },
              required: ['practicalStep', 'sacredAffirmation', 'reflectionPrompt'],
            },
            mysticQuote: { type: Type.STRING },
          },
          required: ['title', 'summary', 'cardInsights', 'actionableWisdom', 'mysticQuote'],
        },
      },
    });

    const readingText = response.text?.trim() || '{}';
    const readingData = JSON.parse(readingText);
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

if (!process.env.VERCEL) {
  startServer().catch((err) => {
    console.error('Error al iniciar el servidor:', err);
  });
}

export default app;

