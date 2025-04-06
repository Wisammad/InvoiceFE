
import React, { useState } from 'react';
import { Check, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getConfidenceClass, getConfidenceText } from '@/lib/formatters';

interface FieldDisplayProps {
  label: string;
  value: string;
  confidence: number;
  editable?: boolean;
  onEdit?: (value: string) => void;
}

export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  label,
  value,
  confidence,
  editable = false,
  onEdit
}) => {
  const [editValue, setEditValue] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  
  const confidenceClass = getConfidenceClass(confidence);
  
  const handleSave = () => {
    if (onEdit) {
      onEdit(editValue);
    }
    setIsEditing(false);
  };
  
  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground flex items-center justify-between">
        <span>{label}</span>
        {!isEditing && (
          <span 
            className={`text-xs px-2 py-0.5 rounded ${confidenceClass}`}
          >
            {getConfidenceText(confidence)}
          </span>
        )}
      </div>
      
      {isEditing ? (
        <div className="flex gap-2">
          <Input 
            value={editValue} 
            onChange={(e) => setEditValue(e.target.value)}
            className="h-9"
          />
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSave}>
            <Check className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div 
          className={`
            flex justify-between items-center p-2 rounded-md border
            ${confidence < 0.8 ? 'bg-muted/25' : ''}
            ${editable ? 'cursor-pointer hover:bg-muted/50' : ''}
          `}
          onClick={() => {
            if (editable) {
              setIsEditing(true);
            }
          }}
        >
          <div className="font-medium truncate">
            {value || <span className="text-muted-foreground italic">No value</span>}
          </div>
          
          {confidence < 0.8 && (
            <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
          )}
        </div>
      )}
    </div>
  );
};
