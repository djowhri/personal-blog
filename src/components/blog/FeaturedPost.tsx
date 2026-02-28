import React from 'react';
import Link from 'next/link';
import { FaCalendar, FaFolder, FaClock, FaArrowRight } from 'react-icons/fa6';
import { Article } from '@/types';
import { AuthorProfile } from '@/app/actions/config';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface FeaturedPostProps {
  post: Article;
  authorProfile?: AuthorProfile | User | null;
}

export default function FeaturedPost({ post, authorProfile }: FeaturedPostProps) {
  const profile = authorProfile as (AuthorProfile & User) | null;
  const authorName = profile?.name || profile?.full_name || profile?.email?.split('@')[0] || post.author?.full_name || post.author?.email?.split('@')[0] || 'Admin';
  const authorAvatar = profile?.avatar || profile?.avatar_url || post.author?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition duration-300 group">
        <div className="relative h-64 sm:h-80 overflow-hidden">
            <img src={post.cover_image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80"} alt="Featured" className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500" />
            <div className="absolute top-4 left-4">
                <span className="bg-indigo-600 text-white text-xs px-3 py-1 rounded-full uppercase tracking-wide font-semibold">最新推荐</span>
            </div>
        </div>
        <div className="p-6 sm:p-8">
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3 space-x-4">
                <span className="flex items-center"><FaCalendar className="mr-1" /> {new Date(post.created_at).toLocaleDateString()}</span>
                <span className="flex items-center"><FaFolder className="mr-1" /> {post.category?.name || '未分类'}</span>
                <span className="flex items-center"><FaClock className="mr-1" /> {post.reading_time} 分钟阅读</span>
            </div>
            <Link href={`/article/${post.id}`} className="block mt-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{post.title}</h2>
            </Link>
            <p className="mt-3 text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                {post.excerpt}
            </p>
            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <img src={authorAvatar} alt="Author" className="h-8 w-8 rounded-full" />
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{authorName}</span>
                </div>
                <Link href={`/article/${post.id}`} className="text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-800 dark:hover:text-indigo-300 text-sm flex items-center group-hover:translate-x-1 transition">
                    阅读更多 <FaArrowRight className="ml-1" />
                </Link>
            </div>
        </div>
    </div>
  );
}
