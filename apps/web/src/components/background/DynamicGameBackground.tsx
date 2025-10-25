'use client';

import React, { useEffect, useState } from 'react';
import GamePageBackground from './GamePageBackground';
import { getPageType } from '@/lib/pageType';

const DynamicGameBackground: React.FC = () => {
  const [pageType, setPageType] = useState<'home' | 'about' | 'skills' | 'projects' | 'blog' | 'contact' | 'checkout' | 'experience' | 'pricing'>('home');
  
  useEffect(() => {
    // Get the current pathname to determine page type
    const pathname = window.location.pathname;
    const type = getPageType(pathname);
    setPageType(type);
  }, []);

  return <GamePageBackground pageType={pageType} />;
};

export default DynamicGameBackground;
