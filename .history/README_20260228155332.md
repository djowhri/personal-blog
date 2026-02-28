# 个人博客系统 (Personal Blog)

基于 Next.js 16 + React 19 构建的现代化个人博客系统，支持文章管理、用户评论、分类标签等完整功能。

## 技术架构

### 核心技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.6 | React 全栈框架 (App Router) |
| React | 19.2.3 | UI 库 |
| TypeScript | 5.x | 类型安全 |
| Tailwind CSS | 4.x | 原子化 CSS 样式 |
| Supabase | ^0.8.0 | 认证、数据库、SSR |

### 辅助依赖

| 依赖 | 用途 |
|------|------|
| `@supabase/ssr` | 服务端渲染支持 |
| `@tailwindcss/typography` | Markdown 文章样式 |
| `marked` | Markdown 解析 |
| `next-themes` | 明暗主题切换 |
| `react-icons` | 图标库 |

### 项目结构

```
personal-blog/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── page.tsx            # 首页
│   │   ├── about/              # 关于页
│   │   ├── search/             # 搜索页
│   │   ├── editor/             # 文章编辑器
│   │   ├── login/              # 登录
│   │   ├── register/           # 注册
│   │   ├── reset-password/     # 密码重置
│   │   ├── article/[id]/       # 文章详情
│   │   ├── category/[id]/      # 分类页
│   │   ├── tag/[id]/           # 标签页
│   │   └── admin/              # 管理后台
│   │       ├── articles/       # 文章管理
│   │       ├── categories/     # 分类管理
│   │       ├── comments/       # 评论管理
│   │       └── tags/           # 标签管理
│   ├── components/             # React 组件
│   │   ├── blog/               # 博客相关组件
│   │   ├── layout/             # 布局组件
│   │   ├── ui/                 # UI 组件
│   │   └── providers/          # Context Providers
│   └── utils/
│       └── supabase/           # Supabase 客户端
├── public/                     # 静态资源
├── .env.local                  # 环境变量
├── next.config.ts              # Next.js 配置
├── tailwind.config.ts          # Tailwind 配置
└── package.json                # 项目依赖
```

## 功能特性

### 前台功能

- **首页** - 最新文章列表、精选文章
- **文章详情** - Markdown 渲染、阅读量统计、评论系统
- **分类浏览** - 按分类查看文章
- **标签浏览** - 按标签查看文章
- **搜索** - 文章关键词搜索
- **关于** - 个人简介页面
- **主题切换** - 明暗主题支持

### 用户系统

- 用户注册、登录
- 密码重置
- 社交登录 (Supabase Auth)

### 管理后台

- 文章管理 (创建、编辑、删除)
- 分类管理
- 标签管理
- 评论管理

## 快速开始

### 前置要求

- Node.js 18.17 或更高版本
- npm / yarn / pnpm / bun

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd personal-blog

# 安装依赖
npm install
```

### 环境配置

在项目根目录创建 `.env.local` 文件，配置 Supabase 连接：

```env
# Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 构建生产版本

```bash
npm run build
npm start
```

## 可用命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run lint` | 代码检查 |

## 路由清单

| 路由 | 说明 | 权限 |
|------|------|------|
| `/` | 首页 | 公开 |
| `/about` | 关于 | 公开 |
| `/article/[id]` | 文章详情 | 公开 |
| `/category/[id]` | 分类页 | 公开 |
| `/tag/[id]` | 标签页 | 公开 |
| `/search` | 搜索 | 公开 |
| `/login` | 登录 | 公开 |
| `/register` | 注册 | 公开 |
| `/reset-password` | 密码重置 | 公开 |
| `/editor` | 文章编辑器 | 需登录 |
| `/admin` | 管理后台 | 需登录 |
| `/admin/articles` | 文章管理 | 需登录 |
| `/admin/categories` | 分类管理 | 需登录 |
| `/admin/comments` | 评论管理 | 需登录 |
| `/admin/tags` | 标签管理 | 需登录 |

## 数据库表结构 (Supabase)

```sql
-- 用户资料 (profiles)
profiles: id, username, avatar_url, bio, created_at

-- 文章 (articles)
articles: id, title, content, excerpt, cover_image, author_id, category_id, status, views, created_at, updated_at

-- 分类 (categories)
categories: id, name, slug, description

-- 标签 (tags)
tags: id, name, slug

-- 文章标签关联 (article_tags)
article_tags: article_id, tag_id

-- 评论 (comments)
comments: id, article_id, user_id, content, parent_id, created_at
```

## 部署

### Vercel 部署 (推荐)

1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 部署完成

### 自托管

```bash
# 构建
npm run build

# 使用 PM2 启动
pm2 start npm --name "personal-blog" -- start
```

## 许可证

MIT License
