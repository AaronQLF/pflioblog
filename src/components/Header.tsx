"use client";

import React, { useState, useEffect } from 'react';
import ContactButton from './ContactButton';
import Link from 'next/link';

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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'glass-effect py-3' : 'py-5'
      }`}>
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/" className="text-xl font-semibold text-gray-900 dark:text-white">HG</Link>
        </div>

        <nav className="hidden md:flex space-x-8">
          <Link href={{ pathname: '/', hash: 'experience' }} className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Experience</Link>
          <Link href={{ pathname: '/', hash: 'projects' }} className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Projects</Link>
          <Link href={{ pathname: '/', hash: 'education' }} className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Education</Link>
          <Link href="/blog" className="text-sm text-gray-700 hover:text-black dark:text-gray-300 dark:hover:text-white transition-colors">Blog</Link>
        </nav>

        <div>
          <ContactButton />
        </div>
      </div>
    </header>
  );
};

export default Header; 