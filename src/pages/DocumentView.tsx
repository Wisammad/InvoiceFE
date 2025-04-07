import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Download, 
  Copy, 
  Edit, 
  Check, 
  AlertTriangle, 
  Info,
  FileText,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatCurrency, getConfidenceClass, getConfidenceText } from '@/lib/formatters';
import { FieldDisplay } from '@/components/document/FieldDisplay';
import { DocumentImage } from '@/components/document/DocumentImage';
import { InvoiceDetails } from '@/components/document/InvoiceDetails';
import { toast } from 'sonner';
import { getDocument, InvoiceData, getFileUrl } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('extracted');
  const [editMode, setEditMode] = useState(false);
  const { toast: showToast } = useToast();
  
  useEffect(() => {
    if (!id) return;
    
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const document = await getDocument(id);
        setData(document);
        setError(null);
      } catch (error) {
        console.error('Error fetching document:', error);
        setError('Failed to load document');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [id]);
  
  const handleEdit = (field: string, value: string) => {
    if (!data) return;
    
    // Create a new data object with the edited field
    const newData = { 
      ...data,
      [field]: {
        ...data[field],
        value,
      }
    };
    
    setData(newData);
    
    // In a real app, we would send this to the backend
    toast.success(`Field '${field}' updated`, {
      description: `Changed to: ${value}`
    });
  };
  
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success('Copied to clipboard');
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast.error('Failed to copy to clipboard');
    });
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }
  
  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
        <h2 className="text-lg font-semibold mb-2">Document Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || 'Unable to load document'}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Back
        </Button>
      </div>
    );
  }
  
  const jsonContent = JSON.stringify(data, null, 2);
  
  return (
    <div className="container py-6 max-w-screen-xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">
            {data.invoice_number?.value 
              ? `Invoice ${data.invoice_number.value}` 
              : 'Document Details'
            }
          </h1>
          {data.extractor_used && (
            <Badge variant="outline" className="ml-2">
              <Info className="h-3 w-3 mr-1" />
              {data.extractor_used}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleEditMode}
          >
            {editMode ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Done
              </>
            ) : (
              <>
                <Edit className="mr-1 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => copyToClipboard(jsonContent)}
          >
            <Copy className="mr-1 h-4 w-4" />
            Copy JSON
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>
              Original invoice document
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DocumentImage filename={data.filename} fileUrl={getFileUrl(data.filename)} />
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Data Extraction Results</CardTitle>
              <CardDescription>
                Key information extracted from the invoice
                {data.extractor_used && (
                  <div className="text-xs mt-1">
                    Processed with <span className="font-semibold">{data.extractor_used}</span>
                  </div>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="extracted">Extracted Data</TabsTrigger>
                  <TabsTrigger value="raw">Raw Text</TabsTrigger>
                  <TabsTrigger value="json">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="extracted" className="pt-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.invoice_number && (
                        <FieldDisplay 
                          label="Invoice Number" 
                          value={data.invoice_number.value} 
                          confidence={data.invoice_number.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('invoice_number', value)}
                        />
                      )}
                      
                      {data.invoice_date && (
                        <FieldDisplay 
                          label="Invoice Date" 
                          value={data.invoice_date.value} 
                          confidence={data.invoice_date.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('invoice_date', value)}
                        />
                      )}
                      
                      {data.due_date && (
                        <FieldDisplay 
                          label="Due Date" 
                          value={data.due_date.value} 
                          confidence={data.due_date.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('due_date', value)}
                        />
                      )}
                      
                      {data.total_amount && (
                        <FieldDisplay 
                          label="Total Amount" 
                          value={data.total_amount.value} 
                          confidence={data.total_amount.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('total_amount', value)}
                        />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.issuer_name && (
                        <FieldDisplay 
                          label="Issuer" 
                          value={data.issuer_name.value} 
                          confidence={data.issuer_name.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('issuer_name', value)}
                        />
                      )}
                      
                      {data.recipient_name && (
                        <FieldDisplay 
                          label="Recipient" 
                          value={data.recipient_name.value} 
                          confidence={data.recipient_name.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('recipient_name', value)}
                        />
                      )}
                      
                      {data.currency && (
                        <FieldDisplay 
                          label="Currency" 
                          value={data.currency.value} 
                          confidence={data.currency.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('currency', value)}
                        />
                      )}
                      
                      {data.payment_terms && (
                        <FieldDisplay 
                          label="Payment Terms" 
                          value={data.payment_terms.value} 
                          confidence={data.payment_terms.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('payment_terms', value)}
                        />
                      )}
                    </div>
                    
                    {/* Display line items if available */}
                    {data.line_items && data.line_items.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold mb-3">Line Items</h3>
                        <InvoiceDetails items={data.line_items} />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="raw" className="pt-4">
                  <div className="bg-muted p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {data.raw_text || 'No raw text available.'}
                    </pre>
                  </div>
                </TabsContent>
                
                <TabsContent value="json" className="pt-4">
                  <div className="bg-muted p-4 rounded-md overflow-auto max-h-[600px]">
                    <pre className="text-sm font-mono">
                      {jsonContent}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
