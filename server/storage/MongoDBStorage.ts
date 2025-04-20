import {
  type User, type InsertUser, type Product, type InsertProduct,
  type Category, type InsertCategory, type Collection, type InsertCollection,
  type ProductCollection, type InsertProductCollection, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type Review, type InsertReview,
  type Testimonial, type InsertTestimonial, type Cart, type InsertCart,
  type CartItem, type InsertCartItem, type Banner, type InsertBanner
} from "@shared/schema";
import { IStorage } from "../storage";

// Import Mongoose models
import UserModel, { IUser } from "../models/User";
import ProductModel, { IProduct } from "../models/Product";
import CategoryModel, { ICategory } from "../models/Category";
import CollectionModel, { ICollection } from "../models/Collection";
import ProductCollectionModel, { IProductCollection } from "../models/ProductCollection";
import OrderModel, { IOrder } from "../models/Order";
import OrderItemModel, { IOrderItem } from "../models/OrderItem";
import ReviewModel, { IReview } from "../models/Review";
import TestimonialModel, { ITestimonial } from "../models/Testimonial";
import CartModel, { ICart } from "../models/Cart";
import CartItemModel, { ICartItem } from "../models/CartItem";
import BannerModel, { IBanner } from "../models/Banner";

// Helper function to convert Mongoose document to regular object
const convertToObject = <T>(doc: any): T => {
  return doc ? doc.toObject() : null;
};

export class MongoDBStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const user = await UserModel.findOne({ id });
    return user ? convertToObject<User>(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ email });
    return user ? convertToObject<User>(user) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // Find max ID to ensure unique IDs
    const maxIdUser = await UserModel.findOne().sort('-id');
    const id = maxIdUser ? maxIdUser.id + 1 : 1;
    
    const newUser = new UserModel({
      ...user,
      id,
      isAdmin: false, // Default value, can be changed later by an admin
      createdAt: new Date()
    });
    
    await newUser.save();
    return convertToObject<User>(newUser);
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const updatedUser = await UserModel.findOneAndUpdate(
      { id },
      { $set: userData },
      { new: true }
    );
    
    return updatedUser ? convertToObject<User>(updatedUser) : undefined;
  }

  // Product operations
  async getProducts(options: { limit?: number, offset?: number, categoryId?: number, collectionId?: number } = {}): Promise<Product[]> {
    let query: any = {};
    
    if (options.categoryId) {
      query.categoryId = options.categoryId;
    }
    
    let products: IProduct[];
    
    if (options.collectionId) {
      // Get product IDs from the collection
      const productCollections = await ProductCollectionModel.find({ 
        collectionId: options.collectionId 
      });
      const productIds = productCollections.map(pc => pc.productId);
      query.id = { $in: productIds };
    }
    
    let productsQuery = ProductModel.find(query);
    
    if (options.limit) {
      productsQuery = productsQuery.limit(options.limit);
    }
    
    if (options.offset) {
      productsQuery = productsQuery.skip(options.offset);
    }
    
    products = await productsQuery;
    return products.map(p => convertToObject<Product>(p));
  }

  async getProductById(id: number): Promise<Product | undefined> {
    const product = await ProductModel.findOne({ id });
    return product ? convertToObject<Product>(product) : undefined;
  }

  async getProductBySlug(slug: string): Promise<Product | undefined> {
    const product = await ProductModel.findOne({ slug });
    return product ? convertToObject<Product>(product) : undefined;
  }

  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    const query = ProductModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const products = await query;
    return products.map(p => convertToObject<Product>(p));
  }

  async getBestsellerProducts(limit?: number): Promise<Product[]> {
    const query = ProductModel.find({ bestseller: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const products = await query;
    return products.map(p => convertToObject<Product>(p));
  }

  async getNewProducts(limit?: number): Promise<Product[]> {
    const query = ProductModel.find({ isNew: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const products = await query;
    return products.map(p => convertToObject<Product>(p));
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    // Find max ID to ensure unique IDs
    const maxIdProduct = await ProductModel.findOne().sort('-id');
    const id = maxIdProduct ? maxIdProduct.id + 1 : 1;
    
    const newProduct = new ProductModel({
      ...product,
      id,
      createdAt: new Date()
    });
    
    await newProduct.save();
    return convertToObject<Product>(newProduct);
  }

  async updateProduct(id: number, productData: Partial<InsertProduct>): Promise<Product | undefined> {
    const updatedProduct = await ProductModel.findOneAndUpdate(
      { id },
      { $set: productData },
      { new: true }
    );
    
    return updatedProduct ? convertToObject<Product>(updatedProduct) : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await ProductModel.deleteOne({ id });
    
    // Also delete the product from any collections
    await ProductCollectionModel.deleteMany({ productId: id });
    
    return result.deletedCount > 0;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    const categories = await CategoryModel.find();
    return categories.map(c => convertToObject<Category>(c));
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const category = await CategoryModel.findOne({ id });
    return category ? convertToObject<Category>(category) : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const category = await CategoryModel.findOne({ slug });
    return category ? convertToObject<Category>(category) : undefined;
  }

  async getFeaturedCategories(limit?: number): Promise<Category[]> {
    const query = CategoryModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const categories = await query;
    return categories.map(c => convertToObject<Category>(c));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    // Find max ID to ensure unique IDs
    const maxIdCategory = await CategoryModel.findOne().sort('-id');
    const id = maxIdCategory ? maxIdCategory.id + 1 : 1;
    
    const newCategory = new CategoryModel({
      ...category,
      id
    });
    
    await newCategory.save();
    return convertToObject<Category>(newCategory);
  }

  async updateCategory(id: number, categoryData: Partial<InsertCategory>): Promise<Category | undefined> {
    const updatedCategory = await CategoryModel.findOneAndUpdate(
      { id },
      { $set: categoryData },
      { new: true }
    );
    
    return updatedCategory ? convertToObject<Category>(updatedCategory) : undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await CategoryModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    const collections = await CollectionModel.find();
    return collections.map(c => convertToObject<Collection>(c));
  }

  async getCollectionById(id: number): Promise<Collection | undefined> {
    const collection = await CollectionModel.findOne({ id });
    return collection ? convertToObject<Collection>(collection) : undefined;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    const collection = await CollectionModel.findOne({ slug });
    return collection ? convertToObject<Collection>(collection) : undefined;
  }

  async getFeaturedCollections(limit?: number): Promise<Collection[]> {
    const query = CollectionModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const collections = await query;
    return collections.map(c => convertToObject<Collection>(c));
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    // Find max ID to ensure unique IDs
    const maxIdCollection = await CollectionModel.findOne().sort('-id');
    const id = maxIdCollection ? maxIdCollection.id + 1 : 1;
    
    const newCollection = new CollectionModel({
      ...collection,
      id
    });
    
    await newCollection.save();
    return convertToObject<Collection>(newCollection);
  }

  async updateCollection(id: number, collectionData: Partial<InsertCollection>): Promise<Collection | undefined> {
    const updatedCollection = await CollectionModel.findOneAndUpdate(
      { id },
      { $set: collectionData },
      { new: true }
    );
    
    return updatedCollection ? convertToObject<Collection>(updatedCollection) : undefined;
  }

  async deleteCollection(id: number): Promise<boolean> {
    const result = await CollectionModel.deleteOne({ id });
    
    // Also delete the collection relationships
    await ProductCollectionModel.deleteMany({ collectionId: id });
    
    return result.deletedCount > 0;
  }

  // Product-Collection mapping
  async addProductToCollection(productCollection: InsertProductCollection): Promise<ProductCollection> {
    // Find max ID to ensure unique IDs
    const maxIdPC = await ProductCollectionModel.findOne().sort('-id');
    const id = maxIdPC ? maxIdPC.id + 1 : 1;
    
    const newProductCollection = new ProductCollectionModel({
      ...productCollection,
      id
    });
    
    await newProductCollection.save();
    return convertToObject<ProductCollection>(newProductCollection);
  }

  async removeProductFromCollection(productId: number, collectionId: number): Promise<boolean> {
    const result = await ProductCollectionModel.deleteOne({ 
      productId, 
      collectionId 
    });
    
    return result.deletedCount > 0;
  }

  async getProductCollections(productId: number): Promise<Collection[]> {
    const productCollections = await ProductCollectionModel.find({ productId });
    const collectionIds = productCollections.map(pc => pc.collectionId);
    
    const collections = await CollectionModel.find({ 
      id: { $in: collectionIds } 
    });
    
    return collections.map(c => convertToObject<Collection>(c));
  }

  async getCollectionProducts(collectionId: number): Promise<Product[]> {
    const productCollections = await ProductCollectionModel.find({ collectionId });
    const productIds = productCollections.map(pc => pc.productId);
    
    const products = await ProductModel.find({ 
      id: { $in: productIds } 
    });
    
    return products.map(p => convertToObject<Product>(p));
  }

  // Order operations
  async getOrders(userId?: number): Promise<Order[]> {
    const query = userId ? { userId } : {};
    const orders = await OrderModel.find(query);
    return orders.map(o => convertToObject<Order>(o));
  }

  async getOrderById(id: number): Promise<Order | undefined> {
    const order = await OrderModel.findOne({ id });
    return order ? convertToObject<Order>(order) : undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    // Find max ID to ensure unique IDs
    const maxIdOrder = await OrderModel.findOne().sort('-id');
    const id = maxIdOrder ? maxIdOrder.id + 1 : 1;
    
    const newOrder = new OrderModel({
      ...order,
      id,
      createdAt: new Date()
    });
    
    await newOrder.save();
    return convertToObject<Order>(newOrder);
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { id },
      { $set: { status } },
      { new: true }
    );
    
    return updatedOrder ? convertToObject<Order>(updatedOrder) : undefined;
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const orderItems = await OrderItemModel.find({ orderId });
    return orderItems.map(oi => convertToObject<OrderItem>(oi));
  }

  async addOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    // Find max ID to ensure unique IDs
    const maxIdOrderItem = await OrderItemModel.findOne().sort('-id');
    const id = maxIdOrderItem ? maxIdOrderItem.id + 1 : 1;
    
    const newOrderItem = new OrderItemModel({
      ...orderItem,
      id
    });
    
    await newOrderItem.save();
    return convertToObject<OrderItem>(newOrderItem);
  }

  // Review operations
  async getProductReviews(productId: number): Promise<Review[]> {
    const reviews = await ReviewModel.find({ productId });
    return reviews.map(r => convertToObject<Review>(r));
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    const reviews = await ReviewModel.find({ userId });
    return reviews.map(r => convertToObject<Review>(r));
  }

  async createReview(review: InsertReview): Promise<Review> {
    // Find max ID to ensure unique IDs
    const maxIdReview = await ReviewModel.findOne().sort('-id');
    const id = maxIdReview ? maxIdReview.id + 1 : 1;
    
    const newReview = new ReviewModel({
      ...review,
      id,
      createdAt: new Date()
    });
    
    await newReview.save();
    return convertToObject<Review>(newReview);
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review | undefined> {
    const updatedReview = await ReviewModel.findOneAndUpdate(
      { id },
      { $set: reviewData },
      { new: true }
    );
    
    return updatedReview ? convertToObject<Review>(updatedReview) : undefined;
  }

  async deleteReview(id: number): Promise<boolean> {
    const result = await ReviewModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  // Testimonial operations
  async getTestimonials(limit?: number): Promise<Testimonial[]> {
    const query = TestimonialModel.find();
    
    if (limit) {
      query.limit(limit);
    }
    
    const testimonials = await query;
    return testimonials.map(t => convertToObject<Testimonial>(t));
  }

  async getFeaturedTestimonials(limit?: number): Promise<Testimonial[]> {
    const query = TestimonialModel.find({ featured: true });
    
    if (limit) {
      query.limit(limit);
    }
    
    const testimonials = await query;
    return testimonials.map(t => convertToObject<Testimonial>(t));
  }

  async createTestimonial(testimonial: InsertTestimonial): Promise<Testimonial> {
    // Find max ID to ensure unique IDs
    const maxIdTestimonial = await TestimonialModel.findOne().sort('-id');
    const id = maxIdTestimonial ? maxIdTestimonial.id + 1 : 1;
    
    const newTestimonial = new TestimonialModel({
      ...testimonial,
      id,
      createdAt: new Date()
    });
    
    await newTestimonial.save();
    return convertToObject<Testimonial>(newTestimonial);
  }

  // Cart operations
  async getCart(userId?: number, sessionId?: string): Promise<Cart | undefined> {
    const query: any = {};
    
    if (userId) {
      query.userId = userId;
    } else if (sessionId) {
      query.sessionId = sessionId;
    } else {
      return undefined;
    }
    
    const cart = await CartModel.findOne(query);
    return cart ? convertToObject<Cart>(cart) : undefined;
  }

  async createCart(cart: InsertCart): Promise<Cart> {
    // Find max ID to ensure unique IDs
    const maxIdCart = await CartModel.findOne().sort('-id');
    const id = maxIdCart ? maxIdCart.id + 1 : 1;
    
    const newCart = new CartModel({
      ...cart,
      id,
      createdAt: new Date()
    });
    
    await newCart.save();
    return convertToObject<Cart>(newCart);
  }

  // Cart item operations
  async getCartItems(cartId: number): Promise<CartItem[]> {
    const cartItems = await CartItemModel.find({ cartId });
    return cartItems.map(ci => convertToObject<CartItem>(ci));
  }

  async addCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    // Find max ID to ensure unique IDs
    const maxIdCartItem = await CartItemModel.findOne().sort('-id');
    const id = maxIdCartItem ? maxIdCartItem.id + 1 : 1;
    
    // Check if item already exists in cart
    const existingItem = await CartItemModel.findOne({
      cartId: cartItem.cartId,
      productId: cartItem.productId
    });
    
    if (existingItem) {
      // Update quantity instead
      existingItem.quantity += cartItem.quantity;
      await existingItem.save();
      return convertToObject<CartItem>(existingItem);
    }
    
    // Create new cart item
    const newCartItem = new CartItemModel({
      ...cartItem,
      id
    });
    
    await newCartItem.save();
    return convertToObject<CartItem>(newCartItem);
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const updatedCartItem = await CartItemModel.findOneAndUpdate(
      { id },
      { $set: { quantity } },
      { new: true }
    );
    
    return updatedCartItem ? convertToObject<CartItem>(updatedCartItem) : undefined;
  }

  async removeCartItem(id: number): Promise<boolean> {
    const result = await CartItemModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  async clearCart(cartId: number): Promise<boolean> {
    const result = await CartItemModel.deleteMany({ cartId });
    return result.deletedCount > 0;
  }

  // Banner operations
  async getBanners(active?: boolean): Promise<Banner[]> {
    const query = active !== undefined ? { active } : {};
    const banners = await BannerModel.find(query).sort('position');
    return banners.map(b => convertToObject<Banner>(b));
  }

  async createBanner(banner: InsertBanner): Promise<Banner> {
    // Find max ID to ensure unique IDs
    const maxIdBanner = await BannerModel.findOne().sort('-id');
    const id = maxIdBanner ? maxIdBanner.id + 1 : 1;
    
    const newBanner = new BannerModel({
      ...banner,
      id
    });
    
    await newBanner.save();
    return convertToObject<Banner>(newBanner);
  }

  async updateBanner(id: number, bannerData: Partial<InsertBanner>): Promise<Banner | undefined> {
    const updatedBanner = await BannerModel.findOneAndUpdate(
      { id },
      { $set: bannerData },
      { new: true }
    );
    
    return updatedBanner ? convertToObject<Banner>(updatedBanner) : undefined;
  }

  async deleteBanner(id: number): Promise<boolean> {
    const result = await BannerModel.deleteOne({ id });
    return result.deletedCount > 0;
  }
}