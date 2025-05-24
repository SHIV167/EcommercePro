import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet';
import '@/styles/blog-listing.css';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  author: string;
  publishedAt: string;
  summary: string;
  content?: string;
  imageUrl?: string;
  category?: string;
}

export default function BlogsPage() {
  const { data: blogs = [], isLoading } = useQuery<Blog[]>({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/blogs');
      return res.json();
    },
  });

  // Sample blog data
  const sampleBlogs: Blog[] = [
    {
      _id: '1',
      title: 'Professional Skincare Tips: Your glowy beauty routine for the Summer',
      slug: 'professional-skincare-tips',
      author: 'Kama Ayurveda',
      publishedAt: new Date('2025-05-20').toISOString(),
      summary: 'Discover the best skincare routine for summer to keep your skin glowing and healthy.',
      imageUrl: '/uploads/blog/skincare-tips.jpg',
      category: 'Skincare'
    },
    {
      _id: '2',
      title: 'Ayurvedic Face Essentials: Meet the Kumkumadi Brightening Scrub',
      slug: 'ayurvedic-face-essentials',
      author: 'Kama Ayurveda',
      publishedAt: new Date('2025-05-18').toISOString(),
      summary: 'Learn about the benefits of Kumkumadi Brightening Scrub for your skin.',
      imageUrl: '/uploads/blog/kumkumadi-scrub.jpg',
      category: 'Ayurveda'
    },
    {
      _id: '3',
      title: 'How To Use Herbs and Ginger To Create A Natural Glow Elixir',
      slug: 'herbs-ginger-glow-elixir',
      author: 'Kama Ayurveda',
      publishedAt: new Date('2025-05-15').toISOString(),
      summary: 'Make your own natural glow elixir using herbs and ginger at home.',
      imageUrl: '/uploads/blog/glow-elixir.jpg',
      category: 'Natural Remedies'
    },
    {
      _id: '4',
      title: 'Aloe, Shea, Tea Tree - Top 10 Natural Anti-Acne Ingredients',
      slug: 'natural-anti-acne-ingredients',
      author: 'Kama Ayurveda',
      publishedAt: new Date('2025-05-12').toISOString(),
      summary: 'Discover the top natural ingredients to fight acne effectively.',
      imageUrl: '/uploads/blog/anti-acne.jpg',
      category: 'Skincare'
    }
  ];

  // Categories data
  const categories = [
    { name: 'Skincare', count: 12 },
    { name: 'Hair Care', count: 8 },
    { name: 'Wellness', count: 10 },
    { name: 'Ayurveda', count: 15 },
    { name: 'Natural Remedies', count: 6 },
    { name: 'Product Guides', count: 9 },
  ];

  const displayBlogs = blogs.length > 0 ? blogs : sampleBlogs;

  // Add the blog-listing class to the body for scoped styling
  useEffect(() => {
    document.body.classList.add('blog-listing-page');
    return () => {
      document.body.classList.remove('blog-listing-page');
    };
  }, []);

  if (isLoading) {
    return (
      <div className="blog-listing-container">
        <div className="blog-listing-header">
          <h1>BLOG</h1>
        </div>
        <div className="blog-listing-content">
          <div className="blog-listing-main">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="blog-listing-card loading">
                <div className="blog-listing-image"></div>
                <div className="blog-listing-details">
                  <h3 className="loading-text"></h3>
                  <p className="loading-text"></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-listing-page">
      <Helmet>
        <title>Blog | Kama Ayurveda</title>
        <meta name="description" content="Discover our latest blog posts about Ayurveda, skincare, and wellness." />
      </Helmet>

      <div className="blog-listing-header">
        <h1>BLOG</h1>
      </div>

      <div className="blog-listing-container">
        <main className="blog-listing-main">
          <div className="blog-listing-grid">
            {displayBlogs.map((blog) => (
              <article key={blog._id} className="blog-listing-card">
                <Link href={`/blogs/${blog.slug}`}>
                  <div className="blog-listing-image">
                    <img 
                      src={blog.imageUrl || '/uploads/blog/placeholder.jpg'} 
                      alt={blog.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/uploads/blog/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="blog-listing-details">
                    <h2>{blog.title}</h2>
                    <p>{blog.summary}</p>
                    <div className="blog-listing-meta">
                      <span className="blog-listing-category">{blog.category}</span>
                      <span className="blog-listing-date">
                        {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </main>

        <aside className="blog-listing-sidebar">
          <div className="blog-listing-widget categories-widget">
            <h3>Categories</h3>
            <ul>
              {categories.map((category, index) => (
                <li key={index}>
                  <Link href={`/blogs/category/${category.name.toLowerCase().replace(/\s+/g, '-')}`}>
                    {category.name}
                    <span>({category.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="blog-listing-widget recent-posts-widget">
            <h3>Recent Posts</h3>
            <ul>
              {displayBlogs.slice(0, 4).map((blog) => (
                <li key={`recent-${blog._id}`}>
                  <Link href={`/blogs/${blog.slug}`}>
                    <div className="recent-post">
                      <div className="recent-post-image">
                        <img 
                          src={blog.imageUrl || '/uploads/blog/placeholder.jpg'} 
                          alt={blog.title}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/uploads/blog/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="recent-post-details">
                        <h4>{blog.title}</h4>
                        <span className="date">
                          {new Date(blog.publishedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
