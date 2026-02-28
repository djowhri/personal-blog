'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function login(formData: FormData) {
  const supabase = await createClient()

  let email = formData.get('email') as string
  const password = formData.get('password') as string

  // Handle "admin" username login
  if (email === 'admin') {
    email = 'admin@example.com';
  }

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('Login error:', error);
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  
  // Redirect to admin dashboard if user is admin@example.com
  if (data?.user?.email === 'admin@example.com') {
    redirect('/admin')
  } else {
    redirect('/')
  }
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=' + encodeURIComponent('注册成功，请登录'))
}

export async function signInWithOAuth(provider: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: provider as any,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`
    }
  })
  
  if (error) {
    console.error('OAuth login error:', error);
    redirect('/login?error=oauth_failed')
  }
  
  if (data.url) {
    redirect(data.url)
  }
  
  redirect('/login?error=oauth_failed')
}
