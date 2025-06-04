'use server';

/**
 * @fileOverview Proporciona sugerencias de traducción asistidas por IA para descripciones de objetos.
 *
 * - suggestTranslation - Una función que sugiere traducciones para un texto dado.
 * - SuggestTranslationInput - El tipo de entrada para la función suggestTranslation.
 * - SuggestTranslationOutput - El tipo de retorno para la función suggestTranslation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTranslationInputSchema = z.object({
  text: z.string().describe('El texto a traducir.'),
  targetLanguage: z.string().describe('El idioma de destino para la traducción.'),
});
export type SuggestTranslationInput = z.infer<typeof SuggestTranslationInputSchema>;

const SuggestTranslationOutputSchema = z.object({
  translatedText: z.string().describe('El texto traducido en el idioma de destino.'),
});
export type SuggestTranslationOutput = z.infer<typeof SuggestTranslationOutputSchema>;

export async function suggestTranslation(input: SuggestTranslationInput): Promise<SuggestTranslationOutput> {
  return suggestTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTranslationPrompt',
  input: {schema: SuggestTranslationInputSchema},
  output: {schema: SuggestTranslationOutputSchema},
  prompt: `Translate the following text to {{targetLanguage}}:\n\n{{{text}}}`,
});

const suggestTranslationFlow = ai.defineFlow(
  {
    name: 'suggestTranslationFlow',
    inputSchema: SuggestTranslationInputSchema,
    outputSchema: SuggestTranslationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
