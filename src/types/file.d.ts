interface UploadableFile extends File {
  preview?: string;
  status: 'pending' | 'uploading' | 'error' | 'success';
  errorMessage?: string;
}

interface UploadedFileInfo {
  url: string;
  type: string;
  originalName: string;
}
