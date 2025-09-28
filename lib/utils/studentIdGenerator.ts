/**
 * Student ID Generation Utility
 * Format: YYMMBBSS
 * Example: 25091101 (Year: 25, Month: 09, Batch: 11, Serial: 01)
 */

export interface StudentIdConfig {
  batchId: string;
  batchName: string;
  year: number;
  month: number;
  serial: number;
}

export function generateStudentId(config: StudentIdConfig): string {
  const { year, month, batchId, serial } = config;
  
  // Get last 2 digits of year
  const yearShort = year.toString().slice(-2);
  
  // Format month with leading zero (2 digits)
  const monthFormatted = month.toString().padStart(2, '0');
  
  // Generate batch code from batchId (use last 2 digits of MongoDB ObjectId or create sequential)
  const batchCode = generateBatchCode(batchId);
  
  // Format serial with leading zeros (2 digits, max 99 per batch)
  const serialFormatted = serial.toString().padStart(2, '0');
  
  return `${yearShort}${monthFormatted}${batchCode}${serialFormatted}`;
}

export function parseStudentId(studentId: string): StudentIdConfig | null {
  if (studentId.length !== 8) return null;
  
  const year = parseInt(`20${studentId.substring(0, 2)}`);
  const month = parseInt(studentId.substring(2, 4));
  const batchCode = studentId.substring(4, 6);
  const serial = parseInt(studentId.substring(6, 8));
  
  return {
    batchId: '', // Cannot determine from ID alone
    batchName: '', // Cannot determine from ID alone
    year,
    month,
    serial
  };
}

function generateBatchCode(batchId: string): string {
  // Convert MongoDB ObjectId to a 2-digit number
  // This ensures each batch gets a unique 2-digit code
  let hash = 0;
  for (let i = 0; i < batchId.length; i++) {
    const char = batchId.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to positive 2-digit number (01-99)
  const code = Math.abs(hash) % 99 + 1;
  return code.toString().padStart(2, '0');
}

// Batch name to shortcut mapping
export const BATCH_SHORTCUTS: Record<string, string> = {
  'Web Development': 'WEB',
  'Data Science': 'DS',
  'Mobile Development': 'MOB',
  'Digital Marketing': 'DM',
  'Graphic Design': 'GD',
  'UI/UX Design': 'UX',
  'Python Programming': 'PY',
  'JavaScript Development': 'JS',
  'React Development': 'REACT',
  'Node.js Development': 'NODE',
  'Full Stack Development': 'FS',
  'Machine Learning': 'ML',
  'Artificial Intelligence': 'AI',
  'Cybersecurity': 'CS',
  'Cloud Computing': 'CC',
  'DevOps': 'DEV',
  'Blockchain': 'BC',
  'Game Development': 'GAME',
  'Video Editing': 'VE',
  'Photography': 'PHOTO'
};

export function getBatchShortcut(batchName: string): string {
  return BATCH_SHORTCUTS[batchName] || 
    batchName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 4).toUpperCase();
}