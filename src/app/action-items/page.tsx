
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
import { Loader2, PenSquare } from "lucide-react";
import type { ActionItem, User, Pillar } from '@/types';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function ActionItemsPage() {
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
        setIsLoading(true);
        try {
            const [itemsRes, usersRes, pillarsRes] = await Promise.all([
                fetch('/api/data?key=action-items'),
                fetch('/api/data?key=users'),
                fetch('/api/data'),
            ]);
            if (itemsRes.ok) setActionItems(await itemsRes.json());
            if (usersRes.ok) setUsers(await usersRes.json());
            if (pillarsRes.ok) setPillars(await pillarsRes.json());
        } catch (error) {
            console.error(error);
            toast({ title: 'Error loading data', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }
    fetchData();
  }, []);

  const getUserName = (email: string) => users.find(u => u.email === email)?.name || email;
  const getPillarName = (pillarId: string) => pillars.find(p => p.id === pillarId)?.name || 'Unknown Pillar';

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Action Items & Status</h1>
            <p className="text-muted-foreground">A read-only view of key action items. To edit, go to the Update Data page.</p>
          </div>
        </div>
        
        <Card>
            <CardHeader>
                <div className="flex justify-between items-center">
                    <CardTitle>Action Log</CardTitle>
                    <Button asChild>
                        <Link href="/update-data">
                            <PenSquare className="mr-2 h-4 w-4" /> Manage Action Items
                        </Link>
                    </Button>
                </div>
                <CardDescription>All tracked action items across all pillars.</CardDescription>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : actionItems.length > 0 ? (
                    <div className="border rounded-lg">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Task</TableHead>
                                    <TableHead>Pillar</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {actionItems.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.task}</TableCell>
                                        <TableCell>{getPillarName(item.pillarId)}</TableCell>
                                        <TableCell>
                                            {item.assignedTo.map(email => (
                                                <Badge key={email} variant="secondary" className="mr-1">{getUserName(email)}</Badge>
                                            ))}
                                        </TableCell>
                                        <TableCell>
                                            <span className={cn(new Date(item.dueDate) < new Date() && item.status !== 'Completed' && 'text-destructive')}>
                                                {format(new Date(item.dueDate), "PPP")}
                                                {item.originalDueDate && <s className="text-muted-foreground ml-2">{format(new Date(item.originalDueDate), "PPP")}</s>}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={item.status === 'Completed' ? 'default' : item.status === 'Delayed' ? 'destructive' : 'secondary'}>
                                                {item.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                        <p>No action items created yet. Go to the "Update Data" page to add one.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
