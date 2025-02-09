
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Map from '@/components/Map';
import MosqueList from '@/components/MosqueList';
import { Mosque, parseOperatingHours } from '@/types/mosque';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, Clock, Phone, Instagram, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PublicView = () => {
  const navigate = useNavigate();
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
        const transformedMosques: Mosque[] = data.map(mosque => ({
          ...mosque,
          operating_hours: parseOperatingHours(mosque.operating_hours)
        }));
        setMosques(transformedMosques);
      }
    };

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
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg shadow-sm">
        <div className="container mx-auto py-6 px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h1 
                onClick={() => navigate('/')} 
                className="text-3xl md:text-4xl font-bold text-emerald-800 cursor-pointer hover:text-emerald-700 transition-colors"
              >
                Prayer Place Finder
              </h1>
              <p className="text-gray-600 mt-2">
                Find nearby mosques and prayer times
              </p>
            </div>
            <Button
              onClick={() => navigate('/quran-qibla')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Islamic Resources
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4 space-y-8">
        {/* Map Section */}
        <section className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="text-emerald-600" />
            Mosque Map
          </h2>
          <Map
            mosques={mosques}
            onLocationSelect={undefined}
          />
        </section>

        {/* Mosque List Section */}
        <section className="bg-white rounded-2xl shadow-lg p-4 md:p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="text-emerald-600" />
            Nearby Mosques
          </h2>
          <MosqueList mosques={mosques} userLocation={userLocation || undefined} />
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-800 text-white mt-16">
        <div className="container mx-auto py-8 px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
              <div className="space-y-4">
                <a 
                  href="https://wa.me/your-whatsapp-number" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-300 transition-colors"
                >
                  <MessageCircle size={20} />
                  <span>WhatsApp</span>
                </a>
                <a 
                  href="https://instagram.com/your-instagram" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-emerald-300 transition-colors"
                >
                  <Instagram size={20} />
                  <span>Instagram</span>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Need Help?</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone size={20} />
                  <span>Emergency Contact: XXX-XXX-XXXX</span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-emerald-700 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} Prayer Place Finder. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicView;

