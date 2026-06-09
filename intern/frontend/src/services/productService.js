import api from "./api";

export const productService = {
  async getProducts(params = {}) {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key]) {
        queryParams.append(key, params[key]);
      }
    });
    const url = `/v1/products${queryParams.toString() ? `?${queryParams}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  async getProductById(id) {
    const response = await api.get(`/v1/products/${id}`);
    return response.data;
  },

  async createProduct(productData) {
    const response = await api.post("/v1/products", productData);
    return response.data;
  },

  async updateProduct(id, productData) {
    const response = await api.put(`/v1/products/${id}`, productData);
    return response.data;
  },

  async deleteProduct(id) {
    const response = await api.delete(`/v1/products/${id}`);
    return response.data;
  },

  async getCategories() {
    const response = await api.get("/v1/products/categories");
    return response.data;
  },
};