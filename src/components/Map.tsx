import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Mosque } from '@/types/mosque';
import { isOpen } from '@/utils/timeUtils';

interface MapProps {
  mosques: Mosque[];
  onLocationSelect?: (lat: number, lng: number) => void;
}

const Map = ({ mosques, onLocationSelect }: MapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    mapboxgl.accessToken = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHRpYmF3Z2gwMGlqMmtvNWR4NWM4YnBsIn0.O2p8VVHhRGVLjYXYXx8pDg';
    
    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation([longitude, latitude]);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [longitude, latitude],
        zoom: 12
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add click handler for location selection
      if (onLocationSelect) {
        map.current.on('click', (e) => {
          onLocationSelect(e.lngLat.lat, e.lngLat.lng);
        });
      }

      // Add markers for mosques
      mosques.forEach((mosque) => {
        const el = document.createElement('div');
        el.className = 'marker';
        el.style.width = '25px';
        el.style.height = '25px';
        el.style.borderRadius = '50%';
        el.style.backgroundColor = isOpen(mosque.operatingHours) ? '#059669' : '#ef4444';
        el.style.border = '2px solid white';
        el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        el.style.cursor = 'pointer';

        new mapboxgl.Marker(el)
          .setLngLat([mosque.longitude, mosque.latitude])
          .setPopup(
            new mapboxgl.Popup({ offset: 25 })
              .setHTML(`
                <div class="p-2">
                  <h3 class="font-bold">${mosque.name}</h3>
                  <p class="text-sm">${mosque.description || ''}</p>
                  <p class="text-sm mt-1">
                    Status: <span class="${isOpen(mosque.operatingHours) ? 'text-green-600' : 'text-red-600'}">
                      ${isOpen(mosque.operatingHours) ? 'Open' : 'Closed'}
                    </span>
                  </p>
                  <a href="https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}"
                     target="_blank"
                     class="text-sm text-blue-600 hover:text-blue-800 mt-2 block">
                    Get Directions
                  </a>
                </div>
              `)
          )
          .addTo(map.current);
      });
    });

    return () => {
      map.current?.remove();
    };
  }, [mosques, onLocationSelect]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default Map;