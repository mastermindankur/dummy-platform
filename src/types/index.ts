
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
  dataKey?: string; // Stable key for data connections
};

export type Pillar = {
  id:string;
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

export type MonthlyExcelData = {
  [month: string]: ExcelData;
}

export type HackathonTeam = {
  id: string;
  name: string;
  data: ExcelRow;
};

export type HackathonWinner = {
  teamId: string;
  rank: 1 | 2 | 3;
};

export type Hackathon = {
  id: string;
  name: string;
  startMonth: string;
  endMonth: string;
  participants: number;
  teams: HackathonTeam[];
  winners: HackathonWinner[];
  teamDataHeaders?: string[];
};

export type IndustryEvent = {
    id: string;
    name: string;
    startDate: string;
    endDate?: string;
    location: string;
    description: string;
    type: 'internal' | 'external';
};

// Value Map Types
export type ValueMapItem = {
    id: string;
    name: string;
    description: string;
    status?: Status;
    isWceBookOfWork?: boolean;
};

export type ValueMapOutcome = ValueMapItem & {
    connectedDriverIds: string[];
};
export type ValueMapDriver = ValueMapItem & {
    connectedLeverIds: string[];
};
export type ValueMapLever = ValueMapItem;


export type OutcomeDriverConnection = {
    outcomeId: string;
    driverId: string;
};

export type DriverLeverConnection = {
    driverId: string;
    leverId: string;
};

export type ValueMapData = {
    outcomes: ValueMapOutcome[];
    drivers: ValueMapDriver[];
    levers: ValueMapLever[];
};
