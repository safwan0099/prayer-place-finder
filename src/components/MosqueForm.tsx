
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { MosqueFormData, Mosque } from '@/types/mosque';
import LocationInput from './LocationInput';
import { toast } from 'react-hot-toast';

interface MosqueFormProps {
  onSubmit: (data: MosqueFormData) => void;
  selectedLocation: { lat: number | null; lng: number | null };
  initialValues?: Mosque;
  onLocationUpdate: (lat: number, lng: number) => void;
}

const DAYS_OF_WEEK = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const MosqueForm = ({ onSubmit, selectedLocation, initialValues, onLocationUpdate }: MosqueFormProps) => {
  const { register, handleSubmit, reset, formState: { errors }, watch, setValue } = useForm<MosqueFormData>({
    defaultValues: initialValues || {
      name: '',
      description: '',
      website_url: '',
      is_restricted: false,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lng,
      operating_hours: DAYS_OF_WEEK.map(day => ({
        day,
        openTime: '05:00',
        closeTime: '22:00'
      })),
      type: 'mosque'
    }
  });

  // Use watch to get current values
  const selectedType = watch('type');
  const isRestricted = watch('is_restricted');

  // Set up event handlers for the radio buttons
  const handleTypeChange = (value: string) => {
    setValue('type', value as 'mosque' | 'musalla');
  };

  const handleAccessTypeChange = (value: string) => {
    setValue('is_restricted', value === 'true');
  };

  // Initialize the form values when the component mounts or initialValues changes
  useEffect(() => {
    if (initialValues) {
      setValue('type', initialValues.type || 'mosque');
      setValue('is_restricted', initialValues.is_restricted);
    }
  }, [initialValues, setValue]);

  const onSubmitWrapper = async (data: MosqueFormData) => {
    // Ensure the form data includes the current location
    const formData = {
      ...data,
      latitude: selectedLocation.lat || data.latitude,
      longitude: selectedLocation.lng || data.longitude
    };
    
    await onSubmit(formData);
    if (!initialValues) {
      reset(); // Only reset if it's a new mosque form
    }
  };

  console.log('Current form values:', { type: selectedType, isRestricted });

  return (
    <form onSubmit={handleSubmit(onSubmitWrapper)} className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Mosque Name *</Label>
          <Input
            id="name"
            {...register('name', { required: 'Mosque name is required' })}
            className="mt-1"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...register('description')}
            className="mt-1"
            placeholder="Brief description of the mosque..."
          />
        </div>

        <div>
          <Label htmlFor="website_url">Website</Label>
          <Input
            id="website_url"
            type="url"
            {...register('website_url')}
            className="mt-1"
            placeholder="https://..."
          />
        </div>

        <div>
          <Label>Type</Label>
          <RadioGroup 
            value={selectedType} 
            onValueChange={handleTypeChange} 
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="mosque" id="mosque-type" />
              <Label htmlFor="mosque-type">Mosque</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="musalla" id="musalla-type" />
              <Label htmlFor="musalla-type">Musalla</Label>
            </div>
          </RadioGroup>
        </div>

        <div>
          <Label>Access Type</Label>
          <RadioGroup 
            value={isRestricted ? "true" : "false"} 
            onValueChange={handleAccessTypeChange} 
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id="public" />
              <Label htmlFor="public">Open to Everyone</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id="restricted" />
              <Label htmlFor="restricted">Restricted Access</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-4">
          <Label>Operating Hours</Label>
          {DAYS_OF_WEEK.map((day, index) => (
            <div key={day} className="grid grid-cols-3 gap-4">
              <Label className="col-span-1 self-center">{day}</Label>
              <div className="col-span-2 grid grid-cols-2 gap-2">
                <Input
                  type="time"
                  {...register(`operating_hours.${index}.openTime`)}
                />
                <Input
                  type="time"
                  {...register(`operating_hours.${index}.closeTime`)}
                />
              </div>
            </div>
          ))}
        </div>

        <div>
          <Label>Location</Label>
          <LocationInput onLocationFound={onLocationUpdate} />
          <div className="grid grid-cols-2 gap-4 mt-1">
            <Input
              readOnly
              value={selectedLocation.lat?.toFixed(6) || 'Click map to select'}
              placeholder="Latitude"
            />
            <Input
              readOnly
              value={selectedLocation.lng?.toFixed(6) || 'Click map to select'}
              placeholder="Longitude"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">You can either search for an address above or click on the map to select a location</p>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialValues ? 'Update' : 'Add'} {selectedType === 'musalla' ? 'Musalla' : 'Mosque'}
      </Button>
    </form>
  );
};

export default MosqueForm;
