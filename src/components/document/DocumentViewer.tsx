import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getDocument, InvoiceData } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { NoDataPlaceholder } from '@/components/shared/NoDataPlaceholder';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

interface FieldItemProps {
  label: string;
  value?: string;
  confidence?: number;
  method?: string;
}

const FieldItem: React.FC<FieldItemProps> = ({ label, value, confidence, method }) => {
  // If no value, don't render
  if (!value) return null;
  
  // Helper for confidence badge
  const getConfidenceBadge = () => {
    if (!confidence) return null;
    
    if (confidence >= 0.7) {
      return <Badge className="bg-green-100 text-green-800 border-green-300">High</Badge>;
    } else if (confidence >= 0.5) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Medium</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-300">Low</Badge>;
    }
  };
  
  return (
    <div className="flex flex-col space-y-1 mb-4">
      <div className="text-sm font-medium text-muted-foreground">{label}</div>
      <div className="flex items-center justify-between">
        <div className="text-lg">{value}</div>
        <div className="flex items-center space-x-2">
          {method && <span className="text-xs text-muted-foreground">Method: {method}</span>}
          {getConfidenceBadge()}
        </div>
      </div>
    </div>
  );
};

export const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [document, setDocument] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);
  
  const fetchDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const data = await getDocument(documentId);
      setDocument(data);
    } catch (err) {
      console.error('Failed to fetch document:', err);
      toast({
        title: 'Error',
        description: 'Failed to load document. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!document) {
    return <NoDataPlaceholder message="Document not found" />;
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">{document.filename}</h1>
        <p className="text-muted-foreground">
          Document ID: {document.id}
        </p>
      </div>
      
      <Tabs defaultValue="extracted">
        <TabsList>
          <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
          <TabsTrigger value="raw">Raw Text</TabsTrigger>
        </TabsList>
        
        <TabsContent value="extracted" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Details</CardTitle>
              <CardDescription>Information extracted from the document</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Organization Information</h3>
                  <FieldItem 
                    label="From Organization"
                    value={document.from_organization?.value}
                    confidence={document.from_organization?.confidence}
                    method={document.from_organization?.method}
                  />
                  <FieldItem 
                    label="To Organization"
                    value={document.to_organization?.value}
                    confidence={document.to_organization?.confidence}
                    method={document.to_organization?.method}
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
                  <FieldItem 
                    label="Amount"
                    value={document.amount?.value}
                    confidence={document.amount?.confidence}
                    method={document.amount?.method}
                  />
                </div>
              </div>
              
              {/* Additional fields section - for any other fields not explicitly handled */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(document).map(([key, value]) => {
                    // Skip already displayed fields and non-field objects
                    if (['id', 'filename', 'from_organization', 'to_organization', 'amount', 'raw_text', 'line_items'].includes(key) || 
                        typeof value !== 'object' || 
                        value === null) {
                      return null;
                    }
                    
                    // Check if it's a field with value/confidence structure
                    if (value.value) {
                      return (
                        <FieldItem
                          key={key}
                          label={key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          value={value.value}
                          confidence={value.confidence}
                          method={value.method}
                        />
                      );
                    }
                    
                    return null;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="raw">
          <Card>
            <CardHeader>
              <CardTitle>Raw Text</CardTitle>
              <CardDescription>Unprocessed text extracted from the document</CardDescription>
            </CardHeader>
            <CardContent>
              {document.raw_text ? (
                <pre className="bg-muted p-4 rounded-md whitespace-pre-wrap text-sm max-h-[60vh] overflow-auto">
                  {document.raw_text}
                </pre>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No raw text available for this document
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 