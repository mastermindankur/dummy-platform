
'use client';
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { getValueMapData } from "@/lib/data";
import { ValueMap } from "@/components/dashboard/value-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ValueMapData, DriverLeverConnection, OutcomeDriverConnection } from "@/types";

export default function ExecutivePage() {
  const [valueMapData, setValueMapData] = useState<ValueMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const res = await fetch('/api/data?key=value-map');
        const data = await res.json();
        setValueMapData(data);
      } catch (error) {
        console.error("Failed to fetch value map data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  const { outcomes, drivers, levers, outcomeDriverConnections, driverLeverConnections } = {
    outcomes: valueMapData?.outcomes || [],
    drivers: valueMapData?.drivers || [],
    levers: valueMapData?.levers || [],
    outcomeDriverConnections: valueMapData?.outcomes.flatMap(o => 
        (o.connectedDriverIds || []).map(driverId => ({ outcomeId: o.id, driverId }))
    ) || [],
    driverLeverConnections: valueMapData?.drivers.flatMap(d => 
        (d.connectedLeverIds || []).map(leverId => ({ driverId: d.id, leverId }))
    ) || [],
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Executive Value Map</CardTitle>
            <CardDescription>
              Connecting strategic outcomes to the drivers and levers that enable them.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
                <ValueMap 
                  outcomes={outcomes}
                  drivers={drivers}
                  levers={levers}
                  outcomeDriverConnections={outcomeDriverConnections}
                  driverLeverConnections={driverLeverConnections}
                />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
