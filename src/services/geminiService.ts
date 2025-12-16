import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateNewsArticle = async (topic: string, matchDetails?: string): Promise<{ title: string; content: string; summary: string }> => {
  if (!process.env.API_KEY) {
    return {
        title: "Resumen de la Jornada (Modo Demo)",
        summary: "No se detectó una API Key configurada.",
        content: "Para generar noticias reales con inteligencia artificial, necesitas configurar tu API KEY de Google Gemini en el archivo index.html. \n\nMientras tanto, la aplicación funcionará en modo demostración."
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
    return {
        title: "Error generando noticia",
        summary: "Hubo un problema al conectar con la IA.",
        content: "Por favor verifica tu conexión a internet y que tu API Key sea válida."
    };
  }
};

export const generateMatchStrategy = async (teamName: string, opponentName: string): Promise<string> => {
    if (!process.env.API_KEY) {
        return "Configura la API Key en index.html para recibir consejos tácticos reales. (Modo Demo: Juega 6-0 en defensa y corre el contraataque).";
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
  if (!process.env.API_KEY) {
    console.warn("API Key not configured. Returning mock data based on example sheet.");
    return new Promise(resolve => setTimeout(() => resolve({
        homeTeam: "Club Comunicaciones B",
        awayTeam: "G.E.I.",
        homeScore: 23,
        awayScore: 25,
        players: [
            { name: "Pinto Junior, Severino", team: "HOME", dorsal: 10, goals: 6 },
            { name: "Flores, Juan Ignacio", team: "HOME", dorsal: 17, goals: 6 },
            { name: "Riadigos, Santiago", team: "HOME", dorsal: 31, goals: 8 },
            { name: "Costa, Federico", team: "AWAY", dorsal: 3, goals: 9 },
            { name: "Notaro, Agustin", team: "AWAY", dorsal: 20, goals: 4 },
        ]
    }), 1500));
  }

  // Extract mimeType and base64 data correctly
  const matches = fileBase64.match(/^data:(.+);base64,(.+)$/);
  
  if (!matches || matches.length !== 3) {
      throw new Error("Formato de archivo inválido. Se espera una cadena Base64 válida.");
  }

  const mimeType = matches[1]; 
  const base64Data = matches[2];

  const prompt = `
    Analiza este documento (planilla de partido de Handball).
    Devuelve un JSON con: homeTeam, awayTeam, homeScore, awayScore, y una lista de players (name, team, dorsal, goals).
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
  if (!process.env.API_KEY) {
     return "https://images.unsplash.com/photo-1516475429286-465d815a0df4?q=80&w=2070&auto=format&fit=crop";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { 
            text: 'A hyper-realistic, cinematic wide shot of a professional handball match in an indoor stadium in Argentina. Intense action, blue vs green jersey.' 
          },
        ],
      },
      config: {
        imageConfig: {
           aspectRatio: "16:9" 
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
    return "https://images.unsplash.com/photo-1516475429286-465d815a0df4?q=80&w=2070&auto=format&fit=crop";
  }
};