"use client";

import React, { useState } from 'react';

interface Book {
  title: string;
  author: string;
  rating?: number; // Out of 5
}

const BooksCard: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  
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
  
  // Show only 4 books initially, show all when hovered
  const visibleBooks = isHovered ? books : books.slice(0, 4);

  return (
    <div 
      className="experience-card h-[370px] overflow-hidden flex flex-col"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mb-4">
        <h2 className="text-sm font-medium text-gray-700">What I&apos;ve Read So Far in 2025</h2>
      </div>
      
      <div className="flex-grow relative overflow-auto">
        <div className="space-y-3 transition-all duration-500">
          {visibleBooks.map((book, index) => (
            <div 
              key={index} 
              className="flex items-start pb-2 border-b border-gray-100 last:border-0"
            >
              <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center mr-3 text-gray-400 flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-xs font-medium text-gray-800">{book.title}</h3>
                <p className="text-[10px] text-gray-500">by {book.author}</p>
              </div>
              <div className="flex items-center">
                {book.rating && [...Array(5)].map((_, i) => (
                  <svg 
                    key={i} 
                    className={`w-3 h-3 ${i < book.rating! ? 'text-yellow-400' : 'text-gray-200'}`} 
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
        
        {!isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none bg-gradient-to-t from-white to-transparent"></div>
        )}
      </div>
      
      <div className="mt-3 pt-3 border-t border-gray-100">
        <a 
          href="https://www.goodreads.com/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs text-gray-500 hover:text-black transition-colors flex items-center justify-center"
        >
          <svg viewBox="0 0 448 512" className="h-4 w-4 mr-1" fill="currentColor">
            <path d="M299.9 191.2c5.1 37.3-4.7 79-35.9 100.7-22.3 15.5-52.8 14.1-70.8 5.7-37.1-17.3-49.5-58.6-46.8-97.2 4.3-60.9 40.9-87.9 75.3-87.5 46.9-.2 71.8 31.8 78.2 78.3zM448 88v336c0 30.9-25.1 56-56 56H56c-30.9 0-56-25.1-56-56V88c0-30.9 25.1-56 56-56h336c30.9 0 56 25.1 56 56zM330 313.2s-.1-34-.1-217.3h-29v40.3c-.8.3-1.2-.5-1.6-1.2-9.6-20.7-35.9-46.3-76-46-51.9.4-87.2 31.2-100.6 77.8-4.3 14.9-5.8 30.1-5.5 45.6 1.7 77.9 45.1 117.8 112.4 115.2 28.9-1.1 54.5-17 69-45.2.5-1 1.1-1.9 1.7-2.9.2.1.4.1.6.2.3 3.8.2 30.7.1 34.5-.2 14.8-2 29.5-7.2 43.5-7.8 21-22.3 34.7-44.5 39.5-17.8 3.9-35.6 3.8-53.2-1.2-21.5-6.1-36.5-19-41.1-41.8-.3-1.6-1.3-1.3-2.3-1.3h-26.8c.8 10.6 3.2 20.3 8.5 29.2 24.2 40.5 82.7 48.5 128.2 37.4 49.9-12.3 67.3-54.9 67.4-106.3z"/>
          </svg>
          Add me on Goodreads for more book recommendations
        </a>
      </div>
    </div>
  );
};

export default BooksCard; 