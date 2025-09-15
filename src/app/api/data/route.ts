
import { NextResponse } from 'next/server';
import { 
    getPillars, 
    writeData, 
    readExcelData, 
    writeExcelData, 
    readMonthlyData, 
    writeMonthlyData,
    getValueMapData,
    writeValueMapData,
} from '@/lib/data';
import type { Pillar } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get('key');
  const month = searchParams.get('month'); // e.g., '2024-08'

  if (fileKey === 'value-map') {
      try {
          const data = await getValueMapData();
          return NextResponse.json(data);
      } catch (error) {
          return new NextResponse('Internal Server Error', { status: 500 });
      }
  }

  if (fileKey === 'jira-assistant-adoption') {
      try {
          const data = await readMonthlyData(fileKey, month);
          return NextResponse.json(data);
      } catch (error) {
          return new NextResponse('Internal Server Error', { status: 500 });
      }
  }

  if (fileKey) {
     try {
        if (fileKey === 'hackathons') {
            const data = await readExcelData('hackathons');
            // hackathons are not in ExcelData format, they are just an array in the `rows` property
            return NextResponse.json(data?.rows ?? []); 
        }
        if (fileKey === 'industry-events') {
            const data = await readExcelData('industry-events');
            return NextResponse.json(data?.rows ?? []);
        }
        if (fileKey === 'squad-onboarding') {
            const data = await readExcelData('squad-onboarding');
            return NextResponse.json(data);
        }
         if (fileKey === 'arc-trainings') {
            const data = await readExcelData('arc-trainings');
            return NextResponse.json(data);
        }
        if (fileKey === 'app-sherpas') {
            const data = await readExcelData('app-sherpas');
            return NextResponse.json(data);
        }
        if (fileKey === 'regression-testing-automation' || fileKey === 'junit-adoption' || fileKey === 'maintenance-screens' || fileKey === 'api-performance') {
            const data = await readExcelData(fileKey);
            return NextResponse.json(data);
        }
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
    if (body.valueMap) {
        await writeValueMapData(body.valueMap);
    }
    if (body.excelData) {
        for (const key in body.excelData) {
            if (Object.prototype.hasOwnProperty.call(body.excelData, key)) {
                 if (body.excelData[key]) {
                    // special handling for hackathons since they are just an array
                    if (key === 'hackathons' || key === 'industry-events') {
                      await writeExcelData(key, body.excelData[key]);
                    } else if (key.startsWith('jira-assistant-adoption')) {
                        const [, month] = key.split(':');
                        if (month) {
                            await writeMonthlyData('jira-assistant-adoption', month, body.excelData[key]);
                        }
                    }
                    else {
                      await writeExcelData(key, body.excelData[key]);
                    }
                 }
            }
        }
    }

    return new NextResponse('Data saved successfully', { status: 200 });
  } catch (error) {
    console.error('Save Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
