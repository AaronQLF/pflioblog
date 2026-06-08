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
          ? 'border-b border-[var(--color-border)] bg-[#f3f6f8]/90 dark:bg-[#11151a]/90 backdrop-blur-sm py-3'
          : 'py-5'
      }`}
    >
      <div className="max-w-4xl mx-auto px-5 sm:px-6 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <span className="inline-block w-3 h-3 rounded-full bg-[#161b21] dark:bg-[#dce3ea] group-hover:bg-[var(--color-accent)] transition-colors duration-200" />
          <span className="font-serif text-2xl text-[#161b21] dark:text-[#dce3ea] group-hover:text-[var(--color-accent)] transition-colors duration-200">
            Haroun Guessous
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href={{ pathname: '/', hash: 'experience' }}
              className="link-hover-line text-sm text-[var(--color-muted)] hover:text-[#161b21] dark:hover:text-[#dce3ea] transition-colors duration-200"
            >
              Experience
            </Link>
            <Link
              href="/blog"
              className="link-hover-line text-sm text-[var(--color-muted)] hover:text-[#161b21] dark:hover:text-[#dce3ea] transition-colors duration-200"
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
