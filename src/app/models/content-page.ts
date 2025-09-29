export interface ContentPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  meta_description?: string;
  meta_keywords?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
  author?: any;
  category?: string;
}


