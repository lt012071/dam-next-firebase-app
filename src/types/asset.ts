export interface Asset {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  uploader: string;
  uploadedAt: string;
  updatedAt: string;
  visibility: 'public' | 'private';
  latestVersionId?: string;
  [key: string]: unknown;
} 