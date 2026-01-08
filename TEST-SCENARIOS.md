# Phase 1 Testing Guide

## Quick Start

1. **Install dependencies** (if Node.js is installed):
   ```bash
   cd /Users/marchummel/Desktop/list-cleanse
   npm install
   npm run dev
   ```
   Then open http://localhost:3000

2. **Without Node.js**: You'll need to install Node.js first from https://nodejs.org/

## Testing with Sample Data

I've created `sample-data.csv` in the project folder with 20 test records covering all validation scenarios.

### Expected Test Results

When you upload `sample-data.csv`, you should see:

#### Summary Statistics
- **Total Records**: 20
- **Valid Records**: 2-3 (depending on warnings)
- **Records with Errors**: ~15-16
- **Records with Warnings**: ~10-12

#### Specific Test Cases in the File

| Row | Email | Expected Validation |
|-----|-------|-------------------|
| 1 | john.doe@acme.com | ✅ Valid (first occurrence) |
| 2 | jane@gmail.con | ⚠️ Typo detected: gmail.con → gmail.com |
| 3 | info@testcompany.com | ⚠️ Role-based email, ⚠️ Generic company name |
| 4 | test@10minutemail.com | ⚠️ Disposable email domain |
| 5 | sarah.jones@yahoo.com | ⚠️ Personal email, ⚠️ All caps name, ⚠️ Generic company |
| 6 | mike@example.com | ⚠️ Very short last name (1 char) |
| 7 | admin@company.com | ⚠️ Role-based email |
| 8 | robert@guerrillamail.com | ⚠️ Disposable email, ⚠️ Number in name |
| 9 | lisa.davis@company.co | ✅ Should be valid |
| 10 | test test / asdf asdf | ⚠️ Fake names detected |
| 11 | (empty row) | ❌ Empty row error |
| 12 | mark@validcompany.com | ✅ Valid |
| 13 | email@example.com | ⚠️ Very short names (1 char each), ⚠️ Generic company |
| 14 | super@tempmail.com | ❌ Field length exceeds 255 chars (last name), ⚠️ Disposable |
| 15 | john.doe@acme.com | ⚠️ Duplicate email (see row 1) |
| 16 | normal@business.com | ✅ Should be valid |
| 17 | sales@marketing.com | ⚠️ Role-based email |
| 18 | contact@gmail.com | ⚠️ Personal email, ⚠️ Domain mismatch (gmail ≠ Google) |
| 19 | rachel@outlook.com | ⚠️ Personal email, ⚠️ All lowercase name |
| 20 | developer@company.com | ⚠️ Number in last name (99) |

## Manual Testing Checklist

### File Upload
- [ ] Drag and drop the CSV file - should show processing spinner
- [ ] File info should display (name, row count)
- [ ] Try uploading an invalid file type (.txt) - should show error

### Column Mapping
- [ ] Auto-detection should map all 5 required fields correctly
- [ ] Try changing a mapping and clicking "Continue" - should work
- [ ] Try unmapping a required field - should show error message
- [ ] "Continue to Validation" button should proceed to results

### Validation Results

#### Summary Dashboard
- [ ] Total records count matches uploaded file
- [ ] Valid/Error/Warning counts add up correctly
- [ ] Error breakdown shows specific issues with counts

#### Filter Buttons
- [ ] "All" shows all 20 records
- [ ] "Valid" shows only records with no errors/warnings
- [ ] "Errors" shows only records with critical errors
- [ ] "Warnings" shows records with warnings but no errors

#### Data Table
- [ ] Rows are color-coded (green=valid, yellow=warning, red=error)
- [ ] Each column shows correct data
- [ ] Issues column shows all errors/warnings for each row
- [ ] Click column headers to sort (arrow indicates direction)
- [ ] Sort by "Row", "Status", "Email", etc. - all should work

### Export Functionality
- [ ] "Download Clean Records" - downloads only valid records as CSV
- [ ] "Download Error Report" - downloads records with issues + error descriptions
- [ ] "Download All Records" - downloads everything with validation status
- [ ] Open exported CSV in Excel - should display correctly (UTF-8)

### Specific Validation Rules to Verify

#### Email Validation
- [ ] Row 2: gmail.con should suggest gmail.com
- [ ] Row 3: info@ should flag as role-based
- [ ] Row 4: 10minutemail.com should flag as disposable
- [ ] Row 5: yahoo.com should flag as personal email
- [ ] Row 11: Empty email should be critical error

#### Name Validation
- [ ] Row 5: SARAH JONES (all caps) should suggest title case
- [ ] Row 6: "T" should warn about short name
- [ ] Row 8: "Brown123" should warn about numbers
- [ ] Row 10: "test test" / "asdf asdf" should flag as fake names
- [ ] Row 19: lowercase names should suggest title case

#### Company Validation
- [ ] Row 5: "N/A" should flag as generic
- [ ] Row 10: "test" should flag as generic
- [ ] Row 13: "none" should flag as generic
- [ ] Suffix normalization suggestions (Inc. vs Incorporated)

#### Other Validations
- [ ] Row 11: Empty row should show "all required fields blank"
- [ ] Row 14: Long field should show "exceeds 255 characters"
- [ ] Row 15: Duplicate email should reference row 1
- [ ] Row 18: Domain mismatch (gmail.com vs Google)

## Create Your Own Test File

You can also create your own test CSV with these columns:
```
Email,First Name,Last Name,Company,Industry
```

Try these test cases:
- Valid email: test@company.com
- Typo: test@gmail.con
- Role email: info@company.com
- Disposable: test@tempmail.com
- Personal: test@gmail.com
- All caps name: JOHN SMITH
- Short name: J K
- Fake name: test test
- Number in name: John123
- Generic company: N/A, test, none
- Empty row: leave all fields blank
- Long field: 300+ characters
- Duplicate: same email twice

## Testing Without Running the Server

If you can't run the development server, you can:
1. Build and run a static export, or
2. Test the validation logic directly in browser console

## What to Look For

### Should Work
- ✅ File upload and parsing
- ✅ Column auto-detection
- ✅ All validation rules firing correctly
- ✅ Errors vs warnings categorized properly
- ✅ Duplicate detection
- ✅ Sorting and filtering
- ✅ Export to CSV with correct data
- ✅ UTF-8 encoding in exports

### Known Phase 1 Limitations (Phase 2 Features)
- ❌ Cannot edit cells inline (view only)
- ❌ Cannot delete individual rows
- ❌ Cannot apply auto-fixes (suggestions shown but not clickable)
- ❌ Cannot bulk delete invalid rows
- ❌ Cannot filter by specific error type

## Questions to Evaluate

1. **Validation Quality**: Are all the validation rules working as expected?
2. **User Experience**: Is the flow intuitive (upload → map → review)?
3. **Performance**: Does it handle 20 rows smoothly? (Try with larger files later)
4. **Export Quality**: Do the CSV exports open correctly in Excel?
5. **Error Messages**: Are errors clear and actionable?
6. **Privacy**: Is the "client-side processing" banner prominent and clear?

## Reporting Issues

If you find any issues, note:
- Which step it occurred in (upload/mapping/results)
- What you expected vs what happened
- Which test row/scenario triggered it
- Any browser console errors (F12 → Console tab)
