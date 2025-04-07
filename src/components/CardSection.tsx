"use client";

import React from 'react';
import BooksCard from './BooksCard';
import MontrealMapCard from './MontrealMapCard';
import ExperienceCard from './ExperienceCard';
import ProjectsCard from './ProjectsCard';

const CardSection: React.FC = () => {
  return (
    <section className="px-4 py-5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ExperienceCard />
          <MontrealMapCard />
          <BooksCard />
          <ProjectsCard />
        </div>
      </div>
    </section>
  );
};

export default CardSection; 