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

type Props = {
  item: SubItem;
  pillarName: string;
};

export function SubItemCard({ item, pillarName }: Props) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-lg">{item.name}</CardTitle>
        <CardDescription className="text-xs line-clamp-2 h-8">{item.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">YTD Progress</span>
            <span className="text-sm font-bold">{item.percentageComplete}%</span>
        </div>
        <Progress value={item.percentageComplete} className="h-2" />
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <StatusIndicator status={item.status} />
        {item.status !== "Green" && (
            <Suspense fallback={<Skeleton className="h-8 w-36" />}>
                <RootCauseAnalysis subItem={item} pillarName={pillarName} />
            </Suspense>
        )}
      </CardFooter>
    </Card>
  );
}
