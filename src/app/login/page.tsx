'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaFeather, FaLock, FaGoogle, FaGithub, FaTwitter } from 'react-icons/fa6';
import { login, signInWithOAuth } from './actions'; 
import { createClient } from '@/utils/supabase/client';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState<string | null>(null);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        // 使用客户端Supabase实例直接登录
        const { error, data } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            // 将英文错误信息转换为中文
            let errorMessage = '登录失败，请稍后重试';
            
            if (error.message.includes('Invalid login credentials')) {
                errorMessage = '邮箱或密码错误';
            } else if (error.message.includes('User not found')) {
                errorMessage = '用户不存在';
            } else if (error.message.includes('Email not confirmed')) {
                errorMessage = '邮箱尚未验证';
            } else if (error.message.includes('Rate limit exceeded')) {
                errorMessage = '登录次数过多，请稍后再试';
            }
            
            setError(errorMessage);
        } else {
            // 登录成功，根据用户角色重定向
            if (data?.user?.email === 'admin@example.com') {
                router.push('/admin');
            } else {
                router.push('/');
            }
        }
    } catch (err) {
        console.error('Login form error:', err);
        setError('登录过程中发生错误，请检查网络连接后重试');
    } finally {
        setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError(null);
    setForgotMessage(null);

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
            redirectTo: `${window.location.origin}/reset-password`
        });
        
        if (error) {
            let errorMessage = '发送重置密码邮件失败，请稍后重试';
            if (error.message.includes('Rate limit exceeded') || error.status === 429) {
                errorMessage = '尝试次数过多，请稍后再试（每个邮箱有频率限制）';
            }
            setForgotError(errorMessage);
        } else {
            setForgotMessage('重置密码邮件已发送，请查收邮箱');
            setForgotEmail('');
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        setForgotError('发送重置密码邮件失败，请检查网络连接后重试');
    } finally {
        setForgotLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
        await signInWithOAuth('google');
    } catch (err) {
        console.error('Google login error:', err);
        setError('Google登录过程中发生错误，请检查网络连接后重试');
        setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
        await signInWithOAuth('github');
    } catch (err) {
        console.error('GitHub login error:', err);
        setError('GitHub登录过程中发生错误，请检查网络连接后重试');
        setIsLoading(false);
    }
  };

  const handleTwitterLogin = async () => {
    setIsLoading(true);
    try {
        await signInWithOAuth('twitter');
    } catch (err) {
        console.error('Twitter login error:', err);
        setError('Twitter登录过程中发生错误，请检查网络连接后重试');
        setIsLoading(false);
    }
  };


  return (
    <div className="bg-gray-50 h-screen flex items-center justify-center relative font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden relative" id="login-container">
        {/* Form Section */}
        <div id="form-section" className="p-8 space-y-8 transition-opacity duration-300">
          {!showForgotPassword ? (
            <>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  <FaFeather />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  欢迎回来
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  登录以管理您的博客文章
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                <input type="hidden" name="remember" value="true" />
                
                {message && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <div className="rounded-md shadow-sm -space-y-px">
                  <div>
                    <label htmlFor="email-address" className="sr-only">电子邮箱</label>
                    <input
                      id="email-address"
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="电子邮箱地址"
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="sr-only">密码</label>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                      placeholder="密码"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <button 
                      onClick={() => setShowForgotPassword(true)}
                      className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                    >
                      忘记密码?
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      {isLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FaLock className="text-indigo-500 group-hover:text-indigo-400 transition ease-in-out duration-150" />
                      )}
                    </span>
                    {isLoading ? '登录中...' : '登录'}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">
                      或者使用第三方登录
                    </span>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div>
                    <button
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 disabled:opacity-75 disabled:cursor-not-allowed"
                      title="Google"
                    >
                      <FaGoogle className="text-xl text-red-500 mr-2" />
                      <span className="">Google</span>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={handleGithubLogin}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 disabled:opacity-75 disabled:cursor-not-allowed"
                      title="GitHub"
                    >
                      <FaGithub className="text-xl text-gray-800 mr-2" />
                      <span className="">GitHub</span>
                    </button>
                  </div>
                  <div>
                    <button
                      onClick={handleTwitterLogin}
                      disabled={isLoading}
                      className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-150 disabled:opacity-75 disabled:cursor-not-allowed"
                      title="Twitter"
                    >
                      <FaTwitter className="text-xl text-blue-400 mr-2" />
                      <span className="">Twitter</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  <span>还没有账号？</span>
                  <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none ml-1">
                    立即注册
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                  <FaLock />
                </div>
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
                  重置密码
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  输入您的邮箱地址，我们将发送重置密码的链接
                </p>
              </div>

              <form className="mt-8 space-y-6" onSubmit={handleForgotPassword}>
                {forgotMessage && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                    {forgotMessage}
                  </div>
                )}

                {forgotError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                    {forgotError}
                  </div>
                )}

                <div>
                  <label htmlFor="forgot-email" className="sr-only">电子邮箱</label>
                  <input
                    id="forgot-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="电子邮箱地址"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
                  >
                    返回登录
                  </button>
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out ${forgotLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                      {forgotLoading ? (
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <FaLock className="text-indigo-500 group-hover:text-indigo-400 transition ease-in-out duration-150" />
                      )}
                    </span>
                    {forgotLoading ? '发送中...' : '发送重置链接'}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
