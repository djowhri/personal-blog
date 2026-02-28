
import React from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/server';
import { FaFilePen, FaComments, FaEye, FaArrowRight } from 'react-icons/fa6';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Fetch statistics
  const { count: articleCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  const { count: commentCount } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true });

  const { data: viewsData } = await supabase
    .from('articles')
    .select('views');

  const totalViews = viewsData?.reduce((acc, curr) => acc + (curr.views || 0), 0) || 0;

  // Fetch recent articles
  const { data: recentArticles } = await supabase
    .from('articles')
    .select('id, title, created_at, views, published')
    .order('created_at', { ascending: false })
    .limit(5);

  const stats = [
    { name: '总文章数', value: articleCount || 0, icon: <FaFilePen />, color: 'bg-blue-500' },
    { name: '总评论数', value: commentCount || 0, icon: <FaComments />, color: 'bg-green-500' },
    { name: '总浏览量', value: totalViews, icon: <FaEye />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 flex items-center">
            <div className={`p-4 rounded-lg text-white ${stat.color} mr-4`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">最新文章</h3>
          <Link href="/admin/articles" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
            查看全部 <FaArrowRight className="ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">标题</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">发布状态</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">浏览量</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">发布时间</th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">操作</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {recentArticles?.map((article) => (
                <tr key={article.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{article.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      article.published 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}>
                      {article.published ? '已发布' : '草稿'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {article.views}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(article.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link href={`/editor?id=${article.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">编辑</Link>
                  </td>
                </tr>
              ))}
              {(!recentArticles || recentArticles.length === 0) && (
                <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">暂无文章</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
