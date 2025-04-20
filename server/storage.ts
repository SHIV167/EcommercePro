import {
  users, products, categories, collections, productCollections,
  orders, orderItems, reviews, testimonials, carts, cartItems, banners,
  type User, type InsertUser, type Product, type InsertProduct,
  type Category, type InsertCategory, type Collection, type InsertCollection,
  type ProductCollection, type InsertProductCollection, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type Review, type InsertReview,
  type Testimonial, type InsertTestimonial, type Cart, type InsertCart,
  type CartItem, type InsertCartItem, type Banner, type InsertBanner
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Product operations
  getProducts(options?: { limit?: number, offset?: number, categoryId?: number, collectionId?: number }): Promise<Product[]>;
  getProductById(id: number): Promise<Product | undefined>;
  getProductBySlug(slug: string): Promise<Product | undefined>;
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  getBestsellerProducts(limit?: number): Promise<Product[]>;
  getNewProducts(limit?: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getFeaturedCategories(limit?: number): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Collection operations
  getCollections(): Promise<Collection[]>;
  getCollectionById(id: number): Promise<Collection | undefined>;
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  getFeaturedCollections(limit?: number): Promise<Collection[]>;
  createCollection(collection: InsertCollection): Promise<Collection>;
  updateCollection(id: number, collection: Partial<InsertCollection>): Promise<Collection | undefined>;
  deleteCollection(id: number): Promise<boolean>;
  
  // Product-Collection mapping
  addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection>;
  removeProductFromCollection(productId: number, collectionId: number): Promise<boolean>;
  getProductCollections(productId: number): Promise<Collection[]>;
  getCollectionProducts(collectionId: number): Promise<Product[]>;
  
  // Order operations
  getOrders(userId?: number): Promise<Order[]>;
  getOrderById(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Review operations
  getProductReviews(productId: number): Promise<Review[]>;
  getUserReviews(userId: number): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review | undefined>;
  deleteReview(id: number): Promise<boolean>;
  
  // Testimonial operations
  getTestimonials(limit?: number): Promise<Testimonial[]>;
  getFeaturedTestimonials(limit?: number): Promise<Testimonial[]>;
  createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial>;
  
  // Cart operations
  getCart(userId?: number, sessionId?: string): Promise<Cart | undefined>;
  createCart(cart: InsertCart): Promise<Cart>;
  
  // Cart item operations
  getCartItems(cartId: number): Promise<CartItem[]>;
  addCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  removeCartItem(id: number): Promise<boolean>;
  clearCart(cartId: number): Promise<boolean>;
  
  // Banner operations
  getBanners(active?: boolean): Promise<Banner[]>;
  createBanner(banner: InsertBanner): Promise<Banner>;
  updateBanner(id: number, banner: Partial<InsertBanner>): Promise<Banner | undefined>;
  deleteBanner(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private collections: Map<number, Collection>;
  private productCollections: Map<number, ProductCollection>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private reviews: Map<number, Review>;
  private testimonials: Map<number, Testimonial>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  private banners: Map<number, Banner>;
  
  private userId: number;
  private productId: number;
  private categoryId: number;
  private collectionId: number;
  private productCollectionId: number;
  private orderId: number;
  private orderItemId: number;
  private reviewId: number;
  private testimonialId: number;
  private cartId: number;
  private cartItemId: number;
  private bannerId: number;
  
  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.collections = new Map();
    this.productCollections = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.reviews = new Map();
    this.testimonials = new Map();
    this.carts = new Map();
    this.cartItems = new Map();
    this.banners = new Map();
    
    this.userId = 1;
    this.productId = 1;
    this.categoryId = 1;
    this.collectionId = 1;
    this.productCollectionId = 1;
    this.orderId = 1;
    this.orderItemId = 1;
    this.reviewId = 1;
    this.testimonialId = 1;
    this.cartId = 1;
    this.cartItemId = 1;
    this.bannerId = 1;
    
    // Initialize with some demo data
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Add demo categories
    const skinCare = this.createCategory({
      name: "Skincare",
      description: "Ayurvedic skin care products",
      slug: "skincare",
      imageUrl: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const hairCare = this.createCategory({
      name: "Haircare",
      description: "Ayurvedic hair care products",
      slug: "haircare",
      imageUrl: "https://images.unsplash.com/photo-1574621100236-d25b64cfd647?ixlib=rb-4.0.3",
      featured: true
    });
    
    const bodycare = this.createCategory({
      name: "Bath & Body",
      description: "Ayurvedic body care products",
      slug: "bath-body",
      imageUrl: "https://images.unsplash.com/photo-1627467959547-215304e0e8cc?ixlib=rb-4.0.3",
      featured: true
    });
    
    const wellness = this.createCategory({
      name: "Wellness",
      description: "Ayurvedic wellness products",
      slug: "wellness",
      imageUrl: "https://images.unsplash.com/photo-1591084863828-30ebecaf2c82?ixlib=rb-4.0.3",
      featured: true
    });

    // Add demo collections
    const kumkumadi = this.createCollection({
      name: "Kumkumadi Collection",
      description: "Premium Ayurvedic skincare with saffron",
      slug: "kumkumadi",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      featured: true
    });
    
    const amrrepa = this.createCollection({
      name: "Amrrepa Collection",
      description: "Holistic healing and rejuvenation",
      slug: "amrrepa",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });
    
    const ujjasara = this.createCollection({
      name: "Ujjasara Collection",
      description: "Advanced Ayurvedic haircare",
      slug: "ujjasara",
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be",
      featured: true
    });
    
    const bestsellers = this.createCollection({
      name: "Bestsellers",
      description: "Our most popular products",
      slug: "bestsellers",
      imageUrl: "https://images.unsplash.com/photo-1619451683295-87ea57cbdabb",
      featured: true
    });

    // Add demo products
    const product1 = this.createProduct({
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
    
    const product2 = this.createProduct({
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
    
    const product3 = this.createProduct({
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
    
    const product4 = this.createProduct({
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
    
    const product5 = this.createProduct({
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
    
    const product6 = this.createProduct({
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
    
    const product7 = this.createProduct({
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
    this.addProductToCollection({
      productId: product1.id,
      collectionId: kumkumadi.id
    });
    
    this.addProductToCollection({
      productId: product2.id,
      collectionId: kumkumadi.id
    });
    
    this.addProductToCollection({
      productId: product3.id,
      collectionId: kumkumadi.id
    });
    
    this.addProductToCollection({
      productId: product4.id,
      collectionId: kumkumadi.id
    });
    
    this.addProductToCollection({
      productId: product5.id,
      collectionId: ujjasara.id
    });
    
    this.addProductToCollection({
      productId: product6.id,
      collectionId: amrrepa.id
    });
    
    this.addProductToCollection({
      productId: product7.id,
      collectionId: amrrepa.id
    });
    
    this.addProductToCollection({
      productId: product4.id,
      collectionId: bestsellers.id
    });
    
    this.addProductToCollection({
      productId: product5.id,
      collectionId: bestsellers.id
    });
    
    this.addProductToCollection({
      productId: product6.id,
      collectionId: bestsellers.id
    });
    
    this.addProductToCollection({
      productId: product7.id,
      collectionId: bestsellers.id
    });

    // Add testimonials
    this.createTestimonial({
      name: "Priya S.",
      location: "Mumbai",
      rating: 5,
      testimonial: "The Kumkumadi face oil has transformed my skin. I've been using it for 3 months now and my skin looks more radiant and even-toned. The natural fragrance is also divine!",
      featured: true
    });
    
    this.createTestimonial({
      name: "Rahul M.",
      location: "Bangalore",
      rating: 5,
      testimonial: "I was skeptical about Ayurvedic hair care but Bringadi oil has proven me wrong. My hair fall has reduced significantly and my scalp feels healthier. The best part is that it's all natural!",
      featured: true
    });
    
    this.createTestimonial({
      name: "Anita K.",
      location: "Delhi",
      rating: 4,
      testimonial: "The Rose Jasmine face cleanser is gentle yet effective. It removes all my makeup without drying out my skin. The scent is heavenly and leaves my face feeling fresh and clean.",
      featured: true
    });

    // Add banner
    this.createBanner({
      title: "DISCOVER NEXT GENERATION AYURVEDIC SKINCARE",
      subtitle: "CHOOSE ANY COMPLIMENTARY PRODUCTS OF YOUR CHOICE WORTH UPTO ₹3990",
      imageUrl: "https://images.unsplash.com/photo-1617500603321-cae6be1442f1",
      buttonText: "SHOP NOW",
      buttonLink: "/collections/all",
      active: true,
      order: 1
    });

    // Add admin user
    this.createUser({
      name: "Admin User",
      email: "admin@kamaayurveda.com",
      password: "admin123", // In real app, this would be hashed
      isAdmin: true
    } as any);
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id, isAdmin: false, createdAt: new Date() };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Product operations
  async getProducts(options: { limit?: number, offset?: number, categoryId?: number, collectionId?: number } = {}): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (options.categoryId) {
      products = products.filter(product => product.categoryId === options.categoryId);
    }
    
    if (options.collectionId) {
      const collectionProducts = await this.getCollectionProducts(options.collectionId);
      const collectionProductIds = collectionProducts.map(p => p.id);
      products = products.filter(product => collectionProductIds.includes(product.id));
    }
    
    const offset = options.offset || 0;
    const limit = options.limit || products.length;
    
    return products.slice(offset, offset + limit);
  }

  async getProductById(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    return Array.from(this.products.values()).find(product => product.slug === slug);
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const featuredProducts = Array.from(this.products.values())
      .filter(product => product.featured);
    
    return limit ? featuredProducts.slice(0, limit) : featuredProducts;
  }

  async getBestsellerProducts(limit?: number): Promise<Product[]> {
    const bestsellerProducts = Array.from(this.products.values())
      .filter(product => product.bestseller);
    
    return limit ? bestsellerProducts.slice(0, limit) : bestsellerProducts;
  }

  async getNewProducts(limit?: number): Promise<Product[]> {
    const newProducts = Array.from(this.products.values())
      .filter(product => product.isNew);
    
    return limit ? newProducts.slice(0, limit) : newProducts;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = {
      ...product,
      id,
      createdAt: new Date()
    };
    this.products.set(id, newProduct);
    return newProduct;
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...productData };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(category => category.slug === slug);
  }

  async getFeaturedCategories(limit?: number): Promise<Category[]> {
    const featuredCategories = Array.from(this.categories.values())
      .filter(category => category.featured);
    
    return limit ? featuredCategories.slice(0, limit) : featuredCategories;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...categoryData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values());
  }

  async getCollectionById(id: number): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    return Array.from(this.collections.values()).find(collection => collection.slug === slug);
  }

  async getFeaturedCollections(limit?: number): Promise<Collection[]> {
    const featuredCollections = Array.from(this.collections.values())
      .filter(collection => collection.featured);
    
    return limit ? featuredCollections.slice(0, limit) : featuredCollections;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = this.collectionId++;
    const newCollection: Collection = { ...collection, id };
    this.collections.set(id, newCollection);
    return newCollection;
  }

  async updateCollection(id: number, collectionData: Partial<InsertCollection>): Promise<Collection | undefined> {
    const collection = this.collections.get(id);
    if (!collection) return undefined;
    
    const updatedCollection = { ...collection, ...collectionData };
    this.collections.set(id, updatedCollection);
    return updatedCollection;
  }

  async deleteCollection(id: number): Promise<boolean> {
    return this.collections.delete(id);
  }

  // Product-Collection mapping
  async addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection> {
    const id = this.productCollectionId++;
    const newProductCollection: ProductCollection = { ...productCollection, id };
    this.productCollections.set(id, newProductCollection);
    return newProductCollection;
  }

  async removeProductFromCollection(productId: number, collectionId: number): Promise<boolean> {
    const entry = Array.from(this.productCollections.entries())
      .find(([_, pc]) => pc.productId === productId && pc.collectionId === collectionId);
    
    if (!entry) return false;
    return this.productCollections.delete(entry[0]);
  }

  async getProductCollections(productId: number): Promise<Collection[]> {
    const collectionIds = Array.from(this.productCollections.values())
      .filter(pc => pc.productId === productId)
      .map(pc => pc.collectionId);
    
    return Array.from(this.collections.values())
      .filter(collection => collectionIds.includes(collection.id));
  }

  async getCollectionProducts(collectionId: number): Promise<Product[]> {
    const productIds = Array.from(this.productCollections.values())
      .filter(pc => pc.collectionId === collectionId)
      .map(pc => pc.productId);
    
    return Array.from(this.products.values())
      .filter(product => productIds.includes(product.id));
  }

  // Order operations
  async getOrders(userId?: number): Promise<Order[]> {
    let orders = Array.from(this.orders.values());
    
    if (userId) {
      orders = orders.filter(order => order.userId === userId);
    }
    
    return orders;
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const id = this.orderId++;
    const newOrder: Order = {
      ...order,
      id,
      createdAt: new Date()
    };
    this.orders.set(id, newOrder);
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, status };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.orderItemId++;
    const newOrderItem: OrderItem = { ...orderItem, id };
    this.orderItems.set(id, newOrderItem);
    return newOrderItem;
  }

  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.productId === productId);
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    return Array.from(this.reviews.values())
      .filter(review => review.userId === userId);
  }

  async createReview(review: InsertReview): Promise<Review> {
    const id = this.reviewId++;
    const newReview: Review = {
      ...review,
      id,
      createdAt: new Date()
    };
    this.reviews.set(id, newReview);
    
    // Update product rating
    const product = this.products.get(review.productId);
    if (product) {
      const reviews = await this.getProductReviews(review.productId);
      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
      const avgRating = totalRating / reviews.length;
      
      this.updateProduct(product.id, {
        rating: avgRating,
        totalReviews: reviews.length
      });
    }
    
    return newReview;
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const review = this.reviews.get(id);
    if (!review) return undefined;
    
    const updatedReview = { ...review, ...reviewData };
    this.reviews.set(id, updatedReview);
    
    // Update product rating
    if (reviewData.rating) {
      const product = this.products.get(review.productId);
      if (product) {
        const reviews = await this.getProductReviews(review.productId);
        const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
        const avgRating = totalRating / reviews.length;
        
        this.updateProduct(product.id, {
          rating: avgRating
        });
      }
    }
    
    return updatedReview;
  }

  async deleteReview(id: number): Promise<boolean> {
    const review = this.reviews.get(id);
    if (!review) return false;
    
    const result = this.reviews.delete(id);
    
    // Update product rating
    if (result) {
      const product = this.products.get(review.productId);
      if (product) {
        const reviews = await this.getProductReviews(review.productId);
        
        if (reviews.length === 0) {
          this.updateProduct(product.id, {
            rating: 0,
            totalReviews: 0
          });
        } else {
          const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
          const avgRating = totalRating / reviews.length;
          
          this.updateProduct(product.id, {
            rating: avgRating,
            totalReviews: reviews.length
          });
        }
      }
    }
    
    return result;
  }

  // Testimonial operations
  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    const testimonials = Array.from(this.testimonials.values());
    return limit ? testimonials.slice(0, limit) : testimonials;
  }

  async getFeaturedTestimonials(limit?: number): Promise<Testimonial[]> {
    const featuredTestimonials = Array.from(this.testimonials.values())
      .filter(testimonial => testimonial.featured);
    
    return limit ? featuredTestimonials.slice(0, limit) : featuredTestimonials;
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    const id = this.testimonialId++;
    const newTestimonial: Testimonial = { ...testimonial, id };
    this.testimonials.set(id, newTestimonial);
    return newTestimonial;
  }

  // Cart operations
  async getCart(userId?: number, sessionId?: string): Promise<Cart | undefined> {
    if (userId) {
      return Array.from(this.carts.values())
        .find(cart => cart.userId === userId);
    }
    
    if (sessionId) {
      return Array.from(this.carts.values())
        .find(cart => cart.sessionId === sessionId);
    }
    
    return undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    const id = this.cartId++;
    const newCart: Cart = {
      ...cart,
      id,
      createdAt: new Date()
    };
    this.carts.set(id, newCart);
    return newCart;
  }

  // Cart item operations
  async getCartItems(cartId: number): Promise<CartItem[]> {
    return Array.from(this.cartItems.values())
      .filter(item => item.cartId === cartId);
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values())
      .find(item => item.cartId === cartItem.cartId && item.productId === cartItem.productId);
    
    if (existingItem) {
      return this.updateCartItemQuantity(existingItem.id, existingItem.quantity + cartItem.quantity) as Promise<CartItem>;
    }
    
    const id = this.cartItemId++;
    const newCartItem: CartItem = { ...cartItem, id };
    this.cartItems.set(id, newCartItem);
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }
    
    const updatedCartItem = { ...cartItem, quantity };
    this.cartItems.set(id, updatedCartItem);
    return updatedCartItem;
  }

  async removeCartItem(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(cartId: number): Promise<boolean> {
    const itemIds = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.cartId === cartId)
      .map(([id, _]) => id);
    
    for (const id of itemIds) {
      this.cartItems.delete(id);
    }
    
    return true;
  }

  // Banner operations
  async getBanners(active?: boolean): Promise<Banner[]> {
    let banners = Array.from(this.banners.values());
    
    if (active !== undefined) {
      banners = banners.filter(banner => banner.active === active);
    }
    
    return banners.sort((a, b) => a.order - b.order);
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    const id = this.bannerId++;
    const newBanner: Banner = { ...banner, id };
    this.banners.set(id, newBanner);
    return newBanner;
  }

  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> {
    const banner = this.banners.get(id);
    if (!banner) return undefined;
    
    const updatedBanner = { ...banner, ...bannerData };
    this.banners.set(id, updatedBanner);
    return updatedBanner;
  }

  async deleteBanner(id: number): Promise<boolean> {
    return this.banners.delete(id);
  }
}

// Import the MongoDB storage implementation
import { MongoDBStorage } from './storage/MongoDBStorage';

// Create and export the storage instance
export const storage = new MongoDBStorage();
