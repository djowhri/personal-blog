'use server';

import { createClient } from '@/utils/supabase/server';
import { Comment } from '@/types';
import { revalidatePath } from 'next/cache';

export async function getComments(articleId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *
    `)
    .eq('article_id', articleId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Fetch profiles separately to avoid foreign key issues for now
  const userIds = Array.from(new Set((data || []).map((c: any) => c.user_id).filter(Boolean)));
  
  let profilesMap = new Map();
  if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
      
      if (profiles) {
          profiles.forEach((p: any) => profilesMap.set(p.id, p));
      }
  }

  // Nest comments
  const comments = (data || []).map((c: any) => ({
      ...c,
      profile: profilesMap.get(c.user_id) || null
  })) as Comment[];
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  comments.forEach(comment => {
    comment.replies = [];
    commentMap.set(comment.id, comment);
  });

  comments.forEach(comment => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies?.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
}

export async function createComment(articleId: string, content: string, parentId?: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Ensure profile exists for this user (lazy creation if trigger missed)
  // Actually, let's just insert comment. If profile is missing, it's fine.

  const { error } = await supabase
    .from('comments')
    .insert({
      article_id: articleId,
      content,
      user_id: user.id,
      parent_id: parentId || null,
    });

  if (error) {
    console.error('Error creating comment:', error);
    return { error: error.message };
  }

  revalidatePath(`/article/${articleId}`);
  return { success: true };
}

export async function deleteComment(commentId: string, articleId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath(`/article/${articleId}`);
    return { success: true };
}
