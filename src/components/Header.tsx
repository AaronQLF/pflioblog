"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

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
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'border-b border-[var(--color-border)] bg-[#faf9f7]/90 dark:bg-[#1c1917]/90 backdrop-blur-sm py-3'
          : 'py-5'
      }`}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-6 flex justify-between items-center">
        <Link
          href="/"
          className="font-serif text-2xl text-[#1a1a1a] dark:text-[#e8e4df] hover:text-[var(--color-accent)] transition-colors duration-200"
        >
          Haroun Guessous
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href={{ pathname: '/', hash: 'experience' }}
              className="link-hover-line text-sm text-[var(--color-muted)] hover:text-[#1a1a1a] dark:hover:text-[#e8e4df] transition-colors duration-200"
            >
              Experience
            </Link>
            <Link
              href="/blog"
              className="link-hover-line text-sm text-[var(--color-muted)] hover:text-[#1a1a1a] dark:hover:text-[#e8e4df] transition-colors duration-200"
            >
              Writing
            </Link>
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
