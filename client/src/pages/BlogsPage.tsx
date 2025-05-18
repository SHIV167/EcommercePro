import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import '@/styles/blog-post.css';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  summary: string;
  imageUrl?: string;
}

export default function BlogsPage() {
  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/blogs');
      return res.json();
    },
  });

  // Add the blog-post-page class to the body for consistent styling
  useEffect(() => {
    document.body.classList.add('blog-post-page');
    
    return () => {
      document.body.classList.remove('blog-post-page');
    };
  }, []);

  if (isLoading) return (
    <div className="min-h-screen py-10">
      <div className="blog-container">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="bg-white rounded-md overflow-hidden shadow-sm">
                <div className="h-52 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Helmet>
        <title>Kama Blog | Kama Ayurveda</title>
        <meta name="description" content="Read our latest blog articles on skincare, wellness, and beauty tips." />
      </Helmet>
      
      <div className="min-h-screen py-10">
        <div className="blog-container">
          {/* Header with Kama Blog and navigation */}
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h1 className="text-3xl font-serif">Kama Blog</h1>
            <div className="text-sm text-gray-500 flex items-center">
              <Link href="/" className="hover:text-primary">HOME</Link>
              <span className="mx-2">❯</span>
              <span className="text-primary">BLOG</span>
            </div>
          </div>
          
          {/* Blog Grid - Using style from the Kama Ayurveda screenshot */}
          <div className="grid md:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog._id} className="relative rounded-md overflow-hidden group cursor-pointer">
                <Link href={`/blogs/${blog.slug}`}>
                  {blog.imageUrl ? (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-52 object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-52 bg-gray-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4">
                    <h2 className="text-white text-xl font-medium">{blog.title}</h2>
                    <div className="text-white/80 text-sm mt-2 flex justify-between items-center">
                      <span>{new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</span>
                      <span className="text-white hover:underline">Read More</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
          
          {/* Additional content section with featured articles */}
          <div className="mt-12">
            <h2 className="text-2xl font-serif mb-6">Featured Articles</h2>
            <div className="grid md:grid-cols-2 gap-8">
              {blogs.slice(0, 2).map((blog) => (
                <div key={`featured-${blog._id}`} className="bg-white p-6 rounded-md shadow-sm flex flex-col md:flex-row gap-4 hover:shadow-md transition-shadow">
                  <div className="w-full md:w-1/3 aspect-square overflow-hidden rounded">
                    {blog.imageUrl ? (
                      <img
                        src={blog.imageUrl}
                        alt={blog.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="w-full md:w-2/3">
                    <h3 className="text-xl font-medium mb-2">{blog.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">{blog.author}</p>
                    <p className="text-gray-600 line-clamp-3">{blog.summary}</p>
                    <Link href={`/blogs/${blog.slug}`} className="text-primary hover:underline text-sm font-medium block mt-3">
                      Read Full Article →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {blogs.length === 0 && (
            <div className="text-center py-16 bg-white rounded-md shadow-sm">
              <p className="text-gray-500 mb-4">No blog posts available at the moment.</p>
              <p className="text-gray-600">Please check back soon for new content!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
