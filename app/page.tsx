'use client';

import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ColumnMapper from './components/ColumnMapper';
import ValidationResults from './components/ValidationResults';
import ExportButtons from './components/ExportButtons';
import { ParsedFile, ColumnMapping, ValidatedRecord, ValidationSummary } from './lib/types';
import { processRecords, generateValidationSummary } from './lib/dataProcessor';

type Step = 'upload' | 'mapping' | 'results';

export default function Home() {
  const [step, setStep] = useState<Step>('upload');
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [validatedRecords, setValidatedRecords] = useState<ValidatedRecord[]>([]);
  const [summary, setSummary] = useState<ValidationSummary | null>(null);

  const handleFileLoaded = (file: ParsedFile) => {
    setParsedFile(file);
    setStep('mapping');
  };

  const handleMappingComplete = (mapping: ColumnMapping) => {
    if (!parsedFile) return;

    // Process records with validation
    const validated = processRecords(parsedFile.rows, mapping);
    const validationSummary = generateValidationSummary(validated);

    setValidatedRecords(validated);
    setSummary(validationSummary);
    setStep('results');
  };

  const handleReset = () => {
    setParsedFile(null);
    setValidatedRecords([]);
    setSummary(null);
    setStep('upload');
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            MCAE List Cleansing Tool
          </h1>
          <p className="text-gray-600">
            Validate and cleanse contact lists for Salesforce Marketing Cloud Account Engagement
          </p>

          {/* Privacy Banner */}
          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <div className="flex items-start">
              <svg
                className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <p className="text-sm text-blue-800">
                <span className="font-semibold">100% Client-Side Processing:</span> All data
                processing happens in your browser. Your data never leaves your computer.
              </p>
            </div>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className={`flex items-center ${step === 'upload' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="ml-2 font-medium">Upload File</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'mapping' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'mapping' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="ml-2 font-medium">Map Columns</span>
            </div>
            <div className="w-16 h-0.5 bg-gray-300"></div>
            <div className={`flex items-center ${step === 'results' ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'results' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="ml-2 font-medium">Review & Export</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {step === 'upload' && <FileUpload onFileLoaded={handleFileLoaded} />}

          {step === 'mapping' && parsedFile && (
            <div>
              <div className="mb-4 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">File:</span> {parsedFile.fileName}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Rows:</span> {parsedFile.rowCount}
                </p>
              </div>
              <ColumnMapper headers={parsedFile.headers} onMappingComplete={handleMappingComplete} />
            </div>
          )}

          {step === 'results' && summary && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  ← Start Over
                </button>
              </div>

              <ValidationResults validatedRecords={validatedRecords} summary={summary} />

              <ExportButtons validatedRecords={validatedRecords} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Built for Salesforce Marketing Cloud Account Engagement</p>
          <p className="mt-1">Maximum field length: 255 characters | Maximum import size: 100k rows</p>
        </div>
      </div>
    </main>
  );
}
