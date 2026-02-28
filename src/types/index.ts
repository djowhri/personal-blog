export interface Category {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  cover_image: string | null;
  published: boolean;
  author_id: string;
  category_id: string | null;
  views: number;
  reading_time: number;
  created_at: string;
  updated_at: string;
  category?: Category;
  tags?: Tag[];
  author?: {
    email: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface CreateArticleDTO {
  title: string;
  slug: string;
  content?: string;
  excerpt?: string;
  cover_image?: string;
  published?: boolean;
  category_id?: string;
  tags?: string[]; // Array of tag IDs
}

export interface UpdateArticleDTO extends Partial<CreateArticleDTO> {
  id: string;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Comment {
  id: string;
  content: string;
  article_id: string;
  user_id: string | null;
  parent_id: string | null;
  created_at: string;
  profile?: Profile;
  replies?: Comment[];
}
