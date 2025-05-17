import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '@/styles/category-slider.css';

export default function CategorySection() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories/featured'],
  });

  // If no categories are returned, show these placeholders
  const displayCategories = categories.length > 0 ? categories : [
    {
      _id: "1",
      name: "Face",
      slug: "face",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3",
      featured: true
    },
    {
      _id: "2",
      name: "Hair",
      slug: "hair",
      imageUrl: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?ixlib=rb-4.0.3",
      featured: true
    },
    {
      _id: "3",
      name: "Body",
      slug: "body",
      imageUrl: "https://images.unsplash.com/photo-1627467959547-215304e0e8cc?ixlib=rb-4.0.3",
      featured: true
    },
    {
      _id: "4",
      name: "Wellness",
      slug: "wellness",
      imageUrl: "https://images.unsplash.com/photo-1591084863828-30ebecaf2c82?ixlib=rb-4.0.3",
      featured: true
    }
  ] as Category[];

  return (
    <section className="py-12 bg-neutral-cream category-section">
      <div className="container mx-auto px-4 relative">
        <h2 className="font-heading text-2xl text-primary text-center mb-10">Shop By Category</h2>
        <Slider
          dots={true}
          arrows={false}
          infinite={true}
          speed={500}
          autoplay={true}
          autoplaySpeed={2500}
          slidesToShow={7}
          slidesToScroll={1}
          className="category-slider"
          responsive={[
            {
              breakpoint: 1280,
              settings: {
                slidesToShow: 5,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 1024,
              settings: {
                slidesToShow: 4,
                slidesToScroll: 1
              }
            },
            {
              breakpoint: 640,
              settings: {
                slidesToShow: 2,
                slidesToScroll: 1
              }
            }
          ]}
        >
          {displayCategories.map((category) => (
              <Link href={`/categories/${category.slug}`} className="group block">
                <div className="flex flex-col items-center">
                  <div className="mb-4 flex items-center justify-center">
                    <div className="h-28 w-28 md:h-32 md:w-32 rounded-full border-2 border-gold flex items-center justify-center bg-white shadow-md transition-transform duration-300 group-hover:scale-105">
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="h-20 w-20 md:h-24 md:w-24 object-cover rounded-full"
                      />
                    </div>
                  </div>
                  <h3 className="font-accent text-primary group-hover:text-secondary text-base md:text-lg font-semibold text-center mt-2">
                    {category.name}
                  </h3>
                </div>
              </Link>

          ))}
        </Slider>
      </div>
    </section>
  );
}
