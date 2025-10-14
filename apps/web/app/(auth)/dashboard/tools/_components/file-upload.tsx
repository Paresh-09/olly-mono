import React, { useState, useRef } from 'react';
import { Upload, X, File, Check, ArrowUpCircle, RefreshCw, AlertCircle } from 'lucide-react';

interface UploadedFile {
  originalName: string;
  storedName: string;
  fileUrl: string;
  fileId: string;
  fileSize: number;
  fileType: string;
}

interface FileUploadProps {
  onUpload?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string;
  maxSizeMB?: number;
  className?: string;
  multiple?: boolean;
  category?: string;
  tags?: string[];
  autoUpload?: boolean;
}

export default function FileUpload({
  onUpload,
  maxFiles = 10,
  acceptedTypes = 'image/*',
  maxSizeMB = 10,
  className = '',
  multiple = true,
  category = 'uploads',
  tags = [],
  autoUpload = true,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [localFiles, setLocalFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateFiles = (fileList: File[]): { valid: File[], errors: string[] } => {
    const validFiles: File[] = [];
    const errorMessages: string[] = [];
    
    // Check if adding these files would exceed max files limit
    if (localFiles.length + fileList.length > maxFiles) {
      errorMessages.push(`You can only upload a maximum of ${maxFiles} files.`);
      return { valid: validFiles, errors: errorMessages };
    }

    // Validate each file
    Array.from(fileList).forEach(file => {
      // Check file size
      if (file.size > maxSizeBytes) {
        errorMessages.push(`File "${file.name}" exceeds the maximum size of ${maxSizeMB}MB.`);
        return;
      }
      
      // Check file type if acceptedTypes is not '*'
      if (acceptedTypes !== '*') {
        const fileType = file.type;
        const acceptedTypesList = acceptedTypes.split(',');
        
        const isAccepted = acceptedTypesList.some(type => {
          if (type.includes('/*')) {
            // Handle wildcard types (e.g., 'image/*')
            const category = type.split('/')[0];
            return fileType.startsWith(`${category}/`);
          }
          return type === fileType;
        });
        
        if (!isAccepted) {
          errorMessages.push(`File "${file.name}" has an unsupported format.`);
          return;
        }
      }
      
      validFiles.push(file);
    });
    
    return { valid: validFiles, errors: errorMessages };
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const { files: droppedFiles } = e.dataTransfer;
    if (droppedFiles && droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  const processFiles = (fileList: FileList) => {
    const { valid, errors } = validateFiles(Array.from(fileList));
    
    if (errors.length > 0) {
      setErrors(errors);
      return;
    }
    
    if (valid.length > 0) {
      const newFiles = [...localFiles, ...valid];
      setLocalFiles(newFiles);
      
      // If autoUpload is enabled, upload files immediately
      if (autoUpload) {
        uploadFiles(valid);
      }
      
      setErrors([]);
    }
  };

  const uploadFiles = async (filesToUpload: File[]) => {
    if (filesToUpload.length === 0) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setErrors([]);
    
    try {
      const formData = new FormData();
      
      // Add category and tags
      formData.append('category', category);
      if (tags.length > 0) {
        formData.append('tags', tags.join(','));
      }
      
      // Add files
      filesToUpload.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });
      
      // Upload to server
      const response = await fetch('/api/tools/file-upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'File upload failed');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Add to uploaded files
        const newUploadedFiles = [...uploadedFiles, ...data.uploadResults];
        setUploadedFiles(newUploadedFiles);
        
        // Call onUpload if provided
        if (onUpload) {
          onUpload(newUploadedFiles);
        }
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      setErrors([error.message || 'Failed to upload files']);
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  const removeLocalFile = (index: number) => {
    const newFiles = [...localFiles];
    newFiles.splice(index, 1);
    setLocalFiles(newFiles);
  };

  const removeUploadedFile = (fileId: string) => {
    const newUploadedFiles = uploadedFiles.filter(file => file.fileId !== fileId);
    setUploadedFiles(newUploadedFiles);
    
    if (onUpload) {
      onUpload(newUploadedFiles);
    }
  };

  const openFileDialog = () => {
    inputRef.current?.click();
  };

  const clearFiles = () => {
    setLocalFiles([]);
    setUploadedFiles([]);
    
    if (onUpload) {
      onUpload([]);
    }
  };

  const handleManualUpload = () => {
    if (localFiles.length > 0) {
      uploadFiles(localFiles);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
        } hover:bg-gray-100 cursor-pointer`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          multiple={multiple}
          accept={acceptedTypes}
          onChange={handleChange}
        />
        
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <ArrowUpCircle className="w-10 h-10 mb-3 text-gray-400" />
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-gray-500">
            {acceptedTypes !== '*' 
              ? `Accepted formats: ${acceptedTypes.replace(/,/g, ', ')}`
              : 'All file formats accepted'}
          </p>
          <p className="text-xs text-gray-500">
            Max {maxFiles} files, up to {maxSizeMB}MB each
          </p>
        </div>
      </div>

      {/* Error messages */}
      {errors.length > 0 && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="text-sm font-medium text-red-800 mb-1">Upload Error</h4>
          <ul className="text-xs text-red-700 list-disc list-inside">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Manual upload button for non-auto upload */}
      {!autoUpload && localFiles.length > 0 && (
        <div className="mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); handleManualUpload(); }}
            disabled={isUploading}
            className={`w-full py-2 rounded-lg flex items-center justify-center font-medium ${
              isUploading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Uploading... ({Math.round(uploadProgress)}%)
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload {localFiles.length} Files
              </>
            )}
          </button>
        </div>
      )}

      {/* File list - Stage 1: Files selected but not uploaded (only shown for non-auto upload) */}
      {!autoUpload && localFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Files ({localFiles.length})</h4>
            <button 
              onClick={(e) => { e.stopPropagation(); clearFiles(); }} 
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Clear all
            </button>
          </div>
          
          <ul className="space-y-2">
            {localFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                <div className="flex items-center">
                  <File className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm truncate max-w-xs">{file.name}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeLocalFile(index); }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* File list - Stage 2: Uploaded files */}
      {uploadedFiles.length > 0 && (
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({uploadedFiles.length})</h4>
            <button 
              onClick={(e) => { e.stopPropagation(); clearFiles(); }} 
              className="text-xs text-gray-500 hover:text-red-500"
            >
              Clear all
            </button>
          </div>
          
          <ul className="space-y-2">
            {uploadedFiles.map((file) => (
              <li key={file.fileId} className="flex items-center justify-between p-2 bg-white border rounded-lg">
                <div className="flex items-center">
                  <File className="w-4 h-4 mr-2 text-gray-400" />
                  <span className="text-sm truncate max-w-xs">{file.originalName}</span>
                  <span className="ml-2 text-xs text-gray-500">
                    {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </span>
                  <span className="ml-2 text-xs text-green-500 flex items-center">
                    <Check className="w-3 h-3 mr-1" /> Uploaded
                  </span>
                </div>
                <button 
                  onClick={(e) => { e.stopPropagation(); removeUploadedFile(file.fileId); }}
                  className="p-1 text-gray-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}