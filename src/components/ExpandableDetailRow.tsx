"use client";

import React from "react";

export interface ExpandableDetailRowProps {
  title: string;
  company: string;
  period: string;
  achievements: string[];
  isOpen: boolean;
  onToggle: () => void;
  isActive?: boolean;
}

const ExpandableDetailRow: React.FC<ExpandableDetailRowProps> = ({
  title,
  company,
  period,
  achievements,
  isOpen,
  onToggle,
  isActive = false,
}) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isOpen}
      className="block w-full text-left py-3.5 group border-b border-[var(--color-border)] last:border-0 transition-colors duration-200"
    >
      <div className="flex gap-2.5">
        <span
          className="w-2 shrink-0 flex justify-center pt-1.5"
          aria-hidden
        >
          {isActive ? (
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent)]" />
          ) : null}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-sans leading-snug">
            <span className="font-medium group-hover:text-[var(--color-accent)] transition-colors duration-200">
              {title}
            </span>
            <span className="text-[var(--color-muted)]"> · {company}</span>
          </p>
          <p className="text-xs font-mono text-[var(--color-muted)] mt-1.5 leading-relaxed break-words">
            {period}
          </p>
        </div>
      </div>

      <div
        className={`overflow-hidden transition-all duration-300 ease-out ${
          isOpen ? "max-h-[2000px] opacity-100 mt-3" : "max-h-0 opacity-0"
        }`}
      >
        <ul className="space-y-1.5 pb-0.5 pl-[18px]">
          {achievements.map((a, i) => (
            <li
              key={i}
              className="text-[13px] text-[var(--color-muted)] leading-relaxed pl-3 relative before:content-[''] before:absolute before:left-0 before:top-[9px] before:w-1 before:h-px before:bg-[var(--color-border)]"
            >
              {a}
            </li>
          ))}
        </ul>
      </div>
    </button>
  );
};

export default ExpandableDetailRow;
