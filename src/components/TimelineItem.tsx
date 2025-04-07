"use client";

import React, { useState } from 'react';

interface TimelineItemProps {
  title: string;
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
  const shouldShowAchievements = isEducation && hasAchievements && (isHovered || expandedByDefault);
  
  return (
    <div 
      className={`relative pl-6 pb-3 ${isFirst ? 'pt-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${
        isActive ? 'bg-black dark:bg-white' : 
        isGrayed ? 'bg-gray-200 dark:bg-zinc-600' : 
        isEducation ? 'bg-gray-400 dark:bg-zinc-400' : 'bg-gray-400 dark:bg-zinc-500'
      }`}></div>
      
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-1 top-3 w-[1px] ${isEducation ? 'bg-gray-200 dark:bg-zinc-700' : 'bg-gray-200 dark:bg-zinc-700'} h-full -translate-x-1/2`}></div>
      )}
      
      {/* Content */}
      <div>
        <div className="flex items-start">
          <div className="flex-grow">
            <h3 className={`text-xs font-medium ${
              isActive ? 'text-black dark:text-white' : 
              isGrayed ? 'text-gray-400 dark:text-zinc-500' : 
              'text-gray-700 dark:text-zinc-300'
            }`}>{title}</h3>
            <p className={`text-[10px] ${
              isActive ? 'text-gray-500 dark:text-zinc-400' : 
              isGrayed ? 'text-gray-300 dark:text-zinc-600' : 
              'text-gray-400 dark:text-zinc-500'
            } mt-0.5`}>{period}</p>
          </div>
          
          {/* Achievement indicator - only for education items with achievements */}
        </div>
        
        {/* Achievements list */}
        {shouldShowAchievements && (
          <ul className="mt-1 ml-1 text-[10px] text-gray-500 dark:text-zinc-400 space-y-0.5 transition-all duration-300 ease-in-out">
            {achievements.map((achievement, i) => (
              <li key={i} className={`flex items-start ${expandedByDefault ? 'opacity-100 translate-y-0 scale-100' : 'achievement-item'}`}>
                <span className="text-gray-500 dark:text-zinc-400 mr-1">•</span>
                <span>{achievement}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TimelineItem; 