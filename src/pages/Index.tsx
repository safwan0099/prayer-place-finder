import React, { useState } from 'react';
import Map from '@/components/Map';
import MosqueForm from '@/components/MosqueForm';
import MosqueList from '@/components/MosqueList';
import { Mosque, MosqueFormData } from '@/types/mosque';
import { useToast } from '@/components/ui/use-toast';

const Index = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({ lat: null, lng: null });
  const { toast } = useToast();

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleSubmit = (data: MosqueFormData) => {
    if (!selectedLocation.lat || !selectedLocation.lng) {
      toast({
        title: "Location Required",
        description: "Please select a location on the map",
        variant: "destructive",
      });
      return;
    }

    const newMosque: Mosque = {
      id: Date.now().toString(),
      ...data,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      createdAt: new Date().toISOString(),
    };

    setMosques([...mosques, newMosque]);
    setSelectedLocation({ lat: null, lng: null });
    
    toast({
      title: "Success",
      description: "Mosque has been added successfully",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mosque Finder</h1>
        
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