
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { IndustryEvent } from '@/types';
import { Loader2, Plus, Trash2, Calendar, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

export default function IndustryEventsPage() {
  const [events, setEvents] = useState<IndustryEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New Event form state
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data?key=industry-events');
      if (!res.ok) throw new Error('Failed to fetch events');
      const jsonData = await res.json();
      setEvents(jsonData);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not load industry event data.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEvent = () => {
    if (newName && newDate && newLocation && newDescription) {
      const newEvent: IndustryEvent = {
        id: `event-${Date.now()}`,
        name: newName,
        date: newDate,
        location: newLocation,
        description: newDescription,
      };
      setEvents([...events, newEvent]);
      setNewName('');
      setNewDate('');
      setNewLocation('');
      setNewDescription('');
    } else {
      toast({
        title: 'Missing information',
        description: 'Please fill out all fields for the new event.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        excelData: {
          'industry-events': events,
        },
      };

      const res = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save events');

      toast({
        title: 'Success',
        description: 'Industry event data has been updated.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Could not save industry event data.',
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
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">Manage Industry Events</h1>
                <p className="text-muted-foreground">Add, edit, and track all industry events.</p>
            </div>
            <Button onClick={handleSave} disabled={isSaving || isLoading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Industry Event</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="event-name">Event Name</Label>
                            <Input id="event-name" placeholder="e.g., Tech Conference 2025" value={newName} onChange={(e) => setNewName(e.target.value)} />
                        </div>
                        <div>
                           <Label htmlFor="event-location">Location</Label>
                           <Input id="event-location" placeholder="e.g., San Francisco, CA" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="event-date">Date</Label>
                            <Input id="event-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} />
                        </div>
                         <div className="md:col-span-1">
                            <Label htmlFor="event-description">Description</Label>
                            <Textarea id="event-description" placeholder="A brief description of the event." value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleAddEvent}>
                        <Plus className="mr-2 h-4 w-4" /> Add Event
                    </Button>
                </CardFooter>
            </Card>
            
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Current Events ({events.length})</h2>
                {events.length > 0 ? (
                    events.map((event) => (
                        <Card key={event.id} className="relative">
                           <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4"
                                onClick={() => handleRemoveEvent(event.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardHeader>
                                <CardTitle>{event.name}</CardTitle>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>{new Date(event.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4" />
                                        <span>{event.location}</span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                               <p className="text-muted-foreground">{event.description}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                        <p>No industry events have been added yet.</p>
                    </div>
                )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
