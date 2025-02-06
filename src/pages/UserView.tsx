import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mosque, parseOperatingHours } from '@/types/mosque';
import Map from '@/components/Map';
import MosqueList from '@/components/MosqueList';

const UserView = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        toast({
          title: "Location Error",
          description: "Could not get your location. Please enable location services.",
          variant: "destructive",
        });
      }
    );

    // Fetch mosques
    const fetchMosques = async () => {
      const { data, error } = await supabase
        .from('mosques')
        .select('*');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to load mosques",
          variant: "destructive",
        });
        return;
      }

      if (data) {
        const parsedMosques = data.map(mosque => ({
          ...mosque,
          operating_hours: parseOperatingHours(mosque.operating_hours)
        }));
        setMosques(parsedMosques);
      }
    };

    fetchMosques();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Nearby Mosques</h1>
        <Map mosques={mosques} onLocationSelect={(lat, lng) => setUserLocation({ lat, lng })} />
        <MosqueList mosques={mosques} userLocation={userLocation} />
      </div>
    </div>
  );
};

export default UserView;
