
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
    const [selectedDriver, setSelectedDriver] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsClient(true);
    }, []);

     useEffect(() => {
        if (!isClient || !containerRef.current) return;

        const updateLines = () => {
            const svg = svgRef.current;
            if (!svg || !containerRef.current) return;
            
            const containerRect = containerRef.current.getBoundingClientRect();

            outcomes.forEach(outcome => {
                outcome.drivers.forEach(driver => {
                    const driverCard = document.getElementById(`card-${driver.id}`);
                    const outcomeCard = document.getElementById(`card-${outcome.id}`);

                    if (driverCard && outcomeCard) {
                        const line = svg.querySelector(`#line-do-${driver.id}`);
                        if (line) {
                            const rect1 = driverCard.getBoundingClientRect();
                            const rect2 = outcomeCard.getBoundingClientRect();
                            line.setAttribute('x1', `${rect1.right - containerRect.left}`);
                            line.setAttribute('y1', `${(rect1.top - containerRect.top) + rect1.height / 2}`);
                            line.setAttribute('x2', `${rect2.left - containerRect.left}`);
                            line.setAttribute('y2', `${(rect2.top - containerRect.top) + rect2.height / 2}`);
                        }
                    }

                    driver.levers.forEach(lever => {
                        const leverCard = document.getElementById(`card-${lever.id}`);
                        if (leverCard && driverCard) {
                             const line = svg.querySelector(`#line-ld-${lever.id}`);
                             if (line) {
                                const rect1 = leverCard.getBoundingClientRect();
                                const rect2 = driverCard.getBoundingClientRect();
                                line.setAttribute('x1', `${rect1.right - containerRect.left}`);
                                line.setAttribute('y1', `${(rect1.top - containerRect.top) + rect1.height / 2}`);
                                line.setAttribute('x2', `${rect2.left - containerRect.left}`);
                                line.setAttribute('y2', `${(rect2.top - containerRect.top) + rect2.height / 2}`);
                             }
                        }
                    });
                });
            });
        };
        
        updateLines();
        const resizeObserver = new ResizeObserver(updateLines);
        resizeObserver.observe(containerRef.current);
        
        const timeoutId = setTimeout(updateLines, 50);

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timeoutId);
        };
    }, [isClient, selectedDriver, outcomes]);

    const handleDriverClick = (driverId: string) => {
        setSelectedDriver(prev => (prev === driverId ? null : driverId));
    };

    const getOpacityClass = (driverId: string) => {
        if (!selectedDriver) return 'opacity-100';
        return selectedDriver === driverId ? 'opacity-100' : 'opacity-30';
    };


  return (
    <div ref={containerRef} className="relative w-full space-y-4">
        {/* Headers */}
        <div className="flex w-full">
            <div className="w-1/3 text-center"><h2 className="text-xl font-semibold">Levers</h2></div>
            <div className="w-1/3 text-center"><h2 className="text-xl font-semibold">Drivers</h2></div>
            <div className="w-1/3 text-center"><h2 className="text-xl font-semibold">Outcomes</h2></div>
        </div>

        {/* Connecting Lines Layer */}
        {isClient && (
             <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--border))" />
                    </marker>
                </defs>
                 {outcomes.map(outcome =>
                    outcome.drivers.map(driver => (
                        <React.Fragment key={`lines-for-driver-${driver.id}`}>
                            {/* Driver -> Outcome line */}
                            <line
                                id={`line-do-${driver.id}`}
                                stroke="hsl(var(--border))"
                                strokeWidth="1.5"
                                markerEnd="url(#arrowhead)"
                                className={cn('transition-opacity', getOpacityClass(driver.id))}
                            />
                            {/* Lever -> Driver lines */}
                            {driver.levers.map(lever => (
                                <line
                                    key={`line-ld-${lever.id}`}
                                    id={`line-ld-${lever.id}`}
                                    stroke="hsl(var(--border))"
                                    strokeWidth="1.5"
                                    markerEnd="url(#arrowhead)"
                                    className={cn('transition-opacity', getOpacityClass(driver.id))}
                                />
                            ))}
                        </React.Fragment>
                    ))
                )}
            </svg>
        )}

        {/* Swimlanes */}
        <div className="space-y-2">
           {outcomes.map(outcome => (
                <div key={outcome.id} className="space-y-2">
                    {outcome.drivers.map(driver => (
                        <div 
                            key={driver.id} 
                            onClick={() => handleDriverClick(driver.id)}
                            className={cn(
                                "flex items-center p-4 rounded-lg border bg-card/50 transition-all duration-300 cursor-pointer", 
                                getOpacityClass(driver.id),
                                selectedDriver === driver.id && 'bg-card border-primary shadow-lg'
                            )}
                        >
                            {/* Levers Column */}
                            <div className="w-1/3 px-4">
                                <div className="space-y-2">
                                {driver.levers.map(lever => (
                                     <Card key={lever.id} id={`card-${lever.id}`} className="bg-background/70">
                                        <CardHeader className="p-3">
                                            <CardTitle className="text-sm">{lever.name}</CardTitle>
                                            <StatusIndicator status={lever.status} className="text-xs" />
                                        </CardHeader>
                                    </Card>
                                ))}
                                </div>
                            </div>

                            {/* Drivers Column */}
                            <div className="w-1/3 px-4">
                                <Card id={`card-${driver.id}`} className="bg-background/70">
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-base">{driver.name}</CardTitle>
                                        <StatusIndicator status={driver.status} className="text-xs" />
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Outcomes Column */}
                            <div className="w-1/3 px-4">
                                <Card id={`card-${outcome.id}`} className="bg-background/70">
                                    <CardHeader className="p-3">
                                        <CardTitle className="text-base">{outcome.name}</CardTitle>
                                        <CardDescription className="text-xs line-clamp-2">{outcome.description}</CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    </div>
  );
}
