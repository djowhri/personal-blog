'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaLock, FaArrowLeft } from 'react-icons/fa6';
import { createClient } from '@/utils/supabase/client';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const hasHashToken = hash.includes('access_token=') || hash.includes('type=recovery');
    const code = searchParams.get('code');
    const hasQueryToken = !!code || !!searchParams.get('token_hash');
    
    if (!hasHashToken && !hasQueryToken) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!session) {
          setError('无效的重置密码链接或链接已过期。');
        } else {
          setSessionReady(true);
        }
      });
    }

    if (code) {
      supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
        if (error) {
          console.error('Error exchanging code for session:', error);
          setError('验证代码失败，链接可能已过期。' + error.message);
        } else {
          setSessionReady(true);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setError(null);
        setSessionReady(true);
      } else if (session) {
        setSessionReady(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [searchParams, supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    if (!sessionReady) {
      setError('正在加载授权信息，请稍后再试');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      setIsLoading(false);
      return;
    }

    try {
      const { error, data } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error('Update user error details:', error);
        setError(`重置密码失败: ${error.message || '请稍后重试'}`);
      } else if (!data.user) {
         setError('重置密码失败: 未获取到用户数据');
      } else {
        setMessage('密码重置成功，请登录');
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('重置密码过程中发生错误，请检查网络连接后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 h-screen flex items-center justify-center relative font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden relative">
        <div className="absolute top-4 left-4 z-10">
          <button
            onClick={() => router.push('/login')}
            className="p-2 text-gray-600 hover:text-gray-900 transition bg-gray-100 rounded-full"
            title="返回登录"
          >
            <FaArrowLeft />
          </button>
        </div>

        <div className="p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              <FaLock />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              重置密码
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              输入您的新密码
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {message}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="password" className="sr-only">新密码</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="新密码"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="sr-only">确认新密码</label>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm rounded-b-md"
                  placeholder="确认新密码"
                />
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
                {isLoading ? '重置中...' : '重置密码'}
              </button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              <span>想起密码了？</span>
              <button
                onClick={() => router.push('/login')}
                className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none ml-1"
              >
                立即登录
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="bg-gray-50 h-screen flex items-center justify-center relative font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden relative">
        <div className="p-8 space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              <FaLock />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              重置密码
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              正在加载...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}
