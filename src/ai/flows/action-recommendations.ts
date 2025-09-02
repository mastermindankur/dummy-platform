'use server';

/**
 * @fileOverview Generates action recommendations for pillars with Amber or Red statuses.
 *
 * - getActionRecommendations - A function that generates action recommendations for pillars with Amber or Red statuses.
 * - ActionRecommendationsInput - The input type for the getActionRecommendations function.
 * - ActionRecommendationsOutput - The return type for the getActionRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ActionRecommendationsInputSchema = z.object({
  pillarName: z.string().describe('The name of the pillar.'),
  pillarStatus: z.enum(['Green', 'Amber', 'Red']).describe('The health status of the pillar.'),
  subItems: z.array(
    z.object({
      name: z.string().describe('The name of the sub-item.'),
      status: z.enum(['Green', 'Amber', 'Red']).describe('The health status of the sub-item.'),
    })
  ).describe('An array of sub-items with their names and health statuses.'),
});
export type ActionRecommendationsInput = z.infer<typeof ActionRecommendationsInputSchema>;

const ActionRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('An array of action recommendations.'),
});
export type ActionRecommendationsOutput = z.infer<typeof ActionRecommendationsOutputSchema>;

export async function getActionRecommendations(input: ActionRecommendationsInput): Promise<ActionRecommendationsOutput> {
  return actionRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'actionRecommendationsPrompt',
  input: {schema: ActionRecommendationsInputSchema},
  output: {schema: ActionRecommendationsOutputSchema},
  prompt: `You are an expert consultant providing action recommendations for a program called World Class Engineering 2025.

You are provided with the pillar name, its overall health status, and a list of sub-items with their health statuses.

Pillar Name: {{{pillarName}}}
Pillar Status: {{{pillarStatus}}}
Sub-items:
{{#each subItems}}
- Name: {{{name}}}, Status: {{{status}}}
{{/each}}

Based on this information, provide a list of immediate action recommendations to address the pillar's health status. Focus on actions that can be taken to improve Amber or Red statuses.

Format your response as a numbered list of recommendations.
`,
});

const actionRecommendationsFlow = ai.defineFlow(
  {
    name: 'actionRecommendationsFlow',
    inputSchema: ActionRecommendationsInputSchema,
    outputSchema: ActionRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
