
import React, { useEffect, useRef, useState } from 'react';
import { Mosque } from '@/types/mosque';
import { isOpen } from '@/utils/timeUtils';

interface MapProps {
  mosques: Mosque[];
  onLocationSelect?: (lat: number, lng: number) => void;
  showType?: 'mosque' | 'musalla' | 'all';
}

const Map = ({ mosques, onLocationSelect, showType = 'all' }: MapProps) => {
  const mapRef = useRef<google.maps.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
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
          mapContainerRef.current.style.cursor = 'crosshair';
          map.addListener('click', (e: google.maps.MapMouseEvent) => {
            if (e.latLng) {
              onLocationSelect(e.latLng.lat(), e.latLng.lng());
            }
          });
        }

        // Update markers when mosques or showType changes
        updateMarkers(map);
      });
    };

    // Initialize the map if it doesn't exist yet
    if (!mapRef.current) {
      initMap();
    } else {
      // Just update the markers if the map already exists
      updateMarkers(mapRef.current);
    }

    return () => {
      // Clean up event listeners on unmount
      if (mapRef.current) {
        google.maps.event.clearInstanceListeners(mapRef.current);
      }
    };
  }, [mosques, onLocationSelect, showType]);

  const updateMarkers = (map: google.maps.Map) => {
    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Filter mosques based on the showType prop
    const filteredMosques = mosques.filter(mosque => {
      if (showType === 'all') return true;
      return mosque.type === showType;
    });

    console.log(`Displaying ${filteredMosques.length} places on the map (filter: ${showType})`);
    console.log('Filtered mosques:', filteredMosques);

    // Add markers for filtered mosques
    filteredMosques.forEach((mosque) => {
      console.log('Adding marker for:', mosque.name, 'Type:', mosque.type);
      
      const markerColor = mosque.type === 'musalla' ? '#8B5CF6' : '#059669'; // Purple for musalla, Green for mosque
      
      const marker = new google.maps.Marker({
        position: { lat: mosque.latitude, lng: mosque.longitude },
        map: map,
        title: mosque.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          fillColor: isOpen(mosque.operating_hours) ? markerColor : '#ef4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          scale: 8,
        },
      });

      const websiteLink = mosque.website_url 
        ? `<a href="${mosque.website_url}" target="_blank" class="text-sm text-blue-600 hover:text-blue-800 mt-1 block">Visit Website</a>` 
        : '';
      
      const typeText = mosque.type === 'musalla' ? 'Musalla' : 'Mosque';

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-bold">${mosque.name}</h3>
            <p class="text-sm">${mosque.description || ''}</p>
            <p class="text-sm mt-1">Type: ${typeText}</p>
            <p class="text-sm mt-1">
              Status: <span class="${isOpen(mosque.operating_hours) ? 'text-green-600' : 'text-red-600'}">
                ${isOpen(mosque.operating_hours) ? 'Open' : 'Closed'}
              </span>
            </p>
            ${websiteLink}
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

      markersRef.current.push(marker);
    });
  };

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden shadow-lg">
      <div ref={mapContainerRef} className="absolute inset-0" />
    </div>
  );
};

export default Map;
