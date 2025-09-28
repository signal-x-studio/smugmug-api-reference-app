/**
 * Simple test validation for AgentIntentHandler
 * This is a manual test to validate our implementation works correctly
 */

import { AgentIntentHandler } from './AgentIntentHandler';

async function testAgentIntentHandler() {
  console.log('=== Testing AgentIntentHandler ===');
  
  const handler = new AgentIntentHandler();
  
  // Test 1: Filter intent
  console.log('\n--- Test 1: Filter Intent ---');
  const filterQuery = 'show me photos with sunset';
  const filterResult = await handler.classifyIntent(filterQuery);
  console.log('Query:', filterQuery);
  console.log('Intent:', filterResult.intent);
  console.log('Confidence:', filterResult.confidence);
  console.log('Entities:', filterResult.entities);
  console.log('Parameters:', filterResult.parameters);
  
  // Test 2: Search intent
  console.log('\n--- Test 2: Search Intent ---');
  const searchQuery = 'find pictures of vacation';
  const searchResult = await handler.classifyIntent(searchQuery);
  console.log('Query:', searchQuery);
  console.log('Intent:', searchResult.intent);
  console.log('Confidence:', searchResult.confidence);
  console.log('Entities:', searchResult.entities);
  
  // Test 3: Unknown intent
  console.log('\n--- Test 3: Unknown Intent ---');
  const unknownQuery = 'asdf qwerty random text';
  const unknownResult = await handler.classifyIntent(unknownQuery);
  console.log('Query:', unknownQuery);
  console.log('Intent:', unknownResult.intent);
  console.log('Confidence:', unknownResult.confidence);
  console.log('Needs Clarification:', unknownResult.needsClarification);
  
  // Test 4: Entity extraction
  console.log('\n--- Test 4: Entity Extraction ---');
  const entityQuery = 'show sunset and beach photos from 2023 taken in Paris';
  const entities = handler.extractEntities(entityQuery);
  console.log('Query:', entityQuery);
  console.log('Extracted Entities:');
  entities.forEach(entity => {
    console.log(`  - ${entity.type}: ${entity.value} (confidence: ${entity.confidence})`);
  });
  
  console.log('\n=== Tests Complete ===');
  return true;
}

export { testAgentIntentHandler };