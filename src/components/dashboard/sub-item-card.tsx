
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
import { Suspense } from "react";
import { Skeleton } from "../ui/skeleton";
import { RootCauseAnalysis } from "./root-cause-analysis";
import Link from "next/link";
import { Button } from "../ui/button";
import { ArrowRight } from "lucide-react";

type Props = {
  item: SubItem;
  pillarName: string;
};

export function SubItemCard({ item, pillarName }: Props) {
  const isExploreResiliency = item.id === "explore-resiliency-program";
  const isBlogsOpenSource = item.id === "blogs-open-source";
  const isTechSphere = item.id === "tech-sphere-sessions";

  const progressValue = item.annualTarget > 0 ? (item.percentageComplete / item.annualTarget) * 100 : 0;

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
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <StatusIndicator status={item.status} />
        <div className="flex items-center gap-2">
          {item.status !== "Green" && !isExploreResiliency && !isBlogsOpenSource && !isTechSphere && (
              <Suspense fallback={<Skeleton className="h-8 w-36" />}>
                  <RootCauseAnalysis subItem={item} pillarName={pillarName} />
              </Suspense>
          )}
          {isExploreResiliency && (
             <Button asChild variant="outline" size="sm">
                <Link href="/pillar/adopting-emerging-technologies/explore-resiliency-program">
                    View Details
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
             </Button>
          )}
          {isBlogsOpenSource && (
            <Button asChild variant="outline" size="sm">
              <Link href="/pillar/adopting-emerging-technologies/blogs-and-open-source">
                View Details
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
           {isTechSphere && (
            <Button asChild variant="outline" size="sm">
              <Link href="/pillar/adopting-emerging-technologies/tech-sphere-sessions">
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
