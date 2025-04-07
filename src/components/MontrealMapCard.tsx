"use client";

import React, { useState } from 'react';

const MontrealMapCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="experience-card flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700">Map</h2>
      </div>
      
      <div className="flex-grow relative bg-[#242424] rounded-lg overflow-hidden">
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-overlay"></div>
        
        {/* Map SVG */}
        <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Water */}
          <path 
            d="M0 0 H400 V300 H0 Z" 
            fill="#1c1c1c"
            className={`transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-90'}`}
          />
          
          {/* Montreal Island */}
          <path 
            d="M100 150 C120 120 180 100 220 130 C260 160 280 170 300 150 C320 130 300 200 280 220 C260 240 200 250 160 230 C120 210 80 180 100 150 Z" 
            fill="#242424" 
            stroke="#333" 
            strokeWidth="1"
            className={`transition-transform duration-300 ${isHovered ? 'scale-105' : 'scale-100'}`}
          />
          
          {/* Roads */}
          <path d="M140 140 L260 160" stroke="#333" strokeWidth="0.5" />
          <path d="M180 120 L200 220" stroke="#333" strokeWidth="0.5" />
          <path d="M120 160 L240 220" stroke="#333" strokeWidth="0.5" />
          <path d="M220 130 L240 180" stroke="#333" strokeWidth="0.5" />
          <path d="M160 200 L260 180" stroke="#333" strokeWidth="0.5" />
        </svg>
        
        {/* Montreal Pin & Label */}
        <div 
          className={`absolute left-[50%] top-[45%] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${isHovered ? 'scale-110' : ''}`}
        >
          {/* Pin */}
          <div className="relative">
            {/* Pin base */}
            <div 
              className="w-6 h-6 bg-white rounded-full shadow-lg transform-gpu transition-transform duration-300 hover:scale-110 hover:shadow-xl z-10 flex items-center justify-center relative"
            >
              {/* Pulsing circle on hover */}
              {isHovered && (
                <div className="absolute w-10 h-10 bg-white/30 rounded-full animate-ping"></div>
              )}
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
            
            {/* Montreal label */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center">
              <p className="text-white text-xs font-medium whitespace-nowrap">Montreal</p>
              <p className="text-gray-400 text-[8px]">Canada</p>
              <p className="text-gray-500 text-[7px] mt-1">45.5017° N, 73.5673° W</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <p className="text-xs text-gray-500">I&apos;ve lived in Montreal since 2018. It&apos;s a city that balances European charm with North American practicality.</p>
      </div>
    </div>
  );
};

export default MontrealMapCard; 