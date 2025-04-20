import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Products schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  shortDescription: text("short_description"),
  price: doublePrecision("price").notNull(),
  discountedPrice: doublePrecision("discounted_price"),
  imageUrl: text("image_url").notNull(),
  stock: integer("stock").notNull().default(0),
  rating: doublePrecision("rating").default(0),
  totalReviews: integer("total_reviews").default(0),
  slug: text("slug").notNull().unique(),
  categoryId: integer("category_id").notNull(),
  featured: boolean("featured").default(false),
  bestseller: boolean("bestseller").default(false),
  isNew: boolean("is_new").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const productInsertSchema = createInsertSchema(products)
  .omit({ id: true, createdAt: true });

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
});

export const categoryInsertSchema = createInsertSchema(categories)
  .omit({ id: true });

// Collections schema
export const collections = pgTable("collections", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  featured: boolean("featured").default(false),
});

export const collectionInsertSchema = createInsertSchema(collections)
  .omit({ id: true });

// Product-Collection join table
export const productCollections = pgTable("product_collections", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  collectionId: integer("collection_id").notNull(),
});

export const productCollectionInsertSchema = createInsertSchema(productCollections)
  .omit({ id: true });

// Users schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  phone: text("phone"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userInsertSchema = createInsertSchema(users)
  .omit({ id: true, isAdmin: true, createdAt: true });

// Orders schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  status: text("status").notNull().default("pending"),
  total: doublePrecision("total").notNull(),
  shippingAddress: text("shipping_address").notNull(),
  billingAddress: text("billing_address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orderInsertSchema = createInsertSchema(orders)
  .omit({ id: true, createdAt: true });

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: doublePrecision("price").notNull(),
});

export const orderItemInsertSchema = createInsertSchema(orderItems)
  .omit({ id: true });

// Reviews schema
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userId: integer("user_id").notNull(),
  rating: integer("rating").notNull(),
  review: text("review"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviewInsertSchema = createInsertSchema(reviews)
  .omit({ id: true, createdAt: true });

// Testimonials schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  rating: integer("rating").notNull(),
  testimonial: text("testimonial").notNull(),
  featured: boolean("featured").default(false),
});

export const testimonialInsertSchema = createInsertSchema(testimonials)
  .omit({ id: true });

// Cart schema
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  sessionId: text("session_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const cartInsertSchema = createInsertSchema(carts)
  .omit({ id: true, createdAt: true });

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
});

export const cartItemInsertSchema = createInsertSchema(cartItems)
  .omit({ id: true });

// Banner schema
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  imageUrl: text("image_url").notNull(),
  buttonText: text("button_text"),
  buttonLink: text("button_link"),
  active: boolean("active").default(true),
  order: integer("order").default(0),
});

export const bannerInsertSchema = createInsertSchema(banners)
  .omit({ id: true });

// Type exports
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof productInsertSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof categoryInsertSchema>;

export type Collection = typeof collections.$inferSelect;
export type InsertCollection = z.infer<typeof collectionInsertSchema>;

export type ProductCollection = typeof productCollections.$inferSelect;
export type InsertProductCollection = z.infer<typeof productCollectionInsertSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof userInsertSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof orderInsertSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof orderItemInsertSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof reviewInsertSchema>;

export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = z.infer<typeof testimonialInsertSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof cartInsertSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof cartItemInsertSchema>;

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = z.infer<typeof bannerInsertSchema>;
