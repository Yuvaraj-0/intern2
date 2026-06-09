import { validationResult } from "express-validator";
import { productService } from "../services/productService.js";

export const getAllProducts = async (req, res) => {
  try {
    const result = await productService.getAllProducts(req.query);
    res.status(200).json(result);
  } catch (error) {
    console.error("GetAllProducts Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const result = await productService.getProductById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("GetProductById Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const result = await productService.getCategories();
    res.status(200).json(result);
  } catch (error) {
    console.error("GetCategories Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const result = await productService.createProduct(req.body, req.user.userId);
    res.status(201).json(result);
  } catch (error) {
    console.error("CreateProduct Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const result = await productService.updateProduct(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("UpdateProduct Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const result = await productService.deleteProduct(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === "Product not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    console.error("DeleteProduct Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};