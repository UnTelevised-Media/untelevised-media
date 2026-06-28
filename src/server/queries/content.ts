'use server';

import type { Category } from '@/models/types/sanity';
import { sanityFetch } from '@/lib/sanity/lib/fetch';
import { queryCategories, queryPoliciesList } from '@/lib/sanity/lib/queries';

export interface CategoryQueryResult {
  _id: string;
  title: string;
  order?: number;
  color?: {
    hex?: string;
  };
}

export interface PolicyQueryResult {
  _id: string;
  title: string;
  order?: number;
}

export async function getArticleCategories(): Promise<Category[]> {
  try {
    const { data: categories } = await sanityFetch({
      query: queryCategories,
      tags: ['category'],
    });
    return ((categories as Category[]) ?? []).sort((a: Category, b: Category) => {
      const orderA = parseInt(a.order ?? '0', 10);
      const orderB = parseInt(b.order ?? '0', 10);
      return orderA - orderB;
    });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getNewsCategories(): Promise<CategoryQueryResult[]> {
  try {
    const { data: categories } = await sanityFetch({
      query: queryCategories,
      tags: ['category'],
    });
    return (categories as CategoryQueryResult[]) ?? [];
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  }
}

export async function getPoliciesList(): Promise<PolicyQueryResult[]> {
  try {
    const { data: policies } = await sanityFetch({
      query: queryPoliciesList,
      tags: ['policies'],
    });
    return (policies as PolicyQueryResult[]) ?? [];
  } catch (error) {
    console.error('Failed to fetch policies:', error);
    return [];
  }
}
