
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Decoding Helper
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Mobile-friendly audio decoder.
 * Sur iPhone, l'AudioContext doit être actif au moment de la création du buffer.
 * On utilise un buffer Int16 (PCM linéaire) provenant de l'API Gemini.
 */
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  // PCM 16-bit signed
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  
  // Création du buffer audio avec le sampleRate exact de l'API (24kHz)
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      // Normalisation cruciale pour iPhone/Android entre -1.0 et 1.0
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export interface GeneratedAudio {
  buffer: AudioBuffer;
  rawData: Uint8Array;
}

export interface DialogueConfig {
  voiceA: { name: string; speakerName: string };
  voiceB?: { name: string; speakerName: string };
}

export const generateSpeech = async (
  text: string, 
  config: DialogueConfig,
  styleInstruction?: string,
  providedContext?: AudioContext
): Promise<GeneratedAudio> => {
  const ai = getClient();
  
  const speakerVoiceConfigs = [
    {
      speaker: config.voiceA.speakerName,
      voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceA.name } },
    }
  ];

  let ttsPrompt = text;

  if (config.voiceB) {
    speakerVoiceConfigs.push({
      speaker: config.voiceB.speakerName,
      voiceConfig: { prebuiltVoiceConfig: { voiceName: config.voiceB.name } },
    });
    ttsPrompt = `Ceci est une conversation audio réelle en FRANÇAIS (FRANCE). Respecte scrupuleusement les noms des locuteurs pour changer de voix.
    
    CONVERSATION:
    ${text}`;
  } else {
    speakerVoiceConfigs.push({
      speaker: 'Silence',
      voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } },
    });
  }

  const finalPrompt = styleInstruction ? `${styleInstruction}\n\n${ttsPrompt}` : ttsPrompt;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro-preview-tts",
      contents: [{ parts: [{ text: finalPrompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          multiSpeakerVoiceConfig: {
            speakerVoiceConfigs: speakerVoiceConfigs
          }
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Aucune donnée audio retournée.");

    // iOS FIX: Toujours utiliser le contexte passé depuis le clic utilisateur
    if (!providedContext) {
        throw new Error("AudioContext obligatoire pour iOS");
    }

    const audioBytes = decode(base64Audio);
    const audioBuffer = await decodeAudioData(audioBytes, providedContext, 24000, 1);
    
    return { buffer: audioBuffer, rawData: audioBytes };
  } catch (error) {
    console.error("Erreur de génération vocale:", error);
    throw error;
  }
};

export const dramatizeText = async (
  text: string, 
  styleInstruction: string, 
  isDialogue: boolean,
  voiceAName: string = "Voix A",
  voiceBName: string = "Voix B"
): Promise<string> => {
  const ai = getClient();
  
  try {
    const soloPrompt = `
      TU ES UN RÉDACTEUR PUBLICITAIRE GÉNIAL ET DISRUPTIF UTILISANT UN FRANÇAIS (FRANCE) MODERNE ET NATUREL.
      TA MISSION : Transformer ce texte ennuyeux en un spot radio SOLO mémorable.
      
      CONSIGNES CRÉATIVES :
      - Sois audacieux, drôle, ou extrêmement inspirant.
      - Utilise un ton de voix "français" authentique.
      - Écris les sites web normalement (ex: adeasy.io).
      
      Texte source: "${text}"
      Renvoie UNIQUEMENT le nouveau texte du spot.
    `;

    const dialoguePrompt = `
      TU ES UN SCÉNARISTE DE FICTION RADIO SPÉCIALISÉ DANS LE DIALOGUE FRANÇAIS (FRANCE). 
      TA MISSION : Créer un dialogue ultra-réaliste entre ${voiceAName} et ${voiceBName}.
      
      CONSIGNES :
      - Balises vocalises en anglais : [laughing], [sighing], [hesitating], [whispering], [enthusiastic], [breathing], [thinking], [chuckling].
      - Pas d'effets sonores.
      - Utilise EXCLUSIVEMENT les noms "${voiceAName}" et "${voiceBName}".
      
      FORMAT STRICT :
      ${voiceAName}: [Expression] Texte
      ${voiceBName}: [Expression] Réaction
      
      Texte source: "${text}"
      Renvoie UNIQUEMENT le dialogue scénarisé.
    `;

    const prompt = isDialogue ? dialoguePrompt : soloPrompt;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { temperature: 1 }
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Erreur de dramatisation:", error);
    throw error;
  }
};
