'use server';

/**
 * @fileOverview Generates an executive summary of the WCE 2025 program's health.
 *
 * - generateExecutiveSummary - A function that generates the executive summary.
 * - GenerateExecutiveSummaryInput - The input type for the generateExecutiveSummary function.
 * - GenerateExecutiveSummaryOutput - The return type for the generateExecutiveSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateExecutiveSummaryInputSchema = z.object({
  pillarStatuses: z.record(z.string(), z.enum(['Green', 'Amber', 'Red'])).describe('The health status of each pillar (Green, Amber, Red).'),
  subItemStatuses: z.record(z.string(), z.enum(['Green', 'Amber', 'Red'])).describe('The health status of each sub-item within each pillar (Green, Amber, Red).'),
});
export type GenerateExecutiveSummaryInput = z.infer<typeof GenerateExecutiveSummaryInputSchema>;

const GenerateExecutiveSummaryOutputSchema = z.object({
  summary: z.string().describe('The executive summary of the WCE 2025 program health.'),
});
export type GenerateExecutiveSummaryOutput = z.infer<typeof GenerateExecutiveSummaryOutputSchema>;

export async function generateExecutiveSummary(input: GenerateExecutiveSummaryInput): Promise<GenerateExecutiveSummaryOutput> {
  return generateExecutiveSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateExecutiveSummaryPrompt',
  input: {schema: GenerateExecutiveSummaryInputSchema},
  output: {schema: GenerateExecutiveSummaryOutputSchema},
  prompt: `You are an executive assistant providing a summary of the World Class Engineering 2025 program's health.

  Based on the pillar and sub-item statuses, generate a concise executive summary highlighting key areas of concern (Amber/Red statuses) and areas of success (Green statuses).

Pillar Statuses:
{{#each pillarStatuses}}
- {{key}}: {{this}}
{{/each}}

Sub-item Statuses:
{{#each subItemStatuses}}
- {{key}}: {{this}}
{{/each}}
  
Focus on providing actionable insights for executive leadership.
`,
});

const generateExecutiveSummaryFlow = ai.defineFlow(
  {
    name: 'generateExecutiveSummaryFlow',
    inputSchema: GenerateExecutiveSummaryInputSchema,
    outputSchema: GenerateExecutiveSummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
