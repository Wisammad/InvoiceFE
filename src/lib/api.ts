// API client for connecting to the backend

// Base API URL - can be configured based on environment
const API_BASE_URL = 'http://localhost:5002/api';

// Interface for extracted field data
export interface FieldData {
  value: string;
  confidence: number;
  method: string;
}

// Interface for line item
export interface LineItem {
  description: string;
  quantity: string;
  unit_price: string;
  amount: string;
}

// Interface for invoice data
export interface InvoiceData {
  id: string;
  filename: string;
  invoice_number?: FieldData;
  invoice_date?: FieldData;
  due_date?: FieldData;
  issuer_name?: FieldData;
  recipient_name?: FieldData;
  total_amount?: FieldData;
  subtotal?: FieldData;
  tax_amount?: FieldData;
  payment_terms?: FieldData;
  currency?: FieldData;
  line_items: LineItem[];
  raw_text?: string;
  [key: string]: any; // Allow for additional fields
}

// Upload file interface
export interface UploadResponse {
  file_id: string;
  filename: string;
  status: string;
  message: string;
}

// Upload file to the server
export async function uploadFile(file: File): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/upload`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to upload file');
  }
  
  return response.json();
}

// Process an uploaded file
export async function processFile(fileId: string, category: string = 'Invoices'): Promise<InvoiceData> {
  const response = await fetch(`${API_BASE_URL}/process/${fileId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ category }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to process file');
  }
  
  return response.json();
}

// Get a list of all processed documents
export async function getDocuments(): Promise<InvoiceData[]> {
  const response = await fetch(`${API_BASE_URL}/documents`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch documents');
  }
  
  return response.json();
}

// Get a specific document by ID
export async function getDocument(documentId: string): Promise<InvoiceData> {
  const response = await fetch(`${API_BASE_URL}/documents/${documentId}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to fetch document');
  }
  
  return response.json();
}

// Search for documents
export interface SearchParams {
  query?: string;
  field?: string;
  date_from?: string;
  date_to?: string;
  amount_min?: string;
  amount_max?: string;
}

export async function searchDocuments(params: SearchParams): Promise<InvoiceData[]> {
  const queryParams = new URLSearchParams();
  
  // Add all non-empty params to the query string
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      queryParams.append(key, value);
    }
  });
  
  const response = await fetch(`${API_BASE_URL}/search?${queryParams.toString()}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to search documents');
  }
  
  return response.json();
}

// Get file URL
export function getFileUrl(filename: string): string {
  return `${API_BASE_URL}/files/${filename}`;
}

// Debug API to check backend status
export async function debugApi(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/debug`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to get debug info');
  }
  
  return response.json();
} 