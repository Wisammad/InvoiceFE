import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface DocumentImageProps {
  filename: string;
  fileUrl: string;
}

export const DocumentImage: React.FC<DocumentImageProps> = ({ filename, fileUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="border rounded-md overflow-hidden bg-muted/50">
      {loading && (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      
      {error ? (
        <div className="flex flex-col items-center justify-center h-96 p-4 text-center">
          <div className="text-red-500 mb-2">Failed to load document preview</div>
          <p className="text-sm text-muted-foreground">
            The document preview could not be loaded. It may be in a format that cannot be displayed.
          </p>
        </div>
      ) : (
        <div className={`${loading ? 'hidden' : 'block'}`}>
          {filename.toLowerCase().endsWith('.pdf') ? (
            <iframe 
              src={`${fileUrl}#toolbar=0&navpanes=0`} 
              className="w-full h-[600px]"
              title="PDF document"
            />
          ) : (
            <img
              src={fileUrl}
              alt="Document preview"
              className="w-full object-contain"
              style={{ maxHeight: '600px' }}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          )}
        </div>
      )}
    </div>
  );
};
