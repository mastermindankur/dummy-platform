
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Hackathon } from '@/types';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data?key=hackathons');
      if (!res.ok) throw new Error('Failed to fetch hackathons');
      const jsonData = await res.json();
      setHackathons(jsonData);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not load hackathon data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddHackathon = () => {
    if (newName && newDate) {
      const newHackathon: Hackathon = {
        id: `hackathon-${Date.now()}`,
        name: newName,
        date: newDate,
      };
      setHackathons([...hackathons, newHackathon]);
      setNewName('');
      setNewDate('');
    } else {
      toast({
        title: 'Missing information',
        description: 'Please provide both a name and a date.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveHackathon = (id: string) => {
    setHackathons(hackathons.filter((h) => h.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        excelData: {
          hackathons: hackathons,
        },
      };

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save hackathons');

      toast({
        title: 'Success',
        description: 'Hackathon data has been updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not save hackathon data.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <Card className="max-w-4xl mx-auto">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle className="text-3xl">Manage Hackathons</CardTitle>
                <CardDescription>Add, remove, and view all hackathons.</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex gap-2">
                    <Skeleton className="h-10 flex-grow" />
                    <Skeleton className="h-10 w-24" />
                </div>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                    <h3 className="text-lg font-medium">Add New Hackathon</h3>
                     <div className="flex flex-col md:flex-row gap-2">
                        <Input
                        placeholder="Hackathon Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        />
                        <Input
                        type="date"
                        value={newDate}
                        onChange={(e) => setNewDate(e.target.value)}
                        />
                        <Button onClick={handleAddHackathon} className="w-full md:w-auto">
                        <Plus className="mr-2 h-4 w-4" /> Add
                        </Button>
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-medium">Current Hackathons ({hackathons.length})</h3>
                    <div className="border rounded-md">
                    {hackathons.length > 0 ? (
                    hackathons.map((hackathon) => (
                        <div
                        key={hackathon.id}
                        className="flex items-center justify-between p-3 border-b last:border-b-0"
                        >
                        <div>
                            <p className="font-medium">{hackathon.name}</p>
                            <p className="text-sm text-muted-foreground">{hackathon.date}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveHackathon(hackathon.id)}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                        </div>
                    ))
                    ) : (
                    <p className="text-sm text-muted-foreground text-center p-8">
                        No hackathons have been added yet.
                    </p>
                    )}
                    </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
