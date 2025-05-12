import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Sample video data
const videos = [
  {
    id: 1,
    title: 'Rejuvenating Saffron Therapy',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    value: '600',
    description: 'Rejuvenating saffron therapy',
    startingFrom: '₹985',
  },
  {
    id: 2,
    title: 'Kumkumadi Youth Illumination',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_karrot.png',
    description: 'Kumkumadi Youth Illumination',
    startingFrom: '₹1195',
  },
  {
    id: 3,
    title: 'Rose Essential Oil Box',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Rose Essential Oil Box',
    startingFrom: '₹1995',
  },
  {
    id: 4,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    value: '78',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  }
];

export default function VideoGallery() {
  const [hoveredVideo, setHoveredVideo] = useState<number | null>(null);
  const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({});
  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto">
        <h2 className="text-center mb-10">
          <span className="font-heading text-2xl text-primary">Explore & Shop</span>
        </h2>
        
        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          navigation={true}
          pagination={{ clickable: true }}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 20,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 4,
              spaceBetween: 20,
            },
          }}
          modules={[Navigation, Pagination]}
          className="video-gallery-swiper"
        >
          {videos.map((video) => (
            <SwiperSlide key={video.id} className="p-1">
              <div 
                className="relative rounded-lg overflow-hidden border border-neutral-100 group"
                onMouseEnter={() => {
                  setHoveredVideo(video.id);
                  if (videoRefs.current[video.id]) {
                    videoRefs.current[video.id]?.play().catch(e => console.error('Error playing video:', e));
                  }
                }}
                onMouseLeave={() => {
                  setHoveredVideo(null);
                  if (videoRefs.current[video.id]) {
                    videoRefs.current[video.id]?.pause();
                  }
                }}
              >
                {/* Video/Thumbnail */}
                <div className="relative overflow-hidden" style={{ height: '500px' }}>
                  {hoveredVideo === video.id ? (
                    <video 
                      ref={el => videoRefs.current[video.id] = el}
                      src={video.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      loop
                    />
                  ) : (
                    <img 
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className="w-full h-full object-cover" 
                    />
                  )}
                  
                  {/* Overlay value */}
                  {video.value && (
                    <div className="absolute top-4 left-4 text-white font-bold text-2xl">
                      {video.value}
                    </div>
                  )}
                  
                  {/* Description overlay */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm">{video.description}</p>
                  </div>
                  
                  {/* Like and Share icons */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <button className="bg-white bg-opacity-80 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                      </svg>
                    </button>
                    <button className="bg-white bg-opacity-80 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Footer with product info and explore button */}
                <div className="bg-white">
                  {/* Product name and price */}
                  <div className="p-3 border-b border-gray-100">
                    <div className="font-medium text-sm mb-1">{video.title}</div>
                    <div className="flex justify-between items-center">
                      <div className="text-xs text-gray-500">Starting from</div>
                      <div className="font-semibold text-sm">{video.startingFrom}</div>
                    </div>
                  </div>
                  
                  {/* Explore More button (full width) */}
                  <button className="w-full p-3 flex items-center justify-between text-primary text-sm font-medium border-t border-gray-200 hover:bg-gray-50 transition-colors">
                    <span>Explore More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <style>{`
        .video-gallery-swiper {
          padding-bottom: 50px !important;
        }
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-button-prev, .swiper-button-next {
          color: #000 !important;
        }
      `}</style>
    </section>
  );
}
