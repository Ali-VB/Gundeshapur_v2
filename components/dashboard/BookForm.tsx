import React, { useState } from 'react';
import { useTranslation } from '../../index';
import { Book } from '../../types';
import { Input } from '../common/Input';

export const BookForm: React.FC<{ book?: Book, onSave: (bookData: any) => void, onCancel: () => void }> = ({ book, onSave, onCancel }) => {
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
                <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-lg bg-slate-600 hover:bg-slate-500 transition font-semibold">{t('cancel')}</button>
                <button type="submit" className="px-5 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition font-semibold">{t('save')}</button>
             </div>
        </form>
    );
}
