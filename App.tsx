
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth, useTranslation, useToast } from './index';
import { User, Book, Member, Loan, Locale } from './types';
import { db } from './constants';

// --- SHARED UI & ICONS ---

const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARgAAAEZCAYAAACwBC/lAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAs1SURBVHhe7d3PcyJJEAbgPz17aU/XlI9gL2k3spsEgoIYC87M4z8D7O6bC4jI7r738PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw8PDw/axpAIwJkZGVzaGFwdXJodHRwczovL2ltYWdlcy5jYWZldC5rZC9nZXRfY29udGVudC5waHA/c291cmNlPXZhbGlkX2ltYWdlcyZpbWc9aW1hZ2VzLzgzMDk1ZDVhLTEyOGUtNGM4ZC1iZjQ5LWEzYWYzZDhkODk2NS5wbmcAAA==";

const Logo = ({ className = "h-12" }: { className?: string }) => (
    <img src={LOGO_BASE64} alt="Gundeshapur Logo" className={className} />
);

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-cyan-500"></div>
  </div>
);

const GlobeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.874 6 7.5 6h5c.626 0 .988-.27 1.256-.679a6.013 6.013 0 011.912 2.706C15.27 8.93 15 9.5 15 10v1c0 .5.27 1.07.668 1.973a6.01 6.01 0 01-1.912 2.706C13.488 14.27 13.126 14 12.5 14h-5c-.626 0-.988.27-1.256.679a6.013 6.013 0 01-1.912-2.706A6.002 6.002 0 015 11v-1c0-.5-.27-1.07-.668-1.973z" clipRule="evenodd" /></svg>;
const CheckCircleIcon = () => <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>;


// --- NOTIFICATION/TOAST COMPONENTS ---

const Toast: React.FC<{ message: string; type: 'success' | 'error'; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`relative rounded-md shadow-lg text-white text-sm font-semibold py-3 px-4 ${bgColor}`}>
            {message}
            <button onClick={onDismiss} className="absolute top-0 right-0 p-1.5 text-lg leading-none">&times;</button>
        </div>
    );
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();
    return (
        <div className="fixed top-5 right-5 z-50 space-y-2">
            {toasts.map(toast => (
                <Toast key={toast.id} {...toast} onDismiss={() => removeToast(toast.id)} />
            ))}
        </div>
    );
};


// --- GENERIC COMPONENTS (MODAL, FORMS) ---

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-40 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-slate-800 rounded-xl shadow-xl w-full max-w-lg border border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-slate-700">
                    <h3 className="text-xl font-bold text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
};

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
);

const Select = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select {...props} className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500" />
);

// --- LAYOUT ---

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const { locale, setLanguage, t } = useTranslation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeLanguage = (lang: Locale) => {
    setLanguage(lang);
    setDropdownOpen(false);
  };

  const libraryName = user?.plan === 'enterprise' && user?.libraryName ? user.libraryName : null;

  return (
    <div className="min-h-screen flex flex-col">
      <ToastContainer />
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-30">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Logo className="h-10"/>
              {libraryName && <span className="text-xl font-bold text-slate-300 hidden sm:block">{libraryName}</span>}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-300 hidden sm:block">{user?.email}</span>
              <div className="relative" ref={dropdownRef}>
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="p-2 rounded-full hover:bg-slate-700">
                      <GlobeIcon />
                  </button>
                  {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-md shadow-lg z-40">
                          <button onClick={() => changeLanguage('en')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'en' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>English</button>
                          <button onClick={() => changeLanguage('es')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'es' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Español</button>
                          <button onClick={() => changeLanguage('fr')} className={`block w-full text-left px-4 py-2 text-sm ${locale === 'fr' ? 'bg-cyan-600' : 'hover:bg-slate-700'}`}>Français</button>
                      </div>
                  )}
              </div>
              <button
                onClick={signOut}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-red-500 transition"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </nav>
      </header>
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};


// --- PAGE COMPONENTS ---

const AdminPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            const userList = await db.getAllUsers() as User[];
            setUsers(userList);
            setLoading(false);
        };
        fetchUsers();
    }, []);

    const PlanBadge = ({ plan }: { plan: string }) => {
        const colors: { [key: string]: string } = {
            free: 'bg-gray-500 text-gray-100',
            pro: 'bg-cyan-500 text-cyan-900',
            enterprise: 'bg-indigo-500 text-indigo-100',
        };
        const color = colors[plan] || colors.free;
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${color}`}>{plan.toUpperCase()}</span>;
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h1 className="text-2xl font-bold text-slate-100 mb-4">{t('adminTitle')}</h1>
            {loading ? <p>{t('loading')}...</p> : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-700">
                        <thead className="bg-slate-800">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminDisplayName')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminEmail')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminPlan')}</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('adminStatus')}</th>
                            </tr>
                        </thead>
                        <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                            {users.map(user => (
                                <tr key={user.uid}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{user.displayName}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{user.email}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><PlanBadge plan={user.plan} /></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 capitalize">{user.subscriptionStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

const SetupPage = () => {
    const { updateSheetId } = useAuth();
    const { t } = useTranslation();
    const [sheetIdInput, setSheetIdInput] = useState('');

    const handleCreateSheet = async () => {
        const newSheetId = "mock_new_" + Date.now();
        await updateSheetId(newSheetId);
    };

    const handleConnectSheet = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sheetIdInput.trim()) return;
        await updateSheetId(sheetIdInput.trim());
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-100 mb-2">{t('setupTitle')}</h1>
            <p className="text-slate-400 mb-8">{t('setupSubtitle')}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-cyan-300 mb-3">{t('setupOpt1Title')}</h2>
                    <p className="text-slate-400 flex-grow mb-6">{t('setupOpt1Desc')}</p>
                    <button onClick={handleCreateSheet} className="w-full px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition">
                        {t('setupOpt1Button')}
                    </button>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col">
                    <h2 className="text-xl font-bold text-cyan-300 mb-3">{t('setupOpt2Title')}</h2>
                    <p className="text-slate-400 flex-grow mb-6">{t('setupOpt2Desc')}</p>
                    <form onSubmit={handleConnectSheet} className="flex items-center gap-2">
                        <Input type="text" value={sheetIdInput} onChange={(e) => setSheetIdInput(e.target.value)} placeholder={t('setupOpt2Placeholder')} />
                        <button type="submit" className="px-4 py-2 font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition flex-shrink-0">
                            {t('setupOpt2Button')}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};


// --- CRUD IMPLEMENTATIONS ---

const BookForm: React.FC<{ book?: Book, onSave: (bookData: any) => void, onCancel: () => void }> = ({ book, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        title: book?.title || '', author: book?.author || '', year: book?.year || new Date().getFullYear(),
        isbn: book?.isbn || '', publisher: book?.publisher || '', language: book?.language || 'English',
        ddc: book?.ddc || '', tags: book?.tags?.join(', ') || '', totalCopies: book?.totalCopies || 1,
    });
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const bookData = { ...formData, tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean) };
        onSave(bookData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input name="title" placeholder={t('bookTitle')} value={formData.title} onChange={handleChange} required />
                <Input name="author" placeholder={t('bookAuthor')} value={formData.author} onChange={handleChange} required />
                <Input name="year" type="number" placeholder={t('bookYear')} value={formData.year} onChange={handleChange} required />
                <Input name="isbn" placeholder={t('bookISBN')} value={formData.isbn} onChange={handleChange} />
                <Input name="publisher" placeholder={t('bookPublisher')} value={formData.publisher} onChange={handleChange} />
                <Input name="language" placeholder={t('bookLanguage')} value={formData.language} onChange={handleChange} />
                <Input name="ddc" placeholder={t('bookDDC')} value={formData.ddc} onChange={handleChange} />
                <Input name="totalCopies" type="number" placeholder={t('bookTotalCopies')} value={formData.totalCopies} onChange={handleChange} required min="1" />
            </div>
             <Input name="tags" placeholder={t('bookTags')} value={formData.tags} onChange={handleChange} />
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 transition">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition">{t('save')}</button>
             </div>
        </form>
    );
}

const BooksView: React.FC<{ books: Book[]; onUpdate: () => void }> = ({ books, onUpdate }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
    const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

    const filteredBooks = useMemo(() => books.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase()) || 
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.includes(search)
    ), [books, search]);

    const handleSaveBook = async (bookData: any) => {
        if (editingBook) {
            await db.updateBook(editingBook.id, bookData);
            showToast(t('toastBookUpdated'));
        } else {
            const newBook = { ...bookData, availableCopies: bookData.totalCopies };
            await db.addBook(newBook);
            showToast(t('toastBookAdded'));
        }
        closeModal();
        onUpdate();
    };

    const handleDeleteBook = async () => {
        if (!deletingBookId) return;
        await db.deleteBook(deletingBookId);
        showToast(t('toastBookDeleted'));
        setDeletingBookId(null);
        onUpdate();
    };
    
    const openModal = (book?: Book) => {
        setEditingBook(book);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBook(undefined);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <Input type="text" placeholder={t('searchBooks')} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:max-w-xs" />
                <button onClick={() => openModal()} className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition">{t('addBook')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('bookTitle')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">{t('bookAuthor')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden lg:table-cell">{t('bookISBN')}</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-slate-300 uppercase tracking-wider">{t('bookAvailableCopies')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredBooks.map(book => (
                            <tr key={book.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{book.title}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 hidden md:table-cell">{book.author}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 hidden lg:table-cell">{book.isbn}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-center text-slate-300">{book.availableCopies} / {book.totalCopies}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => openModal(book)} className="text-cyan-400 hover:text-cyan-300 transition">{t('edit')}</button>
                                    <button onClick={() => setDeletingBookId(book.id)} className="text-red-500 hover:text-red-400 transition">{t('delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBook ? t('editBook') : t('addBook')}>
                <BookForm book={editingBook} onSave={handleSaveBook} onCancel={closeModal} />
            </Modal>
            <Modal isOpen={!!deletingBookId} onClose={() => setDeletingBookId(null)} title={t('delete') + ' Book'}>
                <p className="mb-6">{t('areYouSure')}?</p>
                <div className="flex justify-end gap-3">
                     <button onClick={() => setDeletingBookId(null)} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 transition">{t('cancel')}</button>
                     <button onClick={handleDeleteBook} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};

const MemberForm: React.FC<{ member?: Member; onSave: (memberData: any) => void; onCancel: () => void; }> = ({ member, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState({
        name: member?.name || '', email: member?.email || '', phone: member?.phone || '',
        role: member?.role || 'Member', status: member?.status || 'Active',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Input name="name" placeholder={t('memberName')} value={formData.name} onChange={handleChange} required />
            <Input name="email" type="email" placeholder={t('memberEmail')} value={formData.email} onChange={handleChange} required />
            <Input name="phone" placeholder={t('memberPhone')} value={formData.phone} onChange={handleChange} />
            <div className="grid grid-cols-2 gap-4">
                <Select name="role" value={formData.role} onChange={handleChange}>
                    <option>Member</option>
                    <option>Librarian</option>
                </Select>
                <Select name="status" value={formData.status} onChange={handleChange}>
                    <option>Active</option>
                    <option>Inactive</option>
                </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 transition">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition">{t('save')}</button>
            </div>
        </form>
    );
};


const MembersView: React.FC<{ members: Member[]; onUpdate: () => void }> = ({ members, onUpdate }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | undefined>(undefined);
    const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

    const filteredMembers = useMemo(() => members.filter(m =>
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.email.toLowerCase().includes(search.toLowerCase())
    ), [members, search]);

    const handleSaveMember = async (memberData: any) => {
        if (editingMember) {
            await db.updateMember(editingMember.id, memberData);
            showToast(t('toastMemberUpdated'));
        } else {
            await db.addMember(memberData);
            showToast(t('toastMemberAdded'));
        }
        closeModal();
        onUpdate();
    };

    const handleDeleteMember = async () => {
        if (!deletingMemberId) return;
        await db.deleteMember(deletingMemberId);
        showToast(t('toastMemberDeleted'));
        setDeletingMemberId(null);
        onUpdate();
    };

    const openModal = (member?: Member) => {
        setEditingMember(member);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingMember(undefined);
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <Input type="text" placeholder={t('searchMembers')} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:max-w-xs" />
                <button onClick={() => openModal()} className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition">{t('addMember')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('memberName')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">{t('memberEmail')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden lg:table-cell">{t('memberRole')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('memberStatus')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredMembers.map(member => (
                            <tr key={member.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{member.name}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 hidden md:table-cell">{member.email}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 hidden lg:table-cell">{member.role}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm">
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${member.status === 'Active' ? 'bg-green-500 text-green-900' : 'bg-gray-500 text-gray-100'}`}>{member.status}</span>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                    <button onClick={() => openModal(member)} className="text-cyan-400 hover:text-cyan-300 transition">{t('edit')}</button>
                                    <button onClick={() => setDeletingMemberId(member.id)} className="text-red-500 hover:text-red-400 transition">{t('delete')}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingMember ? t('editMember') : t('addMember')}>
                <MemberForm member={editingMember} onSave={handleSaveMember} onCancel={closeModal} />
            </Modal>
            <Modal isOpen={!!deletingMemberId} onClose={() => setDeletingMemberId(null)} title={t('delete') + ' Member'}>
                <p className="mb-6">{t('areYouSure')}?</p>
                <div className="flex justify-end gap-3">
                     <button onClick={() => setDeletingMemberId(null)} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 transition">{t('cancel')}</button>
                     <button onClick={handleDeleteMember} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 transition">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};

const LoanForm: React.FC<{ books: Book[]; members: Member[]; onSave: (loanData: { bookId: string; memberId: string; }) => void; onCancel: () => void; }> = ({ books, members, onSave, onCancel }) => {
    const { t } = useTranslation();
    const [bookId, setBookId] = useState('');
    const [memberId, setMemberId] = useState('');

    const availableBooks = books.filter(b => b.availableCopies > 0);
    const activeMembers = members.filter(m => m.status === 'Active');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!bookId || !memberId) return;
        onSave({ bookId, memberId });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={bookId} onChange={e => setBookId(e.target.value)} required>
                <option value="">{t('selectBook')}</option>
                {availableBooks.map(b => <option key={b.id} value={b.id}>{b.title} ({b.author})</option>)}
            </Select>
            <Select value={memberId} onChange={e => setMemberId(e.target.value)} required>
                <option value="">{t('selectMember')}</option>
                {activeMembers.map(m => <option key={m.id} value={m.id}>{m.name} ({m.email})</option>)}
            </Select>
             <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-500 transition">{t('cancel')}</button>
                <button type="submit" className="px-4 py-2 rounded-md bg-cyan-600 hover:bg-cyan-700 transition">{t('save')}</button>
             </div>
        </form>
    );
};

const LoansView: React.FC<{ loans: Loan[]; books: Book[]; members: Member[]; onUpdate: () => void }> = ({ loans, books, members, onUpdate }) => {
    const { t, locale } = useTranslation();
    const { showToast } = useToast();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const bookMap = useMemo(() => new Map(books.map(b => [b.id, b])), [books]);
    const memberMap = useMemo(() => new Map(members.map(m => [m.id, m])), [members]);

    const filteredLoans = useMemo(() => loans.filter(l => {
        const book = bookMap.get(l.bookId);
        const member = memberMap.get(l.memberId);
        const searchTerm = search.toLowerCase();
        return (book?.title.toLowerCase().includes(searchTerm) || member?.name.toLowerCase().includes(searchTerm));
    }), [loans, search, bookMap, memberMap]);

    const handleSaveLoan = async (loanData: { bookId: string; memberId: string; }) => {
        await db.addLoan(loanData);
        showToast(t('toastLoanAdded'));
        setIsModalOpen(false);
        onUpdate();
    };

    const handleReturnLoan = async (loanId: string) => {
        await db.returnLoan(loanId);
        showToast(t('toastLoanReturned'));
        onUpdate();
    };

    const StatusBadge = ({ status }: { status: Loan['status'] }) => {
        const colors = {
            'On Loan': 'bg-blue-500 text-blue-100',
            'Overdue': 'bg-yellow-500 text-yellow-900',
            'Returned': 'bg-green-500 text-green-100',
        };
        return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colors[status]}`}>{status}</span>;
    };
    
    const formatDate = (isoString: string) => {
        return new Date(isoString).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                <Input type="text" placeholder={t('searchLoans')} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:max-w-xs" />
                <button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto px-4 py-2 font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition">{t('lendBook')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanBookTitle')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">{t('loanMemberName')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden lg:table-cell">{t('loanDueDate')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanStatus')}</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredLoans.map(loan => (
                            <tr key={loan.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{bookMap.get(loan.bookId)?.title || 'N/A'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 hidden md:table-cell">{memberMap.get(loan.memberId)?.name || 'N/A'}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-400 hidden lg:table-cell">{formatDate(loan.dueDate)}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm"><StatusBadge status={loan.status} /></td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {loan.status !== 'Returned' && (
                                        <button onClick={() => handleReturnLoan(loan.id)} className="text-cyan-400 hover:text-cyan-300 transition">{t('returnLoan')}</button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={t('lendBook')}>
                <LoanForm books={books} members={members} onSave={handleSaveLoan} onCancel={() => setIsModalOpen(false)} />
            </Modal>
        </div>
    );
};


const SettingsPage = () => {
    const { user, updateSubscription } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    
    const handleUpgrade = async (plan: 'free' | 'pro' | 'enterprise') => {
        await updateSubscription(plan);
        showToast(`Successfully changed plan to ${plan}!`, 'success');
    }

    const PricingCard = ({ plan, title, price, features, recommended = false }: {plan: 'free' | 'pro' | 'enterprise', title: string, price: string, features: string[], recommended?: boolean}) => (
        <div className={`border rounded-xl p-6 flex flex-col ${recommended ? 'border-cyan-500 bg-slate-800' : 'border-slate-700 bg-slate-800/50'}`}>
            {recommended && <span className="text-xs font-bold uppercase text-cyan-400 mb-2 text-center">{t('recommended')}</span>}
            <h3 className="text-2xl font-bold text-center text-white">{title}</h3>
            <p className="text-4xl font-extrabold text-center my-4 text-white">{price}<span className="text-base font-normal text-slate-400">/mo</span></p>
            <ul className="space-y-3 text-slate-300 mb-6 flex-grow">
                {features.map(f => <li key={f} className="flex items-center gap-3"><svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>{f}</li>)}
            </ul>
            {user?.plan === plan ? (
                <button disabled className="w-full py-2 font-semibold text-center rounded-md bg-slate-600 text-slate-400 cursor-not-allowed">{t('currentPlan')}</button>
            ) : (
                <button onClick={() => handleUpgrade(plan)} className="w-full py-2 font-semibold text-center rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition">
                    {user?.plan === 'free' ? t('upgrade') : (plan === 'enterprise' ? t('upgrade') : t('downgrade'))}
                </button>
            )}
        </div>
    );

    return (
        <div>
            <h2 className="text-3xl font-bold text-slate-100 mb-2">{t('billingTitle')}</h2>
            <p className="text-slate-400 mb-8">{t('billingSubtitle')}</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <PricingCard plan="free" title={t('planFree')} price="$0" features={["Up to 100 books", "Up to 25 members", "Basic support"]} />
                <PricingCard plan="pro" title={t('planPro')} price="$15" features={["Unlimited books & members", "JSON Backup & Restore", "Multi-language support", "Priority email support"]} recommended />
                <PricingCard plan="enterprise" title={t('planEnterprise')} price="$40" features={["All Pro features", "CSV/Excel Export", "Custom Branding", "Dedicated support"]} />
            </div>
        </div>
    );
};


const DashboardPage = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('books');
    const [books, setBooks] = useState<Book[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const fetchData = async () => {
        setLoadingData(true);
        const [booksData, membersData, loansData] = await Promise.all([
            db.getBooks() as Promise<Book[]>,
            db.getMembers() as Promise<Member[]>,
            db.getLoans() as Promise<Loan[]>,
        ]);
        setBooks(booksData);
        setMembers(membersData);
        setLoans(loansData);
        setLoadingData(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExport = () => {
        showToast("Export started! Your data will be available shortly.", "success");
    };

    const UpgradeBanner = () => (
        <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg p-4 mb-8 flex items-center justify-between text-white flex-col sm:flex-row gap-4 text-center sm:text-left">
            <p><span className="font-bold">{t('upgradeBannerTitle')}</span> {t('upgradeBannerSubtitle')}</p>
            <button onClick={() => setActiveTab('billing')} className="bg-white text-cyan-600 font-bold py-2 px-4 rounded-md hover:bg-slate-100 transition whitespace-nowrap">{t('upgradeBannerButton')}</button>
        </div>
    );

    const isPro = user?.plan === 'pro' || user?.plan === 'enterprise';
    const isEnterprise = user?.plan === 'enterprise';
    
    const renderContent = () => {
        if(loadingData) return <div className="text-center p-8">{t('loading')}...</div>
        switch(activeTab) {
            case 'books': return <BooksView books={books} onUpdate={fetchData} />;
            case 'members': return <MembersView members={members} onUpdate={fetchData} />;
            case 'loans': return <LoansView loans={loans} books={books} members={members} onUpdate={fetchData} />;
            case 'billing': return <SettingsPage />;
            default: return null;
        }
    };

    return (
        <div>
            {user?.plan === 'free' && <UpgradeBanner />}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-100">{t('dashboardTitle')}</h1>
                <div className="flex gap-2">
                    <button disabled={!isPro} className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                        {isPro ? t('backupButtonPro') : t('backupButton')}
                    </button>
                    <button onClick={handleExport} disabled={!isEnterprise} className="px-4 py-2 text-sm font-semibold bg-slate-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition">
                         {isEnterprise ? t('exportButtonEnt') : t('exportButton')}
                    </button>
                </div>
            </div>
            
            <div className="border-b border-slate-700 mb-6">
                <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
                    {[t('tabBooks'), t('tabMembers'), t('tabLoans'), t('tabBilling')].map(tabName => {
                        const tabId = (tabName === t('tabBooks')) ? 'books' : (tabName === t('tabMembers')) ? 'members' : (tabName === t('tabLoans')) ? 'loans' : 'billing';
                        return (
                             <button key={tabId} onClick={() => setActiveTab(tabId)} className={`${activeTab === tabId ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-500'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}>
                                {tabName}
                            </button>
                        )
                    })}
                </nav>
            </div>
            
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 sm:p-6 min-h-[400px]">
                {renderContent()}
            </div>
        </div>
    );
};

// --- LANDING PAGE ---
const LandingPage = () => {
    const { signIn } = useAuth();
    
    return (
        <div className="bg-slate-900 text-slate-200">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-slate-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
                     <Logo />
                    <button onClick={signIn} className="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-700 transition">
                        Start for Free
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="pt-32 pb-20 text-center bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-100 leading-tight">
                            Simple, Powerful Library Management
                        </h1>
                        <p className="max-w-2xl mx-auto mt-6 text-lg text-slate-400">
                            Gundeshapur helps small libraries, clubs, and communities manage their books and members with an easy-to-use, affordable platform.
                        </p>
                        <button onClick={signIn} className="mt-8 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:opacity-90 transition-opacity">
                            Start for Free Today
                        </button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-20 bg-slate-900/50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">Everything You Need to Get Started</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-2">Book Management</h3>
                                <p className="text-slate-400">Easily add, edit, and track your entire collection, complete with Dewey Decimal support.</p>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-2">Member Tracking</h3>
                                <p className="text-slate-400">Manage member information, roles, and status (active/inactive) in one place.</p>
                            </div>
                             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-2">Google Sheets Integration</h3>
                                <p className="text-slate-400">Connect your own Google Sheet or let us create one for you. Manage data in a familiar environment.</p>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-2">Effortless Loans</h3>
                                <p className="text-slate-400">Lend and return books with a simple interface. Automatically tracks due dates and availability.</p>
                            </div>
                            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-2">Secure Backups</h3>
                                <p className="text-slate-400">Pro and Enterprise users get automated data backups to secure cloud storage.</p>
                            </div>
                             <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-2">Multi-Language</h3>
                                <p className="text-slate-400">Serve your diverse community with an interface available in English, Spanish, and French.</p>
                            </div>
                        </div>
                    </div>
                </section>

                 {/* Pricing Section */}
                <section id="pricing" className="py-20">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">Choose Your Plan</h2>
                        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-6 flex flex-col">
                                <h3 className="text-2xl font-bold text-center text-white">Free</h3>
                                <p className="text-4xl font-extrabold text-center my-4 text-white">$0</p>
                                <ul className="space-y-3 text-slate-300 mb-6 flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Up to 100 books</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Up to 25 members</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Basic support</li>
                                </ul>
                                <button onClick={signIn} className="w-full py-2 font-semibold text-center rounded-md bg-slate-600 text-white hover:bg-slate-500 transition">Start for Free</button>
                            </div>
                             <div className="border-2 border-cyan-500 bg-slate-800 rounded-xl p-6 flex flex-col relative">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</span>
                                <h3 className="text-2xl font-bold text-center text-white">Pro</h3>
                                <p className="text-4xl font-extrabold text-center my-4 text-white">$15<span className="text-base font-normal text-slate-400">/mo</span></p>
                                <ul className="space-y-3 text-slate-300 mb-6 flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Unlimited books & members</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> JSON Backup & Restore</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Multi-language support</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Priority email support</li>
                                </ul>
                                <button onClick={signIn} className="w-full py-2 font-semibold text-center rounded-md bg-cyan-600 text-white hover:bg-cyan-700 transition">Start Pro Plan</button>
                            </div>
                            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-6 flex flex-col">
                                <h3 className="text-2xl font-bold text-center text-white">Enterprise</h3>
                                <p className="text-4xl font-extrabold text-center my-4 text-white">$40<span className="text-base font-normal text-slate-400">/mo</span></p>
                                <ul className="space-y-3 text-slate-300 mb-6 flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> All Pro features</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> CSV/Excel Export</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Custom Branding</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Dedicated support</li>
                                </ul>
                                <button onClick={signIn} className="w-full py-2 font-semibold text-center rounded-md bg-slate-600 text-white hover:bg-slate-500 transition">Contact Us</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

             {/* Footer */}
            <footer className="border-t border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-slate-500">
                    &copy; {new Date().getFullYear()} Gundeshapur. All rights reserved.
                </div>
            </footer>
        </div>
    );
};


// --- MAIN APP (ROUTER) ---

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LandingPage />;
  }
  
  const AppContent = () => {
      if (user.role === 'admin') {
          return <AdminPage />;
      }
      if (!user.sheetId) {
          return <SetupPage />;
      }
      return <DashboardPage />;
  }

  return (
    <Layout>
      <AppContent />
    </Layout>
  );
}

export default App;