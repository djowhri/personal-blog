'use client';

import { useEffect, useRef } from 'react';

interface ViewCounterProps {
  articleId: string;
}

export default function ViewCounter({ articleId }: ViewCounterProps) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    const increment = async () => {
      if (hasIncremented.current) return;
      
      // 使用localStorage跟踪用户是否已经为该文章增加过阅读次数
      const viewedArticles = JSON.parse(localStorage.getItem('viewedArticles') || '[]');
      
      if (!viewedArticles.includes(articleId)) {
        hasIncremented.current = true; // 立即标记为正在执行或已执行，防止竞态
        
        try {
          // 使用 fetch API 调用服务器端函数
          const response = await fetch('/api/increment-views', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ articleId }),
          });
          
          if (response.ok) {
            // 标记该文章已被阅读
            viewedArticles.push(articleId);
            localStorage.setItem('viewedArticles', JSON.stringify(viewedArticles));
          } else {
            console.error('Failed to increment views:', await response.text());
            hasIncremented.current = false; // 如果失败，允许重试
          }
        } catch (error) {
          console.error('Failed to increment views:', error);
          hasIncremented.current = false; // 如果失败，允许重试
        }
      }
    };
    
    increment();
  }, [articleId]);

  return null;
}
