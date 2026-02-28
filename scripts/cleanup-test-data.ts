import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTestData() {
  console.log('开始清理测试数据...\n');

  try {
    // 删除评论（按顺序删除，先删除子评论）
    console.log('正在删除评论...');
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (commentsError) {
      console.error('删除评论失败:', commentsError.message);
    } else {
      console.log('✓ 评论已删除');
    }

    // 删除文章标签关联
    console.log('\n正在删除文章标签关联...');
    const { error: articleTagsError } = await supabase
      .from('article_tags')
      .delete()
      .neq('article_id', '00000000-0000-0000-0000-000000000000');
    
    if (articleTagsError) {
      console.error('删除文章标签关联失败:', articleTagsError.message);
    } else {
      console.log('✓ 文章标签关联已删除');
    }

    // 删除文章
    console.log('\n正在删除文章...');
    const { error: articlesError } = await supabase
      .from('articles')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (articlesError) {
      console.error('删除文章失败:', articlesError.message);
    } else {
      console.log('✓ 文章已删除');
    }

    // 删除标签
    console.log('\n正在删除标签...');
    const { error: tagsError } = await supabase
      .from('tags')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (tagsError) {
      console.error('删除标签失败:', tagsError.message);
    } else {
      console.log('✓ 标签已删除');
    }

    // 删除分类
    console.log('\n正在删除分类...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (categoriesError) {
      console.error('删除分类失败:', categoriesError.message);
    } else {
      console.log('✓ 分类已删除');
    }

    console.log('\n✅ 测试数据清理完成！');
    console.log('注意：用户数据 (users, profiles) 已保留');

  } catch (error) {
    console.error('清理过程中发生错误:', error);
  }
}

cleanupTestData();
