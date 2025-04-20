import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Banner } from "@shared/schema";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { data: banners = [] } = useQuery<Banner[]>({
    queryKey: ['/api/banners?active=true'],
  });

  const slides = banners.length > 0 ? banners : [
    {
      id: 1,
      title: "DISCOVER NEXT GENERATION AYURVEDIC SKINCARE",
      subtitle: "CHOOSE ANY COMPLIMENTARY PRODUCTS OF YOUR CHOICE WORTH UPTO ₹3990",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      buttonText: "SHOP NOW",
      buttonLink: "/collections/all",
      active: true,
      order: 1
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      if (slides.length > 1) {
        handleNext();
      }
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [currentSlide, slides.length]);

  const handlePrev = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const handleNext = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const currentBanner = slides[currentSlide];

  return (
    <div className="relative border border-neutral-sand overflow-hidden bg-[#f8f4ea]">
      <div className="relative">
        <div 
          className="transition-opacity duration-500"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <img 
                  src={currentBanner.imageUrl || "https://images.unsplash.com/photo-1617500603321-cae6be1442f1"} 
                  alt="Kumkumadi Ayurvedic skincare product with purple flowers" 
                  className="mx-auto h-auto max-h-[400px] object-contain"
                />
              </div>
              <div className="w-full md:w-1/2 text-center md:text-left md:pl-12">
                <h2 className="font-heading text-2xl md:text-4xl text-primary mb-4">
                  {currentBanner.title}
                </h2>
                <div className="flex justify-center md:justify-start mb-4">
                  <div className="h-6 w-8">
                    <svg width="32" height="24" viewBox="0 0 48 36" xmlns="http://www.w3.org/2000/svg">
                      <path d="M24 0C26.4 7.2 32.4 12 40.8 12V24C32.4 24 26.4 28.8 24 36C21.6 28.8 15.6 24 7.2 24V12C15.6 12 21.6 7.2 24 0Z" fill="#A72B1D"/>
                    </svg>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="uppercase tracking-wider text-sm md:text-base text-neutral-gray">
                    CHOOSE ANY<br/>COMPLIMENTARY PRODUCTS OF YOUR CHOICE
                  </p>
                  <p className="font-heading text-xl md:text-3xl text-primary mt-4">
                    WORTH UPTO ₹3990
                  </p>
                  <p className="text-neutral-gray uppercase tracking-wider text-xs">
                    on orders above ₹4000
                  </p>
                </div>
                
                <Button
                  asChild
                  className="mt-6 bg-[#A72B1D] hover:bg-[#8a2318] text-white uppercase tracking-wider py-3 px-6 rounded-none font-medium text-sm"
                >
                  <Link href={currentBanner.buttonLink || "/collections/all"}>
                    {currentBanner.buttonText || "SHOP NOW"}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Carousel dots */}
      <div className="absolute bottom-4 left-0 right-0">
        <div className="flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button 
              key={index}
              className={cn(
                "h-2 rounded-full",
                currentSlide === index ? "w-6 bg-primary" : "w-2 bg-neutral-darkGray/30"
              )}
              aria-label={`Go to slide ${index + 1}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>
      
      {/* Carousel Controls */}
      <button 
        className="absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-2"
        aria-label="Previous slide"
        onClick={handlePrev}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button 
        className="absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white text-primary rounded-full p-2"
        aria-label="Next slide"
        onClick={handleNext}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
