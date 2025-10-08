
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { StatusIndicator } from '@/components/dashboard/status-indicator';
import type { ValueMapItem, OutcomeDriverConnection, DriverLeverConnection, ValueMapDriver, ValueMapOutcome, ValueMapLever, ValueMapGroup } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
    type: 'lever' | 'driver' | 'outcome' | 'outcomeGroup' | 'driverGroup';
} | null;

type ActiveFilter = 'new' | 'bow' | 'retired' | null;


const itemColorClasses = {
    lever: 'bg-blue-950/30 border-blue-700/40 text-foreground',
    driver: 'bg-green-950/30 border-green-700/40 text-foreground',
    outcome: 'bg-purple-950/30 border-purple-700/40 text-foreground',
};

const selectedItemColorClasses = {
    lever: 'bg-blue-200 border-blue-400 text-blue-950',
    driver: 'bg-green-200 border-green-400 text-green-950',
    outcome: 'bg-purple-200 border-purple-400 text-purple-950',
}


const ItemCard = ({ item, type, onClick, isHighlighted, isSelected, selectedItem, activeFilter }: {
    item: ValueMapItem;
    type: 'lever' | 'driver' | 'outcome';
    onClick: () => void;
    isHighlighted: boolean;
    isSelected: boolean;
    selectedItem: SelectedItem;
    activeFilter: ActiveFilter;
}) => (
    <Card 
        id={`card-${item.id}`} 
        onClick={onClick}
        className={cn(
            "transition-all duration-300 cursor-pointer",
            isHighlighted ? selectedItemColorClasses[type] : itemColorClasses[type],
            (selectedItem || activeFilter) ? (isHighlighted ? 'opacity-100 shadow-lg' : 'opacity-30') : 'opacity-100',
            isSelected && 'ring-2 ring-white',
            item.isRetired && 'opacity-60'
        )}>
        <CardHeader className="p-3">
            <CardTitle className={cn("text-sm", item.isRetired && "line-through")}>{item.name}</CardTitle>
            {item.status && <StatusIndicator status={item.status} className="text-xs" />}
        </CardHeader>
        {(item.description || item.isWceBookOfWork || item.isNew) && (
            <CardContent className="p-3 pt-0 space-y-2 flex flex-wrap gap-2">
                {item.description && (
                    <CardDescription className={cn("text-xs w-full", isHighlighted ? 'text-inherit' : 'text-muted-foreground', item.isRetired && "line-through")}>{item.description}</CardDescription>
                )}
                {item.isWceBookOfWork && (
                    <Badge variant={isHighlighted ? "default" : "secondary"} className={cn(isHighlighted && "bg-background/20 text-foreground")}>BOW25</Badge>
                )}
                {item.isNew && !item.isRetired && (
                    <Badge variant={isHighlighted ? "default" : "secondary"} className={cn("bg-accent/80 text-accent-foreground", isHighlighted && "bg-background/20 text-foreground")}>New</Badge>
                )}
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

const GroupContainer = ({ group, children, title, index, onClick, isSelected, type }: { 
    group?: ValueMapGroup, 
    children: React.ReactNode, 
    title: string, 
    index: number,
    onClick: () => void,
    isSelected: boolean,
    type: 'driver' | 'outcome'
}) => {
    if (!group) return <>{children}</>;
    
    const colorClass = groupColorClasses[index % groupColorClasses.length];
    const isDriverGroup = type === 'driver';

    const TitleComponent = () => (
        <h3 
          onClick={!isDriverGroup ? onClick : undefined}
          className={cn(
            "text-sm font-semibold text-muted-foreground absolute -top-2.5 left-3 bg-background px-2 transition-colors",
            isSelected && 'text-accent font-bold',
            isDriverGroup ? 'cursor-pointer hover:text-accent' : 'cursor-pointer'
          )}
        >
          {group.name}
        </h3>
    );


    return (
        <div id={`group-${group.id}`} className={cn("border rounded-lg p-3 relative", colorClass)}>
            {isDriverGroup ? (
                <Link href={`/executive/driver-group/${group.id}`} className="cursor-pointer">
                    <TitleComponent/>
                </Link>
            ) : (
                <TitleComponent/>
            )}
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
    const [activeFilter, setActiveFilter] = useState<ActiveFilter>(null);
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
                        const x2 = (rect2.left - containerRect.left) - 5;
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
                        const x2 = (rect2.left - containerRect.left) - 5;
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
    }, [isClient, selectedItem, outcomes, drivers, levers, outcomeDriverConnections, driverLeverConnections, outcomeGroups, driverGroups, activeFilter]);

    const handleItemClick = (id: string, type: SelectedItem['type']) => {
        setSelectedItem(prev => (prev?.id === id && prev?.type === type ? null : { id, type }));
        setActiveFilter(null);
    };

    const handleFilterClick = (filter: ActiveFilter) => {
        setActiveFilter(prev => prev === filter ? null : filter);
        setSelectedItem(null);
    };

    const getHighlightedIds = () => {
        if (!selectedItem && !activeFilter) return { lever: [], driver: [], outcome: [] };
        
        let highlightedLevers: string[] = [];
        let highlightedDrivers: string[] = [];
        let highlightedOutcomes: string[] = [];

        // Handle category filtering
        if (activeFilter) {
            const allItems = [...levers, ...drivers, ...outcomes];
            const matchingItems = allItems.filter(item => 
                (activeFilter === 'new' && item.isNew) ||
                (activeFilter === 'bow' && item.isWceBookOfWork) ||
                (activeFilter === 'retired' && item.isRetired)
            );
            
            matchingItems.forEach(item => {
                if (levers.some(l => l.id === item.id)) highlightedLevers.push(item.id);
                if (drivers.some(d => d.id === item.id)) highlightedDrivers.push(item.id);
                if (outcomes.some(o => o.id === item.id)) highlightedOutcomes.push(item.id);
            });
             return { 
                lever: highlightedLevers, 
                driver: highlightedDrivers, 
                outcome: highlightedOutcomes 
            };
        }


        // Handle item selection tracing
        if (selectedItem) {
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

            if (selectedItem.type === 'driverGroup') {
                const groupDriverIds = drivers.filter(d => d.groupId === selectedItem.id).map(d => d.id);
                highlightedDrivers.push(...groupDriverIds);

                const connectedLeverIds = driverLeverConnections
                    .filter(c => groupDriverIds.includes(c.driverId))
                    .map(c => c.leverId);
                highlightedLevers.push(...connectedLeverIds);

                const connectedOutcomeIds = outcomeDriverConnections
                    .filter(c => groupDriverIds.includes(c.driverId))
                    .map(c => c.outcomeId);
                highlightedOutcomes.push(...connectedOutcomeIds);
            }

            if (selectedItem.type === 'outcomeGroup') {
                const groupOutcomeIds = outcomes.filter(o => o.groupId === selectedItem.id).map(o => o.id);
                highlightedOutcomes.push(...groupOutcomeIds);

                const connectedDriverIds = outcomeDriverConnections
                    .filter(c => groupOutcomeIds.includes(c.outcomeId))
                    .map(c => c.driverId);
                highlightedDrivers.push(...connectedDriverIds);
                
                const connectedLeverIds = driverLeverConnections
                    .filter(c => connectedDriverIds.includes(c.driverId))
                    .map(c => c.leverId);
                highlightedLevers.push(...connectedLeverIds);
            }
        }
        

        return { 
            lever: [...new Set(highlightedLevers)], 
            driver: [...new Set(highlightedDrivers)], 
            outcome: [...new Set(highlightedOutcomes)]
        };
    };

    const highlighted = getHighlightedIds();

    const isHighlighted = (id: string, type: 'lever' | 'driver' | 'outcome') => {
        if (!selectedItem && !activeFilter) return false;
        return highlighted[type].includes(id);
    };

    const isConnectionHighlighted = (conn: DriverLeverConnection | OutcomeDriverConnection) => {
        if (!selectedItem && !activeFilter) return false;

        // Connections are only highlighted during item selection, not filtering
        if (activeFilter) return false;
    
        const isDriverLever = 'leverId' in conn;
    
        if (isDriverLever) {
            return highlighted.lever.includes(conn.leverId) && highlighted.driver.includes(conn.driverId);
        } else { // OutcomeDriverConnection
            return highlighted.driver.includes(conn.driverId) && highlighted.outcome.includes(conn.outcomeId);
        }
    };
    
    const getConnectionStyles = (conn: DriverLeverConnection | OutcomeDriverConnection) => {
        const isHighlight = isConnectionHighlighted(conn);
        return {
            stroke: isHighlight ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
            strokeWidth: isHighlight ? '2.5' : '1.2'
        };
    };
    

    const renderGroupedItems = (items: ValueMapItem[], groups: ValueMapGroup[], type: 'lever' | 'driver' | 'outcome') => {
        const groupedItems = items.filter(item => item.groupId && groups.find(g => g.id === item.groupId));
        const ungroupedItems = items.filter(item => !item.groupId || !groups.find(g => g.id === item.groupId));
        
        return (
            <>
                {groups.map((group, index) => {
                    const itemsInGroup = groupedItems.filter(item => item.groupId === group.id);
                    if (itemsInGroup.length === 0) return null;
                    return (
                        <GroupContainer 
                            key={group.id} 
                            group={group} 
                            title={`${type} Group`} 
                            index={index}
                            onClick={() => handleItemClick(group.id, `${type}Group` as SelectedItem['type'])}
                            isSelected={selectedItem?.id === group.id}
                            type={type as 'driver' | 'outcome'}
                        >
                            {itemsInGroup
                                .map(item => (
                                    <ItemCard 
                                        key={item.id} 
                                        item={item} 
                                        type={type} 
                                        onClick={() => handleItemClick(item.id, type)}
                                        isHighlighted={isHighlighted(item.id, type)}
                                        isSelected={selectedItem?.id === item.id}
                                        selectedItem={selectedItem}
                                        activeFilter={activeFilter}
                                    />
                                ))
                            }
                        </GroupContainer>
                    )
                })}
                {ungroupedItems.map(item => (
                    <ItemCard 
                        key={item.id} 
                        item={item} 
                        type={type}
                        onClick={() => handleItemClick(item.id, type)}
                        isHighlighted={isHighlighted(item.id, type)}
                        isSelected={selectedItem?.id === item.id}
                        selectedItem={selectedItem}
                        activeFilter={activeFilter}
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
                    <marker id="arrowhead" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                        <polygon points="0 0, 5 1.75, 0 3.5" fill="hsl(var(--muted-foreground))" />
                    </marker>
                    <marker id="arrowhead-highlight" markerWidth="5" markerHeight="3.5" refX="4.5" refY="1.75" orient="auto">
                        <polygon points="0 0, 5 1.75, 0 3.5" fill="hsl(var(--foreground))" />
                    </marker>
                </defs>
                {driverLeverConnections.map(conn => {
                    const styles = getConnectionStyles(conn);
                    return (
                        <path
                            key={`path-ld-${conn.leverId}-${conn.driverId}`}
                            id={`path-ld-${conn.leverId}-${conn.driverId}`}
                            fill="none"
                            stroke={styles.stroke}
                            strokeWidth={styles.strokeWidth}
                            markerEnd={isConnectionHighlighted(conn) ? "url(#arrowhead-highlight)" : "url(#arrowhead)"}
                            className={'transition-all duration-300'}
                            style={{ opacity: (selectedItem || activeFilter) ? (isConnectionHighlighted(conn) ? 1 : 0.3) : 1 }}
                        />
                    )
                })}
                {outcomeDriverConnections.map(conn => {
                    const styles = getConnectionStyles(conn);
                    return (
                        <path
                            key={`path-do-${conn.driverId}-${conn.outcomeId}`}
                            id={`path-do-${conn.driverId}-${conn.outcomeId}`}
                            fill="none"
                            stroke={styles.stroke}
                            strokeWidth={styles.strokeWidth}
                            markerEnd={isConnectionHighlighted(conn) ? "url(#arrowhead-highlight)" : "url(#arrowhead)"}
                            className={'transition-all duration-300'}
                            style={{ opacity: (selectedItem || activeFilter) ? (isConnectionHighlighted(conn) ? 1 : 0.3) : 1 }}
                        />
                    )
                })}
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
                        selectedItem={selectedItem}
                        activeFilter={activeFilter}
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
        <div className="flex justify-end pt-4">
             <Card className="max-w-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Legend & Filters</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-start gap-2">
                    <Button variant={activeFilter === 'new' ? 'secondary': 'ghost'} size="sm" onClick={() => handleFilterClick('new')} className="flex items-center gap-2 justify-start w-full">
                        <Badge variant="secondary" className="bg-accent/80 text-accent-foreground">New</Badge>
                        <span>Newly Added</span>
                    </Button>
                    <Button variant={activeFilter === 'retired' ? 'secondary': 'ghost'} size="sm" onClick={() => handleFilterClick('retired')} className="flex items-center gap-2 justify-start w-full">
                        <span className="line-through">Retired Item</span>
                        <span>Retired</span>
                    </Button>
                    <Button variant={activeFilter === 'bow' ? 'secondary': 'ghost'} size="sm" onClick={() => handleFilterClick('bow')} className="flex items-center gap-2 justify-start w-full">
                        <Badge variant="secondary">BOW25</Badge>
                        <span>WCE Book of Work 2025</span>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
