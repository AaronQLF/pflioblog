"use client";

import React, { useState, useRef, useEffect } from 'react';

interface Book {
  title: string;
  author: string;
  rating?: number; // Out of 5
}

const BooksCard: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  
  const books: Book[] = [
    { title: "Atomic Habits", author: "James Clear", rating: 5 },
    { title: "The Psychology of Money", author: "Morgan Housel", rating: 4 },
    { title: "Deep Work", author: "Cal Newport", rating: 5 },
    { title: "The Almanack of Naval Ravikant", author: "Eric Jorgenson", rating: 4 },
    { title: "Thinking, Fast and Slow", author: "Daniel Kahneman", rating: 5 },
    { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", rating: 5 },
    { title: "Four Thousand Weeks", author: "Oliver Burkeman", rating: 4 },
    { title: "The Pragmatic Programmer", author: "Andrew Hunt & David Thomas", rating: 4 }
  ];
  
  // Show only 4 books initially, show all when expanded
  const visibleBooks = isExpanded ? books : books.slice(0, 4);

  // Handle mousedown event and stop propagation
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(true);
  };

  // Reset expanded state on document click (only if not clicking inside the card)
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  return (
    <div 
      ref={cardRef}
      className="glass-card hover-scale h-full"
      onMouseDown={handleMouseDown}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-black dark:text-white">Reading List</h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">2025 Picks</span>
        </div>
        
        <div className="flex-grow relative overflow-auto">
          <div className="space-y-3 transition-all duration-500">
            {visibleBooks.map((book, index) => (
              <div 
                key={index} 
                className="flex items-start pb-2 border-b border-gray-100/30 dark:border-zinc-700/30 last:border-0"
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 bg-white/40 dark:bg-zinc-700/40 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 text-gray-400 dark:text-zinc-500 flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xs font-medium text-gray-800 dark:text-zinc-200">{book.title}</h3>
                  <p className="text-[10px] text-gray-500 dark:text-zinc-400">by {book.author}</p>
                </div>
                <div className="flex items-center">
                  {book.rating && [...Array(5)].map((_, i) => (
                    <svg 
                      key={i} 
                      className={`w-2.5 h-2.5 ${i < book.rating! ? 'text-[#FF9500]' : 'text-gray-200 dark:text-zinc-700'}`} 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          {!isExpanded && (
            <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-white/70 dark:from-zinc-800/70 to-transparent"></div>
          )}
        </div>
        
        <div className="mt-3 pt-2 border-t border-gray-100/30 dark:border-zinc-700/30">
          <a 
            href="https://www.goodreads.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[10px] text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors flex items-center justify-center"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <svg viewBox="0 0 24 24" className="h-3 w-3 mr-1" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            View my Goodreads profile
          </a>
        </div>
      </div>
    </div>
  );
};

export default BooksCard; 