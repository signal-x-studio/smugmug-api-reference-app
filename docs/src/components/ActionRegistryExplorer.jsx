import React, { useState, useEffect } from 'react';

const ActionRegistryExplorer = () => {
  const [selectedAction, setSelectedAction] = useState(null);
  const [testParams, setTestParams] = useState('{}');
  const [testResult, setTestResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Mock action registry for demonstration
  const mockActions = {
    filterPhotos: {
      id: 'filterPhotos',
      name: 'Filter Photos',
      description: 'Filter photos by keywords, date range, location, and other criteria',
      category: 'photos',
      parameters: {
        keywords: {
          type: 'array',
          items: { type: 'string' },
          description: 'Keywords to filter by'
        },
        dateRange: {
          type: 'object',
          properties: {
            start: { type: 'string', format: 'date' },
            end: { type: 'string', format: 'date' }
          },
          description: 'Date range filter'
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 1000,
          default: 100,
          description: 'Maximum number of results'
        }
      },
      examples: [
        {
          description: 'Find sunset photos from 2023',
          parameters: {
            keywords: ['sunset', 'golden hour'],
            dateRange: { start: '2023-01-01', end: '2023-12-31' },
            limit: 20
          }
        }
      ]
    },
    createAlbum: {
      id: 'createAlbum',
      name: 'Create Album',
      description: 'Create a new photo album with specified photos',
      category: 'albums',
      parameters: {
        name: {
          type: 'string',
          description: 'Album name'
        },
        description: {
          type: 'string',
          description: 'Album description'
        },
        photos: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of photo IDs'
        },
        privacy: {
          type: 'string',
          enum: ['public', 'private', 'unlisted'],
          default: 'private',
          description: 'Album privacy setting'
        }
      },
      examples: [
        {
          description: 'Create vacation album',
          parameters: {
            name: 'Summer Vacation 2023',
            description: 'Photos from our amazing summer vacation',
            photos: ['photo-1', 'photo-2', 'photo-3'],
            privacy: 'private'
          }
        }
      ]
    },
    searchPhotos: {
      id: 'searchPhotos',
      name: 'Search Photos',
      description: 'Search photos using text queries and filters',
      category: 'search',
      parameters: {
        query: {
          type: 'string',
          description: 'Search query text'
        },
        filters: {
          type: 'object',
          description: 'Additional search filters'
        },
        sort: {
          type: 'string',
          enum: ['relevance', 'date', 'name'],
          default: 'relevance',
          description: 'Sort order'
        },
        limit: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          default: 25,
          description: 'Maximum results'
        }
      },
      examples: [
        {
          description: 'Search for mountain landscapes',
          parameters: {
            query: 'mountain landscape scenic',
            filters: { minRating: 4 },
            sort: 'relevance',
            limit: 15
          }
        }
      ]
    }
  };

  const categories = [...new Set(Object.values(mockActions).map(action => action.category))];

  const executeTestAction = async () => {
    if (!selectedAction) return;
    
    setLoading(true);
    try {
      // Parse test parameters
      const params = JSON.parse(testParams);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock successful response
      const mockResult = {
        success: true,
        data: generateMockData(selectedAction.id, params),
        metadata: {
          executionTime: Math.random() * 500 + 100,
          timestamp: new Date().toISOString(),
          fromCache: Math.random() > 0.7
        }
      };
      
      setTestResult(mockResult);
    } catch (error) {
      setTestResult({
        success: false,
        error: {
          type: 'ValidationError',
          message: error.message,
          details: 'Please check your JSON syntax and parameter values'
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = (actionId, params) => {
    switch (actionId) {
      case 'filterPhotos':
        return Array.from({ length: Math.min(params.limit || 10, 10) }, (_, i) => ({
          id: `photo-${i + 1}`,
          title: `Filtered Photo ${i + 1}`,
          url: `https://picsum.photos/300/200?random=${i}`,
          keywords: ['sample', 'filtered'],
          createdAt: new Date(2023, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString()
        }));
      
      case 'createAlbum':
        return {
          id: 'album-' + Math.random().toString(36).substr(2, 9),
          name: params.name,
          description: params.description,
          photoCount: params.photos?.length || 0,
          createdAt: new Date().toISOString()
        };
      
      case 'searchPhotos':
        return Array.from({ length: Math.min(params.limit || 5, 5) }, (_, i) => ({
          id: `search-result-${i + 1}`,
          title: `Search Result ${i + 1}`,
          url: `https://picsum.photos/300/200?random=${100 + i}`,
          relevance: Math.random(),
          snippet: `Photo matching "${params.query}"`
        }));
      
      default:
        return { message: 'Action executed successfully' };
    }
  };

  const loadExample = (example) => {
    setTestParams(JSON.stringify(example.parameters, null, 2));
  };

  return (
    <div style={{ 
      border: '1px solid #e1e4e8', 
      borderRadius: '8px', 
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🚀 Action Registry Explorer</h3>
      <p>Explore and test available agent actions interactively.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Action Selection */}
        <div>
          <h4>Available Actions</h4>
          <div style={{ marginBottom: '15px' }}>
            {categories.map(category => (
              <div key={category} style={{ marginBottom: '10px' }}>
                <strong>{category.charAt(0).toUpperCase() + category.slice(1)} Actions:</strong>
                <div style={{ marginLeft: '10px' }}>
                  {Object.values(mockActions)
                    .filter(action => action.category === category)
                    .map(action => (
                      <button
                        key={action.id}
                        onClick={() => {
                          setSelectedAction(action);
                          setTestParams(JSON.stringify(action.examples[0]?.parameters || {}, null, 2));
                          setTestResult(null);
                        }}
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '8px 12px',
                          margin: '4px 0',
                          border: selectedAction?.id === action.id ? '2px solid #0366d6' : '1px solid #d1d5da',
                          borderRadius: '4px',
                          backgroundColor: selectedAction?.id === action.id ? '#f1f8ff' : 'white',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <strong>{action.name}</strong>
                        <br />
                        <small style={{ color: '#6a737d' }}>{action.description}</small>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Details and Testing */}
        <div>
          {selectedAction && (
            <>
              <h4>Action Details: {selectedAction.name}</h4>
              <div style={{ 
                backgroundColor: 'white', 
                padding: '15px', 
                borderRadius: '4px', 
                marginBottom: '15px',
                border: '1px solid #e1e4e8'
              }}>
                <p><strong>Description:</strong> {selectedAction.description}</p>
                <p><strong>Category:</strong> {selectedAction.category}</p>
                
                <div>
                  <strong>Parameters:</strong>
                  <pre style={{ 
                    fontSize: '12px', 
                    backgroundColor: '#f6f8fa', 
                    padding: '10px', 
                    borderRadius: '4px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(selectedAction.parameters, null, 2)}
                  </pre>
                </div>

                {selectedAction.examples && selectedAction.examples.length > 0 && (
                  <div>
                    <strong>Examples:</strong>
                    {selectedAction.examples.map((example, i) => (
                      <div key={i} style={{ margin: '8px 0' }}>
                        <button
                          onClick={() => loadExample(example)}
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            border: '1px solid #0366d6',
                            borderRadius: '4px',
                            backgroundColor: 'white',
                            color: '#0366d6',
                            cursor: 'pointer'
                          }}
                        >
                          Load: {example.description}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <h4>Test Parameters</h4>
              <textarea
                value={testParams}
                onChange={(e) => setTestParams(e.target.value)}
                placeholder="Enter JSON parameters..."
                style={{
                  width: '100%',
                  height: '120px',
                  padding: '10px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  border: '1px solid #d1d5da',
                  borderRadius: '4px',
                  resize: 'vertical'
                }}
              />
              
              <button
                onClick={executeTestAction}
                disabled={loading}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: loading ? '#6a737d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                {loading ? '🔄 Executing...' : '▶️ Execute Action'}
              </button>

              {testResult && (
                <div style={{ marginTop: '15px' }}>
                  <h4>Result</h4>
                  <pre style={{ 
                    backgroundColor: testResult.success ? '#f0fff4' : '#ffeef0',
                    border: `1px solid ${testResult.success ? '#34d399' : '#f87171'}`,
                    padding: '15px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    maxHeight: '300px'
                  }}>
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
          
          {!selectedAction && (
            <div style={{ 
              textAlign: 'center', 
              color: '#6a737d', 
              padding: '40px',
              fontStyle: 'italic'
            }}>
              👈 Select an action from the list to explore its details and test it
            </div>
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px'
      }}>
        <strong>💡 Pro Tip:</strong> This explorer shows the same actions available to AI agents through <code>window.agentActions</code>. 
        Try modifying the test parameters to see how different inputs affect the results.
      </div>
    </div>
  );
};

export default ActionRegistryExplorer;