'use client';

import React, { useState, useEffect, useRef } from 'react';
import { updateAuthorProfile, AuthorProfile } from '@/app/actions/config';
import { createClient } from '@/utils/supabase/client';
import { FaSpinner, FaCheck, FaUpload, FaXmark } from 'react-icons/fa6';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProfile: AuthorProfile;
  autoOpenBound?: boolean; // 是否是因为初次认领而弹窗
  onSaved: (newProfile: AuthorProfile) => void;
}

export default function ProfileEditModal({ isOpen, onClose, initialProfile, autoOpenBound, onSaved }: ProfileEditModalProps) {
  const [profile, setProfile] = useState<AuthorProfile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Validation state
  const [errors, setErrors] = useState<{name?: string, title?: string, bio?: string}>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Setup modal body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Sync profile when opened
  useEffect(() => {
    if (isOpen) {
      setProfile(initialProfile);
      setErrors({});
      setSaved(false);
    }
  }, [isOpen, initialProfile]);

  if (!isOpen) return null;

  const validate = (field: string, value: string) => {
    let error = '';
    if (field === 'name' && !value.trim()) error = '姓名不能为空';
    if (field === 'title' && !value.trim()) error = '头衔不能为空';
    if (field === 'bio' && !value.trim()) error = '简介不能为空';
    
    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('social.')) {
        const socialKey = name.split('.')[1];
        setProfile(prev => ({
            ...prev,
            social: {
                ...prev.social,
                [socialKey]: value
            }
        }));
    } else {
        setProfile(prev => ({ ...prev, [name]: value }));
        // Live validation for core fields
        if (['name', 'title', 'bio'].includes(name)) {
            validate(name, value);
        }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    const supabase = createClient();
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('images')
            .getPublicUrl(filePath);

        setProfile(prev => ({ ...prev, avatar: publicUrl }));
    } catch (error) {
        console.error('Avatar upload failed:', error);
        alert('头像上传失败');
    } finally {
        setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validate all
    const isNameValid = validate('name', profile.name);
    const isTitleValid = validate('title', profile.title);
    const isBioValid = validate('bio', profile.bio);
    
    if (!isNameValid || !isTitleValid || !isBioValid) {
        return;
    }
    
    setSaving(true);
    setSaved(false);
    try {
        const result = await updateAuthorProfile(profile);
        if (result.error) {
            alert('保存失败: ' + result.error);
        } else {
            setSaved(true);
            onSaved(profile);
            setTimeout(() => {
                setSaved(false);
                onClose();
            }, 1000); // Close after 1 second showing success
        }
    } catch (error) {
        console.error(error);
        // Only alert on standard catch
    } finally {
        setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={autoOpenBound ? undefined : onClose} // 如果是自动强制认领弹窗，点背景不关闭
        ></div>
        
        {/* Modal content */}
        <div className="relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {autoOpenBound ? '认领博主信息' : '编辑博主资料'}
                </h2>
                {!autoOpenBound && (
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <FaXmark className="text-lg" />
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
                {autoOpenBound && (
                    <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg text-sm">
                        欢迎！系统检测到博主名片尚未绑定有效用户。请完善以下资料，这些信息将展示在博客侧边栏。
                    </div>
                )}
                
                <form id="profile-edit-form" onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                            <img src={profile.avatar || "https://via.placeholder.com/150"} alt="Avatar" className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-sm dark:border-gray-800" />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <FaUpload className="text-white text-xl" />
                            </div>
                            {uploading && (
                                <div className="absolute inset-0 bg-white bg-opacity-70 rounded-full flex items-center justify-center">
                                    <FaSpinner className="animate-spin text-indigo-600" />
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">点击更换头像</p>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                姓名 <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="name" 
                                value={profile.name} 
                                onChange={handleChange} 
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} 
                            />
                            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                头衔 / 职业 <span className="text-red-500">*</span>
                            </label>
                            <input 
                                type="text" 
                                name="title" 
                                value={profile.title} 
                                onChange={handleChange} 
                                className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition ${errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`} 
                            />
                            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            个人简介 <span className="text-red-500">*</span>
                        </label>
                        <textarea 
                            name="bio" 
                            value={profile.bio} 
                            onChange={handleChange} 
                            rows={3} 
                            className={`w-full px-4 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 transition resize-y ${errors.bio ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300 dark:border-gray-600 focus:border-indigo-500'}`}
                        ></textarea>
                        {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">电子邮箱 (公开显示)</label>
                        <input type="email" name="email" value={profile.email || ''} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="your.email@example.com" />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">社交链接</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">GitHub</label>
                                <input type="text" name="social.github" value={profile.social.github} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="https://github.com/..." />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Twitter</label>
                                <input type="text" name="social.twitter" value={profile.social.twitter} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="https://twitter.com/..." />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">LinkedIn</label>
                                <input type="text" name="social.linkedin" value={profile.social.linkedin} onChange={handleChange} className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition" placeholder="https://linkedin.com/in/..." />
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            {/* Footer */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 rounded-b-2xl">
                {!autoOpenBound && (
                    <button 
                        type="button" 
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition"
                    >
                        取消
                    </button>
                )}
                <button 
                    type="submit" 
                    form="profile-edit-form"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50 flex items-center shadow-sm"
                >
                    {saving ? <FaSpinner className="animate-spin mr-2" /> : saved ? <FaCheck className="mr-2 text-green-300" /> : null}
                    {saving ? '保存中...' : saved ? '已保存' : (autoOpenBound ? '确认认领' : '保存修改')}
                </button>
            </div>
        </div>
    </div>
  );
}
