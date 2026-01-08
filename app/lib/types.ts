// Core data types for the list cleansing tool

export type ValidationSeverity = 'critical' | 'warning';

export interface ValidationError {
  field: string;
  message: string;
  severity: ValidationSeverity;
}

export interface ValidationSuggestion {
  field: string;
  originalValue: string;
  suggestedValue: string;
  description: string;
}

export interface ContactRecord {
  id: string; // unique identifier for this record
  rowNumber: number; // original row number in file
  email: string;
  firstName: string;
  lastName: string;
  company: string;
  industry: string;
  // Store any additional unmapped columns
  additionalFields?: Record<string, string>;
}

export interface ValidatedRecord {
  record: ContactRecord;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
}

export interface ColumnMapping {
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  industry?: string;
}

export interface ValidationSummary {
  totalRecords: number;
  validRecords: number;
  recordsWithErrors: number;
  recordsWithWarnings: number;
  errorBreakdown: Record<string, number>;
}

export interface ParsedFile {
  headers: string[];
  rows: Record<string, string>[];
  fileName: string;
  rowCount: number;
}

// Required fields for MCAE
export const REQUIRED_FIELDS = ['email', 'firstName', 'lastName', 'company', 'industry'] as const;
export type RequiredField = typeof REQUIRED_FIELDS[number];

// Field length limit per Salesforce
export const MAX_FIELD_LENGTH = 255;
