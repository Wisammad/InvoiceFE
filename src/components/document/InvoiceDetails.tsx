import React from 'react';
import { LineItem } from '@/lib/api';
import { formatCurrency } from '@/lib/formatters';

interface InvoiceDetailsProps {
  items: LineItem[];
  editable?: boolean;
  subtotal?: string;
  tax?: string;
  total?: string;
}

export const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ 
  items, 
  editable = false,
  subtotal = "0",
  tax = "0",
  total = "0"
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 px-3 font-medium">Description</th>
            <th className="text-right py-2 px-3 font-medium">Qty</th>
            <th className="text-right py-2 px-3 font-medium">Unit Price</th>
            <th className="text-right py-2 px-3 font-medium">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-3">
                {editable ? (
                  <input
                    type="text"
                    className="w-full border-b border-dashed focus:outline-none focus:border-primary py-1"
                    defaultValue={item.description}
                  />
                ) : (
                  item.description
                )}
              </td>
              <td className="py-2 px-3 text-right">
                {editable ? (
                  <input
                    type="text"
                    className="w-full text-right border-b border-dashed focus:outline-none focus:border-primary py-1"
                    defaultValue={item.quantity}
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td className="py-2 px-3 text-right">
                {editable ? (
                  <input
                    type="text"
                    className="w-full text-right border-b border-dashed focus:outline-none focus:border-primary py-1"
                    defaultValue={item.unit_price}
                  />
                ) : (
                  formatCurrency(parseFloat(item.unit_price))
                )}
              </td>
              <td className="py-2 px-3 text-right">
                {editable ? (
                  <input
                    type="text"
                    className="w-full text-right border-b border-dashed focus:outline-none focus:border-primary py-1"
                    defaultValue={item.amount}
                  />
                ) : (
                  formatCurrency(parseFloat(item.amount))
                )}
              </td>
            </tr>
          ))}
        </tbody>
        {(subtotal || tax || total) && (
          <tfoot>
            {subtotal && (
              <tr>
                <td colSpan={3} className="py-2 px-3 text-right font-medium">Subtotal</td>
                <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(subtotal))}</td>
              </tr>
            )}
            {tax && (
              <tr>
                <td colSpan={3} className="py-2 px-3 text-right font-medium">Tax</td>
                <td className="py-2 px-3 text-right">{formatCurrency(parseFloat(tax))}</td>
              </tr>
            )}
            {total && (
              <tr>
                <td colSpan={3} className="py-2 px-3 text-right font-medium">Total</td>
                <td className="py-2 px-3 text-right font-medium">{formatCurrency(parseFloat(total))}</td>
              </tr>
            )}
          </tfoot>
        )}
      </table>
    </div>
  );
};
