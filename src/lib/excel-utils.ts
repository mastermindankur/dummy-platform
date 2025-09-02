'use server';

import * as XLSX from 'xlsx';
import type { ExcelRow, ExcelData } from '@/types';

export async function processExcelFile(fileAsDataUri: string): Promise<ExcelData> {
  const base64Data = fileAsDataUri.split(',')[1];
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
