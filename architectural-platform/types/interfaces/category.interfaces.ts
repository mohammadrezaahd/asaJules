export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  level?: number;
  children?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | null;
  level?: number;
  children: CategoryTree[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  flat?: boolean;
  parent?: string | null;
}