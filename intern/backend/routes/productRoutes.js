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

// Public routes (with cache)
v1Router.get("/", cache(300), getAllProducts);
v1Router.get("/categories", cache(3600), getCategories);
v1Router.get("/:id", cache(600), getProductById);

// Admin only routes
v1Router.post("/", authMiddleware, isAdmin, productValidation, validate, createProduct);
v1Router.put("/:id", authMiddleware, isAdmin, updateProductValidation, validate, updateProduct);
v1Router.delete("/:id", authMiddleware, isAdmin, deleteProduct);

router.use("/v1/products", v1Router);

export default router;