
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mosque, parseOperatingHours, formatOperatingHours, formatMosqueType } from '@/types/mosque';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import MosqueForm from '@/components/MosqueForm';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const ManageMosques = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number | null;
    lng: number | null;
  }>({
    lat: selectedMosque?.latitude || null,
    lng: selectedMosque?.longitude || null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'mosque' | 'musalla'>('all');

  const { data: mosques, refetch } = useQuery({
    queryKey: ['mosques'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('mosques')
        .select('*');
      
      if (error) throw error;
      return data.map(mosque => ({
        ...mosque,
        operating_hours: parseOperatingHours(mosque.operating_hours),
        type: formatMosqueType(mosque.type)
      })) as Mosque[];
    }
  });

  const handleLocationUpdate = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
  };

  const handleModify = async (data: Mosque) => {
    const { error } = await supabase
      .from('mosques')
      .update({
        name: data.name,
        description: data.description,
        website_url: data.website_url,
        is_restricted: data.is_restricted,
        operating_hours: formatOperatingHours(data.operating_hours),
        type: data.type || 'mosque',
        latitude: selectedLocation.lat || data.latitude,
        longitude: selectedLocation.lng || data.longitude,
      })
      .eq('id', selectedMosque?.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update mosque",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Mosque updated successfully",
    });
    setSelectedMosque(null);
    refetch();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('mosques')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete mosque",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: "Mosque deleted successfully",
    });
    refetch();
  };

  React.useEffect(() => {
    if (selectedMosque) {
      setSelectedLocation({
        lat: selectedMosque.latitude,
        lng: selectedMosque.longitude
      });
    } else {
      setSelectedLocation({ lat: null, lng: null });
    }
  }, [selectedMosque]);

  // Filter mosques based on search term and type filter
  const filteredMosques = mosques?.filter(mosque => {
    // Filter by type
    if (filterType !== 'all' && mosque.type !== filterType) {
      return false;
    }
    
    // Filter by search term
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        mosque.name.toLowerCase().includes(searchTermLower) ||
        (mosque.description && mosque.description.toLowerCase().includes(searchTermLower))
      );
    }
    
    return true;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Mosques</h1>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>

        {selectedMosque ? (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Modify {selectedMosque.type === 'musalla' ? 'Musalla' : 'Mosque'}</h2>
            <MosqueForm
              onSubmit={handleModify}
              selectedLocation={selectedLocation}
              initialValues={selectedMosque}
              onLocationUpdate={handleLocationUpdate}
            />
            <Button 
              variant="outline" 
              onClick={() => setSelectedMosque(null)}
              className="mt-4"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search by name or description"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={filterType === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterType('all')}
                  >
                    All
                  </Button>
                  <Button 
                    variant={filterType === 'mosque' ? 'default' : 'outline'}
                    onClick={() => setFilterType('mosque')}
                  >
                    Mosques
                  </Button>
                  <Button 
                    variant={filterType === 'musalla' ? 'default' : 'outline'}
                    onClick={() => setFilterType('musalla')}
                  >
                    Musallas
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Type</th>
                      <th className="px-6 py-3">Description</th>
                      <th className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMosques.length > 0 ? (
                      filteredMosques.map((mosque) => (
                        <tr key={mosque.id} className="border-t">
                          <td className="px-6 py-4">{mosque.name}</td>
                          <td className="px-6 py-4">{mosque.type === 'musalla' ? 'Musalla' : 'Mosque'}</td>
                          <td className="px-6 py-4">{mosque.description}</td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button 
                                variant="outline"
                                onClick={() => setSelectedMosque(mosque)}
                              >
                                Modify
                              </Button>
                              <Button 
                                variant="destructive"
                                onClick={() => mosque.id && handleDelete(mosque.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                          No mosques found matching your search criteria
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageMosques;
