
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Loader2, Trophy, Users, Swords } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Hackathon } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const fetchHackathonsData = async (): Promise<Hackathon[]> => {
  const res = await fetch('/api/data?key=hackathons');
  if (!res.ok) {
    throw new Error('Failed to fetch hackathons data');
  }
  return res.json();
};

export default function HackathonsDetailsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hackathons, setHackathons] = useState<Hackathon[]>([]);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchHackathonsData();
        setHackathons(data);
      } catch (error) {
        console.error('Failed to load page data', error);
        toast({
          title: 'Error',
          description: 'Could not load the hackathons data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const { totalHackathons, totalParticipants, totalTeams } = useMemo(() => {
    let participants = 0;
    let teams = 0;
    hackathons.forEach(h => {
        participants += h.participants;
        teams += h.teams?.length || 0;
    });
    return {
        totalHackathons: hackathons.length,
        totalParticipants: participants,
        totalTeams: teams
    };
  }, [hackathons]);

  const getTeamName = (hackathon: Hackathon, teamId: string) => {
    const team = (hackathon.teams || []).find(t => t.id === teamId);
    return team ? team.name : 'Unknown Team';
  };

  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex-1 p-4 md:p-8">
        <div className="mb-4">
          <Button asChild variant="outline">
            <Link href="/pillar/adopting-emerging-technologies">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Pillar
            </Link>
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Hackathons</CardTitle>
            <CardDescription>
              Detailed overview of all company-wide hackathons. To add or update data, go to the Manage Hackathons page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            )}

            {!isLoading && hackathons.length === 0 && (
              <div className="text-center text-muted-foreground p-8">
                No hackathon data is available yet.
              </div>
            )}
            
            {!isLoading && hackathons.length > 0 && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Hackathons</CardTitle>
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalHackathons}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalParticipants}</div>
                        </CardContent>
                    </Card>
                     <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Top Teams</CardTitle>
                            <Swords className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalTeams}</div>
                        </CardContent>
                    </Card>
                </div>
                
                <div className="space-y-6">
                    {hackathons.map((hackathon) => (
                        <Card key={hackathon.id}>
                            <CardHeader>
                                <CardTitle>{hackathon.name}</CardTitle>
                                <CardDescription>
                                    {hackathon.startMonth} to {hackathon.endMonth} &bull; {hackathon.participants} Participants
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {hackathon.teams && hackathon.teams.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Top Teams</h4>
                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        {(hackathon.teamDataHeaders || []).map(header => (
                                                            <TableHead key={header}>{header}</TableHead>
                                                        ))}
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {hackathon.teams.map(team => (
                                                        <TableRow key={team.id}>
                                                            {(hackathon.teamDataHeaders || []).map(header => (
                                                                <TableCell key={`${team.id}-${header}`}>
                                                                    {String(team.data[header] ?? '')}
                                                                </TableCell>
                                                            ))}
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                                {hackathon.winners && hackathon.winners.length > 0 && (
                                    <div>
                                        <h4 className="font-medium mb-2">Winners</h4>
                                        <div className="border rounded-md p-4">
                                            <ul className="space-y-2">
                                            {(hackathon.winners || []).sort((a,b) => a.rank - b.rank).map(winner => (
                                                <li key={`${winner.rank}-${winner.teamId}`} className="flex items-center gap-3">
                                                    <Trophy className={`h-5 w-5 ${winner.rank === 1 ? 'text-yellow-500' : winner.rank === 2 ? 'text-gray-400' : 'text-yellow-700'}`} />
                                                    <span className="font-semibold text-lg">{winner.rank}.</span>
                                                    <span>{getTeamName(hackathon, winner.teamId)}</span>
                                                </li>
                                            ))}
                                            </ul>
                                        </div>
                                    </div>
                                )}
                                {(!hackathon.teams || hackathon.teams.length === 0) && (!hackathon.winners || hackathon.winners.length === 0) && (
                                    <p className="text-sm text-muted-foreground text-center py-4">No team or winner data has been uploaded for this hackathon.</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
