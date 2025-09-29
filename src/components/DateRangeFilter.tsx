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

  return (
    <div className="date-range-filter">
      <h4>Date Range</h4>
      <div className="date-inputs">
        <div className="date-input-group">
          <label htmlFor="start-date">From:</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            max={endDate || undefined}
          />
        </div>
        <div className="date-input-group">
          <label htmlFor="end-date">To:</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            min={startDate || undefined}
          />
        </div>
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