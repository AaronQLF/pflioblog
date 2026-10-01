"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { BOOKS } from '@/data/books';
import MacWindowCard from './MacWindowCard';

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
    <MacWindowCard title="bookshelf_3d.scene" actionText={`${BOOKS.length} volumes`}>
      <div className="flex items-baseline justify-between mb-4 pb-3 border-b border-[var(--color-border)]">
        <div>
          <span className="text-[10px] font-mono text-[var(--color-accent)] block uppercase tracking-wider mb-1">
            Library
          </span>
          <h2 className="section-heading mb-0 text-2xl sm:text-3xl">Recent Readings</h2>
        </div>
        <a
          href="https://www.goodreads.com/user/show/150192618-haroun-guessous"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-[var(--color-accent)] hover:underline flex items-center gap-1"
        >
          Goodreads &rarr;
        </a>
      </div>

      <p className="mb-4 text-sm leading-relaxed text-[var(--color-muted)] font-mono">
        Books I keep going back to. Drag the 3D shelf to rotate, click a volume to pick it up.
      </p>

      <Bookshelf3D />
    </MacWindowCard>
  );
};

export default BooksCard;
