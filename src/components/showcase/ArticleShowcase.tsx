// src/components/showcase/ArticleShowcase.tsx
/* eslint-disable react/function-component-definition */
'use client';

import React, { useState, useEffect } from 'react';
import {
  ArticleCard,
  ArticleListCard,
  FeaturedArticleCard,
} from '@/components/cards/ArticleCards';
import ArticleCategoryNav from '@/components/global/ArticleCategoryNav';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ArticleShowcaseProps {
  articles: Article[];
  categories: Category[];
  featuredArticle?: Article;
}

export default function ArticleShowcase({
  articles,
  categories,
  featuredArticle,
}: ArticleShowcaseProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>(articles);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    if (selectedCategory) {
      const filtered = articles.filter((article) =>
        article.categories?.some((cat) => cat._id === selectedCategory._id)
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  }, [selectedCategory, articles]);

  const handleCategoryChange = (category: Category) => {
    if (selectedCategory?._id === category._id) {
      setSelectedCategory(null); // Deselect if same category
    } else {
      setSelectedCategory(category);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
  };

  return (
    <div className='mx-auto max-w-[95vw] space-y-8 md:max-w-[85vw]'>
      {/* Featured Article */}
      {featuredArticle && (
        <section className='mb-12'>
          <h2 className='border-untele/30 mb-6 border-b pb-2 text-3xl font-bold text-slate-200'>
            Featured Story
          </h2>
          <FeaturedArticleCard article={featuredArticle} />
        </section>
      )}

      {/* Category Navigation */}
      <section>
        <ArticleCategoryNav
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={handleCategoryChange}
        />

        {selectedCategory && (
          <div className='mt-4 flex items-center gap-4 px-4'>
            <span className='text-slate-300'>
              Showing articles in:{' '}
              <span className='text-untele font-bold'>{selectedCategory.title}</span>
            </span>
            <button
              onClick={clearFilters}
              className='hover:text-untele text-sm text-slate-400 underline transition-colors'
            >
              Clear filters
            </button>
          </div>
        )}
      </section>

      {/* View Mode Toggle */}
      <section className='flex items-center justify-between px-4'>
        <h2 className='text-2xl font-bold text-slate-200'>
          {selectedCategory ? `${selectedCategory.title} Articles` : 'Latest Articles'}
          <span className='ml-2 text-lg text-slate-400'>({filteredArticles.length})</span>
        </h2>

        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
          <TabsList className='border border-slate-500 bg-slate-600'>
            <TabsTrigger
              value='grid'
              className='data-[state=active]:bg-untele data-[state=active]:text-white'
            >
              Grid
            </TabsTrigger>
            <TabsTrigger
              value='list'
              className='data-[state=active]:bg-untele data-[state=active]:text-white'
            >
              List
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </section>

      {/* Articles Display */}
      <section className='px-4'>
        {filteredArticles.length > 0 ? (
          <Tabs value={viewMode}>
            <TabsContent value='grid'>
              <div className='grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3'>
                <ArticleCard articles={filteredArticles} />
              </div>
            </TabsContent>
            <TabsContent value='list'>
              <div className='mx-auto max-w-4xl'>
                <ArticleListCard articles={filteredArticles} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className='py-12 text-center'>
            <p className='text-lg text-slate-400'>
              No articles found{selectedCategory ? ` in ${selectedCategory.title}` : ''}.
            </p>
            {selectedCategory && (
              <button
                onClick={clearFilters}
                className='bg-untele hover:bg-untele/80 mt-4 rounded-lg px-6 py-2 text-white transition-colors'
              >
                View All Articles
              </button>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
