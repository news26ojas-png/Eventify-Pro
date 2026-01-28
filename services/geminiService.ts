
import { GoogleGenAI, Type, Modality } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // Initializing GoogleGenAI with a named parameter using process.env.API_KEY directly as per SDK guidelines.
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async suggestEventDetails(title: string, category: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I am planning a ${category} titled "${title}". 
        Please provide a short, professional description and 3 important tasks/reminders to set for this event. 
        Keep it concise.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING },
              tasks: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["description", "tasks"]
          }
        }
      });

      // Simple property access for .text as per guidelines.
      return JSON.parse(response.text?.trim() || "{}");
    } catch (error) {
      console.error("Gemini Suggestion Error:", error);
      return null;
    }
  }

  async generateGreeting(title: string) {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a one-sentence warm and exciting reminder message for an upcoming event: "${title}".`,
      });
      // Property access .text instead of method call .text()
      return response.text?.trim() || "Refine Your Timeline Today.";
    } catch (error) {
      return "Get ready! Your special event is approaching.";
    }
  }

  async generateVoiceReminder(title: string, date: string): Promise<string | null> {
    try {
      const prompt = `Say warmly and professionally: "Reminder! You have an event coming up: ${title} on ${date}. Don't forget to prepare!"`;
      const response = await this.ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      // Correct extraction of audio data from response parts.
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio || null;
    } catch (error) {
      console.error("TTS Generation Error:", error);
      return null;
    }
  }
}

export const geminiService = new GeminiService();

// Manual implementation of base64 decoding following the @google/genai example code.
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// PCM audio decoding logic following @google/genai guidelines for low-latency audio.
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Play raw PCM audio data received from the Gemini TTS model.
export async function playRawPcm(base64: string) {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const data = decode(base64);
  const audioBuffer = await decodeAudioData(data, audioContext, 24000, 1);
  const source = audioContext.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(audioContext.destination);
  source.start();
}
