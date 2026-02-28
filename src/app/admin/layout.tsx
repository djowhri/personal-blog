
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaGauge, FaFilePen, FaComments, FaFolder, FaTags, FaRightFromBracket } from 'react-icons/fa6';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const menuItems = [
    { name: '仪表盘', icon: <FaGauge />, href: '/admin' },
    { name: '文章管理', icon: <FaFilePen />, href: '/admin/articles' },
    { name: '分类管理', icon: <FaFolder />, href: '/admin/categories' },
    { name: '标签管理', icon: <FaTags />, href: '/admin/tags' },
    { name: '评论管理', icon: <FaComments />, href: '/admin/comments' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 hidden md:flex flex-col fixed h-full z-10">
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <Link href="/" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tighter">
            DevBlog Admin
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className="text-lg mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <FaRightFromBracket className="text-lg mr-3" />
            退出登录
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-4 sm:px-6 lg:px-8">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                {menuItems.find(item => item.href === pathname)?.name || '管理后台'}
            </h1>
            <div className="flex items-center space-x-4">
                <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                    返回首页
                </Link>
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                    A
                </div>
            </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
