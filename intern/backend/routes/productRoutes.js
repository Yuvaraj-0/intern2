import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getCategories,
} from "../controllers/productController.js";
import { productValidation, updateProductValidation } from "../validations/productValidation.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import validate from "../middleware/validate.js";
import { cache } from "../middleware/cacheMiddleware.js";

const router = express.Router();
const v1Router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 */

/**
 * @swagger
 * /v1/products:
 *   get:
 *     summary: Get all products with pagination and filters
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Items per page
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema: { type: number }
 *         description: Minimum price
 *       - in: query
 *         name: maxPrice
 *         schema: { type: number }
 *         description: Maximum price
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name or description
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProductsResponse'
 *       401:
 *         description: Unauthorized
 */
v1Router.get("/", cache(300), getAllProducts);

/**
 * @swagger
 * /v1/products/categories:
 *   get:
 *     summary: Get all product categories
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CategoriesResponse'
 */
v1Router.get("/categories", cache(3600), getCategories);

/**
 * @swagger
 * /v1/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       404:
 *         description: Product not found
 */
v1Router.get("/:id", cache(600), getProductById);

/**
 * @swagger
 * /v1/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, description, price]
 *             properties:
 *               name: { type: string, example: "Wireless Mouse" }
 *               description: { type: string, example: "Ergonomic wireless mouse with Bluetooth 5.0" }
 *               price: { type: number, example: 29.99 }
 *               category: { type: string, example: "Electronics" }
 *               stock: { type: number, example: 50 }
 *               imageUrl: { type: string, example: "https://example.com/mouse.jpg" }
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string }
 *                 data: { $ref: '#/components/schemas/Product' }
 *       400:
 *         description: Validation error
 *       403:
 *         description: Admin access required
 */
v1Router.post("/", authMiddleware, isAdmin, productValidation, validate, createProduct);

/**
 * @swagger
 * /v1/products/{id}:
 *   put:
 *     summary: Update product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               category: { type: string }
 *               stock: { type: number }
 *               imageUrl: { type: string }
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
v1Router.put("/:id", authMiddleware, isAdmin, updateProductValidation, validate, updateProduct);

/**
 * @swagger
 * /v1/products/{id}:
 *   delete:
 *     summary: Delete product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Product not found
 */
v1Router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.use("/v1/products", v1Router);

export default router;