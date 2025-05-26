'use client';

import React from 'react';
import Link from 'next/link';

const HeroMenuHeader: React.FC = () => {
  return (
    <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-primary/10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="group">
            <h1 className="font-display text-3xl md:text-4xl font-bold bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              Megan&apos;s Munchees
            </h1>
          </Link>
          <p className="text-sm md:text-base text-text/80 mt-1 font-serif italic">
            Browse, Tap, Eat Happy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HeroMenuHeader; 