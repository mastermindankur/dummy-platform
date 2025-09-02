import type { LucideIcon } from "lucide-react";

export type Status = "Green" | "Amber" | "Red";

export type SubItem = {
  id: string;
  name: string;
  status: Status;
  description: string;
};

export type Pillar = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
  subItems: SubItem[];
};
