"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface CardSectionProps {
  title: string;
  subtitle?: string;
  imageSrc: string;
  link?: string;
  altText: string;
  darkMode?: boolean;
  fullWidth?: boolean;
}

const CardSection: React.FC<CardSectionProps> = ({
  title,
  subtitle,
  imageSrc,
  link,
  altText,
  darkMode = false,
  fullWidth = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const CardContent = () => (
    <div 
      className={`
        transform transition-all duration-700 ease-in-out h-full
        ${isHovered ? 'translate-y-[-6px] shadow-xl' : ''}
        rounded-lg overflow-hidden border border-slate-200
        ${darkMode ? 'bg-[#333]' : 'bg-white'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative pb-[70%] w-full bg-slate-50">
        {/* Placeholder background while image loads */}
        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        </div>
        
        {/* Actual image */}
        <div className="absolute inset-0">
          <Image
            src={imageSrc}
            alt={altText}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover transition-transform duration-1000 ease-in-out ${isHovered ? 'scale-105' : 'scale-100'}`}
            priority
          />
        </div>
      </div>
      <div className="p-4 text-left">
        <h3 className={`font-medium text-base ${darkMode ? 'text-white' : ''}`}>{title}</h3>
        {subtitle && <p className={`text-sm ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>{subtitle}</p>}
      </div>
    </div>
  );

  if (link) {
    return (
      <Link href={link} className="block h-full">
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="h-full">
      <CardContent />
    </div>
  );
};

export default CardSection; 