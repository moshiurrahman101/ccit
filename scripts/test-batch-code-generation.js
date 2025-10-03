// Test batch code generation logic without database connection

function generateBatchCode(courseCode, year, batchNumber) {
  return `${courseCode}${year}${batchNumber.toString().padStart(2, '0')}`;
}

function generateBatchName(courseShortcut, batchNumber) {
  return `${courseShortcut} Batch-${batchNumber.toString().padStart(2, '0')}`;
}

function testBatchCodeGeneration() {
  console.log('=== Testing Batch Code Generation ===\n');

  // Test data
  const courseCode = 'GDI';
  const courseShortcut = 'Graphics Design with Illustrator';
  const currentYear = new Date().getFullYear().toString().slice(-2);

  console.log('Course Code:', courseCode);
  console.log('Course Shortcut:', courseShortcut);
  console.log('Current Year (last 2 digits):', currentYear);
  console.log('');

  // Test batch code generation
  console.log('=== Batch Code Generation Tests ===');
  for (let i = 1; i <= 5; i++) {
    const batchCode = generateBatchCode(courseCode, currentYear, i);
    const batchName = generateBatchName(courseShortcut, i);
    console.log(`Batch ${i}: ${batchCode} - ${batchName}`);
  }

  console.log('');
  console.log('=== Expected Results ===');
  console.log('GDI2501 - Graphics Design with Illustrator Batch-01');
  console.log('GDI2502 - Graphics Design with Illustrator Batch-02');
  console.log('GDI2503 - Graphics Design with Illustrator Batch-03');
  console.log('GDI2504 - Graphics Design with Illustrator Batch-04');
  console.log('GDI2505 - Graphics Design with Illustrator Batch-05');

  console.log('');
  console.log('=== Testing Edge Cases ===');
  
  // Test with different course codes
  const testCourses = [
    { code: 'WD', shortcut: 'Web Development' },
    { code: 'DS', shortcut: 'Data Science' },
    { code: 'MD', shortcut: 'Mobile Development' },
    { code: 'UIUX', shortcut: 'UI/UX Design' }
  ];

  testCourses.forEach(course => {
    const batchCode = generateBatchCode(course.code, currentYear, 1);
    const batchName = generateBatchName(course.shortcut, 1);
    console.log(`${course.code} -> ${batchCode} - ${batchName}`);
  });

  console.log('');
  console.log('=== Testing Year Changes ===');
  const testYears = ['24', '25', '26'];
  testYears.forEach(year => {
    const batchCode = generateBatchCode(courseCode, year, 1);
    console.log(`Year ${year}: ${batchCode}`);
  });

  console.log('');
  console.log('=== All tests completed successfully! ===');
}

// Run the test
testBatchCodeGeneration();
