'use server';

/**
 * @fileOverview Processes an uploaded Excel file and extracts the data.
 *
 * - processExcelFile - A function that handles parsing the Excel file.
 * - ProcessExcelFileInput - The input type for the processExcelFile function.
 * - ProcessExcelFileOutput - The return type for the processExcelFile function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import * as XLSX from 'xlsx';

const ProcessExcelFileInputSchema = z.object({
  fileAsDataUri: z
    .string()
    .describe(
      "The Excel file content as a data URI. Expected format: 'data:<mimetype>;base64,<encoded_data>'"
    ),
});
export type ProcessExcelFileInput = z.infer<
  typeof ProcessExcelFileInputSchema
>;

const ExcelRowSchema = z.record(z.any());
export type ExcelRow = z.infer<typeof ExcelRowSchema>;

const ProcessExcelFileOutputSchema = z.object({
  headers: z.array(z.string()).describe('The headers of the Excel sheet.'),
  rows: z.array(ExcelRowSchema).describe('The rows of data from the Excel sheet.'),
});
export type ProcessExcelFileOutput = z.infer<
  typeof ProcessExcelFileOutputSchema
>;

export async function processExcelFile(
  input: ProcessExcelFileInput
): Promise<ProcessExcelFileOutput> {
  return processExcelFileFlow(input);
}

const processExcelFileFlow = ai.defineFlow(
  {
    name: 'processExcelFileFlow',
    inputSchema: ProcessExcelFileInputSchema,
    outputSchema: ProcessExcelFileOutputSchema,
  },
  async (input) => {
    const base64Data = input.fileAsDataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    if (jsonData.length === 0) {
      return { headers: [], rows: [] };
    }

    const headers = jsonData[0].map(String);
    const rows = jsonData.slice(1).map(row => {
      const rowData: ExcelRow = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });
    
    return { headers, rows };
  }
);
