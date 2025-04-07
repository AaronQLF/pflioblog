"use client";

import React from 'react';
import TimerCard from './TimerCard';
import WeatherCard from './WeatherCard';
import BooksCard from './BooksCard';
import SpotifyCard from './SpotifyCard';
import PhotoCard from './PhotoCard';
import MontrealMapCard from './MontrealMapCard';
import SocialCard from './SocialCard';
import DocsCard from './DocsCard';
import ExperienceCard from './ExperienceCard';
import ProjectsCard from './ProjectsCard';

const CardSection: React.FC = () => {
  return (
    <section className="px-4 py-5">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TimerCard />
          <WeatherCard />
          <DocsCard />
          <MontrealMapCard />
          <SocialCard />
          <ExperienceCard />
          <ProjectsCard />
          <BooksCard />
          <PhotoCard />
          <SpotifyCard />
        </div>
      </div>
    </section>
  );
};

export default CardSection; 