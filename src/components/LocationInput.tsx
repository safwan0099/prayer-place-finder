
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';

interface LocationInputProps {
  onLocationFound: (lat: number, lng: number) => void;
}

const LocationInput: React.FC<LocationInputProps> = ({ onLocationFound }) => {
  const [address, setAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!address.trim()) {
      toast({
        title: "Error",
        description: "Please enter an address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        setIsLoading(false);
        
        if (status === google.maps.GeocoderStatus.OK && results && results[0]) {
          const location = results[0].geometry.location;
          onLocationFound(location.lat(), location.lng());
          
          toast({
            title: "Success",
            description: `Found location: ${results[0].formatted_address}`,
          });
        } else {
          toast({
            title: "Error",
            description: "Couldn't find that address. Please try again.",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      setIsLoading(false);
      toast({
        title: "Error",
        description: "Failed to search for address",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex gap-2 mb-4">
      <Input
        placeholder="Enter address, city, or landmark"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        className="flex-1"
      />
      <Button 
        onClick={handleSearch} 
        disabled={isLoading}
      >
        {isLoading ? "Searching..." : "Search"}
      </Button>
    </div>
  );
};

export default LocationInput;
