# MCAE List Cleansing Tool

A client-side web application that cleanses and validates contact list uploads for Salesforce Marketing Cloud Account Engagement (MCAE). All data processing happens entirely in the browser - no data is ever sent to a server.

## Features

### Required Fields Validation
- Email (with RFC 5322 format validation)
- First Name
- Last Name
- Company Name
- Industry

### Email Validation
- Valid RFC 5322 format
- Common typo detection (gmail.con → gmail.com, etc.)
- Role-based email flagging (info@, admin@, noreply@, etc.)
- Disposable email domain detection
- Personal/free email provider flagging for B2B context
- Domain extraction and validation

### Data Quality Checks
- Field length validation (255 character Salesforce limit)
- Name validation (fake names, numbers, all caps, very short names)
- Company name validation (generic entries, suffix normalization)
- Duplicate detection within upload (by email)
- Company domain mismatch detection
- Empty row detection

### User Interface
- Drag-and-drop file upload
- Support for CSV, XLS, XLSX formats
- Column mapping interface
- Validation results dashboard with statistics
- Color-coded data grid (green=valid, yellow=warnings, red=errors)
- Filter and sort functionality
- Export options for clean records, error reports, and all records

## Installation

1. Install Node.js (v18 or higher recommended)

2. Install dependencies:
```bash
npm install
```

## Running the Application

Development mode:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

Production build:
```bash
npm run build
npm start
```

## Usage

1. **Upload File**: Drag and drop or select a CSV, XLS, or XLSX file
2. **Map Columns**: Map your file columns to required fields (auto-detection attempts to identify them)
3. **Review Results**: View validation summary, filter/sort records, and review all errors and warnings
4. **Export**: Download clean records ready for MCAE import, error reports, or all records with validation status

## Validation Rules

### Email
- Required and must be valid RFC 5322 format
- Common typos are detected and suggestions provided
- Warnings for role-based emails, disposable domains, and personal email providers

### Names (First & Last)
- Required, cannot be empty
- Warnings for fake names (test test, asdf asdf, etc.)
- Warnings for numbers in names
- Warnings for all caps or very short names (1-2 characters)
- Suggestions for title case normalization

### Company
- Required, cannot be empty
- Warnings for generic entries (N/A, test, none, etc.)
- Suggestions for suffix normalization (Inc. vs Incorporated)

### Industry
- Required, cannot be empty

### Field Length
- All fields: 255 character maximum (Salesforce limit)

## Export Options

- **Clean Records**: Only valid records, ready for MCAE import
- **Error Report**: Records with issues plus detailed error descriptions
- **All Records**: Complete dataset with validation status column

All exports include UTF-8 BOM for Excel compatibility.

## Technical Stack

- **Next.js 15** with TypeScript
- **Tailwind CSS** for styling
- **PapaParse** for CSV parsing
- **SheetJS (xlsx)** for Excel file support
- **100% client-side processing** - no backend required

## File Structure

```
/app
  /components
    FileUpload.tsx       - Drag-and-drop file upload
    ColumnMapper.tsx     - Column mapping interface
    ValidationResults.tsx - Results display with filters
    ExportButtons.tsx    - Export functionality
  /lib
    types.ts            - TypeScript interfaces
    validators.ts       - All validation logic
    fileParser.ts       - CSV/Excel parsing
    dataProcessor.ts    - Main processing engine
  page.tsx              - Main application page
  layout.tsx            - Root layout
  globals.css           - Global styles
```

## Privacy & Security

This tool processes all data entirely in your browser using JavaScript. No data is ever transmitted to any server. Your contact lists remain completely private and secure on your local machine.

## Browser Compatibility

Works with modern browsers that support:
- File API
- Blob API
- ES2017+ JavaScript features

Recommended browsers: Chrome, Firefox, Safari, Edge (latest versions)

## License

This project is provided as-is for use with Salesforce Marketing Cloud Account Engagement.
