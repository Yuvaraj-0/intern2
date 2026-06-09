import Product from "../models/Product.js";

export const productRepository = {
  // Find all products with filters
  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "desc" } = options;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [products, total] = await Promise.all([
      Product.find(filters)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate("createdBy", "name email"),
      Product.countDocuments(filters),
    ]);

    return { products, total };
  },

  // Find product by ID
  async findById(id) {
    return await Product.findById(id).populate("createdBy", "name email");
  },

  // Create product
  async create(productData) {
    return await Product.create(productData);
  },

  // Update product by ID
  async updateById(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("createdBy", "name email");
  },

  // Delete product by ID
  async deleteById(id) {
    return await Product.findByIdAndDelete(id);
  },
};