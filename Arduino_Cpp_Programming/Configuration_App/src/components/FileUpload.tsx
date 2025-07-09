import React, { useState, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  accept: string;
  label: string;
  description?: string;
  onFileSelect: (file: File) => void;
  maxSize?: number; // in MB
  currentFile?: File | null;
  uploadProgress?: number;
  uploadStatus?: 'idle' | 'uploading' | 'success' | 'error';
}

export default function FileUpload({ 
  accept, 
  label, 
  description, 
  onFileSelect, 
  maxSize = 10,
  currentFile,
  uploadProgress = 0,
  uploadStatus = 'idle'
}: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`);
      return;
    }
    onFileSelect(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const clearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileSelect(null as any);
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'uploading': return <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />;
      default: return <Upload className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : currentFile 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          {currentFile ? (
            <div className="space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <File className="h-8 w-8 text-blue-500" />
                {getStatusIcon()}
              </div>
              <div className="flex items-center justify-center space-x-2">
                <span className="text-sm font-medium text-gray-700">{currentFile.name}</span>
                <button
                  onClick={clearFile}
                  className="text-red-500 hover:text-red-700"
                  type="button"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              
              {uploadStatus === 'uploading' && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500 cursor-pointer">
                    Click to upload
                  </span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">
                  {accept.toUpperCase()} files up to {maxSize}MB
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {description && (
        <p className="text-sm text-gray-500">{description}</p>
      )}
    </div>
  );
}