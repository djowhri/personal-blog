import React from 'react';
import Link from 'next/link';
import { FaTwitter, FaWeixin, FaLinkedin, FaUser, FaRegThumbsUp, FaCalendar, FaClock, FaFolder, FaEye } from 'react-icons/fa6';
import Navbar from '../../../components/layout/Navbar';
import Footer from '../../../components/layout/Footer';
import { getArticleById } from '@/app/actions/articles';
import { getComments } from '@/app/actions/comments';
import { getAuthorProfile } from '@/app/actions/config';
import { notFound } from 'next/navigation';
import { marked } from 'marked';
import CommentsSection from '@/components/blog/CommentsSection';
import ArticleContent from '@/components/blog/ArticleContent';
import ViewCounter from '@/components/blog/ViewCounter';
import { createClient } from '@/utils/supabase/server';

export default async function ArticleDetail({ params }: { params: { id: string } }) {
  // Use 'await' to access params properties in Next.js 15+ (if applicable) or standard access
  // Depending on Next.js version, params might be a Promise. 
  // For safety in latest Next.js versions (15+), treat it as potentially async or just access if 14.
  // The provided environment is Next.js 16.1.6, so params is a Promise.
  const { id } = await params;
  
  const article = await getArticleById(id);

  if (!article) {
    notFound();
  }

  const comments = await getComments(id);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  


  // Parse markdown content to HTML
  marked.setOptions({
    breaks: true,
    gfm: true,
  });
  const contentHtml = await marked.parse(article.content || '');


  
  // Get author ID from the article (this is the user_id of the article creator)
  const articleAuthorId = article.author_id;
  
  // Try to fetch author profile for this specific article's author
  const authorProfile = await getAuthorProfile(articleAuthorId);

  // Fallback for missing data
  const authorName = authorProfile?.name || article.author?.email?.split('@')[0] || 'Admin';
  const authorAvatar = authorProfile?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  const authorBio = authorProfile?.bio || "感谢阅读！如果您喜欢这篇文章，欢迎分享给更多人。";

  const categoryName = article.category?.name || '未分类';
  const tags = article.tags || [];

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />
      <ViewCounter articleId={id} />

      <article className="pt-24 pb-16 flex-grow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Article Header */}
            <header className="mb-10 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-indigo-600 dark:text-indigo-400 font-medium mb-4">
                    <span className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">{categoryName}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-6 leading-tight">
                    {article.title}
                </h1>
                <div className="flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 space-x-4">
                    <div className="flex items-center">
                        <img src={authorAvatar} alt="Author" className="h-8 w-8 rounded-full mr-2" />
                        <span className="font-medium text-gray-900 dark:text-gray-200">{authorName}</span>
                    </div>
                    <span>•</span>
                    <time dateTime={article.created_at} className="flex items-center"><FaCalendar className="mr-1" /> {new Date(article.created_at).toLocaleDateString()}</time>
                    <span>•</span>
                    <span className="flex items-center"><FaClock className="mr-1" /> {article.reading_time} 分钟阅读</span>
                    <span>•</span>
                    <span className="flex items-center"><FaEye className="mr-1" /> {article.views || 0} 阅读</span>
                </div>
            </header>

            {/* Cover Image */}
            <div className="mb-12 rounded-2xl overflow-hidden shadow-lg">
                <img src={article.cover_image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1952&q=80"} alt="Cover" className="w-full h-auto" />
            </div>

            {/* Article Body */}
            <ArticleContent html={contentHtml} />

            {/* Tags & Share */}
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center">
                <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                    {tags.length > 0 && <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">标签:</span>}
                    {tags.map((tag: any) => (
                        <Link key={tag.id} href={`/tag/${tag.id}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition">#{tag.name}</Link>
                    ))}
                </div>
                <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500 dark:text-gray-400">分享:</span>
                    <button className="text-gray-400 hover:text-blue-500 transition"><FaTwitter className="text-lg" /></button>
                    <button className="text-gray-400 hover:text-green-500 transition"><FaWeixin className="text-lg" /></button>
                    <button className="text-gray-400 hover:text-blue-600 transition"><FaLinkedin className="text-lg" /></button>
                </div>
            </div>

            {/* Author Bio */}
            <div className="mt-12 bg-gray-50 dark:bg-gray-800 rounded-xl p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left">
                <img src={authorAvatar} alt="Author" className="h-20 w-20 rounded-full mb-4 sm:mb-0 sm:mr-6 border-4 border-white dark:border-gray-700 shadow-sm" />
                <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{authorName}</h3>
                    <p className="text-indigo-600 dark:text-indigo-400 font-medium mb-2">{authorProfile?.title || '作者'}</p>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {authorBio}
                    </p>
                </div>
            </div>

            <CommentsSection articleId={id} initialComments={comments} currentUser={user} authorProfile={authorProfile} articleAuthorId={articleAuthorId} />

        </div>
      </article>

      <Footer />
    </div>
  );
}
