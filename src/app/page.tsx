import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';
import FeaturedPost from '../components/blog/FeaturedPost';
import PostCard from '../components/blog/PostCard';
import { FaChevronLeft, FaChevronRight, FaPen } from 'react-icons/fa6';
import Link from 'next/link';
import { getArticles } from './actions/articles';
import { createClient } from '@/utils/supabase/server';

import Pagination from '../components/ui/Pagination';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const currentPage = Number(resolvedSearchParams.page) || 1;
  const itemsPerPage = 10;
  
  const { articles, count } = await getArticles(currentPage, itemsPerPage);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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

  const featuredPost = articlesWithAuthor[0];
  const remainingPosts = articlesWithAuthor.slice(1);

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Articles */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* Featured Post - Only show on first page if desired, or always. 
                    If always showing featured post from current page list:
                */}
                {featuredPost ? (
                    <FeaturedPost post={featuredPost} authorProfile={featuredPost.author || null} />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 text-center">
                        <p className="text-gray-500">暂无文章，快来发布第一篇吧！</p>
                    </div>
                )}

                {/* Standard Post Grid */}
                {remainingPosts.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {remainingPosts.map(post => (
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
                )}

                {/* Pagination */}
                <Pagination 
                    currentPage={currentPage}
                    totalItems={count || 0}
                    itemsPerPage={itemsPerPage}
                    baseUrl="/"
                />

            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-4 space-y-8">
                <Sidebar />
            </div>
        </div>
      </div>

      <Footer />

      {/* Floating Action Button for Creating Post (Only for logged-in users) */}
      {user && (
          <Link 
            href="/editor" 
            className="fixed bottom-8 right-8 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-lg transition-transform hover:scale-110 z-50 flex items-center justify-center"
            title="新建文章"
          >
              <FaPen className="text-xl" />
          </Link>
      )}
    </div>
  );
}
