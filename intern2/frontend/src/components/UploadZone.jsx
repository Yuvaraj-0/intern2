import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, XCircle } from 'lucide-react';

function UploadZone({ onUpload, loading }) {
  const [uploadStatus, setUploadStatus] = useState(null);
  const [fileName, setFileName] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file && file.name.endsWith('.csv')) {
      setFileName(file.name);
      setUploadStatus('uploading');
      onUpload(file);
      setTimeout(() => setUploadStatus('success'), 2000);
    } else {
      setUploadStatus('error');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'text/csv': ['.csv'] },
    multiple: false
  });

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Upload CSV File</h2>
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}
          ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={loading} />
        
        {uploadStatus === 'success' ? (
          <div className="text-green-600">
            <CheckCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">Uploaded Successfully!</p>
            <p className="text-sm">{fileName}</p>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="text-red-600">
            <XCircle className="w-12 h-12 mx-auto mb-2" />
            <p className="font-medium">Invalid File</p>
            <p className="text-sm">Please upload a CSV file</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
            {isDragActive ? (
              <p className="text-blue-600">Drop the CSV file here...</p>
            ) : (
              <>
                <p className="text-gray-600">Drag & drop a CSV file here</p>
                <p className="text-sm text-gray-400 mt-1">or click to select</p>
              </>
            )}
          </>
        )}
      </div>
      
      {loading && (
        <div className="mt-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">Processing...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadZone;
