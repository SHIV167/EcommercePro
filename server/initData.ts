import { log } from './vite';
import { storage } from './storage';

// Initialize demo data for the MongoDB database
export async function initDemoData() {
  try {
    log('Initializing demo data...', 'mongodb');
    
    // Check if we already have categories
    const existingCategories = await storage.getCategories();
    if (existingCategories.length > 0) {
      log('Demo data already exists. Skipping initialization.', 'mongodb');
      return;
    }

    // Add demo categories
    const skinCare = await storage.createCategory({
      name: "Skincare",
      description: "Ayurvedic skin care products",
      slug: "skincare",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const hairCare = await storage.createCategory({
      name: "Haircare",
      description: "Ayurvedic hair care products",
      slug: "haircare",
      imageUrl: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?ixlib=rb-4.0.3",
      featured: true
    });
    
    const bodycare = await storage.createCategory({
      name: "Bath & Body",
      description: "Ayurvedic body care products",
      slug: "bath-body",
      imageUrl: "https://images.unsplash.com/photo-1627467959547-215304e0e8cc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const wellness = await storage.createCategory({
      name: "Wellness",
      description: "Ayurvedic wellness products",
      slug: "wellness",
      imageUrl: "https://images.unsplash.com/photo-1591084863828-30ebecaf2c82?ixlib=rb-4.0.3",
      featured: true
    });

    // Add demo collections
    const kumkumadi = await storage.createCollection({
      name: "Kumkumadi Collection",
      description: "Premium Ayurvedic skincare with saffron",
      slug: "kumkumadi",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      featured: true
    });
    
    const amrrepa = await storage.createCollection({
      name: "Amrrepa Collection",
      description: "Holistic healing and rejuvenation",
      slug: "amrrepa",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });
    
    const ujjasara = await storage.createCollection({
      name: "Ujjasara Collection",
      description: "Advanced Ayurvedic haircare",
      slug: "ujjasara",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      featured: true
    });
    
    const bestsellers = await storage.createCollection({
      name: "Bestsellers",
      description: "Our most popular products",
      slug: "bestsellers",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });

    // Add demo products
    const product1 = await storage.createProduct({
      name: "Kumkumadi Youth-Clarifying Mask-Scrub",
      description: "A luxurious mask-scrub that gently cleanses and clarifies skin while enhancing radiance. This 2-in-1 formula is infused with kumkumadi oil, saffron, and natural exfoliants to reveal smoother, brighter skin.",
      shortDescription: "Gently Cleanses And Clears Skin, While Enhancing Radiance",
      price: 3695.00,
      imageUrl: "https://images.unsplash.com/photo-1608571423539-e951a99b1e8a",
      stock: 100,
      rating: 4.5,
      totalReviews: 19,
      slug: "kumkumadi-youth-clarifying-mask-scrub",
      categoryId: skinCare.id,
      featured: true,
      bestseller: true,
      isNew: true
    });
    
    const product2 = await storage.createProduct({
      name: "Kumkumadi Youth-Illuminating Silky Serum",
      description: "An innovative serum formulated with traditional Ayurvedic ingredients for skin brightening and illumination. This silky serum is the botanical alternative to Vitamin C, delivering intense hydration and radiance.",
      shortDescription: "The Botanical Alternative To Vitamin C",
      price: 2695.00,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      stock: 150,
      rating: 5.0,
      totalReviews: 3,
      slug: "kumkumadi-youth-illuminating-silky-serum",
      categoryId: skinCare.id,
      featured: true,
      bestseller: false,
      isNew: true
    });
    
    const product3 = await storage.createProduct({
      name: "Kumkumadi Glow Discovery Set",
      description: "Experience the magic of Kumkumadi with this curated set of glow-enhancing products. Powered with saffron, this trio delivers transformative results for radiant, youthful skin.",
      shortDescription: "Glow Trio | Powered With Saffron",
      price: 4250.00,
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      stock: 75,
      rating: 5.0,
      totalReviews: 7,
      slug: "kumkumadi-glow-discovery-set",
      categoryId: skinCare.id,
      featured: true,
      bestseller: true,
      isNew: false
    });
    
    const product4 = await storage.createProduct({
      name: "Kumkumadi Brightening Face Oil",
      description: "A luxurious Ayurvedic facial oil infused with saffron and 12 precious herbs to brighten skin, reduce dark spots, and promote a youthful glow.",
      shortDescription: "Luxurious Ayurvedic facial oil for brightening",
      price: 1995.00,
      imageUrl: "https://images.unsplash.com/photo-1629198735566-e36c0bd9ad76",
      stock: 200,
      rating: 5.0,
      totalReviews: 156,
      slug: "kumkumadi-brightening-face-oil",
      categoryId: skinCare.id,
      featured: true,
      bestseller: true,
      isNew: false
    });
    
    const product5 = await storage.createProduct({
      name: "Bringadi Intensive Hair Treatment Oil",
      description: "A potent hair treatment oil formulated with Indigo, Eclipta Alba, and Gooseberry to reduce hair fall, strengthen roots, and promote healthy growth.",
      shortDescription: "Reduces hair fall and promotes growth",
      price: 1695.00,
      imageUrl: "https://images.unsplash.com/photo-1631729371254-42c2892f0e6e",
      stock: 180,
      rating: 4.5,
      totalReviews: 124,
      slug: "bringadi-intensive-hair-treatment-oil",
      categoryId: hairCare.id,
      featured: false,
      bestseller: true,
      isNew: false
    });
    
    const product6 = await storage.createProduct({
      name: "Rose Jasmine Face Cleanser",
      description: "A gentle, aromatic cleanser that effectively removes impurities while preserving skin's natural moisture. Infused with rose and jasmine for a sensorial experience.",
      shortDescription: "Gentle cleansing with aromatic benefits",
      price: 1250.00,
      imageUrl: "https://images.unsplash.com/photo-1566958769312-82cef41d19ef",
      stock: 150,
      rating: 5.0,
      totalReviews: 89,
      slug: "rose-jasmine-face-cleanser",
      categoryId: skinCare.id,
      featured: false,
      bestseller: true,
      isNew: false
    });
    
    const product7 = await storage.createProduct({
      name: "Pure Rose Water",
      description: "Steam-distilled pure rose water that tones, hydrates, and refreshes skin. Can be used as a facial toner or added to face packs for enhanced benefits.",
      shortDescription: "Pure, steam-distilled rose hydrosol",
      price: 795.00,
      imageUrl: "https://images.unsplash.com/photo-1601055903647-ddf1ee9701b1",
      stock: 250,
      rating: 4.5,
      totalReviews: 173,
      slug: "pure-rose-water",
      categoryId: skinCare.id,
      featured: false,
      bestseller: true,
      isNew: false
    });

    // Add products to collections
    await storage.addProductToCollection({
      productId: product1.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product2.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product3.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product4.id,
      collectionId: kumkumadi.id
    });
    
    await storage.addProductToCollection({
      productId: product5.id,
      collectionId: ujjasara.id
    });
    
    await storage.addProductToCollection({
      productId: product6.id,
      collectionId: amrrepa.id
    });
    
    await storage.addProductToCollection({
      productId: product7.id,
      collectionId: amrrepa.id
    });
    
    await storage.addProductToCollection({
      productId: product4.id,
      collectionId: bestsellers.id
    });
    
    await storage.addProductToCollection({
      productId: product5.id,
      collectionId: bestsellers.id
    });
    
    await storage.addProductToCollection({
      productId: product6.id,
      collectionId: bestsellers.id
    });
    
    await storage.addProductToCollection({
      productId: product7.id,
      collectionId: bestsellers.id
    });

    // Add testimonials
    await storage.createTestimonial({
      name: "Priya S.",
      location: "Mumbai",
      rating: 5,
      testimonial: "The Kumkumadi face oil has transformed my skin. I've been using it for 3 months now and my skin looks more radiant and even-toned. The natural fragrance is also divine!",
      featured: true
    });
    
    await storage.createTestimonial({
      name: "Rahul M.",
      location: "Bangalore",
      rating: 5,
      testimonial: "I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong. My hair fall has reduced significantly and my scalp feels healthier. The best part is that it's all natural!",
      featured: true
    });
    
    await storage.createTestimonial({
      name: "Anita K.",
      location: "Delhi",
      rating: 4,
      testimonial: "The Rose Jasmine face cleanser is gentle yet effective. It removes all my makeup without drying out my skin. The scent is heavenly and leaves my face feeling fresh and clean.",
      featured: true
    });

    // Add banner
    await storage.createBanner({
      title: "DISCOVER NEXT GENERATION AYURVEDIC SKINCARE",
      subtitle: "CHOOSE ANY COMPLIMENTARY PRODUCTS OF YOUR CHOICE WORTH UPTO ₹3990",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      buttonText: "SHOP NOW",
      buttonLink: "/collections/all",
      active: true,
      order: 1
    });

    // Add admin user
    await storage.createUser({
      name: "Admin User",
      email: "admin@kamaayurveda.com",
      password: "admin123", // In a real app, this would be hashed
      isAdmin: true
    });

    log('Demo data initialization completed successfully', 'mongodb');
  } catch (error) {
    log(`Error initializing demo data: ${error}`, 'mongodb');
  }
}