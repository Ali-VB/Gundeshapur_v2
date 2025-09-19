
import React from 'react';

export const Logo = ({ className = "h-12 w-auto" }: { className?: string }) => (
    <div className="flex items-center gap-3" title="Gundeshapur">
        <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M40 44H8V24C8 15.1634 15.1634 8 24 8C32.8366 8 40 15.1634 40 24V44Z" fill="#475569"/>
            <path d="M34 44H14V24C14 18.4772 18.4772 14 24 14C29.5228 14 34 18.4772 34 24V44Z" fill="#94a3b8"/>
            <path d="M28 44H20V24C20 21.7909 21.7909 20 24 20C26.2091 20 28 21.7909 28 24V44Z" fill="#e2e8f0"/>
        </svg>
         <span className="text-2xl font-bold hidden sm:inline text-slate-200 font-logo">Gundeshapur</span>
    </div>
);