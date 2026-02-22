import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { DESIGN_SYSTEM_INSTRUCTION } from '../constants';

const DESIGN_SYSTEM_INSTRUCTION_FALLBACK = DESIGN_SYSTEM_INSTRUCTION;

export async function* streamChatResponse(
  messages: { role: 'user' | 'model', text: string }[],
  systemInstruction: string = DESIGN_SYSTEM_INSTRUCTION,
  isThinking: boolean = false,
  apiKeyOverride?: string
) {
  const key = apiKeyOverride || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: key });

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
      thinkingConfig: isThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined
    }
  });

  for await (const chunk of responseStream) {
    yield {
      text: chunk.text || '',
      thought: (chunk as any).thought || ''
    };
  }
}
