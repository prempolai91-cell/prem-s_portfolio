// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Generates alternative bios based on user experience and goals.
 *
 * - generateAlternativeBios - A function that generates alternative bios.
 * - GenerateAlternativeBiosInput - The input type for the generateAlternativeBios function.
 * - GenerateAlternativeBiosOutput - The return type for the generateAlternativeBios function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAlternativeBiosInputSchema = z.object({
  experience: z.string().describe('The user’s professional experience.'),
  goals: z.string().describe('The user’s professional goals.'),
  stylePreferences: z.string().optional().describe('Any style preferences for the bio (e.g., formal, casual, creative).'),
});

export type GenerateAlternativeBiosInput = z.infer<typeof GenerateAlternativeBiosInputSchema>;

const GenerateAlternativeBiosOutputSchema = z.object({
  bios: z.array(z.string()).describe('An array of alternative bio variations.'),
});

export type GenerateAlternativeBiosOutput = z.infer<typeof GenerateAlternativeBiosOutputSchema>;

export async function generateAlternativeBios(input: GenerateAlternativeBiosInput): Promise<GenerateAlternativeBiosOutput> {
  return generateAlternativeBiosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAlternativeBiosPrompt',
  input: {schema: GenerateAlternativeBiosInputSchema},
  output: {schema: GenerateAlternativeBiosOutputSchema},
  prompt: `You are a professional bio writer. Generate 3 alternative bios based on the following information. Adhere to these style preferences: {{{stylePreferences}}}. Return the bios as a JSON array.

Experience: {{{experience}}}
Goals: {{{goals}}}`,
});

const generateAlternativeBiosFlow = ai.defineFlow(
  {
    name: 'generateAlternativeBiosFlow',
    inputSchema: GenerateAlternativeBiosInputSchema,
    outputSchema: GenerateAlternativeBiosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
