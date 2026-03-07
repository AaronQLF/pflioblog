"use client";

import React, { useState } from 'react';

interface TimelineItemProps {
  title: string;
  company?: string;
  period: string;
  achievements?: string[];
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isGrayed?: boolean;
  isEducation?: boolean;
  expandedByDefault?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  title,
  company,
  period,
  achievements = [],
  isActive = false,
  isFirst = false,
  isLast = false,
  isGrayed = false,
  isEducation = false,
  expandedByDefault = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasAchievements = achievements.length > 0;
  // For education: show on hover or by default; for experience: show on hover only
  const shouldShowAchievements = hasAchievements && (isHovered || (isEducation && expandedByDefault));

  return (
    <div
      className={`relative pl-6 pb-3 ${isFirst ? 'pt-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full transition-all duration-300 ${isActive
          ? 'bg-black dark:bg-white scale-125'
          : isGrayed
            ? 'bg-gray-200 dark:bg-zinc-600'
            : isEducation
              ? 'bg-gray-400 dark:bg-zinc-400'
              : 'bg-gray-400 dark:bg-zinc-500'
        } ${isHovered && !isActive ? 'scale-110' : ''}`}></div>

      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-1 top-3 w-[1px] ${isEducation ? 'bg-gray-200 dark:bg-zinc-700' : 'bg-gray-200 dark:bg-zinc-700'
          } h-full -translate-x-1/2 transition-all duration-300 ${isHovered ? 'bg-gray-400 dark:bg-zinc-500' : ''}`}></div>
      )}

      {/* Content */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-grow min-w-0">
            <h3 className={`text-xs font-semibold leading-tight ${isActive
                ? 'text-black dark:text-white'
                : isGrayed
                  ? 'text-gray-400 dark:text-zinc-500'
                  : 'text-gray-700 dark:text-zinc-200'
              }`}>{title}</h3>

            {company && (
              <p className={`text-[10px] font-medium mt-0.5 ${isActive
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-blue-500 dark:text-blue-500'
                }`}>{company}</p>
            )}

            <p className={`text-[10px] mt-0.5 ${isActive
                ? 'text-gray-500 dark:text-zinc-400'
                : isGrayed
                  ? 'text-gray-300 dark:text-zinc-600'
                  : 'text-gray-400 dark:text-zinc-500'
              }`}>{period}</p>
          </div>

          {/* Expand hint for experience items */}
          {hasAchievements && !isEducation && (
            <span className={`text-[9px] shrink-0 mt-0.5 transition-all duration-200 ${isHovered
                ? 'text-blue-500 dark:text-blue-400 opacity-100'
                : 'text-gray-300 dark:text-zinc-600 opacity-60'
              }`}>
              {isHovered ? '▲ hide' : '▼ details'}
            </span>
          )}
        </div>

        {/* Achievements list */}
        <div
          className="overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxHeight: shouldShowAchievements ? `${achievements.length * 32}px` : '0px',
            opacity: shouldShowAchievements ? 1 : 0,
          }}
        >
          <ul className="mt-1.5 ml-1 space-y-0.5">
            {achievements.map((achievement, i) => (
              <li key={i} className="flex items-start text-[10px] text-gray-500 dark:text-zinc-400">
                <span className="text-gray-400 dark:text-zinc-500 mr-1 mt-0.5 shrink-0">•</span>
                <span className="leading-snug">{achievement}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TimelineItem;