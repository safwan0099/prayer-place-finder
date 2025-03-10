
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import MosqueForm from '@/components/MosqueForm';
import MosqueList from '@/components/MosqueList';
import { Mosque, MosqueFormData, parseOperatingHours, formatOperatingHours } from '@/types/mosque';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';

const Index = () => {
  const navigate = useNavigate();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [userLocation, setUserLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const [isLoading, setIsLoading] = useState(false);
  const [showType, setShowType] = useState<'mosque' | 'musalla' | 'all'>('all');
  const { toast } = useToast();

  // Load mosques from database
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
        const parsedMosques = data.map(mosque => ({
          ...mosque,
          operating_hours: parseOperatingHours(mosque.operating_hours)
        }));
        setMosques(parsedMosques);
      }
    };

    fetchMosques();

    // Get user's current location
    navigator.geolocation.getCurrentPosition((position) => {
      setUserLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
    }, (error) => {
      console.error("Error getting location:", error);
      toast({
        title: "Location Error",
        description: "Unable to get your current location",
        variant: "destructive",
      });
    });
  }, [toast]);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleSubmit = async (data: MosqueFormData) => {
    if (!selectedLocation.lat || !selectedLocation.lng) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    const newMosque = {
      ...data,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      operating_hours: formatOperatingHours(data.operating_hours)
    };

    const { data: insertedMosque, error } = await supabase
      .from('mosques')
      .insert([newMosque])
      .select()
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add mosque",
        variant: "destructive",
      });
      return;
    }

    if (insertedMosque) {
      const parsedMosque = {
        ...insertedMosque,
        operating_hours: parseOperatingHours(insertedMosque.operating_hours)
      };
      setMosques([...mosques, parsedMosque]);
      setSelectedLocation({ lat: null, lng: null });
      
      toast({
        title: "Success",
        description: `${data.type === 'musalla' ? 'Musalla' : 'Mosque'} has been added successfully`,
      });
    }
  };

  const fetchGoogleMosques = async () => {
    if (!userLocation.lat || !userLocation.lng) {
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
          type: mosque.type || 'mosque' // Ensure all mosques have a type
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
    return mosque.type === showType || (mosque.type === undefined && showType === 'mosque');
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mosque Finder</h1>
          <div className="flex gap-3">
            <Button 
              onClick={fetchGoogleMosques} 
              disabled={isLoading || !userLocation.lat}
              variant="outline"
            >
              {isLoading ? "Loading..." : "Find Mosques Near Me"}
            </Button>
            <Button onClick={() => navigate('/manage')}>Manage Mosques</Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MosqueForm
              onSubmit={handleSubmit}
              selectedLocation={selectedLocation}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-gray-900">Nearby Places</h2>
                <div className="flex gap-2">
                  <Button 
                    variant={showType === 'all' ? 'default' : 'outline'} 
                    onClick={() => setShowType('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={showType === 'mosque' ? 'default' : 'outline'} 
                    onClick={() => setShowType('mosque')}
                  >
                    Mosques
                  </Button>
                  <Button 
                    variant={showType === 'musalla' ? 'default' : 'outline'} 
                    onClick={() => setShowType('musalla')}
                  >
                    Musallas
                  </Button>
                </div>
              </div>
              <Map
                mosques={mosques}
                onLocationSelect={handleLocationSelect}
                showType={showType}
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                {showType === 'mosque' ? 'Nearby Mosques' : 
                 showType === 'musalla' ? 'Nearby Musallas' : 
                 'All Nearby Places'}
              </h2>
              <MosqueList 
                mosques={filteredMosques} 
                userLocation={userLocation.lat && userLocation.lng ? userLocation : undefined} 
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
