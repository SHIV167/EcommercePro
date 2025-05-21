import React, { useRef, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

type Banner = {
  id?: string;
  _id?: string;
  title: string;
  subtitle?: string;
  desktopImageUrl: string;
  mobileImageUrl: string;
  alt: string;
  linkUrl?: string;
  enabled: boolean;
  position: number;
};

const HeroCarousel: React.FC = () => {
  const sliderRef = useRef<Slider | null>(null);
  
  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ['banners'],
    queryFn: async () => {
      const res = await fetch('/api/banners?enabled=true');
      if (!res.ok) throw new Error('Failed to fetch banners');
      const data = await res.json();
      return data.sort((a: Banner, b: Banner) => (a.position ?? 0) - (b.position ?? 0));
    }
  });

  useEffect(() => {
    // Re-initialize Slick when banners are loaded
    if (banners.length > 0 && sliderRef.current) {
      sliderRef.current.slickGoTo(0);
    }
  }, [banners]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    lazyLoad: 'ondemand' as const
  };

  const getImageUrl = (url: string) => {
    if (!url) return '/uploads/banners/placeholder.jpg';
    
    // If it's a Cloudinary URL, ensure HTTPS and add w_auto,c_scale
    if (url.includes('cloudinary.com')) {
      const secureUrl = url.startsWith('http://') 
        ? url.replace('http://', 'https://') 
        : url;
      
      // Add Cloudinary transformations if not already present
      if (!secureUrl.includes('/upload/w_auto')) {
        return secureUrl.replace('/upload/', '/upload/w_auto,c_scale/');
      }
      return secureUrl;
    }
    
    return url;
  };

  const [current, setCurrent] = useState(0);

  const goPrev = () => setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
  const goNext = () => setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));

  useEffect(() => {
    const timer = setInterval(() => goNext(), 5000);
    return () => clearInterval(timer);
  }, [banners]);

  if (isLoading || banners.length === 0) {
    return <div className="w-full h-64 bg-gray-100 animate-pulse"></div>;
  }

  return (
    <div className="relative w-full border border-neutral-sand overflow-hidden bg-[#f8f4ea] md:top-0 -top-16">
      <Slider ref={sliderRef} {...settings}>
        {banners.map((banner, idx) => (
          <div key={idx} className="w-full flex-shrink-0">
            <picture>
              <source 
                media="(max-width: 767px)" 
                srcSet={`${getImageUrl(banner.mobileImageUrl)} 1x`}
                type="image/jpeg"
                onError={(e) => {
                  const source = e.target as HTMLSourceElement;
                  source.onerror = null;
                  source.srcset = '/uploads/banners/placeholder.jpg 1x';
                }}
              />
              <img
                src={getImageUrl(banner.desktopImageUrl)}
                alt={banner.alt || 'Banner image'}
                className="w-full h-auto object-cover"
                style={{ maxHeight: '100%' }}
                loading="lazy"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  img.onerror = null;
                  img.src = '/uploads/banners/placeholder.jpg';
                }}
              />
            </picture>
          </div>
        ))}
      </Slider>
      {/* Slider Controls */}
      <button
        aria-label="Previous banner"
        onClick={goPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow transition pointer-events-auto z-20"
      >
        <span className="sr-only">Previous</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        aria-label="Next banner"
        onClick={goNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full p-2 shadow transition pointer-events-auto z-20"
      >
        <span className="sr-only">Next</span>
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
      </button>
      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 pointer-events-auto z-20">
        {banners.map((_, idx) => (
          <span
            key={idx}
            className={`w-2 h-2 rounded-full ${current === idx ? 'bg-[#A72B1D]' : 'bg-neutral-300'} inline-block transition-all`}
          />
        ))}
      </div>
    </div>
  );
}