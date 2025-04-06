import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp, AlertCircle, CheckCircle, X, File, FileText, Loader2, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import { uploadFile, processFile, debugApi } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UploadFile {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'uploading' | 'processing' | 'success' | 'error';
  progress: number;
  error?: string;
  file_id?: string; // Backend file ID
}

const Upload: React.FC = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const { toast: showToast } = useToast();
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [debugLoading, setDebugLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substring(2, 11),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0
    }));
    
    setFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Upload and process each file
    newFiles.forEach(fileInfo => {
      const file = acceptedFiles.find(f => f.name === fileInfo.name);
      if (file) {
        handleUploadAndProcess(fileInfo.id, file);
      }
    });
    
    toast.success(`${acceptedFiles.length} file(s) added for processing`);
  }, []);

  const handleUploadAndProcess = async (fileId: string, file: File) => {
    try {
      // Update status to uploading
      updateFileStatus(fileId, 'uploading');
      
      // Create an upload progress simulator
      const progressInterval = setInterval(() => {
        setFiles(prevFiles => {
          const fileIndex = prevFiles.findIndex(f => f.id === fileId);
          if (fileIndex === -1) return prevFiles;
          
          const file = prevFiles[fileIndex];
          
          // If already at 90% or error, stop the interval (leave the last 10% for processing)
          if (file.progress >= 90 || file.status !== 'uploading') {
            clearInterval(progressInterval);
            return prevFiles;
          }
          
          // Increment progress
          const newProgress = Math.min(file.progress + (5 + Math.floor(Math.random() * 10)), 90);
          
          // Create a new array with the updated file
          const newFiles = [...prevFiles];
          newFiles[fileIndex] = {
            ...file,
            progress: newProgress
          };
          
          return newFiles;
        });
      }, 200);
      
      // Actually upload the file
      const uploadResponse = await uploadFile(file);
      
      // Clear the progress interval if it's still running
      clearInterval(progressInterval);
      
      // Update file with backend ID and move to processing stage
      updateFileStatus(fileId, 'processing', undefined, uploadResponse.file_id);
      
      // Process the file
      const result = await processFile(uploadResponse.file_id);
      
      // Update to success
      updateFileStatus(fileId, 'success');
      
      showToast({
        title: "Invoice processed successfully",
        description: `${file.name} has been processed successfully.`
      });
      
      // Update progress to 100%
      setFiles(prevFiles => {
        const fileIndex = prevFiles.findIndex(f => f.id === fileId);
        if (fileIndex === -1) return prevFiles;
        
        const newFiles = [...prevFiles];
        newFiles[fileIndex] = {
          ...newFiles[fileIndex],
          progress: 100
        };
        
        return newFiles;
      });
      
    } catch (error) {
      console.error('Error processing file:', error);
      let errorMessage = 'An unknown error occurred';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      updateFileStatus(fileId, 'error', errorMessage);
    }
  };

  const updateFileStatus = (fileId: string, status: UploadFile['status'], error?: string, backendFileId?: string) => {
    setFiles(prevFiles => 
      prevFiles.map(file => 
        file.id === fileId 
          ? { ...file, status, error, file_id: backendFileId || file.file_id }
          : file
      )
    );
  };

  const removeFile = (fileId: string) => {
    setFiles(prevFiles => prevFiles.filter(file => file.id !== fileId));
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png']
    }
  });

  const clearCompleted = () => {
    setFiles(prevFiles => prevFiles.filter(file => !['success', 'error'].includes(file.status)));
  };

  // New function to fetch debug info
  const handleDebugClick = async () => {
    try {
      setDebugLoading(true);
      const info = await debugApi();
      setDebugInfo(info);
      setShowDebugDialog(true);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      toast.error('Failed to fetch debug information');
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Upload Invoices</h1>
        <div className="flex gap-2">
          {files.some(file => ['success', 'error'].includes(file.status)) && (
            <Button variant="outline" onClick={clearCompleted}>
              Clear Completed
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleDebugClick}
            disabled={debugLoading}
          >
            {debugLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Bug className="h-4 w-4 mr-2" />
            )}
            Debug
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
        </CardHeader>
        <CardContent>
          <div 
            {...getRootProps()} 
            className={cn(
              "border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all hover:bg-muted/50",
              isDragActive && "drag-active"
            )}
          >
            <input {...getInputProps()} />
            <FileUp className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Drag & drop files here</h3>
            <p className="text-muted-foreground mb-4">
              or <span className="text-primary font-medium">browse</span> to upload
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPEG, PNG
            </p>
          </div>
        </CardContent>
      </Card>
      
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map(file => (
                <div key={file.id} className="border rounded-md p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      {file.name.endsWith('.pdf') ? (
                        <FileText size={24} className="text-red-500" />
                      ) : (
                        <File size={24} className="text-blue-500" />
                      )}
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {file.status === 'success' && (
                        <CheckCircle size={18} className="text-green-500" />
                      )}
                      {file.status === 'error' && (
                        <AlertCircle size={18} className="text-red-500" />
                      )}
                      {file.status === 'processing' && (
                        <Loader2 size={18} className="text-blue-500 animate-spin" />
                      )}
                      <button 
                        onClick={() => removeFile(file.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Progress value={file.progress} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>
                        {file.status === 'uploading' && 'Uploading...'}
                        {file.status === 'processing' && 'Processing...'}
                        {file.status === 'success' && 'Processed successfully'}
                        {file.status === 'error' && (file.error || 'Upload failed')}
                        {file.status === 'pending' && 'Waiting to upload'}
                      </span>
                      <span>{file.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Debug Dialog */}
      <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Backend Debug Information</DialogTitle>
            <DialogDescription>
              Detailed information about the backend server status
            </DialogDescription>
          </DialogHeader>
          {debugInfo && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Environment</h3>
                <pre className="bg-muted p-2 rounded text-xs">
                  {JSON.stringify(debugInfo.environment, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Directories</h3>
                <pre className="bg-muted p-2 rounded text-xs">
                  {JSON.stringify(debugInfo.directories, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Files</h3>
                <pre className="bg-muted p-2 rounded text-xs">
                  {JSON.stringify(debugInfo.files, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-medium mb-1">Data Structure</h3>
                <pre className="bg-muted p-2 rounded text-xs">
                  {JSON.stringify(debugInfo.data_structure, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Upload;
