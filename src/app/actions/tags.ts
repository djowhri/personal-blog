'use server';

import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

function getServiceRoleClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serviceRoleKey) {
    throw new Error('Service role key not configured');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function getTagById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function getTags() {
    const supabase = await createServerClient();
    
    const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('*');
    
    if (tagsError) {
        console.error('Error fetching tags:', tagsError);
        return [];
    }

    const { data: usages, error: usagesError } = await supabase
        .from('article_tags')
        .select('tag_id');
        
    if (usagesError) {
        console.error('Error fetching tag usages:', usagesError);
        return tags || [];
    }

    const counts: Record<string, number> = {};
    usages?.forEach((usage: any) => {
        const id = usage.tag_id;
        counts[id] = (counts[id] || 0) + 1;
    });

    const tagsWithCount = tags.map((tag: any) => ({
        ...tag,
        count: counts[tag.id] || 0
    }));

    return tagsWithCount.sort((a: any, b: any) => b.count - a.count);
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
}

async function getUniqueSlug(baseSlug: string, supabase: any, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    let query = supabase.from('tags').select('id').eq('slug', slug);
    if (excludeId) {
      query = query.neq('id', excludeId);
    }
    
    const { data } = await query;
    
    if (!data || data.length === 0) {
      return slug;
    }
    
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

export async function createTag(name: string) {
  const supabase = await createServerClient();
  const baseSlug = generateSlug(name);
  const slug = await getUniqueSlug(baseSlug, supabase);

  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    return { tag: existing };
  }

  const { data, error } = await supabase
    .from('tags')
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    console.error('Error creating tag:', error);
    return { error: error.message };
  }
  
  return { tag: data };
}

export async function updateTag(id: string, name: string) {
  const supabase = await createServerClient();
  const baseSlug = generateSlug(name);
  const slug = await getUniqueSlug(baseSlug, supabase, id);

  const { data, error } = await supabase
    .from('tags')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/tags');
  return { tag: data };
}

export async function deleteTag(id: string) {
  try {
    const supabase = getServiceRoleClient();

    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete tag error:', error);
      return { error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/tags');
    return { success: true };
  } catch (error) {
    console.error('Delete tag error:', error);
    return { error: '删除失败，请稍后重试' };
  }
}
