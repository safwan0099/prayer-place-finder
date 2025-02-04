import { OperatingHours } from '@/types/mosque';

export const isOpen = (operatingHours: OperatingHours[]): boolean => {
  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  const todayHours = operatingHours.find(
    hours => hours.day === currentDay
  );

  if (!todayHours) return false;

  return currentTime >= todayHours.openTime && 
         currentTime <= todayHours.closeTime;
};