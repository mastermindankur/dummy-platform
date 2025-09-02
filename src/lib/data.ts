import {
  TrendingUp,
  ShieldCheck,
  Scaling,
  Cpu,
  Landmark,
} from "lucide-react";
import type { Pillar, Status, SubItem } from "@/types";
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

const dataFilePath = path.join(process.cwd(), 'src', 'lib', 'data.json');

async function readData(): Promise<Pillar[]> {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    const jsonData: Pillar[] = JSON.parse(fileContent);
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
        // We need to remove the icon before writing to JSON
        const dataToWrite = data.map(({ icon, ...rest }) => rest);
        await fs.writeFile(dataFilePath, JSON.stringify(dataToWrite, null, 2), 'utf-8');
    } catch (error) {
        console.error("Could not write to data.json:", error);
        throw new Error("Failed to save data.");
    }
}
