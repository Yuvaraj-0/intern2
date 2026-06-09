import { useState } from "react";
import ProductList from "../components/Products/ProductList";
import ProductSearch from "../components/Products/ProductSearch";
import ProductFilters from "../components/Products/ProductFilters";
import { FiSliders, FiX } from "react-icons/fi";

const ProductsPage = () => {
  const [filters, setFilters] = useState({});
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const handleSearch = (searchFilters) => {
    setFilters({ ...filters, ...searchFilters, page: 1 });
  };

  const handleCategoryFilter = (category) => {
    if (category !== undefined) {
      if (category === "") {
        const { category: _, ...rest } = filters;
        setFilters({ ...rest, page: 1 });
      } else {
        setFilters({ ...filters, category, page: 1 });
      }
    }
  };

  const handlePriceFilter = (minPrice, maxPrice) => {
    setFilters({ ...filters, minPrice, maxPrice, page: 1 });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Explore Products</h1>
          <p className="text-sm text-slate-500 mt-1">Find the best items tailored for your everyday needs</p>
        </div>
        
        {/* Mobile Filters Toggle Button */}
        <button
          onClick={() => setMobileFiltersOpen(true)}
          className="lg:hidden flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-semibold rounded-xl border border-indigo-100 transition-colors cursor-pointer"
        >
          <FiSliders className="w-4 h-4" />
          <span>Filters</span>
        </button>
      </div>
      
      {/* Search Bar */}
      <div className="mb-8 max-w-2xl">
        <ProductSearch onSearch={handleSearch} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Sidebar Filters */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20">
            <ProductFilters 
              onCategoryChange={handleCategoryFilter} 
              onPriceChange={handlePriceFilter} 
            />
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          <ProductList filters={filters} />
        </div>
      </div>

      {/* Mobile Slide-over Filters Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileFiltersOpen(false)}
          ></div>

          {/* Drawer content */}
          <aside className="fixed inset-y-0 right-0 w-80 max-w-full bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiSliders className="w-5 h-5 text-indigo-600" />
                <span className="font-bold text-slate-800">Filters</span>
              </div>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-2 -mr-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                aria-label="Close filters"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <ProductFilters 
                onCategoryChange={(cat) => {
                  handleCategoryFilter(cat);
                  // Optionally auto-close drawer on category change if desired
                }} 
                onPriceChange={(min, max) => {
                  handlePriceFilter(min, max);
                }}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;