import React, { useRef, useState } from 'react';
import { Upload, FileUp } from 'lucide-react';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
}

const Dropzone: React.FC<DropzoneProps> = ({ onFilesSelected }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(
        (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFiles.length > 0) {
        onFilesSelected(pdfFiles);
      }
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const pdfFiles = Array.from(e.target.files).filter(
        (file: File) => file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
      );
      onFilesSelected(pdfFiles);
    }
    // Reset input value to allow selecting the same file again if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      onClick={() => fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300
        ${isDragging 
          ? 'border-blue-500 bg-blue-50 scale-[1.01]' 
          : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50 bg-white'
        }
      `}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        className="hidden"
        multiple
        accept=".pdf"
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-blue-100' : 'bg-slate-100'}`}>
          {isDragging ? (
            <FileUp className="w-8 h-8 text-blue-600" />
          ) : (
            <Upload className="w-8 h-8 text-slate-500" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {isDragging ? 'Drop PDFs here' : 'Click to upload or drag and drop'}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Support for multiple PDF files
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dropzone;