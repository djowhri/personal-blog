'use client';

import React, { useState } from 'react';
import { Comment } from '@/types';
import { createComment } from '@/app/actions/comments';
import { useRouter } from 'next/navigation';
import { FaPaperPlane, FaUser, FaReply, FaSpinner } from 'react-icons/fa6';
import { AuthorProfile } from '@/app/actions/config';

interface CommentsSectionProps {
  articleId: string;
  initialComments: Comment[];
  currentUser: any; // User object from supabase auth
  authorProfile?: AuthorProfile | null;
  articleAuthorId?: string;
}

export default function CommentsSection({ articleId, initialComments, currentUser, authorProfile, articleAuthorId }: CommentsSectionProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    if (!currentUser) {
        alert('请先登录后发表评论');
        router.push('/login');
        return;
    }

    setIsSubmitting(true);
    try {
      const result = await createComment(articleId, comment, replyTo || undefined);
      if (result?.error) {
        alert(result.error);
      } else {
        setComment('');
        setReplyTo(null);
        router.refresh(); // Refresh server data
      }
    } catch (error) {
      console.error(error);
      alert('评论发表失败');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16" suppressHydrationWarning>
      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        评论 ({initialComments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
      </h3>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="mb-12 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {replyTo ? '回复评论...' : '发表评论'}
                {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="ml-2 text-xs text-red-500 hover:underline">取消回复</button>}
            </label>
            <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full border-gray-300 dark:border-gray-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 dark:bg-gray-700 dark:text-white p-3"
                placeholder={currentUser ? "分享你的想法..." : "请登录后发表评论..."}
                disabled={!currentUser}
            ></textarea>
        </div>
        <div className="flex justify-end">
            <button
                type="submit"
                disabled={isSubmitting || !currentUser || !comment.trim()}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
                {isSubmitting ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
                提交评论
            </button>
        </div>
        {!currentUser && (
            <div className="mt-2 text-sm text-gray-500 text-center">
                需要 <span onClick={() => router.push('/login')} className="text-indigo-600 cursor-pointer hover:underline">登录</span> 才能发表评论
            </div>
        )}
      </form>

      {/* Comments List */}
      <div className="space-y-8">
        {initialComments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">暂无评论，快来抢沙发吧！</p>
        ) : (
            initialComments.map((comment) => (
                <CommentItem key={comment.id} comment={comment} onReply={(id) => setReplyTo(id)} currentUser={currentUser} authorProfile={authorProfile} articleAuthorId={articleAuthorId} />
            ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, currentUser, authorProfile, articleAuthorId }: { comment: Comment, onReply: (id: string) => void, currentUser: any, authorProfile?: AuthorProfile | null, articleAuthorId?: string }) {
    // Determine if this comment is from the author
    const isAuthor = articleAuthorId && comment.user_id === articleAuthorId;
    
    // If it is the author, use the site_config profile if available, otherwise fallback to comment profile
    const displayName = isAuthor && authorProfile?.name ? authorProfile.name : (comment.profile?.full_name || comment.profile?.email?.split('@')[0] || '匿名用户');
    const displayAvatar = isAuthor && authorProfile?.avatar ? authorProfile.avatar : comment.profile?.avatar_url;

    return (
        <div className="flex space-x-4">
            <div className="flex-shrink-0">
                 {displayAvatar ? (
                    <img src={displayAvatar} alt="Avatar" className="h-10 w-10 rounded-full" />
                 ) : (
                    <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <FaUser />
                    </div>
                 )}
            </div>
            <div className="flex-1">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white mr-2">
                                {displayName}
                            </h4>
                            {/* If we could verify this is the author, we'd add a badge */}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(comment.created_at).toLocaleDateString()} {new Date(comment.created_at).toLocaleTimeString()}
                        </span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                        {comment.content}
                    </p>
                    {currentUser && (
                        <div className="mt-3 flex items-center space-x-4">
                            <button onClick={() => onReply(comment.id)} className="text-xs text-gray-500 hover:text-indigo-600 flex items-center transition">
                                <FaReply className="mr-1" /> 回复
                            </button>
                        </div>
                    )}
                </div>

                {/* Nested Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 space-y-4 pl-4 border-l-2 border-gray-100 dark:border-gray-700">
                        {comment.replies.map(reply => (
                            <CommentItem key={reply.id} comment={reply} onReply={onReply} currentUser={currentUser} authorProfile={authorProfile} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
