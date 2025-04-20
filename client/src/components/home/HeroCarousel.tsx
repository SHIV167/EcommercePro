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
    <div className="relative border border-neutral-sand overflow-hidden">
      <div className="relative">
        <div 
          className="bg-neutral-cream transition-opacity duration-500"
          style={{ opacity: isTransitioning ? 0 : 1 }}
        >
          <div className="container mx-auto px-4 py-8 md:py-16">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-full md:w-1/2 mb-8 md:mb-0">
                <img 
                  src={currentBanner.imageUrl} 
                  alt="Kumkumadi Ayurvedic skincare product with purple flowers" 
                  className="mx-auto h-auto max-h-[400px] object-contain"
                />
              </div>
              <div className="w-full md:w-1/2 text-center md:text-left md:pl-12">
                <h2 className="font-heading text-2xl md:text-4xl text-primary mb-4">{currentBanner.title}</h2>
                <div className="flex justify-center md:justify-start mb-6">
                  <div className="h-10 w-10 flex items-center justify-center">
                    <svg width="40" height="40" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="60" cy="60" r="50" fill="#D4B78F"/>
                      <text x="60" y="70" textAnchor="middle" fontFamily="Georgia, serif" fontSize="40" fontWeight="bold" fill="#5C3834">K</text>
                    </svg>
                  </div>
                </div>
                <div className="space-y-4">
                  {currentBanner.subtitle.split(' WORTH UPTO').map((part, index) => {
                    if (index === 0) {
                      return (
                        <div key={index}>
                          {part.split(' OF YOUR CHOICE').map((subpart, subindex) => (
                            <p key={subindex} className="text-neutral-gray uppercase tracking-wider text-sm md:text-base">
                              {subpart}{subindex === 0 ? " OF YOUR CHOICE" : ""}
                            </p>
                          ))}
                        </div>
                      );
                    } else {
                      return (
                        <div key={index}>
                          <p className="font-heading text-xl md:text-3xl text-primary">WORTH UPTO{part.split(' on orders above')[0]}</p>
                          <p className="text-neutral-gray uppercase tracking-wider text-sm">on orders above{part.split(' on orders above')[1]}</p>
                        </div>
                      );
                    }
                  })}
                </div>
                <Button
                  asChild
                  className="inline-block bg-accent hover:bg-accent-light text-white uppercase tracking-wider py-3 px-10 mt-6 font-medium text-sm"
                >
                  <Link href={currentBanner.buttonLink || "/collections/all"}>
                    {currentBanner.buttonText || "Shop Now"}
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
                "carousel-dot h-2 rounded-full bg-neutral-darkGray/30",
                currentSlide === index ? "w-6 bg-primary" : "w-2"
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
