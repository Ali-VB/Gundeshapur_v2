import { getSheetsApi } from './googleApi';
import { Book, Member, Loan } from './types';

// Define expected header names for each sheet type.
// These are the *default* English headers that the app will look for,
// but it should be able to map if they are renamed.
const DEFAULT_HEADERS = {
  Books: [
    'id', 'title', 'author', 'year', 'isbn', 'publisher', 'language', 'ddc', 'tags',
    'totalCopies', 'availableCopies'
  ] as (keyof Book)[],
  Members: [
    'id', 'name', 'email', 'phone', 'role', 'status'
  ] as (keyof Member)[],
  Loans: [
    'id', 'bookId', 'memberId', 'loanDate', 'dueDate', 'returnDate', 'status'
  ] as (keyof Loan)[],
};

// Cache for header mappings to avoid re-fetching on every API call
const headerMapCache = new Map<string, Map<keyof any, number>>(); // sheetId_tabName -> Map<keyof T, columnIndex>

/**
 * Fetches the header row for a given sheet and maps it to the application's internal schema keys.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param sheetName The name of the sheet tab (e.g., 'Books').
 * @param defaultHeaders An array of the default header keys (from DEFAULT_HEADERS) for mapping.
 * @returns A Promise that resolves to a Map where keys are the internal schema keys (e.g., 'title') and values are the 0-based column index in the sheet.
 */
export const getHeaderMap = async <T extends Book | Member | Loan>(
  spreadsheetId: string,
  sheetName: keyof typeof DEFAULT_HEADERS,
  defaultHeaders: (keyof T)[]
): Promise<Map<keyof T, number>> => {
  const cacheKey = `${spreadsheetId}_${sheetName}`;
  if (headerMapCache.has(cacheKey)) {
    return headerMapCache.get(cacheKey) as Map<keyof T, number>;
  }

  try {
    const response = await getSheetsApi().spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!1:1`, // Get the first row only
    });

    const sheetHeaders = response.result.values?.[0];
    if (!sheetHeaders || sheetHeaders.length === 0) {
      throw new Error(`Header row not found or empty in sheet '${sheetName}'.`);
    }

    const headerMap = new Map<keyof T, number>();
    const normalizedSheetHeaders = sheetHeaders.map(h => h.toString().toLowerCase().trim());

    defaultHeaders.forEach(internalKey => {
      const expectedHeaderName = internalKey.toString().toLowerCase();
      const index = normalizedSheetHeaders.indexOf(expectedHeaderName);
      if (index !== -1) {
        headerMap.set(internalKey, index);
      } else {
        // Handle missing required columns. For now, we'll log an error.
        // In a more robust system, this could throw an error or try to recover.
        console.error(`Required column '${internalKey}' not found in sheet '${sheetName}'. Found headers:`, sheetHeaders);
        // Potentially, we could try to find by partial match or aliases here if needed.
      }
    });

    // Check if all required default headers were found
    if (headerMap.size !== defaultHeaders.length) {
        const missingHeaders = defaultHeaders.filter(key => !headerMap.has(key));
        console.error(`Not all required headers were mapped for sheet '${sheetName}'. Missing:`, missingHeaders);
        // Depending on strictness, could throw here:
        // throw new Error(`Missing required columns in sheet '${sheetName}': ${missingHeaders.join(', ')}`);
    }

    headerMapCache.set(cacheKey, headerMap);
    return headerMap;
  } catch (error) {
    console.error(`Failed to get header map for sheet '${sheetName}':`, error);
    // Clear potentially invalid cache entry if any error occurred before setting
    headerMapCache.delete(cacheKey);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Invalidates the header map cache for a specific sheet or all sheets.
 * @param spreadsheetId The ID of the Google Spreadsheet.
 * @param sheetName Optional. The name of the sheet tab. If not provided, all caches for the spreadsheet are cleared.
 */
export const invalidateHeaderMapCache = (spreadsheetId: string, sheetName?: keyof typeof DEFAULT_HEADERS) => {
    if (sheetName) {
        headerMapCache.delete(`${spreadsheetId}_${sheetName}`);
    } else {
        // Iterate and delete all keys for the given spreadsheetId
        for (const key of headerMapCache.keys()) {
            if (key.startsWith(`${spreadsheetId}_`)) {
                headerMapCache.delete(key);
            }
        }
    }
};

// Function overloads for parseRow (public signatures)
export function parseRow(row: any[], headerMap: Map<keyof Book, number>, parserType: 'Book'): Book | null;
export function parseRow(row: any[], headerMap: Map<keyof Member, number>, parserType: 'Member'): Member | null;
export function parseRow(row: any[], headerMap: Map<keyof Loan, number>, parserType: 'Loan'): Loan | null;

/**
 * Parses a row of data from a sheet into a typed object using a header map.
 * Implementation uses a single function with internal type discrimination.
 * @param row The array of values from a single row in the sheet.
 * @param headerMap The map from internal keys to column indices. The key type is a union.
 * @param parserType A string indicating the type of object to parse ('Book', 'Member', 'Loan').
 * @returns The parsed typed object.
 */
export function parseRow(
    row: any[],
    headerMap: Map<keyof Book | keyof Member | keyof Loan, number>, // Union type for headerMap key
    parserType: 'Book' | 'Member' | 'Loan'
): Book | Member | Loan | null {
    if (!row || row.length === 0) {
        return null;
    }

    // Generic getValue helper for the implementation
    // K is constrained to the union of possible keys
    const getValue = <K extends keyof Book | keyof Member | keyof Loan>(key: K): any => {
        const index = headerMap.get(key);
        if (index !== undefined && index < row.length && row[index] !== null && row[index] !== undefined) {
            return row[index];
        }
        return undefined;
    };

    try {
        if (parserType === 'Book') {
            // Type assertion for headerMap is safe here because parserType is 'Book'
            const bookHeaderMap = headerMap as Map<keyof Book, number>;
            const id = getValue('id');
            const title = getValue('title');
            if (!id || !title) return null;

            // Explicitly construct a Book object
            const book: Book = {
                id, title,
                author: getValue('author') ?? '',
                year: parseInt(getValue('year') ?? '0', 10),
                isbn: getValue('isbn') ?? '',
                publisher: getValue('publisher') ?? '',
                language: getValue('language') ?? '',
                ddc: getValue('ddc') ?? '',
                tags: (typeof getValue('tags') === 'string' ? getValue('tags').split(',').map(t => t.trim()) : []),
                totalCopies: parseInt(getValue('totalCopies') ?? '0', 10),
                availableCopies: parseInt(getValue('availableCopies') ?? '0', 10),
            };
            return book;
        } else if (parserType === 'Member') {
            const memberHeaderMap = headerMap as Map<keyof Member, number>;
            const id = getValue('id');
            const name = getValue('name');
            if (!id || !name) return null;

            const member: Member = {
                id, name,
                email: getValue('email') ?? '',
                phone: getValue('phone') ?? '',
                role: (getValue('role') as Member['role']) ?? 'Member',
                status: (getValue('status') as Member['status']) ?? 'Active',
            };
            return member;
        } else if (parserType === 'Loan') {
            const loanHeaderMap = headerMap as Map<keyof Loan, number>;
            const id = getValue('id');
            const bookId = getValue('bookId');
            const memberId = getValue('memberId');
            if (!id || !bookId || !memberId) return null;

            const loan: Loan = {
                id, bookId, memberId,
                loanDate: getValue('loanDate') ?? '',
                dueDate: getValue('dueDate') ?? '',
                returnDate: getValue('returnDate') ?? null,
                status: (getValue('status') as Loan['status']) ?? 'On Loan',
            };
            return loan;
        }
    } catch (e) {
        console.error(`Error parsing row for ${parserType}:`, row, e);
        return null;
    }
    // Fallback, should ideally not be reached if parserType is valid and handled above.
    return null;
}

/**
 * Converts a typed object into an array of values for a sheet row using a header map.
 * The order of the output array will match the order of columns in the sheet.
 * @param object The typed object (e.g., Book, Member).
 * @param headerMap The map from internal keys to column indices.
 * @param allSheetHeaders An array of all header strings in the sheet, to determine the correct length and order.
 * @returns An array of values ready to be written to the sheet.
 */
export const objectToRow = <T extends Book | Member | Loan>(
    object: Partial<T>,
    headerMap: Map<keyof T, number>,
    allSheetHeaders: string[]
): any[] => {
    const row = new Array(allSheetHeaders.length).fill(''); // Initialize with empty strings

    headerMap.forEach((colIndex, key) => {
        if (colIndex < row.length) {
            const value = object[key];
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) { // Specifically for 'tags'
                    row[colIndex] = value.join(', ');
                } else {
                    row[colIndex] = value;
                }
            }
        }
    });
    return row;
};

/**
 * Generates the default header row values for a new sheet.
 * @param sheetName The name of the sheet ('Books', 'Members', 'Loans').
 * @returns An array of header strings.
 */
export const getDefaultHeaderRow = (sheetName: keyof typeof DEFAULT_HEADERS): string[] => {
    return DEFAULT_HEADERS[sheetName].map(String);
};
