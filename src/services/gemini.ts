import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { DESIGN_SYSTEM_INSTRUCTION } from '../constants';

const DESIGN_SYSTEM_INSTRUCTION_FALLBACK = DESIGN_SYSTEM_INSTRUCTION;

export async function* streamChatResponse(
  messages: { role: 'user' | 'model', text: string }[],
  systemInstruction: string = DESIGN_SYSTEM_INSTRUCTION,
  isThinking: boolean = false,
  apiKeyOverride?: string,
  useSearch: boolean = false
) {
  const key = apiKeyOverride || process.env.GEMINI_API_KEY;
  const ai = new GoogleGenAI({ apiKey: key });

  const contents = messages.map(msg => ({
    role: msg.role,
    parts: [{ text: msg.text }]
  }));

  const responseStream = await ai.models.generateContentStream({
    model: useSearch ? 'gemini-3-flash-preview' : 'gemini-3.1-pro-preview',
    contents: contents,
    config: {
      systemInstruction: systemInstruction,
      temperature: 0.2,
      thinkingConfig: isThinking ? { thinkingLevel: ThinkingLevel.HIGH } : undefined,
      tools: useSearch ? [{ googleSearch: {} }] : undefined
    }
  });

  for await (const chunk of responseStream) {
    yield {
      text: chunk.text || '',
      thought: (chunk as any).thought || ''
    };
  }
}

export async function generateImage(
  prompt: string,
  size: '1K' | '2K' | '4K' = '1K',
  aspectRatio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9' = '1:1'
) {
  const key = process.env.API_KEY;
  if (!key) throw new Error('API Key not found. Please select a key.');
  
  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: {
      parts: [{ text: prompt }]
    },
    config: {
      imageConfig: {
        aspectRatio,
        imageSize: size
      }
    }
  });

  const parts = response.candidates?.[0]?.content?.parts || [];
  const imagePart = parts.find(p => p.inlineData);
  const textPart = parts.find(p => p.text);

  return {
    imageUrl: imagePart?.inlineData ? `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}` : null,
    text: textPart?.text || ''
  };
}
