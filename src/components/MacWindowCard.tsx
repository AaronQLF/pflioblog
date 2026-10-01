"use client";

import React from 'react';

interface MacWindowCardProps {
  title: string;
  actionText?: string;
  children: React.ReactNode;
  className?: string;
  headerClassName?: string;
}

const MacWindowCard: React.FC<MacWindowCardProps> = ({
  title,
  actionText,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div className={`mac-window ${className}`}>
      <div className={`mac-titlebar ${headerClassName}`}>
        <div className="flex items-center gap-2">
          <div className="win-dots">
            <span className="win-dot win-dot-close" title="Close" />
            <span className="win-dot win-dot-min" title="Minimize" />
            <span className="win-dot win-dot-zoom" title="Zoom" />
          </div>
        </div>

        <div className="font-mono text-xs tracking-tight text-[var(--color-muted)] font-medium truncate max-w-[200px] sm:max-w-[320px] text-center">
          {title}
        </div>

        <div className="flex items-center gap-2">
          {actionText ? (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--color-border)] text-[var(--color-muted)] bg-[var(--color-surface)]/60">
              {actionText}
            </span>
          ) : (
            <div className="w-12" />
          )}
        </div>
      </div>

      <div className="p-5 sm:p-6 md:p-7">
        {children}
      </div>
    </div>
  );
};

export default MacWindowCard;
