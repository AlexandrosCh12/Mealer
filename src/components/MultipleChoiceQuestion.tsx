import React from 'react';

interface MultipleChoiceOption {
  label: string;
  value: string;
}

interface MultipleChoiceQuestionProps {
  label: string;
  options: MultipleChoiceOption[];
  value: string;
  onChange: (value: string) => void;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  label,
  options,
  value,
  onChange,
}) => {
  return (
    <div className="question-container">
      <label className="question-label">{label}</label>
      <div className="options-container">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`option-button ${value === option.value ? 'selected' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

