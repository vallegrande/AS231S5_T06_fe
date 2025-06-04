'use server';

/**
 * @fileOverview Provides AI-powered translation suggestions for object descriptions.
 *
 * - suggestTranslation - A function that suggests translations for a given text.
 * - SuggestTranslationInput - The input type for the suggestTranslation function.
 * - SuggestTranslationOutput - The return type for the suggestTranslation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTranslationInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  targetLanguage: z.string().describe('The target language for translation.'),
});
export type SuggestTranslationInput = z.infer<typeof SuggestTranslationInputSchema>;

const SuggestTranslationOutputSchema = z.object({
  translatedText: z.string().describe('The translated text in the target language.'),
});
export type SuggestTranslationOutput = z.infer<typeof SuggestTranslationOutputSchema>;

export async function suggestTranslation(input: SuggestTranslationInput): Promise<SuggestTranslationOutput> {
  return suggestTranslationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTranslationPrompt',
  input: {schema: SuggestTranslationInputSchema},
  output: {schema: SuggestTranslationOutputSchema},
  prompt: `Translate the following text to {{targetLanguage}}:\n\n{{{text}}} `,
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
