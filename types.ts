export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  sheetId: string | null;
  plan: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due';
  libraryName?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  updateSheetId: (sheetId: string) => Promise<void>;
  updateSubscription: (plan: 'free' | 'pro' | 'enterprise') => Promise<void>;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  isbn: string;
  publisher: string;
  language: string;
  ddc: string; // Dewey Decimal Classification
  tags: string[];
  totalCopies: number;
  availableCopies: number;
}

export interface Member {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'Member' | 'Librarian';
    status: 'Active' | 'Inactive';
}

export interface Loan {
    id: string;
    bookId: string;
    memberId: string;
    loanDate: string; // ISO string
    dueDate: string; // ISO string
    returnDate: string | null; // ISO string or null
    status: 'On Loan' | 'Overdue' | 'Returned';
}

// --- I18N & TOAST TYPES ---

export type Locale = 'en' | 'es' | 'fr';

export type Translations = {
  [key in Locale]: { [key: string]: string };
};

export interface LanguageContextType {
  locale: Locale;
  setLanguage: (lang: Locale) => void;
  t: (key: string) => string;
}

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export interface ToastContextType {
  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'error') => void;
  removeToast: (id: number) => void;
}