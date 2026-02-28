
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getAuthorProfile } from '@/app/actions/config';
import { FaGithub, FaTwitter, FaEnvelope } from 'react-icons/fa6';

export default async function AboutPage() {
  const profile = await getAuthorProfile();

  if (!profile) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">未找到博主信息</h1>
                <p className="text-gray-500 mt-2">请先在后台完善个人资料。</p>
            </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 antialiased min-h-screen flex flex-col font-sans transition-colors duration-300">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 flex-grow w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {/* Header / Cover */}
            <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <div className="px-8 pb-8">
                {/* Avatar */}
                <div className="relative -mt-16 mb-6">
                    <img 
                        src={profile.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
                        alt={profile.name} 
                        className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 shadow-lg object-cover"
                    />
                </div>

                {/* Info */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{profile.name}</h1>
                    <p className="text-gray-500 dark:text-gray-400 text-lg">{profile.bio || '全栈开发者 / 技术博主 / 生活观察者'}</p>
                </div>

                {/* Content */}
                <div className="prose prose-indigo dark:prose-invert max-w-none">
                    <h3>关于我</h3>
                    <p>
                        你好！我是 {profile.name}。欢迎来到我的个人博客。
                    </p>
                    <p>
                        这里是我记录技术学习、分享生活感悟的地方。我热衷于探索前沿 Web 技术，同时也喜欢在代码之外寻找生活的乐趣。
                    </p>
                    <p>
                        如果你对我的文章感兴趣，或者有任何问题想要交流，欢迎通过下方的联系方式找到我。
                    </p>
                    
                    <h3>联系方式</h3>
                    <div className="flex space-x-4 mt-4 not-prose">
                        <a href="#" className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition text-2xl"><FaGithub /></a>
                        <a href="#" className="text-gray-400 hover:text-blue-400 transition text-2xl"><FaTwitter /></a>
                        <a href={`mailto:${profile.email || 'example@email.com'}`} className="text-gray-400 hover:text-indigo-500 transition text-2xl"><FaEnvelope /></a>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
