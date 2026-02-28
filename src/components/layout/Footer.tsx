import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">DevBlog.</span>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">© 2023 Alex Chen. All rights reserved.</p>
                </div>
                <div className="flex space-x-6">
                    <Link href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">RSS</Link>
                    <Link href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Sitemap</Link>
                    <Link href="#" className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">Privacy</Link>
                </div>
            </div>
        </div>
    </footer>
  );
}
