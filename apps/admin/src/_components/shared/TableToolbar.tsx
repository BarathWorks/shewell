'use client';

import React from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';

interface TableToolbarProps {
  /** Label for the "New" button, e.g. "New User" */
  newLabel?: string;
  onNew?: () => void;

  /** Show a Delete button (for bulk-delete use cases) */
  showDelete?: boolean;
  onDelete?: () => void;
  deleteDisabled?: boolean;

  /** Export callback */
  onExport?: () => void;
  exportLabel?: string;

  /** Search */
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
}

const TableToolbar = ({
  newLabel = 'New',
  onNew,
  showDelete = false,
  onDelete,
  deleteDisabled = true,
  onExport,
  exportLabel = 'Export Data',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...'
}: TableToolbarProps) => {
  return (
    <div className="table-toolbar-bar">
      {/* Left: Action Buttons */}
      <div className="table-toolbar-left">
        {onNew && (
          <Button
            label={newLabel}
            icon="pi pi-plus-circle"
            severity="success"
            className="table-toolbar-btn table-toolbar-btn-new"
            onClick={onNew}
          />
        )}
        {showDelete && onDelete && (
          <Button
            label="Delete"
            icon="pi pi-trash"
            severity="danger"
            className="table-toolbar-btn table-toolbar-btn-delete"
            onClick={onDelete}
            disabled={deleteDisabled}
          />
        )}
      </div>

      {/* Right: Export + Search */}
      <div className="table-toolbar-right">
        {onExport && (
          <Button
            label={exportLabel}
            icon="pi pi-upload"
            severity="help"
            className="table-toolbar-btn table-toolbar-btn-export"
            onClick={onExport}
          />
        )}
        {onSearchChange && (
          <span className="p-input-icon-left table-toolbar-search">
            <i className="pi pi-search" />
            <InputText
              type="search"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
            />
          </span>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;
