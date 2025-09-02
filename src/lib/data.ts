
import {
  TrendingUp,
  ShieldCheck,
  Scaling,
  Cpu,
  Landmark,
} from "lucide-react";
import type { Pillar, Status, SubItem, ExcelData, MonthlyExcelData } from "@/types";
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

    // Attach total participants for tech sphere sessions
    const techSessionsData = await readExcelData('tech-sphere-sessions');
    if (techSessionsData && techSessionsData.rows.length > 0) {
      const totalParticipants = techSessionsData.rows.reduce((sum, row) => sum + (Number(row['Participation']) || 0), 0);
      jsonData = jsonData.map(pillar => {
        if (pillar.id === 'adopting-emerging-technologies') {
          pillar.subItems = pillar.subItems.map(subItem => {
            if (subItem.id === 'tech-sphere-sessions') {
              return { ...subItem, totalParticipants };
            }
            return subItem;
          });
        }
        return pillar;
      });
    }

    // Attach total participants and session count for ARC trainings
    const arcTrainingsData = await readExcelData('arc-trainings');
    if (arcTrainingsData && arcTrainingsData.rows.length > 0) {
        const totalParticipants = arcTrainingsData.rows.reduce((sum, row) => sum + (Number(row['Participation']) || 0), 0);
        const sessionsCount = arcTrainingsData.rows.length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'making-design-resilient') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'arc-trainings') {
                        return { ...subItem, totalParticipants, percentageComplete: sessionsCount };
                    }
                    return subItem;
                });
            }
            return pillar;
        });
    }

    // Attach App Sherpas count
    const appSherpasData = await readExcelData('app-sherpas');
    if (appSherpasData && appSherpasData.rows.length > 0) {
        const sherpasCount = appSherpasData.rows.length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'making-design-resilient') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'app-sherpas') {
                        return { ...subItem, percentageComplete: sherpasCount };
                    }
                    return subItem;
                });
            }
            return pillar;
        });
    }
    
    // Attach completed assessment count for Explore Resiliency Program
    const resiliencyData = await readExcelData('explore-resiliency-program');
    if (resiliencyData && resiliencyData.rows.length > 0) {
        const completedAssessments = resiliencyData.rows.filter(row => row['Status'] === 'Assessment Completed').length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'adopting-emerging-technologies') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'explore-resiliency-program') {
                        return { ...subItem, percentageComplete: completedAssessments };
                    }
                    return subItem;
                })
            }
            return pillar;
        });
    }

    // Attach published blogs count for DTI Tech Blogs
    const blogsData = await readExcelData('dti-tech-blogs');
    if (blogsData && blogsData.rows.length > 0) {
        const publishedBlogs = blogsData.rows.length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'adopting-emerging-technologies') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'blogs-open-source') {
                        return { ...subItem, percentageComplete: publishedBlogs };
                    }
                    return subItem;
                })
            }
            return pillar;
        });
    }

    // Attach hackathons count
    const hackathonsData = await readExcelData('hackathons');
    if (hackathonsData && hackathonsData.rows.length > 0) {
        const hackathonsCount = hackathonsData.rows.length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'adopting-emerging-technologies') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'hackathons') {
                        return { ...subItem, percentageComplete: hackathonsCount };
                    }
                    return subItem;
                })
            }
            return pillar;
        });
    }

     // Attach industry events count
    const industryEventsData = await readExcelData('industry-events');
    if (industryEventsData && industryEventsData.rows.length > 0) {
        const industryEventsCount = industryEventsData.rows.length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'adopting-emerging-technologies') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'industry-events') {
                        return { ...subItem, percentageComplete: industryEventsCount };
                    }
                    return subItem;
                })
            }
            return pillar;
        });
    }
    
    // Attach SQUAD onboarding count
    const squadData = await readExcelData('squad-onboarding');
    if (squadData && squadData.rows.length > 0) {
        const onboardedCount = squadData.rows.length;
        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'making-design-resilient') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'system-scalability') {
                        return { ...subItem, percentageComplete: onboardedCount };
                    }
                    return subItem;
                })
            }
            return pillar;
        });
    }

    // Attach Jira Assistant Adoption data
    const jiraAdoptionData = await readMonthlyData('jira-assistant-adoption');
    if (jiraAdoptionData && Object.keys(jiraAdoptionData).length > 0) {
        const allRows = Object.values(jiraAdoptionData).flatMap(monthData => monthData.rows);
        const uniqueUsers = new Set(allRows.map(row => row['User ID'])).size;

        jsonData = jsonData.map(pillar => {
            if (pillar.id === 'making-design-resilient') {
                pillar.subItems = pillar.subItems.map(subItem => {
                    if (subItem.id === 'jira-assistant-adoption') {
                        return { ...subItem, percentageComplete: uniqueUsers };
                    }
                    return subItem;
                });
            }
            return pillar;
        });
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
