import React, { useState } from 'react';

const FileUploadComponent: React.FC<{ title: string, description: string }> = ({ title, description }) => {
    const [files, setFiles] = useState<{name: string, size: string, progress: number}[]>([]);
    
    const handleAddFiles = () => {
        const newFiles = [
            { name: 'Veterinary_License.pdf', size: '1.2 MB', progress: 0 },
            { name: 'Degree_Certificate.pdf', size: '2.5 MB', progress: 0 }
        ];
        setFiles(prev => [...prev, ...newFiles.filter(nf => !prev.some(f => f.name === nf.name))]);
        
        newFiles.forEach(file => {
            const interval = setInterval(() => {
                setFiles(currentFiles => 
                    currentFiles.map(f => {
                        if (f.name === file.name && f.progress < 100) {
                            const newProgress = f.progress + 10;
                            if (newProgress >= 100) clearInterval(interval);
                            return { ...f, progress: Math.min(100, newProgress) };
                        }
                        return f;
                    })
                );
            }, 200);
        });
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
            <div className="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center">
                {files.length === 0 ? (
                    <>
                        <p className="text-gray-500 dark:text-gray-400">Click button to select files.</p>
                        <button type="button" onClick={handleAddFiles} className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300">
                            Select Files (Mock)
                        </button>
                    </>
                ) : (
                    <div className="space-y-3 text-left">
                        {files.map((file, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{file.size}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                    <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-200" style={{width: `${file.progress}%`}}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploadComponent;
