"use client";

import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle';

const ContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close the dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const contactOptions = [
    {
      name: 'Email',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: 'mailto:haroun.guessous@mail.mcgill.ca'
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      href: 'https://www.linkedin.com/in/harounguessous/'
    },
    {
      name: 'GitHub',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      href: 'https://github.com/harounguessous'
    },
    {
      name: 'Product Hunt',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.604 8.4h-3.604v3.2h3.604c.904 0 1.6-.697 1.6-1.6 0-.903-.696-1.6-1.6-1.6zm0 7.2h-7.604v-10.8h-2v10.8h-2v2.4h2v2.4h2v-2.4h7.604c2.702 0 4.8-2.099 4.8-4.8 0-2.701-2.098-4.8-4.8-4.8-2.701 0-4.8 2.099-4.8 4.8h2c0-1.504 1.297-2.8 2.8-2.8 1.504 0 2.8 1.297 2.8 2.8 0 1.504-1.296 2.8-2.8 2.8z"/>
        </svg>
      ),
      href: 'https://www.producthunt.com/@harounguessous'
    }
  ];

  return (
    <div className="relative flex items-center" ref={dropdownRef}>
      <div className="mr-2">
        <ThemeToggle />
      </div>
      
      <div className="flex gap-2">
        {/* Resume Download Button */}
        <a 
          href="/resume.pdf" 
          download
          className="bg-black hover:bg-opacity-80 dark:bg-white dark:text-black text-white text-sm py-2 px-4 rounded-full transition-all duration-300 font-medium flex items-center gap-2"
        >
          <span>Resume</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </a>
        
        {/* Contact Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-[#f5f5f7] hover:bg-[#e8e8eb] dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-white text-black text-sm py-2 px-4 rounded-full transition-all duration-300 font-medium flex items-center gap-2"
        >
          <span>Contact</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50 transition-all duration-200 ease-out py-1 shadow-lg bg-white/60 dark:bg-zinc-800/60 backdrop-blur-md border border-white/20 dark:border-zinc-700/20">
          {contactOptions.map((option, index) => (
            <a
              key={index}
              href={option.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center px-4 py-3 text-sm text-black dark:text-white hover:bg-white/50 dark:hover:bg-zinc-700/50 transition-colors"
            >
              <span className="mr-3 text-gray-500 dark:text-zinc-400 flex-shrink-0">{option.icon}</span>
              <span>{option.name}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactButton; 