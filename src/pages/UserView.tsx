
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mosque, parseOperatingHours } from '@/types/mosque';
import Map from '@/components/Map';
import MosqueList from '@/components/MosqueList';
import { Button } from '@/components/ui/button';

const UserView = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const fetchGoogleMosques = async () => {
    if (!userLocation) {
      toast({
        title: "Location Required",
        description: "We need your location to find nearby mosques",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await supabase.functions.invoke('fetch-mosques', {
        body: { 
          lat: userLocation.lat, 
          lng: userLocation.lng,
          radius: 5000 // 5km radius
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { mosques: fetchedMosques } = response.data;
      
      if (fetchedMosques && Array.isArray(fetchedMosques)) {
        const parsedMosques = fetchedMosques.map(mosque => ({
          ...mosque,
          operating_hours: parseOperatingHours(mosque.operating_hours)
        }));
        
        setMosques(parsedMosques);
        
        toast({
          title: "Success",
          description: `Found ${parsedMosques.length} mosques in your area`,
        });
      }
    } catch (error) {
      console.error("Error fetching Google mosques:", error);
      toast({
        title: "Error",
        description: "Failed to fetch mosques from Google API",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gray-900">Nearby Mosques</h1>
          <Button 
            onClick={fetchGoogleMosques} 
            disabled={isLoading || !userLocation}
            variant="outline"
          >
            {isLoading ? "Loading..." : "Find Mosques Near Me"}
          </Button>
        </div>
        <Map mosques={mosques} onLocationSelect={(lat, lng) => setUserLocation({ lat, lng })} />
        <div className="mt-6">
          <MosqueList mosques={mosques} userLocation={userLocation} />
        </div>
      </div>
    </div>
  );
};

export default UserView;
