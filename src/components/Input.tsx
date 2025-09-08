import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> {
  label: string;
  name: string;
  as?: 'input' | 'textarea' | 'select';
  children?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, InputProps>(
    ({ label, name, as = 'input', children, ...props }, ref) => {
    
    const commonClasses = `mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 ${props.disabled ? 'bg-gray-100 dark:bg-gray-800' : ''}`;

    const renderInput = () => {
        const allProps = { id: name, name, ...props };
        switch (as) {
            case 'textarea':
                return <textarea ref={ref as React.Ref<HTMLTextAreaElement>} {...allProps as React.TextareaHTMLAttributes<HTMLTextAreaElement>} className={commonClasses + ' h-24'} />;
            case 'select':
                 return <select ref={ref as React.Ref<HTMLSelectElement>} {...allProps as React.SelectHTMLAttributes<HTMLSelectElement>} className={commonClasses}>{children}</select>;
            default:
                return <input ref={ref as React.Ref<HTMLInputElement>} {...allProps as React.InputHTMLAttributes<HTMLInputElement>} className={commonClasses} />;
        }
    };

    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {renderInput()}
      </div>
    );
});
Input.displayName = 'Input';

export default Input;
