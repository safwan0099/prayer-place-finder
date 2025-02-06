import React, { useEffect, useState } from 'react';
import Map from '@/components/Map';
import MosqueList from '@/components/MosqueList';
import { Mosque, parseOperatingHours } from '@/types/mosque';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const PublicView = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
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
        // Transform the data to match the Mosque type
        const transformedMosques: Mosque[] = data.map(mosque => ({
          ...mosque,
          operating_hours: parseOperatingHours(mosque.operating_hours)
        }));
        setMosques(transformedMosques);
      }
    };

    // Get user's location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Some features may be limited.",
          variant: "destructive",
        });
      }
    );

    fetchMosques();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mosque Finder</h1>
          <a 
            href="/admeen"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Admin Login
          </a>
        </div>
        
        <div className="space-y-8">
          <Map
            mosques={mosques}
            onLocationSelect={undefined}
          />
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nearby Mosques</h2>
            <MosqueList mosques={mosques} userLocation={userLocation || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicView;