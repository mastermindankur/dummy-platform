

import {
  TrendingUp,
  ShieldCheck,
  Scaling,
  Cpu,
  Landmark,
} from "lucide-react";
import type { Pillar, SubItem, ExcelData, MonthlyExcelData, ValueMapData, User, ActionItem, MeetingEvent, ExcelMetadata, ImpactInitiative, WhatsNewEntry, WhatsNewSectionContent } from "@/types";
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

const dataFilePath = (filename: string) => path.join(process.cwd(), 'src', 'lib', 'data', filename);
const monthlyDataDirectoryPath = (dir: string) => path.join(process.cwd(), 'src', 'lib', 'data', dir);
const valueMapVersionsPath = () => path.join(process.cwd(), 'src', 'lib', 'data', 'value-map-versions');


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
    const hackathonsData = await readExcelData('hackathons');
    if (hackathonsData && Array.isArray(hackathonsData)) {
      const hackathonsCount = hackathonsData.length;
      jsonData = jsonData.map((pillar) => ({
        ...pillar,
        subItems: pillar.subItems.map((subItem) =>
          subItem.dataKey === 'hackathons'
            ? { ...subItem, percentageComplete: hackathonsCount }
            : subItem
        ),
      }));
    }


     // Attach industry events count
    const industryEventsData = await readExcelData('industry-events');
    if (industryEventsData && Array.isArray(industryEventsData)) {
        const industryEventsCount = industryEventsData.length;
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

export async function readExcelData(fileKey: string): Promise<any> {
    try {
        const fileContent = await fs.readFile(dataFilePath(`${fileKey}.json`), 'utf-8');
        
        if (fileKey === 'hackathons' || fileKey === 'industry-events') {
          const data = JSON.parse(fileContent);
          // Ensure the data is an array for these keys.
          if (Array.isArray(data)) {
            return data;
          }
          if (data && Array.isArray(data.rows)) {
            return data.rows;
          }
          return [];
        }

         if (fileKey === 'users') {
            const users: User[] = JSON.parse(fileContent);
            const rows = users.map(user => ({ 'Name': user.name, 'Email': user.email, 'LOBT': user.lobt }));
            const headers = users.length > 0 ? Object.keys(rows[0]) : [];
            return { headers, rows };
        }
        return JSON.parse(fileContent);
    } catch (error) {
        // It's okay if the file doesn't exist, it just means no data has been uploaded yet.
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            try {
                let emptyContent: string;
                if (fileKey === 'hackathons' || fileKey === 'industry-events' || fileKey === 'users' || fileKey === 'impact-initiatives' || fileKey === 'whats-new') {
                    emptyContent = JSON.stringify([]);
                }
                else {
                    emptyContent = JSON.stringify({ headers: [], rows: [] }, null, 2);
                }
                
                await fs.writeFile(dataFilePath(`${fileKey}.json`), emptyContent, 'utf-8');
                
                if (fileKey === 'users') {
                    return { headers: ['Name', 'Email', 'LOBT'], rows: [] };
                }
                if (fileKey === 'hackathons' || fileKey === 'industry-events' || fileKey === 'impact-initiatives' || fileKey === 'whats-new') {
                    return [];
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
        await fs.writeFile(dataFilePath(`${fileKey}.json`), JSON.stringify(data, null, 2), 'utf-8');
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

// ## VALUE MAP DATA FUNCTIONS ##

// Get all available versions
export async function getValueMapVersions(): Promise<{ versions: string[], latest: string | null }> {
    const dirPath = valueMapVersionsPath();
    try {
        await fs.mkdir(dirPath, { recursive: true });
        const files = await fs.readdir(dirPath);
        const versions = files
            .filter(file => file.endsWith('.json'))
            .sort((a, b) => new Date(b.replace('.json','')).getTime() - new Date(a.replace('.json','')).getTime());
        
        return { versions, latest: versions[0] || null };
    } catch (error) {
        console.error("Could not read value map versions:", error);
        return { versions: [], latest: null };
    }
}

// Get data for a specific version, or the latest
export async function getValueMapData(version?: string | null): Promise<ValueMapData> {
    const dirPath = valueMapVersionsPath();
    try {
        await fs.mkdir(dirPath, { recursive: true });
        let versionToFetch = version;

        if (!versionToFetch || versionToFetch === 'latest') {
            const { latest } = await getValueMapVersions();
            if (!latest) {
                // If no versions exist, create a new default version.
                const defaultData: ValueMapData = { outcomes: [], drivers: [], levers: [], outcomeGroups: [], driverGroups: [] };
                await writeValueMapData(defaultData, true); // Save as new version
                return defaultData;
            }
            versionToFetch = latest;
        }
        
        if (!versionToFetch) {
            throw new Error("No version specified and no latest version found.");
        }

        const filePath = path.join(dirPath, versionToFetch);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent) as ValueMapData;
    } catch (error) {
        console.error(`Could not read value map version ${version}:`, error);
        // If a specific version read fails, it's better to return an error than an empty object
        throw new Error(`Failed to read Value Map data for version: ${version}.`);
    }
}

// Write data, either as a new version or updating the current one
export async function writeValueMapData(data: ValueMapData, asNewVersion: boolean) {
    const dirPath = valueMapVersionsPath();
    try {
        await fs.mkdir(dirPath, { recursive: true });
        let versionToSave: string;

        if (asNewVersion) {
            versionToSave = `${new Date().toISOString()}.json`;
        } else {
            const { latest } = await getValueMapVersions();
            versionToSave = latest || `${new Date().toISOString()}.json`;
        }

        const filePath = path.join(dirPath, versionToSave);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        
    } catch (error) {
        console.error("Could not write to value-map-versions:", error);
        throw new Error("Failed to save Value Map data.");
    }
}

// User and Action Item data functions
async function readJsonFile<T>(fileName: string, defaultValue: T): Promise<T> {
    const filePath = dataFilePath(fileName);
    try {
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            await writeJsonFile(fileName, defaultValue);
            return defaultValue;
        }
        console.error(`Could not read or parse ${fileName}:`, error);
        throw new Error(`Failed to read ${fileName}.`);
    }
}

async function writeJsonFile<T>(fileName: string, data: T) {
    try {
        const filePath = dataFilePath(fileName);
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Could not write to ${fileName}:`, error);
        throw new Error(`Failed to save ${fileName}.`);
    }
}

export const getUsers = () => readJsonFile<User[]>('users.json', []);
export const writeUsers = (data: User[]) => writeJsonFile('users.json', data);

export const getActionItems = () => readJsonFile<ActionItem[]>('action-items.json', []);
export const writeActionItems = (data: ActionItem[]) => writeJsonFile('action-items.json', data);

export const getEvents = () => readJsonFile<MeetingEvent[]>('events.json', []);
export const writeEvents = (data: MeetingEvent[]) => writeJsonFile('events.json', data);

export const getImpactInitiatives = () => readJsonFile<ImpactInitiative[]>('impact-initiatives.json', []);
export const writeImpactInitiatives = (data: ImpactInitiative[]) => writeJsonFile('impact-initiatives.json', data);

export const getWhatsNewEntries = () => readJsonFile<WhatsNewEntry[]>('whats-new.json', []);
export const writeWhatsNewEntries = (data: WhatsNewEntry[]) => writeJsonFile('whats-new.json', data);

export const getWhatsNewSectionContent = () => readJsonFile<WhatsNewSectionContent>('whats-new-sections.json', { comingSoonItems: [], joinTeamParagraphs: [] });
export const writeWhatsNewSectionContent = (data: WhatsNewSectionContent) => writeJsonFile('whats-new-sections.json', data);


// Metadata for Excel files
export const getExcelMetadata = () => readJsonFile<ExcelMetadata>('excel-metadata.json', {});
export const writeExcelMetadata = (data: ExcelMetadata) => writeJsonFile('excel-metadata.json', data);
