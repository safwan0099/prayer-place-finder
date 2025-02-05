import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import MosqueForm from '@/components/MosqueForm';
import MosqueList from '@/components/MosqueList';
import { Mosque, MosqueFormData } from '@/types/mosque';
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
        setMosques(data);
      }
    };

    fetchMosques();
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
      setMosques([...mosques, insertedMosque]);
      setSelectedLocation({ lat: null, lng: null });
      
      toast({
        title: "Success",
        description: "Mosque has been added successfully",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mosque Finder</h1>
          <Button onClick={() => navigate('/manage')}>Manage Mosques</Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <MosqueForm
              onSubmit={handleSubmit}
              selectedLocation={selectedLocation}
            />
          </div>
          
          <div className="lg:col-span-2 space-y-8">
            <Map
              mosques={mosques}
              onLocationSelect={handleLocationSelect}
            />
            
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nearby Mosques</h2>
              <MosqueList mosques={mosques} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;