"use client";

import React, { useState } from 'react';
import Image from 'next/image';

const MontrealMapCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      className="experience-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative pb-[80%] w-full mb-4 rounded-2xl overflow-hidden">
        {/* Map Label */}
        <div className="absolute z-10 top-4 left-4 bg-white rounded-full px-3 py-1 shadow-sm">
          <span className="text-sm font-medium">Map</span>
        </div>
        
        {/* Montreal Map - Dark Style */}
        <div className="absolute inset-0 bg-[#242424]">
          {/* Dark Background with Grid */}
          <div className="absolute inset-0 bg-grid-overlay"></div>
          
          {/* Simple map representation */}
          <div className={`absolute inset-0 transition-all duration-500 ${isHovered ? 'opacity-100' : 'opacity-90'}`}>
            <svg viewBox="0 0 800 600" className="w-full h-full">
              {/* Water */}
              <path 
                d="M100,300 Q250,150 400,300 T700,300 V600 H100 Z" 
                fill="#384045" 
                className="transition-all duration-700"
              />
              
              {/* Land */}
              <path 
                d="M100,300 Q250,450 400,300 T700,300 V100 H100 Z" 
                fill="#2A2A2A" 
                className="transition-all duration-700"
              />
              
              {/* Roads */}
              <path 
                d="M200,100 L600,500 M300,100 L700,500 M100,300 L700,300 M400,100 L400,500" 
                stroke="#444444" 
                strokeWidth="2"
                className="transition-all duration-700"
              />
              
              {/* Montreal Island Shape - simplified */}
              <path 
                d="M300,250 Q350,200 400,250 T500,250 Q520,280 500,320 T400,350 Q350,330 300,350 T200,300 Q250,250 300,250 Z" 
                fill="#292929" 
                stroke="#444444" 
                strokeWidth="1"
                className={`transition-all duration-700 ${isHovered ? 'fill-[#303030]' : ''}`}
              />
            </svg>
          </div>
          
          {/* Pin for Montreal */}
          <div className="absolute top-[45%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-300">
            <div className="w-3 h-3 bg-white rounded-full shadow-lg"></div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-b-[8px] border-l-transparent border-r-transparent border-b-white"></div>
            
            {/* Pulsing circle */}
            {isHovered && (
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -z-10 montreal-pin-pulse"></div>
            )}
          </div>
        </div>
      </div>
      <div className="text-center py-2">
        <h3 className="font-medium text-lg tracking-[0.2em]">M O N T R E A L</h3>
        <p className="text-xs text-gray-400 mt-1 tracking-[0.1em]">C A N A D A</p>
        <p className="text-[10px] text-gray-400 mt-2">45.5017° N, 73.5673° W</p>
      </div>
    </div>
  );
};

export default MontrealMapCard; 