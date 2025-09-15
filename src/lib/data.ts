
import {
  TrendingUp,
  ShieldCheck,
  Scaling,
  Cpu,
  Landmark,
} from "lucide-react";
import type { Pillar, SubItem, ExcelData, MonthlyExcelData, ValueMapData } from "@/types";
import { promises as fs } from 'fs';
import path from 'path';

// Hardcoded icons mapping
const pillarIcons: { [key: string]: Pillar['icon'] } = {
  'improving-productivity': TrendingUp,
  'building-reliable-products': ShieldCheck,
  'making-design-resilient': Scaling,
  'adopting-emerging-technologies': Cpu,
  'world-class-corporate-governance': Landmark,
};

const dataFilePath = (filename: string) => path.join(process.cwd(), 'src', 'lib', filename);
const monthlyDataDirectoryPath = (dir: string) => path.join(process.cwd(), 'src', 'lib', dir);


async function readData(): Promise<Pillar[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath('data.json'), 'utf-8');
    let jsonData: Omit<Pillar, 'icon'>[] = JSON.parse(fileContent);

    const autoCalculatedKeys = [
        'tech-sphere-sessions', 'arc-trainings', 'app-sherpas', 
        'explore-resiliency-program', 'dti-tech-blogs', 'hackathons', 
        'industry-events', 'squad-onboarding', 'regression-testing-automation',
        'junit-adoption', 'maintenance-screens', 'api-performance'
    ];

    const dataCache: Record<string, ExcelData | null> = {};

    for (const key of autoCalculatedKeys) {
        dataCache[key] = await readExcelData(key);
    }
    
    // Attach total participants for tech sphere sessions
    const techSessionsData = dataCache['tech-sphere-sessions'];
    if (techSessionsData && techSessionsData.rows.length > 0) {
      const totalParticipants = techSessionsData.rows.reduce((sum, row) => sum + (Number(row['Participation']) || 0), 0);
      jsonData = jsonData.map(pillar => ({
        ...pillar,
        subItems: pillar.subItems.map(subItem => 
            subItem.dataKey === 'tech-sphere-sessions' 
            ? { ...subItem, totalParticipants } 
            : subItem
        ),
      }));
    }

    // Attach total participants and session count for ARC trainings
    const arcTrainingsData = dataCache['arc-trainings'];
    if (arcTrainingsData && arcTrainingsData.rows.length > 0) {
        const totalParticipants = arcTrainingsData.rows.reduce((sum, row) => sum + (Number(row['Participation']) || 0), 0);
        const sessionsCount = arcTrainingsData.rows.length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'arc-trainings' 
                ? { ...subItem, totalParticipants, percentageComplete: sessionsCount } 
                : subItem
            ),
        }));
    }

    // Attach App Sherpas count
    const appSherpasData = dataCache['app-sherpas'];
    if (appSherpasData && appSherpasData.rows.length > 0) {
        const sherpasCount = appSherpasData.rows.length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'app-sherpas' 
                ? { ...subItem, percentageComplete: sherpasCount } 
                : subItem
            ),
        }));
    }
    
    // Attach completed assessment count for Explore Resiliency Program
    const resiliencyData = dataCache['explore-resiliency-program'];
    if (resiliencyData && resiliencyData.rows.length > 0) {
        const completedAssessments = resiliencyData.rows.filter(row => row['Status'] === 'Assessment Completed').length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'explore-resiliency-program' 
                ? { ...subItem, percentageComplete: completedAssessments } 
                : subItem
            ),
        }));
    }

    // Attach published blogs count for DTI Tech Blogs
    const blogsData = dataCache['dti-tech-blogs'];
    if (blogsData) { // Check if blogsData is not null
        const publishedBlogs = blogsData.rows.length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'dti-tech-blogs' 
                ? { ...subItem, percentageComplete: publishedBlogs } 
                : subItem
            ),
        }));
    }

    // Attach hackathons count
    const hackathonsData = dataCache['hackathons'];
    if (hackathonsData && hackathonsData.rows.length > 0) {
        const hackathonsCount = hackathonsData.rows.length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'hackathons' 
                ? { ...subItem, percentageComplete: hackathonsCount } 
                : subItem
            ),
        }));
    }

     // Attach industry events count
    const industryEventsData = dataCache['industry-events'];
    if (industryEventsData && industryEventsData.rows.length > 0) {
        const industryEventsCount = industryEventsData.rows.length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'industry-events' 
                ? { ...subItem, percentageComplete: industryEventsCount } 
                : subItem
            ),
        }));
    }
    
    // Attach SQUAD onboarding count
    const squadData = dataCache['squad-onboarding'];
    if (squadData && squadData.rows.length > 0) {
        const onboardedCount = squadData.rows.length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'squad-onboarding' 
                ? { ...subItem, percentageComplete: onboardedCount } 
                : subItem
            ),
        }));
    }

    // Attach row counts for 'Building Reliable Products' sub-items (except Maintenance Screens)
    const newAutoCalcKeys = ['regression-testing-automation', 'junit-adoption', 'api-performance'];
    for (const key of newAutoCalcKeys) {
        const data = dataCache[key];
        if (data && data.rows.length > 0) {
            const rowCount = data.rows.length;
            jsonData = jsonData.map(pillar => ({
                ...pillar,
                subItems: pillar.subItems.map(subItem => 
                    subItem.dataKey === key 
                    ? { ...subItem, percentageComplete: rowCount } 
                    : subItem
                ),
            }));
        }
    }
    
    // Attach implemented screens count for Maintenance Screens
    const maintenanceScreensData = dataCache['maintenance-screens'];
    if (maintenanceScreensData && maintenanceScreensData.rows.length > 0) {
        const implementedScreens = maintenanceScreensData.rows.filter(row => String(row['Status'] || '').toLowerCase().includes('live')).length;
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'maintenance-screens' 
                ? { ...subItem, percentageComplete: implementedScreens } 
                : subItem
            ),
        }));
    }


    // Attach Jira Assistant Adoption data
    const jiraAdoptionData = await readMonthlyData('jira-assistant-adoption');
    if (jiraAdoptionData && Object.keys(jiraAdoptionData).length > 0) {
        const latestMonth = Object.keys(jiraAdoptionData).sort().pop();
        
        let latestMonthAdoption = 0;
        if (latestMonth && jiraAdoptionData[latestMonth]) {
            const latestMonthRows = jiraAdoptionData[latestMonth].rows;
            const testCases = latestMonthRows.filter(row => row['issue_type'] === 'Test');
            const totalTestCases = testCases.length;
            const jaTestCases = testCases.filter(row => row['is_created_via_JA'] === 1).length;
            
            if (totalTestCases > 0) {
                latestMonthAdoption = Math.round((jaTestCases / totalTestCases) * 100);
            }
        }
        
        jsonData = jsonData.map(pillar => ({
            ...pillar,
            subItems: pillar.subItems.map(subItem => 
                subItem.dataKey === 'jira-assistant-adoption' 
                ? { ...subItem, percentageComplete: latestMonthAdoption, metricName: `Latest Month Test Case Adoption` } 
                : subItem
            ),
        }));
    }


    // Attach icons back to the data
    return jsonData.map(pillar => ({
      ...pillar,
      icon: pillarIcons[pillar.id] || Landmark, // Fallback icon
    }));
  } catch (error) {
    console.error("Could not read or parse data.json:", error);
    // Fallback to empty array or some default structure if file read fails
    return [];
  }
}

export async function getPillars(): Promise<Pillar[]> {
  return await readData();
}

export async function getPillarById(id: string): Promise<Pillar | undefined> {
  const pillars = await readData();
  return pillars.find((p) => p.id === id);
}

export async function writeData(data: Pillar[]) {
    try {
        // We need to remove the icon and other dynamic properties before writing to JSON
        const dataToWrite = data.map(({ icon, ...rest }) => {
          rest.subItems = rest.subItems.map(({ totalParticipants, ...subRest }) => subRest);
          return rest;
        });
        await fs.writeFile(dataFilePath('data.json'), JSON.stringify(dataToWrite, null, 2), 'utf-8');
    } catch (error) {
        console.error("Could not write to data.json:", error);
        throw new Error("Failed to save data.");
    }
}

export async function readExcelData(fileKey: string): Promise<ExcelData | null> {
    try {
        const fileContent = await fs.readFile(dataFilePath(`${fileKey}.json`), 'utf-8');
        // A bit of a hack: if it's hackathons.json, it's not ExcelData format but Hackathon[]
        if (fileKey === 'hackathons' || fileKey === 'industry-events') {
          const data = JSON.parse(fileContent);
          return { headers: [], rows: data };
        }
        return JSON.parse(fileContent);
    } catch (error) {
        // It's okay if the file doesn't exist, it just means no data has been uploaded yet.
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            try {
                // If the file doesn't exist, create it with empty data
                const emptyContent = (fileKey === 'hackathons' || fileKey === 'industry-events') ? '[]' : JSON.stringify({ headers: [], rows: [] }, null, 2);
                await fs.writeFile(dataFilePath(`${fileKey}.json`), emptyContent, 'utf-8');

                if (fileKey === 'hackathons' || fileKey === 'industry-events') {
                    return { headers: [], rows: [] };
                }
                return { headers: [], rows: [] };
            } catch (writeError) {
                console.error(`Could not create ${fileKey}.json:`, writeError);
                return null;
            }
        }
        console.error(`Could not read or parse ${fileKey}.json:`, error);
        return null;
    }
}


export async function writeExcelData(fileKey: string, data: any) {
    try {
        // A bit of a hack for hackathons data
        const dataToWrite = (fileKey === 'hackathons' || fileKey === 'industry-events') ? data : data;
        await fs.writeFile(dataFilePath(`${fileKey}.json`), JSON.stringify(dataToWrite, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Could not write to ${fileKey}.json:`, error);
        throw new Error(`Failed to save ${fileKey} data.`);
    }
}

export async function readMonthlyData(dir: string, month?: string | null): Promise<MonthlyExcelData | null> {
    const dirPath = monthlyDataDirectoryPath(dir);
    try {
        await fs.mkdir(dirPath, { recursive: true });
        const files = await fs.readdir(dirPath);
        
        if (month) {
            const fileName = `${month}.json`;
            if (files.includes(fileName)) {
                const fileContent = await fs.readFile(path.join(dirPath, fileName), 'utf-8');
                if (fileContent.trim() === '') return { [month]: { headers: [], rows: [] } };
                return { [month]: JSON.parse(fileContent) };
            }
            return null;
        }

        const allData: MonthlyExcelData = {};
        for (const file of files) {
            if (path.extname(file) === '.json') {
                const monthKey = path.basename(file, '.json');
                const fileContent = await fs.readFile(path.join(dirPath, file), 'utf-8');
                if (fileContent.trim() === '') {
                    allData[monthKey] = { headers: [], rows: [] };
                } else {
                    allData[monthKey] = JSON.parse(fileContent);
                }
            }
        }
        return allData;

    } catch (error) {
        console.error(`Could not read from directory ${dir}:`, error);
        return null;
    }
}

export async function writeMonthlyData(dir: string, month: string, data: ExcelData) {
    const dirPath = monthlyDataDirectoryPath(dir);
    try {
        await fs.mkdir(dirPath, { recursive: true });
        const filePath = path.join(dirPath, `${month}.json`);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Could not write to ${dir}/${month}.json:`, error);
        throw new Error(`Failed to save ${dir} data for ${month}.`);
    }
}

// Value Map Data Functions
export async function getValueMapData(): Promise<ValueMapData> {
    const filePath = dataFilePath('value-map.json');
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as ValueMapData;
    } catch (error) {
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            const defaultData: ValueMapData = {
                outcomes: [],
                drivers: [],
                levers: [],
            };
            await writeValueMapData(defaultData);
            return defaultData;
        }
        console.error("Could not read or parse value-map.json:", error);
        throw new Error("Failed to read Value Map data.");
    }
}

export async function writeValueMapData(data: ValueMapData) {
    try {
        const filePath = dataFilePath('value-map.json');
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error("Could not write to value-map.json:", error);
        throw new Error("Failed to save Value Map data.");
    }
}
