import React from 'react';
import './DayTabs.css';

interface DayTabsProps {
  days: string[];
  selectedDay: string;
  onSelectDay: (day: string) => void;
}

export const DayTabs: React.FC<DayTabsProps> = ({ days, selectedDay, onSelectDay }) => {
  return (
    <div className="day-tabs">
      {days.map((day) => (
        <button
          key={day}
          className={`day-tab ${selectedDay === day ? 'active' : ''}`}
          onClick={() => onSelectDay(day)}
        >
          {day.slice(0, 3)}
        </button>
      ))}
    </div>
  );
};

