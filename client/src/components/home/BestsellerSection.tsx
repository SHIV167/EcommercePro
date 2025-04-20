import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/products/ProductCard";
import { useQuery } from "@tanstack/react-query";
import { Product } from "@shared/schema";

export default function BestsellerSection() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/bestsellers?limit=4'],
  });

  // Use demo products if none are returned from API
  const demoProducts: Product[] = [
    {
      id: 101,
      name: "Kumkumadi Brightening Ayurvedic Face Scrub",
      slug: "kumkumadi-brightening-ayurvedic-face-scrub",
      description: "Gently exfoliates and improves skin radiance",
      shortDescription: "Gently Exfoliates And Improves Skin Radiance",
      price: 1895,
      discountedPrice: null,
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1566958769312-82cef41d19ef",
      rating: 4.7,
      totalReviews: 42,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: 1,
      createdAt: new Date()
    },
    {
      id: 102,
      name: "Himalayan Deodar Hair Cleanser",
      slug: "himalayan-deodar-hair-cleanser",
      description: "Strengthens hair and reduces hair fall",
      shortDescription: "Strengthens Hair And Reduces Hair Fall",
      price: 1295,
      discountedPrice: null,
      stock: 33,
      imageUrl: "https://images.unsplash.com/photo-1599751449732-39a19320f0c2",
      rating: 4.9,
      totalReviews: 28,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: 2,
      createdAt: new Date()
    },
    {
      id: 103,
      name: "Rose & Jasmine Body Cleanser",
      slug: "rose-jasmine-body-cleanser",
      description: "Organic body wash with floral essence",
      shortDescription: "Organic Body Wash With Floral Essence",
      price: 1795,
      discountedPrice: null,
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1611080541599-8c6c79cdf95f",
      rating: 4.8,
      totalReviews: 36,
      featured: true,
      bestseller: true,
      isNew: false,
      categoryId: 3,
      createdAt: new Date()
    },
    {
      id: 104,
      name: "Pure Rose Water Toner",
      slug: "pure-rose-water-toner",
      description: "Balances skin pH and improves texture",
      shortDescription: "Balances Skin pH And Improves Texture",
      price: 1195,
      discountedPrice: null,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b",
      rating: 5.0,
      totalReviews: 54,
      featured: true,
      bestseller: true,
      isNew: true,
      categoryId: 1,
      createdAt: new Date()
    }
  ];

  const displayProducts = products.length > 0 ? products : demoProducts;

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl text-primary mb-3">Bestsellers</h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Our most popular products loved by customers for their exceptional quality and effectiveness
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {isLoading ? (
            // Render skeleton cards when loading
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white border border-neutral-sand p-6 animate-pulse">
                <div className="mb-4 w-full h-64 bg-neutral-sand"></div>
                <div className="w-24 h-3 bg-neutral-sand mb-2"></div>
                <div className="w-full h-5 bg-neutral-sand mb-1"></div>
                <div className="w-3/4 h-4 bg-neutral-sand mb-3"></div>
                <div className="w-16 h-4 bg-neutral-sand"></div>
              </div>
            ))
          ) : (
            displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} showAddToCart={true} />
            ))
          )}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            asChild
            variant="outline"
            className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-3 px-8 font-medium text-sm transition-colors duration-300"
          >
            <Link href="/collections/bestsellers">View All Bestsellers</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
