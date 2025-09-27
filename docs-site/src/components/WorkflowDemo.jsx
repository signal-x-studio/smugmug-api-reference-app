import React, { useState } from 'react';

export default function WorkflowDemo() {
  const [activeStep, setActiveStep] = useState(0);
  
  const workflowSteps = [
    {
      agent: "Human Developer",
      action: "Define Architecture",
      code: `// Human-designed interface
interface PhotoMetadataService {
  generateMetadata(image: File): Promise<ImageMetadata>;
  batchProcess(images: File[]): Promise<ProcessingResult[]>;
}`,
      description: "Human sets the architectural foundation and service contracts"
    },
    {
      agent: "Claude Code CLI", 
      action: "Implement Service",
      code: `// Claude generates the service implementation
export const generatePhotoMetadata = async (
  image: File,
  instructions: string,
  apiKey: string
): Promise<ImageMetadata> => {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: METADATA_SCHEMA
    }
  });
  
  const result = await model.generateContent([prompt, imageBytes]);
  return JSON.parse(result.response.text());
};`,
      description: "Claude builds the complete service with proper error handling"
    },
    {
      agent: "Gemini CLI",
      action: "Optimize AI Prompts", 
      code: `// Gemini CLI designs the perfect prompt structure
const prompt = \`You are an expert photo archivist. 
Analyze this image and generate metadata following 
the provided JSON schema.

Focus on:
- Descriptive, engaging titles
- Detailed scene descriptions  
- Relevant keywords for categorization
- Technical details about lighting and composition

Return only valid JSON matching the schema.\`;`,
      description: "Gemini CLI crafts prompts that produce reliable, high-quality responses"
    },
    {
      agent: "GitHub Copilot",
      action: "Complete Components",
      code: `// Copilot fills in the React component details
const PhotoCard: React.FC<PhotoCardProps> = ({ photo, onPhotoClick }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <div className="photo-card" onClick={() => onPhotoClick(photo)}>
      <img src={photo.thumbnailUrl} alt={photo.title} />
      <div className="photo-metadata">
        <h3>{photo.aiData?.title || photo.title}</h3>
        <p>{photo.aiData?.description}</p>
        <div className="keywords">
          {photo.aiData?.keywords?.map(keyword => (
            <span key={keyword} className="keyword">{keyword}</span>
          ))}
        </div>
      </div>
    </div>
  );
};`,
      description: "Copilot handles boilerplate, styling, and component structure"
    }
  ];

  const nextStep = () => {
    setActiveStep((prev) => (prev + 1) % workflowSteps.length);
  };

  const prevStep = () => {
    setActiveStep((prev) => (prev - 1 + workflowSteps.length) % workflowSteps.length);
  };

  const currentStep = workflowSteps[activeStep];
  
  const agentColors = {
    "Human Developer": "#28a745",
    "Claude Code CLI": "#6f42c1", 
    "Gemini CLI": "#fd7e14",
    "GitHub Copilot": "#0366d6"
  };

  return (
    <div className="workflow-demo" style={{margin: '2rem 0'}}>
      <div className="card">
        <div className="card__header">
          <h3>🤖 Interactive Multi-Agent Workflow</h3>
          <p>See how different AI agents collaborate to build features</p>
        </div>
        
        <div className="card__body">
          {/* Progress Indicator */}
          <div className="progress-steps" style={{display: 'flex', justifyContent: 'space-between', marginBottom: '2rem'}}>
            {workflowSteps.map((step, index) => (
              <div 
                key={index}
                className={`progress-step ${index === activeStep ? 'active' : ''} ${index < activeStep ? 'completed' : ''}`}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: index === activeStep ? agentColors[step.agent] : '#f8f9fa',
                  color: index === activeStep ? 'white' : '#666',
                  margin: '0 2px',
                  borderRadius: '4px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
                onClick={() => setActiveStep(index)}
              >
                <div style={{fontWeight: 'bold'}}>{step.agent}</div>
                <div style={{fontSize: '0.7rem', opacity: 0.8}}>{step.action}</div>
              </div>
            ))}
          </div>

          {/* Current Step Content */}
          <div className="step-content">
            <div className="row">
              <div className="col col--8">
                <div style={{
                  backgroundColor: '#1e1e1e',
                  color: '#d4d4d4', 
                  padding: '1rem',
                  borderRadius: '4px',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  overflow: 'auto'
                }}>
                  <div style={{
                    color: agentColors[currentStep.agent], 
                    marginBottom: '0.5rem',
                    fontWeight: 'bold'
                  }}>
                    {currentStep.agent} - {currentStep.action}
                  </div>
                  <pre style={{margin: 0, color: '#d4d4d4'}}>{currentStep.code}</pre>
                </div>
              </div>
              
              <div className="col col--4">
                <div className="agent-info" style={{
                  padding: '1rem',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '4px',
                  borderLeft: `4px solid ${agentColors[currentStep.agent]}`
                }}>
                  <h4 style={{color: agentColors[currentStep.agent], marginBottom: '0.5rem'}}>
                    {currentStep.agent}
                  </h4>
                  <p style={{fontSize: '0.9rem', lineHeight: '1.4', marginBottom: 0}}>
                    {currentStep.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="workflow-navigation" style={{
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #e9ecef'
          }}>
            <button 
              className="button button--secondary button--sm"
              onClick={prevStep}
            >
              ← Previous
            </button>
            
            <span style={{fontSize: '0.9rem', color: '#666'}}>
              Step {activeStep + 1} of {workflowSteps.length}
            </span>
            
            <button 
              className="button button--primary button--sm"
              onClick={nextStep}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card" style={{marginTop: '1rem'}}>
        <div className="card__body">
          <h4>🎯 Workflow Benefits</h4>
          <div className="row">
            <div className="col col--3">
              <strong>60% Faster</strong><br/>
              <small>Development velocity with AI assistance</small>
            </div>
            <div className="col col--3">
              <strong>100% Type Safety</strong><br/>
              <small>TypeScript enforcement throughout</small>
            </div>
            <div className="col col--3">
              <strong>99% Reliability</strong><br/>
              <small>Schema-enforced AI responses</small>
            </div>
            <div className="col col--3">
              <strong>Zero Conflicts</strong><br/>
              <small>Clear agent role separation</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}