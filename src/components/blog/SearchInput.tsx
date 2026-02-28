'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaHistory, FaFire, FaTimes } from 'react-icons/fa';
import { createClient } from '@/utils/supabase/client';

export default function SearchInput() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const { data } = await supabase
          .from('articles')
          .select('id, title, slug')
          .eq('published', true)
          .ilike('title', `%${query}%`)
          .limit(5);
        
        setResults(data || []);
        setLoading(false);
        setShowResults(true);
      } else {
        setResults([]);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    // Update history
    const newHistory = [searchTerm, ...history.filter(h => h !== searchTerm)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    setShowResults(false);
    router.push(`/search?q=${encodeURIComponent(searchTerm)}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query);
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const deleteHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const newHistory = history.filter(h => h !== item);
    setHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Highlight matching text
  const highlightMatch = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? 
            <span key={i} className="text-indigo-600 font-bold">{part}</span> : part
        )}
      </span>
    );
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowResults(true)}
          className="bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 w-64 transition-all text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400" 
          placeholder="搜索文章..." 
        />
        <FaSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
        {query && (
          <button 
            onClick={() => { setQuery(''); setResults([]); }}
            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        )}
      </div>

      {/* Search Dropdown */}
      {showResults && (query || history.length > 0) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
          
          {/* Live Search Results */}
          {query && (
            <div className="py-2">
              <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">搜索结果</div>
              {loading ? (
                <div className="px-4 py-2 text-sm text-gray-500">搜索中...</div>
              ) : results.length > 0 ? (
                results.map(article => (
                  <Link 
                    key={article.id} 
                    href={`/article/${article.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 truncate"
                    onClick={() => handleSearch(article.title)}
                  >
                    {highlightMatch(article.title, query)}
                  </Link>
                ))
              ) : (
                <div className="px-4 py-2 text-sm text-gray-500">未找到相关文章</div>
              )}
            </div>
          )}

          {/* Search History */}
          {!query && history.length > 0 && (
            <div className="py-2 border-t border-gray-100 dark:border-gray-700 first:border-0">
              <div className="flex justify-between items-center px-4 py-1">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                  <FaHistory className="mr-1" /> 历史记录
                </span>
                <button 
                  onClick={clearHistory}
                  className="text-xs text-gray-400 hover:text-red-500 transition"
                >
                  清空
                </button>
              </div>
              {history.map((item, index) => (
                <div 
                  key={index}
                  className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 group cursor-pointer"
                  onClick={() => { setQuery(item); handleSearch(item); }}
                >
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate">{item}</span>
                  <button 
                    onClick={(e) => deleteHistoryItem(e, item)}
                    className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Hot Searches (Static for now, could be dynamic) */}
          {!query && (
            <div className="py-2 border-t border-gray-100 dark:border-gray-700">
              <div className="px-4 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center">
                <FaFire className="mr-1 text-orange-500" /> 热门搜索
              </div>
              <div className="px-4 py-2 flex flex-wrap gap-2">
                {['React', 'Next.js', 'Supabase', 'Tailwind'].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => { setQuery(tag); handleSearch(tag); }}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300 hover:bg-indigo-100 dark:hover:bg-indigo-900 hover:text-indigo-600 transition"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
