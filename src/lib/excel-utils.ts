
'use server';

import * as XLSX from 'xlsx';
import type { ExcelRow, ExcelData, MappingRule } from '@/types';

type Filter = {
    column: string;
    value: string;
};

export async function getExcelSheetNames(fileAsDataUri: string): Promise<string[]> {
    const base64Data = fileAsDataUri.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    return workbook.SheetNames;
}

export async function processExcelFile(
    fileAsDataUri: string, 
    sheetName: string,
    filters?: Filter[],
    mappings?: MappingRule[]
): Promise<ExcelData> {
  const base64Data = fileAsDataUri.split(',')[1];
  const buffer = Buffer.from(base64Data, 'base64');
  const workbook = XLSX.read(buffer, { type: 'buffer' });

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
      throw new Error(`Sheet "${sheetName}" not found in the workbook.`);
  }

  const jsonData: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  if (jsonData.length === 0) {
    return { headers: [], rows: [] };
  }

  let headers = jsonData[0].map(String);
  let rows = jsonData.slice(1).map(row => {
    const rowData: ExcelRow = {};
    headers.forEach((header, index) => {
      rowData[header] = row[index];
    });
    return rowData;
  });

  if (filters && filters.length > 0) {
      rows = rows.filter(row => {
          return filters.every(filter => {
              if (filter.column && filter.value) {
                  return String(row[filter.column] ?? '').trim() === filter.value.trim();
              }
              return true;
          });
      });
  }

  if (mappings && mappings.length > 0) {
      const newHeaders = new Set(headers);
      mappings.forEach(m => newHeaders.add(m.thenColumn));
      headers = Array.from(newHeaders);

      rows = rows.map(row => {
          const newRow = { ...row };
          mappings.forEach(mapping => {
              if (String(row[mapping.ifColumn] ?? '').trim() === mapping.ifValue.trim()) {
                  newRow[mapping.thenColumn] = mapping.thenValue;
              }
          });
          return newRow;
      });
  }
  
  return { headers, rows };
}
