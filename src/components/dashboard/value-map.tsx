
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import type { Status } from '@/types';

type ValueMapItem = {
    id: string;
    name: string;
    status?: Status;
    description?: string;
};

type Outcome = ValueMapItem;
type Driver = ValueMapItem;
type Lever = ValueMapItem;

type Connection = {
    outcomeId?: string;
    driverId: string;
    leverId?: string;
};

type OutcomeDriverConnection = {
    outcomeId: string;
    driverId: string;
}

type DriverLeverConnection = {
    driverId: string;
    leverId: string;
}

type ValueMapProps = {
    outcomes: Outcome[];
    drivers: Driver[];
    levers: Lever[];
    outcomeDriverConnections: OutcomeDriverConnection[];
    driverLeverConnections: DriverLeverConnection[];
};

export function ValueMap({ 
    outcomes, 
    drivers, 
    levers,
    outcomeDriverConnections,
    driverLeverConnections,
}: ValueMapProps) {
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

            // Draw Lever -> Driver lines
            driverLeverConnections.forEach(conn => {
                const leverCard = document.getElementById(`card-${conn.leverId}`);
                const driverCard = document.getElementById(`card-${conn.driverId}`);
                if(leverCard && driverCard) {
                    const line = svg.querySelector(`#line-ld-${conn.leverId}-${conn.driverId}`);
                    if(line) {
                        const rect1 = leverCard.getBoundingClientRect();
                        const rect2 = driverCard.getBoundingClientRect();
                        line.setAttribute('x1', `${rect1.right - containerRect.left}`);
                        line.setAttribute('y1', `${(rect1.top - containerRect.top) + rect1.height / 2}`);
                        line.setAttribute('x2', `${rect2.left - containerRect.left}`);
                        line.setAttribute('y2', `${(rect2.top - containerRect.top) + rect2.height / 2}`);
                    }
                }
            });

            // Draw Driver -> Outcome lines
            outcomeDriverConnections.forEach(conn => {
                const driverCard = document.getElementById(`card-${conn.driverId}`);
                const outcomeCard = document.getElementById(`card-${conn.outcomeId}`);
                 if(driverCard && outcomeCard) {
                    const line = svg.querySelector(`#line-do-${conn.driverId}-${conn.outcomeId}`);
                    if(line) {
                        const rect1 = driverCard.getBoundingClientRect();
                        const rect2 = outcomeCard.getBoundingClientRect();
                        line.setAttribute('x1', `${rect1.right - containerRect.left}`);
                        line.setAttribute('y1', `${(rect1.top - containerRect.top) + rect1.height / 2}`);
                        line.setAttribute('x2', `${rect2.left - containerRect.left}`);
                        line.setAttribute('y2', `${(rect2.top - containerRect.top) + rect2.height / 2}`);
                    }
                }
            })

        };
        
        updateLines();
        const resizeObserver = new ResizeObserver(updateLines);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }
        
        const timeoutId = setTimeout(updateLines, 50);

        return () => {
            if (containerRef.current) {
                resizeObserver.unobserve(containerRef.current);
            }
            clearTimeout(timeoutId);
        };
    }, [isClient, selectedDriver, outcomes, drivers, levers, outcomeDriverConnections, driverLeverConnections]);

    const handleDriverClick = (driverId: string) => {
        setSelectedDriver(prev => (prev === driverId ? null : driverId));
    };

    const getOpacityClass = (driverId: string) => {
        if (!selectedDriver) return 'opacity-100';
        return selectedDriver === driverId ? 'opacity-100' : 'opacity-30';
    };


  return (
    <div ref={containerRef} className="relative w-full space-y-4">
        {/* Connecting Lines Layer */}
        {isClient && (
             <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--border))" />
                    </marker>
                </defs>
                {driverLeverConnections.map(conn => (
                    <line
                        key={`line-ld-${conn.leverId}-${conn.driverId}`}
                        id={`line-ld-${conn.leverId}-${conn.driverId}`}
                        stroke="hsl(var(--border))"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead)"
                        className={cn('transition-opacity', getOpacityClass(conn.driverId))}
                    />
                ))}
                {outcomeDriverConnections.map(conn => (
                     <line
                        key={`line-do-${conn.driverId}-${conn.outcomeId}`}
                        id={`line-do-${conn.driverId}-${conn.outcomeId}`}
                        stroke="hsl(var(--border))"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead)"
                        className={cn('transition-opacity', getOpacityClass(conn.driverId))}
                    />
                ))}
            </svg>
        )}

        {/* Columns Layout */}
        <div className="flex w-full justify-between">
            {/* Levers Column */}
            <div className="w-1/3 px-4 space-y-2">
                <h2 className="text-xl font-semibold text-center mb-4">Levers</h2>
                {levers.map(lever => (
                    <Card key={lever.id} id={`card-${lever.id}`} className={cn(
                        "bg-background/70 transition-opacity",
                        !selectedDriver ? 'opacity-100' : driverLeverConnections.some(c => c.leverId === lever.id && c.driverId === selectedDriver) ? 'opacity-100' : 'opacity-30'
                        )}>
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm">{lever.name}</CardTitle>
                            {lever.status && <StatusIndicator status={lever.status} className="text-xs" />}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Drivers Column */}
            <div className="w-1/3 px-4 space-y-2">
                 <h2 className="text-xl font-semibold text-center mb-4">Drivers</h2>
                {drivers.map(driver => (
                    <Card key={driver.id} id={`card-${driver.id}`} onClick={() => handleDriverClick(driver.id)} className={cn(
                        "bg-background/70 transition-all duration-300 cursor-pointer", 
                        getOpacityClass(driver.id),
                        selectedDriver === driver.id && 'bg-card border-primary shadow-lg'
                        )}>
                        <CardHeader className="p-3">
                            <CardTitle className="text-base">{driver.name}</CardTitle>
                            {driver.status && <StatusIndicator status={driver.status} className="text-xs" />}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Outcomes Column */}
            <div className="w-1/3 px-4 space-y-2">
                <h2 className="text-xl font-semibold text-center mb-4">Outcomes</h2>
                {outcomes.map(outcome => (
                    <Card key={outcome.id} id={`card-${outcome.id}`} className={cn(
                        "bg-background/70 transition-opacity",
                        !selectedDriver ? 'opacity-100' : outcomeDriverConnections.some(c => c.outcomeId === outcome.id && c.driverId === selectedDriver) ? 'opacity-100' : 'opacity-30'
                        )}>
                        <CardHeader className="p-3">
                            <CardTitle className="text-base">{outcome.name}</CardTitle>
                            {outcome.description && <CardDescription className="text-xs line-clamp-2">{outcome.description}</CardDescription>}
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    </div>
  );
}
