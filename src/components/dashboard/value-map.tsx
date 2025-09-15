
'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import type { Status } from '@/types';

type ValueMapItem = {
    id: string;
    name: string;
    status: Status;
};

type Lever = ValueMapItem;
type Driver = ValueMapItem & { levers: Lever[] };
type Outcome = {
    id: string;
    name: string;
    description: string;
    drivers: Driver[];
};

type ValueMapProps = {
    outcomes: Outcome[];
};

export function ValueMap({ outcomes }: ValueMapProps) {
    const [selectedOutcome, setSelectedOutcome] = useState<string | null>(null);
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);

    const handleOutcomeClick = (outcomeId: string) => {
        setSelectedOutcome(prev => (prev === outcomeId ? null : outcomeId));
        setSelectedDriver(null); // Reset driver selection
    };

    const handleDriverClick = (driverId: string) => {
        setSelectedDriver(prev => (prev === driverId ? null : driverId));
    };

    const allDrivers = outcomes.flatMap(o => o.drivers);
    const allLevers = allDrivers.flatMap(d => d.levers);

    const getOpacityClass = (itemId: string, type: 'lever' | 'driver' | 'outcome') => {
        if (!selectedOutcome && !selectedDriver) return 'opacity-100';

        if (selectedDriver) {
            const driver = allDrivers.find(d => d.id === selectedDriver);
            const outcome = outcomes.find(o => o.drivers.some(d => d.id === selectedDriver));
            if (type === 'lever') return driver?.levers.some(l => l.id === itemId) ? 'opacity-100' : 'opacity-20';
            if (type === 'driver') return itemId === selectedDriver ? 'opacity-100' : 'opacity-20';
            if (type === 'outcome') return itemId === outcome?.id ? 'opacity-100' : 'opacity-20';
        }

        if (selectedOutcome) {
            const outcome = outcomes.find(o => o.id === selectedOutcome);
            const driverIds = outcome?.drivers.map(d => d.id) || [];
            const leverIds = outcome?.drivers.flatMap(d => d.levers.map(l => l.id)) || [];
            if (type === 'lever') return leverIds.includes(itemId) ? 'opacity-100' : 'opacity-20';
            if (type === 'driver') return driverIds.includes(itemId) ? 'opacity-100' : 'opacity-20';
            if (type === 'outcome') return itemId === selectedOutcome ? 'opacity-100' : 'opacity-20';
        }

        return 'opacity-100';
    };


  return (
    <div className="relative flex justify-between gap-4 md:gap-8 min-h-[60vh]">
        {/* Connecting Lines Layer */}
        <svg className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
            <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--border))" />
                </marker>
            </defs>
            {outcomes.map(outcome => 
                outcome.drivers.map(driver => {
                     const isDriverDimmed = getOpacityClass(driver.id, 'driver') !== 'opacity-100';
                     const isOutcomeDimmed = getOpacityClass(outcome.id, 'outcome') !== 'opacity-100';
                     
                     return (
                        <React.Fragment key={`lines-for-driver-${driver.id}`}>
                            {/* Driver -> Outcome lines */}
                            <line 
                                key={`line-do-${driver.id}`}
                                id={`line-do-${driver.id}`}
                                x1="66.66%" 
                                y1="0" 
                                x2="33.33%" 
                                y2="0" 
                                stroke="hsl(var(--border))" 
                                strokeWidth="2"
                                markerEnd="url(#arrowhead)"
                                className={cn('transition-opacity', isDriverDimmed || isOutcomeDimmed ? 'opacity-10' : 'opacity-50')}
                            />
                            {/* Lever -> Driver lines */}
                            {driver.levers.map(lever => {
                                const isLeverDimmed = getOpacityClass(lever.id, 'lever') !== 'opacity-100';
                                return (
                                    <line
                                        key={`line-ld-${lever.id}`}
                                        id={`line-ld-${lever.id}`}
                                        x1="33.33%" 
                                        y1="0" 
                                        x2="0" 
                                        y2="0" 
                                        stroke="hsl(var(--border))" 
                                        strokeWidth="2"
                                        markerEnd="url(#arrowhead)"
                                        className={cn('transition-opacity', isLeverDimmed || isDriverDimmed ? 'opacity-10' : 'opacity-50')}
                                    />
                                )
                            })}
                        </React.Fragment>
                     )
                })
            )}
        </svg>

        {/* Levers Column */}
        <div className="w-1/3 space-y-4">
            <h2 className="text-xl font-semibold text-center">Levers</h2>
            <div className="space-y-4">
                {allLevers.map(lever => (
                    <Card 
                        key={lever.id} 
                        id={`card-${lever.id}`}
                        className={cn("transition-opacity cursor-default", getOpacityClass(lever.id, 'lever'))}
                    >
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{lever.name}</CardTitle>
                            <StatusIndicator status={lever.status} className="text-xs" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>

        {/* Drivers Column */}
        <div className="w-1/3 space-y-4">
            <h2 className="text-xl font-semibold text-center">Drivers</h2>
            <div className="space-y-4">
                {allDrivers.map(driver => (
                    <Card 
                        key={driver.id} 
                        id={`card-${driver.id}`}
                        onClick={() => handleDriverClick(driver.id)}
                        className={cn("transition-all cursor-pointer", getOpacityClass(driver.id, 'driver'), selectedDriver === driver.id && 'border-primary shadow-lg')}
                    >
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{driver.name}</CardTitle>
                            <StatusIndicator status={driver.status} className="text-xs" />
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>

        {/* Outcomes Column */}
        <div className="w-1/3 space-y-4">
            <h2 className="text-xl font-semibold text-center">Outcomes</h2>
            <div className="space-y-4">
                {outcomes.map(outcome => (
                    <Card 
                        key={outcome.id} 
                        id={`card-${outcome.id}`}
                        onClick={() => handleOutcomeClick(outcome.id)}
                        className={cn("transition-all cursor-pointer", getOpacityClass(outcome.id, 'outcome'), selectedOutcome === outcome.id && 'border-primary shadow-lg')}
                    >
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">{outcome.name}</CardTitle>
                            <CardDescription className="text-xs">{outcome.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>

        <script dangerouslySetInnerHTML={{ __html: `
            setTimeout(() => {
                const updateLines = () => {
                    document.querySelectorAll('line[id^="line-do-"]').forEach(line => {
                        const driverId = line.id.replace('line-do-', '');
                        const driverCard = document.getElementById('card-' + driverId);
                        const outcomeCard = document.querySelector('[id^="card-building-reliable-products"]'); // Simple for now
                        if (driverCard && outcomeCard) {
                            const rect1 = driverCard.getBoundingClientRect();
                            const rect2 = outcomeCard.getBoundingClientRect();
                            const containerRect = line.closest('svg').getBoundingClientRect();
                            line.setAttribute('x1', (rect1.right - containerRect.left) + 20);
                            line.setAttribute('y1', (rect1.top - containerRect.top) + rect1.height / 2);
                            line.setAttribute('x2', (rect2.left - containerRect.left) - 20);
                            line.setAttribute('y2', (rect2.top - containerRect.top) + rect2.height / 2);
                        }
                    });
                     document.querySelectorAll('line[id^="line-ld-"]').forEach(line => {
                        const leverId = line.id.replace('line-ld-', '');
                        const leverCard = document.getElementById('card-' + leverId);
                        const driverId = allDrivers.find(d => d.levers.some(l => l.id === leverId))?.id;
                        const driverCard = document.getElementById('card-' + driverId);

                        if (leverCard && driverCard) {
                            const rect1 = leverCard.getBoundingClientRect();
                            const rect2 = driverCard.getBoundingClientRect();
                            const containerRect = line.closest('svg').getBoundingClientRect();
                            line.setAttribute('x1', (rect1.right - containerRect.left) + 20);
                            line.setAttribute('y1', (rect1.top - containerRect.top) + rect1.height / 2);
                            line.setAttribute('x2', (rect2.left - containerRect.left) - 20);
                            line.setAttribute('y2', (rect2.top - containerRect.top) + rect2.height / 2);
                        }
                    });
                };
                
                const allDrivers = ${JSON.stringify(allDrivers)};
                updateLines();
                
                const resizeObserver = new ResizeObserver(() => updateLines());
                document.querySelector('.p-4.md\\:p-8').childNodes.forEach(el => resizeObserver.observe(el));

                // Also run on click to handle state changes
                document.addEventListener('click', () => setTimeout(updateLines, 100));

            }, 100);
        `}} />
    </div>
  );
}
