"use client";

import { useState, useEffect } from 'react';
import { Upload, FileText, Trash2, Book, MessageSquare, Briefcase } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface KnowledgeBaseClientProps {
  userId: string;
}

type FileCategory = 'brand' | 'replies' | 'resources';

interface KnowledgeBaseFile {
  id: string;
  name: string;
  size: number;
  category: string;
  contentType: string;
  url: string;
  createdAt: string;
}

export default function KnowledgeBaseClient({ userId }: KnowledgeBaseClientProps) {
  const [activeTab, setActiveTab] = useState<FileCategory>('brand');
  const [files, setFiles] = useState<KnowledgeBaseFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch files when component mounts or active tab changes
  useEffect(() => {
    fetchFiles();
  }, [activeTab]);
  
  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/knowledge-base/files?category=${activeTab}`);
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      toast.error('Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Upload each file
      for (const file of Array.from(selectedFiles)) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', activeTab);
        
        await axios.post('/api/knowledge-base/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }
      
      // Refresh the file list
      await fetchFiles();
      toast.success('Files uploaded successfully');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      // Reset the input
      e.target.value = '';
    }
  };
  
  const handleDeleteFile = async (fileId: string) => {
    try {
      await axios.delete(`/api/knowledge-base/files/${fileId}`);
      // Update the file list
      setFiles(prev => prev.filter(file => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete file');
    }
  };
  
  const filteredFiles = files.filter(file => file.category === activeTab);
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getCategoryIcon = (category: FileCategory) => {
    switch (category) {
      case 'brand':
        return <Briefcase className="w-5 h-5" />;
      case 'replies':
        return <MessageSquare className="w-5 h-5" />;
      case 'resources':
        return <Book className="w-5 h-5" />;
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('brand')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'brand'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Briefcase className="w-4 h-4 mr-2" />
          Brand Information
        </button>
        <button
          onClick={() => setActiveTab('replies')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'replies'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <MessageSquare className="w-4 h-4 mr-2" />
          Sample Replies
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center px-4 py-3 text-sm font-medium ${
            activeTab === 'resources'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Book className="w-4 h-4 mr-2" />
          Other Resources
        </button>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">
            {activeTab === 'brand' && 'Brand Information'}
            {activeTab === 'replies' && 'Sample Replies'}
            {activeTab === 'resources' && 'Other Resources'}
          </h2>
          <p className="text-sm text-gray-500">
            {activeTab === 'brand' && 'Upload brand guidelines, logos, and other brand-related documents.'}
            {activeTab === 'replies' && 'Upload sample replies, templates, and conversation examples.'}
            {activeTab === 'resources' && 'Upload any other resources that might be helpful for your knowledge base.'}
          </p>
        </div>
        
        {/* Upload area */}
        <div className="mb-8">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-8 h-8 mb-2 text-gray-400" />
              <p className="mb-1 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, DOCX, TXT, JPG, PNG (MAX. 10MB)
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              className="hidden"
              multiple
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
          {isUploading && (
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500 mr-2"></div>
              Uploading files...
            </div>
          )}
        </div>
        
        {/* File list */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files</h3>
          
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-3"></div>
              <p>Loading files...</p>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No files uploaded yet</p>
              <p className="text-sm mt-1">Upload files to build your knowledge base</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-white rounded-md border border-gray-200 mr-3">
                      <FileText className="w-5 h-5 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-gray-500 hover:text-blue-500 rounded-full hover:bg-blue-50 transition-colors"
                      aria-label="View file"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye">
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="p-1.5 text-gray-500 hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                      aria-label="Delete file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 