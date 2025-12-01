
// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview Edits a photo based on a text prompt.
 *
 * - editPhoto - A function that edits a photo.
 * - EditPhotoInput - The input type for the editPhoto function.
 * - EditPhotoOutput - The return type for the editPhoto function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditPhotoInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a person, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  prompt: z.string().describe('The editing instructions for the photo.'),
});
export type EditPhotoInput = z.infer<typeof EditPhotoInputSchema>;

const EditPhotoOutputSchema = z.object({
  editedPhotoDataUri: z
    .string()
    .describe(
      "The edited photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type EditPhotoOutput = z.infer<typeof EditPhotoOutputSchema>;

export async function editPhoto(input: EditPhotoInput): Promise<EditPhotoOutput> {
  return editPhotoFlow(input);
}

const editPhotoFlow = ai.defineFlow(
  {
    name: 'editPhotoFlow',
    inputSchema: EditPhotoInputSchema,
    outputSchema: EditPhotoOutputSchema,
  },
  async ({photoDataUri, prompt}) => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {media: {url: photoDataUri}},
        {text: prompt},
      ],
      config: {
        responseModalities: ['IMAGE'],
      },
    });
    return {
      editedPhotoDataUri: media.url,
    };
  }
);
