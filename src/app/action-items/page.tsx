
'use client';

import { Header } from "@/components/layout/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function ActionItemsPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Action Items & Status</CardTitle>
            <CardDescription>
              This section will track key action items and their completion status.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                <p>Coming Soon!</p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
