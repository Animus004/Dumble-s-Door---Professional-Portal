import React from 'react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
  disabled?: boolean;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, color, onClick, disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`p-6 rounded-2xl shadow-lg text-white flex flex-col items-start justify-between transform hover:scale-105 transition-transform duration-300 focus:outline-none focus:ring-4 focus:ring-opacity-50 ${color} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      aria-label={`Open ${title}`}
    >
      <div className="mb-4">{icon}</div>
      <div>
        <h3 className="text-xl font-bold text-left">{title}</h3>
        <p className="text-sm text-left opacity-90">{description}</p>
      </div>
    </button>
  );
};

export default FeatureCard;