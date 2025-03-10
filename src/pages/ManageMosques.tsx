
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mosque, parseOperatingHours, formatOperatingHours, formatMosqueType } from '@/types/mosque';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import MosqueForm from '@/components/MosqueForm';

const ManageMosques = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedMosque, setSelectedMosque] = React.useState<Mosque | null>(null);

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
              selectedLocation={{ 
                lat: selectedMosque.latitude, 
                lng: selectedMosque.longitude 
              }}
              initialValues={selectedMosque}
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
                  {mosques?.map((mosque) => (
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMosques;
