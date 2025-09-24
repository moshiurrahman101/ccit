import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  User, 
  Eye, 
  Clock, 
  Tag,
  ArrowLeft,
  Share2,
  Heart
} from 'lucide-react';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage?: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
  };
  views: number;
  likes: number;
  readingTime: number;
  publishedAt: string;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
  };
}

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/blogs/slug/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.blog;
  } catch (error) {
    console.error('Error fetching blog:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const blog = await getBlog(params.slug);

  if (!blog) {
    return {
      title: 'Blog Post Not Found',
    };
  }

  const title = blog.seo?.metaTitle || blog.title;
  const description = blog.seo?.metaDescription || blog.excerpt;
  const image = blog.seo?.ogImage || blog.featuredImage || '/default-og-image.jpg';

  return {
    title,
    description,
    keywords: blog.seo?.keywords?.join(', ') || blog.tags.join(', '),
    authors: [{ name: blog.author.name }],
    openGraph: {
      title,
      description,
      images: [image],
      type: 'article',
      publishedTime: blog.publishedAt,
      authors: [blog.author.name],
      tags: blog.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: blog.seo?.canonicalUrl || `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/blog/${blog.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const blog = await getBlog(params.slug);

  if (!blog) {
    notFound();
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-white hover:bg-white/20 mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              ব্লগে ফিরে যান
            </Button>
          </Link>
          
          <div className="flex items-center space-x-4 mb-4">
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              {blog.category}
            </Badge>
            <Badge variant="outline" className="text-white border-white/30">
              <Eye className="h-3 w-3 mr-1" />
              {blog.views} ভিউ
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
            {blog.title}
          </h1>
          
          <p className="text-xl text-blue-100 mb-6 leading-relaxed">
            {blog.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>{blog.author.name}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formatDate(blog.publishedAt)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                <span>{blog.readingTime} মিনিট পড়ার সময়</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Share2 className="w-4 h-4 mr-2" />
                শেয়ার
              </Button>
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <Heart className="w-4 h-4 mr-2" />
                {blog.likes}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {blog.featuredImage && (
          <div className="relative h-64 md:h-96 w-full mb-12 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={blog.featuredImage}
              alt={blog.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Blog Content */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50">
          <CardContent className="p-8 md:p-12">
            <div 
              className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-800 prose-code:text-gray-800 prose-pre:bg-gray-100 prose-blockquote:border-l-blue-600 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </CardContent>
        </Card>

        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Tag className="h-5 w-5 mr-2" />
              ট্যাগসমূহ
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-sm px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Author Info */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/50 mt-8">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {blog.author.avatar ? (
                <Image
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {blog.author.name.charAt(0)}
                  </span>
                </div>
              )}
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {blog.author.name}
                </h3>
                <p className="text-gray-600">
                  এই ব্লগ পোস্টের লেখক। প্রযুক্তি এবং প্রোগ্রামিং সম্পর্কে আরও তথ্যের জন্য আমাদের সাথে থাকুন।
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Posts - Placeholder for now */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">সম্পর্কিত পোস্ট</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  আরও ব্লগ পোস্ট শীঘ্রই আসছে...
                </h4>
                <p className="text-gray-600 text-sm">
                  আমরা নিয়মিতভাবে নতুন এবং আকর্ষণীয় কন্টেন্ট প্রকাশ করি।
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-white/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-800 mb-2">
                  আমাদের সাথে যুক্ত থাকুন
                </h4>
                <p className="text-gray-600 text-sm">
                  নতুন পোস্টের নোটিফিকেশন পেতে আমাদের নিউজলেটারে সাবস্ক্রাইব করুন।
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
