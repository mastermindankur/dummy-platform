
import { NextResponse } from 'next/server';
import { getPillars, writeData, readExcelData, writeExcelData } from '@/lib/data';
import type { Pillar } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get('key');

  if (fileKey) {
     try {
        const data = await readExcelData(fileKey);
        if (data) {
            return NextResponse.json(data);
        } else {
            return new NextResponse('Not Found', { status: 404 });
        }
     } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
     }
  } else {
    try {
        const pillars = await getPillars();
        return NextResponse.json(pillars);
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body.pillars) {
        await writeData(body.pillars);
    }
    if (body.excelData) {
        for (const key in body.excelData) {
            if (body.excelData[key]) {
                 await writeExcelData(key, body.excelData[key]);
            }
        }
    }

    return new NextResponse('Data saved successfully', { status: 200 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
