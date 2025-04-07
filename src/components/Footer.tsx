import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="border-t pt-8">
      <div className="flex flex-wrap justify-between items-center">
        <div className="space-y-2 mb-4 md:mb-0">
          <h2 className="text-xl font-bold">Haroun Guessous</h2>
          <div className="flex space-x-4">
            <Link href="https://linkedin.com/in" className="text-slate-600 hover:text-primary">
              LinkedIn
            </Link>
            <Link href="https://github.com/" className="text-slate-600 hover:text-primary">
              GitHub
            </Link>
            <Link href="mailto:haroun.guessous@mail.mcgill.ca" className="text-slate-600 hover:text-primary">
              Email
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Haroun Guessous</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 