import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import MosqueList from '@/components/MosqueList';
import { Mosque } from '@/types/mosque';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

const UserView = () => {
  const navigate = useNavigate();
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const { toast } = useToast();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
      }
    };
    checkAuth();
  }, [navigate]);

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
      }
    );
  }, [toast]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nearby Mosques</h1>
          <Button onClick={handleLogout}>Logout</Button>
        </div>
        
        <div className="space-y-8">
          <Map mosques={mosques} />
          
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nearby Mosques</h2>
            <MosqueList mosques={mosques} userLocation={userLocation || undefined} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserView;