
import type { LucideIcon } from "lucide-react";

export type Status = "Green" | "Amber" | "Red";

export type Trend = "up" | "down" | "flat";

export type SubItem = {
  id: string;
  name: string;
  status: Status;
  description: string;
  trend: Trend;
  owner: string;
  lastUpdate: string;
  comments: string;
  percentageComplete: number;
  annualTarget: number;
  metricName: string;
  metricUnit: string;
  totalParticipants?: number;
};

export type Pillar = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  subItems: SubItem[];
};

export type ExcelRow = Record<string, any>;

export type ExcelData = {
  headers: string[];
  rows: ExcelRow[];
};
