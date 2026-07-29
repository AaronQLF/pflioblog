"use client";

import React, { useState } from "react";
import ExpandableDetailRow from "./ExpandableDetailRow";

interface Experience {
  title: string;
  company: string;
  period: string;
  isActive?: boolean;
  achievements: string[];
}

const ExperienceCard: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const experiences: Experience[] = [
    {
      title: "R&D Lead",
      company: "Stingray Digital",
      period: "Feb 2026 – Present · Full-time",
      isActive: true,
      achievements: [
        "Led development of an internal LLM-powered engineering assistant using RAG pipelines and custom agent tools",
        "Designed and implemented custom AI agent toolchains (LangChain-based) integrating internal APIs and knowledge bases",
        "Built a real-time AI voice synthesis pipeline for radio content generation and broadcast personalization",
        "Developed conversational AI chatbot interfaces with TypeScript/React and Python backends",
        "Architected AI service infrastructure connecting LLM services, vector databases, and internal datasets",
      ],
    },
    {
      title: "Analyst",
      company: "CDPQ",
      period: "Jan 2025 – Jan 2026 · Full-time",
      achievements: [
        "Researched and backtested systematic alpha signals across equity and fixed-income universes using factor decomposition and cross-sectional momentum strategies",
        "Built a multi-factor portfolio optimization engine in Python (cvxpy) with risk-parity and mean-CVaR constraints, integrated with Snowflake data pipelines",
        "Developed a Monte Carlo-based scenario analysis platform for stress-testing fixed-income portfolios under interest rate and credit spread shocks",
        "Constructed performance attribution models (Brinson-Hood-Beebower) to decompose active returns across allocation, selection, and currency effects",
        "Automated daily risk reporting (VaR, Expected Shortfall, DV01) via a Flask API connecting 5+ internal systems, eliminating 15hrs/week of manual work",
      ],
    },
    {
      title: "Analyst Intern",
      company: "CDPQ",
      period: "Oct 2024 – Jan 2025",
      achievements: [
        "Built LangChain/RAG AI assistant for code architecture questions, accelerating team onboarding",
        "Developed TypeScript data library that standardized dataset processing, cut cloud costs by $13K/year",
      ],
    },
    {
      title: "Software Engineering Lead",
      company: "McGill Formula Electric",
      period: "Sep 2021 – Dec 2024",
      achievements: [
        "Developed Anti-lock Braking System using C/C++ and Arduino integration, 32% improvement in response time",
        "Built computer vision software with C++ and OpenCV to measure driver characteristics with 99.3% accuracy",
        "Created ML algorithm in TensorFlow to predict tire wear patterns, improving maintenance accuracy by 30%",
        "Developed real-time telemetry system in Python for remote diagnostics, increasing data speed by 25%",
      ],
    },
    {
      title: "Software Engineering Intern",
      company: "CDPQ's Otera Capital",
      period: "Sep 2023 – Jan 2024",
      achievements: [
        "Implemented Docker and AWS for app deployment, integrated Amazon's Airflow and PostgreSQL to automate cashflow reports and currency rate updates",
        "Achieved a 40% reduction in report generation time through pipeline automation",
      ],
    },
    {
      title: "Software Engineering Intern",
      company: "CDPQ's Otera Capital",
      period: "May 2023 – Sep 2023",
      achievements: [
        "Built portfolio simulation tool using Flask, React.js, and Monte Carlo modeling; reduced analysis time from 15hrs to 3hrs (5× improvement)",
      ],
    },
    {
      title: "Full Stack Developer Intern",
      company: "OneDesk",
      period: "May 2022 – Sep 2022",
      achievements: [
        "Leveraged Java, HTML, and Angular to redesign web portals meeting 508 Compliance standards",
        "Collaborated with Spring and Hibernate to introduce new features, resulting in 11% reduction in page loading time",
        "Developed workflow automation systems using C++ and Java, achieving 87% reduction in repetitive task time",
      ],
    },
  ];

  return (
    <div>
      <span className="text-xs font-mono text-[var(--color-border)] block mb-2">01</span>
      <div className="flex items-baseline justify-between gap-4 mb-10">
        <h2 className="section-heading mb-0">Experience</h2>
        <span className="text-xs font-mono text-[var(--color-muted)] shrink-0">
          2022 — Present
        </span>
      </div>

      <div className="space-y-0">
        {experiences.map((exp, index) => (
          <ExpandableDetailRow
            key={`${exp.title}-${exp.company}-${exp.period}`}
            title={exp.title}
            company={exp.company}
            period={exp.period}
            achievements={exp.achievements}
            isActive={exp.isActive}
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

export default ExperienceCard;
