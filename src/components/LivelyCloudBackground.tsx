"use client";

import React from 'react';

const LivelyCloudBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* Soft gradient sky atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-100/50 via-transparent to-amber-50/30 dark:from-slate-900/70 dark:via-transparent dark:to-teal-950/30 opacity-80" />

      {/* Layer 1: Top Sky Clouds */}
      <div
        className="absolute -top-4 left-[2%] text-[var(--color-border)] dark:text-slate-800 opacity-50 dark:opacity-40 animate-[cloudDrift_40s_linear_infinite]"
      >
        <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 85 C15 85 10 65 25 50 C18 30 40 18 60 28 C75 10 115 12 130 32 C150 20 180 32 185 52 C205 52 215 72 200 90 C190 102 165 100 150 98 C120 105 50 102 30 85 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="180 3"
          />
          <path
            d="M65 58 C75 50 95 52 105 60 M135 62 C145 55 160 58 168 66"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div
        className="absolute top-4 left-[42%] text-[var(--color-border)] dark:text-slate-800 opacity-40 dark:opacity-30 animate-[cloudDrift_55s_linear_infinite_reverse]"
      >
        <svg width="170" height="90" viewBox="0 0 170 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 60 C10 60 5 45 18 35 C12 20 30 10 45 18 C58 5 88 8 98 22 C110 12 135 20 138 35 C152 35 160 48 150 62 C140 70 120 68 105 66 C80 72 38 70 20 60 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className="absolute top-12 right-[2%] text-[var(--color-border)] dark:text-slate-800 opacity-55 dark:opacity-45 animate-[cloudDrift_65s_linear_infinite_reverse]"
      >
        <svg width="290" height="155" viewBox="0 0 290 155" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M40 105 C20 105 15 80 35 60 C25 35 55 20 80 32 C100 12 150 15 170 40 C195 25 235 40 240 65 C265 65 275 90 255 112 C240 125 210 122 190 120 C150 128 65 125 40 105 Z"
            fill="currentColor"
            fillOpacity="0.15"
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

      {/* Layer 2: Upper-Mid Sky Clouds */}
      <div
        className="absolute top-[22%] left-[18%] text-[var(--color-border)] dark:text-slate-800 opacity-35 dark:opacity-30 animate-[cloudDrift_50s_linear_infinite]"
      >
        <svg width="210" height="110" viewBox="0 0 210 110" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M25 75 C10 75 8 55 22 42 C15 25 38 14 55 24 C72 8 108 10 122 28 C140 16 168 28 172 48 C190 48 200 65 185 82 C170 92 142 90 125 88 C95 95 45 92 25 75 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div
        className="absolute top-[30%] right-[16%] text-[var(--color-border)] dark:text-slate-800 opacity-40 dark:opacity-35 animate-[cloudDrift_70s_linear_infinite_reverse]"
      >
        <svg width="230" height="120" viewBox="0 0 230 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 80 C15 80 12 60 26 46 C20 28 42 16 62 25 C78 9 115 11 130 28 C148 18 178 28 182 48 C198 48 208 65 194 82 C180 92 152 90 136 88 C105 95 50 92 30 80 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M70 52 C82 45 102 46 112 54"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      {/* Layer 3: Mid Screen Clouds */}
      <div
        className="absolute top-[44%] left-[-2%] text-[var(--color-border)] dark:text-slate-800 opacity-45 dark:opacity-35 animate-[cloudDrift_80s_linear_infinite]"
      >
        <svg width="260" height="140" viewBox="0 0 260 140" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M35 95 C15 95 10 72 30 55 C22 32 52 20 75 32 C95 12 145 15 165 40 C190 25 225 38 230 62 C252 62 262 85 242 105 C228 118 198 115 178 113 C140 120 60 118 35 95 Z"
            fill="currentColor"
            fillOpacity="0.14"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M80 62 C92 52 118 55 130 65 M170 68 C182 60 200 62 210 72"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div
        className="absolute top-[52%] right-[28%] text-[var(--color-border)] dark:text-slate-800 opacity-30 dark:opacity-25 animate-[cloudDrift_48s_linear_infinite_reverse]"
      >
        <svg width="180" height="95" viewBox="0 0 180 95" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M22 65 C10 65 6 48 18 38 C12 22 32 12 48 20 C62 6 92 8 104 22 C118 12 142 20 145 36 C160 36 168 50 156 64 C144 74 122 72 108 70 C82 76 40 74 22 65 Z"
            fill="currentColor"
            fillOpacity="0.08"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Layer 4: Lower Sky Clouds */}
      <div
        className="absolute top-[68%] left-[8%] text-[var(--color-border)] dark:text-slate-800 opacity-40 dark:opacity-35 animate-[cloudDrift_62s_linear_infinite]"
      >
        <svg width="240" height="130" viewBox="0 0 240 130" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M35 90 C15 90 10 70 28 52 C20 30 48 18 70 28 C88 10 130 12 145 34 C168 20 200 34 205 56 C225 56 235 78 218 96 C202 108 175 105 158 103 C128 110 55 107 35 90 Z"
            fill="currentColor"
            fillOpacity="0.12"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M75 58 C88 48 110 50 120 60"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>

      <div
        className="absolute top-[75%] right-[-1%] text-[var(--color-border)] dark:text-slate-800 opacity-45 dark:opacity-35 animate-[cloudDrift_58s_linear_infinite_reverse]"
      >
        <svg width="270" height="145" viewBox="0 0 270 145" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M38 100 C18 100 12 76 32 58 C24 34 54 22 78 34 C98 14 148 16 168 42 C192 26 228 40 232 65 C255 65 265 88 245 108 C230 120 200 118 180 115 C142 122 60 120 38 100 Z"
            fill="currentColor"
            fillOpacity="0.13"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Layer 5: Bottom Horizon Clouds */}
      <div
        className="absolute top-[88%] left-[25%] text-[var(--color-border)] dark:text-slate-800 opacity-35 dark:opacity-30 animate-[cloudDrift_72s_linear_infinite]"
      >
        <svg width="220" height="115" viewBox="0 0 220 115" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M28 80 C12 80 8 62 24 48 C18 28 42 16 60 26 C76 8 112 10 126 28 C144 16 172 26 176 46 C194 46 204 62 190 78 C176 88 148 86 132 84 C102 90 48 88 28 80 Z"
            fill="currentColor"
            fillOpacity="0.1"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Hand-Drawn Birds in Flight */}
      <div className="absolute top-28 left-[15%] text-[var(--color-muted)] opacity-35">
        <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 14 C10 4 18 12 20 16 C22 12 30 4 38 14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="absolute top-36 left-[18%] text-[var(--color-muted)] opacity-30">
        <svg width="30" height="16" viewBox="0 0 30 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 11 C8 3 14 9 15 12 C16 9 22 3 28 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
      <div className="absolute top-[48%] right-[10%] text-[var(--color-muted)] opacity-30">
        <svg width="35" height="18" viewBox="0 0 35 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 12 C9 4 15 10 17.5 14 C19.5 10 26 4 33 12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        </svg>
      </div>

      {/* Sketchy Sparkles */}
      <div className="absolute top-24 left-[28%] text-amber-400/40 dark:text-amber-300/30">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 4V8M16 24V28M4 16H8M24 16H28M7.5 7.5L10.3 10.3M21.7 21.7L24.5 24.5M7.5 24.5L10.3 21.7M21.7 10.3L24.5 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div className="absolute top-48 right-[22%] text-amber-400/30 dark:text-amber-300/20">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2V5M12 19V22M2 12H5M19 12H22M4.9 4.9L7 7M17 17L19.1 19.1M4.9 19.1L7 17M17 7L19.1 4.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
};

export default LivelyCloudBackground;
