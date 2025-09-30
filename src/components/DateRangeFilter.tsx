/**
 * DateRangeFilter Component
 * 
 * Extracted from FilterPanel God Component.
 * Handles date range selection for temporal filters.
 */

import React, { useState } from 'react';

interface DateRangeFilterProps {
  onDateRangeSelect: (start: Date, end: Date) => void;
}

export const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  onDateRangeSelect
}) => {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showPresets, setShowPresets] = useState(false);

  const handleDateChange = () => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (start <= end) {
        onDateRangeSelect(start, end);
      }
    }
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
    if (e.target.value && endDate) {
      const start = new Date(e.target.value);
      const end = new Date(endDate);
      if (start <= end) {
        onDateRangeSelect(start, end);
      }
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
    if (startDate && e.target.value) {
      const start = new Date(startDate);
      const end = new Date(e.target.value);
      if (start <= end) {
        onDateRangeSelect(start, end);
      }
    }
  };

  const clearDateRange = () => {
    setStartDate('');
    setEndDate('');
  };

  const handlePresetClick = (preset: string) => {
    const now = new Date();
    let start: Date;
    let end = now;

    switch (preset) {
      case 'Last Week':
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'Last Month':
        start = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case 'Last Year':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        return;
    }

    const startISO = start.toISOString().split('T')[0];
    const endISO = end.toISOString().split('T')[0];
    
    setStartDate(startISO);
    setEndDate(endISO);
    onDateRangeSelect(start, end);
    setShowPresets(false);
  };

  return (
    <div className="date-range-filter">
      <h4>Date Range</h4>
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            max={endDate || undefined}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || undefined}
          />
        </div>
      </div>
      
      {/* Date Presets */}
      <div className="date-presets">
        <button 
          type="button" 
          onClick={() => handlePresetClick('Last Week')}
          className="preset-button"
        >
          Last Week
        </button>
        <button 
          type="button" 
          onClick={() => handlePresetClick('Last Month')}
          className="preset-button"
        >
          Last Month
        </button>
        <button 
          type="button" 
          onClick={() => handlePresetClick('Last Year')}
          className="preset-button"
        >
          Last Year
        </button>
      </div>

      <div className="date-actions">
        <button
          type="button"
          onClick={handleDateChange}
          disabled={!startDate || !endDate}
          className="apply-date-range"
        >
          Apply Range
        </button>
        <button
          type="button"
          onClick={clearDateRange}
          className="clear-date-range"
          disabled={!startDate && !endDate}
        >
          Clear
        </button>
      </div>
    </div>
  );
};