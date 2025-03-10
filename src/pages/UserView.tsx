
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mosque, parseOperatingHours, formatMosqueType } from '@/types/mosque';
import Map from '@/components/Map';
import MosqueList from '@/components/MosqueList';
import { Button } from '@/components/ui/button';

const UserView = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showType, setShowType] = useState<'mosque' | 'musalla' | 'all'>('all');

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
          operating_hours: parseOperatingHours(mosque.operating_hours),
          type: formatMosqueType(mosque.type)
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
          operating_hours: parseOperatingHours(mosque.operating_hours),
          type: formatMosqueType(mosque.type)
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

  const filteredMosques = mosques.filter(mosque => {
    if (showType === 'all') return true;
    return mosque.type === showType;
  });

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
        
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Filter By Type</h2>
          <div className="flex gap-2">
            <Button 
              variant={showType === 'all' ? 'default' : 'outline'} 
              onClick={() => setShowType('all')}
              className="px-4 py-2"
            >
              All
            </Button>
            <Button 
              variant={showType === 'mosque' ? 'default' : 'outline'} 
              onClick={() => setShowType('mosque')}
              className="px-4 py-2"
            >
              Mosques
            </Button>
            <Button 
              variant={showType === 'musalla' ? 'default' : 'outline'} 
              onClick={() => setShowType('musalla')}
              className="px-4 py-2"
            >
              Musallas
            </Button>
          </div>
        </div>
        
        <Map 
          mosques={filteredMosques} 
          onLocationSelect={(lat, lng) => setUserLocation({ lat, lng })} 
          showType={showType}
        />
        
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            {showType === 'mosque' ? 'Nearby Mosques' : 
             showType === 'musalla' ? 'Nearby Musallas' : 
             'All Nearby Places'}
          </h2>
          <MosqueList mosques={filteredMosques} userLocation={userLocation} />
        </div>
      </div>
    </div>
  );
};

export default UserView;
