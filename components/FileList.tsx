import React from 'react';
import { UploadedFile } from '../types';
import { FileText, X, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface FileListProps {
  files: UploadedFile[];
  onRemove: (id: string) => void;
  onMove: (index: number, direction: 'up' | 'down') => void;
}

const FileList: React.FC<FileListProps> = ({ files, onRemove, onMove }) => {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3">
      {files.map((file, index) => (
        <div 
          key={file.id}
          className="group flex items-center bg-white border border-slate-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Icon */}
          <div className="flex-shrink-0 mr-4">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-red-500" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-grow min-w-0 mr-4">
            <p className="text-sm font-medium text-slate-900 truncate" title={file.name}>
              {file.name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {file.size}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => { e.stopPropagation(); onMove(index, 'up'); }}
              disabled={index === 0}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Move Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onMove(index, 'down'); }}
              disabled={index === files.length - 1}
              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:hover:bg-transparent"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-200 mx-1"></div>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(file.id); }}
              className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500"
              title="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FileList;
