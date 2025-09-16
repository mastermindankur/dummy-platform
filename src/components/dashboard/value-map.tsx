
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import type { ValueMapItem, OutcomeDriverConnection, DriverLeverConnection, ValueMapDriver, ValueMapOutcome, ValueMapLever, ValueMapGroup } from '@/types';
import { Badge } from '@/components/ui/badge';

type ValueMapProps = {
    outcomes: ValueMapOutcome[];
    drivers: ValueMapDriver[];
    levers: ValueMapLever[];
    outcomeGroups: ValueMapGroup[];
    driverGroups: ValueMapGroup[];
    outcomeDriverConnections: OutcomeDriverConnection[];
    driverLeverConnections: DriverLeverConnection[];
};

type SelectedItem = {
    id: string;
    type: 'lever' | 'driver' | 'outcome';
} | null;

const itemColorClasses = {
    lever: 'bg-blue-950/30',
    driver: 'bg-green-950/30',
    outcome: 'bg-purple-950/30',
};

const ItemCard = ({ item, type, onClick, isHighlighted, isSelected }: {
    item: ValueMapItem;
    type: 'lever' | 'driver' | 'outcome';
    onClick: () => void;
    isHighlighted: boolean;
    isSelected: boolean;
}) => (
    <Card 
        id={`card-${item.id}`} 
        onClick={onClick}
        className={cn(
            "transition-all duration-300 cursor-pointer",
            itemColorClasses[type],
            isHighlighted ? 'opacity-100' : 'opacity-30',
            isSelected && 'border-primary shadow-lg'
        )}>
        <CardHeader className="p-3">
            <CardTitle className="text-sm">{item.name}</CardTitle>
            {item.status && <StatusIndicator status={item.status} className="text-xs" />}
        </CardHeader>
        {item.isWceBookOfWork && (
            <CardContent className="p-3 pt-0">
                <Badge variant="secondary">BOW25</Badge>
            </CardContent>
        )}
    </Card>
);

const groupColorClasses = [
    'bg-blue-900/10 border-blue-700/40',
    'bg-purple-900/10 border-purple-700/40',
    'bg-green-900/10 border-green-700/40',
    'bg-rose-900/10 border-rose-700/40',
    'bg-sky-900/10 border-sky-700/40',
];

const GroupContainer = ({ group, children, title, index }: { group?: ValueMapGroup, children: React.ReactNode, title: string, index: number }) => {
    if (!group) return <>{children}</>;
    
    const colorClass = groupColorClasses[index % groupColorClasses.length];

    return (
        <div id={`group-${group.id}`} className={cn("border rounded-lg p-3 relative", colorClass)}>
            <h3 className="text-sm font-semibold text-muted-foreground absolute -top-2.5 left-3 bg-background px-2">{group.name}</h3>
            <div className="space-y-2 pt-2">
                {children}
            </div>
        </div>
    );
};

export function ValueMap({ 
    outcomes, 
    drivers, 
    levers,
    outcomeGroups,
    driverGroups,
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

            const createCurvePath = (x1: number, y1: number, x2: number, y2: number) => {
                const horizontalOffset = 80;
                const controlPoint1 = { x: x1 + horizontalOffset, y: y1 };
                const controlPoint2 = { x: x2 - horizontalOffset, y: y2 };
                return `M${x1},${y1} C${controlPoint1.x},${controlPoint1.y} ${controlPoint2.x},${controlPoint2.y} ${x2},${y2}`;
            };


            driverLeverConnections.forEach(conn => {
                const leverCard = document.getElementById(`card-${conn.leverId}`);
                const driverCard = document.getElementById(`card-${conn.driverId}`);
                if(leverCard && driverCard) {
                    const path = svg.querySelector(`#path-ld-${conn.leverId}-${conn.driverId}`);
                    if(path) {
                        const rect1 = leverCard.getBoundingClientRect();
                        const rect2 = driverCard.getBoundingClientRect();
                        const x1 = rect1.right - containerRect.left;
                        const y1 = (rect1.top - containerRect.top) + rect1.height / 2;
                        const x2 = rect2.left - containerRect.left;
                        const y2 = (rect2.top - containerRect.top) + rect2.height / 2;
                        path.setAttribute('d', createCurvePath(x1, y1, x2, y2));
                    }
                }
            });

            outcomeDriverConnections.forEach(conn => {
                const driverCard = document.getElementById(`card-${conn.driverId}`);
                const outcomeCard = document.getElementById(`card-${conn.outcomeId}`);
                 if(driverCard && outcomeCard) {
                    const path = svg.querySelector(`#path-do-${conn.driverId}-${conn.outcomeId}`);
                    if(path) {
                        const rect1 = driverCard.getBoundingClientRect();
                        const rect2 = outcomeCard.getBoundingClientRect();
                        const x1 = rect1.right - containerRect.left;
                        const y1 = (rect1.top - containerRect.top) + rect1.height / 2;
                        const x2 = rect2.left - containerRect.left;
                        const y2 = (rect2.top - containerRect.top) + rect2.height / 2;
                        path.setAttribute('d', createCurvePath(x1, y1, x2, y2));
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
    }, [isClient, selectedItem, outcomes, drivers, levers, outcomeDriverConnections, driverLeverConnections, outcomeGroups, driverGroups]);

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

    const isHighlighted = (id: string, type: 'lever' | 'driver' | 'outcome') => {
        if (!selectedItem) return true;
        return highlighted[type].includes(id);
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

    const renderGroupedItems = (items: ValueMapItem[], groups: ValueMapGroup[], type: 'lever' | 'driver' | 'outcome') => {
        const groupedItems = items.filter(item => item.groupId && groups.find(g => g.id === item.groupId));
        const ungroupedItems = items.filter(item => !item.groupId || !groups.find(g => g.id === item.groupId));
        
        return (
            <>
                {groups.map((group, index) => (
                    <GroupContainer key={group.id} group={group} title={`${type} Group`} index={index}>
                        {groupedItems
                            .filter(item => item.groupId === group.id)
                            .map(item => (
                                <ItemCard 
                                    key={item.id} 
                                    item={item} 
                                    type={type} 
                                    onClick={() => handleItemClick(item.id, type)}
                                    isHighlighted={isHighlighted(item.id, type)}
                                    isSelected={selectedItem?.id === item.id}
                                />
                            ))
                        }
                    </GroupContainer>
                ))}
                {ungroupedItems.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        type={type}
                        onClick={() => handleItemClick(item.id, type)}
                        isHighlighted={isHighlighted(item.id, type)}
                        isSelected={selectedItem?.id === item.id}
                    />
                ))}
            </>
        );
    };


  return (
    <div ref={containerRef} className="relative w-full space-y-4">
        {isClient && (
             <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" aria-hidden="true">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" />
                    </marker>
                </defs>
                {driverLeverConnections.map(conn => (
                    <path
                        key={`path-ld-${conn.leverId}-${conn.driverId}`}
                        id={`path-ld-${conn.leverId}-${conn.driverId}`}
                        fill="none"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="1.2"
                        markerEnd="url(#arrowhead)"
                        className={cn('transition-opacity', getLineOpacityClass(conn))}
                    />
                ))}
                {outcomeDriverConnections.map(conn => (
                     <path
                        key={`path-do-${conn.driverId}-${conn.outcomeId}`}
                        id={`path-do-${conn.driverId}-${conn.outcomeId}`}
                        fill="none"
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="1.2"
                        markerEnd="url(#arrowhead)"
                        className={cn('transition-opacity', getLineOpacityClass(conn))}
                    />
                ))}
            </svg>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 w-full gap-8">
            {/* Levers Column */}
            <div className="px-4 space-y-2">
                <h2 className="text-xl font-semibold text-center mb-4">Levers</h2>
                {levers.map(lever => (
                     <ItemCard 
                        key={lever.id} 
                        item={lever} 
                        type="lever"
                        onClick={() => handleItemClick(lever.id, 'lever')}
                        isHighlighted={isHighlighted(lever.id, 'lever')}
                        isSelected={selectedItem?.id === lever.id}
                    />
                ))}
            </div>

            {/* Drivers Column */}
            <div className="px-4 space-y-2">
                 <h2 className="text-xl font-semibold text-center mb-4">Drivers</h2>
                 {renderGroupedItems(drivers, driverGroups, 'driver')}
            </div>

            {/* Outcomes Column */}
            <div className="px-4 space-y-2">
                <h2 className="text-xl font-semibold text-center mb-4">Outcomes</h2>
                {renderGroupedItems(outcomes, outcomeGroups, 'outcome')}
            </div>
        </div>
        <div className="flex justify-end pt-4 pr-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="secondary">BOW25</Badge>
                <span>WCE Book of Work 2025</span>
            </div>
        </div>
    </div>
  );
}

    
    