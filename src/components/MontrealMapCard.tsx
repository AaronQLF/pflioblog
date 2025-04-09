"use client";

import React, { useState, useRef } from 'react';
import Image from 'next/image';

const MontrealMapCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  return (
    <div 
      ref={cardRef}
      className="glass-card hover-scale h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black dark:text-white">Location</h2>
          <span className="text-xs text-gray-500 dark:text-zinc-400">Montreal, Canada</span>
        </div>
        
        <div className="flex-grow relative rounded-xl overflow-hidden">
          {/* Map images for light and dark mode */}
          <div className="absolute inset-0 block dark:hidden">
            <Image
              src="/images/projects/Desktop_16-9_White_Montreal.png"
              alt="Montreal Map - Light Mode"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
          
          <div className="absolute inset-0 hidden dark:block">
            <Image
              src="/images/projects/Desktop_16-9_Black_Montreal.png"
              alt="Montreal Map - Dark Mode"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 300px"
            />
          </div>
          
          {/* Montreal Pin & Label */}
          <div 
            className={`absolute left-[50%] top-[45%] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isHovered ? 'scale-110' : ''}`}
          >
            {/* Pin */}
            <div className="relative">
              {/* Pin base */}
              <div 
                className="w-5 h-5 bg-white/80 dark:bg-zinc-200/80 backdrop-blur-sm rounded-full shadow-sm transform-gpu transition-transform duration-300 hover:scale-110 hover:shadow-md z-10 flex items-center justify-center relative"
              >
                {/* Pulsing circle on hover */}
                {isHovered && (
                  <div className="absolute w-10 h-10 bg-white/20 dark:bg-zinc-200/20 rounded-full animate-ping"></div>
                )}
                <div className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full"></div>
              </div>
              
              {/* Montreal label */}
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-[10px] text-gray-600 dark:text-zinc-400 leading-relaxed">
            A city that beautifully balances European charm with North American practicality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MontrealMapCard; 