'use client';

import React, { useRef, useEffect } from 'react';
import { config } from '@/shared/lib/config';
import 'mapbox-gl/dist/mapbox-gl.css';

interface LocationMapProps {
  lat: number;
  lng: number;
  className?: string;
}

export function LocationMap({ lat, lng, className = 'h-80 w-full rounded-2xl overflow-hidden' }: LocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !config.mapboxToken) return;
    let alive = true;

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (!alive || !containerRef.current) return;

      mapboxgl.accessToken = config.mapboxToken;
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [lng, lat],
        zoom: 12,
        attributionControl: false,
      });

      map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

      new mapboxgl.Marker({ color: '#ccff00' })
        .setLngLat([lng, lat])
        .addTo(map);

      mapRef.current = map;
    });

    return () => {
      alive = false;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [lat, lng]);

  return <div ref={containerRef} className={className} />;
}
