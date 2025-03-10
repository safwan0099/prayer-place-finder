import React, { useState } from 'react';
import Map from '@/components/Map';
import { Mosque } from '@/types/mosque';

const Home = () => {
  const [mosques, setMosques] = useState<Mosque[]>([]); // Assume you fetch this data
  const [showType, setShowType] = useState<'all' | 'mosque' | 'musalla'>('all');

  const handleTypeChange = (type: 'all' | 'mosque' | 'musalla') => {
    setShowType(type);
  };

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <button onClick={() => handleTypeChange('all')} className="btn">
          All
        </button>
        <button onClick={() => handleTypeChange('mosque')} className="btn">
          Mosques
        </button>
        <button onClick={() => handleTypeChange('musalla')} className="btn">
          Musallas
        </button>
      </div>
      <Map mosques={mosques} showType={showType} />
    </div>
  );
};

export default Home; 