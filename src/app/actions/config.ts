'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export interface AuthorProfile {
  name: string;
  title: string;
  bio: string;
  avatar: string;
  email?: string;
  user_id?: string;
  social: {
    github: string;
    twitter: string;
    linkedin: string;
  };
}

export async function getAuthorProfile(userId?: string): Promise<AuthorProfile | null> {
  const supabase = await createClient();
  
  let targetUserId = userId;
  
  // 如果没有传入 userId，则尝试获取当前登录用户
  if (!targetUserId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      targetUserId = user.id;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', targetUserId)
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // PGRST116 is not found
        console.error('Error fetching author profile:', error);
    }
    return null;
  }

  return {
      name: data.full_name || '',
      title: data.title || '',
      bio: data.bio || '',
      avatar: data.avatar_url || '',
      email: data.email || '',
      user_id: data.id,
      social: data.social || { github: '', twitter: '', linkedin: '' }
  };
}

export async function updateAuthorProfile(profile: AuthorProfile) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }
  
  // Map our frontend profile to DB schema
  const dbProfile = {
      id: user.id,
      full_name: profile.name,
      title: profile.title,
      bio: profile.bio,
      avatar_url: profile.avatar,
      email: profile.email || user.email,
      social: profile.social
  };

  const { error } = await supabase
    .from('profiles')
    .upsert(dbProfile);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}
