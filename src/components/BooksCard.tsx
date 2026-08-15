"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { BOOKS } from '@/data/books';

const Bookshelf3D = dynamic(() => import('./Bookshelf3D'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[clamp(26rem,52vh,34rem)] w-full items-center justify-center">
      <span className="font-mono text-xs text-[var(--color-muted)]">
        assembling {BOOKS.length} volumes…
      </span>
    </div>
  ),
});

const BooksCard: React.FC = () => {
  return (
    <div>
      <span className="text-xs font-mono text-[var(--color-border)] block mb-2">03</span>
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="section-heading mb-0">Recent readings</h2>
        <a
          href="https://www.goodreads.com/user/show/150192618-haroun-guessous"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
        >
          Goodreads &rarr;
        </a>
      </div>

      <p className="mb-2 max-w-2xl text-[15px] leading-relaxed text-[var(--color-muted)]">
        Books I keep going back to. Drag the shelf to browse, click a volume to pick it up.
      </p>

      <Bookshelf3D />
    </div>
  );
};

export default BooksCard;
