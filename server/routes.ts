import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  userInsertSchema, 
  categoryInsertSchema, 
  collectionInsertSchema,
  productInsertSchema,
  reviewInsertSchema,
  testimonialInsertSchema,
  orderInsertSchema,
  orderItemInsertSchema,
  cartInsertSchema,
  cartItemInsertSchema,
  bannerInsertSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = userInsertSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Don't return password
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      
      const user = await storage.getUserByEmail(email);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In a real app, we would use JWT tokens
      const { password: _, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/users/:id", async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userData = req.body;
      
      // In a real app, verify the user is authorized
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const { limit, offset, categoryId, collectionId } = req.query;
      
      const options: any = {};
      
      if (limit) options.limit = parseInt(limit as string);
      if (offset) options.offset = parseInt(offset as string);
      if (categoryId) options.categoryId = parseInt(categoryId as string);
      if (collectionId) options.collectionId = parseInt(collectionId as string);
      
      const products = await storage.getProducts(options);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const products = await storage.getFeaturedProducts(limitNum);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/bestsellers", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const products = await storage.getBestsellerProducts(limitNum);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/new", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const products = await storage.getNewProducts(limitNum);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/:idOrSlug", async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let product;
      
      // Try to parse as ID first
      if (/^\d+$/.test(idOrSlug)) {
        product = await storage.getProductById(parseInt(idOrSlug));
      }
      
      // If not found, try as slug
      if (!product) {
        product = await storage.getProductBySlug(idOrSlug);
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.status(200).json(product);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = productInsertSchema.parse(req.body);
      
      const product = await storage.createProduct(validatedData);
      
      return res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const productData = req.body;
      
      const updatedProduct = await storage.updateProduct(productId, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.status(200).json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      
      const success = await storage.deleteProduct(productId);
      
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/categories/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const categories = await storage.getFeaturedCategories(limitNum);
      
      return res.status(200).json(categories);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/categories/:idOrSlug", async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let category;
      
      // Try to parse as ID first
      if (/^\d+$/.test(idOrSlug)) {
        category = await storage.getCategoryById(parseInt(idOrSlug));
      }
      
      // If not found, try as slug
      if (!category) {
        category = await storage.getCategoryBySlug(idOrSlug);
      }
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(category);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = categoryInsertSchema.parse(req.body);
      
      const category = await storage.createCategory(validatedData);
      
      return res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const categoryData = req.body;
      
      const updatedCategory = await storage.updateCategory(categoryId, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(200).json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      
      const success = await storage.deleteCategory(categoryId);
      
      if (!success) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Collection routes
  app.get("/api/collections", async (req, res) => {
    try {
      const collections = await storage.getCollections();
      return res.status(200).json(collections);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/collections/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const collections = await storage.getFeaturedCollections(limitNum);
      
      return res.status(200).json(collections);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/collections/:idOrSlug", async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let collection;
      
      // Try to parse as ID first
      if (/^\d+$/.test(idOrSlug)) {
        collection = await storage.getCollectionById(parseInt(idOrSlug));
      }
      
      // If not found, try as slug
      if (!collection) {
        collection = await storage.getCollectionBySlug(idOrSlug);
      }
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      return res.status(200).json(collection);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/collections/:idOrSlug/products", async (req, res) => {
    try {
      const idOrSlug = req.params.idOrSlug;
      let collection;
      
      // Try to parse as ID first
      if (/^\d+$/.test(idOrSlug)) {
        collection = await storage.getCollectionById(parseInt(idOrSlug));
      }
      
      // If not found, try as slug
      if (!collection) {
        collection = await storage.getCollectionBySlug(idOrSlug);
      }
      
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      const products = await storage.getCollectionProducts(collection.id);
      
      return res.status(200).json(products);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/collections", async (req, res) => {
    try {
      const validatedData = collectionInsertSchema.parse(req.body);
      
      const collection = await storage.createCollection(validatedData);
      
      return res.status(201).json(collection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/collections/:id", async (req, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      const collectionData = req.body;
      
      const updatedCollection = await storage.updateCollection(collectionId, collectionData);
      
      if (!updatedCollection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      return res.status(200).json(updatedCollection);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/collections/:id", async (req, res) => {
    try {
      const collectionId = parseInt(req.params.id);
      
      const success = await storage.deleteCollection(collectionId);
      
      if (!success) {
        return res.status(404).json({ message: "Collection not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Product-Collection routes
  app.post("/api/product-collections", async (req, res) => {
    try {
      const { productId, collectionId } = req.body;
      
      if (!productId || !collectionId) {
        return res.status(400).json({ message: "productId and collectionId are required" });
      }
      
      const productCollection = await storage.addProductToCollection({
        productId,
        collectionId
      });
      
      return res.status(201).json(productCollection);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/product-collections", async (req, res) => {
    try {
      const { productId, collectionId } = req.body;
      
      if (!productId || !collectionId) {
        return res.status(400).json({ message: "productId and collectionId are required" });
      }
      
      const success = await storage.removeProductFromCollection(
        productId,
        collectionId
      );
      
      if (!success) {
        return res.status(404).json({ message: "Product-Collection mapping not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Review routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      
      const reviews = await storage.getProductReviews(productId);
      
      return res.status(200).json(reviews);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/reviews", async (req, res) => {
    try {
      const validatedData = reviewInsertSchema.parse(req.body);
      
      const review = await storage.createReview(validatedData);
      
      return res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Testimonial routes
  app.get("/api/testimonials", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const testimonials = await storage.getTestimonials(limitNum);
      
      return res.status(200).json(testimonials);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/testimonials/featured", async (req, res) => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;
      
      const testimonials = await storage.getFeaturedTestimonials(limitNum);
      
      return res.status(200).json(testimonials);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/testimonials", async (req, res) => {
    try {
      const validatedData = testimonialInsertSchema.parse(req.body);
      
      const testimonial = await storage.createTestimonial(validatedData);
      
      return res.status(201).json(testimonial);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const { userId } = req.query;
      const userIdNum = userId ? parseInt(userId as string) : undefined;
      
      const orders = await storage.getOrders(userIdNum);
      
      return res.status(200).json(orders);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/orders/:id", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      const order = await storage.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      return res.status(200).json(order);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/orders/:id/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      const orderItems = await storage.getOrderItems(orderId);
      
      return res.status(200).json(orderItems);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = orderInsertSchema.parse(req.body);
      
      const order = await storage.createOrder(validatedData);
      
      return res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/orders/:id/items", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      
      const validatedData = orderItemInsertSchema.parse({
        ...req.body,
        orderId
      });
      
      const orderItem = await storage.addOrderItem(validatedData);
      
      return res.status(201).json(orderItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      return res.status(200).json(updatedOrder);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const { userId, sessionId } = req.query;
      
      if (!userId && !sessionId) {
        return res.status(400).json({ message: "Either userId or sessionId is required" });
      }
      
      const userIdNum = userId ? parseInt(userId as string) : undefined;
      const sessionIdStr = sessionId as string;
      
      let cart = await storage.getCart(userIdNum, sessionIdStr);
      
      // Create cart if it doesn't exist
      if (!cart) {
        cart = await storage.createCart({
          userId: userIdNum,
          sessionId: sessionIdStr
        });
      }
      
      // Get cart items
      const cartItems = await storage.getCartItems(cart.id);
      
      // Get product details for each cart item
      const cartItemsWithProduct = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProductById(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      return res.status(200).json({
        ...cart,
        items: cartItemsWithProduct
      });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/cart/items", async (req, res) => {
    try {
      const { cartId, productId, quantity } = req.body;
      
      if (!cartId || !productId || !quantity) {
        return res.status(400).json({ message: "cartId, productId, and quantity are required" });
      }
      
      const validatedData = cartItemInsertSchema.parse({
        cartId,
        productId,
        quantity
      });
      
      const cartItem = await storage.addCartItem(validatedData);
      
      return res.status(201).json(cartItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/cart/items/:id", async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (quantity === undefined) {
        return res.status(400).json({ message: "Quantity is required" });
      }
      
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      if (!updatedCartItem && quantity > 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      return res.status(200).json(updatedCartItem || { id: cartItemId, deleted: true });
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      
      const success = await storage.removeCartItem(cartItemId);
      
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const cartId = parseInt(req.params.id);
      
      const success = await storage.clearCart(cartId);
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  // Banner routes
  app.get("/api/banners", async (req, res) => {
    try {
      const { active } = req.query;
      const activeFilter = active !== undefined ? active === "true" : undefined;
      
      const banners = await storage.getBanners(activeFilter);
      
      return res.status(200).json(banners);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/banners", async (req, res) => {
    try {
      const validatedData = bannerInsertSchema.parse(req.body);
      
      const banner = await storage.createBanner(validatedData);
      
      return res.status(201).json(banner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      const bannerData = req.body;
      
      const updatedBanner = await storage.updateBanner(bannerId, bannerData);
      
      if (!updatedBanner) {
        return res.status(404).json({ message: "Banner not found" });
      }
      
      return res.status(200).json(updatedBanner);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      return res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/banners/:id", async (req, res) => {
    try {
      const bannerId = parseInt(req.params.id);
      
      const success = await storage.deleteBanner(bannerId);
      
      if (!success) {
        return res.status(404).json({ message: "Banner not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
