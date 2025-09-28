import React from 'react';
import { CurrencyDisplay } from '@/components/ui/CurrencyDisplay';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const TakaIconDemo: React.FC = () => {
  const amounts = [
    { label: 'মাসিক আয়', amount: 450000 },
    { label: 'মোট পরিশোধিত', amount: 125000 },
    { label: 'বকেয়া পরিমাণ', amount: 325000 },
    { label: 'ছাড়ের পরিমাণ', amount: 15000 }
  ];

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">Taka Icon Demo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {amounts.map((item, index) => (
          <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">{item.label}</span>
            <CurrencyDisplay 
              amount={item.amount} 
              size={18}
              className="font-bold"
            />
          </div>
        ))}
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 text-center">
            All amounts now display with the black taka icon (৳)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
