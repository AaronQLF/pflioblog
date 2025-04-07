"use client";

import React, { useState } from 'react';
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
      className="education-card flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700">My Education</h2>
        {!isHovered && (
          <p className="text-[10px] text-blue-400 mt-1">    </p>
        )}
      </div>
      
      <div className="flex-grow relative overflow-hidden rounded-2xl bg-white">
        <div className={`timeline-container transition-all duration-800 ease-in-out`}
             style={{ 
               maxHeight: isHovered ? '800px' : '180px',
               transform: isHovered ? 'translateX(0)' : 'translateX(10px)', 
               opacity: isHovered ? 1 : 0.95,
               transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
             }}>
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
            />
          ))}
        </div>
        
        {/* Indicator to show there are more items */}
        {!isHovered && (
          <>
            <div className="education-fade" />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center pb-1 z-10">
              <span className="text-[10px] text-blue-400 transition-opacity duration-500"></span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EducationCard; 