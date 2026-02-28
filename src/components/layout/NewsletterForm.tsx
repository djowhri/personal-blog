'use client';

import React, { useState } from 'react';
import { subscribeToNewsletter } from '@/app/actions/newsletter';
import { FaSpinner, FaCheck } from 'react-icons/fa6';

export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
        const result = await subscribeToNewsletter(email);
        if (result.error) {
            setStatus('error');
            setMessage(result.error);
        } else {
            setStatus('success');
            setMessage('订阅成功！感谢您的关注。');
            setEmail('');
        }
    } catch (error) {
        setStatus('error');
        setMessage('订阅失败，请稍后重试');
    }
  };

  return (
    <div className="bg-indigo-600 dark:bg-indigo-700 rounded-xl shadow-md p-6 text-white transition-colors duration-300">
        <h3 className="text-lg font-bold mb-2">订阅更新</h3>
        <p className="text-indigo-100 dark:text-indigo-200 text-sm mb-4">每周推送精选技术文章，绝无垃圾邮件。</p>
        
        {status === 'success' ? (
            <div className="bg-white/10 rounded-lg p-4 text-center animate-fade-in">
                <FaCheck className="text-3xl mx-auto mb-2 text-green-300" />
                <p className="font-medium">{message}</p>
                <button 
                    onClick={() => setStatus('idle')} 
                    className="mt-3 text-xs text-indigo-200 hover:text-white underline"
                >
                    订阅另一个邮箱
                </button>
            </div>
        ) : (
            <form className="space-y-2" onSubmit={handleSubmit}>
                <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com" 
                    className="w-full px-4 py-2 rounded-md text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-70"
                    disabled={status === 'loading'}
                    required
                />
                <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className="w-full bg-white text-indigo-600 font-bold py-2 rounded-md text-sm hover:bg-indigo-50 transition disabled:opacity-70 flex items-center justify-center"
                >
                    {status === 'loading' ? <FaSpinner className="animate-spin mr-2" /> : null}
                    {status === 'loading' ? '提交中...' : '订阅'}
                </button>
                {status === 'error' && (
                    <p className="text-xs text-red-300 mt-1">{message}</p>
                )}
            </form>
        )}
    </div>
  );
}
