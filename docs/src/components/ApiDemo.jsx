import React, { useState } from 'react';

export default function ApiDemo({ 
  title = "Try the API Schema",
  description = "See how schema enforcement works in practice"
}) {
  const [inputData, setInputData] = useState({
    title: "Beautiful sunset landscape",
    description: "A stunning sunset over mountains with golden light",
    keywords: ["landscape", "sunset", "mountains", "nature"]
  });
  
  const [apiResponse, setApiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const responseSchema = {
    type: "object",
    properties: {
      title: { type: "string", description: "Descriptive photo title" },
      description: { type: "string", description: "Detailed photo description" },
      keywords: { 
        type: "array", 
        items: { type: "string" },
        description: "Relevant keywords for categorization"
      },
      technicalDetails: {
        type: "object",
        properties: {
          estimatedLocation: { type: "string" },
          timeOfDay: { type: "string" },
          weather: { type: "string" }
        }
      }
    },
    required: ["title", "description", "keywords"]
  };

  const simulateApiCall = () => {
    setIsLoading(true);
    
    // Simulate API processing time
    setTimeout(() => {
      const mockResponse = {
        ...inputData,
        technicalDetails: {
          estimatedLocation: "Mountain region",
          timeOfDay: "Golden hour", 
          weather: "Clear skies"
        },
        confidence: 0.94,
        processingTime: "1.2s"
      };
      
      setApiResponse(mockResponse);
      setIsLoading(false);
    }, 1200);
  };

  const updateField = (field, value) => {
    setInputData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateKeywords = (value) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k.length > 0);
    updateField('keywords', keywords);
  };

  const formInputStyle = {
    width: '100%',
    padding: '0.5rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '0.9rem',
    marginBottom: '0.5rem'
  };

  const apiResponseStyle = {
    background: '#f8f9fa',
    border: '1px solid #e9ecef', 
    borderRadius: '4px',
    padding: '1rem',
    maxHeight: '300px',
    overflowY: 'auto',
    fontSize: '0.85rem',
    fontFamily: 'monospace'
  };

  return (
    <div className="api-demo-container" style={{margin: '1rem 0'}}>
      <div className="card">
        <div className="card__header">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        
        <div className="card__body">
          <div className="row">
            {/* Input Section */}
            <div className="col col--6">
              <h4>Input Data</h4>
              <div style={{marginBottom: '0.5rem'}}>
                <label style={{display: 'block', fontWeight: '600', marginBottom: '0.25rem'}}>Title:</label>
                <input 
                  type="text"
                  style={formInputStyle}
                  value={inputData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                />
              </div>
              
              <div style={{marginBottom: '0.5rem'}}>
                <label style={{display: 'block', fontWeight: '600', marginBottom: '0.25rem'}}>Description:</label>
                <textarea 
                  style={{...formInputStyle, minHeight: '80px'}}
                  value={inputData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                />
              </div>
              
              <div style={{marginBottom: '1rem'}}>
                <label style={{display: 'block', fontWeight: '600', marginBottom: '0.25rem'}}>Keywords (comma-separated):</label>
                <input 
                  type="text"
                  style={formInputStyle}
                  value={inputData.keywords.join(', ')}
                  onChange={(e) => updateKeywords(e.target.value)}
                />
              </div>
              
              <button 
                className="button button--primary"
                onClick={simulateApiCall}
                disabled={isLoading}
              >
                {isLoading ? 'Processing...' : 'Generate Metadata'}
              </button>
            </div>
            
            {/* Output Section */}
            <div className="col col--6">
              <h4>Schema-Validated Response</h4>
              <div style={apiResponseStyle}>
                {isLoading ? (
                  <div style={{textAlign: 'center', color: '#666', fontStyle: 'italic'}}>
                    🔄 Processing with Gemini Vision...
                  </div>
                ) : apiResponse ? (
                  <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
                ) : (
                  <div style={{color: '#999', fontStyle: 'italic', textAlign: 'center'}}>
                    Click "Generate Metadata" to see the structured response
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Schema Display */}
      <div className="card" style={{marginTop: '1rem'}}>
        <div className="card__header">
          <h4>Response Schema</h4>
          <p>This ensures every AI response matches the expected structure</p>
        </div>
        <div className="card__body">
          <pre style={{
            background: '#f1f3f4',
            border: '1px solid #dadce0', 
            borderRadius: '4px',
            padding: '1rem',
            maxHeight: '200px',
            overflowY: 'auto',
            fontSize: '0.8rem'
          }}>
            {JSON.stringify(responseSchema, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}