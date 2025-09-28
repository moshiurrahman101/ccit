// Utility function to convert English numbers to Bangla numerals
export function toBanglaNumbers(num: number | string): string {
  const englishNumbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const banglaNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  
  const numStr = num.toString();
  let banglaStr = '';
  
  for (let i = 0; i < numStr.length; i++) {
    const char = numStr[i];
    const index = englishNumbers.indexOf(char);
    if (index !== -1) {
      banglaStr += banglaNumbers[index];
    } else {
      banglaStr += char;
    }
  }
  
  return banglaStr;
}

// Format currency in Bangla (text only)
export function formatBanglaCurrency(amount: number): string {
  const banglaAmount = toBanglaNumbers(amount);
  return `${banglaAmount}`;
}

// Format currency with BDT symbol (text only)
export function formatBanglaCurrencyWithSymbol(amount: number): string {
  const banglaAmount = toBanglaNumbers(amount);
  return `৳${banglaAmount}`;
}

// Format percentage in Bangla
export function formatBanglaPercentage(value: number): string {
  const banglaValue = toBanglaNumbers(value);
  return `${banglaValue}%`;
}

// Format large numbers with commas in Bangla
export function formatBanglaNumber(num: number): string {
  const formatted = num.toLocaleString();
  return toBanglaNumbers(formatted);
}

// Format date in Bangla
export function formatBanglaDate(date: Date | string): string {
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const day = toBanglaNumbers(dateObj.getDate());
  const month = toBanglaNumbers(dateObj.getMonth() + 1);
  const year = toBanglaNumbers(dateObj.getFullYear());
  
  return `${day}/${month}/${year}`;
}

// Format time in Bangla
export function formatBanglaTime(date: Date | string): string {
  // Convert string to Date if needed
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const hours = toBanglaNumbers(dateObj.getHours());
  const minutes = toBanglaNumbers(dateObj.getMinutes());
  
  return `${hours}:${minutes}`;
}
