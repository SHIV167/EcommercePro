import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { apiRequest } from '@/lib/queryClient';

interface Blog {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  imageUrl?: string;
  publishedAt: string;
}

export default function BlogSlider() {
  const { data: blogs } = useQuery({
    queryKey: ['/api/blogs'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/blogs');
      return res.json();
    }
  });

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="py-16 px-4 md:px-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl md:text-3xl font-medium">CHECK OUT OUR TOP BLOGS</h2>
          <Link to="/blogs" className="text-sm text-gray-600 hover:text-black">
            Explore All Blogs
          </Link>
        </div>
        
        <Slider
          dots={false}
          infinite={true}
          speed={500}
          slidesToShow={3}
          slidesToScroll={1}
          arrows={true}
          className="blog-slider"
          responsive={[
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 1,
                slidesToScroll: 1
              }
            }
          ]}
        >
          {blogs?.map((blog: Blog) => (
              <Link to={`/blogs/${blog.slug}`} className="block group">
                <div className="relative aspect-[4/3] mb-4 overflow-hidden">
                  <img
                    src={blog.imageUrl || '/images/blog-placeholder.jpg'}
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-lg font-medium mb-2 group-hover:text-amber-500 transition-colors">
                  {blog.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {blog.summary}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(blog.publishedAt).toLocaleDateString()}
                </p>
              </Link>

          ))}
        </Slider>
      </div>
    </section>
  );
}
