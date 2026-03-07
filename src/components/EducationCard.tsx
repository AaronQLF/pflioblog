"use client";

import React, { useState, useRef } from 'react';
import TimelineItem from './TimelineItem';

interface Education {
  title: string;
  company: string;
  period: string;
  achievements?: string[];
  isActive?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}

const EducationCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const educations: Education[] = [
    {
      title: "Masters in Mathematics and Computer Science",
      company: "Université de Montréal · MILA",
      period: "2025 – Present · GPA: 4.0/4.0",
      achievements: [
        "Interpretability in large language models",
        "Quantization properties"
      ],
      isFirst: true,
      isActive: true,
    },
    {
      title: "Bachelor of Engineering – Software",
      company: "McGill University",
      period: "2020 – 2025 · GPA: 3.98/4.0",
      achievements: [
        "Major in Software Engineering, Minor in Finance",
        "Dean's Honor List 2020–2024",
        "Rubin Gruber Scholarship & McGill Entrance Scholarship",
        "McGill Merit-based Excellence Bursary",
        "James McGill Award for high academic standing",
        "VP, Moroccan Student Association",
      ],
    },
    {
      title: "Mathematics · Baccalaureate",
      company: "Lycée Mohammed V",
      period: "2017 – 2020 · Grade: 19.25/20",
      achievements: [
        "Valedictorian",
        "National Mathematics Olympiad participant",
        "First city-wide Math baccalaureate grade",
      ],
      isLast: true,
    },
  ];

  return (
    <div
      ref={cardRef}
      className="glass-card hover-scale"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black dark:text-white">Education</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">2017—Present</span>
        </div>

        <div className="flex-grow">
          <div
            className="transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              transform: isHovered ? 'translateX(0)' : 'translateX(5px)',
              opacity: isHovered ? 1 : 0.95,
              transition: 'all 500ms cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {educations.map((edu, index) => (
              <TimelineItem
                key={index}
                title={edu.title}
                company={edu.company}
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
