'use client';

import React from 'react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-background px-4">
      <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
        <h1 className="font-display text-5xl md:text-7xl font-bold text-primary text-center drop-shadow-sm mb-2">
          Megan&apos;s Munchees
        </h1>
        <p className="text-xl md:text-2xl font-serif text-text text-center mb-6">
          Fresh Off the Truck. Right on Time.
        </p>
        <div className="flex gap-4 w-full justify-center">
          <a
            href="/menu"
            className="bg-gradient-to-r from-secondary to-primary text-white rounded-full shadow-md text-lg font-semibold py-2 px-8 transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Browse Menu
          </a>
          <a
            href="/login"
            className="border-2 border-primary text-primary rounded-full text-lg font-semibold py-2 px-8 bg-white hover:bg-primary hover:text-white transition focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Login / Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 