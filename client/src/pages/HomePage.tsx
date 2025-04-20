import HeroCarousel from "@/components/home/HeroCarousel";
import ProductCollection from "@/components/home/ProductCollection";
import CategorySection from "@/components/home/CategorySection";
import AyurvedicBanner from "@/components/home/AyurvedicBanner";
import BestsellerSection from "@/components/home/BestsellerSection";
import TestimonialSection from "@/components/home/TestimonialSection";
import SustainabilitySection from "@/components/home/SustainabilitySection";
import NewsletterSection from "@/components/home/NewsletterSection";
import { Helmet } from 'react-helmet';

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Kama Ayurveda - Luxury Ayurvedic Beauty Products</title>
        <meta name="description" content="Discover the power of Ayurveda with Kama Ayurveda's premium skincare, haircare and wellness products crafted with authentic ingredients and traditional methods." />
      </Helmet>
      
      <HeroCarousel />
      
      <ProductCollection collectionSlug="kumkumadi" />
      
      <CategorySection />
      
      <AyurvedicBanner />
      
      <BestsellerSection />
      
      <TestimonialSection />
      
      <SustainabilitySection />
      
      <NewsletterSection />
    </>
  );
}
