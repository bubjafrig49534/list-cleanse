import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { ParsedFile } from './types';

export async function parseFile(file: File): Promise<ParsedFile> {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv') {
    return parseCSV(file);
  } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
    return parseExcel(file);
  } else {
    throw new Error('Unsupported file format. Please upload CSV, XLS, or XLSX files.');
  }
}

async function parseCSV(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        if (results.errors.length > 0) {
          const criticalErrors = results.errors.filter(
            (err) => err.type === 'Delimiter' || err.type === 'Quotes'
          );
          if (criticalErrors.length > 0) {
            reject(new Error(`CSV parsing error: ${criticalErrors[0].message}`));
            return;
          }
        }

        const headers = results.meta.fields || [];
        const rows = results.data as Record<string, string>[];

        resolve({
          headers,
          rows: rows.map(row => {
            // Convert all values to strings and trim
            const cleanedRow: Record<string, string> = {};
            for (const [key, value] of Object.entries(row)) {
              cleanedRow[key] = String(value || '').trim();
            }
            return cleanedRow;
          }),
          fileName: file.name,
          rowCount: rows.length,
        });
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

async function parseExcel(file: File): Promise<ParsedFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error('Failed to read file'));
          return;
        }

        const workbook = XLSX.read(data, { type: 'binary' });

        // Use the first sheet
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
          reject(new Error('No sheets found in Excel file'));
          return;
        }

        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          raw: false, // Format all cells as strings
          defval: '', // Default value for empty cells
        }) as Record<string, string>[];

        if (jsonData.length === 0) {
          reject(new Error('Excel file is empty'));
          return;
        }

        // Extract headers from first row
        const headers = Object.keys(jsonData[0] || {}).map(h => h.trim());

        // Clean up rows
        const rows = jsonData.map(row => {
          const cleanedRow: Record<string, string> = {};
          for (const [key, value] of Object.entries(row)) {
            cleanedRow[key.trim()] = String(value || '').trim();
          }
          return cleanedRow;
        });

        resolve({
          headers,
          rows,
          fileName: file.name,
          rowCount: rows.length,
        });
      } catch (error) {
        reject(new Error(`Failed to parse Excel file: ${(error as Error).message}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read Excel file'));
    };

    reader.readAsBinaryString(file);
  });
}

// Export to CSV with UTF-8 BOM for Excel compatibility
export function exportToCSV(
  data: Record<string, string>[],
  fileName: string,
  headers?: string[]
): void {
  const csv = Papa.unparse(data, {
    columns: headers,
  });

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });

  // Trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
