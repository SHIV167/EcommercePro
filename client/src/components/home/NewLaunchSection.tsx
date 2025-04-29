import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { Product } from "@shared/schema";

export default function NewLaunchSection() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products/new?limit=5'],
  });

  // Fallback demo products if API is empty
  const demoProducts: Product[] = [
    {
      _id: '201',
      name: "New Kumkumadi Oil",
      slug: "new-kumkumadi-oil",
      description: "A new launch for radiant skin",
      shortDescription: "A new launch for radiant skin",
      price: 2195,
      discountedPrice: null,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2",
      rating: 4.9,
      totalReviews: 12,
      featured: true,
      bestseller: false,
      isNew: true,
      categoryId: '1',
      createdAt: new Date(),
      images: [],
    },
    // ...add more demo products if needed
  ];

  const displayProducts = products.length > 0 ? products : demoProducts;

  const PrevArrow = ({ onClick }: any) => (
    <button onClick={onClick} className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
  const NextArrow = ({ onClick }: any) => (
    <button onClick={onClick} className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white p-2 rounded-full shadow z-10">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    arrows: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl text-primary mb-3">New Launches</h2>
          <p className="text-neutral-gray max-w-2xl mx-auto">
            Discover our latest products, crafted with the finest ingredients and the wisdom of Ayurveda.
          </p>
        </div>
        <Slider {...settings} className="px-4">
          {isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-2 bg-white animate-pulse">
                  <div className="mb-4 w-full h-64 bg-neutral-sand"></div>
                  <div className="w-24 h-3 bg-neutral-sand mb-2"></div>
                </div>
              ))
            : displayProducts.map((product) => (
                <div key={product._id || product.slug} className="p-2">
                  <ProductCard product={product} showAddToCart />
                </div>
              ))}
        </Slider>
        <div className="text-center mt-12">
          <Button
            asChild
            variant="outline"
            className="inline-block border-2 border-primary text-primary hover:bg-primary hover:text-white uppercase tracking-wider py-3 px-8 font-medium text-sm transition-colors duration-300"
          >
            <Link href="/collections/new">View All New Launches</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
