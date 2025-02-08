
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Compass, Book } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuranQibla = () => {
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.DeviceOrientationEvent) {
      toast({
        title: "Device Not Supported",
        description: "Your device doesn't support orientation detection",
        variant: "destructive",
      });
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setQiblaDirection(event.alpha);
      }
    };

    // Request permission for iOS devices
    const requestPermission = async () => {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        try {
          const permission = await (DeviceOrientationEvent as any).requestPermission();
          if (permission === 'granted') {
            window.addEventListener('deviceorientation', handleOrientation);
          }
        } catch (error) {
          toast({
            title: "Permission Denied",
            description: "Please allow access to device orientation",
            variant: "destructive",
          });
        }
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
      }
    };

    requestPermission();

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-teal-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-emerald-800">Quran & Qibla Direction</h1>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Qibla Compass */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
                <Compass className="text-emerald-600" />
                Qibla Direction
              </h2>
              <div className="relative w-48 h-48 mx-auto">
                <div 
                  className="absolute inset-0 border-4 border-emerald-500 rounded-full"
                  style={{
                    transform: `rotate(${qiblaDirection || 0}deg)`,
                    transition: 'transform 0.3s ease-out'
                  }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full" />
                </div>
                {qiblaDirection === null && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    Enable device orientation
                  </div>
                )}
              </div>
              {qiblaDirection !== null && (
                <p className="mt-4 text-gray-600">
                  Current direction: {Math.round(qiblaDirection)}°
                </p>
              )}
            </div>
          </div>

          {/* Quran Section */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center justify-center gap-2">
              <Book className="text-emerald-600" />
              Quran Reader
            </h2>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Read the Holy Quran online through Quran.com
              </p>
              <Button
                onClick={() => window.open('https://quran.com', '_blank')}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                Open Quran.com
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuranQibla;
