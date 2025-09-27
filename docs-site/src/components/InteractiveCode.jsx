import React, { useState } from 'react';
import clsx from 'clsx';

export default function InteractiveCode({ 
  code, 
  language = 'typescript',
  title,
  description,
  highlightLines = [],
  copyable = true
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  return (
    <div className="interactive-code-block margin-bottom--md">
      {(title || description) && (
        <div className="code-block-header padding--sm">
          {title && <h4 className="margin-bottom--xs">{title}</h4>}
          {description && <p className="margin-bottom--none text--secondary">{description}</p>}
        </div>
      )}
      
      <div className="position-relative">
        <pre className={clsx('prism-code', `language-${language}`)}>
          <code>
            {code.split('\n').map((line, index) => (
              <span 
                key={index} 
                className={clsx(
                  'code-line',
                  highlightLines.includes(index + 1) && 'docusaurus-highlight-code-line'
                )}
              >
                {line}
                {'\n'}
              </span>
            ))}
          </code>
        </pre>
        
        {copyable && (
          <button
            className={clsx(
              'clean-btn',
              'copy-code-button',
              'position-absolute',
              copied && 'copy-code-button--copied'
            )}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy code'}
            style={{
              top: '8px',
              right: '8px',
              padding: '4px 8px',
              backgroundColor: copied ? '#28a745' : '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {copied ? '✓' : '📋'}
          </button>
        )}
      </div>
    </div>
  );
}