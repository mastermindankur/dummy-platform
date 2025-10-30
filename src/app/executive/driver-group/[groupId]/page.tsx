
'use client';

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { ValueMap } from "@/components/dashboard/value-map";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValueMapData, DriverLeverConnection, OutcomeDriverConnection, ValueMapDriver, ValueMapOutcome, ValueMapLever } from "@/types";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { format } from "date-fns";

export default function DriverGroupPage() {
  const [valueMapData, setValueMapData] = useState<ValueMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredData, setFilteredData] = useState<ValueMapData | null>(null);
  const [groupName, setGroupName] = useState<string>('');
  const [formattedVersionName, setFormattedVersionName] = useState<string>('');

  const params = useParams();
  const searchParams = useSearchParams();
  const groupId = params.groupId as string;
  const version = searchParams.get('version');

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/data?key=value-map&version=${version || 'latest'}`);
        const data = await res.json();
        setValueMapData(data);
      } catch (error) {
        console.error("Failed to fetch value map data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [version]);

  useEffect(() => {
    if (valueMapData && groupId) {
      const currentDriverGroup = valueMapData.driverGroups?.find(g => g.id === groupId);
      if (!currentDriverGroup) {
        // Or handle as a 'not found' case
        return;
      }
      setGroupName(currentDriverGroup.name);

      const groupDrivers = valueMapData.drivers.filter(d => d.groupId === groupId);
      const groupDriverIds = new Set(groupDrivers.map(d => d.id));

      const allDriverLeverConnections: DriverLeverConnection[] = valueMapData.drivers.flatMap(d =>
        (d.connectedLeverIds || []).map(leverId => ({ driverId: d.id, leverId }))
      );
      
      const allOutcomeDriverConnections: OutcomeDriverConnection[] = valueMapData.outcomes.flatMap(o =>
        (o.connectedDriverIds || []).map(driverId => ({ outcomeId: o.id, driverId }))
      );

      const filteredDriverLeverConnections = allDriverLeverConnections.filter(c => groupDriverIds.has(c.driverId));
      const connectedLeverIds = new Set(filteredDriverLeverConnections.map(c => c.leverId));
      const groupLevers = valueMapData.levers.filter(l => connectedLeverIds.has(l.id));

      const filteredOutcomeDriverConnections = allOutcomeDriverConnections.filter(c => groupDriverIds.has(c.driverId));
      const connectedOutcomeIds = new Set(filteredOutcomeDriverConnections.map(c => c.outcomeId));
      const groupOutcomes = valueMapData.outcomes.filter(o => connectedOutcomeIds.has(o.id));
      
      const groupOutcomeGroupIds = new Set(groupOutcomes.map(o => o.groupId).filter(Boolean));
      const relevantOutcomeGroups = (valueMapData.outcomeGroups || []).filter(g => groupOutcomeGroupIds.has(g.id));

      setFilteredData({
          outcomes: groupOutcomes,
          drivers: groupDrivers,
          levers: groupLevers,
          outcomeGroups: relevantOutcomeGroups, 
          driverGroups: [currentDriverGroup],
          outcomeDriverConnections: filteredOutcomeDriverConnections,
          driverLeverConnections: filteredDriverLeverConnections,
      });
    }
     if (version) {
        try {
            setFormattedVersionName(format(new Date(version.replace('.json', '')), "MMM d, yyyy h:mm a"));
        } catch (e) {
            setFormattedVersionName(version);
        }
    }
  }, [valueMapData, groupId, version]);

  if (isLoading) {
    return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8">
                <Skeleton className="h-96 w-full" />
            </main>
        </div>
    );
  }

  if (!filteredData) {
      // This can be a notFound() call in a real app after confirming data structure
      return (
        <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 p-4 md:p-8 text-center">
                <p>Driver group not found or data is loading...</p>
            </main>
        </div>
      );
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href={`/executive${version ? `?version=${version}` : ''}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Full Value Map
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <CardTitle className="text-3xl">Driver: {groupName}</CardTitle>
                </div>
                {version && (
                    <div className="text-right">
                        <CardDescription>
                            Version: {formattedVersionName}
                        </CardDescription>
                    </div>
                )}
            </div>
          </CardHeader>
          <CardContent>
            <ValueMap 
              outcomes={filteredData.outcomes}
              drivers={filteredData.drivers}
              levers={filteredData.levers}
              outcomeGroups={filteredData.outcomeGroups || []}
              driverGroups={filteredData.driverGroups || []}
              outcomeDriverConnections={filteredData.outcomeDriverConnections || []}
              driverLeverConnections={filteredData.driverLeverConnections || []}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
