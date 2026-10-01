"use client";

import React from 'react';

const LivelyCloudBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Soft gradient sky atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/40 via-transparent to-amber-50/20 dark:from-slate-900/60 dark:via-transparent dark:to-teal-950/20 opacity-70" />

      {/* Cloud 1 - Top Left Drifter */}
      <div
        className="absolute -top-4 left-[5%] text-[var(--color-border)] dark:text-slate-800 opacity-40 dark:opacity-35 animate-[cloudDrift_45s_linear_infinite]"
      >
        <svg width="220" height="120" viewBox="0 0 220 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 85 C15 85 10 65 25 50 C18 30 40 18 60 28 C75 10 115 12 130 32 C150 20 180 32 185 52 C205 52 215 72 200 90 C190 102 165 100 150 98 C120 105 50 102 30 85 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="180 3"
          />
          {/* Hand-drawn swirl detail */}
          <path
            d="M65 58 C75 50 95 52 105 60 M135 62 C145 55 160 58 168 66"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Cloud 2 - Top Right Large Fluffy Cloud */}
      <div
        className="absolute top-16 right-[3%] text-[var(--color-border)] dark:text-slate-800 opacity-45 dark:opacity-40 animate-[cloudDrift_60s_linear_infinite_reverse]"
      >
        <svg width="280" height="150" viewBox="0 0 280 150" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40 105 C20 105 15 80 35 60 C25 35 55 20 80 32 C100 12 150 15 170 40 C195 25 235 40 240 65 C265 65 275 90 255 112 C240 125 210 122 190 120 C150 128 65 125 40 105 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M85 70 C98 60 125 62 138 72 M180 75 C195 66 215 70 225 80"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Cloud 3 - Mid Screen Left */}
      <div
        className="absolute top-[38%] left-[-2%] text-[var(--color-border)] dark:text-slate-800 opacity-30 dark:opacity-25 animate-[cloudDrift_75s_linear_infinite]"
      >
        <svg width="190" height="100" viewBox="0 0 190 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M25 70 C10 70 8 52 20 40 C15 22 35 12 50 20 C65 5 95 8 110 24 C125 15 150 24 155 40 C170 40 180 55 168 72 C155 82 130 80 115 78 C90 85 40 82 25 70 Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Cloud 4 - Lower Mid Screen Right */}
      <div
        className="absolute top-[62%] right-[-1%] text-[var(--color-border)] dark:text-slate-800 opacity-35 dark:opacity-30 animate-[cloudDrift_55s_linear_infinite_reverse]"
      >
        <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M35 90 C15 90 10 70 28 52 C20 30 48 18 70 28 C88 10 130 12 145 34 C168 20 200 34 205 56 C225 56 235 78 218 96 C202 108 175 105 158 103 C128 110 55 107 35 90 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Small Sketchy Sparkles / Sun Rays */}
      <div className="absolute top-24 left-[28%] text-amber-400/30 dark:text-amber-300/20">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4V8M16 24V28M4 16H8M24 16H28M7.5 7.5L10.3 10.3M21.7 21.7L24.5 24.5M7.5 24.5L10.3 21.7M21.7 10.3L24.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-48 right-[22%] text-amber-400/25 dark:text-amber-300/15">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7 7M17 17L19.1 19.1M4.9 19.1L7 17M17 7L19.1 4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

export default LivelyCloudBackground;
