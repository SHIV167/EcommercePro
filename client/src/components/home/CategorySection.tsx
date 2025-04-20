import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category } from "@shared/schema";

export default function CategorySection() {
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['/api/categories/featured'],
  });

  // If no categories are returned, show these placeholders
  const displayCategories = categories.length > 0 ? categories : [
    {
      id: 1,
      name: "Face",
      slug: "face",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3",
      featured: true
    },
    {
      id: 2,
      name: "Hair",
      slug: "hair",
      imageUrl: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?ixlib=rb-4.0.3",
      featured: true
    },
    {
      id: 3,
      name: "Body",
      slug: "body",
      imageUrl: "https://images.unsplash.com/photo-1627467959547-215304e0e8cc?ixlib=rb-4.0.3",
      featured: true
    },
    {
      id: 4,
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
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {displayCategories.map((category) => (
            <Link key={category.id} href={`/collections/${category.slug}`} className="group">
              <div className="bg-white p-6 rounded-md overflow-hidden transition-all duration-300 hover:shadow-md text-center">
                <div className="mb-4">
                  <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border-2 border-secondary">
                    <img 
                      src={category.imageUrl} 
                      alt={category.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <h3 className="font-accent text-primary group-hover:text-primary-light text-lg">
                  {category.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
