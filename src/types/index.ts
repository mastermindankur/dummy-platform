

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

export type MappingRule = {
    id: number;
    ifColumn: string;
    ifValue: string[];
    thenColumn: string;
    thenValue: string;
};

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
    isNew?: boolean;
    isRetired?: boolean;
    groupId?: string;
};

export type ValueMapOutcome = ValueMapItem & {
    connectedDriverIds: string[];
    metric?: string;
    metricUnit?: string;
    metricDescription?: string;
    impactCategory?: ImpactCategory;
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

export type ValueMapGroup = {
    id: string;
    name: string;
};

export type ValueMapData = {
    outcomes: ValueMapOutcome[];
    drivers: ValueMapDriver[];
    levers: ValueMapLever[];
    outcomeGroups?: ValueMapGroup[];
    driverGroups?: ValueMapGroup[];
};

// Events for Action Items
export type MeetingEvent = {
    id: string;
    name: string;
    date: string;
};

// Action Items & Users
export type User = {
    name: string;
    email: string;
    lobt: string;
};

export type ActionItem = {
    id: string;
    task: string;
    assignedTo: string[]; // array of user emails
    dueDate: string;
    originalDueDate?: string;
    status: 'Backlog' | 'In progress' | 'Completed' | 'Deferred' | 'Delayed';
    pillarId: string;
    eventId?: string; // Optional event ID
    createdAt: string;
};

export type ExcelMetadata = {
    [key: string]: string; // key is the fileKey, value is the ISO date string
};

// Impact Initiatives
export type ImpactCategory = 'productivity' | 'quality' | 'engagement' | 'financial' | 'customer';

export type ImpactInitiative = {
  id: string;
  category: ImpactCategory;
  name: string;
  description: string;
  metric: string;
  metricUnit: string;
  icon: 'zap' | 'shieldCheck' | 'users' | 'dollarSign' | 'smile';
};

// What's New
export type WhatsNewEntry = {
    id: string;
    date: string;
    title: string;
    items: string[];
};

export type WhatsNewSectionContent = {
    comingSoonItems: string[];
    joinTeamParagraphs: string[];
};
