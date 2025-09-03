
import type { SubItem } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { StatusIndicator } from "./status-indicator";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

type Props = {
  item: SubItem;
  pillarName: string;
};

// Mapping dataKey to its corresponding details page path
const detailPageLinks: Record<string, string> = {
    "explore-resiliency-program": "/pillar/adopting-emerging-technologies/explore-resiliency-program",
    "blogs-open-source": "/pillar/adopting-emerging-technologies/blogs-and-open-source",
    "tech-sphere-sessions": "/pillar/adopting-emerging-technologies/tech-sphere-sessions",
    "hackathons": "/pillar/adopting-emerging-technologies/hackathons",
    "industry-events": "/pillar/adopting-emerging-technologies/industry-events",
    "squad-onboarding": "/pillar/making-design-resilient/squad-onboarding",
    "arc-trainings": "/pillar/making-design-resilient/arc-trainings",
    "app-sherpas": "/pillar/making-design-resilient/app-sherpas",
    "jira-assistant-adoption": "/pillar/making-design-resilient/jira-assistant-adoption"
};


export function SubItemCard({ item, pillarName }: Props) {
  
  const progressValue = item.annualTarget > 0 ? (item.percentageComplete / item.annualTarget) * 100 : 0;
  const detailPagePath = item.dataKey ? detailPageLinks[item.dataKey] : null;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2 h-8">{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{item.metricName}</span>
            <span className="text-sm font-bold">{item.percentageComplete} / {item.annualTarget} {item.metricUnit}</span>
        </div>
        <Progress value={progressValue} className="h-2" />
        {item.dataKey === 'tech-sphere-sessions' && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">Total Participants</span>
            <span className="text-sm font-bold">{item.totalParticipants}</span>
          </div>
        )}
         {item.dataKey === 'arc-trainings' && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-medium">Total Participants</span>
            <span className="text-sm font-bold">{item.totalParticipants}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <StatusIndicator status={item.status} />
        <div className="flex items-center gap-2">
          {detailPagePath && (
            <Button asChild variant="outline" size="sm">
              <Link href={detailPagePath}>
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
