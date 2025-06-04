'use server';
/**
 * @fileOverview Proporciona una interfaz de chat con un modelo de IA.
 *
 * - chatWithGemini - Una función que envía un mensaje de usuario y obtiene una respuesta de IA.
 * - ChatWithGeminiInput - El tipo de entrada para la función chatWithGemini.
 * - ChatWithGeminiOutput - El tipo de retorno para la función chatWithGemini.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithGeminiInputSchema = z.object({
  message: z.string().describe('El mensaje del usuario para enviar a la IA.'),
});
export type ChatWithGeminiInput = z.infer<typeof ChatWithGeminiInputSchema>;

const ChatWithGeminiOutputSchema = z.object({
  reply: z.string().describe('La respuesta generada por la IA.'),
});
export type ChatWithGeminiOutput = z.infer<typeof ChatWithGeminiOutputSchema>;

export async function chatWithGemini(input: ChatWithGeminiInput): Promise<ChatWithGeminiOutput> {
  return chatWithGeminiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatWithGeminiPrompt',
  input: {schema: ChatWithGeminiInputSchema},
  output: {schema: ChatWithGeminiOutputSchema},
  prompt: `Eres un asistente virtual amigable y servicial llamado Gemini. Responde de forma concisa y útil.
Usuario: {{{message}}}
Asistente Gemini:`,
});

const chatWithGeminiFlow = ai.defineFlow(
  {
    name: 'chatWithGeminiFlow',
    inputSchema: ChatWithGeminiInputSchema,
    outputSchema: ChatWithGeminiOutputSchema,
  },
  async (input) => {
    const {output} = await prompt(input);
    return output!;
  }
);
