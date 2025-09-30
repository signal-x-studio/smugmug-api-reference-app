// Debug window object detection in test environment
global.window = { agentActions: { test: 'action' } };

console.log('typeof window:', typeof window);
console.log('typeof global:', typeof global);
console.log('global.window exists:', !!(global.window));
console.log('global.window.agentActions:', global.window.agentActions);
console.log('global.window.agentActions !== undefined:', global.window.agentActions !== undefined);

// Test the condition from our getGlobalWindow method
const condition = typeof global !== 'undefined' && global.window && global.window.agentActions !== undefined;
console.log('Condition result:', condition);