'use client';

import React, { useEffect, useState } from 'react';

interface Location {
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

// Mock location data - in a real app, this would come from an API
const MOCK_LOCATIONS: Location[] = [
  {
    address: '123 Main St, Downtown',
    coordinates: { lat: 37.7749, lng: -122.4194 },
  },
  {
    address: '456 Market St, Financial District',
    coordinates: { lat: 37.7937, lng: -122.3962 },
  },
];

const LiveLocationBanner: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState<Location>(MOCK_LOCATIONS[0]);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [eta, setEta] = useState<string | null>(null);

  useEffect(() => {
    // Get user's location if available
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.log('Error getting location:', error);
        }
      );
    }

    // Simulate location updates every 5 minutes
    const interval = setInterval(() => {
      setCurrentLocation(
        MOCK_LOCATIONS[Math.floor(Math.random() * MOCK_LOCATIONS.length)]
      );
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  // Mock ETA calculation
  useEffect(() => {
    if (userLocation) {
      // In a real app, this would use a proper distance calculation
      const mockEta = Math.floor(Math.random() * 15) + 5;
      setEta(`${mockEta} min`);
    }
  }, [userLocation, currentLocation]);

  const getMapsUrl = () => {
    const { lat, lng } = currentLocation.coordinates;
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  };

  return (
    <div className="w-full bg-gradient-to-r from-primary to-accent text-white py-2 px-4">
      <div className="max-w-7xl mx-auto">
        <a
          href={getMapsUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <span className="animate-pulse">📍</span>
          <span>Megan&apos;s Truck is Live at {currentLocation.address}</span>
          {eta && <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">ETA: {eta}</span>}
        </a>
      </div>
    </div>
  );
};

export default LiveLocationBanner; 