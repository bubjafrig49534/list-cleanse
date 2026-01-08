'use client';

import { useState, useMemo } from 'react';
import { ValidatedRecord, ValidationSummary } from '../lib/types';

interface ValidationResultsProps {
  validatedRecords: ValidatedRecord[];
  summary: ValidationSummary;
}

type FilterType = 'all' | 'valid' | 'errors' | 'warnings';

export default function ValidationResults({
  validatedRecords,
  summary,
}: ValidationResultsProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<string>('rowNumber');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Filter records
  const filteredRecords = useMemo(() => {
    let filtered = validatedRecords;

    switch (filter) {
      case 'valid':
        filtered = validatedRecords.filter(r => r.isValid);
        break;
      case 'errors':
        filtered = validatedRecords.filter(r => r.errors.length > 0);
        break;
      case 'warnings':
        filtered = validatedRecords.filter(r => r.warnings.length > 0 && r.errors.length === 0);
        break;
    }

    // Sort records
    return [...filtered].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'rowNumber') {
        aValue = a.record.rowNumber;
        bValue = b.record.rowNumber;
      } else if (sortField === 'status') {
        aValue = a.isValid ? 0 : a.errors.length > 0 ? 2 : 1;
        bValue = b.isValid ? 0 : b.errors.length > 0 ? 2 : 1;
      } else {
        aValue = a.record[sortField as keyof typeof a.record] || '';
        bValue = b.record[sortField as keyof typeof b.record] || '';
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [validatedRecords, filter, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRowColor = (record: ValidatedRecord) => {
    if (record.isValid && record.warnings.length === 0) return 'bg-green-50';
    if (record.errors.length > 0) return 'bg-red-50';
    return 'bg-yellow-50';
  };

  return (
    <div className="w-full space-y-6">
      {/* Summary Dashboard */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-900">Validation Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Total Records</p>
            <p className="text-2xl font-bold text-gray-900">{summary.totalRecords}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600">Valid Records</p>
            <p className="text-2xl font-bold text-green-700">{summary.validRecords}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-sm text-red-600">With Errors</p>
            <p className="text-2xl font-bold text-red-700">{summary.recordsWithErrors}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600">With Warnings</p>
            <p className="text-2xl font-bold text-yellow-700">{summary.recordsWithWarnings}</p>
          </div>
        </div>

        {/* Error Breakdown */}
        {Object.keys(summary.errorBreakdown).length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Error Breakdown</h3>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.entries(summary.errorBreakdown).map(([error, count]) => (
                <div key={error} className="flex justify-between text-sm">
                  <span className="text-gray-600">{error}</span>
                  <span className="font-medium text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          All ({validatedRecords.length})
        </button>
        <button
          onClick={() => setFilter('valid')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'valid'
              ? 'bg-green-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Valid ({summary.validRecords})
        </button>
        <button
          onClick={() => setFilter('errors')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'errors'
              ? 'bg-red-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Errors ({summary.recordsWithErrors})
        </button>
        <button
          onClick={() => setFilter('warnings')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            filter === 'warnings'
              ? 'bg-yellow-600 text-white'
              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
          }`}
        >
          Warnings ({summary.recordsWithWarnings})
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('rowNumber')}
                >
                  Row {sortField === 'rowNumber' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('firstName')}
                >
                  First Name {sortField === 'firstName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastName')}
                >
                  Last Name {sortField === 'lastName' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('company')}
                >
                  Company {sortField === 'company' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('industry')}
                >
                  Industry {sortField === 'industry' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map(record => (
                <tr key={record.record.id} className={getRowColor(record)}>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {record.record.rowNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {record.isValid && record.warnings.length === 0 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        Valid
                      </span>
                    )}
                    {record.errors.length > 0 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                        Error
                      </span>
                    )}
                    {record.errors.length === 0 && record.warnings.length > 0 && (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        Warning
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {record.record.email || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.record.firstName || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.record.lastName || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                    {record.record.company || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record.record.industry || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {record.errors.length > 0 && (
                      <div className="space-y-1">
                        {record.errors.map((error, idx) => (
                          <div key={idx} className="text-red-700 text-xs">
                            <span className="font-semibold">{error.field}:</span> {error.message}
                          </div>
                        ))}
                      </div>
                    )}
                    {record.warnings.length > 0 && (
                      <div className="space-y-1">
                        {record.warnings.map((warning, idx) => (
                          <div key={idx} className="text-yellow-700 text-xs">
                            <span className="font-semibold">{warning.field}:</span> {warning.message}
                          </div>
                        ))}
                      </div>
                    )}
                    {record.errors.length === 0 && record.warnings.length === 0 && (
                      <span className="text-gray-400 text-xs">No issues</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No records match the current filter.
          </div>
        )}
      </div>
    </div>
  );
}
