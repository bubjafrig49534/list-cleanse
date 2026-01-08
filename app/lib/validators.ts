import { ValidationError, ValidationSuggestion, MAX_FIELD_LENGTH } from './types';

// Email validation and correction
const COMMON_EMAIL_TYPOS: Record<string, string> = {
  'gmail.con': 'gmail.com',
  'gmail.co': 'gmail.com',
  'gmial.com': 'gmail.com',
  'gmai.com': 'gmail.com',
  'yahoo.con': 'yahoo.com',
  'yahooo.com': 'yahoo.com',
  'hotmail.con': 'hotmail.com',
  'outlook.con': 'outlook.com',
  'aol.con': 'aol.com',
};

const DISPOSABLE_DOMAINS = [
  'tempmail.com',
  'guerrillamail.com',
  '10minutemail.com',
  'mailinator.com',
  'throwaway.email',
  'temp-mail.org',
  'maildrop.cc',
  'getnada.com',
  'trashmail.com',
  'fakeinbox.com',
  'yopmail.com',
];

const PERSONAL_EMAIL_PROVIDERS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'aol.com',
  'icloud.com',
  'mail.com',
  'protonmail.com',
  'zoho.com',
  'gmx.com',
];

const ROLE_BASED_PREFIXES = [
  'info',
  'admin',
  'administrator',
  'noreply',
  'no-reply',
  'support',
  'sales',
  'contact',
  'help',
  'postmaster',
  'webmaster',
  'marketing',
];

// RFC 5322 simplified email regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function validateEmail(email: string): {
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (!email || email.trim() === '') {
    errors.push({
      field: 'email',
      message: 'Email is required',
      severity: 'critical',
    });
    return { errors, warnings, suggestions };
  }

  const trimmedEmail = email.trim().toLowerCase();

  // Check for common typos
  const domain = trimmedEmail.split('@')[1];
  if (domain && COMMON_EMAIL_TYPOS[domain]) {
    const correctedEmail = trimmedEmail.replace(domain, COMMON_EMAIL_TYPOS[domain]);
    suggestions.push({
      field: 'email',
      originalValue: email,
      suggestedValue: correctedEmail,
      description: `Possible typo detected: ${domain} → ${COMMON_EMAIL_TYPOS[domain]}`,
    });
  }

  // Validate email format
  if (!EMAIL_REGEX.test(trimmedEmail)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      severity: 'critical',
    });
    return { errors, warnings, suggestions };
  }

  // Check role-based emails
  const localPart = trimmedEmail.split('@')[0];
  if (ROLE_BASED_PREFIXES.some(prefix => localPart === prefix || localPart.startsWith(prefix + '.'))) {
    warnings.push({
      field: 'email',
      message: 'Role-based email address detected (e.g., info@, admin@)',
      severity: 'warning',
    });
  }

  // Check disposable email domains
  if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
    warnings.push({
      field: 'email',
      message: 'Disposable email domain detected',
      severity: 'warning',
    });
  }

  // Check personal email providers (for B2B context)
  if (domain && PERSONAL_EMAIL_PROVIDERS.includes(domain)) {
    warnings.push({
      field: 'email',
      message: 'Personal email provider detected (may not be appropriate for B2B)',
      severity: 'warning',
    });
  }

  // Check field length
  if (email.length > MAX_FIELD_LENGTH) {
    errors.push({
      field: 'email',
      message: `Email exceeds maximum length of ${MAX_FIELD_LENGTH} characters`,
      severity: 'critical',
    });
  }

  return { errors, warnings, suggestions };
}

export function extractDomain(email: string): string | null {
  const trimmedEmail = email.trim().toLowerCase();
  const parts = trimmedEmail.split('@');
  return parts.length === 2 ? parts[1] : null;
}

// Name validation
const FAKE_NAME_PATTERNS = [
  /^test\s+test$/i,
  /^asdf\s+asdf$/i,
  /^xxx\s+yyy$/i,
  /^abc\s+xyz$/i,
  /^john\s+doe$/i,
  /^jane\s+doe$/i,
  /^test$/i,
  /^asdf$/i,
];

export function validateName(name: string, fieldName: 'firstName' | 'lastName'): {
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (!name || name.trim() === '') {
    errors.push({
      field: fieldName,
      message: `${fieldName === 'firstName' ? 'First name' : 'Last name'} is required`,
      severity: 'critical',
    });
    return { errors, warnings, suggestions };
  }

  const trimmedName = name.trim();

  // Check field length
  if (name.length > MAX_FIELD_LENGTH) {
    errors.push({
      field: fieldName,
      message: `${fieldName === 'firstName' ? 'First name' : 'Last name'} exceeds maximum length of ${MAX_FIELD_LENGTH} characters`,
      severity: 'critical',
    });
  }

  // Check for fake names
  if (FAKE_NAME_PATTERNS.some(pattern => pattern.test(trimmedName))) {
    warnings.push({
      field: fieldName,
      message: 'Possible fake or test name detected',
      severity: 'warning',
    });
  }

  // Check for numbers in name
  if (/\d/.test(trimmedName)) {
    warnings.push({
      field: fieldName,
      message: 'Name contains numbers',
      severity: 'warning',
    });
  }

  // Check for all caps
  if (trimmedName.length > 2 && trimmedName === trimmedName.toUpperCase()) {
    warnings.push({
      field: fieldName,
      message: 'Name is in ALL CAPS',
      severity: 'warning',
    });
    suggestions.push({
      field: fieldName,
      originalValue: name,
      suggestedValue: toTitleCase(trimmedName),
      description: 'Convert to title case',
    });
  }

  // Check for very short names (1-2 characters)
  if (trimmedName.length <= 2) {
    warnings.push({
      field: fieldName,
      message: 'Name is unusually short (1-2 characters)',
      severity: 'warning',
    });
  }

  // Suggest trimming whitespace if needed
  if (name !== trimmedName) {
    suggestions.push({
      field: fieldName,
      originalValue: name,
      suggestedValue: trimmedName,
      description: 'Trim whitespace',
    });
  }

  // Suggest title case if not all caps but also not properly cased
  if (trimmedName !== name.toUpperCase() && trimmedName !== toTitleCase(trimmedName) && trimmedName.length > 2) {
    const titleCased = toTitleCase(trimmedName);
    if (titleCased !== trimmedName) {
      suggestions.push({
        field: fieldName,
        originalValue: name,
        suggestedValue: titleCased,
        description: 'Normalize to title case',
      });
    }
  }

  return { errors, warnings, suggestions };
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Company name validation
const GENERIC_COMPANY_NAMES = [
  'n/a',
  'na',
  'test',
  'none',
  'unknown',
  'n.a.',
  'test company',
  'company',
  'inc',
];

const COMPANY_SUFFIXES: Record<string, string[]> = {
  'Inc.': ['Inc', 'Incorporated', 'inc.', 'inc'],
  'LLC': ['L.L.C.', 'L.L.C', 'llc', 'l.l.c.'],
  'Corp.': ['Corp', 'Corporation', 'corp.', 'corp'],
  'Ltd.': ['Ltd', 'Limited', 'ltd.', 'ltd'],
};

export function validateCompany(company: string): {
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (!company || company.trim() === '') {
    errors.push({
      field: 'company',
      message: 'Company name is required',
      severity: 'critical',
    });
    return { errors, warnings, suggestions };
  }

  const trimmedCompany = company.trim();

  // Check field length
  if (company.length > MAX_FIELD_LENGTH) {
    errors.push({
      field: 'company',
      message: `Company name exceeds maximum length of ${MAX_FIELD_LENGTH} characters`,
      severity: 'critical',
    });
  }

  // Check for generic company names
  if (GENERIC_COMPANY_NAMES.includes(trimmedCompany.toLowerCase())) {
    warnings.push({
      field: 'company',
      message: 'Generic or placeholder company name detected',
      severity: 'warning',
    });
  }

  // Suggest trimming whitespace if needed
  if (company !== trimmedCompany) {
    suggestions.push({
      field: 'company',
      originalValue: company,
      suggestedValue: trimmedCompany,
      description: 'Trim whitespace',
    });
  }

  // Suggest normalizing company suffixes
  for (const [normalized, variants] of Object.entries(COMPANY_SUFFIXES)) {
    for (const variant of variants) {
      const regex = new RegExp(`\\b${variant}\\b`, 'gi');
      if (regex.test(trimmedCompany) && !trimmedCompany.includes(normalized)) {
        const normalizedName = trimmedCompany.replace(regex, normalized);
        suggestions.push({
          field: 'company',
          originalValue: company,
          suggestedValue: normalizedName,
          description: `Normalize company suffix to ${normalized}`,
        });
        break;
      }
    }
  }

  return { errors, warnings, suggestions };
}

// Industry validation
export function validateIndustry(industry: string): {
  errors: ValidationError[];
  warnings: ValidationError[];
  suggestions: ValidationSuggestion[];
} {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const suggestions: ValidationSuggestion[] = [];

  if (!industry || industry.trim() === '') {
    errors.push({
      field: 'industry',
      message: 'Industry is required',
      severity: 'critical',
    });
    return { errors, warnings, suggestions };
  }

  const trimmedIndustry = industry.trim();

  // Check field length
  if (industry.length > MAX_FIELD_LENGTH) {
    errors.push({
      field: 'industry',
      message: `Industry exceeds maximum length of ${MAX_FIELD_LENGTH} characters`,
      severity: 'critical',
    });
  }

  // Suggest trimming whitespace if needed
  if (industry !== trimmedIndustry) {
    suggestions.push({
      field: 'industry',
      originalValue: industry,
      suggestedValue: trimmedIndustry,
      description: 'Trim whitespace',
    });
  }

  return { errors, warnings, suggestions };
}

// Check for company domain mismatch
export function checkDomainMismatch(email: string, company: string): ValidationError | null {
  const emailDomain = extractDomain(email);
  if (!emailDomain) return null;

  // Skip check for personal email providers
  if (PERSONAL_EMAIL_PROVIDERS.includes(emailDomain)) {
    // This is already flagged as a warning in email validation
    return null;
  }

  // Extract potential domain from company name
  const companyLower = company.toLowerCase().trim();
  const companyWords = companyLower.split(/\s+/);

  // Check if email domain contains any significant part of company name
  const significantWords = companyWords.filter(word =>
    word.length > 3 && !['corp', 'inc', 'ltd', 'llc', 'company'].includes(word)
  );

  if (significantWords.length > 0) {
    const hasMatch = significantWords.some(word =>
      emailDomain.includes(word) || word.includes(emailDomain.split('.')[0])
    );

    if (!hasMatch) {
      return {
        field: 'email',
        message: `Email domain (${emailDomain}) may not match company name (${company})`,
        severity: 'warning',
      };
    }
  }

  return null;
}
