'use client';

import React, { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <div className="bg-gray-50 h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900">登录中，请稍候...</h2>
        <p className="mt-2 text-gray-600">正在处理登录请求，请不要关闭此页面</p>
      </div>
    </div>
  );
}

function LoginCallbackPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">登录中，请稍候...</h2>
          <p className="mt-2 text-gray-600">正在处理登录请求，请不要关闭此页面</p>
        </div>
      </div>
    }>
      <LoginCallbackContent />
    </Suspense>
  );
}

export default LoginCallbackPage;
