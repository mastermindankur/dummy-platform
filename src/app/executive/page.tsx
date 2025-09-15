
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

  // For this example, we'll use the "Building Reliable Products" pillar
  // as the first Outcome for the Value Map.
  const reliableProductsPillar = pillars.find(p => p.id === 'building-reliable-products');
  
  const outcomes = reliableProductsPillar ? [{
      id: reliableProductsPillar.id,
      name: reliableProductsPillar.name,
      description: reliableProductsPillar.description,
      drivers: reliableProductsPillar.subItems.map(si => ({
          id: si.id,
          name: si.name,
          status: si.status,
          levers: [
            // Placeholder Levers
            { id: `${si.id}-lever-1`, name: `Tool Adoption for ${si.name}`, status: 'Green' },
            { id: `${si.id}-lever-2`, name: `Training & Enablement`, status: 'Amber' },
          ]
      }))
  }] : [];

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
            <ValueMap outcomes={outcomes} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
