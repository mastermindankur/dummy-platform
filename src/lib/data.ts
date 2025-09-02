
import {
  TrendingUp,
  ShieldCheck,
  Scaling,
  Cpu,
  Landmark,
} from "lucide-react";
import type { Pillar, Status, SubItem, ExcelData } from "@/types";
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

export function getPillarStatus(pillar: Pillar): Status {
  if (!pillar || !pillar.subItems) return "Red";

  const statuses = pillar.subItems.map((item: SubItem) => item.status);
  if (statuses.includes("Red")) return "Red";
  if (statuses.includes("Amber")) return "Amber";
  return "Green";
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
        return JSON.parse(fileContent);
    } catch (error) {
        // It's okay if the file doesn't exist, it just means no data has been uploaded yet.
        if (error instanceof Error && (error as NodeJS.ErrnoException).code === 'ENOENT') {
            try {
                // If the file doesn't exist, create it with empty data
                await fs.writeFile(dataFilePath(`${fileKey}.json`), JSON.stringify({ headers: [], rows: [] }, null, 2), 'utf-8');
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


export async function writeExcelData(fileKey: string, data: ExcelData) {
    try {
        await fs.writeFile(dataFilePath(`${fileKey}.json`), JSON.stringify(data, null, 2), 'utf-8');
    } catch (error) {
        console.error(`Could not write to ${fileKey}.json:`, error);
        throw new Error(`Failed to save ${fileKey} data.`);
    }
}
