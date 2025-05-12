import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow } from 'swiper/modules';
import { cn } from '@/lib/utils';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';

// Sample video data
const videos = [
  {
    id: 1,
    title: 'JOYOLOGY BEAUTY',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '50% OFF',
    backgroundColor: '#FFD6E0',
  },
  {
    id: 2,
    title: 'ARCELIA',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_karrot.png',
    discount: 'UP TO 60% OFF',
    backgroundColor: '#E0E0E0',
  },
  {
    id: 3,
    title: 'LUXE',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: 'UP TO 50% OFF',
    backgroundColor: '#F5F5F5',
  },
  {
    id: 4,
    title: 'HOME SHOP',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '40% OFF',
    backgroundColor: '#D6E0FF',
  },
  {
    id: 5,
    title: 'SASSY',
    videoUrl: 'https://video.gumlet.io/64661d8e673536e1fe9044e2/67ed273a292035ad5abb5803/main.mp4',
    thumbnailUrl: '/uploads/brands/Brand_Carousel_Web_U_R_you.png',
    discount: '60% OFF',
    backgroundColor: '#FFD6D6',
  }
];

export default function VideoCarousel() {
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900 relative overflow-hidden">
      <div className="container mx-auto">
        <h2 className="text-center mb-10">
          <span className="font-heading text-2xl text-white">Our </span>
          <span className="font-heading text-2xl text-white font-bold">Featured </span>
          <span className="font-heading text-2xl text-white">Videos</span>
        </h2>

        <div className="relative">
          <Swiper
            effect={'coverflow'}
            grabCursor={true}
            centeredSlides={true}
            slidesPerView={'auto'}
            coverflowEffect={{
              rotate: 0,
              stretch: 0,
              depth: 200,
              modifier: 3,
              slideShadows: true,
            }}
            initialSlide={2}
            pagination={{ clickable: true }}
            navigation={true}
            loop={true}
            // @ts-ignore - loopedSlides is a valid Swiper prop but might have type issues
            loopedSlides={5}
            modules={[EffectCoverflow, Pagination, Navigation]}
            className="video-swiper"
          >
            {videos.map((video, index) => (
              <SwiperSlide key={video.id} className="video-slide w-[320px] h-[480px] relative overflow-hidden">
                {({ isActive }) => (
                  <div className="relative rounded-lg w-full h-full flex flex-col items-center justify-center">
                    {/* Video Background */}
                    <div className="absolute inset-0 w-full h-full bg-gray-800">
                      {isActive ? (
                        <video 
                          className="w-full h-full object-cover"
                          src={video.videoUrl}
                          poster={video.thumbnailUrl}
                          autoPlay
                          muted
                          loop
                          playsInline
                        ></video>
                      ) : (
                        <div className="w-full h-full relative">
                          <img 
                            src={video.thumbnailUrl} 
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="flex flex-col items-center text-white">
                              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                              </svg>
                              <p className="mt-2">Play Video</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Overlay Content */}
                    <div className="relative z-10 p-4 text-center flex flex-col items-center justify-between h-full w-full">
                      {/* Title */}
                      <div className="h-16 w-40 flex items-center justify-center bg-white bg-opacity-90 rounded-md p-2 mb-auto mt-6">
                        <div className="font-bold text-xl text-center">
                          {video.title}
                        </div>
                      </div>
                      
                      {/* Discount Tag */}
                      <div className="mt-auto mb-8 bg-white bg-opacity-90 text-black font-bold py-2 px-6 rounded-md text-lg tracking-wider">
                        {video.discount}
                      </div>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
      
      <style>{`
        .video-swiper {
          padding: 30px 0 60px !important;
          width: 100vw !important;
          margin-left: calc(-50vw + 50%) !important;
          overflow: visible !important;
        }
        .swiper-pagination {
          bottom: 0 !important;
        }
        .swiper-pagination-bullet {
          background: white !important;
          opacity: 0.5;
        }
        .swiper-pagination-bullet-active {
          opacity: 1;
        }
        .swiper-button-prev, .swiper-button-next {
          color: white !important;
          background: transparent !important;
          box-shadow: none !important;
        }
        .video-slide {
          transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          filter: brightness(0.7);
        }
        .swiper-slide-active {
          transform: scale(1.15) !important;
          z-index: 2;
          filter: brightness(1);
        }
        .swiper-slide-prev, .swiper-slide-next {
          transform: scale(0.92);
          z-index: 1;
        }
        .swiper-slide-prev + .swiper-slide-prev,
        .swiper-slide-next + .swiper-slide-next {
          transform: scale(0.84);
          z-index: 0;
        }
      `}</style>
    </section>
  );
}
