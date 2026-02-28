'use server';

import { createClient } from '@/utils/supabase/server';

export async function subscribeToNewsletter(email: string) {
  const supabase = await createClient();

  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: '请输入有效的邮箱地址' };
  }

  const { error } = await supabase
    .from('subscribers')
    .insert({ email });

  if (error) {
    if (error.code === '23505') { // Unique violation
      return { error: '该邮箱已经订阅过了' };
    }
    console.error('Newsletter subscription error:', error);
    return { error: '订阅失败，请稍后重试' };
  }

  return { success: true };
}
