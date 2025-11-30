export interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: string;
}

export interface MergeStatus {
  state: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export interface AIStatus {
  state: 'idle' | 'loading' | 'success' | 'error';
}
