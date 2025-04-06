import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { InvoiceData } from '@/lib/api';

interface StatusSummaryProps {
  documents: InvoiceData[];
}

export const StatusSummary: React.FC<StatusSummaryProps> = ({ documents }) => {
  const data = useMemo(() => {
    // Count documents by sender organization
    const orgCounts: Record<string, number> = {};
    
    documents.forEach(doc => {
      const orgName = doc.from_organization?.value || 'Unknown';
      // Create a simplified org name for better grouping
      const simplifiedOrg = orgName.split(' ')[0];
      
      if (!orgCounts[simplifiedOrg]) {
        orgCounts[simplifiedOrg] = 0;
      }
      
      orgCounts[simplifiedOrg] += 1;
    });
    
    // Convert to array and sort by count
    const result = Object.entries(orgCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);  // Limit to top 5
      
    // If we have other organizations beyond the top 5, group them
    const total = documents.length;
    const topCount = result.reduce((sum, item) => sum + item.value, 0);
    
    if (topCount < total) {
      result.push({ name: 'Others', value: total - topCount });
    }
    
    return result;
  }, [documents]);
  
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#94a3b8'];
  
  if (documents.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        No data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => [`${value} documents`, 'Count']} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};
