export interface TagModel {
  id: string;
  name: string;
}

export interface ArticleCategoryModel {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export interface ArticleModel {
  id: string;
  title: string;
  slug: string;
  author: string;
  date: string;
  readingTime: string;
  bannerImage?: string;
  isVisible: boolean;
  tags: TagModel[];
  category?: ArticleCategoryModel | null;
}
