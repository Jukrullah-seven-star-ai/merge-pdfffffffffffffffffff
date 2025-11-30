import React, { useState, useCallback } from 'react';
import Dropzone from './components/Dropzone';
import FileList from './components/FileList';
import { UploadedFile, MergeStatus, AIStatus } from './types';
import { mergePdfs, downloadPdf, formatFileSize } from './services/pdfService';
import { suggestMergedFilename } from './services/geminiService';
import { Layers, Download, Sparkles, AlertCircle, CheckCircle2, FileStack } from 'lucide-react';

const App: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [outputName, setOutputName] = useState('merged-document');
  const [mergeStatus, setMergeStatus] = useState<MergeStatus>({ state: 'idle' });
  const [aiStatus, setAiStatus] = useState<AIStatus>({ state: 'idle' });

  // Generate a simple unique ID
  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    const formattedFiles: UploadedFile[] = newFiles.map(file => ({
      id: generateId(),
      file,
      name: file.name,
      size: formatFileSize(file.size)
    }));
    
    setFiles(prev => [...prev, ...formattedFiles]);
    setMergeStatus({ state: 'idle' }); // Reset status on change
  }, []);

  const handleRemove = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    setFiles(prev => {
      const newFiles = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      
      if (targetIndex >= 0 && targetIndex < newFiles.length) {
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
      }
      return newFiles;
    });
  };

  const handleMerge = async () => {
    if (files.length === 0) return;

    setMergeStatus({ state: 'processing' });
    try {
      // Simulate a small delay for better UX (so user sees the spinner)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const fileObjects = files.map(f => f.file);
      const mergedPdfBytes = await mergePdfs(fileObjects);
      downloadPdf(mergedPdfBytes, outputName);
      
      setMergeStatus({ state: 'success', message: 'PDF merged successfully!' });
      setTimeout(() => setMergeStatus({ state: 'idle' }), 3000);
    } catch (error) {
      setMergeStatus({ state: 'error', message: 'Failed to merge files.' });
    }
  };

  const handleAiSuggestName = async () => {
    if (files.length === 0) return;
    
    setAiStatus({ state: 'loading' });
    try {
      const names = files.map(f => f.name);
      const suggestion = await suggestMergedFilename(names);
      if (suggestion) {
        setOutputName(suggestion);
        setAiStatus({ state: 'success' });
      }
    } catch (error) {
      console.error(error);
      setAiStatus({ state: 'error' });
    } finally {
      setTimeout(() => setAiStatus({ state: 'idle' }), 2000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">PDF Merger</h1>
          </div>
          <div className="text-sm text-slate-500 font-medium hidden sm:block">
            Secure, Client-side Processing
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-8 sm:py-12">
        
        {/* Intro */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl mb-3">
            Combine PDFs instantly.
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Drag and drop your PDF files below to merge them into a single document. 
            No file uploads required – everything happens in your browser.
          </p>
        </div>

        {/* Upload Area */}
        <div className="mb-8">
          <Dropzone onFilesSelected={handleFilesSelected} />
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center">
                <FileStack className="w-4 h-4 mr-2 text-slate-500"/>
                Files to Merge ({files.length})
              </h3>
              <button 
                onClick={() => setFiles([])}
                className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
              >
                Clear all
              </button>
            </div>

            <FileList 
              files={files} 
              onRemove={handleRemove} 
              onMove={handleMove}
            />

            {/* Merge Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
              
              {/* Filename Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Output Filename
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={outputName}
                      onChange={(e) => setOutputName(e.target.value)}
                      className="block w-full rounded-lg border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm pl-4 pr-12 h-10 border"
                      placeholder="merged-document"
                    />
                    <span className="absolute right-3 top-2.5 text-slate-400 text-sm pointer-events-none">.pdf</span>
                  </div>
                  
                  {process.env.API_KEY && (
                    <button
                      onClick={handleAiSuggestName}
                      disabled={aiStatus.state === 'loading'}
                      className={`
                        inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white 
                        transition-all duration-200 min-w-[140px] justify-center
                        ${aiStatus.state === 'loading' 
                          ? 'bg-purple-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500'
                        }
                      `}
                    >
                      {aiStatus.state === 'loading' ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Thinking...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          AI Rename
                        </>
                      )}
                    </button>
                  )}
                </div>
                {aiStatus.state === 'error' && (
                  <p className="mt-1 text-xs text-red-500">Could not generate name. Try again.</p>
                )}
              </div>

              {/* Action Button */}
              <button
                onClick={handleMerge}
                disabled={mergeStatus.state === 'processing'}
                className={`
                  w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white shadow-sm
                  transition-all duration-200 transform active:scale-[0.99]
                  ${mergeStatus.state === 'processing'
                    ? 'bg-blue-400 cursor-wait'
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30'
                  }
                `}
              >
                {mergeStatus.state === 'processing' ? (
                   <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Merging...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5 mr-2" />
                    Merge PDF
                  </>
                )}
              </button>

              {/* Success/Error Messages */}
              {mergeStatus.state === 'success' && (
                <div className="flex items-center justify-center p-3 rounded-lg bg-green-50 text-green-700 text-sm animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {mergeStatus.message}
                </div>
              )}
              {mergeStatus.state === 'error' && (
                <div className="flex items-center justify-center p-3 rounded-lg bg-red-50 text-red-700 text-sm animate-fade-in">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {mergeStatus.message}
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} PDF Merger. Runs locally in your browser.</p>
      </footer>
    </div>
  );
};

export default App;
