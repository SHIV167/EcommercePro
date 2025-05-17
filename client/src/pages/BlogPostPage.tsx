import React from 'react';
import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Helmet } from 'react-helmet';
import { Link } from 'wouter';
import { Product } from '@/types/product';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  summary: string;
  content: string;
  imageUrl?: string;
  relatedProducts?: string[];
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: blog, isError, isLoading } = useQuery<Blog, Error>({
    queryKey: ['/api/blogs', slug],
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/blogs/${slug}`);
      if (!res.ok) throw new Error('Blog not found');
      return res.json() as Promise<Blog>;
    },
    enabled: !!slug,
  });
  
  // Fetch related products if available
  const { data: relatedProducts = [] } = useQuery<Product[]>({
    queryKey: ['/api/products/related', blog?.relatedProducts],
    queryFn: async () => {
      if (!blog?.relatedProducts?.length) return [];
      const productIds = blog.relatedProducts.join(',');
      const res = await apiRequest('GET', `/api/products/byIds?ids=${productIds}`);
      return res.json();
    },
    enabled: !!blog?.relatedProducts?.length,
  });

  if (isLoading) return (
    <div className="bg-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
  
  if (isError || !blog) return (
    <div className="bg-white min-h-screen py-10">
      <div className="max-w-3xl mx-auto p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been moved.</p>
        <Link href="/blogs" className="text-primary hover:text-primary-dark underline">Return to all blogs</Link>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>{blog.title} | Kama Ayurveda</title>
        <meta name="description" content={blog.summary} />
        {blog.imageUrl && <meta property="og:image" content={blog.imageUrl} />}
      </Helmet>
      
      <div className="bg-white min-h-screen">
        {/* Banner image at the top */}
        <div className="w-full bg-gray-100 h-64 md:h-80 relative overflow-hidden">
          {blog.imageUrl ? (
            <img 
              src={blog.imageUrl} 
              alt={blog.title} 
              className="w-full h-full object-cover" 
            />
          ) : (
            <img 
              src="/uploads/blog-default-banner.jpg" 
              alt="Blog banner" 
              className="w-full h-full object-cover" 
            />
          )}
        </div>

        {/* Breadcrumb navigation */}
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="text-sm text-gray-500 flex items-center">
            <Link href="/" className="hover:text-primary">HOME</Link>
            <span className="mx-2">❯</span>
            <Link href="/blog" className="hover:text-primary">BLOG</Link>
            <span className="mx-2">❯</span>
            <span className="uppercase">{blog.title}</span>
          </div>
        </div>
        
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="w-full lg:w-2/3 bg-white overflow-hidden">
          
          {/* Blog content */}
          <div className="p-8">
            {/* Title and meta */}
            <div className="text-left mb-8 border-b border-gray-200 pb-4">
              <h1 className="text-3xl font-medium mb-2">{blog.title}</h1>
              <p className="text-sm text-gray-500">
                {blog.author && <span className="font-medium">Authored by: {blog.author}</span>}<br/>
                {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            
            {/* Content */}
            <article>
              <div 
                className="prose max-w-none prose-headings:font-medium prose-p:text-gray-700 prose-p:my-4 prose-a:text-primary prose-img:my-8"
                dangerouslySetInnerHTML={{ __html: blog.content }} 
              />
            </article>
            
            {/* Related products */}
            {relatedProducts.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-2xl font-serif font-medium mb-6 text-center">Products Mentioned</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {relatedProducts.map(product => (
                    <div key={product._id} className="flex flex-col items-center">
                      <Link href={`/products/${product.slug}`} className="block w-full">
                        <div className="aspect-square overflow-hidden rounded-md mb-3 bg-gray-50">
                          <img 
                            src={product.images?.[0] || product.imageUrl} 
                            alt={product.name} 
                            className="w-full h-full object-cover transition-transform hover:scale-105" 
                          />
                        </div>
                        <h3 className="text-sm font-medium text-center">{product.name}</h3>
                        <p className="text-sm text-center text-primary font-medium mt-1">₹{product.price}</p>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Share and navigation */}
            <div className="mt-10 pt-6 border-t border-gray-200 flex justify-between items-center">
              <Link href="/blogs" className="text-sm text-primary hover:underline">&larr; Back to all articles</Link>
              <div className="flex space-x-4">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Share on Facebook</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(blog.title)}&url=${encodeURIComponent(window.location.href)}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-700">
                  <span className="sr-only">Share on Twitter</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            {/* About the Author */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-medium mb-4">About the Author</h3>
              <div className="flex items-start">
                <div className="w-20 h-20 rounded-full overflow-hidden mr-5">
                  <img src="/uploads/author-shreya.jpg" alt="Shreya Dalela" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-medium mb-2">Shreya Dalela</h4>
                  <p className="text-sm text-gray-700">
                    Shreya Dalela is a certified Yoga Instructor and a professional dancer trained at The Danceworkx. She's passionate about Ayurveda and holistic living with over 8 years of experience in doing extensive research and content creation in the domain.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Was this article helpful */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-medium mb-4">Was this article helpful?</h3>
              <div className="flex space-x-4">
                <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary">
                  No
                </button>
                <button className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:border-primary">
                  Yes
                </button>
              </div>
            </div>
            
            {/* Related Posts */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-xl font-medium mb-6">Related Posts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <a href="#" className="block group">
                    <div className="aspect-video overflow-hidden bg-gray-100 mb-3">
                      <img src="/uploads/aloe-vera-plant.jpg" alt="Aloe Vera Plant" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-medium text-sm group-hover:text-primary">Natural Remedies for Sunburn Relief at Home</h4>
                  </a>
                </div>
                <div>
                  <a href="#" className="block group">
                    <div className="aspect-video overflow-hidden bg-gray-100 mb-3">
                      <img src="/uploads/aloe-vera-juice.jpg" alt="Aloe Vera Juice" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-medium text-sm group-hover:text-primary">Health Benefits of Drinking Aloe Vera Juice Daily</h4>
                  </a>
                </div>
                <div>
                  <a href="#" className="block group">
                    <div className="aspect-video overflow-hidden bg-gray-100 mb-3">
                      <img src="/uploads/skincare-routine.jpg" alt="Skincare Routine" className="w-full h-full object-cover" />
                    </div>
                    <h4 className="font-medium text-sm group-hover:text-primary">Create the Perfect Ayurvedic Skincare Routine</h4>
                  </a>
                </div>
              </div>
            </div>
          </div>
            </div>
            
            {/* Sidebar with highlights */}
            <div className="w-full lg:w-1/3 space-y-8 lg:sticky lg:top-10 lg:self-start">
              {/* Highlights box */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-xl font-medium mb-4">Highlights</h3>
                <ul className="space-y-4">
                  <li>
                    <a href="#" className="flex items-start group">
                      <div className="w-16 h-16 overflow-hidden flex-shrink-0 bg-gray-100 mr-3">
                        <img src="/uploads/aloe-vera-benefits.jpg" alt="Aloe Vera Benefits" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Can You Put Aloe Vera On Your Face?</h4>
                        <p className="text-xs text-gray-500 mt-1">May 12, 2025</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-start group">
                      <div className="w-16 h-16 overflow-hidden flex-shrink-0 bg-gray-100 mr-3">
                        <img src="/uploads/aloe-vera-benefits.jpg" alt="Aloe Vera Benefits" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">Top 10 Aloe Vera Benefits For Face</h4>
                        <p className="text-xs text-gray-500 mt-1">April 28, 2025</p>
                      </div>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="flex items-start group">
                      <div className="w-16 h-16 overflow-hidden flex-shrink-0 bg-gray-100 mr-3">
                        <img src="/uploads/aloe-vera-benefits.jpg" alt="Aloe Vera Usage" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">How To Use Aloe Vera For Face?</h4>
                        <p className="text-xs text-gray-500 mt-1">April 15, 2025</p>
                      </div>
                    </a>
                  </li>
                </ul>
              </div>
              
              {/* Featured product */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-xl font-medium mb-4">Featured Product</h3>
                <div className="text-center">
                  <div className="aspect-square max-w-[200px] mx-auto overflow-hidden bg-gray-50 mb-4">
                    <img src="/uploads/kumkumadi-oil.jpg" alt="Kumkumadi Brightening Ayurvedic Face Oil" className="w-full h-full object-contain" />
                  </div>
                  <h4 className="font-medium mb-1">Kumkumadi Brightening Ayurvedic Face Oil</h4>
                  <p className="text-primary font-medium mb-3">₹2,495.00</p>
                  <Link href="/products/kumkumadi-oil" className="block w-full border border-primary text-primary py-2 px-4 hover:bg-primary hover:text-white transition-colors text-sm font-medium">View Product</Link>
                </div>
              </div>
              
              {/* Newsletter signup */}
              <div className="bg-white border border-gray-200 p-6">
                <h3 className="text-xl font-medium mb-2">Subscribe to Our Newsletter</h3>
                <p className="text-sm text-gray-600 mb-4">Get the latest articles and product updates</p>
                <form className="space-y-3">
                  <input type="email" placeholder="Your email address" className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
                  <button type="submit" className="w-full bg-primary text-white py-2 px-4 rounded-sm hover:bg-primary-dark transition-colors text-sm font-medium">Subscribe</button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
