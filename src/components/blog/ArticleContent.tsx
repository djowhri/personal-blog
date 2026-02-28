'use client';

import React, { useEffect } from 'react';
import styles from '@/styles/article.module.css';

interface ArticleContentProps {
  html: string;
}

export default function ArticleContent({ html }: ArticleContentProps) {
  useEffect(() => {
    // Dynamically load highlight.js if not present
    if (!(window as any).hljs) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js";
      script.async = true;
      document.body.appendChild(script);
      
      const link = document.createElement('link');
      link.rel = "stylesheet";
      link.href = "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css"; // Using dark theme by default which looks good in both modes usually, or use a neutral one
      document.head.appendChild(link);
      
      script.onload = () => {
        (window as any).hljs?.highlightAll();
      };
      
      return () => {
        document.body.removeChild(script);
        document.head.removeChild(link);
      }
    } else {
      (window as any).hljs.highlightAll();
    }
  }, [html]);

  return (
    <div 
      className={`prose prose-indigo dark:prose-invert mx-auto ${styles.articleContent}`} 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
