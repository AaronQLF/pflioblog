"use client";

import React, { useState, useRef } from 'react';
import TimelineItem from './TimelineItem';

interface Education {
  title: string;
  period: string;
  achievements?: string[];
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const EducationCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Define full education list with achievements
  const educations: Education[] = [
    {
      title: "McGill University - Major Software Engineering",
      period: "2020-2025 - Montreal - Bachelor's Degree",
      achievements: [
        "Dean's Honor List 2020-2024",
        "Finance Minor",
        "GPA: 3.95/4.0",
        "McGill Formula Electric",
        "VP of Moroccan Student Association",
        "Excellence Bursary for Computer Science, Computer Engineering and Computer Construction, and Electrical, Electronic and Communications Engineering",
      ],
      isFirst: true,
      isActive: true
    },
    {
      title: "Lycee Mohammed V High School - Mathematics",
      period: "2017-2020 - 19.25/20",
      achievements: [
        "Valedictorian",
        "National Mathematics Olympiad",
        "First City-wide Math baccalaureate grade"
      ],
      isLast: true
    }
  ];
  
  return (
    <div 
      ref={cardRef}
      className="glass-card hover-scale h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black dark:text-white">Education</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">2017—2025</span>
        </div>
        
        <div className="flex-grow overflow-hidden no-scrollbar">
          <div 
            className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]`}
            style={{ 
              maxHeight: isHovered ? '100%' : '100%',
              transform: isHovered ? 'translateX(0)' : 'translateX(5px)', 
              opacity: isHovered ? 1 : 0.95,
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {educations.map((edu, index) => (
              <TimelineItem
                key={index}
                title={edu.title}
                period={edu.period}
                achievements={edu.achievements}
                isActive={edu.isActive}
                isFirst={edu.isFirst}
                isLast={edu.isLast}
                isEducation={true}
                expandedByDefault={true}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EducationCard; 