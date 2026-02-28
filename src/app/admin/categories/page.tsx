'use client';

import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/app/actions/categories';
import { FaPlus, FaPen, FaTrash, FaSpinner, FaCheck, FaXmark } from 'react-icons/fa6';

interface Category {
  id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadCategories = async () => {
    const data = await getCategories();
    setCategories(data as Category[]);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createCategory(newName.trim());
    if (result.error) {
      alert('创建失败: ' + result.error);
    } else {
      setNewName('');
      await loadCategories();
    }
    setCreating(false);
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditingName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setSavingId(id);
    const result = await updateCategory(id, editingName.trim());
    if (result.error) {
      alert('更新失败: ' + result.error);
    } else {
      setEditingId(null);
      setEditingName('');
      await loadCategories();
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除分类「${name}」吗？该分类下的文章不会被删除，但会变为未分类状态。`)) return;
    setDeletingId(id);
    const result = await deleteCategory(id);
    if (result.error) {
      alert('删除失败: ' + result.error);
    } else {
      await loadCategories();
    }
    setDeletingId(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <FaSpinner className="animate-spin text-2xl text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">分类管理</h2>

        {/* Create */}
        <form onSubmit={handleCreate} className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="输入新分类名称..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {creating ? <FaSpinner className="animate-spin mr-1.5" /> : <FaPlus className="mr-1.5" />}
            新增
          </button>
        </form>

        {/* List */}
        {categories.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">暂无分类</p>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-700">
            {categories.map(cat => (
              <li key={cat.id} className="flex items-center justify-between py-3 group">
                {editingId === cat.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-4">
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      className="flex-1 px-3 py-1.5 border border-indigo-300 dark:border-indigo-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(cat.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <button onClick={() => handleSaveEdit(cat.id)} disabled={savingId === cat.id} className="text-green-600 hover:text-green-700 p-1.5 transition">
                      {savingId === cat.id ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    </button>
                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 p-1.5 transition">
                      <FaXmark />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 dark:text-white font-medium">{cat.name}</span>
                      <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full">{cat.articleCount} 篇文章</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEdit(cat)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1.5 transition" title="编辑">
                        <FaPen className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-1.5 transition"
                        title="删除"
                      >
                        {deletingId === cat.id ? <FaSpinner className="animate-spin text-sm" /> : <FaTrash className="text-sm" />}
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
