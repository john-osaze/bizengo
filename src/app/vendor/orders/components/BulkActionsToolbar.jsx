import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsToolbar = ({ selectedCount, onBulkStatusUpdate, onBulkExport, onClearSelection }) => {
  const [bulkStatus, setBulkStatus] = useState('');

  const statusOptions = [
    { value: '', label: 'Select status...' },
    { value: 'processing', label: 'Mark as Processing' },
    { value: 'shipped', label: 'Mark as Shipped' },
    { value: 'delivered', label: 'Mark as Delivered' },
    { value: 'cancelled', label: 'Mark as Cancelled' }
  ];

  const handleBulkStatusUpdate = () => {
    if (bulkStatus) {
      onBulkStatusUpdate(bulkStatus);
      setBulkStatus('');
    }
  };

  if (selectedCount === 0) return null;

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="font-medium text-foreground">
              {selectedCount} order{selectedCount !== 1 ? 's' : ''} selected
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
          >
            Clear
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Select
              placeholder="Update status..."
              options={statusOptions}
              value={bulkStatus}
              onChange={setBulkStatus}
              className="min-w-48"
            />
            <Button
              variant="default"
              size="sm"
              onClick={handleBulkStatusUpdate}
              disabled={!bulkStatus}
              iconName="RefreshCw"
            >
              Update
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkExport('csv')}
              iconName="Download"
            >
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkExport('pdf')}
              iconName="FileText"
            >
              Export PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsToolbar;