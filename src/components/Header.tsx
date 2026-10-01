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
              haroun.app
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
          {/* Wifi Pill */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-muted)] text-[11px]">
            <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
            </svg>
            <span>online</span>
          </div>

          {/* Battery Status */}
          <div className="hidden sm:flex items-center gap-1 text-[var(--color-muted)] text-[11px]" title="Battery 100%">
            <svg className="w-5 h-3" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="0.5" y="0.5" width="19" height="13" rx="3" stroke="currentColor" strokeWidth="1.2" />
              <rect x="2.5" y="2.5" width="15" height="9" rx="1.5" fill="#10b981" />
              <path d="M21 4.5v5c.8-.5 1.5-1.5 1.5-2.5s-.7-2-1.5-2.5z" fill="currentColor" />
            </svg>
          </div>

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
