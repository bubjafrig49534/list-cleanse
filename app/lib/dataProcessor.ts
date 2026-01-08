import {
  ContactRecord,
  ValidatedRecord,
  ValidationError,
  ValidationSuggestion,
  ValidationSummary,
  ColumnMapping,
} from './types';
import {
  validateEmail,
  validateName,
  validateCompany,
  validateIndustry,
  checkDomainMismatch,
} from './validators';

export function processRecords(
  rawRows: Record<string, string>[],
  columnMapping: ColumnMapping
): ValidatedRecord[] {
  // First pass: Create contact records and track duplicates
  const emailMap = new Map<string, number[]>(); // email -> array of row indices
  const contactRecords: ContactRecord[] = [];

  rawRows.forEach((row, index) => {
    const email = (row[columnMapping.email || ''] || '').trim().toLowerCase();
    const firstName = row[columnMapping.firstName || ''] || '';
    const lastName = row[columnMapping.lastName || ''] || '';
    const company = row[columnMapping.company || ''] || '';
    const industry = row[columnMapping.industry || ''] || '';

    // Store additional unmapped fields
    const additionalFields: Record<string, string> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (
        key !== columnMapping.email &&
        key !== columnMapping.firstName &&
        key !== columnMapping.lastName &&
        key !== columnMapping.company &&
        key !== columnMapping.industry
      ) {
        additionalFields[key] = value;
      }
    });

    const record: ContactRecord = {
      id: `row-${index}`,
      rowNumber: index + 2, // +2 because index is 0-based and we skip header row
      email,
      firstName,
      lastName,
      company,
      industry,
      additionalFields: Object.keys(additionalFields).length > 0 ? additionalFields : undefined,
    };

    contactRecords.push(record);

    // Track email for duplicate detection
    if (email) {
      if (!emailMap.has(email)) {
        emailMap.set(email, []);
      }
      emailMap.get(email)!.push(index);
    }
  });

  // Second pass: Validate each record
  const validatedRecords: ValidatedRecord[] = contactRecords.map((record, index) => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const suggestions: ValidationSuggestion[] = [];

    // Check if row is completely empty
    const isEmpty =
      !record.email &&
      !record.firstName &&
      !record.lastName &&
      !record.company &&
      !record.industry;

    if (isEmpty) {
      errors.push({
        field: 'all',
        message: 'Empty row - all required fields are blank',
        severity: 'critical',
      });
      return {
        record,
        isValid: false,
        errors,
        warnings,
        suggestions,
      };
    }

    // Validate email
    const emailValidation = validateEmail(record.email);
    errors.push(...emailValidation.errors);
    warnings.push(...emailValidation.warnings);
    suggestions.push(...emailValidation.suggestions);

    // Check for duplicate emails
    const emailLower = record.email.toLowerCase();
    const duplicateIndices = emailMap.get(emailLower) || [];
    if (duplicateIndices.length > 1) {
      const otherRows = duplicateIndices
        .filter(i => i !== index)
        .map(i => contactRecords[i].rowNumber)
        .join(', ');
      warnings.push({
        field: 'email',
        message: `Duplicate email found in row(s): ${otherRows}`,
        severity: 'warning',
      });
    }

    // Validate first name
    const firstNameValidation = validateName(record.firstName, 'firstName');
    errors.push(...firstNameValidation.errors);
    warnings.push(...firstNameValidation.warnings);
    suggestions.push(...firstNameValidation.suggestions);

    // Validate last name
    const lastNameValidation = validateName(record.lastName, 'lastName');
    errors.push(...lastNameValidation.errors);
    warnings.push(...lastNameValidation.warnings);
    suggestions.push(...lastNameValidation.suggestions);

    // Validate company
    const companyValidation = validateCompany(record.company);
    errors.push(...companyValidation.errors);
    warnings.push(...companyValidation.warnings);
    suggestions.push(...companyValidation.suggestions);

    // Validate industry
    const industryValidation = validateIndustry(record.industry);
    errors.push(...industryValidation.errors);
    warnings.push(...industryValidation.warnings);
    suggestions.push(...industryValidation.suggestions);

    // Check for company domain mismatch
    if (record.email && record.company) {
      const domainMismatch = checkDomainMismatch(record.email, record.company);
      if (domainMismatch) {
        warnings.push(domainMismatch);
      }
    }

    return {
      record,
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  });

  return validatedRecords;
}

export function generateValidationSummary(validatedRecords: ValidatedRecord[]): ValidationSummary {
  const totalRecords = validatedRecords.length;
  const validRecords = validatedRecords.filter(r => r.isValid).length;
  const recordsWithErrors = validatedRecords.filter(r => r.errors.length > 0).length;
  const recordsWithWarnings = validatedRecords.filter(
    r => r.warnings.length > 0 && r.errors.length === 0
  ).length;

  // Count errors by type
  const errorBreakdown: Record<string, number> = {};

  validatedRecords.forEach(record => {
    record.errors.forEach(error => {
      const key = `${error.field}: ${error.message}`;
      errorBreakdown[key] = (errorBreakdown[key] || 0) + 1;
    });
  });

  return {
    totalRecords,
    validRecords,
    recordsWithErrors,
    recordsWithWarnings,
    errorBreakdown,
  };
}

export function applyAutoFixes(record: ContactRecord): ContactRecord {
  return {
    ...record,
    email: record.email.trim().toLowerCase(),
    firstName: record.firstName.trim(),
    lastName: record.lastName.trim(),
    company: record.company.trim(),
    industry: record.industry.trim(),
  };
}

export function exportCleanRecords(validatedRecords: ValidatedRecord[]): Record<string, string>[] {
  return validatedRecords
    .filter(r => r.isValid)
    .map(r => ({
      Email: r.record.email,
      'First Name': r.record.firstName,
      'Last Name': r.record.lastName,
      Company: r.record.company,
      Industry: r.record.industry,
      ...r.record.additionalFields,
    }));
}

export function exportErrorReport(validatedRecords: ValidatedRecord[]): Record<string, string>[] {
  return validatedRecords
    .filter(r => r.errors.length > 0 || r.warnings.length > 0)
    .map(r => {
      const allIssues = [
        ...r.errors.map(e => `[ERROR] ${e.field}: ${e.message}`),
        ...r.warnings.map(w => `[WARNING] ${w.field}: ${w.message}`),
      ].join(' | ');

      return {
        'Row Number': r.record.rowNumber.toString(),
        Email: r.record.email,
        'First Name': r.record.firstName,
        'Last Name': r.record.lastName,
        Company: r.record.company,
        Industry: r.record.industry,
        'Validation Issues': allIssues,
        ...r.record.additionalFields,
      };
    });
}

export function exportAllRecords(validatedRecords: ValidatedRecord[]): Record<string, string>[] {
  return validatedRecords.map(r => {
    const status = r.isValid ? 'Valid' : r.errors.length > 0 ? 'Has Errors' : 'Has Warnings';

    return {
      'Row Number': r.record.rowNumber.toString(),
      'Validation Status': status,
      Email: r.record.email,
      'First Name': r.record.firstName,
      'Last Name': r.record.lastName,
      Company: r.record.company,
      Industry: r.record.industry,
      ...r.record.additionalFields,
    };
  });
}
