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
  viewCount?: number;
  lastViewedAt?: string | null;
  tags: TagModel[];
  category?: ArticleCategoryModel | null;
  categories?: ArticleCategoryModel[];
  sections?: ArticleSectionModel[];
}

export interface ArticleSectionModel {
  id: string;
  type: 'paragraph' | 'heading' | 'quote' | 'image' | 'spacer' | 'info_box';
  order: number;
  content?: string;
  headingLevel?: number;
  imageUrl?: string;
  imageCaption?: string;
  quoteAuthor?: string;
  spacerHeight?: number;
  infoBoxTitle?: string;
  data?: Record<string, unknown>;
}
