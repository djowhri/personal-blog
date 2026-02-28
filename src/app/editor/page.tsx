'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaCheck, FaGear, FaEye, FaBold, FaItalic, FaHeading, FaLink, FaImage, FaQuoteRight, FaCode, FaListUl, FaListOl, FaSpinner } from 'react-icons/fa6';
import { marked } from 'marked';
import { createArticle } from '@/app/actions/articles';
import { getCategories } from '@/app/actions/categories';
import { getTags, createTag } from '@/app/actions/tags';
import { createClient } from '@/utils/supabase/client';
import styles from '@/styles/article.module.css';
import ArticleContent from '@/components/blog/ArticleContent';

interface Category {
  id: string;
  name: string;
}

interface Tag {
  id: string;
  name: string;
}

export default function EditorPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState('');
  const [title, setTitle] = useState('');
  const [html, setHtml] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isLoadingTags, setIsLoadingTags] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // Initialize marked options
  useEffect(() => {
    marked.setOptions({
        breaks: true, // Enable line breaks
        gfm: true,    // Enable GFM
    });
  }, []);

  // Sync scroll from textarea to preview
  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (!previewRef.current) return;
    const textarea = e.currentTarget;
    const percentage = textarea.scrollTop / (textarea.scrollHeight - textarea.clientHeight);
    previewRef.current.scrollTop = percentage * (previewRef.current.scrollHeight - previewRef.current.clientHeight);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const supabase = createClient();
    
    // Check auth
    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
        }
    };
    checkAuth();

    // Load categories
    const loadData = async () => {
      const cats = await getCategories();
      setCategories(cats);
      if (cats.length > 0) {
        setSelectedCategory(cats[0].id);
      }

      setIsLoadingTags(true);
      const allTags = await getTags();
      setTags(allTags);
      setIsLoadingTags(false);
    };
    loadData();
  }, [router]);

  useEffect(() => {
    const parseMarkdown = async () => {
      const parsed = await marked.parse(markdown);
      setHtml(parsed);
    };
    parseMarkdown();
  }, [markdown]);

  // 计算词数
  const wordCount = markdown.trim().split(/\s+/).length;

  const handleSave = async (published: boolean) => {
    if (!title.trim()) {
        showToast('请输入文章标题', 'error');
        return;
    }
    if (!markdown.trim()) {
        showToast('请输入文章内容', 'error');
        return;
    }

    if (published) {
        setIsPublishing(true);
    } else {
        setIsSaving(true);
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', markdown);
    formData.append('excerpt', excerpt || markdown.slice(0, 150));
    formData.append('category_id', selectedCategory);
    formData.append('tags', JSON.stringify(selectedTags));
    formData.append('published', String(published));
    if (coverImage) {
        formData.append('cover_image', coverImage);
    }

    try {
        const result = await createArticle(formData);
        if (result?.error) {
            console.error('Server action error:', result.error);
            showToast(`保存失败: ${result.error}`, 'error');
        } else {
            // Success handled by server action redirect
        }
    } catch (error) {
        // If the error is a digest error (redirect), it's actually a success
        if ((error as any).message === 'NEXT_REDIRECT') {
            return;
        }
        console.error('Save error details:', error);
        showToast('保存时发生错误，请检查控制台获取更多信息', 'error');
    } finally {
        setIsSaving(false);
        setIsPublishing(false);
    }
  };

  const [isPreview, setIsPreview] = useState(false);

  // Markdown Toolbar Actions
  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = markdown;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newText = before + prefix + selection + suffix + after;
    setMarkdown(newText);
    
    // Restore focus and selection
    setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const handleLink = () => {
    const url = window.prompt('请输入链接地址 (URL):', 'https://');
    if (!url) return;
    
    const textarea = textareaRef.current;
    if (textarea && textarea.selectionStart !== textarea.selectionEnd) {
      insertMarkdown('[', `](${url})`);
    } else {
      const text = window.prompt('请输入链接文字:', '链接');
      const linkText = text || '链接';
      
      // Use insertMarkdown to insert the whole link
      insertMarkdown(`[${linkText}](${url})`);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过 5MB', 'error');
        return;
    }

    setIsUploading(true);
    const supabase = createClient();
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        insertMarkdown(`![${file.name}](${publicUrl})`);
    } catch (error) {
        console.error('Error uploading image:', error);
        showToast('图片上传失败，请重试', 'error');
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }
  };

  const handleCoverImageClick = () => {
    coverInputRef.current?.click();
  };

  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件', 'error');
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast('图片大小不能超过 5MB', 'error');
        return;
    }

    setIsUploadingCover(true);
    const supabase = createClient();
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) {
            throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        setCoverImage(publicUrl);
    } catch (error) {
        console.error('Error uploading cover image:', error);
        showToast('封面图上传失败，请重试', 'error');
    } finally {
        setIsUploadingCover(false);
        if (coverInputRef.current) {
            coverInputRef.current.value = '';
        }
    }
  };

  return (
    <div className="bg-white h-screen flex flex-col overflow-hidden font-sans">
        {/* Toast Notification */}
        {toast && (
            <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 animate-fade-in-down ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'}`}>
                <div className="flex items-center space-x-2">
                    {toast.type === 'error' ? <span className="text-xl">⚠️</span> : <FaCheck />}
                    <span>{toast.message}</span>
                </div>
            </div>
        )}
        
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*"
        />
        <input 
            type="file" 
            ref={coverInputRef} 
            onChange={handleCoverImageChange} 
            className="hidden" 
            accept="image/*"
        />
        
        {/* Top Toolbar */}
        <header className="h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0 z-20">
            <div className="flex items-center w-1/2">
                <Link href="/" className="text-gray-400 hover:text-gray-600 mr-4 transition">
                    <FaArrowLeft className="text-lg" />
                </Link>
                <input 
                    type="text" 
                    placeholder="输入文章标题..." 
                    className="w-full text-xl font-bold border-none focus:ring-0 placeholder-gray-300 text-gray-900 outline-none" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>
            <div className="flex items-center space-x-3">
                <button 
                    onClick={() => setIsPreview(!isPreview)}
                    className={`p-2 rounded transition ${isPreview ? 'bg-indigo-100 text-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
                    title={isPreview ? "切换到编辑模式" : "切换到预览模式"}
                >
                    <FaEye />
                </button>
                <button 
                    onClick={() => setShowSettings(!showSettings)}
                    className={`text-gray-500 hover:text-gray-700 p-2 rounded hover:bg-gray-100 transition ${showSettings ? 'bg-gray-100 text-indigo-600' : ''}`}
                    title="文章设置"
                >
                    <FaGear />
                </button>
                <button 
                    onClick={() => handleSave(false)}
                    disabled={isSaving || isPublishing}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isSaving ? <FaSpinner className="animate-spin mr-2" /> : null}
                    保存草稿
                </button>
                <button 
                    onClick={() => {
                        if (!title.trim()) {
                            showToast('请输入文章标题', 'error');
                            return;
                        }
                        if (!markdown.trim()) {
                            showToast('请输入文章内容', 'error');
                            return;
                        }
                        setShowPublishModal(true);
                    }}
                    disabled={isSaving || isPublishing}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                    {isPublishing ? <FaSpinner className="animate-spin mr-2" /> : null}
                    发布
                </button>
            </div>
        </header>

        {/* Publish Modal */}
        {showPublishModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-scale-up">
                    <div className="p-6 border-b border-gray-100">
                        <h3 className="text-xl font-bold text-gray-800">发布文章</h3>
                        <p className="text-gray-500 text-sm mt-1">完善文章信息，让更多人看到你的作品。</p>
                    </div>
                    
                    <div className="p-6 space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">选择分类</label>
                            <select 
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 bg-gray-50"
                            >
                                <option value="">请选择一个分类...</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                            {categories.length === 0 && (
                                <p className="text-xs text-orange-500 mt-1">暂无分类，请先在后台添加分类。</p>
                            )}
                        </div>

                        {/* Tag Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">选择标签</label>
                            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg bg-gray-50">
                                {tags.length > 0 ? (
                                    tags.map(tag => {
                                        const isSelected = selectedTags.includes(tag.id);
                                        return (
                                            <button
                                                key={tag.id}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setSelectedTags(prev => prev.filter(id => id !== tag.id));
                                                    } else {
                                                        setSelectedTags(prev => [...prev, tag.id]);
                                                    }
                                                }}
                                                className={`px-3 py-1 text-xs rounded-full border transition-all ${
                                                    isSelected 
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' 
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-300 hover:text-indigo-600'
                                                }`}
                                            >
                                                {tag.name}
                                            </button>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-gray-400 w-full text-center py-2">暂无标签可用</p>
                                )}
                            </div>
                        </div>

                        {/* Cover Image Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">文章封面</label>
                            <div 
                                onClick={handleCoverImageClick}
                                className={`relative w-full h-48 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group overflow-hidden ${coverImage ? 'border-indigo-500' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
                            >
                                {coverImage ? (
                                    <>
                                        <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="text-white font-medium flex items-center"><FaImage className="mr-2" /> 更换封面</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        {isUploadingCover ? (
                                            <FaSpinner className="animate-spin text-3xl text-indigo-500 mx-auto mb-2" />
                                        ) : (
                                            <FaImage className="text-3xl text-gray-400 mx-auto mb-2 group-hover:text-indigo-500 transition-colors" />
                                        )}
                                        <p className="text-gray-500 text-sm">{isUploadingCover ? '上传中...' : '点击上传封面图片'}</p>
                                        <p className="text-gray-400 text-xs mt-1">支持 JPG, PNG, GIF (Max 5MB)</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Excerpt */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">摘要 (选填)</label>
                            <textarea 
                                value={excerpt}
                                onChange={(e) => setExcerpt(e.target.value)}
                                rows={3}
                                className="w-full border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 p-3"
                                placeholder="如果不填写，将自动截取文章前150字..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
                        <button 
                            onClick={() => setShowPublishModal(false)}
                            className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
                        >
                            取消
                        </button>
                        <button 
                            onClick={() => {
                                setShowPublishModal(false);
                                handleSave(true);
                            }}
                            disabled={isSaving || isPublishing || isUploadingCover}
                            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                        >
                            {isPublishing ? <FaSpinner className="animate-spin mr-2" /> : <FaCheck className="mr-2" />}
                            确认发布
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Settings Panel (Dropdown) */}
        {showSettings && (
            <div className="absolute top-16 right-4 w-80 bg-white shadow-xl border border-gray-200 rounded-lg z-30 p-4 animate-fade-in-down">
                <h3 className="text-sm font-bold text-gray-700 mb-3">文章设置</h3>
                
                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">分类</label>
                    <select 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">选择分类...</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    {categories.length === 0 && (
                        <p className="text-xs text-orange-500 mt-1">暂无分类，请先在后台添加分类。</p>
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">摘要</label>
                    <textarea 
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows={3}
                        className="w-full border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="如果不填写，将自动截取文章前150字..."
                    ></textarea>
                </div>
            </div>
        )}

        {/* Main Editor Area */}
        <div className="flex-1 flex overflow-hidden">
            
            {/* Markdown Input (Left) */}
            <div className={`flex flex-col border-r border-gray-200 bg-gray-50 transition-all duration-300 ${isPreview ? 'w-0 overflow-hidden border-none' : 'w-1/2'}`}>
                {/* Toolbar */}
                <div className="h-10 border-b border-gray-200 bg-white flex items-center px-4 space-x-4 text-gray-500 text-sm overflow-x-auto">
                    <button onClick={() => insertMarkdown('**', '**')} className="hover:text-indigo-600" title="加粗"><FaBold /></button>
                    <button onClick={() => insertMarkdown('*', '*')} className="hover:text-indigo-600" title="斜体"><FaItalic /></button>
                    <button onClick={() => insertMarkdown('### ')} className="hover:text-indigo-600" title="标题"><FaHeading /></button>
                    <span className="border-r border-gray-300 h-4"></span>
                    <button onClick={handleLink} className="hover:text-indigo-600" title="链接"><FaLink /></button>
                    <button onClick={handleImageClick} className="hover:text-indigo-600 flex items-center justify-center" title="图片">
                        {isUploading ? <FaSpinner className="animate-spin text-indigo-600" /> : <FaImage />}
                    </button>
                    <button onClick={() => insertMarkdown('> ')} className="hover:text-indigo-600" title="引用"><FaQuoteRight /></button>
                    <button onClick={() => insertMarkdown('```\n', '\n```')} className="hover:text-indigo-600" title="代码块"><FaCode /></button>
                    <span className="border-r border-gray-300 h-4"></span>
                    <button onClick={() => insertMarkdown('- ')} className="hover:text-indigo-600" title="无序列表"><FaListUl /></button>
                    <button onClick={() => insertMarkdown('1. ')} className="hover:text-indigo-600" title="有序列表"><FaListOl /></button>
                </div>
                {/* Textarea */}
                <textarea 
                    ref={textareaRef}
                    onScroll={handleScroll}
                    className={`${styles.editorTextarea} flex-1 w-full p-6 bg-gray-50 border-none focus:ring-0 resize-none outline-none`} 
                    spellCheck="false"
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="开始写作..."
                ></textarea>
                {/* Status Bar */}
                <div className="h-8 border-t border-gray-200 bg-white flex items-center px-4 justify-between text-xs text-gray-500">
                    <span>Markdown</span>
                    <span>{wordCount} 词</span>
                </div>
            </div>

            {/* Preview (Right) */}
            <div 
                ref={previewRef}
                className={`overflow-y-auto bg-white p-8 md:p-12 transition-all duration-300 ${isPreview ? 'w-full max-w-4xl mx-auto' : 'w-1/2'}`}
            >
                <ArticleContent html={html} />
            </div>
        </div>
    </div>
  );
}
