// This file implements the Library Data API using the Google Sheets API.

import { Book, Member, Loan } from './types';
import { getSheetsApi } from './googleApi';

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

const findRowIndexById = async (sheetId: string, sheetName: string, id: string): Promise<number> => {
    const range = `${sheetName}!A1:A`; // Search the entire first column
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: range,
    });
    const values = response.result.values;
    if (!values) return -1;
    const rowIndex = values.findIndex(row => row[0] === id);
    return rowIndex !== -1 ? rowIndex + 1 : -1; // Return 1-based index
};


// --- PARSING HELPERS ---
const parseBooks = (values: any[][]): Book[] => {
    return values.map(row => ({
        id: row[0], title: row[1], author: row[2], year: parseInt(row[3]) || 0,
        isbn: row[4], publisher: row[5], language: row[6], ddc: row[7],
        tags: row[8] ? row[8].split(',').map((t: string) => t.trim()) : [],
        totalCopies: parseInt(row[9]) || 0, availableCopies: parseInt(row[10]) || 0,
    })).filter(book => book.id && book.title);
};

const parseMembers = (values: any[][]): Member[] => {
    return values.map(row => ({
        id: row[0], name: row[1], email: row[2], phone: row[3],
        role: row[4] as Member['role'], status: row[5] as Member['status'],
    })).filter(member => member.id && member.name);
};

const parseLoans = (values: any[][]): Loan[] => {
    return values.map(row => ({
        id: row[0], bookId: row[1], memberId: row[2], loanDate: row[3],
        dueDate: row[4], returnDate: row[5] || null, status: row[6] as Loan['status'],
    })).filter(loan => loan.id && loan.bookId && loan.memberId);
};


// --- BOOKS API ---
export const getBooks = async (sheetId: string): Promise<Book[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId, range: 'Books!A2:K',
    });
    return parseBooks(response.result.values || []);
};

export const addBook = async (sheetId: string, bookData: Omit<Book, 'id' | 'availableCopies'> & { availableCopies: number }): Promise<any> => {
    const newRow = [
        generateId(), bookData.title, bookData.author, bookData.year, bookData.isbn,
        bookData.publisher, bookData.language, bookData.ddc, bookData.tags.join(', '),
        bookData.totalCopies, bookData.availableCopies
    ];
    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId, range: 'Books!A:K', valueInputOption: 'USER_ENTERED',
        resource: { values: [newRow] },
    });
};

export const updateBook = async (sheetId: string, bookId: string, updates: Partial<Book>): Promise<any> => {
    const rowIndex = await findRowIndexById(sheetId, 'Books', bookId);
    if (rowIndex === -1) throw new Error("Book not found for update.");

    const getResponse = await getSheetsApi().spreadsheets.values.get({ spreadsheetId: sheetId, range: `Books!A${rowIndex}:K${rowIndex}` });
    if (!getResponse.result.values?.[0]) throw new Error("Could not retrieve current book data.");
    
    const currentBook = parseBooks(getResponse.result.values)[0];
    const updatedBook = { ...currentBook, ...updates, id: bookId };

    const updatedRow = [
        updatedBook.id, updatedBook.title, updatedBook.author, updatedBook.year, updatedBook.isbn,
        updatedBook.publisher, updatedBook.language, updatedBook.ddc, updatedBook.tags.join(', '),
        updatedBook.totalCopies, updatedBook.availableCopies
    ];
    
    return getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId, range: `Books!A${rowIndex}:K${rowIndex}`, valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedRow] },
    });
};

export const deleteBook = async (sheetId: string, bookId: string): Promise<any> => {
    const numericSheetId = await getNumericSheetId(sheetId, 'Books');
    const rowIndex = await findRowIndexById(sheetId, 'Books', bookId);
    if (numericSheetId === null || rowIndex === -1) throw new Error("Book not found or sheet metadata error.");

    return getSheetsApi().spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: { requests: [{ deleteDimension: { range: {
            sheetId: numericSheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex,
        }}}]},
    });
};

// --- MEMBERS API ---
export const getMembers = async (sheetId: string): Promise<Member[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId, range: 'Members!A2:F',
    });
    return parseMembers(response.result.values || []);
};

export const addMember = async (sheetId: string, memberData: Omit<Member, 'id'>): Promise<any> => {
    const newRow = [ generateId(), memberData.name, memberData.email, memberData.phone, memberData.role, memberData.status ];
    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId, range: 'Members!A:F', valueInputOption: 'USER_ENTERED',
        resource: { values: [newRow] },
    });
};

export const updateMember = async (sheetId: string, memberId: string, updates: Partial<Member>): Promise<any> => {
    const rowIndex = await findRowIndexById(sheetId, 'Members', memberId);
    if (rowIndex === -1) throw new Error("Member not found for update.");

    const getResponse = await getSheetsApi().spreadsheets.values.get({ spreadsheetId: sheetId, range: `Members!A${rowIndex}:F${rowIndex}` });
    if (!getResponse.result.values?.[0]) throw new Error("Could not retrieve current member data.");
    
    const currentMember = parseMembers(getResponse.result.values)[0];
    const updatedMember = { ...currentMember, ...updates, id: memberId };
    
    const updatedRow = [ updatedMember.id, updatedMember.name, updatedMember.email, updatedMember.phone, updatedMember.role, updatedMember.status ];

    return getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId, range: `Members!A${rowIndex}:F${rowIndex}`, valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedRow] },
    });
};

export const deleteMember = async (sheetId: string, memberId: string): Promise<any> => {
    const numericSheetId = await getNumericSheetId(sheetId, 'Members');
    const rowIndex = await findRowIndexById(sheetId, 'Members', memberId);
    if (numericSheetId === null || rowIndex === -1) throw new Error("Member not found or sheet metadata error.");

    return getSheetsApi().spreadsheets.batchUpdate({
        spreadsheetId: sheetId,
        resource: { requests: [{ deleteDimension: { range: {
            sheetId: numericSheetId, dimension: 'ROWS', startIndex: rowIndex - 1, endIndex: rowIndex,
        }}}]},
    });
};

// --- LOANS API ---
export const getLoans = async (sheetId: string): Promise<Loan[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId, range: 'Loans!A2:G',
    });
    return parseLoans(response.result.values || []);
};

export const addLoan = async (sheetId: string, loanData: { bookId: string; memberId: string }): Promise<any> => {
    const bookRowIndex = await findRowIndexById(sheetId, 'Books', loanData.bookId);
    if (bookRowIndex === -1) throw new Error(`Book with ID ${loanData.bookId} not found.`);

    const getBookResponse = await getSheetsApi().spreadsheets.values.get({ spreadsheetId: sheetId, range: `Books!A${bookRowIndex}:K${bookRowIndex}` });
    const book = parseBooks(getBookResponse.result.values || [])[0];
    if (!book) throw new Error(`Could not retrieve book data for ID ${loanData.bookId}`);
    if (book.availableCopies <= 0) throw new Error(`No available copies of "${book.title}" to loan.`);
    
    await getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId, range: `Books!K${bookRowIndex}`, valueInputOption: 'USER_ENTERED',
        resource: { values: [[book.availableCopies - 1]] },
    });
    
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 14); // 2 week loan period
    const newRow = [ generateId(), loanData.bookId, loanData.memberId, loanDate.toISOString(), dueDate.toISOString(), null, 'On Loan' ];

    try {
        return await getSheetsApi().spreadsheets.values.append({
            spreadsheetId: sheetId, range: 'Loans!A:G', valueInputOption: 'USER_ENTERED',
            resource: { values: [newRow] },
        });
    } catch (error) {
        console.error("Failed to add loan, reverting book count.", error);
        await getSheetsApi().spreadsheets.values.update({
            spreadsheetId: sheetId, range: `Books!K${bookRowIndex}`, valueInputOption: 'USER_ENTERED',
            resource: { values: [[book.availableCopies]] },
        });
        throw error;
    }
};

export const returnLoan = async (sheetId: string, loanId: string): Promise<any> => {
    const loanRowIndex = await findRowIndexById(sheetId, 'Loans', loanId);
    if (loanRowIndex === -1) throw new Error("Loan not found.");

    const getLoanResponse = await getSheetsApi().spreadsheets.values.get({ spreadsheetId: sheetId, range: `Loans!A${loanRowIndex}:G${loanRowIndex}`});
    const loan = parseLoans(getLoanResponse.result.values || [])[0];
    if (!loan) throw new Error("Could not retrieve current loan data.");
    if (loan.status === 'Returned') return; // Already returned

    const updatedLoanRow = [ loan.id, loan.bookId, loan.memberId, loan.loanDate, loan.dueDate, new Date().toISOString(), 'Returned' ];
    await getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId, range: `Loans!A${loanRowIndex}:G${loanRowIndex}`, valueInputOption: 'USER_ENTERED',
        resource: { values: [updatedLoanRow] },
    });

    const bookRowIndex = await findRowIndexById(sheetId, 'Books', loan.bookId);
    if (bookRowIndex === -1) {
        console.warn(`Could not find book ${loan.bookId} to update copy count.`);
        return;
    }

    const getBookResponse = await getSheetsApi().spreadsheets.values.get({ spreadsheetId: sheetId, range: `Books!A${bookRowIndex}:K${bookRowIndex}`});
    const book = parseBooks(getBookResponse.result.values || [])[0];
    if (!book) {
        console.warn(`Could not parse book data for ${loan.bookId}`);
        return;
    }
    
    return getSheetsApi().spreadsheets.values.update({
        spreadsheetId: sheetId, range: `Books!K${bookRowIndex}`, valueInputOption: 'USER_ENTERED',
        resource: { values: [[book.availableCopies + 1]] },
    });
};
