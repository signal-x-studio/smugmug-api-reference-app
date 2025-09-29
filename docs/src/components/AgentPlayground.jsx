import React, { useState, useEffect } from 'react';

const AgentPlayground = () => {
  const [activeTab, setActiveTab] = useState('natural-language');
  const [nlQuery, setNlQuery] = useState('');
  const [actionId, setActionId] = useState('');
  const [actionParams, setActionParams] = useState('{}');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [mockAppState, setMockAppState] = useState({
    selectedPhotos: [],
    currentView: 'gallery',
    totalPhotos: 1247,
    albums: ['Vacation 2023', 'Family Photos', 'Nature & Landscapes'],
    filters: { active: false }
  });

  // Sample scenarios
  const scenarios = [
    {
      id: 'photo-discovery',
      name: '📸 Photo Discovery',
      description: 'Find specific photos using natural language',
      initialQuery: 'Show me sunset photos from my vacation',
      expectedFlow: ['Filter photos', 'Display results', 'Offer refinement options']
    },
    {
      id: 'album-creation',
      name: '📁 Album Creation',
      description: 'Create albums with intelligent organization',
      initialQuery: 'Create an album called "Best of 2023" with my top-rated photos',
      expectedFlow: ['Identify criteria', 'Filter photos', 'Create album', 'Confirm creation']
    },
    {
      id: 'batch-organization',
      name: '🔄 Batch Organization',
      description: 'Organize large photo collections automatically',
      initialQuery: 'Organize all my unorganized photos by date',
      expectedFlow: ['Analyze photos', 'Group by criteria', 'Create albums', 'Report results']
    },
    {
      id: 'smart-tagging',
      name: '🏷️ Smart Tagging',
      description: 'Apply intelligent tags based on photo content',
      initialQuery: 'Tag all my outdoor photos automatically',
      expectedFlow: ['Identify outdoor photos', 'Analyze content', 'Apply tags', 'Show summary']
    }
  ];

  // Available actions for direct testing
  const availableActions = {
    filterPhotos: {
      name: 'Filter Photos',
      description: 'Filter photos by criteria',
      sampleParams: {
        keywords: ['sunset', 'vacation'],
        dateRange: { start: '2023-06-01', end: '2023-08-31' },
        limit: 20
      }
    },
    createAlbum: {
      name: 'Create Album',
      description: 'Create a new photo album',
      sampleParams: {
        name: 'Summer Memories',
        description: 'Best photos from summer vacation',
        photos: ['photo-1', 'photo-2', 'photo-3']
      }
    },
    searchPhotos: {
      name: 'Search Photos',
      description: 'Search photos with text query',
      sampleParams: {
        query: 'family dinner holiday',
        sort: 'relevance',
        limit: 15
      }
    },
    updatePhotoMetadata: {
      name: 'Update Photo Metadata',
      description: 'Update photo tags and information',
      sampleParams: {
        photoIds: ['photo-1', 'photo-2'],
        updates: {
          keywords: ['family', 'celebration'],
          rating: 5
        }
      }
    },
    batchOrganizePhotos: {
      name: 'Batch Organize Photos',
      description: 'Automatically organize photos in bulk',
      sampleParams: {
        method: 'byDate',
        createAlbums: true,
        scope: { albums: null }
      }
    }
  };

  const processNaturalLanguage = async () => {
    if (!nlQuery.trim()) return;
    
    setLoading(true);
    
    try {
      // Simulate NLP processing delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock NLP processing
      const mockResult = {
        originalQuery: nlQuery,
        understanding: {
          intent: detectIntent(nlQuery),
          entities: extractEntities(nlQuery),
          confidence: 0.85 + Math.random() * 0.1,
          parameters: generateParameters(nlQuery)
        },
        suggestedActions: generateSuggestedActions(nlQuery),
        conversationContext: {
          isFollowUp: conversationHistory.length > 0,
          referencesPrevious: checkReferences(nlQuery)
        }
      };
      
      setResults(mockResult);
      
      // Add to conversation history
      setConversationHistory(prev => [...prev, {
        type: 'user',
        content: nlQuery,
        timestamp: new Date(),
        result: mockResult
      }]);
      
      setNlQuery('');
      
      // Simulate agent response
      setTimeout(() => {
        const agentResponse = generateAgentResponse(mockResult);
        setConversationHistory(prev => [...prev, {
          type: 'agent',
          content: agentResponse,
          timestamp: new Date(),
          actions: mockResult.suggestedActions
        }]);
      }, 1000);
      
    } catch (error) {
      setResults({
        error: true,
        message: 'Failed to process natural language query',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const executeDirectAction = async () => {
    if (!actionId) return;
    
    setLoading(true);
    
    try {
      const params = JSON.parse(actionParams);
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const mockResult = {
        actionId,
        parameters: params,
        success: true,
        data: generateActionResult(actionId, params),
        metadata: {
          executionTime: Math.random() * 300 + 100,
          timestamp: new Date().toISOString()
        }
      };
      
      setResults(mockResult);
      
      // Update mock app state based on action
      updateMockState(actionId, params, mockResult.data);
      
    } catch (error) {
      setResults({
        error: true,
        message: 'Invalid JSON parameters or action failed',
        details: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = (scenario) => {
    setNlQuery(scenario.initialQuery);
    setResults(null);
    setConversationHistory([]);
  };

  const loadActionExample = (action) => {
    setActionId(action);
    setActionParams(JSON.stringify(availableActions[action].sampleParams, null, 2));
  };

  // Helper functions
  const detectIntent = (query) => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('show') || lowerQuery.includes('find')) return 'filterPhotos';
    if (lowerQuery.includes('create') && lowerQuery.includes('album')) return 'createAlbum';
    if (lowerQuery.includes('organize') || lowerQuery.includes('batch')) return 'batchOrganizePhotos';
    if (lowerQuery.includes('tag')) return 'updatePhotoMetadata';
    if (lowerQuery.includes('search')) return 'searchPhotos';
    return 'searchPhotos';
  };

  const extractEntities = (query) => {
    const entities = {
      dates: [],
      keywords: [],
      people: [],
      locations: []
    };
    
    // Simple entity extraction
    if (query.includes('sunset')) entities.keywords.push('sunset');
    if (query.includes('vacation')) entities.keywords.push('vacation');
    if (query.includes('family')) entities.keywords.push('family');
    if (query.includes('2023')) entities.dates.push({ year: 2023 });
    if (query.includes('summer')) entities.dates.push({ season: 'summer' });
    
    return entities;
  };

  const generateParameters = (query) => {
    const entities = extractEntities(query);
    const intent = detectIntent(query);
    
    const params = {};
    
    switch (intent) {
      case 'filterPhotos':
        if (entities.keywords.length > 0) params.keywords = entities.keywords;
        if (entities.dates.length > 0) params.dateRange = entities.dates[0];
        params.limit = 20;
        break;
      case 'createAlbum':
        const albumMatch = query.match(/"([^"]+)"|'([^']+)'/);
        if (albumMatch) params.name = albumMatch[1] || albumMatch[2];
        break;
    }
    
    return params;
  };

  const generateSuggestedActions = (query) => {
    const intent = detectIntent(query);
    const params = generateParameters(query);
    
    return [{
      actionId: intent,
      description: `Execute ${intent} with extracted parameters`,
      parameters: params,
      confidence: 0.85
    }];
  };

  const checkReferences = (query) => {
    return query.toLowerCase().includes('these') || 
           query.toLowerCase().includes('them') || 
           query.toLowerCase().includes('those');
  };

  const generateAgentResponse = (nlpResult) => {
    const { intent, confidence } = nlpResult.understanding;
    
    if (confidence > 0.9) {
      return `I understand you want to ${intent}. I found the relevant parameters and I'm ready to execute this action.`;
    } else if (confidence > 0.7) {
      return `I think you want to ${intent}, but I'm not completely sure. Would you like me to proceed or would you prefer to clarify?`;
    } else {
      return `I'm not sure what you want to do. Could you rephrase your request or be more specific?`;
    }
  };

  const generateActionResult = (actionId, params) => {
    switch (actionId) {
      case 'filterPhotos':
        return {
          photos: Array.from({ length: Math.min(params.limit || 10, 15) }, (_, i) => ({
            id: `photo-${i + 1}`,
            title: `Filtered Photo ${i + 1}`,
            url: `https://picsum.photos/200/150?random=${i + 100}`,
            keywords: params.keywords || ['sample']
          })),
          totalFound: 47,
          executionTime: 245
        };
      
      case 'createAlbum':
        return {
          albumId: 'album-' + Math.random().toString(36).substr(2, 9),
          name: params.name,
          photoCount: params.photos?.length || 0,
          createdAt: new Date().toISOString()
        };
      
      default:
        return { message: 'Action completed successfully' };
    }
  };

  const updateMockState = (actionId, params, resultData) => {
    switch (actionId) {
      case 'createAlbum':
        if (resultData.name && !mockAppState.albums.includes(resultData.name)) {
          setMockAppState(prev => ({
            ...prev,
            albums: [...prev.albums, resultData.name]
          }));
        }
        break;
    }
  };

  return (
    <div style={{ 
      border: '1px solid #e1e4e8', 
      borderRadius: '8px', 
      overflow: 'hidden',
      margin: '20px 0',
      backgroundColor: 'white'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: '#f6f8fa',
        padding: '20px',
        borderBottom: '1px solid #e1e4e8'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>🚀 Agent Interaction Playground</h3>
        <p style={{ margin: 0, color: '#6a737d' }}>
          Experience agent-native interactions through natural language commands or direct action calls.
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '1px solid #e1e4e8',
        backgroundColor: '#fafbfc'
      }}>
        {[
          { id: 'natural-language', label: '🗣️ Natural Language', desc: 'Chat with AI' },
          { id: 'direct-actions', label: '⚡ Direct Actions', desc: 'Call functions' },
          { id: 'scenarios', label: '📋 Scenarios', desc: 'Try examples' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              padding: '15px',
              border: 'none',
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              borderBottom: activeTab === tab.id ? '2px solid #0366d6' : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'center'
            }}
          >
            <div style={{ fontWeight: 'bold' }}>{tab.label}</div>
            <div style={{ fontSize: '12px', color: '#6a737d' }}>{tab.desc}</div>
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {/* Natural Language Tab */}
        {activeTab === 'natural-language' && (
          <div>
            <h4>Natural Language Interface</h4>
            <p>Type natural language commands as you would speak to a voice assistant or AI agent.</p>
            
            <div style={{ marginBottom: '20px' }}>
              <textarea
                value={nlQuery}
                onChange={(e) => setNlQuery(e.target.value)}
                placeholder="Try: 'Show me sunset photos from last summer' or 'Create an album with my best photos'..."
                style={{
                  width: '100%',
                  height: '80px',
                  padding: '12px',
                  border: '1px solid #d1d5da',
                  borderRadius: '4px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
              
              <button
                onClick={processNaturalLanguage}
                disabled={loading || !nlQuery.trim()}
                style={{
                  marginTop: '10px',
                  padding: '10px 20px',
                  backgroundColor: loading || !nlQuery.trim() ? '#6a737d' : '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading || !nlQuery.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? '🔄 Processing...' : '🚀 Send to Agent'}
              </button>
            </div>

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h5>Conversation History</h5>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid #e1e4e8',
                  borderRadius: '4px',
                  padding: '15px'
                }}>
                  {conversationHistory.map((item, index) => (
                    <div key={index} style={{
                      marginBottom: '15px',
                      padding: '10px',
                      borderRadius: '4px',
                      backgroundColor: item.type === 'user' ? '#f1f8ff' : '#f0fff4',
                      border: `1px solid ${item.type === 'user' ? '#0366d6' : '#28a745'}`
                    }}>
                      <div style={{ 
                        fontWeight: 'bold', 
                        color: item.type === 'user' ? '#0366d6' : '#28a745',
                        marginBottom: '5px'
                      }}>
                        {item.type === 'user' ? '👤 You' : '🤖 Agent'}
                        <span style={{ 
                          float: 'right', 
                          fontWeight: 'normal', 
                          fontSize: '12px' 
                        }}>
                          {item.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px' }}>{item.content}</div>
                      
                      {item.result && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: '#6a737d' 
                        }}>
                          Confidence: {(item.result.understanding.confidence * 100).toFixed(1)}% • 
                          Intent: {item.result.understanding.intent}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Direct Actions Tab */}
        {activeTab === 'direct-actions' && (
          <div>
            <h4>Direct Action Execution</h4>
            <p>Call agent actions directly with programmatic parameters.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
              <div>
                <h5>Available Actions</h5>
                {Object.entries(availableActions).map(([actionKey, action]) => (
                  <button
                    key={actionKey}
                    onClick={() => loadActionExample(actionKey)}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '10px',
                      margin: '5px 0',
                      border: actionId === actionKey ? '2px solid #0366d6' : '1px solid #d1d5da',
                      borderRadius: '4px',
                      backgroundColor: actionId === actionKey ? '#f1f8ff' : 'white',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    <strong>{action.name}</strong>
                    <div style={{ fontSize: '12px', color: '#6a737d' }}>
                      {action.description}
                    </div>
                  </button>
                ))}
              </div>
              
              <div>
                <h5>Action Parameters</h5>
                <textarea
                  value={actionParams}
                  onChange={(e) => setActionParams(e.target.value)}
                  placeholder="Enter JSON parameters..."
                  style={{
                    width: '100%',
                    height: '150px',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    border: '1px solid #d1d5da',
                    borderRadius: '4px',
                    resize: 'vertical'
                  }}
                />
                
                <button
                  onClick={executeDirectAction}
                  disabled={loading || !actionId}
                  style={{
                    marginTop: '10px',
                    padding: '10px 20px',
                    backgroundColor: loading || !actionId ? '#6a737d' : '#0366d6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading || !actionId ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? '🔄 Executing...' : '▶️ Execute Action'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Scenarios Tab */}
        {activeTab === 'scenarios' && (
          <div>
            <h4>Interactive Scenarios</h4>
            <p>Try common agent interaction workflows with pre-built examples.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
              {scenarios.map(scenario => (
                <div key={scenario.id} style={{
                  border: '1px solid #e1e4e8',
                  borderRadius: '4px',
                  padding: '15px'
                }}>
                  <h5 style={{ margin: '0 0 8px 0' }}>{scenario.name}</h5>
                  <p style={{ fontSize: '14px', color: '#6a737d', margin: '0 0 10px 0' }}>
                    {scenario.description}
                  </p>
                  
                  <div style={{
                    backgroundColor: '#f6f8fa',
                    padding: '8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    marginBottom: '10px'
                  }}>
                    "{scenario.initialQuery}"
                  </div>
                  
                  <div style={{ marginBottom: '10px' }}>
                    <strong style={{ fontSize: '12px' }}>Expected Flow:</strong>
                    <ol style={{ fontSize: '11px', margin: '5px 0 0 15px', padding: 0 }}>
                      {scenario.expectedFlow.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  
                  <button
                    onClick={() => loadScenario(scenario)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#0366d6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Try This Scenario
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results Section */}
        {results && (
          <div style={{ 
            marginTop: '20px',
            borderTop: '1px solid #e1e4e8',
            paddingTop: '20px'
          }}>
            <h4>Results</h4>
            
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
              <pre style={{
                backgroundColor: '#f6f8fa',
                border: '1px solid #e1e4e8',
                borderRadius: '4px',
                padding: '15px',
                fontSize: '12px',
                overflow: 'auto',
                maxHeight: '400px'
              }}>
                {JSON.stringify(results, null, 2)}
              </pre>
            )}
          </div>
        )}

        {/* Current App State */}
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f6ff',
          border: '1px solid #0969da',
          borderRadius: '4px'
        }}>
          <h5 style={{ margin: '0 0 10px 0' }}>📱 Mock App State</h5>
          <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
            Selected Photos: {mockAppState.selectedPhotos.length} • 
            Current View: {mockAppState.currentView} • 
            Total Photos: {mockAppState.totalPhotos} • 
            Albums: {mockAppState.albums.join(', ')}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentPlayground;