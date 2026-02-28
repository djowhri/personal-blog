import React from 'react';
import Link from 'next/link';
import { FaSearch, FaArrowRight, FaCalendar, FaEye } from 'react-icons/fa';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { searchArticles } from '@/app/actions/articles';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const query = (await searchParams).q || '';
  const articles = query ? await searchArticles(query, 20) : [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="pt-24 pb-12 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              搜索结果: "{query}"
            </h1>
            <p className="text-gray-500 dark:text-gray-400">
              找到 {articles.length} 篇相关文章
            </p>
          </div>

          {articles.length > 0 ? (
            <div className="space-y-6">
              {articles.map((article: any) => (
                <div key={article.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition">
                  <Link href={`/article/${article.id}`} className="block group">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                      {article.created_at && (
                        <span className="flex items-center">
                          <FaCalendar className="mr-1" />
                          {new Date(article.created_at).toLocaleDateString()}
                        </span>
                      )}
                      <span className="flex items-center"><FaEye className="mr-1" /> {article.views || 0}</span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center">
              <div className="mx-auto h-16 w-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <FaSearch className="text-2xl text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">未找到相关文章</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                尝试使用不同的关键词，或者查看最新文章。
              </p>
              <Link href="/" className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium transition">
                返回首页 <FaArrowRight className="ml-2" />
              </Link>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </div>
  );
}
