import React, { useState } from 'react';

const SchemaOrgValidator = () => {
  const [schemaInput, setSchemaInput] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const sampleSchema = {
    "@context": "https://schema.org",
    "@type": "Photograph",
    "name": "Golden Gate Bridge at Sunset",
    "description": "Beautiful sunset view of the Golden Gate Bridge from Marin Headlands",
    "contentUrl": "https://example.com/photos/golden-gate-sunset.jpg",
    "keywords": ["sunset", "golden gate bridge", "san francisco", "landscape"],
    "dateCreated": "2023-08-15T19:30:00-07:00",
    "creator": {
      "@type": "Person",
      "name": "John Photographer"
    }
  };

  const validateSchema = async () => {
    if (!schemaInput.trim()) return;
    
    setLoading(true);
    try {
      // Parse JSON to check basic validity
      const schema = JSON.parse(schemaInput);
      
      // Simulate validation delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Basic Schema.org validation
      const result = {
        valid: true,
        errors: [],
        warnings: [],
        suggestions: []
      };

      // Check required fields
      if (!schema['@context']) {
        result.errors.push('Missing @context property');
        result.valid = false;
      }
      
      if (!schema['@type']) {
        result.errors.push('Missing @type property');
        result.valid = false;
      }

      // Check common types
      if (schema['@type'] === 'Photograph') {
        if (!schema.contentUrl) {
          result.warnings.push('contentUrl is recommended for Photograph type');
        }
        if (!schema.name) {
          result.warnings.push('name property helps with photo identification');
        }
      }

      // Check context
      if (schema['@context'] && schema['@context'] !== 'https://schema.org') {
        result.warnings.push('Consider using https://schema.org as @context');
      }

      // Add suggestions
      result.suggestions.push('Add more descriptive keywords for better discoverability');
      result.suggestions.push('Include location data if available');

      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        valid: false,
        errors: [`Invalid JSON: ${error.message}`],
        warnings: [],
        suggestions: []
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSample = () => {
    setSchemaInput(JSON.stringify(sampleSchema, null, 2));
    setValidationResult(null);
  };

  return (
    <div style={{ 
      border: '1px solid #e1e4e8', 
      borderRadius: '8px', 
      padding: '20px',
      margin: '20px 0',
      backgroundColor: '#f8f9fa'
    }}>
      <h3>🔍 Schema.org Validator</h3>
      <p>Validate your Schema.org markup for agent compatibility.</p>
      
      <div style={{ marginBottom: '15px' }}>
        <button
          onClick={loadSample}
          style={{
            padding: '8px 12px',
            backgroundColor: '#0366d6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          📝 Load Sample Schema
        </button>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <textarea
          value={schemaInput}
          onChange={(e) => setSchemaInput(e.target.value)}
          placeholder="Paste your Schema.org JSON-LD here..."
          style={{
            width: '100%',
            height: '200px',
            padding: '10px',
            fontFamily: 'monospace',
            fontSize: '12px',
            border: '1px solid #d1d5da',
            borderRadius: '4px',
            resize: 'vertical'
          }}
        />
      </div>

      <button
        onClick={validateSchema}
        disabled={loading || !schemaInput.trim()}
        style={{
          padding: '10px 20px',
          backgroundColor: loading || !schemaInput.trim() ? '#6a737d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading || !schemaInput.trim() ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '🔄 Validating...' : '✅ Validate Schema'}
      </button>

      {validationResult && (
        <div style={{ marginTop: '20px' }}>
          <h4>Validation Results</h4>
          
          <div style={{
            padding: '15px',
            borderRadius: '4px',
            backgroundColor: validationResult.valid ? '#f0fff4' : '#ffeef0',
            border: `1px solid ${validationResult.valid ? '#28a745' : '#dc3545'}`
          }}>
            <div style={{ 
              fontSize: '16px', 
              fontWeight: 'bold',
              color: validationResult.valid ? '#155724' : '#721c24',
              marginBottom: '10px'
            }}>
              {validationResult.valid ? '✅ Valid Schema.org markup!' : '❌ Invalid Schema'}
            </div>

            {validationResult.errors.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#721c24' }}>Errors:</strong>
                <ul style={{ margin: '5px 0 0 15px', color: '#721c24' }}>
                  {validationResult.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.warnings.length > 0 && (
              <div style={{ marginBottom: '10px' }}>
                <strong style={{ color: '#856404' }}>Warnings:</strong>
                <ul style={{ margin: '5px 0 0 15px', color: '#856404' }}>
                  {validationResult.warnings.map((warning, i) => (
                    <li key={i}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validationResult.suggestions.length > 0 && (
              <div>
                <strong style={{ color: '#0c5460' }}>Suggestions:</strong>
                <ul style={{ margin: '5px 0 0 15px', color: '#0c5460' }}>
                  {validationResult.suggestions.map((suggestion, i) => (
                    <li key={i}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{
        marginTop: '15px',
        padding: '10px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>💡 Tip:</strong> Valid Schema.org markup helps AI agents understand your content structure and available actions.
      </div>
    </div>
  );
};

export default SchemaOrgValidator;