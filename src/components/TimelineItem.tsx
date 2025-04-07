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
}

const TimelineItem: React.FC<TimelineItemProps> = ({ 
  title, 
  period, 
  achievements = [],
  isActive = false,
  isFirst = false,
  isLast = false,
  isGrayed = false,
  isEducation = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasAchievements = achievements.length > 0;
  
  return (
    <div 
      className="relative pl-6 pb-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Timeline dot */}
      <div className={`absolute left-0 top-1.5 w-2 h-2 rounded-full ${
        isActive ? 'bg-black' : 
        isGrayed ? 'bg-gray-200' : 
        isEducation ? 'bg-blue-400' : 'bg-gray-400'
      }`}></div>
      
      {/* Timeline line */}
      {!isLast && (
        <div className={`absolute left-1 top-3 w-[1px] ${isEducation ? 'bg-blue-100' : 'bg-gray-200'} h-full -translate-x-1/2`}></div>
      )}
      
      {/* Content */}
      <div>
        <div className="flex items-start">
          <div className="flex-grow">
            <h3 className={`text-xs font-medium ${isActive ? 'text-black' : isGrayed ? 'text-gray-400' : 'text-gray-700'}`}>{title}</h3>
            <p className={`text-[10px] ${isActive ? 'text-gray-500' : isGrayed ? 'text-gray-300' : 'text-gray-400'} mt-0.5`}>{period}</p>
          </div>
          
          {/* Achievement indicator - only for education items with achievements */}
        </div>
        
        {/* Achievements list */}
        {isEducation && hasAchievements && isHovered && (
          <ul className="mt-1 ml-1 text-[10px] text-gray-500 space-y-0.5 transition-all duration-300 ease-in-out">
            {achievements.map((achievement, i) => (
              <li key={i} className="flex items-start achievement-item">
                <span className="text-blue-400 mr-1">•</span>
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