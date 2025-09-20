

import React, { useState, useMemo } from 'react';
import { useTranslation, useToast, useAuth } from '../../index';
import { Book } from '../../types';
import * as libraryApi from '../../libraryApi';
import { Input } from '../common/Input';
import { Modal } from '../common/Modal';
import { BookForm } from './BookForm';
import { useSortableTable } from '../../hooks/useSortableTable';
import { SortIcon } from '../common/Icons';

export const BooksView: React.FC<{ books: Book[]; onUpdate: () => void }> = ({ books, onUpdate }) => {
    const { t } = useTranslation();
    const { showToast } = useToast();
    const { user } = useAuth();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
    const [deletingBookId, setDeletingBookId] = useState<string | null>(null);

    const { items: sortedBooks, requestSort, sortConfig } = useSortableTable(books);

    const filteredBooks = useMemo(() => sortedBooks.filter(b => 
        b.title.toLowerCase().includes(search.toLowerCase()) || 
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.includes(search)
    ), [sortedBooks, search]);

    const handleSaveBook = async (bookData: any) => {
        if (!user?.sheetId) return;
        if (editingBook) {
            await libraryApi.updateBook(user.sheetId, editingBook.id, bookData);
            showToast(t('toastBookUpdated'));
        } else {
            const newBook = { ...bookData, availableCopies: bookData.totalCopies };
            await libraryApi.addBook(user.sheetId, newBook);
            showToast(t('toastBookAdded'));
        }
        closeModal();
        onUpdate();
    };

    const handleDeleteBook = async () => {
        if (!deletingBookId || !user?.sheetId) return;
        await libraryApi.deleteBook(user.sheetId, deletingBookId);
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

    const SortableHeader: React.FC<{ children: React.ReactNode, field: keyof Book }> = ({ children, field }) => {
        const isSorted = sortConfig?.key === field;
        return (
             <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                <button className="flex items-center gap-2" onClick={() => requestSort(field)}>
                    {children}
                    <SortIcon direction={isSorted ? sortConfig.direction : undefined} />
                </button>
            </th>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <Input type="text" placeholder={t('searchBooks')} value={search} onChange={e => setSearch(e.target.value)} className="w-full sm:max-w-md" />
                <button onClick={() => openModal()} className="w-full sm:w-auto px-5 py-2.5 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">{t('addBook')}</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800/80">
                        <tr>
                            <SortableHeader field="title">{t('bookTitle')}</SortableHeader>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden md:table-cell">{t('bookAuthor')}</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider hidden lg:table-cell">{t('bookISBN')}</th>
                            <SortableHeader field="availableCopies">{t('bookAvailableCopies')}</SortableHeader>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">{t('loanActions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                        {filteredBooks.map(book => (
                            <tr key={book.id} className="hover:bg-slate-800/50">
                                <td className="px-4 py-4 whitespace-nowrap text-base font-medium text-white">{book.title}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-slate-400 hidden md:table-cell">{book.author}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-slate-400 hidden lg:table-cell">{book.isbn}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-base text-center text-slate-300">{book.availableCopies} / {book.totalCopies}</td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-base font-medium space-x-4">
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
                <p className="mb-6 text-lg">{t('areYouSure')}?</p>
                <div className="flex justify-end gap-3">
                     <button onClick={() => setDeletingBookId(null)} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                     <button onClick={handleDeleteBook} className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 transition font-semibold">{t('delete')}</button>
                </div>
            </Modal>
        </div>
    );
};