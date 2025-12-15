import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateNewsArticle = async (topic: string, matchDetails?: string): Promise<{ title: string; content: string; summary: string }> => {
  if (!apiKey) {
    // Fallback mock for news if no API key
    return {
        title: "Resumen de la Jornada (Demo)",
        summary: "Sin API Key configurada, este es un contenido de ejemplo.",
        content: "Para generar noticias reales con IA, por favor configura tu API KEY en el entorno. Mientras tanto, disfruta de este texto simulado que representa cómo se vería una noticia generada automáticamente sobre " + topic + "."
    };
  }

  const prompt = `
    Actúa como un periodista deportivo experto en Handball de la provincia de Chubut (Argentina).
    Escribe una noticia breve y emocionante sobre: ${topic}.
    ${matchDetails ? `Detalles del partido: ${matchDetails}` : ''}
    
    Devuelve la respuesta estrictamente en formato JSON con la siguiente estructura:
    {
      "title": "Un título pegadizo",
      "summary": "Un resumen corto de 2 líneas",
      "content": "El cuerpo de la noticia (usa formato Markdown, aprox 150 palabras)"
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating news:", error);
    throw error;
  }
};

export const generateMatchStrategy = async (teamName: string, opponentName: string): Promise<string> => {
    if (!apiKey) {
        return "Configura la API Key para recibir consejos tácticos.";
    }

    const prompt = `
      Soy el entrenador del equipo de handball ${teamName} de Chubut. Vamos a jugar contra ${opponentName}.
      Dame 3 claves tácticas breves para ganar este partido. Enfócate en defensa y ataque rápido.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "No se pudo generar la estrategia.";
    } catch (error) {
        console.error("Error generating strategy:", error);
        return "Error al conectar con el asistente.";
    }
}

// Function to analyze match sheet image OR PDF
export const analyzeMatchSheet = async (fileBase64: string): Promise<any> => {
  if (!apiKey) {
    console.warn("API Key not configured. Returning mock data based on example sheet.");
    // Return mock data based on the specific example provided by the user (Comunicaciones vs GEI)
    return new Promise(resolve => setTimeout(() => resolve({
        homeTeam: "Club Comunicaciones B",
        awayTeam: "G.E.I.",
        homeScore: 23,
        awayScore: 25,
        players: [
            { name: "Pinto Junior, Severino Roberto", team: "HOME", dorsal: 10, goals: 6 },
            { name: "Flores, Juan Ignacio", team: "HOME", dorsal: 17, goals: 6 },
            { name: "Riadigos, Santiago", team: "HOME", dorsal: 31, goals: 8 },
            { name: "Raimundi Casado, Xoan", team: "HOME", dorsal: 33, goals: 3 },
            { name: "Costa, Federico", team: "AWAY", dorsal: 3, goals: 9 },
            { name: "Notaro, Agustin Ezequiel", team: "AWAY", dorsal: 20, goals: 4 },
            { name: "Elizari Bellon, Xabier", team: "AWAY", dorsal: 51, goals: 4 },
            { name: "Sirtautas, Nicolas Gabriel", team: "AWAY", dorsal: 68, goals: 2 },
        ]
    }), 1500));
  }

  // Extract mimeType and base64 data correctly
  // Format usually: data:image/jpeg;base64,/9j/4AA... or data:application/pdf;base64,JVBER...
  const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
      throw new Error("Formato de archivo inválido. Se espera una cadena Base64 válida.");
  }

  const mimeType = matches[1]; // e.g., 'image/jpeg' or 'application/pdf'
  const base64Data = matches[2];

  const prompt = `
    Analiza este documento (planilla de partido de Handball estilo oficial). Puede ser una imagen o un PDF.
    
    Busca específicamente:
    1. Encabezado: Equipos ("Local" vs "Visitante") y Resultado Final (Goles).
    2. Tablas de jugadores:
       - Columna "Nº" corresponde al dorsal.
       - Columna "Local" o "Visitante" corresponde al Nombre.
       - Columna "G" corresponde a los Goles.
       - Si en "G" hay un guión "-" o está vacío, significa 0 goles.
    
    Devuelve la respuesta estrictamente en formato JSON:
    {
      "homeTeam": "Nombre del equipo local",
      "awayTeam": "Nombre del equipo visitante",
      "homeScore": 0, // Número
      "awayScore": 0, // Número
      "players": [
         // Lista SOLO los jugadores que hayan marcado al menos 1 gol
         { 
           "name": "Nombre", 
           "team": "HOME" | "AWAY", 
           "dorsal": 10, 
           "goals": 5 
         }
      ]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI analyzer");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error analyzing match sheet:", error);
    throw error;
  }
};

export const generateHandballImage = async (): Promise<string> => {
  if (!apiKey) {
     throw new Error("API Key requerida para generar imágenes.");
  }

  try {
    // Using gemini-2.5-flash-image for standard generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            text: 'A hyper-realistic, cinematic wide shot of a professional handball match in an indoor stadium in Argentina. Intense action, a player in a blue and green jersey jumping high to throw the ball. Dramatic lighting, blurred crowd in background, high resolution, 4k, sports photography.' 
          },
        ],
      },
      config: {
        imageConfig: {
           aspectRatio: "16:9" // Wide for hero section
        }
      }
    });
    
    // Iterate to find the image part
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
           return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
    }
    
    throw new Error("No image generated.");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};