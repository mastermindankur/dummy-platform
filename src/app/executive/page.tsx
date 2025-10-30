
'use client';
import { useState, useEffect } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
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
import { HelpCircle, CalendarClock, ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function ExecutivePage() {
  const [valueMapData, setValueMapData] = useState<ValueMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [versions, setVersions] = useState<string[]>([]);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const selectedVersion = searchParams.get('version') || 'latest';


  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [res, versionsRes] = await Promise.all([
          fetch(`/api/data?key=value-map&version=${selectedVersion}`),
          fetch('/api/data?key=value-map-versions')
        ]);
        
        if (res.ok) {
            const data = await res.json();
            setValueMapData(data);
        } else {
            console.error("Failed to fetch value map data", await res.text());
            setValueMapData(null);
        }

        if (versionsRes.ok) {
            const versionsData = await versionsRes.json();
            setVersions(versionsData.versions);
             if (selectedVersion === 'latest' && versionsData.latest) {
                // To display the actual date of the latest version
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set('version', versionsData.latest);
                // Using replace to not add to history
                router.replace(`${pathname}?${newSearchParams.toString()}`, { scroll: false });
            }
        }

      } catch (error) {
        console.error("Failed to fetch value map data", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [selectedVersion, router, pathname, searchParams]);

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
  
  const handleVersionChange = (version: string) => {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('version', version);
      router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const formatVersionName = (version: string) => {
    return format(new Date(version.replace('.json', '')), "MMM d, yyyy h:mm a");
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                    <CardTitle className="text-3xl">Executive Value Map</CardTitle>
                    <CardDescription>
                      Connecting strategic outcomes to the drivers and levers that enable them.
                    </CardDescription>
                </div>
                 <div className="flex flex-wrap items-center gap-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-[280px] justify-between">
                          <span>{selectedVersion === 'latest' ? 'Loading latest...' : `Version: ${formatVersionName(selectedVersion)}`}</span>
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[280px]">
                        {versions.map(v => (
                          <DropdownMenuItem key={v} onSelect={() => handleVersionChange(v)}>
                            {formatVersionName(v)}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

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
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
                <div className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-24 w-full" />
                </div>
            ) : valueMapData ? (
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
            ) : (
                 <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                    <p>Could not load Value Map data for the selected version.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
