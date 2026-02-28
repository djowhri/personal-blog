
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Sidebar from '@/components/layout/Sidebar';
import PostCard from '@/components/blog/PostCard';
import { getArticlesByCategory } from '@/app/actions/articles';
import { getCategoryById } from '@/app/actions/categories';
import { createClient } from '@/utils/supabase/server';
import { FaFolderOpen } from 'react-icons/fa6';

export default async function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const category = await getCategoryById(id);
  const { articles } = await getArticlesByCategory(id);
  const supabase = await createClient();

  // 获取作者信息
  const articlesWithAuthor = await Promise.all(articles.map(async (article) => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', article.author_id)
        .single();
      return {
        ...article,
        author: profile
      };
    } catch (error) {
      console.error('Error fetching author profile:', error);
      return article;
    }
  }));

  if (!category) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">分类未找到</h1>
                <p className="text-gray-500 mt-2">该分类可能已被删除。</p>
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Articles */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 border-indigo-500 flex items-center">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full mr-4 text-indigo-600 dark:text-indigo-400">
                        <FaFolderOpen className="text-xl" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">分类: {category.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">共找到 {articles.length} 篇文章</p>
                    </div>
                </div>

                {/* Article Grid */}
                {articlesWithAuthor.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {articlesWithAuthor.map((post: any) => (
                            <PostCard 
                                key={post.id}
                                id={post.id}
                                title={post.title}
                                excerpt={post.excerpt || ''}
                                date={post.created_at}
                                views={post.views}
                                category={post.category?.name || '未分类'}
                                image={post.cover_image || ''}
                                authorProfile={post.author || null}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center shadow-sm">
                        <p className="text-gray-500 text-lg">该分类下暂无文章。</p>
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
