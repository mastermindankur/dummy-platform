
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { Hackathon, HackathonTeam, HackathonWinner } from '@/types';
import { Loader2, Plus, Trash2, Upload, Trophy, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { processExcelFile } from '@/lib/excel-utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

function TeamUploader({ hackathon, onTeamsUpload }: { hackathon: Hackathon, onTeamsUpload: (hackathonId: string, teams: HackathonTeam[]) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            setFile(files[0]);
        }
    };

    const handleFileUpload = async () => {
        if (!file) return;
        setIsLoading(true);
        try {
            const fileAsDataUri = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = (error) => reject(error);
            });
            const result = await processExcelFile(fileAsDataUri);
            
            if (result.headers.length === 0 || !result.headers.includes('Team Name')) {
                 toast({
                    title: 'Invalid Excel Format',
                    description: 'Excel file must contain a "Team Name" column.',
                    variant: 'destructive',
                });
                setIsLoading(false);
                return;
            }

            const teams: HackathonTeam[] = result.rows.map((row, index) => ({
                id: `team-${hackathon.id}-${index}`,
                name: row['Team Name'],
            }));
            
            onTeamsUpload(hackathon.id, teams);
            toast({
                title: `Teams uploaded for ${hackathon.name}`,
                description: 'Remember to save all changes.',
            });

        } catch (error) {
            console.error(error);
            toast({
                title: 'Error processing file',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="space-y-4">
            <h4 className="font-medium">Upload Teams</h4>
            <div className="flex gap-2">
              <Input
                id={`excel-upload-${hackathon.id}`}
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="flex-grow"
              />
              <Button onClick={handleFileUpload} disabled={isLoading || !file}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Upload
              </Button>
            </div>
        </div>
    )
}

function WinnerSelector({ hackathon, onWinnerChange }: { hackathon: Hackathon, onWinnerChange: (hackathonId: string, winners: HackathonWinner[]) => void }) {
    
    const handleSelect = (rank: 1 | 2 | 3, teamId: string) => {
        const otherWinners = hackathon.winners.filter(w => w.rank !== rank);
        const newWinner: HackathonWinner = { teamId, rank };
        onWinnerChange(hackathon.id, [...otherWinners, newWinner]);
    };

    const getWinnerId = (rank: 1 | 2 | 3) => {
        return hackathon.winners.find(w => w.rank === rank)?.teamId || '';
    };

    if (!hackathon.teams || hackathon.teams.length === 0) {
        return <p className="text-sm text-muted-foreground">Upload teams to select winners.</p>
    }

    return (
        <div className="space-y-4">
            <h4 className="font-medium">Select Winners</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(['First Place', 'Second Place', 'Third Place'] as const).map((place, index) => {
                    const rank = (index + 1) as (1 | 2 | 3);
                    return (
                        <div key={rank} className="space-y-2">
                             <Label>{place}</Label>
                             <Select onValueChange={(teamId) => handleSelect(rank, teamId)} value={getWinnerId(rank)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a team" />
                                </SelectTrigger>
                                <SelectContent>
                                    {hackathon.teams.map(team => (
                                        <SelectItem key={team.id} value={team.id}>
                                            {team.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                             </Select>
                        </div>
                    );
                })}
            </div>
        </div>
    )
}


export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // New Hackathon form state
  const [newName, setNewName] = useState('');
  const [newStartMonth, setNewStartMonth] = useState('');
  const [newEndMonth, setNewEndMonth] = useState('');
  const [newParticipants, setNewParticipants] = useState(0);

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
    if (newName && newStartMonth && newEndMonth && newParticipants > 0) {
      const newHackathon: Hackathon = {
        id: `hackathon-${Date.now()}`,
        name: newName,
        startMonth: newStartMonth,
        endMonth: newEndMonth,
        participants: newParticipants,
        teams: [],
        winners: []
      };
      setHackathons([...hackathons, newHackathon]);
      setNewName('');
      setNewStartMonth('');
      setNewEndMonth('');
      setNewParticipants(0);
    } else {
      toast({
        title: 'Missing information',
        description: 'Please fill out all fields for the new hackathon.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveHackathon = (id: string) => {
    setHackathons(hackathons.filter((h) => h.id !== id));
  };
  
  const handleTeamsUpload = (hackathonId: string, teams: HackathonTeam[]) => {
      setHackathons(hackathons.map(h => h.id === hackathonId ? {...h, teams} : h));
  };

  const handleWinnerChange = (hackathonId: string, winners: HackathonWinner[]) => {
      setHackathons(hackathons.map(h => h.id === hackathonId ? {...h, winners} : h));
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
  
  const getTeamName = (teamId: string) => {
      for (const h of hackathons) {
          const team = (h.teams || []).find(t => t.id === teamId);
          if (team) return team.name;
      }
      return 'Unknown Team';
  }


  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h1 className="text-3xl font-bold">Manage Hackathons</h1>
                <p className="text-muted-foreground">Add, edit, and track all company hackathons.</p>
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
                    <CardTitle>Add New Hackathon</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="hackathon-name">Hackathon Name</Label>
                            <Input id="hackathon-name" placeholder="e.g., Q3 Innovation Challenge" value={newName} onChange={(e) => setNewName(e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="participants">No. of Participants</Label>
                            <Input id="participants" type="number" placeholder="e.g., 150" value={newParticipants} onChange={(e) => setNewParticipants(Number(e.target.value))} />
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="start-month">Start Month</Label>
                            <Input id="start-month" type="month" value={newStartMonth} onChange={(e) => setNewStartMonth(e.target.value)} />
                        </div>
                         <div>
                            <Label htmlFor="end-month">End Month</Label>
                            <Input id="end-month" type="month" value={newEndMonth} onChange={(e) => setNewEndMonth(e.target.value)} />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                     <Button onClick={handleAddHackathon}>
                        <Plus className="mr-2 h-4 w-4" /> Add Hackathon
                    </Button>
                </CardFooter>
            </Card>

            <Separator />
            
            <div className="space-y-6">
                <h2 className="text-2xl font-bold">Current Hackathons ({hackathons.length})</h2>
                {hackathons.length > 0 ? (
                    hackathons.map((hackathon) => (
                        <Card key={hackathon.id} className="relative">
                           <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-4 right-4"
                                onClick={() => handleRemoveHackathon(hackathon.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <CardHeader>
                                <CardTitle>{hackathon.name}</CardTitle>
                                <CardDescription>
                                    {hackathon.startMonth} to {hackathon.endMonth}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                               <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Users className="h-4 w-4" />
                                    <span>{hackathon.participants} Participants</span>
                               </div>

                                <Separator />
                                <TeamUploader hackathon={hackathon} onTeamsUpload={handleTeamsUpload} />
                                
                                {hackathon.teams && hackathon.teams.length > 0 && (
                                   <div className="border rounded-md">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Team Name</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {hackathon.teams.map(team => (
                                                    <TableRow key={team.id}>
                                                        <TableCell>{team.name}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                   </div>
                                )}
                                
                                <Separator />
                                <WinnerSelector hackathon={hackathon} onWinnerChange={handleWinnerChange} />

                                {hackathon.winners && hackathon.winners.length > 0 && (
                                     <div className="border rounded-md p-4">
                                         <h4 className="font-medium mb-2">Winning Teams</h4>
                                         <ul className="space-y-1">
                                            {hackathon.winners.sort((a,b) => a.rank - b.rank).map(winner => (
                                                <li key={winner.rank} className="flex items-center gap-2">
                                                    <Trophy className={`h-5 w-5 ${winner.rank === 1 ? 'text-yellow-500' : winner.rank === 2 ? 'text-gray-400' : 'text-yellow-700'}`} />
                                                    <span className="font-semibold">{winner.rank}.</span>
                                                    <span>{getTeamName(winner.teamId)}</span>
                                                </li>
                                            ))}
                                         </ul>
                                     </div>
                                )}


                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center text-muted-foreground p-8 border-dashed border-2 rounded-md">
                        <p>No hackathons have been added yet.</p>
                    </div>
                )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
