
'use client';

import { useState, useEffect } from 'react';
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
import { ArrowLeft, Plus } from "lucide-react";
import type { ActionItem } from '@/types';


export default function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch action items in the future
    setIsLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Action Items & Status</h1>
            <p className="text-muted-foreground">Track key action items and their completion status.</p>
          </div>
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
        
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Action Log</CardTitle>
                    <Button><Plus className="mr-2 h-4 w-4" /> Create Action Item</Button>
                </div>
                <CardDescription>All tracked action items across all pillars.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                    <p>Coming Soon: Action items will be displayed here.</p>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
