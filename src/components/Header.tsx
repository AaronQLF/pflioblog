"use client";

import React, { useState, useEffect } from 'react';
import ContactButton from './ContactButton';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled ? 'glass-effect py-3' : 'py-5'
    }`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <a href="/" className="text-xl font-semibold text-gray-900 dark:text-white">HG</a>
        </div>
        
        <nav className="hidden md:flex space-x-8">
          <a href="#experience" className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Experience</a>
          <a href="#projects" className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Projects</a>
          <a href="#education" className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Education</a>
          <a href="#about" className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">About</a>
        </nav>
        
        <div>
          <ContactButton />
        </div>
      </div>
    </header>
  );
};

export default Header; 