// This file implements the Library Data API using the Google Sheets API.

import { Book, Member, Loan } from './types';

// Helper to access the gapi client
const getSheetsApi = () => {
    if (!window.gapi || !window.gapi.client || !window.gapi.client.sheets) {
        throw new Error('Google Sheets API client not initialized.');
    }
    return window.gapi.client.sheets;
}

// Helper to generate a unique ID for new entries
const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


// --- PARSING HELPERS ---
// These helpers convert the raw array-of-arrays response from Google Sheets
// into our structured application types. They rely on a fixed column order.

const parseBooks = (values: any[][]): Book[] => {
    // Expected order: ID, Title, Author, Year, ISBN, Publisher, Language, DDC, Tags, Total Copies, Available Copies
    return values.map(row => ({
        id: row[0],
        title: row[1],
        author: row[2],
        year: parseInt(row[3]) || 0,
        isbn: row[4],
        publisher: row[5],
        language: row[6],
        ddc: row[7],
        tags: row[8] ? row[8].split(',').map((t: string) => t.trim()) : [],
        totalCopies: parseInt(row[9]) || 0,
        availableCopies: parseInt(row[10]) || 0,
    })).filter(book => book.id && book.title); // Basic validation
};

const parseMembers = (values: any[][]): Member[] => {
    // Expected order: ID, Name, Email, Phone, Role, Status
    return values.map(row => ({
        id: row[0],
        name: row[1],
        email: row[2],
        phone: row[3],
        role: row[4] as Member['role'],
        status: row[5] as Member['status'],
    })).filter(member => member.id && member.name);
};

const parseLoans = (values: any[][]): Loan[] => {
    // Expected order: ID, Book ID, Member ID, Loan Date, Due Date, Return Date, Status
    return values.map(row => ({
        id: row[0],
        bookId: row[1],
        memberId: row[2],
        loanDate: row[3],
        dueDate: row[4],
        returnDate: row[5] || null,
        status: row[6] as Loan['status'],
    })).filter(loan => loan.id && loan.bookId && loan.memberId);
};


// --- BOOKS API ---
export const getBooks = async (sheetId: string): Promise<Book[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Books!A2:K', // Assuming headers are in row 1
    });
    return parseBooks(response.result.values || []);
};
export const addBook = async (sheetId: string, bookData: Omit<Book, 'id' | 'availableCopies'> & { availableCopies: number }): Promise<any> => {
    const newId = generateId();
    const newRow = [
        newId,
        bookData.title,
        bookData.author,
        bookData.year,
        bookData.isbn,
        bookData.publisher,
        bookData.language,
        bookData.ddc,
        bookData.tags.join(', '),
        bookData.totalCopies,
        bookData.availableCopies
    ];

    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Books!A:K',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [newRow],
        },
    });
};
export const updateBook = async (sheetId: string, bookId: string, updates: Partial<Book>): Promise<any> => {
    console.log("TODO: Implement updateBook", { sheetId, bookId, updates });
    // This is complex: requires finding the row of bookId, then using `spreadsheets.values.update`
    return Promise.resolve();
};
export const deleteBook = async (sheetId: string, bookId: string): Promise<any> => {
    console.log("TODO: Implement deleteBook", { sheetId, bookId });
    // This is complex: requires finding the row of bookId, then using `spreadsheets.batchUpdate` with a `deleteDimension` request
    return Promise.resolve();
};

// --- MEMBERS API ---
export const getMembers = async (sheetId: string): Promise<Member[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Members!A2:F',
    });
    return parseMembers(response.result.values || []);
};
export const addMember = async (sheetId: string, memberData: Omit<Member, 'id'>): Promise<any> => {
    const newId = generateId();
    const newRow = [
        newId,
        memberData.name,
        memberData.email,
        memberData.phone,
        memberData.role,
        memberData.status,
    ];
    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Members!A:F',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [newRow],
        },
    });
};
export const updateMember = async (sheetId: string, memberId: string, updates: Partial<Member>): Promise<any> => {
    console.log("TODO: Implement updateMember", { sheetId, memberId, updates });
    return Promise.resolve();
};
export const deleteMember = async (sheetId: string, memberId: string): Promise<any> => {
    console.log("TODO: Implement deleteMember", { sheetId, memberId });
    return Promise.resolve();
};

// --- LOANS API ---
export const getLoans = async (sheetId: string): Promise<Loan[]> => {
    const response = await getSheetsApi().spreadsheets.values.get({
        spreadsheetId: sheetId,
        range: 'Loans!A2:G',
    });
    return parseLoans(response.result.values || []);
};
export const addLoan = async (sheetId: string, loanData: { bookId: string; memberId: string }): Promise<any> => {
    const newId = generateId();
    const loanDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(loanDate.getDate() + 14); // 2 week loan period

    const newRow = [
        newId,
        loanData.bookId,
        loanData.memberId,
        loanDate.toISOString(),
        dueDate.toISOString(),
        null, // Return date is null
        'On Loan',
    ];

    // TODO: This should be a transactional update. After adding the loan,
    // we must find the corresponding book in the 'Books' sheet and decrement
    // its 'availableCopies' count. This is complex to do robustly on the client-side.
    
    return getSheetsApi().spreadsheets.values.append({
        spreadsheetId: sheetId,
        range: 'Loans!A:G',
        valueInputOption: 'USER_ENTERED',
        resource: {
            values: [newRow],
        },
    });
};
export const returnLoan = async (sheetId: string, loanId: string): Promise<any> => {
    console.log("TODO: Implement returnLoan", { sheetId, loanId });
    // This would also require updating the availableCopies count in the Books sheet.
    return Promise.resolve();
};