'use client';

import { ValidatedRecord } from '../lib/types';
import { exportToCSV } from '../lib/fileParser';
import {
  exportCleanRecords,
  exportErrorReport,
  exportAllRecords,
} from '../lib/dataProcessor';

interface ExportButtonsProps {
  validatedRecords: ValidatedRecord[];
}

export default function ExportButtons({ validatedRecords }: ExportButtonsProps) {
  const validCount = validatedRecords.filter(r => r.isValid).length;
  const errorCount = validatedRecords.filter(r => r.errors.length > 0 || r.warnings.length > 0)
    .length;

  const handleExportClean = () => {
    const cleanRecords = exportCleanRecords(validatedRecords);
    if (cleanRecords.length === 0) {
      alert('No valid records to export');
      return;
    }
    exportToCSV(cleanRecords, 'clean-records.csv');
  };

  const handleExportErrors = () => {
    const errorRecords = exportErrorReport(validatedRecords);
    if (errorRecords.length === 0) {
      alert('No records with errors to export');
      return;
    }
    exportToCSV(errorRecords, 'error-report.csv');
  };

  const handleExportAll = () => {
    const allRecords = exportAllRecords(validatedRecords);
    exportToCSV(allRecords, 'all-records-with-validation.csv');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Export Options</h2>

      <div className="space-y-3">
        <button
          onClick={handleExportClean}
          disabled={validCount === 0}
          className="w-full flex items-center justify-between px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span className="font-medium">Download Clean Records</span>
          <span className="text-sm bg-green-700 px-3 py-1 rounded-full">
            {validCount} {validCount === 1 ? 'record' : 'records'}
          </span>
        </button>

        <button
          onClick={handleExportErrors}
          disabled={errorCount === 0}
          className="w-full flex items-center justify-between px-4 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <span className="font-medium">Download Error Report</span>
          <span className="text-sm bg-red-700 px-3 py-1 rounded-full">
            {errorCount} {errorCount === 1 ? 'record' : 'records'}
          </span>
        </button>

        <button
          onClick={handleExportAll}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <span className="font-medium">Download All Records</span>
          <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">
            {validatedRecords.length} {validatedRecords.length === 1 ? 'record' : 'records'}
          </span>
        </button>
      </div>

      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          <span className="font-semibold">Clean Records:</span> Only valid records ready for MCAE
          import
        </p>
        <p className="text-xs text-gray-600 mt-1">
          <span className="font-semibold">Error Report:</span> Records with issues and detailed
          error descriptions
        </p>
        <p className="text-xs text-gray-600 mt-1">
          <span className="font-semibold">All Records:</span> Complete dataset with validation
          status column
        </p>
      </div>
    </div>
  );
}
