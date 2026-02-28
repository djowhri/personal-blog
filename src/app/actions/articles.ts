'use server';

import { createClient } from '@/utils/supabase/server';
import { CreateArticleDTO, UpdateArticleDTO } from '@/types';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function incrementArticleViews(id: string) {
  const supabase = await createClient();
  
  // Try to use RPC for atomic increment
  const { error: rpcError } = await supabase.rpc('increment_article_views', { row_id: id });

  if (rpcError) {
    console.warn('RPC increment_article_views failed, falling back to manual update:', rpcError);
    
    // Fallback: fetch and update manually
    const { data: article, error: fetchError } = await supabase
      .from('articles')
      .select('views')
      .eq('id', id)
      .single();
    
    if (!fetchError && article) {
      const { error: updateError } = await supabase
        .from('articles')
        .update({ views: (article.views || 0) + 1 })
        .eq('id', id);
      
      if (updateError) {
        console.error('Error updating views manually:', updateError);
      }
    } else if (fetchError) {
      console.error('Error fetching article for view increment:', fetchError);
    }
  }
}

export async function getArticles(page = 1, limit = 10, publishedOnly = true) {
  try {
    const supabase = await createClient();
    const start = (page - 1) * limit;
    const end = start + limit - 1;

    let query = supabase
      .from('articles')
      .select(`
        *,
        category:categories(*),
        tags:article_tags(tag:tags(*))
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(start, end);

    if (publishedOnly) {
      query = query.eq('published', true);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching articles:', error);
      return { articles: [], count: 0 };
    }

    if (!data) {
      return { articles: [], count: 0 };
    }

    // Transform the data structure to flatten tags
    const articles = data.map((article: any) => ({
      ...article,
      tags: article.tags ? article.tags.map((t: any) => t.tag) : [],
    }));

    return { articles, count };
  } catch (error) {
    console.error('Error in getArticles function:', error);
    return { articles: [], count: 0 };
  }
}

export async function searchArticles(query: string, limit = 5) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('articles')
    .select('id, title, slug, published, excerpt, created_at, views')
    .eq('published', true)
    .ilike('title', `%${query}%`)
    .limit(limit);

  if (error) {
    console.error('Error searching articles:', error);
    return [];
  }

  return data || [];
}

export async function getArticlesByTag(tagId: string, page = 1, limit = 10) {
  const supabase = await createClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  // Step 1: Get article IDs for this tag
  const { data: tagLinks, error: tagError } = await supabase
    .from('article_tags')
    .select('article_id')
    .eq('tag_id', tagId);

  if (tagError || !tagLinks) {
    return { articles: [], count: 0 };
  }

  const articleIds = tagLinks.map((link: any) => link.article_id);

  if (articleIds.length === 0) {
    return { articles: [], count: 0 };
  }

  // Step 2: Fetch articles
  const { data, error, count } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `, { count: 'exact' })
    .in('id', articleIds)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching articles by tag:', error);
    return { articles: [], count: 0 };
  }

  const articles = data.map((article: any) => ({
    ...article,
    tags: article.tags ? article.tags.map((t: any) => t.tag) : [],
  }));

  return { articles, count };
}

export async function getArticleBySlug(slug: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return {
    ...data,
    tags: data.tags.map((t: any) => t.tag),
  };
}

export async function getArticleById(id: string) {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching article:', error);
    return null;
  }

  return {
    ...data,
    tags: data.tags.map((t: any) => t.tag),
  };
}

export async function createArticle(formData: FormData) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const excerpt = formData.get('excerpt') as string;
  const category_id = formData.get('category_id') as string;
  const published = formData.get('published') === 'true';
  const cover_image = formData.get('cover_image') as string;
  const tagsJson = formData.get('tags') as string;
  const tags = tagsJson ? JSON.parse(tagsJson) : [];
  
  const slugBase = formData.get('slug') as string || title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  let slug = slugBase;
  let counter = 1;

  // Check for slug uniqueness
  while (true) {
    const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
    
    if (!existing) break;
    
    slug = `${slugBase}-${counter}`;
    counter++;
  }

  const articleData = {
    title,
    slug,
    content,
    excerpt,
    category_id: category_id || null,
    published,
    cover_image,
    author_id: user.id,
    reading_time: Math.ceil(content.length / 500), // Crude estimation
  };

  const { data: article, error } = await supabase
    .from('articles')
    .insert(articleData)
    .select()
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return { error: error.message || 'Database error during insertion' };
  }

  if (!article) {
    console.error('Supabase insert error: No data returned');
    return { error: 'No data returned from database' };
  }

  // Handle Tags
  if (tags && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) => ({
          article_id: article.id,
          tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
          .from('article_tags')
          .insert(tagInserts);
          
      if (tagError) {
          console.error('Error inserting tags:', tagError);
          // Non-blocking error, but good to know
      }
  }

  revalidatePath('/');
  redirect(`/article/${article.id}`);
}

export async function updateArticle(id: string, formData: FormData) {
    const supabase = await createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { error: 'Unauthorized' };
    }
  
    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const excerpt = formData.get('excerpt') as string;
    const category_id = formData.get('category_id') as string;
    const published = formData.get('published') === 'true';
    const slug = formData.get('slug') as string;
    const cover_image = formData.get('cover_image') as string;
    const tagsJson = formData.get('tags') as string;
    const tags = tagsJson ? JSON.parse(tagsJson) : [];
  
    const articleData = {
      title,
      slug,
      content,
      excerpt,
      category_id: category_id || null,
      published,
      cover_image,
      updated_at: new Date().toISOString(),
      reading_time: Math.ceil(content.length / 500),
    };
  
    const { error } = await supabase
      .from('articles')
      .update(articleData)
      .eq('id', id)
      .eq('author_id', user.id); // Ensure ownership
  
    if (error) {
      return { error: error.message };
    }

    // Handle Tags (Delete existing and insert new)
    // 1. Delete all existing tags for this article
    const { error: deleteTagsError } = await supabase
        .from('article_tags')
        .delete()
        .eq('article_id', id);
        
    if (deleteTagsError) {
        console.error('Error deleting old tags:', deleteTagsError);
    }

    // 2. Insert new tags
    if (tags && tags.length > 0) {
        const tagInserts = tags.map((tagId: string) => ({
            article_id: id,
            tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
            .from('article_tags')
            .insert(tagInserts);
            
        if (tagError) {
            console.error('Error inserting new tags:', tagError);
        }
    }
  
    revalidatePath(`/article/${id}`);
    revalidatePath('/');
    redirect(`/article/${id}`);
}

export async function deleteArticle(id: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    const { error } = await supabase
        .from('articles')
        .delete()
        .eq('id', id)
        .eq('author_id', user.id);

    if (error) {
        return { error: error.message };
    }

    revalidatePath('/');
    redirect('/');
}

export async function getArticlesByCategory(categoryId: string, page = 1, limit = 10) {
  const supabase = await createClient();
  const start = (page - 1) * limit;
  const end = start + limit - 1;

  const { data, error, count } = await supabase
    .from('articles')
    .select(`
      *,
      category:categories(*),
      tags:article_tags(tag:tags(*))
    `, { count: 'exact' })
    .eq('category_id', categoryId)
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) {
    console.error('Error fetching articles by category:', error);
    return { articles: [], count: 0 };
  }

  const articles = data.map((article: any) => ({
    ...article,
    tags: article.tags ? article.tags.map((t: any) => t.tag) : [],
  }));

  return { articles, count };
}
