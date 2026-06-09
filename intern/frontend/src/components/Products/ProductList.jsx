import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { productService } from "../../services/productService";

const ProductList = ({ filters }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const response = await productService.getProducts(filters || {});
      console.log("Products response:", response);
      
      // Handle both possible response structures
      const productsData = response.data || response.products || [];
      setProducts(productsData);
      setPagination(response.pagination || {});
    } catch (error) {
      console.error("Failed to load products:", error);
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">No products found</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          <button className="px-3 py-1 border rounded-md hover:bg-gray-50">Previous</button>
          <span className="px-3 py-1">Page {pagination.page} of {pagination.pages}</span>
          <button className="px-3 py-1 border rounded-md hover:bg-gray-50">Next</button>
        </div>
      )}
    </div>
  );
};

export default ProductList;