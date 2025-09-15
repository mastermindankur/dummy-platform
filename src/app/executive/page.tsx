
import { Header } from "@/components/layout/header";
import { getPillars } from "@/lib/data";
import { ValueMap } from "@/components/dashboard/value-map";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ExecutivePage() {
  const pillars = await getPillars();

  const reliableProductsPillar = pillars.find(p => p.id === 'building-reliable-products');
  
  // Flattened data structure for many-to-many relationships
  const outcomes = reliableProductsPillar ? [{
      id: reliableProductsPillar.id,
      name: reliableProductsPillar.name,
      description: reliableProductsPillar.description,
  }] : [];

  const drivers = reliableProductsPillar ? reliableProductsPillar.subItems.map(si => ({
      id: si.id,
      name: si.name,
      status: si.status,
  })) : [];
  
  const levers = reliableProductsPillar ? reliableProductsPillar.subItems.flatMap(si => ([
      { id: `${si.id}-lever-1`, name: `Tool Adoption for ${si.name}`, status: 'Green' },
      { id: `${si.id}-lever-2`, name: `Training & Enablement`, status: 'Amber' },
  ])) : [];

  // Define connections
  const driverLeverConnections = reliableProductsPillar ? reliableProductsPillar.subItems.flatMap(si => ([
      { driverId: si.id, leverId: `${si.id}-lever-1` },
      { driverId: si.id, leverId: `${si.id}-lever-2` },
  ])) : [];

  const outcomeDriverConnections = reliableProductsPillar ? reliableProductsPillar.subItems.map(si => ({
      outcomeId: reliableProductsPillar.id,
      driverId: si.id,
  })) : [];


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
            <ValueMap 
              outcomes={outcomes}
              drivers={drivers}
              levers={levers}
              outcomeDriverConnections={outcomeDriverConnections}
              driverLeverConnections={driverLeverConnections}
            />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
