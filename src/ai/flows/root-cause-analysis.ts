'use server';

/**
 * @fileOverview AI flow for analyzing the root causes of Amber/Red statuses in the WCE 2025 dashboard.
 *
 * - analyzeRootCause - A function that takes a pillar name and status description and returns potential root causes.
 * - AnalyzeRootCauseInput - The input type for the analyzeRootCause function.
 * - AnalyzeRootCauseOutput - The return type for the analyzeRootCause function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeRootCauseInputSchema = z.object({
  pillarName: z.string().describe('The name of the pillar being analyzed.'),
  statusDescription: z.string().describe('A detailed description of the current status (Amber or Red) of the pillar.'),
});
export type AnalyzeRootCauseInput = z.infer<typeof AnalyzeRootCauseInputSchema>;

const AnalyzeRootCauseOutputSchema = z.object({
  rootCauses: z.array(z.string()).describe('A list of potential root causes for the given status description.'),
});
export type AnalyzeRootCauseOutput = z.infer<typeof AnalyzeRootCauseOutputSchema>;

export async function analyzeRootCause(input: AnalyzeRootCauseInput): Promise<AnalyzeRootCauseOutput> {
  return analyzeRootCauseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'rootCauseAnalysisPrompt',
  input: {schema: AnalyzeRootCauseInputSchema},
  output: {schema: AnalyzeRootCauseOutputSchema},
  prompt: `You are an expert consultant in World Class Engineering, skilled at identifying the underlying causes of program issues.

  Analyze the following information to determine the potential root causes of the reported status. Provide a numbered list of the top potential root causes.

Pillar Name: {{{pillarName}}}
Status Description: {{{statusDescription}}}

Consider factors related to productivity, product reliability, design resilience, technology adoption, and governance.
`,
});

const analyzeRootCauseFlow = ai.defineFlow(
  {
    name: 'analyzeRootCauseFlow',
    inputSchema: AnalyzeRootCauseInputSchema,
    outputSchema: AnalyzeRootCauseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
