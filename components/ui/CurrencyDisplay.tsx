import React from 'react';
import { BDTIcon } from './BDTIcon';
import { formatBanglaCurrency } from '@/lib/utils/banglaNumbers';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showIcon?: boolean;
  size?: number;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({ 
  amount, 
  className = '', 
  showIcon = true,
  size = 16 
}) => {
  const banglaAmount = formatBanglaCurrency(amount);
  
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {showIcon && <BDTIcon size={size} className="text-black" />}
      <span className="font-medium">{banglaAmount}</span>
    </div>
  );
};
