import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

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
    <section className="py-12 bg-neutral-cream">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-10">Shop By Category</h2>
        <Swiper
          spaceBetween={24}
          slidesPerView={2}
          breakpoints={{
            640: { slidesPerView: 3 },
            1024: { slidesPerView: 5 },
            1280: { slidesPerView: 7 },
          }}
          className="category-swiper"
          navigation
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          modules={[Navigation, Autoplay]}
        >
          {displayCategories.map((category) => (
            <SwiperSlide key={category._id || category.slug}>
              <Link href={`/collections/${category.slug}`} className="group block">
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
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
