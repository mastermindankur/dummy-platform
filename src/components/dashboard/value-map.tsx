
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import type { Status, ValueMapItem, OutcomeDriverConnection, DriverLeverConnection } from '@/types';

type Outcome = ValueMapItem;
type Driver = ValueMapItem;
type Lever = ValueMapItem;

type ValueMapProps = {
    outcomes: Outcome[];
    drivers: Driver[];
    levers: Lever[];
    outcomeDriverConnections: OutcomeDriverConnection[];
    driverLeverConnections: DriverLeverConnection[];
};

type SelectedItem = {
    id: string;
    type: 'lever' | 'driver' | 'outcome';
} | null;

export function ValueMap({ 
    outcomes, 
    drivers, 
    levers,
    outcomeDriverConnections,
    driverLeverConnections,
}: ValueMapProps) {
    const [selectedItem, setSelectedItem] = useState<SelectedItem>(null);
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
    }, [isClient, selectedItem, outcomes, drivers, levers, outcomeDriverConnections, driverLeverConnections]);

    const handleItemClick = (id: string, type: 'lever' | 'driver' | 'outcome') => {
        setSelectedItem(prev => (prev?.id === id && prev?.type === type ? null : { id, type }));
    };

    const getHighlightedIds = () => {
        if (!selectedItem) return { lever: [], driver: [], outcome: [] };

        let highlightedLevers: string[] = [];
        let highlightedDrivers: string[] = [];
        let highlightedOutcomes: string[] = [];

        if (selectedItem.type === 'lever') {
            highlightedLevers.push(selectedItem.id);
            const connectedDriverIds = driverLeverConnections
                .filter(c => c.leverId === selectedItem.id)
                .map(c => c.driverId);
            highlightedDrivers.push(...connectedDriverIds);

            const connectedOutcomeIds = outcomeDriverConnections
                .filter(c => connectedDriverIds.includes(c.driverId))
                .map(c => c.outcomeId);
            highlightedOutcomes.push(...connectedOutcomeIds);
        }

        if (selectedItem.type === 'driver') {
            highlightedDrivers.push(selectedItem.id);
            const connectedLeverIds = driverLeverConnections
                .filter(c => c.driverId === selectedItem.id)
                .map(c => c.leverId);
            highlightedLevers.push(...connectedLeverIds);

            const connectedOutcomeIds = outcomeDriverConnections
                .filter(c => c.driverId === selectedItem.id)
                .map(c => c.outcomeId);
            highlightedOutcomes.push(...connectedOutcomeIds);
        }
        
        if (selectedItem.type === 'outcome') {
            highlightedOutcomes.push(selectedItem.id);
            const connectedDriverIds = outcomeDriverConnections
                .filter(c => c.outcomeId === selectedItem.id)
                .map(c => c.driverId);
            highlightedDrivers.push(...connectedDriverIds);

            const connectedLeverIds = driverLeverConnections
                .filter(c => connectedDriverIds.includes(c.driverId))
                .map(c => c.leverId);
            highlightedLevers.push(...connectedLeverIds);
        }

        return { 
            lever: [...new Set(highlightedLevers)], 
            driver: [...new Set(highlightedDrivers)], 
            outcome: [...new Set(highlightedOutcomes)]
        };
    };

    const highlighted = getHighlightedIds();

    const getOpacityClass = (id: string, type: 'lever' | 'driver' | 'outcome') => {
        if (!selectedItem) return 'opacity-100';
        return highlighted[type].includes(id) ? 'opacity-100' : 'opacity-30';
    };

    const getLineOpacityClass = (conn: DriverLeverConnection | OutcomeDriverConnection) => {
        if (!selectedItem) return 'opacity-100';

        const isDriverLever = 'leverId' in conn;

        if (highlighted.driver.includes(conn.driverId)) {
            if (isDriverLever) {
                return highlighted.lever.includes(conn.leverId) ? 'opacity-100' : 'opacity-30';
            } else { // OutcomeDriverConnection
                return highlighted.outcome.includes(conn.outcomeId) ? 'opacity-100' : 'opacity-30';
            }
        }
        return 'opacity-30';
    };


  return (
    <div ref={containerRef} className="relative w-full space-y-4">
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
                        className={cn('transition-opacity', getLineOpacityClass(conn))}
                    />
                ))}
                {outcomeDriverConnections.map(conn => (
                     <line
                        key={`line-do-${conn.driverId}-${conn.outcomeId}`}
                        id={`line-do-${conn.driverId}-${conn.outcomeId}`}
                        stroke="hsl(var(--border))"
                        strokeWidth="1.5"
                        markerEnd="url(#arrowhead)"
                        className={cn('transition-opacity', getLineOpacityClass(conn))}
                    />
                ))}
            </svg>
        )}

        <div className="flex w-full justify-between">
            {/* Levers Column */}
            <div className="w-1/3 px-4 space-y-2">
                <h2 className="text-xl font-semibold text-center mb-4">Levers</h2>
                {levers.map(lever => (
                    <Card 
                        key={lever.id} 
                        id={`card-${lever.id}`} 
                        onClick={() => handleItemClick(lever.id, 'lever')}
                        className={cn(
                            "bg-background/70 transition-all duration-300 cursor-pointer",
                            getOpacityClass(lever.id, 'lever'),
                            selectedItem?.id === lever.id && 'bg-card border-primary shadow-lg'
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
                    <Card 
                        key={driver.id} 
                        id={`card-${driver.id}`} 
                        onClick={() => handleItemClick(driver.id, 'driver')}
                        className={cn(
                        "bg-background/70 transition-all duration-300 cursor-pointer", 
                        getOpacityClass(driver.id, 'driver'),
                        selectedItem?.id === driver.id && 'bg-card border-primary shadow-lg'
                        )}>
                        <CardHeader className="p-3">
                            <CardTitle className="text-base">{driver.name}</CardTitle>
                             {driver.description && <CardDescription className="text-xs line-clamp-2">{driver.description}</CardDescription>}
                        </CardHeader>
                    </Card>
                ))}
            </div>

            {/* Outcomes Column */}
            <div className="w-1/3 px-4 space-y-2">
                <h2 className="text-xl font-semibold text-center mb-4">Outcomes</h2>
                {outcomes.map(outcome => (
                    <Card 
                        key={outcome.id} 
                        id={`card-${outcome.id}`} 
                        onClick={() => handleItemClick(outcome.id, 'outcome')}
                        className={cn(
                        "bg-background/70 transition-all duration-300 cursor-pointer",
                        getOpacityClass(outcome.id, 'outcome'),
                        selectedItem?.id === outcome.id && 'bg-card border-primary shadow-lg'
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
