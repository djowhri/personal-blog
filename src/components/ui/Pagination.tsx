import React from 'react';
import Link from 'next/link';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa6';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  baseUrl: string;
}

export default function Pagination({ currentPage, totalItems, itemsPerPage, baseUrl }: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) {
    return null;
  }

  // Calculate range of page numbers to show
  // Always show first, last, current, and some neighbors
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  // Helper to generate URL
  const getPageUrl = (page: number) => {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}page=${page}`;
  };

  return (
    <div className="flex justify-center mt-12">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous Button */}
        <Link
          href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage > 1
              ? 'text-gray-500 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed pointer-events-none'
          }`}
          aria-disabled={currentPage <= 1}
        >
          <span className="sr-only">Previous</span>
          <FaChevronLeft className="h-5 w-5" />
        </Link>

        {/* Page Numbers */}
        {pages.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`dots-${index}`}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                ...
              </span>
            );
          }

          const isCurrent = page === currentPage;
          return (
            <Link
              key={page}
              href={getPageUrl(page as number)}
              aria-current={isCurrent ? 'page' : undefined}
              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                isCurrent
                  ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {page}
            </Link>
          );
        })}

        {/* Next Button */}
        <Link
          href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage < totalPages
              ? 'text-gray-500 hover:bg-gray-50'
              : 'text-gray-300 cursor-not-allowed pointer-events-none'
          }`}
          aria-disabled={currentPage >= totalPages}
        >
          <span className="sr-only">Next</span>
          <FaChevronRight className="h-5 w-5" />
        </Link>
      </nav>
    </div>
  );
}
