
'use client';
import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
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
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

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

  const outcomes = valueMapData?.outcomes || [];
  const drivers = valueMapData?.drivers || [];
  const levers = valueMapData?.levers || [];
  const outcomeGroups = valueMapData?.outcomeGroups || [];
  const driverGroups = valueMapData?.driverGroups || [];


  const outcomeDriverConnections: OutcomeDriverConnection[] = outcomes.flatMap(o =>
    (o.connectedDriverIds || []).map(driverId => ({ outcomeId: o.id, driverId }))
  );

  const driverLeverConnections: DriverLeverConnection[] = drivers.flatMap(d =>
    (d.connectedLeverIds || []).map(leverId => ({ driverId: d.id, leverId }))
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle className="text-3xl">Executive Value Map</CardTitle>
                    <CardDescription>
                      Connecting strategic outcomes to the drivers and levers that enable them.
                    </CardDescription>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="icon">
                            <HelpCircle className="h-4 w-4" />
                            <span className="sr-only">How to read the value map</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>How to Read Our Value Map</DialogTitle>
                            <DialogDescription asChild>
                                <div>
                                    <p className="mb-2 mt-4">
                                    Our Value Map is read from right to left – starting with the Outcomes we want to achieve, then looking at the Drivers that influence those outcomes, and finally the Levers we can pull to make it happen.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1">
                                    <li><span className="font-semibold">Outcomes:</span> What success looks like.</li>
                                    <li><span className="font-semibold">Drivers:</span> What makes success possible.</li>
                                    <li><span className="font-semibold">Levers:</span> The actions we can take.</li>
                                    </ul>
                                </div>
                            </DialogDescription>
                        </DialogHeader>
                    </DialogContent>
                </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : (
                <div className="space-y-6">
                    <ValueMap 
                      outcomes={outcomes}
                      drivers={drivers}
                      levers={levers}
                      outcomeGroups={outcomeGroups}
                      driverGroups={driverGroups}
                      outcomeDriverConnections={outcomeDriverConnections}
                      driverLeverConnections={driverLeverConnections}
                    />
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
