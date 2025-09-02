
import { NextResponse } from 'next/server';
import { getPillars, writeData } from '@/lib/data';
import type { Pillar } from '@/types';

export async function GET() {
  try {
    const pillars = await getPillars();
    return NextResponse.json(pillars);
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body: Pillar[] = await request.json();
    await writeData(body);
    return new NextResponse('Data saved successfully', { status: 200 });
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
