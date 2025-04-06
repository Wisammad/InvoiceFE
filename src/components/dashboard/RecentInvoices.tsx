import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { InvoiceData } from '@/lib/api';

interface RecentInvoicesProps {
  documents: InvoiceData[];
}

export const RecentInvoices: React.FC<RecentInvoicesProps> = ({ documents }) => {
  // Take only the top 5 documents
  const recentInvoices = [...documents]
    .slice(0, 5);

  // Helper function to get confidence level display
  const getConfidenceLevel = (doc: InvoiceData) => {
    // Check available fields for confidence
    const fieldsWithConfidence = [
      doc.from_organization?.confidence,
      doc.to_organization?.confidence,
      doc.amount?.confidence
    ].filter(Boolean);
    
    // Return average confidence if available
    if (fieldsWithConfidence.length > 0) {
      return fieldsWithConfidence.reduce((sum, val) => sum + val, 0) / fieldsWithConfidence.length;
    }
    
    return 0;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-medium">Document</th>
            <th className="text-left py-3 px-4 font-medium">Sender</th>
            <th className="text-left py-3 px-4 font-medium">Recipient</th>
            <th className="text-right py-3 px-4 font-medium">Amount</th>
            <th className="text-left py-3 px-4 font-medium">Confidence</th>
            <th className="text-right py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {recentInvoices.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-4 px-4 text-center text-muted-foreground">
                No documents processed yet
              </td>
            </tr>
          ) : (
            recentInvoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-muted/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-muted-foreground" />
                    {invoice.filename || 'Unknown'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  {invoice.from_organization?.value || 'Unknown'}
                </td>
                <td className="py-3 px-4">
                  {invoice.to_organization?.value || 'Unknown'}
                </td>
                <td className="py-3 px-4 text-right">
                  {invoice.amount?.value 
                    ? formatCurrency(parseFloat(invoice.amount.value)) 
                    : 'N/A'}
                </td>
                <td className="py-3 px-4">
                  <ConfidenceBadge confidence={getConfidenceLevel(invoice)} />
                </td>
                <td className="py-3 px-4 text-right">
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/document/${invoice.id}`}>
                      <ExternalLink size={16} className="mr-1" />
                      View
                    </Link>
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

// Helper component for confidence badge
const ConfidenceBadge: React.FC<{ confidence: number }> = ({ confidence }) => {
  if (confidence >= 0.7) {
    return <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">High</Badge>;
  } else if (confidence >= 0.5) {
    return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">Medium</Badge>;
  } else {
    return <Badge variant="outline" className="bg-red-50 text-red-700 hover:bg-red-50">Low</Badge>;
  }
};
