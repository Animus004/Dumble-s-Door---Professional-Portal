import React, { useRef } from 'react';

interface FileUploadProps {
  title: string;
  description: string;
  onFilesSelected: (files: FileList) => void;
  uploadedFiles: { name: string; progress: number; error?: string }[];
  isUploading: boolean;
}

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const FileUploadComponent: React.FC<FileUploadProps> = ({ title, description, onFilesSelected, uploadedFiles, isUploading }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleButtonClick = () => fileInputRef.current?.click();

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400">{description}</p>
            <div className="mt-4 p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md text-center">
                <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && onFilesSelected(e.target.files)}
                    className="hidden"
                    aria-hidden="true"
                />
                
                {uploadedFiles.length === 0 ? (
                    <>
                        <p className="text-gray-500 dark:text-gray-400">Select files to upload.</p>
                        <button 
                            type="button" 
                            onClick={handleButtonClick} 
                            disabled={isUploading}
                            className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait"
                        >
                           {isUploading ? 'Uploading...' : 'Select Files'}
                        </button>
                    </>
                ) : (
                    <div className="space-y-3 text-left">
                        {uploadedFiles.map((file, index) => (
                            <div key={index}>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                    <span className="text-gray-500 dark:text-gray-400">{file.progress === 100 ? '✅' : `${file.progress}%`}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1">
                                    <div 
                                        className={`h-2.5 rounded-full transition-all duration-200 ${file.error ? 'bg-red-500' : 'bg-blue-600'}`} 
                                        style={{width: `${file.progress}%`}}>
                                    </div>
                                </div>
                                {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
                            </div>
                        ))}
                         <button 
                            type="button" 
                            onClick={handleButtonClick} 
                            disabled={isUploading}
                            className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-wait"
                        >
                           {isUploading ? 'Uploading...' : 'Add More Files'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileUploadComponent;
