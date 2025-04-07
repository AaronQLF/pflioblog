"use client";

import React, { useState, useRef, useEffect } from 'react';

const MontrealMapCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  // Handle mousedown event and stop propagation
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };
  
  // Reset expanded state on document click (only if not clicking inside the card)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);
  
  return (
    <div 
      ref={cardRef}
      className="glass-card hover-scale h-full"
      onMouseDown={handleMouseDown}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black dark:text-white">Location</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Montreal, Canada</span>
        </div>
        
        <div className="flex-grow relative rounded-xl overflow-hidden bg-[#1c1c1c]">
          {/* Grid overlay */}
          <div className="absolute inset-0 bg-grid-overlay"></div>
          
          {/* Map SVG */}
          <svg width="100%" height="100%" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Water */}
            <path 
              d="M0 0 H400 V300 H0 Z" 
              fill="#1c1c1c"
              className={`transition-opacity duration-300 ${isExpanded ? 'opacity-100' : 'opacity-90'}`}
            />
            
            {/* Montreal Island */}
            <path 
              d="M100 150 C120 120 180 100 220 130 C260 160 280 170 300 150 C320 130 300 200 280 220 C260 240 200 250 160 230 C120 210 80 180 100 150 Z" 
              fill="#242424" 
              stroke="#333" 
              strokeWidth="1"
              className={`transition-transform duration-300 ${isExpanded ? 'scale-105' : 'scale-100'}`}
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
            className={`absolute left-[50%] top-[45%] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${isExpanded ? 'scale-110' : ''}`}
          >
            {/* Pin */}
            <div className="relative">
              {/* Pin base */}
              <div 
                className="w-5 h-5 bg-white/80 dark:bg-zinc-200/80 backdrop-blur-sm rounded-full shadow-sm transform-gpu transition-transform duration-300 hover:scale-110 hover:shadow-md z-10 flex items-center justify-center relative"
              >
                {/* Pulsing circle on hover */}
                {isExpanded && (
                  <div className="absolute w-10 h-10 bg-white/20 dark:bg-zinc-200/20 rounded-full animate-ping"></div>
                )}
                <div className="w-1.5 h-1.5 bg-[#FF3B30] rounded-full"></div>
              </div>
              
              {/* Montreal label */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-center">
                <p className="text-white dark:text-zinc-200 text-xs font-medium whitespace-nowrap">Montreal</p>
                <p className="text-gray-400 dark:text-zinc-500 text-[7px] mt-0.5">45.5017° N, 73.5673° W</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-[10px] text-gray-600 dark:text-zinc-400 leading-relaxed">
            I&apos;ve lived in Montreal since 2018. It&apos;s a city that balances European charm with North American practicality.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MontrealMapCard; 