import React from 'react';

interface TextQuestionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export const TextQuestion: React.FC<TextQuestionProps> = ({
  label,
  value,
  onChange,
}) => {
  return (
    <div className="question-container">
      <label className="question-label">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-input"
        autoFocus
      />
    </div>
  );
};

