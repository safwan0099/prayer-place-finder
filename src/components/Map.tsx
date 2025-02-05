import React, { useEffect, useRef, useState } from 'react';
import { Mosque } from '@/types/mosque';
import { isOpen } from '@/utils/timeUtils';

interface MapProps {
  mosques: Mosque[];
  onLocationSelect?: (lat: number, lng: number) => void;
}

const Map = ({ mosques, onLocationSelect }: MapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });

  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });

        const map = new google.maps.Map(mapContainerRef.current!, {
          center: { lat: latitude, lng: longitude },
          zoom: 12,
        });

        mapRef.current = map;

        // Add click handler for location selection
        if (onLocationSelect) {
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onLocationSelect(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        // Add markers for mosques
        mosques.forEach((mosque) => {
          const marker = new google.maps.Marker({
            position: { lat: mosque.latitude, lng: mosque.longitude },
            map,
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              fillColor: isOpen(mosque.operating_hours) ? '#059669' : '#ef4444',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 8,
            },
          });

          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-2">
                <h3 class="font-bold">${mosque.name}</h3>
                <p class="text-sm">${mosque.description || ''}</p>
                <p class="text-sm mt-1">
                  Status: <span class="${isOpen(mosque.operating_hours) ? 'text-green-600' : 'text-red-600'}">
                    ${isOpen(mosque.operating_hours) ? 'Open' : 'Closed'}
                  </span>
                </p>
                <a href="https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}"
                   target="_blank"
                   class="text-sm text-blue-600 hover:text-blue-800 mt-2 block">
                  Get Directions
                </a>
              </div>
            `,
          });

          marker.addListener('click', () => {
            infoWindow.open(map, marker);
          });
        });
      });
    };

    initMap();

    return () => {
      // Cleanup if needed
    };
  }, [mosques, onLocationSelect]);

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainerRef} className="absolute inset-0" />
    </div>
  );
};

export default Map;