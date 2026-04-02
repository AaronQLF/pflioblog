"use client";

import React from 'react';

interface Book {
  title: string;
  author: string;
  rating?: number;
}

const BooksCard: React.FC = () => {
  const books: Book[] = [
    { title: "Atomic Habits", author: "James Clear", rating: 5 },
    { title: "The Psychology of Money", author: "Morgan Housel", rating: 4 },
    { title: "Deep Work", author: "Cal Newport", rating: 5 },
    { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", rating: 4 },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", rating: 5 },
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", rating: 5 },
    { title: "Four Thousand Weeks", author: "Oliver Burkeman", rating: 4 },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", rating: 4 },
  ];

  return (
    <div>
      <span className="text-xs font-mono text-[var(--color-border)] block mb-2">03</span>
      <div className="flex items-baseline justify-between mb-10">
        <h2 className="section-heading mb-0">Reading</h2>
        <a
          href="https://www.goodreads.com/user/show/150192618-haroun-guessous"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)] transition-colors duration-200"
        >
          Goodreads &rarr;
        </a>
      </div>

      <div className="space-y-5">
        {books.map((book, index) => (
          <div
            key={index}
            className="flex items-baseline justify-between gap-4 pb-5 border-b border-[var(--color-border)] last:border-0 last:pb-0"
          >
            <div className="min-w-0">
              <p className="text-base font-medium">{book.title}</p>
              <p className="text-sm text-[var(--color-muted)] mt-0.5">{book.author}</p>
            </div>
            {book.rating && (
              <div className="flex items-center gap-1 shrink-0">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < book.rating!
                        ? 'bg-[var(--color-accent)]'
                        : 'bg-[var(--color-border)]'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BooksCard;
