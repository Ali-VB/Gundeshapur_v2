
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../../index';
import { generateText } from '../../geminiApi';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

export const AILibrarianView = () => {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'ai', text: t('aiWelcomeMessage') }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        const aiResponseText = await generateText(input);
        
        const aiMessage: Message = { sender: 'ai', text: aiResponseText };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex-grow overflow-y-auto pr-4 space-y-6">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                        {msg.sender === 'ai' && (
                            <div className="w-8 h-8 rounded-full bg-cyan-600 flex-shrink-0 flex items-center justify-center text-white font-bold">A</div>
                        )}
                        <div className={`p-4 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-slate-700'}`}>
                           <p style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex items-start gap-3">
                         <div className="w-8 h-8 rounded-full bg-cyan-600 flex-shrink-0 flex items-center justify-center text-white font-bold">A</div>
                         <div className="p-4 rounded-lg bg-slate-700">
                             <div className="flex items-center gap-2">
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></div>
                             </div>
                         </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="mt-6">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={t('aiPlaceholder')}
                        className="flex-grow px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading || !input.trim()} className="px-5 py-3 font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 transition disabled:bg-cyan-800 disabled:cursor-not-allowed">
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
};
