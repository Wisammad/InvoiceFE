import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { InvoiceData } from '@/lib/api';

interface OverviewProps {
  documents: InvoiceData[];
}

export const Overview: React.FC<OverviewProps> = ({ documents }) => {
  const data = useMemo(() => {
    // Count documents by confidence level
    const confidenceCounts = {
      high: 0,
      medium: 0,
      low: 0
    };
    
    documents.forEach(doc => {
      // Calculate average confidence from available fields
      const confidences = [
        doc.from_organization?.confidence,
        doc.to_organization?.confidence,
        doc.amount?.confidence
      ].filter(Boolean);
      
      if (confidences.length === 0) {
        confidenceCounts.low += 1;
        return;
      }
      
      const avgConfidence = confidences.reduce((sum, val) => sum + val, 0) / confidences.length;
      
      if (avgConfidence >= 0.7) {
        confidenceCounts.high += 1;
      } else if (avgConfidence >= 0.5) {
        confidenceCounts.medium += 1;
      } else {
        confidenceCounts.low += 1;
      }
    });
    
    return [
      { name: 'Confidence Levels', high: confidenceCounts.high, medium: confidenceCounts.medium, low: confidenceCounts.low }
    ];
  }, [documents]);
  
  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-[350px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="high" name="High Confidence" fill="#22c55e" radius={[4, 4, 0, 0]} />
        <Bar dataKey="medium" name="Medium Confidence" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        <Bar dataKey="low" name="Low Confidence" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};
