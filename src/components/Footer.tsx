"use client";

import React from 'react';

const Footer = () => {
  return (
    <footer className="border-t border-gray-200 py-12 bg-[#f5f5f7]">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Biography</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Education</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Skills</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Values</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Work</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Projects</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Experience</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Achievements</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Resume</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="https://linkedin.com/in" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-black transition-colors">LinkedIn</a></li>
              <li><a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-black transition-colors">GitHub</a></li>
              <li><a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 hover:text-black transition-colors">Twitter</a></li>
              <li><a href="mailto:email@example.com" className="text-xs text-gray-500 hover:text-black transition-colors">Email</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-xs text-gray-500 hover:text-black transition-colors">Terms of Use</a></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Haroun Guessous. All rights reserved.
            </p>
            <p className="text-xs text-gray-500 mt-2 md:mt-0">
              Made with ♥ in Montreal, Canada
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 