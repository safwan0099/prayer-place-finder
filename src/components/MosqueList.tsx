import React from 'react';
import { Mosque } from '@/types/mosque';
import { isOpen } from '@/utils/timeUtils';
import { Card } from '@/components/ui/card';
import { ExternalLink, Clock, MapPin, Globe, VideoIcon } from 'lucide-react';

interface MosqueListProps {
  mosques: Mosque[];
  userLocation?: { lat: number; lng: number };
}

const MosqueList = ({ mosques, userLocation }: MosqueListProps) => {
  const calculateDistance = (mosque: Mosque) => {
    if (!userLocation) return Infinity;
    
    const R = 6371; // Earth's radius in km
    const dLat = (mosque.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (mosque.longitude - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(mosque.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const sortedMosques = [...mosques].sort((a, b) => 
    calculateDistance(a) - calculateDistance(b)
  );

  return (
    <div className="space-y-4">
      {sortedMosques.map((mosque) => (
        <Card key={mosque.id} className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{mosque.name}</h3>
              {mosque.description && (
                <p className="text-gray-600 mt-1">{mosque.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <div className={`px-2 py-1 rounded-full text-sm ${
                isOpen(mosque.operating_hours) 
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {isOpen(mosque.operating_hours) ? 'Open' : 'Closed'}
              </div>
              <div className={`px-2 py-1 rounded-full text-sm ${
                mosque.is_restricted
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {mosque.is_restricted ? 'Student id needed' : 'Open to Everyone'}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            {mosque.website_url && (
              <a
                href={mosque.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <VideoIcon size={16} className="mr-1" />
                Video Direction
              </a>
            )}
            
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <MapPin size={16} className="mr-1" />
              Directions
            </a>

            <div className="flex items-center text-gray-600">
              <Clock size={16} className="mr-1" />
              {mosque.operating_hours[0].openTime} - {mosque.operating_hours[0].closeTime}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MosqueList;