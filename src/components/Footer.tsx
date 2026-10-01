"use client";

import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t border-[var(--color-border)] mt-24 py-12 bg-[var(--color-surface)]/50 backdrop-blur-xs">
      <div className="max-w-5xl mx-auto px-5 sm:px-6">
        <div className="mac-window p-4 sm:p-5">
          <div className="mac-titlebar mb-4 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5">
            <div className="flex items-center gap-2">
              <div className="win-dots">
                <span className="win-dot win-dot-close" />
                <span className="win-dot win-dot-min" />
                <span className="win-dot win-dot-zoom" />
              </div>
            </div>
            <span className="font-mono text-[11px] text-[var(--color-muted)] font-medium">
              finder_footer.sys
            </span>
            <span className="text-[10px] font-mono text-[var(--color-accent)] font-semibold">
              v2.6.0
            </span>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono text-[var(--color-muted)]">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>&copy; {new Date().getFullYear()} Haroun Guessous</span>
              <span className="text-[var(--color-border)]">·</span>
              <span className="text-[11px] text-[var(--color-fg)]">Montreal, QC</span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="mailto:haroun.guessous@mail.mcgill.ca"
                className="hover:text-[var(--color-accent)] transition-colors"
              >
                email
              </a>
              <a
                href="https://github.com/AaronQLF"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-accent)] transition-colors"
              >
                github
              </a>
              <a
                href="https://www.goodreads.com/user/show/150192618-haroun-guessous"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[var(--color-accent)] transition-colors"
              >
                goodreads
              </a>
              <Link
                href="/blog/galaxy"
                className="hover:text-[var(--color-accent)] transition-colors text-[var(--color-accent)] font-semibold"
              >
                3D galaxy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
