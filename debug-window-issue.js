// Debug script to understand window object behavior in test environment

console.log('=== Browser Environment Check ===');

// Check if we're in Node environment
console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);

// Check different window references
if (typeof window !== 'undefined') {
  console.log('window === global.window:', window === global.window);
  console.log('window.hasOwnProperty("agentActions"):', window.hasOwnProperty('agentActions'));
  console.log('window.agentActions:', window.agentActions);
}

if (typeof global !== 'undefined' && global.window) {
  console.log('global.window.hasOwnProperty("agentActions"):', global.window.hasOwnProperty('agentActions'));
  console.log('global.window.agentActions:', global.window.agentActions);
  console.log('"agentActions" in global.window:', 'agentActions' in global.window);
}

// Test the getGlobalWindow logic directly
function testGetGlobalWindow() {
  console.log('\n=== Testing getGlobalWindow Logic ===');
  
  // Simulate test environment
  if (typeof global !== 'undefined' && global.window && 'agentActions' in global.window) {
    console.log('Would return global.window (test environment detected)');
    return global.window;
  }
  
  if (typeof window !== 'undefined') {
    console.log('Would return window (browser environment)');
    return window;
  }
  
  console.log('Would return empty object');
  return {};
}

testGetGlobalWindow();

// Simulate what happens in tests
console.log('\n=== Simulating Test Setup ===');

if (typeof global !== 'undefined') {
  // This is what tests do
  global.window = {
    agentActions: {
      'photo.select': { name: 'Select Photo', category: 'photo' },
      'album.create': { name: 'Create Album', category: 'album' }
    }
  };
  
  console.log('After test setup:');
  console.log('global.window.agentActions:', global.window.agentActions);
  console.log('"agentActions" in global.window:', 'agentActions' in global.window);
  
  // Test the logic again
  const result = testGetGlobalWindow();
  console.log('getGlobalWindow would return:', result);
  console.log('Actions found:', result.agentActions);
}