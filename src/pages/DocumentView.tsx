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

const DocumentView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('extracted');
  const [editMode, setEditMode] = useState(false);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast: showToast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      fetchDocument(id);
    }
  }, [id]);
  
  const fetchDocument = async (documentId: string) => {
    try {
      setLoading(true);
      const documentData = await getDocument(documentId);
      setData(documentData);
    } catch (error) {
      console.error('Error fetching document:', error);
      showToast({
        title: 'Error',
        description: 'Failed to load document. It may have been deleted or does not exist.',
        variant: 'destructive'
      });
      navigate('/search');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCopyToClipboard = () => {
    if (data) {
      navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      toast.success('Invoice data copied to clipboard');
    }
  };
  
  // Fix: Properly type the field parameter as keyof InvoiceData
  const handleEdit = (field: keyof InvoiceData, value: string) => {
    if (!data) return;
    
    // Only update if the field is a FieldData object
    if (typeof data[field] === 'object' && 'value' in data[field] && !Array.isArray(data[field])) {
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: {
            ...(prev[field] as any),
            value
          }
        };
      });
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading document...</p>
      </div>
    );
  }
  
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertTriangle className="h-8 w-8 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Document Not Found</h2>
        <p className="text-muted-foreground mb-4">The document you're looking for doesn't exist or has been deleted.</p>
        <Button asChild>
          <Link to="/search">Back to Search</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/search" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Search
          </Link>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6" />
            Invoice: {data.invoice_number?.value || 'Unknown'}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleCopyToClipboard}>
            <Copy className="mr-2 h-4 w-4" />
            Copy JSON
          </Button>
          <Button variant="outline" asChild>
            <a href={getFileUrl(data.filename)} target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button onClick={() => setEditMode(!editMode)}>
            {editMode ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit Data
              </>
            )}
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
                    
                    {data.subtotal && data.tax_amount && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FieldDisplay 
                          label="Subtotal" 
                          value={data.subtotal.value} 
                          confidence={data.subtotal.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('subtotal', value)}
                        />
                        
                        <FieldDisplay 
                          label="Tax" 
                          value={data.tax_amount.value} 
                          confidence={data.tax_amount.confidence}
                          editable={editMode}
                          onEdit={(value) => handleEdit('tax_amount', value)}
                        />
                      </div>
                    )}
                    
                    {data.line_items && data.line_items.length > 0 && (
                      <div className="pt-4">
                        <h3 className="text-lg font-medium mb-2">Line Items</h3>
                        <InvoiceDetails 
                          items={data.line_items} 
                          editable={editMode} 
                          subtotal={data.subtotal?.value}
                          tax={data.tax_amount?.value}
                          total={data.total_amount?.value}
                        />
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="raw" className="pt-4">
                  <Card className="border bg-muted/50">
                    <CardContent className="pt-6">
                      <pre className="text-xs whitespace-pre-wrap">
                        {data.raw_text || 'No raw text available'}
                      </pre>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="json" className="pt-4">
                  <Card className="border bg-muted/50">
                    <CardContent className="pt-6">
                      <pre className="text-xs whitespace-pre-wrap overflow-auto">
                        {JSON.stringify(data, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
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
