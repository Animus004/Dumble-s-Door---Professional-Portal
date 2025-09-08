import React from 'react';

const ProgressBar: React.FC<{ currentStep: number, totalSteps: number }> = ({ currentStep, totalSteps }) => (
    <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
            <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {currentStep > step ? '✓' : step}
                </div>
                {step < totalSteps && <div className={`flex-auto border-t-2 transition-colors duration-300 ${currentStep > step ? 'border-blue-600' : 'border-gray-200 dark:border-gray-700'}`}></div>}
            </React.Fragment>
        ))}
    </div>
);

export default ProgressBar;
