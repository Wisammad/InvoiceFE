import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search as SearchIcon, Filter, FileText, ArrowUpDown, Calendar, DollarSign, Building } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { DatePickerWithRange } from '@/components/search/DateRangePicker';
import { formatDate, formatCurrency } from '@/lib/formatters';
import { searchDocuments, getDocuments, InvoiceData, SearchParams } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

const Search: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<string>('invoice_date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [results, setResults] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState<SearchParams>({});
  const { toast } = useToast();
  
  // Load initial documents when the component mounts
  useEffect(() => {
    fetchDocuments();
  }, []);
  
  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const documents = await getDocuments();
      setResults(documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSearch = async () => {
    try {
      setLoading(true);
      
      // Prepare search parameters
      const params: SearchParams = {
        ...searchParams,
        query: searchTerm
      };
      
      const documents = await searchDocuments(params);
      setResults(documents);
      
    } catch (error) {
      console.error('Error searching documents:', error);
      toast({
        title: "Error",
        description: "Failed to search documents. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleDateRangeChange = (dateRange: { from?: Date; to?: Date }) => {
    setSearchParams(prev => ({
      ...prev,
      date_from: dateRange.from ? formatDate(dateRange.from) : undefined,
      date_to: dateRange.to ? formatDate(dateRange.to) : undefined
    }));
  };
  
  const handleAmountRangeChange = (min: string, max: string) => {
    setSearchParams(prev => ({
      ...prev,
      amount_min: min || undefined,
      amount_max: max || undefined
    }));
  };
  
  // Sort the results based on the selected sort field and direction
  const sortedResults = [...results].sort((a, b) => {
    // Handle case where the field might not exist in all documents
    if (!a[sortField] || !b[sortField]) return 0;
    
    // Get the values to compare
    const aValue = typeof a[sortField] === 'object' && 'value' in a[sortField] 
      ? a[sortField].value 
      : a[sortField];
    
    const bValue = typeof b[sortField] === 'object' && 'value' in b[sortField] 
      ? b[sortField].value 
      : b[sortField];
    
    // Handle different field types
    if (sortField === 'invoice_date' || sortField === 'due_date') {
      return sortDirection === 'asc' 
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime();
    } else if (sortField === 'total_amount') {
      const aAmount = parseFloat(aValue);
      const bAmount = parseFloat(bValue);
      return sortDirection === 'asc' 
        ? aAmount - bAmount
        : bAmount - aAmount;
    } else {
      // Default string comparison
      return sortDirection === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    }
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold">Search Invoices</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Search for invoices by invoice number, vendor, date, or amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice number or vendor..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <Calendar className="h-4 w-4" />
                    Date Range
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <DatePickerWithRange onDateChange={handleDateRangeChange} />
                </PopoverContent>
              </Popover>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-1">
                    <DollarSign className="h-4 w-4" />
                    Amount
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="end">
                  <div className="space-y-4">
                    <h4 className="font-medium">Amount Range</h4>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="text-sm">Min</label>
                        <Input 
                          placeholder="0.00" 
                          onChange={(e) => handleAmountRangeChange(
                            e.target.value,
                            searchParams.amount_max || ''
                          )}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm">Max</label>
                        <Input 
                          placeholder="1000.00" 
                          onChange={(e) => handleAmountRangeChange(
                            searchParams.amount_min || '',
                            e.target.value
                          )}
                        />
                      </div>
                    </div>
                    <Button className="w-full" onClick={handleSearch}>Apply</Button>
                  </div>
                </PopoverContent>
              </Popover>
              
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="h-4 w-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          {sortedResults.length} results
        </h2>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('invoice_number')}
                    >
                      Invoice <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('invoice_date')}
                    >
                      Date <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('issuer_name')}
                    >
                      Vendor <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    <button 
                      className="flex items-center gap-1"
                      onClick={() => handleSort('total_amount')}
                    >
                      Amount <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Confidence
                  </th>
                  <th className="text-left py-3 px-4 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-4 px-4 text-center text-muted-foreground">
                      {loading ? 'Loading...' : 'No invoices found'}
                    </td>
                  </tr>
                ) : (
                  sortedResults.map(invoice => (
                    <tr key={invoice.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        {invoice.invoice_number?.value || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {invoice.invoice_date?.value 
                          ? formatDate(new Date(invoice.invoice_date.value)) 
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {invoice.issuer_name?.value || 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        {invoice.total_amount?.value 
                          ? formatCurrency(parseFloat(invoice.total_amount.value), 'USD') 
                          : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <div className={`h-2 w-2 rounded-full ${
                            (invoice.invoice_number?.confidence || 0) >= 0.8 
                              ? 'bg-green-500' 
                              : (invoice.invoice_number?.confidence || 0) >= 0.5 
                                ? 'bg-yellow-500' 
                                : 'bg-red-500'
                          }`}></div>
                          <span>
                            {Math.round((invoice.invoice_number?.confidence || 0) * 100)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/document/${invoice.id}`}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Search;
