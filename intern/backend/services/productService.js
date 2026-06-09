import { productRepository } from "../repositories/productRepository.js";
import redisClient from "../config/redis.js";

// Cache keys
const CACHE_KEYS = {
  ALL_PRODUCTS: (query) => `products:all:${JSON.stringify(query)}`,
  PRODUCT_BY_ID: (id) => `products:id:${id}`,
  CATEGORIES: "products:categories",
};

// Cache TTLs
const CACHE_TTL = {
  ALL_PRODUCTS: 300,  // 5 minutes
  PRODUCT_BY_ID: 600, // 10 minutes
  CATEGORIES: 3600,   // 1 hour
};

export const productService = {
  // Helper: Invalidate all product caches
  async invalidateAllProductCaches() {
    try {
      const keys = await redisClient.keys("products:*");
      if (keys.length > 0) {
        await redisClient.del(keys);
        console.log(`🗑️ Invalidated ${keys.length} product cache keys`);
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  },

  // Get all products with cache
  async getAllProducts(filters = {}) {
    const { page = 1, limit = 10, category, minPrice, maxPrice, search } = filters;

    // Build cache key
    const cacheKey = CACHE_KEYS.ALL_PRODUCTS({ page, limit, category, minPrice, maxPrice, search });

    // Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`❌ Cache miss: ${cacheKey}`);

    // Build database filter
    const dbFilter = {};
    if (category) dbFilter.category = category;
    if (minPrice || maxPrice) {
      dbFilter.price = {};
      if (minPrice) dbFilter.price.$gte = parseFloat(minPrice);
      if (maxPrice) dbFilter.price.$lte = parseFloat(maxPrice);
    }
    if (search) {
      dbFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Get from repository
    const { products, total } = await productRepository.findAll(dbFilter, {
      page,
      limit,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

    const response = {
      success: true,
      data: products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    };

    // Store in cache
    await redisClient.setEx(cacheKey, CACHE_TTL.ALL_PRODUCTS, JSON.stringify(response));

    return response;
  },

  // Get product by ID with cache
  async getProductById(id) {
    const cacheKey = CACHE_KEYS.PRODUCT_BY_ID(id);

    // Try cache
    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: ${cacheKey}`);
      return JSON.parse(cached);
    }

    console.log(`❌ Cache miss: ${cacheKey}`);

    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const response = { success: true, data: product };

    // Store in cache
    await redisClient.setEx(cacheKey, CACHE_TTL.PRODUCT_BY_ID, JSON.stringify(response));

    return response;
  },

  // Get categories with cache
  async getCategories() {
    const cacheKey = CACHE_KEYS.CATEGORIES;

    const cached = await redisClient.get(cacheKey);
    if (cached) {
      console.log(`✅ Cache hit: categories`);
      return JSON.parse(cached);
    }

    console.log(`❌ Cache miss: categories`);

    const categories = ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"];
    const response = { success: true, data: categories };

    await redisClient.setEx(cacheKey, CACHE_TTL.CATEGORIES, JSON.stringify(response));

    return response;
  },

  // Create product
  async createProduct(productData, userId) {
    const product = await productRepository.create({
      ...productData,
      createdBy: userId,
    });

    await this.invalidateAllProductCaches();

    return { success: true, message: "Product created successfully", data: product };
  },

  // Update product
  async updateProduct(id, updateData) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    const updatedProduct = await productRepository.updateById(id, updateData);

    await this.invalidateAllProductCaches();

    return { success: true, message: "Product updated successfully", data: updatedProduct };
  },

  // Delete product
  async deleteProduct(id) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    await productRepository.deleteById(id);

    await this.invalidateAllProductCaches();

    return { success: true, message: "Product deleted successfully" };
  },
};