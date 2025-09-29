import React, { useState } from 'react';

const NaturalLanguageQueryTester = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sample queries for demonstration
  const sampleQueries = [
    "Show me sunset photos from last summer",
    "Create an album called 'Best of 2023' with my top-rated photos",
    "Find pictures of Sarah at the beach",
    "Delete blurry photos from my vacation album",
    "Tag all mountain photos as 'landscape'",
    "Organize my photos by date automatically",
    "Show me recent photos with dogs",
    "Create a slideshow of my wedding photos"
  ];

  // Mock NLP processor for demonstration
  const mockNLPProcessor = {
    async classifyIntent(text, context = {}) {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock intent classification based on keywords
      const intents = {
        'show me': { intent: 'filterPhotos', confidence: 0.85 },
        'find': { intent: 'searchPhotos', confidence: 0.90 },
        'create album': { intent: 'createAlbum', confidence: 0.95 },
        'delete': { intent: 'deletePhoto', confidence: 0.88 },
        'tag': { intent: 'updatePhotoMetadata', confidence: 0.92 },
        'organize': { intent: 'batchOrganizePhotos', confidence: 0.78 },
        'slideshow': { intent: 'createSlideshow', confidence: 0.89 }
      };

      // Find matching intent
      const lowerText = text.toLowerCase();
      let matchedIntent = { intent: 'searchPhotos', confidence: 0.60 }; // default
      
      for (const [keyword, intentData] of Object.entries(intents)) {
        if (lowerText.includes(keyword)) {
          matchedIntent = intentData;
          break;
        }
      }

      // Extract entities based on common patterns
      const entities = this.extractEntities(text);
      
      // Generate parameters based on intent and entities
      const parameters = this.generateParameters(matchedIntent.intent, entities, text);

      return {
        intent: matchedIntent.intent,
        parameters,
        confidence: matchedIntent.confidence,
        entities,
        alternativeIntents: this.generateAlternatives(matchedIntent, text),
        processingTime: Math.random() * 200 + 100
      };
    },

    extractEntities(text) {
      const entities = {
        dates: [],
        locations: [],
        people: [],
        keywords: [],
        albums: [],
        qualities: []
      };

      // Date patterns
      const datePatterns = [
        { pattern: /last summer/i, value: { start: '2023-06-01', end: '2023-08-31', context: 'seasonal' } },
        { pattern: /2023/i, value: { start: '2023-01-01', end: '2023-12-31', year: 2023 } },
        { pattern: /recent/i, value: { start: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0], context: 'recent' } },
        { pattern: /wedding/i, value: { context: 'event', eventType: 'wedding' } }
      ];

      datePatterns.forEach(({ pattern, value }) => {
        if (pattern.test(text)) entities.dates.push(value);
      });

      // Location patterns
      const locationPatterns = [
        { pattern: /beach/i, value: 'beach' },
        { pattern: /mountain/i, value: 'mountain' },
        { pattern: /vacation/i, value: 'vacation destination' }
      ];

      locationPatterns.forEach(({ pattern, value }) => {
        if (pattern.test(text)) entities.locations.push(value);
      });

      // People patterns
      const peoplePattern = /(?:of|with)\s+([A-Z][a-z]+)(?:\s+and\s+([A-Z][a-z]+))?/g;
      let match;
      while ((match = peoplePattern.exec(text)) !== null) {
        entities.people.push(match[1]);
        if (match[2]) entities.people.push(match[2]);
      }

      // Keywords
      const keywordPatterns = [
        { pattern: /sunset/i, value: 'sunset' },
        { pattern: /dogs?/i, value: 'dog' },
        { pattern: /landscape/i, value: 'landscape' },
        { pattern: /top.rated|best/i, value: 'high-rating' }
      ];

      keywordPatterns.forEach(({ pattern, value }) => {
        if (pattern.test(text)) entities.keywords.push(value);
      });

      // Album references
      const albumPattern = /'([^']+)'/g;
      while ((match = albumPattern.exec(text)) !== null) {
        entities.albums.push(match[1]);
      }

      // Quality descriptors
      const qualityPatterns = [
        { pattern: /blurry/i, value: 'blurry' },
        { pattern: /top.rated|best/i, value: 'high-quality' }
      ];

      qualityPatterns.forEach(({ pattern, value }) => {
        if (pattern.test(text)) entities.qualities.push(value);
      });

      return entities;
    },

    generateParameters(intent, entities, originalText) {
      const params = {};

      switch (intent) {
        case 'filterPhotos':
        case 'searchPhotos':
          if (entities.keywords.length > 0) params.keywords = entities.keywords;
          if (entities.dates.length > 0) params.dateRange = entities.dates[0];
          if (entities.locations.length > 0) params.location = entities.locations[0];
          if (entities.people.length > 0) params.people = entities.people;
          if (entities.qualities.length > 0) params.quality = entities.qualities[0];
          params.limit = 50;
          break;

        case 'createAlbum':
          if (entities.albums.length > 0) params.name = entities.albums[0];
          if (entities.keywords.includes('high-rating')) {
            params.criteria = { minRating: 4 };
          }
          if (entities.dates.length > 0) params.dateFilter = entities.dates[0];
          break;

        case 'updatePhotoMetadata':
          if (originalText.includes('tag')) {
            const tagMatch = originalText.match(/as ['"']([^'"]+)['"']|as (\w+)/i);
            if (tagMatch) {
              params.updates = { keywords: [tagMatch[1] || tagMatch[2]] };
            }
          }
          if (entities.keywords.length > 0) {
            params.targetPhotos = { keywords: entities.keywords };
          }
          break;

        case 'deletePhoto':
          if (entities.qualities.length > 0) {
            params.criteria = { quality: entities.qualities[0] };
          }
          params.requireConfirmation = true;
          break;

        case 'batchOrganizePhotos':
          params.method = 'byDate';
          params.createAlbums = true;
          break;

        case 'createSlideshow':
          if (entities.keywords.length > 0) params.filterBy = { keywords: entities.keywords };
          if (entities.dates.length > 0) params.filterBy = { ...params.filterBy, ...entities.dates[0] };
          params.autoTransition = true;
          break;
      }

      return params;
    },

    generateAlternatives(primaryIntent, text) {
      const alternatives = [
        { intent: 'searchPhotos', confidence: 0.15 },
        { intent: 'filterPhotos', confidence: 0.12 },
        { intent: 'createAlbum', confidence: 0.08 }
      ].filter(alt => alt.intent !== primaryIntent.intent);

      return alternatives.slice(0, 2);
    }
  };

  const processQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setResults(null);

    try {
      const nlpResult = await mockNLPProcessor.classifyIntent(query);
      
      // Simulate additional processing
      const processedResult = {
        originalQuery: query,
        understanding: nlpResult,
        suggestedAction: {
          id: nlpResult.intent,
          parameters: nlpResult.parameters,
          description: generateActionDescription(nlpResult.intent, nlpResult.parameters)
        },
        confidence: nlpResult.confidence,
        needsConfirmation: nlpResult.confidence < 0.8 || ['deletePhoto', 'batchOrganizePhotos'].includes(nlpResult.intent),
        timestamp: new Date().toISOString()
      };

      setResults(processedResult);
    } catch (error) {
      setResults({
        error: true,
        message: 'Failed to process query',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const generateActionDescription = (intent, parameters) => {
    switch (intent) {
      case 'filterPhotos':
        return `Filter photos${parameters.keywords ? ` containing ${parameters.keywords.join(', ')}` : ''}${parameters.dateRange ? ` from ${parameters.dateRange.context || 'specified period'}` : ''}`;
      
      case 'searchPhotos':
        return `Search for photos${parameters.keywords ? ` matching ${parameters.keywords.join(', ')}` : ''}${parameters.people ? ` featuring ${parameters.people.join(', ')}` : ''}`;
      
      case 'createAlbum':
        return `Create album${parameters.name ? ` named "${parameters.name}"` : ''}${parameters.criteria ? ' with selected criteria' : ''}`;
      
      case 'updatePhotoMetadata':
        return `Update photo metadata${parameters.updates?.keywords ? ` to add tags: ${parameters.updates.keywords.join(', ')}` : ''}`;
      
      case 'deletePhoto':
        return `Delete photos${parameters.criteria ? ` matching criteria (${JSON.stringify(parameters.criteria)})` : ''}`;
      
      case 'batchOrganizePhotos':
        return `Automatically organize photos by ${parameters.method}`;
      
      case 'createSlideshow':
        return `Create slideshow${parameters.filterBy ? ' with filtered photos' : ''}`;
      
      default:
        return `Execute ${intent} action`;
    }
  };

  const loadSampleQuery = (sampleQuery) => {
    setQuery(sampleQuery);
    setResults(null);
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return '#28a745';
    if (confidence >= 0.6) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div style={{ 
      border: '1px solid #e1e4e8', 
      borderRadius: '8px', 
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🗣️ Natural Language Query Tester</h3>
      <p>Test how natural language queries are processed and translated into actions.</p>
      
      {/* Sample Queries */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Try These Sample Queries:</h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {sampleQueries.map((sample, index) => (
            <button
              key={index}
              onClick={() => loadSampleQuery(sample)}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                border: '1px solid #0366d6',
                borderRadius: '16px',
                backgroundColor: 'white',
                color: '#0366d6',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f1f8ff'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Query Input */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Enter Your Query:</h4>
        <div style={{ display: 'flex', gap: '10px' }}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a natural language query like 'Show me sunset photos from last summer'..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5da',
              borderRadius: '4px',
              fontSize: '14px',
              minHeight: '60px',
              resize: 'vertical'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                processQuery();
              }
            }}
          />
          <button
            onClick={processQuery}
            disabled={loading || !query.trim()}
            style={{
              padding: '12px 24px',
              backgroundColor: loading || !query.trim() ? '#6a737d' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              whiteSpace: 'nowrap'
            }}
          >
            {loading ? '🔄 Processing...' : '🚀 Process Query'}
          </button>
        </div>
        <small style={{ color: '#6a737d' }}>
          💡 Tip: Press Ctrl+Enter to process the query
        </small>
      </div>

      {/* Results */}
      {results && (
        <div style={{ marginTop: '20px' }}>
          <h4>Processing Results</h4>
          
          {results.error ? (
            <div style={{
              padding: '15px',
              backgroundColor: '#ffeef0',
              border: '1px solid #f87171',
              borderRadius: '4px',
              color: '#d73027'
            }}>
              <strong>Error:</strong> {results.message}
              {results.details && (
                <div style={{ marginTop: '8px', fontSize: '12px' }}>
                  {results.details}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              {/* Understanding */}
              <div>
                <h5>🧠 Query Understanding</h5>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '15px', 
                  borderRadius: '4px',
                  border: '1px solid #e1e4e8'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Intent:</strong> 
                    <span style={{ 
                      marginLeft: '8px',
                      padding: '2px 8px',
                      backgroundColor: '#f1f8ff',
                      border: '1px solid #0366d6',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {results.understanding.intent}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Confidence:</strong> 
                    <span style={{ 
                      marginLeft: '8px',
                      color: getConfidenceColor(results.confidence),
                      fontWeight: 'bold'
                    }}>
                      {(results.confidence * 100).toFixed(1)}%
                    </span>
                  </div>

                  {results.needsConfirmation && (
                    <div style={{
                      padding: '8px',
                      backgroundColor: '#fff3cd',
                      border: '1px solid #ffeaa7',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      ⚠️ This action requires user confirmation
                    </div>
                  )}

                  {/* Entities */}
                  {Object.keys(results.understanding.entities).some(key => 
                    results.understanding.entities[key].length > 0
                  ) && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Extracted Entities:</strong>
                      <div style={{ fontSize: '12px', marginTop: '5px' }}>
                        {Object.entries(results.understanding.entities).map(([type, values]) => 
                          values.length > 0 && (
                            <div key={type} style={{ margin: '2px 0' }}>
                              <span style={{ color: '#6a737d' }}>{type}:</span> {values.join(', ')}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Alternative Intents */}
                  {results.understanding.alternativeIntents?.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <strong>Alternative Intents:</strong>
                      <div style={{ fontSize: '11px', marginTop: '5px' }}>
                        {results.understanding.alternativeIntents.map((alt, i) => (
                          <div key={i} style={{ color: '#6a737d' }}>
                            {alt.intent} ({(alt.confidence * 100).toFixed(1)}%)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div>
                <h5>⚡ Suggested Action</h5>
                <div style={{ 
                  backgroundColor: 'white', 
                  padding: '15px', 
                  borderRadius: '4px',
                  border: '1px solid #e1e4e8'
                }}>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Action ID:</strong> <code>{results.suggestedAction.id}</code>
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Description:</strong> {results.suggestedAction.description}
                  </div>

                  {/* Parameters */}
                  <div>
                    <strong>Parameters:</strong>
                    <pre style={{
                      fontSize: '11px',
                      backgroundColor: '#f6f8fa',
                      padding: '8px',
                      borderRadius: '4px',
                      margin: '5px 0 0 0',
                      overflow: 'auto',
                      maxHeight: '150px'
                    }}>
                      {JSON.stringify(results.suggestedAction.parameters, null, 2)}
                    </pre>
                  </div>

                  {/* Execution Button */}
                  <button
                    style={{
                      marginTop: '10px',
                      padding: '8px 16px',
                      backgroundColor: results.needsConfirmation ? '#ffc107' : '#28a745',
                      color: results.needsConfirmation ? '#212529' : 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                    onClick={() => alert(`Would execute: ${results.suggestedAction.id}`)}
                  >
                    {results.needsConfirmation ? '⚠️ Execute (Confirmation Required)' : '▶️ Execute Action'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Processing Stats */}
          {results.understanding && (
            <div style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e8f5e8',
              border: '1px solid #28a745',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#155724'
            }}>
              <strong>Processing Stats:</strong> 
              Completed in {results.understanding.processingTime?.toFixed(0)}ms • 
              Entities extracted: {Object.values(results.understanding.entities).flat().length} • 
              Timestamp: {new Date(results.timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px'
      }}>
        <strong>💡 How it Works:</strong>
        <ul style={{ margin: '8px 0 0 0', fontSize: '14px' }}>
          <li>The NLP processor analyzes your natural language input</li>
          <li>It identifies the user's intent and extracts relevant entities (dates, people, keywords)</li>
          <li>The system translates this into a structured action call with parameters</li>
          <li>Confidence scores help determine if confirmation is needed</li>
        </ul>
      </div>
    </div>
  );
};

export default NaturalLanguageQueryTester;