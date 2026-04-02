"use client";

import React, { useState } from "react";
import ExpandableDetailRow from "./ExpandableDetailRow";

const EducationCard: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const educations = [
    {
      title: "Masters in Mathematics and Computer Science",
      company: "Université de Montréal · MILA",
      period: "2025 – Present · GPA: 4.0/4.0",
      isActive: true,
      achievements: [
        "Interpretability in large language models",
        "Quantization properties",
      ],
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
      period: "2017 – 2020 · Grade: 19.88/20",
      achievements: [
        "Valedictorian",
        "2017 Regional Mathematics Olympiad winner",
        "2019 National Mathematics Olympiad participant (2nd place)",
        "First city-wide Math baccalaureate grade",
      ],
    },
  ];

  return (
    <div>
      <span className="text-xs font-mono text-[var(--color-border)] block mb-2">02</span>
      <div className="flex items-baseline justify-between gap-4 mb-10">
        <h2 className="section-heading mb-0">Education</h2>
        <span className="text-xs font-mono text-[var(--color-muted)] shrink-0">
          2017 — Present
        </span>
      </div>

      <div className="space-y-0">
        {educations.map((edu, index) => (
          <ExpandableDetailRow
            key={index}
            title={edu.title}
            company={edu.company}
            period={edu.period}
            achievements={edu.achievements}
            isActive={edu.isActive}
            isOpen={openIndex === index}
            onToggle={() =>
              setOpenIndex((prev) => (prev === index ? null : index))
            }
          />
        ))}
      </div>
    </div>
  );
};

export default EducationCard;
