import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Overview } from '@/components/dashboard/Overview';
import { RecentInvoices } from '@/components/dashboard/RecentInvoices';
import { StatusSummary } from '@/components/dashboard/StatusSummary';
import { getDocuments, InvoiceData } from '@/lib/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Dashboard: React.FC = () => {
  const [documents, setDocuments] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await getDocuments();
      setDocuments(data);
      setError(false);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
      setError(true);
      toast({
        title: 'Error',
        description: 'Failed to fetch document data. Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate dashboard metrics
  const totalDocuments = documents.length;
  
  // Calculate documents with high confidence
  const highConfidenceDocuments = documents.filter(doc => {
    const confidences = [
      doc.from_organization?.confidence,
      doc.to_organization?.confidence,
      doc.amount?.confidence
    ].filter(Boolean);
    
    if (confidences.length === 0) return false;
    
    const avgConfidence = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
    return avgConfidence >= 0.7;
  }).length;
  
  const successRate = totalDocuments > 0 
    ? ((highConfidenceDocuments / totalDocuments) * 100).toFixed(1) 
    : '0.0';
  
  // Calculate total amount if available
  const totalAmount = documents.reduce((sum, doc) => {
    const amount = doc.amount?.value ? parseFloat(doc.amount.value) : 0;
    return isNaN(amount) ? sum : sum + amount;
  }, 0);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2 text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load data' : 'Documents processed'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load data' : 'Documents with high confidence extraction'}
            </p>
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount (if available)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">
              {error ? 'Failed to load data' : 'Sum of available amounts'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Document Processing Overview</CardTitle>
            <CardDescription>
              Confidence levels of processed documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Overview documents={documents} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Organization Summary</CardTitle>
            <CardDescription>
              Distribution by sender organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <StatusSummary documents={documents} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Documents</CardTitle>
          <CardDescription>
            Recently processed documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RecentInvoices documents={documents} />
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
