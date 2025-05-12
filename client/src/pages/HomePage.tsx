import HeroCarousel from "@/components/home/HeroCarousel";
import ProductCollection from "@/components/home/ProductCollection";
import CategorySection from "@/components/home/CategorySection";
import AyurvedicBanner from "@/components/home/AyurvedicBanner";
import BestsellerSection from "@/components/home/BestsellerSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import SustainabilitySection from "@/components/home/SustainabilitySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import NewLaunchSection from "@/components/home/NewLaunchSection";
import BrandsCarousel from "@/components/home/BrandsCarousel";
import VideoCarousel from "@/components/home/VideoCarousel";
import VideoGallery from "@/components/home/VideoGallery";
import { Helmet } from 'react-helmet';
import SearchBar from '@/components/home/SearchBar';
import React, { useState, useEffect } from 'react';
import MobileFooterNav from '@/components/navigation/MobileFooterNav';

export default function HomePage() {
  const [searchOpen, setSearchOpen] = useState(false);
  // Load promo timers globally for ProductCard
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/promotimers');
        if (res.ok) (window as any).PROMO_TIMERS = await res.json();
      } catch (e) {
        console.error('Failed to load promo timers', e);
      }
    })();
  }, []);
  return (
    <>
      <Helmet>
        <title>Kama Ayurveda - Luxury Ayurvedic Beauty Products</title>
        <meta name="description" content="Discover the power of Ayurveda with Kama Ayurveda's premium skincare, haircare and wellness products crafted with authentic ingredients and traditional methods." />
      </Helmet>
      <SearchBar show={searchOpen} onClose={() => setSearchOpen(false)} />
      <HeroCarousel />
      <CategorySection />
      <ProductCollection collectionSlug="kumkumadi" slider={true} />
      <NewLaunchSection />
      <AyurvedicBanner />
      <BestsellerSection />
      <TestimonialSection />
      <BrandsCarousel />
      <VideoCarousel />
      <VideoGallery />
      <SustainabilitySection />
      <NewsletterSection />
      <MobileFooterNav />
    </>
  );
}
