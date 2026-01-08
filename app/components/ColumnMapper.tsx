'use client';

import { useState, useEffect } from 'react';
import { ColumnMapping, REQUIRED_FIELDS } from '../lib/types';

interface ColumnMapperProps {
  headers: string[];
  onMappingComplete: (mapping: ColumnMapping) => void;
}

const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  firstName: 'First Name',
  lastName: 'Last Name',
  company: 'Company Name',
  industry: 'Industry',
};

export default function ColumnMapper({ headers, onMappingComplete }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-detect columns on mount
  useEffect(() => {
    const autoMapping: ColumnMapping = {};

    headers.forEach(header => {
      const lowerHeader = header.toLowerCase().trim();

      if (lowerHeader.includes('email') || lowerHeader === 'e-mail') {
        autoMapping.email = header;
      } else if (
        lowerHeader.includes('first') &&
        (lowerHeader.includes('name') || lowerHeader === 'firstname')
      ) {
        autoMapping.firstName = header;
      } else if (
        lowerHeader.includes('last') &&
        (lowerHeader.includes('name') || lowerHeader === 'lastname')
      ) {
        autoMapping.lastName = header;
      } else if (lowerHeader.includes('company') || lowerHeader.includes('organization')) {
        autoMapping.company = header;
      } else if (lowerHeader.includes('industry')) {
        autoMapping.industry = header;
      }
    });

    setMapping(autoMapping);
  }, [headers]);

  const handleMappingChange = (field: string, value: string) => {
    setMapping(prev => ({
      ...prev,
      [field]: value || undefined,
    }));
  };

  const validateAndProceed = () => {
    const newErrors: string[] = [];

    REQUIRED_FIELDS.forEach(field => {
      if (!mapping[field]) {
        newErrors.push(`${FIELD_LABELS[field]} is required`);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    onMappingComplete(mapping);
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-4 text-gray-900">Map Your Columns</h2>
      <p className="text-sm text-gray-600 mb-6">
        Match your file columns to the required fields. We've tried to auto-detect them for you.
      </p>

      <div className="space-y-4">
        {REQUIRED_FIELDS.map(field => (
          <div key={field} className="flex items-center gap-4">
            <label className="w-40 text-sm font-medium text-gray-700">
              {FIELD_LABELS[field]}
              <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              value={mapping[field] || ''}
              onChange={e => handleMappingChange(field, e.target.value)}
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select Column --</option>
              {headers.map(header => (
                <option key={header} value={header}>
                  {header}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {errors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-800 mb-2">Please fix these issues:</p>
          <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={validateAndProceed}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Continue to Validation
        </button>
      </div>
    </div>
  );
}
