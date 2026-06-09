import { useState } from "react";
import ProductList from "../components/Products/ProductList";
import ProductSearch from "../components/Products/ProductSearch";
import ProductFilters from "../components/Products/ProductFilters";

const ProductsPage = () => {
  const [filters, setFilters] = useState({});

  const handleSearch = (searchFilters) => {
    setFilters({ ...filters, ...searchFilters, page: 1 });
  };

  const handleCategoryFilter = (category) => {
    if (category) {
      setFilters({ ...filters, category, page: 1 });
    } else {
      const { category: _, ...rest } = filters;
      setFilters(rest);
    }
  };

  const handlePriceFilter = (minPrice, maxPrice) => {
    setFilters({ ...filters, minPrice, maxPrice, page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Our Products</h1>
      
      <div className="mb-8">
        <ProductSearch onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <ProductFilters 
            onCategoryChange={handleCategoryFilter} 
            onPriceChange={handlePriceFilter} 
          />
        </div>
        <div className="lg:col-span-3">
          <ProductList filters={filters} />
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;