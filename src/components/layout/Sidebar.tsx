'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaGithub, FaTwitter, FaLinkedin, FaPen, FaArrowRightToBracket } from 'react-icons/fa6';
import { getCategories } from '@/app/actions/categories';
import { getAuthorProfile, AuthorProfile } from '@/app/actions/config';
import { getTags } from '@/app/actions/tags';
import { createClient } from '@/utils/supabase/client';
import NewsletterForm from './NewsletterForm';
import ProfileEditModal from '../profile/ProfileEditModal';

export default function Sidebar({ authorId }: { authorId?: string } = {}) {
  const [categories, setCategories] = useState<any[]>([]);
  const [profile, setProfile] = useState<AuthorProfile | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAutoBoundMode, setIsAutoBoundMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, prof, currentTags] = await Promise.all([
          getCategories(),
          getAuthorProfile(authorId),
          getTags()
        ]);
        
        setCategories(cats || []);
        setProfile(prof);
        setTags(currentTags || []);

        const supabase = createClient();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);
        
        // 自动触发补全自己资料框的逻辑：
        // 仅在通用页面（未指定别人 authorId 时），且已登录且没获取到资料时触发。
        if (!authorId && currentUser && !prof) {
            setIsAutoBoundMode(true);
            setIsModalOpen(true);
        }

      } catch (err) {
        console.error("Failed to load sidebar data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authorId]);

  const popularTags = tags.slice(0, 10);
  
  const defaultAuthor: AuthorProfile = {
    name: "博主名片",
    title: "未填写职业",
    bio: "这位博主很懒，还没有填写个人简介。",
    avatar: "https://via.placeholder.com/150",
    social: { github: "", twitter: "", linkedin: "" }
  };

  const author = profile || defaultAuthor;
  
  // 判断当前登录者是否可以编辑（即该名片属于自己，或者属于自己新开的）
  const isCurrentUserOwner = Boolean(user && author.user_id === user.id);

  const handleProfileSaved = (newProfile: AuthorProfile) => {
      setProfile(newProfile);
      setIsAutoBoundMode(false); 
      setIsModalOpen(false);
  };

  const authorCardContent = (
    <>
        <div className="flex items-center space-x-4 mb-4">
            <img src={author.avatar || defaultAuthor.avatar} alt="Avatar" className="h-16 w-16 rounded-full border-2 border-indigo-100 dark:border-indigo-900 object-cover" />
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{author.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{author.title}</p>
            </div>
        </div>
        <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
            {author.bio}
        </p>
        <div className="flex space-x-3">
            {author.social?.github && <span className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"><FaGithub className="text-xl" /></span>}
            {author.social?.twitter && <span className="text-gray-400 dark:text-gray-500 hover:text-blue-400 transition"><FaTwitter className="text-xl" /></span>}
            {author.social?.linkedin && <span className="text-gray-400 dark:text-gray-500 hover:text-blue-600 transition"><FaLinkedin className="text-xl" /></span>}
        </div>
    </>
  );

  return (
    <div className="space-y-8">
        {/* About Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300 relative">
            {!loading && !user ? (
                // 匿名访客视角
                <div className="text-center py-4">
                    <div className="mx-auto w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-800">
                        <FaArrowRightToBracket className="text-2xl text-indigo-500 dark:text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">欢迎来到博客空间</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">这里将展示博主个人名片。<br/>如果您是网站创建者，请长按顶部导航栏登录以认领并完善信息。</p>
                </div>
            ) : (
                // 已登录视角或已绑定展示视角
                <>
                    {!loading && isCurrentUserOwner && (
                        <button 
                            onClick={() => { setIsAutoBoundMode(false); setIsModalOpen(true); }}
                            className="absolute top-4 right-4 p-2 rounded-full text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30 active:scale-90 transition-all z-10"
                            title="编辑资料"
                        >
                            <FaPen className="text-sm" />
                        </button>
                    )}
                    {authorCardContent}
                </>
            )}
        </div>

        {/* Categories */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-indigo-500 pl-3">分类目录</h3>
            {loading ? (
                <div className="animate-pulse space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
            ) : (
                <ul className="space-y-2">
                    {categories.map(cat => (
                        <li key={cat.id}>
                            <Link href={`/category/${cat.id}`} className="flex items-center justify-between text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition group">
                                <span>{cat.name}</span>
                                <span className="bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs px-2 py-1 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                                    {(cat as any).articleCount || 0}
                                </span>
                            </Link>
                        </li>
                    ))}
                    {categories.length === 0 && <p className="text-sm text-gray-500">暂无分类</p>}
                </ul>
            )}
        </div>

        {/* Tags Cloud */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-l-4 border-indigo-500 pl-3">热门标签</h3>
            {loading ? (
                 <div className="animate-pulse flex flex-wrap gap-2">
                     <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                     <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                     <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-12"></div>
                 </div>
            ) : (
                <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                        <Link key={tag.id} href={`/tag/${tag.id}`} className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                            #{tag.name} <span className="ml-1 opacity-60">({(tag as any).count || 0})</span>
                        </Link>
                    ))}
                    {popularTags.length === 0 && <p className="text-sm text-gray-500">暂无标签</p>}
                </div>
            )}
        </div>

        {/* Newsletter */}
        <NewsletterForm />
        
        {/* Profile Edit Modal */}
        <ProfileEditModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            initialProfile={author}
            autoOpenBound={isAutoBoundMode}
            onSaved={handleProfileSaved}
        />
    </div>
  );
}
