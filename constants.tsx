// This file mocks the Firebase SDK for demonstration purposes.

const SUPER_ADMIN_EMAIL = 'admin@example.com'; // Hardcoded Super Admin

// --- MOCK DATABASE ---
let mockDatabase: { [key: string]: any } = {
  "users/admin_uid": {
    uid: "admin_uid",
    email: SUPER_ADMIN_EMAIL,
    displayName: "Admin User",
    role: "admin",
    sheetId: "admin_sheet_123",
    plan: 'enterprise',
    subscriptionStatus: 'active',
    libraryName: 'ACME Corp Library',
  },
  "users/user_uid": {
    uid: "user_uid",
    email: "user@example.com",
    displayName: "Regular User",
    role: "user",
    sheetId: null, // Give user a null sheetId to show setup page
    plan: 'free',
    subscriptionStatus: 'active',
  },
  "users/pro_user_uid": {
    uid: "pro_user_uid",
    email: "pro@example.com",
    displayName: "Pro User",
    role: "user",
    sheetId: "pro_sheet_456",
    plan: 'pro',
    subscriptionStatus: 'active',
  },
};

// --- MOCK COLLECTIONS FOR LIBRARY ---
let mockBooks = [
    { id: 'book_1', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', year: 1925, isbn: '9780743273565', publisher: 'Charles Scribner\'s Sons', language: 'English', ddc: '813.52', tags: ['Classic', 'Novel'], totalCopies: 3, availableCopies: 2 },
    { id: 'book_2', title: 'Dune', author: 'Frank Herbert', year: 1965, isbn: '9780441013593', publisher: 'Chilton Books', language: 'English', ddc: '813.54', tags: ['Sci-Fi', 'Adventure'], totalCopies: 2, availableCopies: 1 },
    { id: 'book_3', title: '1984', author: 'George Orwell', year: 1949, isbn: '9780451524935', publisher: 'Secker & Warburg', language: 'English', ddc: '823.912', tags: ['Dystopian', 'Political Fiction'], totalCopies: 4, availableCopies: 4 },
];

let mockMembers = [
    { id: 'member_1', name: 'Alice Johnson', email: 'alice@email.com', phone: '123-456-7890', role: 'Member', status: 'Active' },
    { id: 'member_2', name: 'Bob Williams', email: 'bob@email.com', phone: '098-765-4321', role: 'Librarian', status: 'Active' },
    { id: 'member_3', name: 'Charlie Brown', email: 'charlie@email.com', phone: '555-555-5555', role: 'Member', status: 'Inactive' },
];

let mockLoans = [
    { id: 'loan_1', bookId: 'book_1', memberId: 'member_1', loanDate: '2023-10-01T10:00:00Z', dueDate: '2023-10-15T10:00:00Z', returnDate: null, status: 'Overdue' },
    { id: 'loan_2', bookId: 'book_2', memberId: 'member_2', loanDate: new Date().toISOString(), dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), returnDate: null, status: 'On Loan' },
];


const api = (fn: Function) => (...args: any) => new Promise(resolve => setTimeout(() => resolve(fn(...args)), 300 + Math.random() * 300));

const dbMock = {
    // --- USER/AUTH RELATED ---
    doc: (db: any, collection: string, id: string) => ({ path: `${collection}/${id}`, id }),
    getDoc: api((docRef: { path: string }) => {
        const data = mockDatabase[docRef.path];
        return { exists: () => !!data, data: () => data };
    }),
    setDoc: api((docRef: { path: string }, data: any, options?: { merge: boolean }) => {
        const existingData = mockDatabase[docRef.path] || {};
        mockDatabase[docRef.path] = options?.merge ? { ...existingData, ...data } : data;
    }),
    getAllUsers: api(() => Object.keys(mockDatabase).filter(k => k.startsWith('users/')).map(k => mockDatabase[k])),

    // --- BOOKS API ---
    getBooks: api(() => [...mockBooks]),
    addBook: api((bookData: any) => {
        const newBook = { ...bookData, id: `book_${Date.now()}` };
        mockBooks.push(newBook);
        return newBook;
    }),
    updateBook: api((bookId: string, updates: any) => {
        mockBooks = mockBooks.map(b => b.id === bookId ? { ...b, ...updates } : b);
        return mockBooks.find(b => b.id === bookId);
    }),
    deleteBook: api((bookId: string) => {
        mockBooks = mockBooks.filter(b => b.id !== bookId);
        return true;
    }),
    
    // --- MEMBERS API ---
    getMembers: api(() => [...mockMembers]),
    addMember: api((memberData: any) => {
        const newMember = { ...memberData, id: `member_${Date.now()}` };
        mockMembers.push(newMember);
        return newMember;
    }),
    updateMember: api((memberId: string, updates: any) => {
        mockMembers = mockMembers.map(m => m.id === memberId ? { ...m, ...updates } : m);
        return mockMembers.find(m => m.id === memberId);
    }),
    deleteMember: api((memberId: string) => {
        mockMembers = mockMembers.filter(m => m.id !== memberId);
        return true;
    }),

    // --- LOANS API ---
    getLoans: api(() => [...mockLoans]),
    addLoan: api((loanData: { bookId: string, memberId: string }) => {
        const book = mockBooks.find(b => b.id === loanData.bookId);
        if (!book || book.availableCopies <= 0) throw new Error("Book not available");
        
        book.availableCopies -= 1; // Decrement available copies
        
        const loanDate = new Date();
        const dueDate = new Date(loanDate);
        dueDate.setDate(loanDate.getDate() + 14); // 2-week loan period
        
        const newLoan = {
            ...loanData,
            id: `loan_${Date.now()}`,
            loanDate: loanDate.toISOString(),
            dueDate: dueDate.toISOString(),
            returnDate: null,
            status: 'On Loan' as const
        };
        mockLoans.push(newLoan);
        return newLoan;
    }),
    returnLoan: api((loanId: string) => {
        const loan = mockLoans.find(l => l.id === loanId);
        if (!loan) throw new Error("Loan not found");

        const book = mockBooks.find(b => b.id === loan.bookId);
        if (book) {
            book.availableCopies += 1; // Increment available copies
        }
        
        loan.status = 'Returned';
        loan.returnDate = new Date().toISOString();
        return loan;
    }),
};

// --- MOCK AUTH ---
let onAuthStateChangedCallback: ((user: any) => void) | null = null;
let mockCurrentUser: any = null;

const authMock = {
  onAuthStateChanged: (auth: any, callback: (user: any) => void) => {
    onAuthStateChangedCallback = callback;
    setTimeout(() => {
        const storedUser = localStorage.getItem('mockUser');
        if (storedUser) {
            mockCurrentUser = JSON.parse(storedUser);
            onAuthStateChangedCallback?.(mockCurrentUser);
        } else {
            onAuthStateChangedCallback?.(null);
        }
    }, 500);
    return () => { onAuthStateChangedCallback = null };
  },
  signInWithPopup: (auth: any, provider: any) => {
    return new Promise(resolve => setTimeout(() => {
      const email = window.prompt(`Sign in as: (e.g., ${SUPER_ADMIN_EMAIL}, user@example.com, pro@example.com)`, "user@example.com");
      
      let user;
      if (email === SUPER_ADMIN_EMAIL) {
          user = { uid: "admin_uid", email: SUPER_ADMIN_EMAIL, displayName: "Admin User" };
      } else if (email === 'pro@example.com') {
          user = { uid: "pro_user_uid", email: "pro@example.com", displayName: "Pro User" };
      } else {
          user = { uid: "user_uid", email: "user@example.com", displayName: "Regular User" };
      }
      
      mockCurrentUser = user;
      localStorage.setItem('mockUser', JSON.stringify(mockCurrentUser));
      onAuthStateChangedCallback?.(mockCurrentUser);
      resolve({ user: mockCurrentUser });
    }, 800));
  },
  signOut: (auth: any) => {
    return new Promise(resolve => setTimeout(() => {
      mockCurrentUser = null;
      localStorage.removeItem('mockUser');
      onAuthStateChangedCallback?.(null);
      resolve(undefined);
    }, 300));
  },
};

// --- MOCK EXPORTS ---
export const auth = { ...authMock, currentUser: mockCurrentUser };
export const db = { ...dbMock };
export const googleProvider = { providerId: 'google.com' };
export const firebaseApp = {}; // Placeholder for app object
export { SUPER_ADMIN_EMAIL };