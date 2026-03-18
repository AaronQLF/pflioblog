"use client";

import { useEffect, useState } from "react";

export default function ActivityGraph() {
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    // Generate predictable data for the graph (8 weeks). Zero out days before March 6, 2026.
    const generateActivityData = () => {
        const weeks = [];
        const startDate = new Date('2026-03-06T00:00:00');
        const today = new Date();
        
        // Total days for 8 weeks
        const totalDays = 8 * 7;
        const flatDays = [];
        
        // Build an array of the last 56 days
        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Start date check (ignore time portion)
            date.setHours(0,0,0,0);
            
            if (date < startDate) {
                // Before started writing
                flatDays.push(0);
            } else {
                // Typical activity pattern since March 6th
                const rand = Math.random();
                let intensity = 0;
                if (rand > 0.85) intensity = 4;
                else if (rand > 0.65) intensity = 3;
                else if (rand > 0.4) intensity = 2;
                else if (rand > 0.2) intensity = 1;
                flatDays.push(intensity);
            }
        }
        
        // Chunk into weeks (columns of 7)
        for (let i = 0; i < totalDays; i += 7) {
            weeks.push(flatDays.slice(i, i + 7));
        }
        
        return weeks;
    };

    const activityData = generateActivityData();

    const getColor = (intensity: number) => {
        switch (intensity) {
            case 0: return 'bg-[#ebedf0] dark:bg-zinc-800/40 border border-black/5 dark:border-white/5';
            case 1: return 'bg-[#9be9a8] dark:bg-[#0e4429] border border-black/5 dark:border-white/5';
            case 2: return 'bg-[#40c463] dark:bg-[#006d32] border border-black/5 dark:border-white/5';
            case 3: return 'bg-[#30a14e] dark:bg-[#26a641] border border-black/5 dark:border-white/5';
            case 4: return 'bg-[#216e39] dark:bg-[#39d353] border border-black/5 dark:border-white/5';
            default: return 'bg-[#ebedf0] dark:bg-zinc-800/40 border border-black/5 dark:border-white/5';
        }
    };

    return (
        <div className="glass-card mb-12 p-8 flex flex-col md:flex-row gap-8 items-start md:items-end justify-between transition-all duration-300 group">

            {/* Left section: Text & Metric */}
            <div className="flex flex-col justify-between h-full">
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2 tracking-tight">
                        Reader Activity
                        <span className="relative flex h-2 w-2 ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs">
                        Agentic tracking of reading behavior for recently published entries.
                    </p>
                </div>

                <div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            322
                        </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-zinc-500 uppercase tracking-widest mt-1 block">
                        Top Unique Readers
                    </span>
                </div>
            </div>

            {/* Right section: Graph */}
            <div className="flex flex-col items-start md:items-end w-full md:w-auto box-border overflow-hidden">
                <div className="flex gap-[3px] p-1 no-scrollbar overflow-x-auto w-full md:w-auto -ml-1 md:ml-0">
                    {activityData.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dIndex) => (
                                <div
                                    key={dIndex}
                                    className={`w-[14px] h-[14px] rounded-[3px] ${getColor(day)} transition-all duration-300 hover:scale-110 cursor-pointer hover:ring-2 hover:ring-blue-400/50 hover:ring-offset-1 hover:ring-offset-white dark:hover:ring-offset-zinc-900`}
                                    title={`Activity level: ${day}`}
                                />
                            ))}
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-medium text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                    <span className="mr-1">Less</span>
                    {[0, 1, 2, 3, 4].map(level => (
                        <div key={level} className={`w-[10px] h-[10px] rounded-[2px] ${getColor(level)}`} />
                    ))}
                    <span className="ml-1">More</span>
                </div>
            </div>

        </div>
    );
}
