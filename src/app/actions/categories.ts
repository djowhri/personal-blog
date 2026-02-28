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

export async function getCategories() {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select(`
        *,
        articles:articles(count)
    `)
    .eq('articles.published', true)
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data.map((cat: any) => ({
    ...cat,
    articleCount: cat.articles ? cat.articles[0]?.count || 0 : 0
  }));
}

function generateSlug(name: string): string {
  let slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  return slug;
}

async function getUniqueSlug(baseSlug: string, supabase: any, excludeId?: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  
  while (true) {
    let query = supabase.from('categories').select('id').eq('slug', slug);
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

export async function createCategory(name: string) {
  const supabase = await createServerClient();
  const baseSlug = generateSlug(name);
  const slug = await getUniqueSlug(baseSlug, supabase);

  const { data, error } = await supabase
    .from('categories')
    .insert({ name, slug })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  return { category: data };
}

export async function getCategoryById(id: string) {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return null;
  }
  return data;
}

export async function updateCategory(id: string, name: string) {
  const supabase = await createServerClient();
  const baseSlug = generateSlug(name);
  const slug = await getUniqueSlug(baseSlug, supabase, id);

  const { data, error } = await supabase
    .from('categories')
    .update({ name, slug })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin/categories');
  return { category: data };
}

export async function deleteCategory(id: string) {
  try {
    const supabase = getServiceRoleClient();
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Delete category error:', error);
      return { error: error.message };
    }

    revalidatePath('/');
    revalidatePath('/admin/categories');
    return { success: true };
  } catch (error) {
    console.error('Delete category error:', error);
    return { error: '删除失败，请稍后重试' };
  }
}
