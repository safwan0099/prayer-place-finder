
import React, { useEffect, useState } from 'react';
import { Mosque } from '@/types/mosque';
import { isOpen } from '@/utils/timeUtils';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Clock, MapPin, Globe, VideoIcon, Info } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface MosqueListProps {
  mosques: Mosque[];
  userLocation?: { lat: number; lng: number };
}

interface PrayerTimes {
  fajr: string | null;
  dhuhr: string | null;
  asr: string | null;
  maghrib: string | null;
  isha: string | null;
  jummah: string | null;
}

const MosqueList = ({ mosques, userLocation }: MosqueListProps) => {
  const [prayerTimes, setPrayerTimes] = useState<Record<string, PrayerTimes>>({});
  
  useEffect(() => {
    const fetchPrayerTimes = async () => {
      // Get today's date in YYYY-MM-DD format
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Fetch prayer times for all mosques for today
      const { data, error } = await supabase
        .from('prayer_times_manchester')
        .select('mosque_id, fajr, dhuhr, asr, maghrib, isha, jummah')
        .eq('date', today);
      
      if (error) {
        console.error('Error fetching prayer times:', error);
        return;
      }
      
      // Organize by mosque_id
      const timesByMosque: Record<string, PrayerTimes> = {};
      data?.forEach(item => {
        if (item.mosque_id) {
          timesByMosque[item.mosque_id] = {
            fajr: item.fajr,
            dhuhr: item.dhuhr,
            asr: item.asr,
            maghrib: item.maghrib,
            isha: item.isha,
            jummah: item.jummah
          };
        }
      });
      
      setPrayerTimes(timesByMosque);
    };
    
    fetchPrayerTimes();
  }, []);
  
  const calculateDistance = (mosque: Mosque) => {
    if (!userLocation) return null;
    
    const R = 6371; // Earth's radius in km
    const dLat = (mosque.latitude - userLocation.lat) * Math.PI / 180;
    const dLon = (mosque.longitude - userLocation.lng) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(userLocation.lat * Math.PI / 180) * Math.cos(mosque.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return distance.toFixed(1); // Return distance with 1 decimal place
  };

  const sortedMosques = [...mosques].sort((a, b) => {
    const distA = calculateDistance(a);
    const distB = calculateDistance(b);
    if (!distA || !distB) return 0;
    return parseFloat(distA) - parseFloat(distB);
  });

  const triggerPrayerTimeScraping = async () => {
    try {
      const response = await supabase.functions.invoke('scrape-prayer-times', {
        method: 'POST'
      });
      
      if (response.error) {
        console.error('Error scraping prayer times:', response.error);
      } else {
        console.log('Prayer times scraped successfully:', response.data);
        // Refetch prayer times to update the display
        const today = format(new Date(), 'yyyy-MM-dd');
        const { data, error } = await supabase
          .from('prayer_times_manchester')
          .select('mosque_id, fajr, dhuhr, asr, maghrib, isha, jummah')
          .eq('date', today);
        
        if (!error && data) {
          const timesByMosque: Record<string, PrayerTimes> = {};
          data.forEach(item => {
            if (item.mosque_id) {
              timesByMosque[item.mosque_id] = {
                fajr: item.fajr,
                dhuhr: item.dhuhr,
                asr: item.asr,
                maghrib: item.maghrib,
                isha: item.isha,
                jummah: item.jummah
              };
            }
          });
          setPrayerTimes(timesByMosque);
        }
      }
    } catch (error) {
      console.error('Failed to scrape prayer times:', error);
    }
  };

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {sortedMosques.map((mosque) => {
          const distance = calculateDistance(mosque);
          const mosquePrayerTimes = mosque.id ? prayerTimes[mosque.id] : undefined;
          
          return (
            <Card key={mosque.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{mosque.name}</h3>
                  {mosque.description && (
                    <p className="text-gray-600 mt-1 text-sm">{mosque.description}</p>
                  )}
                  {distance && (
                    <p className="text-emerald-600 text-sm mt-1 flex items-center gap-1">
                      <MapPin size={14} />
                      {distance} km away
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1 flex items-center gap-1">
                    <Info size={12} />
                    Source: {mosque.source === 'google' ? 'Google Maps' : 'Manual Entry'}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isOpen(mosque.operating_hours) 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {isOpen(mosque.operating_hours) ? 'Open' : 'Closed'}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    mosque.is_restricted
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {mosque.is_restricted ? 'Student ID needed' : 'Open to Everyone'}
                  </div>
                </div>
              </div>

              {/* Prayer Times Section */}
              {mosquePrayerTimes && (
                <div className="mt-3 border-t pt-3">
                  <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                    <Clock size={14} className="text-emerald-600" />
                    <span>Today's Prayer Times</span>
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {mosquePrayerTimes.fajr && (
                      <div className="bg-gray-50 p-1 rounded text-center">
                        <div className="font-medium">Fajr</div>
                        <div>{mosquePrayerTimes.fajr}</div>
                      </div>
                    )}
                    {mosquePrayerTimes.dhuhr && (
                      <div className="bg-gray-50 p-1 rounded text-center">
                        <div className="font-medium">Dhuhr</div>
                        <div>{mosquePrayerTimes.dhuhr}</div>
                      </div>
                    )}
                    {mosquePrayerTimes.asr && (
                      <div className="bg-gray-50 p-1 rounded text-center">
                        <div className="font-medium">Asr</div>
                        <div>{mosquePrayerTimes.asr}</div>
                      </div>
                    )}
                    {mosquePrayerTimes.maghrib && (
                      <div className="bg-gray-50 p-1 rounded text-center">
                        <div className="font-medium">Maghrib</div>
                        <div>{mosquePrayerTimes.maghrib}</div>
                      </div>
                    )}
                    {mosquePrayerTimes.isha && (
                      <div className="bg-gray-50 p-1 rounded text-center">
                        <div className="font-medium">Isha</div>
                        <div>{mosquePrayerTimes.isha}</div>
                      </div>
                    )}
                    {mosquePrayerTimes.jummah && (
                      <div className="bg-gray-50 p-1 rounded text-center">
                        <div className="font-medium">Jummah</div>
                        <div>{mosquePrayerTimes.jummah}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3 text-sm">
                {mosque.website_url && (
                  <a
                    href={mosque.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <VideoIcon size={14} className="mr-1" />
                    Video Direction
                  </a>
                )}
                
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${mosque.latitude},${mosque.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <MapPin size={14} className="mr-1" />
                  Directions
                </a>
              </div>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default MosqueList;
