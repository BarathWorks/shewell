'use client';

import React from 'react';

interface CustomPaginatorProps {
  first: number;
  rows: number;
  totalRecords: number;
  onPageChange: (event: any) => void;
  onRowsChange: (event: any) => void;
  entityName: string;
  rowsPerPageOptions: number[];
}

export function CustomPaginator({
  first,
  rows,
  totalRecords,
  onPageChange,
  onRowsChange,
  entityName,
  rowsPerPageOptions
}: CustomPaginatorProps) {
  const currentPage = Math.floor(first / rows) + 1;
  const totalPages = Math.ceil(totalRecords / rows);
  const lastRecord = Math.min(first + rows, totalRecords);
  const firstRecord = first + 1;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange({ first: (currentPage - 2) * rows, rows });
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange({ first: currentPage * rows, rows });
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      onPageChange({ first: (page - 1) * rows, rows });
    }
  };

  // Generate page numbers to display (current page and neighbors)
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 3;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex align-items-center justify-content-between w-full px-4 py-3" style={{ backgroundColor: '#F9FBFC', borderTop: '1px solid var(--surface-border)' }}>
      {/* Left: Showing info */}
      <div className="text-sm text-600">
        <span className="font-medium">Showing {firstRecord} to {lastRecord} of {totalRecords} </span>
        <span className="font-semibold text-900">{entityName}</span>
      </div>

      {/* Middle: Rows per page */}
      <div className="flex align-items-center gap-2">
        <span className="text-sm font-medium text-600">Rows per page:</span>
        <select
          value={rows}
          onChange={(e) => {
            onRowsChange({ rows: parseInt(e.target.value) });
            onPageChange({ first: 0 });
          }}
          style={{
            height: '36px',
            padding: '0 12px',
            borderRadius: '4px',
            border: '1px solid #e0e0e0',
            backgroundColor: '#f5f7fa',
            color: 'var(--text-color-secondary)',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            minWidth: '70px'
          }}
        >
          {rowsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Right: Navigation and page numbers */}
      <div className="flex align-items-center gap-2">
        {/* Previous arrow */}
        <button
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="p-2 border-round transition-colors"
          style={{
            border: '1px solid var(--surface-border)',
            backgroundColor: currentPage === 1 ? '#f5f5f5' : '#ffffff',
            color: currentPage === 1 ? '#ccc' : '#666',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
          }}
        >
          <span className="material-symbols-outlined text-sm">chevron_left</span>
        </button>

        {/* Page numbers */}
        <div className="flex gap-1">
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => handlePageClick(page)}
              className="w-2rem h-2rem flex align-items-center justify-content-center border-round font-bold text-sm transition-colors"
              style={{
                backgroundColor: page === currentPage ? 'var(--primary-color)' : 'transparent',
                color: page === currentPage ? '#ffffff' : 'var(--text-color-secondary)',
                border: page === currentPage ? 'none' : '1px solid var(--surface-border)',
                cursor: 'pointer'
              }}
            >
              {page}
            </button>
          ))}
        </div>

        {/* Next arrow */}
        <button
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="p-2 border-round transition-colors"
          style={{
            border: '1px solid var(--surface-border)',
            backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#ffffff',
            color: currentPage === totalPages ? '#ccc' : '#666',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
          }}
        >
          <span className="material-symbols-outlined text-sm">chevron_right</span>
        </button>
      </div>
    </div>
  );
}
