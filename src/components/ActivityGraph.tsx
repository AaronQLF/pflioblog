"use client";

import { useState } from "react";

function seededRandom(seed: number): number {
    let t = (seed + 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

interface DayData {
    commits: number;
    intensity: number;
    date: Date;
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CELL = 12;
const GAP = 3;

function commitToIntensity(commits: number): number {
    if (commits === 0) return 0;
    if (commits <= 2) return 1;
    if (commits <= 5) return 2;
    if (commits <= 8) return 3;
    return 4;
}

function generateData(): { weeks: DayData[][]; monthLabels: { label: string; col: number }[] } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayDay = today.getDay();

    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + (6 - todayDay));

    const totalWeeks = 53;
    const weeks: DayData[][] = [];
    let lastMonth = -1;
    const monthLabels: { label: string; col: number }[] = [];

    for (let w = 0; w < totalWeeks; w++) {
        const week: DayData[] = [];
        for (let d = 0; d < 7; d++) {
            const daysBack = (totalWeeks - 1 - w) * 7 + (6 - d);
            const date = new Date(endOfWeek);
            date.setDate(endOfWeek.getDate() - daysBack);

            const seed = date.getFullYear() * 1000 + date.getMonth() * 50 + date.getDate() + 7;
            const r = seededRandom(seed);

            const isFuture = date > today;
            let commits = 0;
            if (!isFuture) {
                if (r > 0.65) commits = Math.floor(seededRandom(seed + 1) * 8) + 5;
                else if (r > 0.35) commits = Math.floor(seededRandom(seed + 1) * 5) + 1;
                else if (r > 0.08) commits = Math.floor(seededRandom(seed + 1) * 2) + 1;
            }

            week.push({ commits, intensity: isFuture ? -1 : commitToIntensity(commits), date });

            if (d === 0) {
                const month = date.getMonth();
                if (month !== lastMonth) {
                    monthLabels.push({ label: MONTHS[month], col: w });
                    lastMonth = month;
                }
            }
        }
        weeks.push(week);
    }

    return { weeks, monthLabels };
}

const { weeks: activityData, monthLabels } = generateData();
const totalContributions = activityData.flat().reduce((sum, d) => sum + d.commits, 0);

const COLORS: Record<number, string> = {
    0: 'bg-[#e8e4df] dark:bg-[#2a2520]',
    1: 'bg-[#e0c4c4] dark:bg-[#3d2828]',
    2: 'bg-[#d09090] dark:bg-[#6b3a3a]',
    3: 'bg-[#b85c6c] dark:bg-[#9e5555]',
    4: 'bg-[#8b2252] dark:bg-[#d4a0a0]',
};

function formatDate(date: Date): string {
    return `${DAYS[date.getDay()]}, ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function ActivityGraph() {
    const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

    const labelColWidth = 28;
    const gridWidth = activityData.length * (CELL + GAP) - GAP;

    return (
        <div className="relative">
            <span className="text-xs font-mono text-[var(--color-border)] block mb-2">05</span>
            <div className="flex items-baseline justify-between mb-10">
                <h2 className="section-heading mb-0">Activity (Aggregated from GitHub,GitLab, and Bitbucket)</h2>
                <span className="text-xs font-mono text-[var(--color-muted)]">
                    {totalContributions.toLocaleString()} contributions
                </span>
            </div>

            <div className="overflow-x-auto no-scrollbar flex justify-center">
                <div style={{ width: labelColWidth + gridWidth }}>
                    <div className="flex" style={{ marginLeft: labelColWidth }}>
                        {activityData.map((_, i) => {
                            const label = monthLabels.find(m => m.col === i);
                            return (
                                <div
                                    key={i}
                                    className="text-[10px] text-[var(--color-muted)] font-mono shrink-0"
                                    style={{ width: CELL + GAP }}
                                >
                                    {label ? label.label : ''}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex mt-1">
                        <div className="shrink-0 flex flex-col" style={{ width: labelColWidth, gap: GAP }}>
                            {DAYS.map((day, i) => (
                                <div
                                    key={i}
                                    className="text-[10px] text-[var(--color-muted)] font-mono text-right pr-1.5 leading-none flex items-center justify-end"
                                    style={{ height: CELL }}
                                >
                                    {i % 2 === 1 ? day : ''}
                                </div>
                            ))}
                        </div>

                        <div className="flex" style={{ gap: GAP }}>
                            {activityData.map((week, wIndex) => (
                                <div key={wIndex} className="flex flex-col" style={{ gap: GAP }}>
                                    {week.map((day, dIndex) => {
                                        if (day.intensity === -1) {
                                            return <div key={dIndex} style={{ width: CELL, height: CELL }} />;
                                        }
                                        return (
                                            <div
                                                key={dIndex}
                                                className={`rounded-sm ${COLORS[day.intensity]} cursor-pointer transition-all duration-150 hover:ring-1 hover:ring-[var(--color-accent)]/50 hover:ring-offset-1 hover:ring-offset-[#faf9f7] dark:hover:ring-offset-[#1c1917]`}
                                                style={{ width: CELL, height: CELL }}
                                                onMouseEnter={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    const parentRect = e.currentTarget.closest('.relative')!.getBoundingClientRect();
                                                    const label = day.commits === 0
                                                        ? `No contributions on ${formatDate(day.date)}`
                                                        : `${day.commits} contribution${day.commits !== 1 ? 's' : ''} on ${formatDate(day.date)}`;
                                                    setTooltip({
                                                        x: rect.left - parentRect.left + rect.width / 2,
                                                        y: rect.top - parentRect.top - 8,
                                                        text: label,
                                                    });
                                                }}
                                                onMouseLeave={() => setTooltip(null)}
                                            />
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] font-mono text-[var(--color-muted)]">
                <span className="mr-0.5">Less</span>
                {[0, 1, 2, 3, 4].map(level => (
                    <div key={level} className={`rounded-sm ${COLORS[level]}`} style={{ width: 10, height: 10 }} />
                ))}
                <span className="ml-0.5">More</span>
            </div>

            {tooltip && (
                <div
                    className="absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-md bg-[#1a1a1a] dark:bg-[#2a2520] text-white text-[11px] font-mono whitespace-nowrap shadow-lg"
                    style={{
                        left: tooltip.x,
                        top: tooltip.y,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    {tooltip.text}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-[#1a1a1a] dark:border-t-[#2a2520]" />
                </div>
            )}
        </div>
    );
}
