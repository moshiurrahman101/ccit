/**
 * Utility functions for automatic OG image generation
 */

export interface OGImageConfig {
  type?: 'page' | 'blog' | 'course' | 'batch';
  title?: string;
  description?: string;
  category?: string;
  author?: string;
  date?: string;
  tags?: string | string[];
  id?: string;
  slug?: string;
  price?: number;
}

/**
 * Generate automatic OG image URL based on content
 */
export function generateOGImageURL(config: OGImageConfig): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // If we have a specific content type and slug, use the content-specific endpoint
  if (config.type && config.slug) {
    return `${baseUrl}/api/og/content/${config.type}/${config.slug}`;
  }
  
  // Otherwise, use the auto generation endpoint
  const params = new URLSearchParams();
  
  if (config.type) params.append('type', config.type);
  if (config.title) params.append('title', config.title);
  if (config.description) params.append('description', config.description);
  if (config.category) params.append('category', config.category);
  if (config.author) params.append('author', config.author);
  if (config.date) params.append('date', config.date);
  if (config.id) params.append('id', config.id);
  
  // Handle tags array or string
  if (config.tags) {
    const tagsString = Array.isArray(config.tags) 
      ? config.tags.join(',') 
      : config.tags;
    params.append('tags', tagsString);
  }
  
  return `${baseUrl}/api/og/auto?${params.toString()}`;
}

/**
 * Generate OG image URL for blog posts
 */
export function generateBlogOGImage(blog: {
  title: string;
  description?: string;
  slug: string;
  category?: string;
  author?: string;
  createdAt?: string;
  tags?: string[];
}): string {
  return generateOGImageURL({
    type: 'blog',
    title: blog.title,
    description: blog.description,
    slug: blog.slug,
    category: blog.category,
    author: blog.author,
    date: blog.createdAt,
    tags: blog.tags
  });
}

/**
 * Generate OG image URL for courses
 */
export function generateCourseOGImage(course: {
  title: string;
  description?: string;
  slug: string;
  category?: string;
  instructor?: string;
  createdAt?: string;
  tags?: string[];
  price?: number;
}): string {
  return generateOGImageURL({
    type: 'course',
    title: course.title,
    description: course.description,
    slug: course.slug,
    category: course.category,
    author: course.instructor,
    date: course.createdAt,
    tags: course.tags,
    price: course.price
  });
}

/**
 * Generate OG image URL for batches
 */
export function generateBatchOGImage(batch: {
  title: string;
  description?: string;
  slug: string;
  course?: string;
  instructor?: string;
  createdAt?: string;
  tags?: string[];
}): string {
  return generateOGImageURL({
    type: 'batch',
    title: batch.title,
    description: batch.description,
    slug: batch.slug,
    category: batch.course,
    author: batch.instructor,
    date: batch.createdAt,
    tags: batch.tags
  });
}

/**
 * Generate OG image URL for generic pages
 */
export function generatePageOGImage(page: {
  title: string;
  description?: string;
  category?: string;
  tags?: string[];
}): string {
  return generateOGImageURL({
    type: 'page',
    title: page.title,
    description: page.description,
    category: page.category,
    tags: page.tags
  });
}

/**
 * Validate and clean content for OG image generation
 */
export function sanitizeContentForOG(content: string, maxLength: number = 150): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, ' ') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, maxLength)
    + (content.length > maxLength ? '...' : '');
}
