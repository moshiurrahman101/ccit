'use client';

import { useEffect, ReactNode } from 'react';
import '@/lib/i18n';

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    // Initialize i18n
    const initI18n = async () => {
      const i18n = await import('@/lib/i18n');
      // i18n is already initialized in the lib file
    };
    
    initI18n();
  }, []);

  return <>{children}</>;
}
