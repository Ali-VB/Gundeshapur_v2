
import React from 'react';
import { useAuth } from '../../index';
import { Logo } from '../common/Logo';
import { CheckCircleIcon } from '../common/Icons';

export const LandingPage = () => {
    const { signIn } = useAuth();
    
    return (
        <div className="bg-slate-900 text-slate-200">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-30 bg-slate-900/80 backdrop-blur-sm">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-20">
                     <Logo />
                    <button onClick={signIn} className="px-5 py-2.5 text-base font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition">
                        Start for Free
                    </button>
                </div>
            </header>

            <main>
                {/* Hero Section */}
                <section className="pt-40 pb-24 text-center bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h1 className="text-5xl sm:text-7xl font-extrabold text-slate-100 leading-tight">
                            Simple, Powerful Library Management
                        </h1>
                        <p className="max-w-3xl mx-auto mt-8 text-xl text-slate-400">
                           Gundeshapur helps small libraries, clubs, and communities manage their books and members with an easy-to-use, affordable platform powered by Google Sheets.
                        </p>
                        <button onClick={signIn} className="mt-10 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:opacity-90 transition-opacity">
                            Start for Free Today
                        </button>
                    </div>
                </section>

                {/* Features Section */}
                <section className="py-24 bg-slate-900/50">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-center text-slate-100 mb-16">A Modern Toolkit for Your Community Library</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">Book Management</h3>
                                <p className="text-slate-400 text-base">Easily add, edit, and track your entire collection, complete with Dewey Decimal support.</p>
                            </div>
                            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">Member Tracking</h3>
                                <p className="text-slate-400 text-base">Manage member information, roles, and status (active/inactive) in one place.</p>
                            </div>
                             <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">Google Sheets Integration</h3>
                                <p className="text-slate-400 text-base">Connect your own Google Sheet or let us create one for you. Manage data in a familiar environment.</p>
                            </div>
                            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">Effortless Loans</h3>
                                <p className="text-slate-400 text-base">Lend and return books with a simple interface. Automatically tracks due dates and availability.</p>
                            </div>
                            <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">Secure Backups</h3>
                                <p className="text-slate-400 text-base">Pro and Enterprise users get automated data backups to secure cloud storage.</p>
                            </div>
                             <div className="bg-slate-800 p-8 rounded-lg border border-slate-700">
                                <h3 className="text-xl font-bold text-cyan-300 mb-3">Multi-Language</h3>
                                <p className="text-slate-400 text-base">Serve your diverse community with an interface available in English, Spanish, and French.</p>
                            </div>
                        </div>
                    </div>
                </section>

                 {/* Pricing Section */}
                <section id="pricing" className="py-24">
                     <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl font-bold text-center text-slate-100 mb-16">Choose Your Plan</h2>
                        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                             <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-8 flex flex-col">
                                <h3 className="text-2xl font-bold text-center text-white">Free</h3>
                                <p className="text-5xl font-extrabold text-center my-6 text-white">$0</p>
                                <ul className="space-y-4 text-slate-300 mb-8 flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Up to 100 books</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Up to 25 members</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Basic support</li>
                                </ul>
                                <button onClick={signIn} className="w-full py-3 font-semibold text-center rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition">Start for Free</button>
                            </div>
                             <div className="border-2 border-cyan-500 bg-slate-800 rounded-xl p-8 flex flex-col relative">
                                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-slate-900 text-xs font-bold px-3 py-1 rounded-full">RECOMMENDED</span>
                                <h3 className="text-2xl font-bold text-center text-white">Pro</h3>
                                <p className="text-5xl font-extrabold text-center my-6 text-white">$15<span className="text-base font-normal text-slate-400">/mo</span></p>
                                <ul className="space-y-4 text-slate-300 mb-8 flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Unlimited books & members</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> JSON Backup & Restore</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Multi-language support</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Priority email support</li>
                                </ul>
                                <button onClick={signIn} className="w-full py-3 font-semibold text-center rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition">Start Pro Plan</button>
                            </div>
                            <div className="border border-slate-700 bg-slate-800/50 rounded-xl p-8 flex flex-col">
                                <h3 className="text-2xl font-bold text-center text-white">Enterprise</h3>
                                <p className="text-5xl font-extrabold text-center my-6 text-white">$40<span className="text-base font-normal text-slate-400">/mo</span></p>
                                <ul className="space-y-4 text-slate-300 mb-8 flex-grow">
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> All Pro features</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> CSV/Excel Export</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Custom Branding</li>
                                    <li className="flex items-center gap-3"><CheckCircleIcon /> Dedicated support</li>
                                </ul>
                                <button onClick={signIn} className="w-full py-3 font-semibold text-center rounded-lg bg-slate-600 text-white hover:bg-slate-500 transition">Contact Us</button>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

             {/* Footer */}
            <footer className="border-t border-slate-800">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center text-slate-500">
                    &copy; {new Date().getFullYear()} Gundeshapur. All rights reserved.
                </div>
            </footer>
        </div>
    );
};