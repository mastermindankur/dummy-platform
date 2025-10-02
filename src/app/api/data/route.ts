
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
    getUsers,
    writeUsers,
    getActionItems,
    writeActionItems,
    getEvents,
    writeEvents,
    getExcelMetadata,
    writeExcelMetadata,
    getImpactInitiatives,
    writeImpactInitiatives
} from '@/lib/data';
import type { Pillar } from '@/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileKey = searchParams.get('key');
  const month = searchParams.get('month'); // e.g., '2024-08'
  const includeMetadata = searchParams.get('meta');

  if (includeMetadata && fileKey) {
      try {
        const metadata = await getExcelMetadata();
        return NextResponse.json({ lastUpdated: metadata[fileKey] || null });
      } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
      }
  }


  if (fileKey === 'users') {
      try {
          const data = await getUsers();
          return NextResponse.json(data);
      } catch (error) {
          return new NextResponse('Internal Server Error', { status: 500 });
      }
  }
  if (fileKey === 'action-items') {
      try {
          const data = await getActionItems();
          return NextResponse.json(data);
      } catch (error) {
          return new NextResponse('Internal Server Error', { status: 500 });
      }
  }
  if (fileKey === 'events') {
    try {
        const data = await getEvents();
        return NextResponse.json(data);
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
  }
  if (fileKey === 'impact-initiatives') {
    try {
        const data = await getImpactInitiatives();
        return NextResponse.json(data);
    } catch (error) {
        return new NextResponse('Internal Server Error', { status: 500 });
    }
  }


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
            return NextResponse.json(data ?? []); 
        }
        if (fileKey === 'industry-events') {
            const data = await readExcelData('industry-events');
            return NextResponse.json(data ?? []);
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
        if (fileKey === 'regression-testing-automation' || fileKey === 'junit-adoption' || fileKey === 'maintenance-screens' || fileKey === 'api-performance' || fileKey === 'users') {
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
    let excelMetadataUpdated = false;

    if (body.pillars) {
        await writeData(body.pillars);
    }
    if (body.valueMap) {
        await writeValueMapData(body.valueMap);
    }
    if (body.actionItems) {
        await writeActionItems(body.actionItems);
    }
    if (body.events) {
        await writeEvents(body.events);
    }
    if (body.impactInitiatives) {
        await writeImpactInitiatives(body.impactInitiatives);
    }
    if (body.excelData) {
        const metadata = await getExcelMetadata();
        const now = new Date().toISOString();

        for (const key in body.excelData) {
            if (Object.prototype.hasOwnProperty.call(body.excelData, key)) {
                 if (body.excelData[key]) {
                    // special handling for certain keys
                    if (key === 'hackathons') {
                      await writeExcelData(key, body.excelData[key]);
                      metadata[key] = now;
                      excelMetadataUpdated = true;
                    } else if (key === 'industry-events') {
                        await writeExcelData(key, body.excelData[key]);
                        metadata[key] = now;
                        excelMetadataUpdated = true;
                    } else if (key.startsWith('jira-assistant-adoption')) {
                        const [, month] = key.split(':');
                        if (month) {
                            await writeMonthlyData('jira-assistant-adoption', month, body.excelData[key]);
                            metadata[`jira-assistant-adoption`] = now; // Store one timestamp for the whole dataset
                            excelMetadataUpdated = true;
                        }
                    } else if (key === 'users') {
                        const usersData = body.excelData[key].rows.map((row: any) => ({
                            name: row['Name'],
                            email: row['Email'],
                            lobt: row['LOBT'],
                        }));
                        await writeUsers(usersData);
                    }
                    else {
                      await writeExcelData(key, body.excelData[key]);
                      metadata[key] = now;
                      excelMetadataUpdated = true;
                    }
                 }
            }
        }
         if (excelMetadataUpdated) {
            await writeExcelMetadata(metadata);
        }
    }

    return new NextResponse('Data saved successfully', { status: 200 });
  } catch (error) {
    console.error('Save Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
