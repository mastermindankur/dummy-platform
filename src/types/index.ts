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
};

export type Pillar = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  subItems: SubItem[];
};
