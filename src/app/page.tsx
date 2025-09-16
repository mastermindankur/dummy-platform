
import { Header } from "@/components/layout/header";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight, ListChecks, Map } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="max-w-4xl w-full">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight">WCE 2025 Program</h1>
                <p className="text-lg text-muted-foreground mt-2">Your central hub for tracking progress, value, and actions.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Link href="/executive">
              <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                   <div className="flex justify-center mb-4">
                        <Map className="h-12 w-12 text-accent" />
                   </div>
                  <CardTitle>Explore Value Map</CardTitle>
                  <CardDescription className="text-sm">
                    Visualise the linkage from levers to drivers to strategic outcomes on the dashboard.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/dashboard">
              <Card className="h-full hover:border-primary hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <ListChecks className="h-12 w-12 text-accent" />
                    </div>
                  <CardTitle>WCE YTD Progress</CardTitle>
                  <CardDescription className="text-sm">
                    Dive into the detailed health and status of all pillars.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
            
            <Card className="h-full flex flex-col justify-between bg-card/50 text-muted-foreground border-dashed">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <ArrowRight className="h-12 w-12 text-muted-foreground/50" />
                    </div>
                    <CardTitle className="text-card-foreground/60">Action Items & Status</CardTitle>
                    <CardDescription className="text-sm">
                        Track key actions and their completion status.
                    </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center">
                     <Badge variant="outline">Coming Soon</Badge>
                </CardFooter>
            </Card>

            </div>
        </div>
      </main>
    </div>
  );
}
