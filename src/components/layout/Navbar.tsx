'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaMoon, FaSun, FaSearch } from 'react-icons/fa';
import SearchInput from '../blog/SearchInput';
import { useTheme } from 'next-themes';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';

const supabase = createClient();

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
    
    const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
    });

    return () => {
        subscription.unsubscribe();
    };
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const baseClass = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors";
    const activeClass = "border-indigo-500 dark:border-indigo-400 text-gray-900 dark:text-gray-100";
    const inactiveClass = "border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200";
    
    return `${baseClass} ${isActive ? activeClass : inactiveClass}`;
  };

  return (
    <nav className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md fixed w-full z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                <div className="flex items-center">
                    <Link href="/" className="flex-shrink-0 flex items-center">
                        <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tighter">DevBlog.</span>
                    </Link>
                    <div className="hidden md:ml-10 md:flex md:space-x-8">
                        <Link href="/" className={getLinkClass('/')}>首页</Link>
                        <Link href="/category/60a93114-0703-489a-a764-67d5f0528301" className={getLinkClass('/category/60a93114-0703-489a-a764-67d5f0528301')}>技术文章</Link>
                        <Link href="/category/3c084523-1467-4f1d-97da-0a9c336a994a" className={getLinkClass('/category/3c084523-1467-4f1d-97da-0a9c336a994a')}>生活随笔</Link>
                        
                        {/* Only show "关于我" if user is logged in */}
                        {user && (
                            <Link href="/about" className={getLinkClass('/about')}>关于我</Link>
                        )}
                        
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="hidden md:block">
                        <SearchInput />
                    </div>
                    
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={toggleTheme}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition focus:outline-none"
                        title={resolvedTheme === 'dark' ? "切换到日间模式" : "切换到夜间模式"}
                    >
                        {resolvedTheme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon />}
                    </button>

                    {user ? (
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">{user.email?.split('@')[0]}</span>
                            <button 
                                onClick={async () => {
                                    await supabase.auth.signOut();
                                    window.location.reload();
                                }}
                                className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition shadow-sm"
                            >
                                退出
                            </button>
                        </div>
                    ) : (
                        <Link href="/login" className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600 transition shadow-md">
                            登录
                        </Link>
                    )}
                </div>
            </div>
        </div>
    </nav>
  );
}
