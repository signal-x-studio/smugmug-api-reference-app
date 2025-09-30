/**
 * QueryBuilder Component
 *
 * Agent-native visual query builder for constructing complex search queries.
 * Allows adding conditions with different operators and logic.
 *
 * Agent-Native Features:
 * - Dual-interface (human UI + agent API)
 * - Action registration for programmatic query building
 * - Schema.org FilterAction markup
 * - Structured query execution
 */

import React, { useState, useCallback, useEffect } from 'react';
import { useDualInterface } from '../agents/hooks/useDualInterface';
import { AgentWrapper } from '../agents/components/AgentWrapper';

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

  const removeCondition = useCallback((index: number) => {
    const newConditions = conditions.filter((_, i) => i !== index);
    setConditions(newConditions);
    onQueryChange({ conditions: newConditions, logic });
  }, [conditions, logic, onQueryChange]);

  const setQueryLogic = useCallback((newLogic: 'AND' | 'OR') => {
    setLogic(newLogic);
    onQueryChange({ conditions, logic: newLogic });
  }, [conditions, onQueryChange]);

  // Agent-native dual interface
  const { agentInterface, registerAction } = useDualInterface({
    componentId: 'photo-query-builder',
    data: {
      conditions,
      logic,
      conditionCount: conditions.length,
      availableFields: ['location', 'date', 'camera'],
      availableOperators: ['equals', 'contains', 'before', 'after', 'between']
    },
    state: {
      conditions,
      logic,
      showAddFilter
    },
    setState: (newState: any) => {
      if (newState.conditions !== undefined) {
        setConditions(newState.conditions);
      }
      if (newState.logic !== undefined) {
        setLogic(newState.logic);
      }
    },
    exposeGlobally: true,
    security: {
      accessLevel: 'limited-write',
      allowedOperations: ['read', 'add', 'update', 'remove', 'subscribe'],
      deniedOperations: ['delete', 'admin'],
      rateLimit: {
        maxRequestsPerMinute: 60,
        maxConcurrentRequests: 5
      },
      auditLogging: {
        enabled: false,
        logLevel: 'standard',
        includeStateSnapshots: false
      },
      dataSanitization: {
        excludeFields: [],
        maskFields: []
      }
    }
  });

  // Register agent actions
  useEffect(() => {
    registerAction({
      id: 'add-filter-condition',
      name: 'Add Filter Condition',
      description: 'Add a new filter condition to the query builder',
      parameters: [
        {
          name: 'field',
          type: 'string',
          required: true,
          description: 'Field to filter (location, date, camera)'
        },
        {
          name: 'operator',
          type: 'string',
          required: false,
          description: 'Comparison operator (equals, contains, before, after, between)'
        },
        {
          name: 'value',
          type: 'string',
          required: false,
          description: 'Filter value'
        }
      ],
      returns: {
        type: 'object',
        description: 'Result of adding filter condition'
      },
      permissions: ['write'],
      humanEquivalent: 'Click "Add Filter" button and select filter options',
      examples: [
        {
          description: 'Add location filter for Paris',
          input: { field: 'location', operator: 'equals', value: 'Paris' },
          output: { success: true, data: { totalConditions: 1 } }
        }
      ],
      category: 'query-building'
    });

    registerAction({
      id: 'remove-filter-condition',
      name: 'Remove Filter Condition',
      description: 'Remove a filter condition from the query builder',
      parameters: [
        {
          name: 'index',
          type: 'number',
          required: true,
          description: 'Index of condition to remove (0-based)'
        }
      ],
      returns: {
        type: 'object',
        description: 'Result of removing filter condition'
      },
      permissions: ['write'],
      humanEquivalent: 'Click the X button on a filter condition',
      examples: [
        {
          description: 'Remove first filter condition',
          input: { index: 0 },
          output: { success: true, data: { remainingConditions: 0 } }
        }
      ],
      category: 'query-building'
    });

    registerAction({
      id: 'set-query-logic',
      name: 'Set Query Logic',
      description: 'Set the logical operator connecting conditions (AND/OR)',
      parameters: [
        {
          name: 'logic',
          type: 'string',
          required: true,
          description: 'Logical operator: AND or OR'
        }
      ],
      returns: {
        type: 'object',
        description: 'Result of setting query logic'
      },
      permissions: ['write'],
      humanEquivalent: 'Toggle AND/OR switch in query builder',
      examples: [
        {
          description: 'Set logic to OR',
          input: { logic: 'OR' },
          output: { success: true, data: { logic: 'OR' } }
        }
      ],
      category: 'query-building'
    });

    registerAction({
      id: 'get-query-state',
      name: 'Get Query State',
      description: 'Get the current state of the query builder',
      parameters: [],
      returns: {
        type: 'object',
        description: 'Current query builder state'
      },
      permissions: ['read'],
      humanEquivalent: 'View query preview section',
      examples: [
        {
          description: 'Get current query state',
          input: {},
          output: {
            success: true,
            data: { conditions: [], logic: 'AND', conditionCount: 0 }
          }
        }
      ],
      category: 'query-building'
    });
  }, [registerAction, conditions, logic, onQueryChange]);

  return (
    <AgentWrapper
      agentInterface={agentInterface}
      schemaType="Action"
      as="section"
      className="query-builder"
    >
      <div
        itemScope
        itemType="https://schema.org/FilterAction"
        data-agent-component="photo-query-builder"
      >
        <meta itemProp="name" content="Photo Query Builder" />
        <meta itemProp="description" content="Build complex photo search queries with multiple conditions" />

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
          <div className="filter-options" itemProp="option" itemScope itemType="https://schema.org/ItemList">
            <button onClick={() => addCondition('location')}>Location</button>
            <button onClick={() => addCondition('date')}>Date</button>
            <button onClick={() => addCondition('camera')}>Camera</button>
          </div>
        )}

        {/* Conditions */}
        <div itemProp="result" itemScope itemType="https://schema.org/ItemList">
          <meta itemProp="numberOfItems" content={conditions.length.toString()} />
          {conditions.map((condition, index) => (
            <div
              key={index}
              className="query-condition"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              <meta itemProp="position" content={(index + 1).toString()} />
              <span className="field-name" itemProp="name">{condition.field}</span>
              <select
                value={condition.operator}
                onChange={(e) => {
                  const newConditions = [...conditions];
                  newConditions[index].operator = e.target.value;
                  setConditions(newConditions);
                  onQueryChange({ conditions: newConditions, logic });
                }}
                itemProp="additionalType"
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
                itemProp="value"
              />
              <button
                onClick={() => removeCondition(index)}
                className="remove-condition-button"
                aria-label={`Remove ${condition.field} condition`}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Query Preview */}
        <div className="query-preview">
          <h4>Query Preview</h4>
          <div className="preview-text" itemProp="actionStatus">
            {conditions.length === 0
              ? 'No conditions added'
              : conditions.map(c => `${c.field.charAt(0).toUpperCase() + c.field.slice(1)} ${c.operator} "${c.value}"`).join(` ${logic} `)
            }
          </div>
        </div>
      </div>
    </AgentWrapper>
  );
};