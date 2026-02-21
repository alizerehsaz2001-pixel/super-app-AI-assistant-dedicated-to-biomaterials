import { GoogleGenAI } from '@google/genai';
import { DESIGN_SYSTEM_INSTRUCTION } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function* streamChatResponse(
  messages: { role: 'user' | 'model', text: string }[],
  systemInstruction: string = DESIGN_SYSTEM_INSTRUCTION
) {
  const contents = messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const responseStream = await ai.models.generateContentStream({
    model: 'gemini-3.1-pro-preview',
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2,
    }
  });

  for await (const chunk of responseStream) {
    if (chunk.text) {
      yield chunk.text;
    }
  }
}
