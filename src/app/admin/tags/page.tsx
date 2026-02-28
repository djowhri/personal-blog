'use client';

import React, { useState, useEffect } from 'react';
import { getTags, createTag, updateTag, deleteTag } from '@/app/actions/tags';
import { FaPlus, FaPen, FaTrash, FaSpinner, FaCheck, FaXmark } from 'react-icons/fa6';

interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

export default function AdminTagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [creating, setCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadTags = async () => {
    const data = await getTags();
    setTags(data as Tag[]);
    setLoading(false);
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    const result = await createTag(newName.trim());
    if (result.error) {
      alert('创建失败: ' + result.error);
    } else {
      setNewName('');
      await loadTags();
    }
    setCreating(false);
  };

  const handleStartEdit = (tag: Tag) => {
    setEditingId(tag.id);
    setEditingName(tag.name);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingName.trim()) return;
    setSavingId(id);
    const result = await updateTag(id, editingName.trim());
    if (result.error) {
      alert('更新失败: ' + result.error);
    } else {
      setEditingId(null);
      setEditingName('');
      await loadTags();
    }
    setSavingId(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`确定要删除标签「${name}」吗？该标签与文章的关联将被移除。`)) return;
    setDeletingId(id);
    const result = await deleteTag(id);
    if (result.error) {
      alert('删除失败: ' + result.error);
    } else {
      await loadTags();
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
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">标签管理</h2>

        {/* Create */}
        <form onSubmit={handleCreate} className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="输入新标签名称..."
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
        {tags.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">暂无标签</p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {tags.map(tag => (
              <div key={tag.id} className="group relative">
                {editingId === tag.id ? (
                  <div className="flex items-center gap-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg px-2 py-1">
                    <input
                      type="text"
                      value={editingName}
                      onChange={e => setEditingName(e.target.value)}
                      className="w-32 px-2 py-1 border border-indigo-300 dark:border-indigo-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveEdit(tag.id);
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                    />
                    <button onClick={() => handleSaveEdit(tag.id)} disabled={savingId === tag.id} className="text-green-600 hover:text-green-700 p-1 transition">
                      {savingId === tag.id ? <FaSpinner className="animate-spin text-xs" /> : <FaCheck className="text-xs" />}
                    </button>
                    <button onClick={handleCancelEdit} className="text-gray-400 hover:text-gray-600 p-1 transition">
                      <FaXmark className="text-xs" />
                    </button>
                  </div>
                ) : (
                  <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <span className="font-medium">#{tag.name}</span>
                    <span className="ml-1.5 text-xs text-gray-400">({tag.count})</span>
                    <div className="ml-2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleStartEdit(tag)} className="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 transition" title="编辑">
                        <FaPen className="text-[10px]" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        disabled={deletingId === tag.id}
                        className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 p-0.5 transition"
                        title="删除"
                      >
                        {deletingId === tag.id ? <FaSpinner className="animate-spin text-[10px]" /> : <FaTrash className="text-[10px]" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
