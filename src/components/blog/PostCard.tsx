import React from 'react';
import Link from 'next/link';
import { FaEye } from 'react-icons/fa6';
import { AuthorProfile } from '@/app/actions/config';

interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  views: number;
  category: string;
  image: string;
  authorProfile?: AuthorProfile | User | null;
}

export default function PostCard({ id, title, excerpt, date, views, category, image, authorProfile }: PostCardProps) {
  const authorAvatar = (authorProfile as any)?.avatar || (authorProfile as any)?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80";
  const authorName = (authorProfile as any)?.name || (authorProfile as any)?.full_name || (authorProfile as any)?.email?.split('@')[0] || 'Admin';

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition duration-300 flex flex-col h-full group">
        <div className="h-48 overflow-hidden relative">
            <img src={image || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-1.2.1&auto=format&fit=crop&w=1352&q=80"} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt="Cover" />
            <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded shadow-sm">{category}</div>
        </div>
        <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center space-x-2 mb-3">
                 <img src={authorAvatar} alt="Author" className="h-6 w-6 rounded-full border border-gray-100 dark:border-gray-700" />
                 <span className="text-xs font-medium text-gray-500 dark:text-gray-400">{authorName}</span>
                 <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                 <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(date).toLocaleDateString()}</span>
            </div>
            <Link href={`/article/${id}`} className="mb-2 block">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">{title}</h3>
            </Link>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 flex-1 line-clamp-3 leading-relaxed">
                {excerpt}
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                <span className="flex items-center"><FaEye className="mr-1" /> {views} 阅读</span>
                <Link href={`/article/${id}`} className="text-indigo-600 dark:text-indigo-400 hover:underline">阅读全文 &rarr;</Link>
            </div>
        </div>
    </article>
  );
}
