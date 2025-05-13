import React, { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Sample video data
// Double the first few items to ensure proper looping without blank spaces
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
    id: 9,
    title: 'Rejuvenating Saffron Therapy',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    value: '600',
    description: 'Rejuvenating saffron therapy',
    startingFrom: '₹985',
  },
  {
    id: 10,
    title: 'Kumkumadi Youth Illumination',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_karrot.png',
    description: 'Kumkumadi Youth Illumination',
    startingFrom: '₹1195',
  },
  {
    id: 11,
    title: 'Rose Essential Oil Box',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    description: 'Rose Essential Oil Box',
    startingFrom: '₹1995',
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
  },
  {
    id: 5,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    value: '78',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  },
  {
    id: 6,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    value: '78',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  },
  {
    id: 7,
    title: 'Kumkumadi Youth Revolution',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    value: '78',
    description: 'Brighter skin',
    startingFrom: '₹1195',
  },
  {
    id: 8,
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
          slidesPerView={"auto"}
          navigation={true}
          pagination={{ clickable: true }}
          loop={true}
          centeredSlides={false}
          slidesPerGroup={1}
          spaceBetween={10}
          grabCursor={true}
          loopAdditionalSlides={4}
          observer={true}
          observeParents={true}
          modules={[Navigation, Pagination]}
          className="video-gallery-swiper explore-shop-section"
        >
          {videos.map((video) => (
            <SwiperSlide key={video.id}>
              <div 
                className="video-gallery-card relative rounded-lg overflow-hidden border border-neutral-100 group" style={{maxWidth: '280px', height: '450px'}}
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
                <div className="video-thumbnail relative overflow-hidden">
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
                
                {/* Footer with product info and explore button - FIXED HEIGHT STRUCTURE */}
                <div className="product-info-container">
                  <div className="product-title">{video.title}</div>
                  <div className="starting-from-text">Starting from</div>
                  <div className="product-price">{video.startingFrom}</div>
                  <div className="explore-button-wrapper">
                    <button className="explore-button">
                      <span>Explore More</span>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                        <polyline points="12 5 19 12 12 19"></polyline>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      <style>{`
        /* Basic swiper styling */
        .video-gallery-swiper {
          padding-bottom: 50px !important;
          width: 100% !important;
          overflow: hidden !important;
          padding: 0 !important;
        }
        
        /* Force all slides to be exactly the same size and spacing */
        .video-gallery-swiper .swiper-slide {
          width: 280px !important;
          height: 450px !important;
          padding: 0 !important;
          margin: 0 8px !important;
          box-sizing: border-box !important;
          visibility: visible !important;
          opacity: 1 !important;
          flex-shrink: 0 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
        }
        
        /* Make sure carousel fills available space */
        .video-gallery-swiper {
          width: 100% !important;
          overflow: hidden !important;
          padding: 0 !important;
        }
        
        .container {
          padding: 0 5px !important;
          max-width: 1300px !important;
          width: 100% !important;
          margin: 0 auto !important;
          overflow: hidden !important;
        }
        
        /* Fix for looping - prevent blank slides */
        .video-gallery-swiper .swiper-slide-duplicate-active,
        .video-gallery-swiper .swiper-slide-duplicate-next,
        .video-gallery-swiper .swiper-slide-duplicate-prev {
          pointer-events: auto !important;
          visibility: visible !important;
        }
        
        /* Style for the card container */
        .video-gallery-card {
          width: 100% !important;
          height: 100% !important;
          display: block !important;
          margin: 0 !important;
          overflow: hidden !important;
          box-sizing: border-box !important;
        }
        
        /* Thumbnail container */
        .video-thumbnail {
          width: 100% !important;
          height: 330px !important; /* Fixed height for the image */
          position: relative !important;
          overflow: hidden !important;
        }
        
        /* Images and videos inside thumbnails */
        .video-thumbnail img,
        .video-thumbnail video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
          display: block !important;
        }
        
        /* Product info container styling */
        .product-info-container {
          background: white !important;
          height: 120px !important;
          display: flex !important;
          flex-direction: column !important;
          padding: 10px !important;
          position: relative !important;
        }
        
        .product-title {
          font-weight: 500 !important;
          font-size: 14px !important;
          color: #333 !important;
          white-space: nowrap !important;
          overflow: hidden !important;
          text-overflow: ellipsis !important;
          margin-bottom: 4px !important;
        }
        
        .starting-from-text {
          font-size: 12px !important;
          color: #666 !important;
          margin-bottom: 2px !important;
        }
        
        .product-price {
          font-weight: 500 !important;
          font-size: 14px !important;
          color: #333 !important;
          margin-bottom: auto !important;
        }
        
        .explore-button-wrapper {
          margin-top: auto !important;
          border-top: 1px solid #eee !important;
          padding-top: 8px !important;
        }
        
        .explore-button {
          width: 100% !important;
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          background: none !important;
          border: none !important;
          color: #558076 !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 0 !important;
          cursor: pointer !important;
          transition: all 0.2s !important;
        }
        
        .explore-button:hover {
          opacity: 0.8 !important;
        }
        .swiper-pagination {
          bottom: 0 !important;
        }
        /* Target only the explore shop section's navigation buttons */
        .explore-shop-section .swiper-button-prev, 
        .explore-shop-section .swiper-button-next {
          color: #000 !important;
          width: 40px !important;
          height: 40px !important;
          background: rgba(255, 255, 255, 0.9) !important;
          border-radius: 50% !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
          top: 165px !important; /* Position at the middle of the image portion */
          transform: translateY(0) !important;
          z-index: 100 !important;
        }
        .explore-shop-section .swiper-button-prev {
          left: 10px !important;
        }
        .explore-shop-section .swiper-button-next {
          right: 10px !important;
        }
        .explore-shop-section .swiper-button-prev:after, 
        .explore-shop-section .swiper-button-next:after {
          font-size: 18px !important;
        }
      `}</style>
    </section>
  );
}
