import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Testimonial } from "../../../../shared/schema";

// Sample fallback testimonials matching Testimonial type
const sampleTestimonials: Testimonial[] = [
  { id: "1", name: "Priya S.", content: "The Kumkumadi face oil has transformed my skin.", rating: 5, featured: true, createdAt: new Date() },
  { id: "2", name: "Rahul M.", content: "I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong.", rating: 5, featured: true, createdAt: new Date() },
  { id: "3", name: "Anita K.", content: "The Rose Jasmine face cleanser is gentle yet effective.", rating: 4, featured: true, createdAt: new Date() },
];

export default function TestimonialSection() {
  const { data: testimonials = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/testimonials/featured?limit=3'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/testimonials/featured?limit=3');
      return res.json();
    },
  });
  const displayTestimonials = testimonials.length > 0 ? testimonials : sampleTestimonials;

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="font-heading text-2xl text-primary text-center mb-10">What Our Customers Say</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {isLoading ? (
            // Render skeleton cards when loading
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-neutral-cream p-6 rounded-md animate-pulse">
                <div className="w-24 h-4 bg-secondary mb-4"></div>
                <div className="w-full h-24 bg-neutral-sand mb-4"></div>
                <div className="w-32 h-4 bg-neutral-sand mb-1"></div>
                <div className="w-20 h-3 bg-neutral-sand"></div>
              </div>
            ))
          ) : (
            displayTestimonials.map((testimonial: any) => (
              <div key={testimonial.id || testimonial._id} className="bg-neutral-cream p-6 rounded-md">
                <div className="flex text-secondary mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="italic text-neutral-gray mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-medium text-primary">{testimonial.name}</p>
                  <p className="text-sm text-neutral-gray">{new Date(testimonial.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
