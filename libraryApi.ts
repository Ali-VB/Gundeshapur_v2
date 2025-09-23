// This file implements the Library Data API using the Google Sheets API.
// It now uses dynamic header mapping for flexibility.

import { Book, Member, Loan } from './types';
import { getSheetsApi } from './googleApi';
import {
  getHeaderMap,
  parseRow,
  objectToRow,
  invalidateHeaderMapCache,
  getDefaultHeaderRow,
} from './sheetUtils';

// Helper to generate a unique ID for new entries
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// --- SPREADSHEET METADATA HELPERS ---
const spreadsheetMetadataCache = new Map<string, any>();
const getSpreadsheetMetadata = async (spreadsheetId: string) => {
    if (spreadsheetMetadataCache.has(spreadsheetId)) {
        return spreadsheetMetadataCache.get(spreadsheetId);
    }
    const response = await getSheetsApi().spreadsheets.get({ spreadsheetId });
    spreadsheetMetadataCache.set(spreadsheetId, response.result);
    return response.result;
};

const getNumericSheetId = async (spreadsheetId: string, sheetName: string): Promise<number | null> => {
    const metadata = await getSpreadsheetMetadata(spreadsheetId);
    const sheet = metadata.sheets.find((s: any) => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
};

// --- ID TO ROW INDEX CACHE ---
const rowIndexCache = new Map<string, Map<string, number>>(); // sheetId_sheetName -> Map<id, rowIndex>

const buildRowIndexCache = async (
    spreadsheetId: string,
    sheetName: string,
    headerMap: Map<string, number> // Assuming 'id' is a string key in the map
): Promise<Map<string, number>> => {
    const cacheKey = `${spreadsheetId}_${sheetName}`;
    // Invalidate existing cache for this sheet before rebuilding
    rowIndexCache.delete(cacheKey);

    const idColumnIndex = headerMap.get('id');
    if (idColumnIndex === undefined) {
        throw new Error(`'id' column not found in header map for sheet '${sheetName}'. Cannot build row index cache.`);
    }

    // Fetch only the 'id' column and the row index (implicitly)
    // Range is A2:A to get all IDs, or more dynamically `${String.fromCharCode(65 + idColumnIndex)}2:${String.fromCharCode(65 + idColumnIndex)}`
    const idColumnLetter = String.fromCharCode(65 + idColumnIndex); // 65 is 'A'
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!${idColumnLetter}2:${idColumnLetter}`, // Get all values in the ID column, starting from row 2
    });

    const values = response.result.values;
    const newCache = new Map<string, number>();
    if (values) {
        values.forEach((row, index) => {
            if (row[0]) { // ID is in the first (and only) element of the inner array
                newCache.set(row[0], index + 2); // +2 because data starts at row 2, and index is 0-based
            }
        });
    }
    rowIndexCache.set(cacheKey, newCache);
    return newCache;
};

const getRowIndexFromCache = async (
    spreadsheetId: string,
    sheetName: string,
    id: string,
    headerMap: Map<string, number>
): Promise<number> => {
    const cacheKey = `${spreadsheetId}_${sheetName}`;
    let idToRowMap = rowIndexCache.get(cacheKey);

    if (!idToRowMap) {
        idToRowMap = await buildRowIndexCache(spreadsheetId, sheetName, headerMap);
    }

    const rowIndex = idToRowMap.get(id);
    if (rowIndex === undefined) {
        // Potentially, the cache is stale or the ID doesn't exist.
        // For robustness, could try a direct API search as a fallback, or rebuild cache.
        // For now, assume if not in cache, it's not found or cache needs rebuild.
        // Rebuilding cache can be heavy if done often.
        // A more robust solution might involve a full scan if not found in cache,
        // or a flag to indicate cache invalidation.
        console.warn(`ID ${id} not found in row index cache for sheet ${sheetName}. Rebuilding cache.`);
        const rebuiltMap = await buildRowIndexCache(spreadsheetId, sheetName, headerMap);
        const foundRowIndex = rebuiltMap.get(id);
        if (foundRowIndex === undefined) {
            return -1; // Not found even after rebuild
        }
        return foundRowIndex;
    }
    return rowIndex;
};


// --- GENERIC DATA FETCHING ---
const getSheetData = async <T extends Book | Member | Loan>(
    spreadsheetId: string,
    sheetName: 'Books' | 'Members' | 'Loans',
    parserType: 'Book' | 'Member' | 'Loan',
    defaultHeaders: (keyof T)[]
): Promise<T[]> => {
    const headerMap = await getHeaderMap<T>(spreadsheetId, sheetName, defaultHeaders);
    if (headerMap.size === 0) {
        console.error(`Failed to get header map for ${sheetName}, cannot fetch data.`);
        return [];
    }

    // Determine the range for data. We need to fetch all columns that have headers.
    // Find the maximum column index from the headerMap to determine the end column.
    let maxColIndex = 0;
    headerMap.forEach(index => {
        if (index > maxColIndex) maxColIndex = index;
    });
    const endColumnLetter = String.fromCharCode(65 + maxColIndex); // A=65, B=66, etc.
    const dataRange = `${sheetName}!A2:${endColumnLetter}`; // From row 2 to the end, for all relevant columns

    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId,
        range: dataRange,
    });

    const rows = response.result.values || [];
    const results: T[] = [];
    for (const row of rows) {
        let parsed: Book | Member | Loan | null = null;
        // Use the specific parserType for parseRow with type assertion
        if (parserType === 'Book') {
            parsed = parseRow(row, headerMap as Map<keyof Book, number>, 'Book');
        } else if (parserType === 'Member') {
            parsed = parseRow(row, headerMap as Map<keyof Member, number>, 'Member');
        } else if (parserType === 'Loan') {
            parsed = parseRow(row, headerMap as Map<keyof Loan, number>, 'Loan');
        }
        
        if (parsed) {
            results.push(parsed as T); // Cast back to T, which is safe due to parserType context
        }
    }
    return results;
};


// --- BOOKS API ---
export const getBooks = async (sheetId: string): Promise<Book[]> => {
    return getSheetData<Book>(sheetId, 'Books', 'Book', DEFAULT_HEADERS.BookHeaders);
};

export const addBook = async (sheetId: string, bookData: Omit<Book, 'id' | 'availableCopies'> & { availableCopies: number }): Promise<any> => {
    const headerMap = await getHeaderMap<Book>(sheetId, 'Books', DEFAULT_HEADERS.BookHeaders);
    const sheetHeaders = await getActualSheetHeaders(sheetId, 'Books'); // Get headers in their original order for objectToRow

    const newBook: Book = {
        ...bookData,
        id: generateId(),
        // availableCopies is already in bookData
    };

    const newRow = objectToRow(newBook, headerMap, sheetHeaders);
    invalidateHeaderMapCache(sheetId, 'Books'); // Invalidate cache on write
    rowIndexCache.delete(`${sheetId}_Books`); // Invalidate row index cache

    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Books!A:Z', // Append to the first empty row in the sheet
        valueInputOption: 'USER_ENTERED',
        resource: { values: [newRow] },
    });
};

export const updateBook = async (sheetId: string, bookId: string, updates: Partial<Book>): Promise<any> => {
    const headerMap = await getHeaderMap<Book>(sheetId, 'Books', DEFAULT_HEADERS.BookHeaders);
    const sheetHeaders = await getActualSheetHeaders(sheetId, 'Books');

    const rowIndex = await getRowIndexFromCache(sheetId, 'Books', bookId, headerMap as Map<string, number>);
    if (rowIndex === -1) throw new Error(`Book with ID ${bookId} not found for update.`);

    // To get current data for merging updates, we need to fetch the specific row
    const currentRowResponse = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `Books!A${rowIndex}:${String.fromCharCode(65 + (sheetHeaders.length - 1))}${rowIndex}`,
    });
    const currentRowValues = currentRowResponse.result.values?.[0];
    if (!currentRowValues) throw new Error(`Could not retrieve current book data for ID ${bookId} at row ${rowIndex}.`);
    
    const currentBook = parseRow(currentRowValues, headerMap, 'Book');
    if (!currentBook) throw new Error(`Failed to parse current book data for ID ${bookId}.`);

    const updatedBook = { ...currentBook, ...updates, id: bookId }; // Ensure ID doesn't change
    const updatedRowData = objectToRow(updatedBook, headerMap, sheetHeaders);

    invalidateHeaderMapCache(sheetId, 'Books');
    rowIndexCache.delete(`${sheetId}_Books`); // Invalidate row index cache

    return getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Books!A${rowIndex}:${String.fromCharCode(65 + (sheetHeaders.length - 1))}${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedRowData] },
    });
};

export const deleteBook = async (sheetId: string, bookId: string): Promise<any> => {
    const numericSheetId = await getNumericSheetId(sheetId, 'Books');
    const headerMap = await getHeaderMap<Book>(sheetId, 'Books', DEFAULT_HEADERS.BookHeaders);
    const rowIndex = await getRowIndexFromCache(sheetId, 'Books', bookId, headerMap as Map<string, number>);

    if (numericSheetId === null || rowIndex === -1) {
        throw new Error(`Book with ID ${bookId} not found or sheet metadata error.`);
    }

    invalidateHeaderMapCache(sheetId, 'Books');
    rowIndexCache.delete(`${sheetId}_Books`); // Invalidate row index cache

    return getSheetsApi().spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: { requests: [{ deleteDimension: { range: {
            sheetId: numericSheetId,
            dimension: 'ROWS',
            startIndex: rowIndex - 1, // API uses 0-based index for start
            endIndex: rowIndex,       // End index is exclusive
        }}}]},
    });
};

// --- MEMBERS API ---
export const getMembers = async (sheetId: string): Promise<Member[]> => {
    return getSheetData<Member>(sheetId, 'Members', 'Member', DEFAULT_HEADERS.MemberHeaders);
};

export const addMember = async (sheetId: string, memberData: Omit<Member, 'id'>): Promise<any> => {
    const headerMap = await getHeaderMap<Member>(sheetId, 'Members', DEFAULT_HEADERS.MemberHeaders);
    const sheetHeaders = await getActualSheetHeaders(sheetId, 'Members');
    const newMember: Member = { ...memberData, id: generateId() };
    const newRow = objectToRow(newMember, headerMap, sheetHeaders);

    invalidateHeaderMapCache(sheetId, 'Members');
    rowIndexCache.delete(`${sheetId}_Members`);

    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId, range: 'Members!A:Z', valueInputOption: 'USER_ENTERED',
        resource: { values: [newRow] },
    });
};

export const updateMember = async (sheetId: string, memberId: string, updates: Partial<Member>): Promise<any> => {
    const headerMap = await getHeaderMap<Member>(sheetId, 'Members', DEFAULT_HEADERS.MemberHeaders);
    const sheetHeaders = await getActualSheetHeaders(sheetId, 'Members');
    const rowIndex = await getRowIndexFromCache(sheetId, 'Members', memberId, headerMap as Map<string, number>);
    if (rowIndex === -1) throw new Error(`Member with ID ${memberId} not found for update.`);

    const currentRowResponse = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `Members!A${rowIndex}:${String.fromCharCode(65 + (sheetHeaders.length - 1))}${rowIndex}`,
    });
    const currentRowValues = currentRowResponse.result.values?.[0];
    if (!currentRowValues) throw new Error(`Could not retrieve current member data for ID ${memberId}.`);

    const currentMember = parseRow(currentRowValues, headerMap, 'Member');
    if (!currentMember) throw new Error(`Failed to parse current member data for ID ${memberId}.`);

    const updatedMember = { ...currentMember, ...updates, id: memberId };
    const updatedRowData = objectToRow(updatedMember, headerMap, sheetHeaders);

    invalidateHeaderMapCache(sheetId, 'Members');
    rowIndexCache.delete(`${sheetId}_Members`);

    return getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Members!A${rowIndex}:${String.fromCharCode(65 + (sheetHeaders.length - 1))}${rowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedRowData] },
    });
};

export const deleteMember = async (sheetId: string, memberId: string): Promise<any> => {
    const numericSheetId = await getNumericSheetId(sheetId, 'Members');
    const headerMap = await getHeaderMap<Member>(sheetId, 'Members', DEFAULT_HEADERS.MemberHeaders);
    const rowIndex = await getRowIndexFromCache(sheetId, 'Members', memberId, headerMap as Map<string, number>);
    if (numericSheetId === null || rowIndex === -1) throw new Error(`Member with ID ${memberId} not found or sheet metadata error.`);

    invalidateHeaderMapCache(sheetId, 'Members');
    rowIndexCache.delete(`${sheetId}_Members`);

    return getSheetsApi().spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: { requests: [{ deleteDimension: { range: {
            sheetId: numericSheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex,
        }}}]},
    });
};

// --- LOANS API ---
export const getLoans = async (sheetId: string): Promise<Loan[]> => {
    return getSheetData<Loan>(sheetId, 'Loans', 'Loan', DEFAULT_HEADERS.LoanHeaders);
};

export const addLoan = async (sheetId: string, loanData: { bookId: string; memberId: string }): Promise<any> => {
    const booksHeaderMap = await getHeaderMap<Book>(sheetId, 'Books', DEFAULT_HEADERS.BookHeaders);
    const loansHeaderMap = await getHeaderMap<Loan>(sheetId, 'Loans', DEFAULT_HEADERS.LoanHeaders);
    const loansSheetHeaders = await getActualSheetHeaders(sheetId, 'Loans');

    // 1. Find and update book's availableCopies
    const bookRowIndex = await getRowIndexFromCache(sheetId, 'Books', loanData.bookId, booksHeaderMap as Map<string, number>);
    if (bookRowIndex === -1) throw new Error(`Book with ID ${loanData.bookId} not found.`);

    const bookColIndex = booksHeaderMap.get('availableCopies');
    if (bookColIndex === undefined) throw new Error("'availableCopies' column not found in Books sheet.");
    const bookColLetter = String.fromCharCode(65 + bookColIndex);

    const getBookResponse = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `Books!${bookColLetter}${bookRowIndex}`,
    });
    const currentAvailableCopies = parseInt(getBookResponse.result.values?.[0]?.[0] ?? '0', 10);
    if (currentAvailableCopies <= 0) throw new Error(`No available copies of book ID ${loanData.bookId} to loan.`);

    await getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Books!${bookColLetter}${bookRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[currentAvailableCopies - 1]] },
    });

    // 2. Add the new loan
    const loanDateIso = new Date().toISOString();
    const loanDateObj = new Date(loanDateIso); // Create Date object from ISO string
    const dueDate = new Date();
    dueDate.setDate(loanDateObj.getDate() + 14); // 2 week loan period

    const newLoan: Loan = {
        id: generateId(),
        bookId: loanData.bookId,
        memberId: loanData.memberId,
        loanDate: loanDateIso, // Corrected variable name
        dueDate: dueDate.toISOString(),
        returnDate: null,
        status: 'On Loan',
    };

    const newLoanRow = objectToRow(newLoan, loansHeaderMap, loansSheetHeaders);

    try {
        invalidateHeaderMapCache(sheetId, 'Loans');
        rowIndexCache.delete(`${sheetId}_Loans`);
        rowIndexCache.delete(`${sheetId}_Books`); // Book data changed

        return await getSheetsApi().spreadsheets.values.append({
            spreadsheetId: sheetId, range: 'Loans!A:Z', valueInputOption: 'USER_ENTERED',
            resource: { values: [newLoanRow] },
        });
    } catch (error) {
        console.error("Failed to add loan, reverting book count.", error);
        // Revert book count on failure
        await getSheetsApi().spreadsheets.values.update({
            spreadsheetId: sheetId,
            range: `Books!${bookColLetter}${bookRowIndex}`,
            valueInputOption: 'USER_ENTERED',
            resource: { values: [[currentAvailableCopies]] },
        });
        throw error;
    }
};

export const returnLoan = async (sheetId: string, loanId: string): Promise<any> => {
    const loansHeaderMap = await getHeaderMap<Loan>(sheetId, 'Loans', DEFAULT_HEADERS.LoanHeaders);
    const booksHeaderMap = await getHeaderMap<Book>(sheetId, 'Books', DEFAULT_HEADERS.BookHeaders);
    const loansSheetHeaders = await getActualSheetHeaders(sheetId, 'Loans');

    const loanRowIndex = await getRowIndexFromCache(sheetId, 'Loans', loanId, loansHeaderMap as Map<string, number>);
    if (loanRowIndex === -1) throw new Error(`Loan with ID ${loanId} not found.`);

    // Get current loan data
    const currentLoanResponse = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `Loans!A${loanRowIndex}:${String.fromCharCode(65 + (loansSheetHeaders.length - 1))}${loanRowIndex}`,
    });
    const currentLoanValues = currentLoanResponse.result.values?.[0];
    if (!currentLoanValues) throw new Error(`Could not retrieve current loan data for ID ${loanId}.`);
    
    const currentLoan = parseRow(currentLoanValues, loansHeaderMap, 'Loan');
    if (!currentLoan) throw new Error(`Failed to parse current loan data for ID ${loanId}.`);
    if (currentLoan.status === 'Returned') return; // Already returned

    // 1. Update Loan
    const updatedLoan: Loan = {
        ...currentLoan,
        returnDate: new Date().toISOString(),
        status: 'Returned',
    };
    const updatedLoanRow = objectToRow(updatedLoan, loansHeaderMap, loansSheetHeaders);
    await getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Loans!A${loanRowIndex}:${String.fromCharCode(65 + (loansSheetHeaders.length - 1))}${loanRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedLoanRow] },
    });

    // 2. Update Book's availableCopies
    const bookRowIndex = await getRowIndexFromCache(sheetId, 'Books', currentLoan.bookId, booksHeaderMap as Map<string, number>);
    if (bookRowIndex === -1) {
        console.warn(`Could not find book ${currentLoan.bookId} to update copy count.`);
        return; // Or throw, depending on desired strictness
    }

    const bookColIndex = booksHeaderMap.get('availableCopies');
    if (bookColIndex === undefined) throw new Error("'availableCopies' column not found in Books sheet.");
    const bookColLetter = String.fromCharCode(65 + bookColIndex);

    const getBookResponse = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: `Books!${bookColLetter}${bookRowIndex}`,
    });
    const currentAvailableCopies = parseInt(getBookResponse.result.values?.[0]?.[0] ?? '0', 10);
    
    invalidateHeaderMapCache(sheetId, 'Loans');
    rowIndexCache.delete(`${sheetId}_Loans`);
    rowIndexCache.delete(`${sheetId}_Books`); // Book data changed

    return getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId,
        range: `Books!${bookColLetter}${bookRowIndex}`,
        valueInputOption: 'USER_ENTERED',
        resource: { values: [[currentAvailableCopies + 1]] },
    });
};

// --- Helper to get actual sheet headers in order ---
const getActualSheetHeaders = async (spreadsheetId: string, sheetName: string): Promise<string[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!1:1`,
    });
    return response.result.values?.[0] || [];
};

// --- Default Headers for getHeaderMap calls ---
const DEFAULT_HEADERS = {
    BookHeaders: [
        'id', 'title', 'author', 'year', 'isbn', 'publisher', 'language', 'ddc', 'tags',
        'totalCopies', 'availableCopies'
    ] as (keyof Book)[],
    MemberHeaders: [
        'id', 'name', 'email', 'phone', 'role', 'status'
    ] as (keyof Member)[],
    LoanHeaders: [
        'id', 'bookId', 'memberId', 'loanDate', 'dueDate', 'returnDate', 'status'
    ] as (keyof Loan)[],
};
