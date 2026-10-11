import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

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

// Tarot Reading Endpoint con estricto aislamiento y detalle extenso (mínimo 4 líneas por sección)
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
      moduloInstructions = `MÓDULO EXCLUSIVO: ¿CÓMO FUE MI DÍA? (3 CARTAS)
REGLA ESTRICTA DE AISLAMIENTO: Responde ÚNICAMENTE sobre el balance del día. PROHIBIDO incluir consejos de amor, negocios, finanzas o salud general que pertenezcan a otros módulos.

REGLA DE EXTENSIÓN: Cada sección DEBE tener AL MENOS 4 LÍNEAS COMPLETAS de prosa profunda, detallada y reflexiva (mínimo 70 palabras por sección). Prohibidas las respuestas breves.

Estructura obligatoria para dayReview:
- overallVerdict: Un balance general y veredicto poético de la jornada completa (al menos 4 líneas).
- morningInsight: Análisis profundo e independiente de LA MAÑANA (Carta 1: ${cards[0]?.name}), detallando con qué energía despertó, las intenciones iniciales, el tono psicológico y las primeras corrientes del día (al menos 4 líneas).
- afternoonInsight: Análisis profundo e independiente de LA TARDE (Carta 2: ${cards[1]?.name}), detallando el desafío vivido, los roces o tareas complejas, y cómo influyó en su ánimo (al menos 4 líneas).
- eveningInsight: Análisis profundo e independiente de LA NOCHE (Carta 3: ${cards[2]?.name}), detallando cómo decanta el día, qué emociones quedan al reposar y cómo asimilar lo vivido (al menos 4 líneas).
- keyLesson: La gran enseñanza de sabiduría que le regaló este día (al menos 4 líneas).
- restGuidance: Pauta sagrada para desconectar la mente, soltar el control y tener un descanso reparador esta noche (al menos 4 líneas).`;
    } else if (moduloId === 'agradecimiento-3-cosas') {
      moduloInstructions = `MÓDULO EXCLUSIVO: 3 COSAS PARA AGRADECER / GRATITUD (3 CARTAS)
REGLA ESTRICTA DE AISLAMIENTO: Responde ÚNICAMENTE sobre gratitud y agradecimiento. PROHIBIDO incluir consejos de amor, trabajo o salud que pertenezcan a otros módulos.

REGLA DE EXTENSIÓN: Cada una de las 3 respuestas de gratitud DEBE tener AL MENOS 4 LÍNEAS COMPLETAS de análisis enriquecedor y conmovedor (mínimo 70 palabras cada una).

Estructura obligatoria para gratitudeReview:
- gratitudeTheme: Reflexión introductoria sobre el poder transmutador de la gratitud hoy (al menos 4 líneas).
- blessing1: Objeto con { title: "1. Bendición Tangible o Alegría Concreta", independentAnswer: "Análisis extenso (mínimo 4 líneas) explicando exactamente qué regalo palpable, provisión, salud o momento de paz debe agradecer hoy con ${cards[0]?.name}", cardName: "${cards[0]?.name}" }.
- blessing2: Objeto con { title: "2. Fortaleza Interior y Reto Superado", independentAnswer: "Análisis extenso (mínimo 4 líneas) explicando qué desafío, prueba o resiliencia interna debe agradecer con ${cards[1]?.name} y cómo lo fortaleció", cardName: "${cards[1]?.name}" }.
- blessing3: Objeto con { title: "3. Regalo Espiritual y Sincronía Oculta", independentAnswer: "Análisis extenso (mínimo 4 líneas) explicando qué protección sutil, guía invisible o milagro cotidiano debe agradecer hoy con ${cards[2]?.name}", cardName: "${cards[2]?.name}" }.
- gratitudeMantra: Un decreto sagrado de agradecimiento para repetir.
- gratitudeRitual: Un gesto o práctica terrenal para anclar la gratitud hoy.`;
    } else if (moduloId === 'amor-negocios-salud') {
      moduloInstructions = `MÓDULO EXCLUSIVO: CONSEJOS EN AMOR, NEGOCIOS Y SALUD (6 CARTAS)
REGLA ESTRICTA DE AISLAMIENTO: Responde ÚNICAMENTE sobre estos tres pilares de vida. PROHIBIDO mezclar con resúmenes del día o listas de gratitud.

REGLA DE EXTENSIÓN: Cada pilar debe contener un diagnóstico de al menos 4 líneas y un consejo independiente de al menos 4 líneas completas.

Estructura obligatoria para lifePillarsReview:
- loveSection: Objeto con { status: "Diagnóstico profundo del corazón y vínculos con ${cards[0]?.name} (al menos 4 líneas)", independentAdvice: "Consejo sagrado específico e independiente para el amor con ${cards[1]?.name} (al menos 4 líneas)" }.
- businessSection: Objeto con { status: "Diagnóstico profundo del panorama laboral y material con ${cards[2]?.name} (al menos 4 líneas)", independentAdvice: "Consejo estratégico concreto e independiente para el éxito profesional con ${cards[3]?.name} (al menos 4 líneas)" }.
- healthSection: Objeto con { status: "Diagnóstico de la energía corporal, estrés y descanso con ${cards[4]?.name} (al menos 4 líneas)", independentAdvice: "Consejo de autocuidado, equilibrio y nutrición vital con ${cards[5]?.name} (al menos 4 líneas)" }.
- harmonySynthesis: Síntesis de cómo integrar equilibradamente estos tres aspectos (al menos 4 líneas).`;
    } else {
      moduloInstructions = `MÓDULO EXCLUSIVO: PREGUNTA AL TAROT (3 CARTAS)
Pregunta formulada por el consultante: "${question ? question.trim() : 'Orientación para mi destino'}".
REGLA DE EXTENSIÓN: Cada sección debe tener AL MENOS 4 LÍNEAS COMPLETAS respondiendo con precisión a la inquietud.

Estructura obligatoria para questionReview:
- directAnswer: Respuesta rotunda, clara y profunda a su pregunta (al menos 4 líneas).
- rootCause: La raíz oculta o motivo que originó esta situación con ${cards[0]?.name} (al menos 4 líneas).
- currentDynamics: Las fuerzas activas en juego en el presente con ${cards[1]?.name} (al menos 4 líneas).
- finalGuidance: El desenlace pronosticado y el consejo sagrado con ${cards[2]?.name} (al menos 4 líneas).`;
    }

    const prompt = `Eres un sabio Maestro de Tarot, Psicólogo de Arquetipos y Guía Espiritual en español.

${moduloInstructions}

Cartas de la Tirada:
${cardsDescription}

REQUISITOS CRÍTICOS:
1. AISLAMIENTO TOTAL: No mezcles campos de otros módulos. Solo incluye los campos correspondientes a "${moduloId}".
2. EXTENSIÓN Y DETALLE: Cada interpretación de carta en 'cardInsights' ('directMessage') y cada sección del módulo DEBE tener AL MENOS 4 LÍNEAS de contenido sustancial, revelador y poético. Nada de respuestas cortas.
3. Devuelve estrictamente JSON válido en español.

Esquema JSON:
- moduloId: "${moduloId}"
- title: Título evocador
- summary: Síntesis introductoria de 2 párrafos sustanciales (al menos 4 líneas cada uno)
- cardInsights: Arreglo con cada carta { cardId, cardName, positionName, isReversed, directMessage (mínimo 4 líneas completas), symbolism (mínimo 3 líneas), energyVibe }
${moduloId === 'como-fue-mi-dia' ? '- dayReview: { overallVerdict, morningInsight, afternoonInsight, eveningInsight, keyLesson, restGuidance }' : ''}
${moduloId === 'agradecimiento-3-cosas' ? '- gratitudeReview: { gratitudeTheme, blessing1: { title, independentAnswer, cardName }, blessing2: { title, independentAnswer, cardName }, blessing3: { title, independentAnswer, cardName }, gratitudeMantra, gratitudeRitual }' : ''}
${moduloId === 'amor-negocios-salud' ? '- lifePillarsReview: { loveSection: { status, independentAdvice }, businessSection: { status, independentAdvice }, healthSection: { status, independentAdvice }, harmonySynthesis }' : ''}
${moduloId === 'pregunta-libre' ? '- questionReview: { directAnswer, rootCause, currentDynamics, finalGuidance }' : ''}
- actionableWisdom: { practicalStep (mínimo 3 líneas), sacredAffirmation, reflectionPrompt }
- mysticQuote: Aforismo esotérico`;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback extenso en español respetando el aislamiento estricto
      const fallbackResponse: any = {
        moduloId,
        title: `Lectura Sagrada: ${spreadName}`,
        summary: `Los arcanos sagrados han revelado un tapiz de profundas sincronicidades para tu consulta actual.\nCada una de las cartas que has introducido actúa como un espejo límpido de tu estado consciente e inconsciente, permitiéndote contemplar la verdad sin velos ni ataduras.\nConfía en que los ciclos del cosmos se mueven a favor de tu evolución íntima.`,
        cardInsights: cards.map((c: any) => ({
          cardId: c.id,
          cardName: c.name,
          positionName: c.positionName || 'Posición Sagrada',
          isReversed: Boolean(c.isReversed),
          directMessage: `${c.name} en su manifestación ${c.isReversed ? 'invertida' : 'al derecho'} llega a esta posición para recordarte que las apariencias no definen tu valor interior.\nEn el plano de "${c.positionName}", se te pide actuar con paciencia diamantina y no apresurar decisiones que requieran maduración natural.\nPermite que tu intuición decante las verdaderas intenciones detrás de cada acontecimiento reciente.\nEl mensaje central es mantenerte firme en tus valores sin ceder ante la presión de los ritmos externos.`,
          symbolism: `${c.name} encarna el misterio arquetípico de la transmutación espiritual, enseñándonos que todo final es el umbral de una iniciación superior.`,
          energyVibe: c.suit || 'Arcano Mayor',
        })),
        actionableWisdom: {
          practicalStep: 'Dedica 10 minutos de recogimiento esta noche, enciende una vela o respira con calma profunda para asimilar lo que hoy comprendiste.',
          sacredAffirmation: 'Estoy en paz con el ritmo perfecto del universo y confío en mi luz interior.',
          reflectionPrompt: '¿Qué verdad interior está lista para ser reconocida con amor y sin miedo?',
        },
        mysticQuote: 'Como es arriba, es abajo; como es adentro, es afuera.',
        isDemoReading: true,
      };

      if (moduloId === 'como-fue-mi-dia') {
        fallbackResponse.dayReview = {
          overallVerdict: 'Tu jornada estuvo marcada por una profunda alquimia entre la exigencia de tus responsabilidades y la necesidad de proteger tu paz mental.\nA pesar de los altibajos inevitables del entorno, lograste sostener tu eje con dignidad y resiliencia.\nEl saldo del día es de crecimiento personal y maduración de tu paciencia.',
          morningInsight: `La Mañana comenzó bajo la influencia de ${cards[0]?.name}.\nAl despertar, tu mente se vio convocada a establecer prioridades claras y definir con qué actitud enfrentarías las demandas tempranas.\nHubo momentos de indecisión o impulso que te exigieron respirar hondo para no desgastar tu energía antes de tiempo.\nFue un amanecer que te invitó a sembrar una intención de orden y serenidad.`,
          afternoonInsight: `La Tarde estuvo regida por el arquetipo de ${cards[1]?.name}.\nDurante las horas centrales se presentó el desafío más evidente de la jornada: una situación imprevista, una conversación densa o una tarea que puso a prueba tu paciencia.\nEn lugar de reaccionar impulsivamente, tuviste la oportunidad de observar tus propios límites y elegir una respuesta ecuánime.\nEse instante fue el verdadero catalizador de aprendizaje de todo tu día.`,
          eveningInsight: `La Noche decanta ahora con la sabiduría de ${cards[2]?.name}.\nAl caer el sol, las tensiones acumuladas comienzan a perder fuerza para dejar espacio a la contemplación honesta de lo vivido.\nEs el momento sagrado en que tu alma integra lo que aprendió y comprende por qué ocurrieron ciertos eventos.\nSe te invita a soltar cualquier reclamo hacia ti mismo y entregarte al reposo con la certeza del deber cumplido.`,
          keyLesson: 'El gran aprendizaje de hoy es que no puedes controlar todas las olas del mar, pero sí puedes aprender a navegar con serenidad sobre ellas sin perder tu brújula interior.',
          restGuidance: 'Desconecta tus dispositivos electrónicos, toma un vaso de agua tibia y repite tres veces mentalmente: "Suelto este día y descanso en bendición". Tu cuerpo merece regenerarse en calma.',
        };
      } else if (moduloId === 'agradecimiento-3-cosas') {
        fallbackResponse.gratitudeReview = {
          gratitudeTheme: 'La gratitud no es simplemente un acto de cortesía, sino la llave maestra que desbloquea la abundancia cósmica.\nAl agradecer lo pequeño y lo grande, transformas el peso de la rutina en oro espiritual y abres las compuertas para recibir bendiciones mayores.',
          blessing1: {
            title: '1. Bendición Tangible o Alegría Recibida',
            independentAnswer: `Bajo la luz de ${cards[0]?.name}, hoy debes agradecer el milagro palpable de tu sustento, tu salud corporal y el techo que te resguarda.\nHubo un detalle cotidiano —un momento de calma, un alimento reparador o una palabra amable— que pasó inadvertido pero que sostuvo tu bienestar.\nReconocer este beneficio material arraiga tu energía en la seguridad de que el universo no te desampara.\nAgradece con corazón abierto la provisión visible que te acompaña día a día.`,
            cardName: cards[0]?.name || 'Carta 1',
          },
          blessing2: {
            title: '2. Fortaleza Interior y Reto Superado',
            independentAnswer: `A través del arquetipo de ${cards[1]?.name}, debes dar gracias por el desafío que te puso a prueba y no logró derribarte.\nAquello que en su momento te causó incomodidad o zozobra fue en realidad el gimnasio donde se fortaleció tu carácter.\nHoy comprobaste una vez más que posees una reserva inagotable de coraje y temple sereno para superar adversidades.\nDa gracias por las heridas que se volvieron cicatrices de sabiduría y madurez.`,
            cardName: cards[1]?.name || 'Carta 2',
          },
          blessing3: {
            title: '3. Regalo Espiritual y Sincronía Oculta',
            independentAnswer: `Con la presencia sagrada de ${cards[2]?.name}, agradece las protecciones invisibles y las sincronicidades que guiaron tus pasos sin que te dieras cuenta.\nUn presentimiento oportuno, una coincidencia que te evitó un disgusto o una sensación repentina de paz fueron regalos directos de la gracia universal.\nAgradecer lo invisible afina tu sexto sentido y te recuerda que nunca caminas solo en este sendero terrenal.\nHora de dar gracias por la chispa divina que habita en tu corazón y te orienta en la penumbra.`,
            cardName: cards[2]?.name || 'Carta 3',
          },
          gratitudeMantra: 'Doy gracias por lo que tengo, bendigo lo que fue y abro mis brazos con júbilo a la provisión divina que llega a mi vida.',
          gratitudeRitual: 'Coloca tu mano derecha en el centro de tu pecho, respira profundo y di en voz baja tres veces la palabra "Gracias" sintiendo cómo se expande tu pecho.',
        };
      } else if (moduloId === 'amor-negocios-salud') {
        fallbackResponse.lifePillarsReview = {
          loveSection: {
            status: `Diagnóstico en el Amor (${cards[0]?.name}):\nTus relaciones atraviesan un periodo donde la honestidad emocional es indispensable.\nPuede existir cierta distancia o miedo a mostrar tu vulnerabilidad completa ante quienes amas, creando una coraza innecesaria.\nSin embargo, el deseo de conexión sincera sigue vivo en lo profundo de tu pecho y busca una oportunidad para manifestarse con verdad.`,
            independentAdvice: `Consejo en el Amor (${cards[1]?.name}):\nEl oráculo te recomienda derribar los muros del orgullo y comunicarte desde la empatía pura.\nNo esperes a que la otra persona adivine tus necesidades; exprésalas con dulzura pero con total transparencia.\nSi estás en búsqueda de amor, comienza por enamorarte de tu propia vida y tu integridad para atraer a quien vibre en tu misma sintonía.`,
          },
          businessSection: {
            status: `Diagnóstico en Negocios y Trabajo (${cards[2]?.name}):\nTu ámbito profesional se encuentra en una etapa de consolidación que demanda estrategia y disciplina.\nHay oportunidades valiosas sobre la mesa, pero también distracciones que amenazan con dispersar tu tiempo y tus recursos.\nEs vital revisar presupuestos, contratos y acuerdos con ojo meticuloso para evitar malentendidos futuros.`,
            independentAdvice: `Consejo en Negocios y Trabajo (${cards[3]?.name}):\nEnfoca tu fuego en terminar lo que ya empezaste antes de abrir frentes innecesarios.\nLa perseverancia silenciosa te otorgará mejores frutos que las acciones ostentosas o los riesgos desmedidos.\nSé prudente con tus gastos y asóciate únicamente con personas que demuestren ética intachable y respeto mutuo.`,
          },
          healthSection: {
            status: `Diagnóstico en Salud y Vitalidad (${cards[4]?.name}):\nTu templo físico te está enviando señales claras sobre la necesidad de equilibrar el esfuerzo con el descanso.\nEl exceso de actividad mental y la preocupación acumulada suelen manifestarse en tensiones en el cuello, espalda o dificultades para conciliar un sueño profundo.\nTu cuerpo necesita que bajes el volumen de las exigencias cotidianas.`,
            independentAdvice: `Consejo en Salud y Vitalidad (${cards[5]?.name}):\nPrioriza el agua fresca, camina descalzo sobre la hierba o toma paseos al aire libre para descargar la energía estática.\nEstablece un horario riguroso para irte a la cama y evita llevar problemas laborales a tu almohada.\nTrata a tu cuerpo como el santuario sagrado que hospeda tu alma; cuídalo con devoción diaria.`,
          },
          harmonySynthesis: 'El secreto del equilibrio radica en comprender que ningún éxito profesional compensa la pérdida de la paz en el hogar o la quiebra de tu salud. Atiende los tres pilares como las tres patas firmes de una mesa sagrada.',
        };
      } else {
        fallbackResponse.questionReview = {
          directAnswer: `Frente a tu consulta, el oráculo responde con claridad que el desenlace será favorable si estás dispuesto a asumir las responsabilidades que conlleva la verdad.\nNo temas a los cambios que se avecinan, pues están diseñados para desmantelar lo que ya no te sirve y dar lugar a una etapa de mayor autenticidad.\nLa respuesta es un sí condicionado a que actúes con integridad intachable.`,
          rootCause: `La Raíz del Asunto (${cards[0]?.name}):\nEsta situación no surgió de la nada; tiene su origen en una búsqueda profunda de libertad y sentido que vienes postergando.\nViejos patrones de complacencia o miedo a la confrontación crearon el caldo de cultivo para que este dilema se manifestara en tu presente.\nEs momento de reconocer esa causa fundacional para sanarla de raíz.`,
          currentDynamics: `Las Fuerzas del Presente (${cards[1]?.name}):\nAhora mismo te encuentras ante una bifurcación de caminos donde la mente y el corazón parecen tirar en direcciones opuestas.\nHay influencias del entorno que intentan opinar sobre lo que deberías hacer, pero ninguna de ellas cargará con las consecuencias de tu decisión.\nLa fuerza activa en juego te exige discernimiento sereno y valentía moral.`,
          finalGuidance: `El Desenlace y Consejo Sagrado (${cards[2]?.name}):\nEl camino hacia adelante se despejará en cuanto des el primer paso firme sin mirar atrás con nostalgia estéril.\nConfía en tu propia capacidad para navegar lo desconocido; tienes todas las herramientas para salir victorioso de este ciclo.\nEl oráculo te asegura que la paz que buscas llegará de la mano de tu propia determinación.`,
        };
      }

      return res.json(fallbackResponse);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un sabio y respetado Maestro de Tarot en español. Cumples con la regla de aislamiento estricto (no mezclas módulos jamás) y con la regla de extensión (cada sección y carta debe tener un detalle profundo de AL MENOS 4 LÍNEAS COMPLETAS). Devuelves siempre JSON válido.',
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
        answer: `El oráculo contempla tu inquietud con profundo detenimiento: "${userQuery}".\n${
          hasOracleCards
            ? `A través de las 3 cartas sagradas del oráculo que has presentado (${oracleCards.map((c: any) => c.name).join(', ')}), se te revela con claridad que la clave radica en no apresurar conclusiones prematuras.\nLa primera carta (${oracleCards[0]?.name}) ilumina la raíz de tu duda recordándote que la calma es tu mayor fortaleza.\nLa segunda carta (${oracleCards[1]?.name}) advierte contra la dispersión de esfuerzos, mientras que la tercera (${oracleCards[2]?.name}) te entrega la bendición de un desenlace sereno si mantienes tu fe inquebrantable.`
            : 'Las cartas señalan una dirección certera, pero recuerda que es tu voluntad consciente la que moldea el destino.'
        }`,
      });
    }

    const prompt = `Eres el sabio Oráculo del Tarot en español. El consultante tiene una duda o aclaración sobre su consulta y ha consultado 3 cartas específicas al oráculo para responderla.

Consulta Original de la Tirada: "${question || 'Orientación espiritual'}"
Resumen Previo: "${readingSummary || ''}"

Pregunta / Inquietud del Consultante para el Oráculo: "${userQuery}"

Las 3 Cartas que el Consultante Utilizó para el Oráculo:
${oracleCardsText}

Por favor, responde con profunda sabiduría, calidez y detalle extenso en español (al menos 4 líneas por cada una de las 3 cartas):
1. Explica directamente cómo responde cada una de las 3 cartas a su inquietud (Carta 1: La raíz o luz, Carta 2: El obstáculo o advertencia, Carta 3: El consejo directo y desenlace).
2. Concluye con un mensaje empoderador y claro para que el consultante sepa exactamente qué paso dar.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'Eres un Oráculo del Tarot empático, certero y poético que responde siempre en español analizando detalladamente las 3 cartas del oráculo que el consultante introdujo, con un detalle profundo de al menos 4 líneas por respuesta.',
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
