"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from './ThemeToggle';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 border-b ${
        scrolled
          ? 'border-[var(--color-border)] bg-[var(--color-bg)]/90 backdrop-blur-md py-2 shadow-sm'
          : 'border-[var(--color-border)]/50 bg-[var(--color-bg)]/70 backdrop-blur-sm py-2.5'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex justify-between items-center text-xs font-mono">
        {/* Left: macOS Brand & Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 group font-semibold text-sm text-[var(--color-fg)]"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-serif text-lg tracking-tight group-hover:text-[var(--color-accent)] transition-colors">
              Haroun Guessous
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-[var(--color-muted)]">
            <Link
              href={{ pathname: '/', hash: 'experience' }}
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              experience
            </Link>
            <Link
              href="/blog"
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              writing
            </Link>
            <Link
              href={{ pathname: '/', hash: 'projects' }}
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              projects
            </Link>
            <Link
              href={{ pathname: '/', hash: 'reading' }}
              className="hover:text-[var(--color-fg)] transition-colors"
            >
              reading
            </Link>
            <Link
              href="/blog/galaxy"
              className="hover:text-[var(--color-fg)] transition-colors text-[var(--color-accent)] font-medium"
            >
              galaxy 3D
            </Link>
          </nav>
        </div>

        {/* Right: macOS Status Controls */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* Live Clock */}
          {currentTime && (
            <span className="text-[var(--color-fg)] font-medium text-[11px] px-1.5">
              {currentTime}
            </span>
          )}

          {/* Theme Pill Toggle */}
          <div className="gloss-pill">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
