import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';

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

  if (isLoading) return (
    <div className="bg-red-900 min-h-screen py-10">
      <div className="max-w-5xl mx-auto bg-white rounded-sm shadow-lg p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-8"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="h-48 bg-gray-200 rounded-t"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
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
        <title>Blog Articles | Kama Ayurveda</title>
        <meta name="description" content="Read our latest blog articles on skincare, wellness, and beauty tips." />
      </Helmet>
      
      <div className="bg-red-900 min-h-screen py-10">
        <div className="max-w-5xl mx-auto bg-white rounded-sm shadow-lg p-8">
          <h1 className="text-3xl font-serif font-medium mb-8 text-center">Blog Articles</h1>
          
          <div className="grid md:grid-cols-2 gap-8">
            {blogs.map((blog) => (
              <Link
                href={`/blogs/${blog.slug}`}
                key={blog._id}
                className="block border border-gray-100 rounded-sm overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video overflow-hidden bg-gray-50">
                  {blog.imageUrl ? (
                    <img
                      src={blog.imageUrl}
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-serif font-medium mb-2">{blog.title}</h2>
                  <p className="text-sm text-gray-500 mb-3">
                    {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                    {blog.author && <> · <span>{blog.author}</span></>}
                  </p>
                  <p className="text-gray-600 line-clamp-3">{blog.summary}</p>
                  <div className="mt-4 text-primary text-sm font-medium">Read article →</div>
                </div>
              </Link>
            ))}
          </div>
          
          {blogs.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 mb-4">No blog posts available at the moment.</p>
              <p className="text-gray-600">Please check back soon for new content!</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
