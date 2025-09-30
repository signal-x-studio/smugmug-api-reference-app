/**
 * QueryBuilder Component
 * 
 * Visual query builder for constructing complex search queries.
 * Allows adding conditions with different operators and logic.
 */

import React, { useState, useCallback } from 'react';

interface QueryCondition {
  field: string;
  operator: string;
  value: string;
}

interface QueryBuilderState {
  conditions: QueryCondition[];
  logic: 'AND' | 'OR';
}

interface QueryBuilderProps {
  onQueryChange: (query: QueryBuilderState) => void;
}

export const QueryBuilder: React.FC<QueryBuilderProps> = ({ onQueryChange }) => {
  const [conditions, setConditions] = useState<QueryCondition[]>([]);
  const [logic, setLogic] = useState<'AND' | 'OR'>('AND');
  const [showAddFilter, setShowAddFilter] = useState(false);

  const addCondition = useCallback((field: string) => {
    const newCondition: QueryCondition = {
      field,
      operator: 'equals',
      value: ''
    };
    const newConditions = [...conditions, newCondition];
    setConditions(newConditions);
    onQueryChange({ conditions: newConditions, logic });
    setShowAddFilter(false);
  }, [conditions, logic, onQueryChange]);

  const updateConditionValue = useCallback((index: number, value: string) => {
    const newConditions = [...conditions];
    newConditions[index].value = value;
    setConditions(newConditions);
    onQueryChange({ conditions: newConditions, logic });
  }, [conditions, logic, onQueryChange]);

  return (
    <div className="query-builder">
      <div className="query-controls">
        <button 
          onClick={() => setShowAddFilter(!showAddFilter)}
          className="add-filter-button"
        >
          Add Filter
        </button>
      </div>

      {/* Filter dropdown */}
      {showAddFilter && (
        <div className="filter-options">
          <button onClick={() => addCondition('location')}>Location</button>
          <button onClick={() => addCondition('date')}>Date</button>
          <button onClick={() => addCondition('camera')}>Camera</button>
        </div>
      )}

      {/* Conditions */}
      {conditions.map((condition, index) => (
        <div key={index} className="query-condition">
          <span className="field-name">{condition.field}</span>
          <select 
            value={condition.operator} 
            onChange={(e) => {
              const newConditions = [...conditions];
              newConditions[index].operator = e.target.value;
              setConditions(newConditions);
            }}
          >
            <option value="equals">equals</option>
            <option value="contains">contains</option>
            <option value="before">before</option>
            <option value="after">after</option>
            <option value="between">between</option>
          </select>
          <input
            type="text"
            placeholder={`Enter ${condition.field}...`}
            value={condition.value}
            onChange={(e) => updateConditionValue(index, e.target.value)}
          />
        </div>
      ))}

      {/* Query Preview */}
      <div className="query-preview">
        <h4>Query Preview</h4>
        <div className="preview-text">
          {conditions.length === 0 
            ? 'No conditions added' 
            : conditions.map(c => `${c.field.charAt(0).toUpperCase() + c.field.slice(1)} ${c.operator} "${c.value}"`).join(` ${logic} `)
          }
        </div>
      </div>
    </div>
  );
};