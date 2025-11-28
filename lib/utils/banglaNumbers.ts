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
export function formatBanglaCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '০';
  }
  const banglaAmount = toBanglaNumbers(amount);
  return `${banglaAmount}`;
}

// Format currency with BDT symbol (text only)
export function formatBanglaCurrencyWithSymbol(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳০';
  }
  const banglaAmount = toBanglaNumbers(amount);
  return `৳${banglaAmount}`;
}

// Format percentage in Bangla
export function formatBanglaPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '০%';
  }
  const banglaValue = toBanglaNumbers(value);
  return `${banglaValue}%`;
}

// Format large numbers with commas in Bangla
export function formatBanglaNumber(num: number | undefined | null): string {
  if (num === undefined || num === null || isNaN(num)) {
    return '০';
  }
  const formatted = num.toLocaleString();
  return toBanglaNumbers(formatted);
}

// Format date in Bangla
export function formatBanglaDate(date: Date | string | undefined | null): string {
  if (!date) {
    return 'তারিখ নেই';
  }
  
  try {
    let day: number, month: number, year: number;
    
    if (typeof date === 'string') {
      // Parse ISO string or date string to extract date components directly
      // This avoids timezone conversion issues
      const dateStr = date.trim();
      
      // Check if it's an ISO string (contains 'T')
      if (dateStr.includes('T')) {
        // Extract date part before 'T' (YYYY-MM-DD)
        // This preserves the original date without timezone conversion
        const datePart = dateStr.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
          day = parseInt(parts[2], 10);
        } else {
          // Fallback: try parsing as Date
          const dateObj = new Date(date);
          if (isNaN(dateObj.getTime())) {
            return 'তারিখ নেই';
          }
          // Use local date methods to preserve the date as the user set it
          day = dateObj.getDate();
          month = dateObj.getMonth() + 1;
          year = dateObj.getFullYear();
        }
      } else if (dateStr.includes('/')) {
        // Handle MM/DD/YYYY or DD/MM/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          // Try to detect format - if first part > 12, it's likely DD/MM/YYYY
          if (parseInt(parts[0], 10) > 12) {
            day = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
          } else {
            // Assume MM/DD/YYYY format
            month = parseInt(parts[0], 10);
            day = parseInt(parts[1], 10);
            year = parseInt(parts[2], 10);
          }
        } else {
          throw new Error('Invalid date format');
        }
      } else {
        // Try to parse as Date and use local methods
        const dateObj = new Date(date);
        if (isNaN(dateObj.getTime())) {
          return 'তারিখ নেই';
        }
        // Use local date methods to preserve the date as the user set it
        day = dateObj.getDate();
        month = dateObj.getMonth() + 1;
        year = dateObj.getFullYear();
      }
    } else {
      // Date object - use local date methods to preserve the date as the user set it
      if (isNaN(date.getTime())) {
        return 'তারিখ নেই';
      }
      day = date.getDate();
      month = date.getMonth() + 1;
      year = date.getFullYear();
    }
    
    // Validate extracted values
    if (isNaN(day) || isNaN(month) || isNaN(year) || day < 1 || day > 31 || month < 1 || month > 12) {
      return 'তারিখ নেই';
    }
    
    return `${toBanglaNumbers(day)}/${toBanglaNumbers(month)}/${toBanglaNumbers(year)}`;
  } catch (error) {
    return 'তারিখ নেই';
  }
}

// Format time in Bangla
export function formatBanglaTime(date: Date | string | undefined | null): string {
  if (!date) {
    return 'সময় নেই';
  }
  
  try {
    // Convert string to Date if needed
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return 'সময় নেই';
    }
    
    const hours = toBanglaNumbers(dateObj.getHours());
    const minutes = toBanglaNumbers(dateObj.getMinutes());
    
    return `${hours}:${minutes}`;
  } catch (error) {
    return 'সময় নেই';
  }
}
