import { useState } from "react";
import { FiDollarSign, FiChevronRight, FiGrid, FiTrash2 } from "react-icons/fi";

const ProductFilters = ({ onCategoryChange, onPriceChange, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const categories = ["Electronics", "Clothing", "Books", "Home", "Sports", "Other"];

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  const handlePriceFilter = (e) => {
    e.preventDefault();
    onPriceChange(minPrice || 0, maxPrice || 10000);
    if (onClose) onClose(); // Auto-close drawer on mobile on action
  };

  const handleClearFilters = () => {
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    onCategoryChange("");
    onPriceChange(0, 10000);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-6">
      {/* Category Section */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 flex items-center gap-2">
          <FiGrid className="text-indigo-600" />
          <span>Categories</span>
        </h3>
        
        <div className="space-y-1">
          <button
            onClick={() => handleCategoryChange("")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              selectedCategory === ""
                ? "bg-indigo-50 text-indigo-700"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            <span>All Categories</span>
            {selectedCategory === "" && <FiChevronRight className="w-4 h-4" />}
          </button>
          
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{cat}</span>
              {selectedCategory === cat && <FiChevronRight className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Section */}
      <form onSubmit={handlePriceFilter} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FiDollarSign className="text-indigo-600" />
          <span>Price Range</span>
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Min Price</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-xs">$</span>
              <input
                type="number"
                placeholder="0"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">Max Price</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-slate-400 text-xs">$</span>
              <input
                type="number"
                placeholder="10000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
        >
          Apply Price
        </button>
      </form>

      {/* Clear Action */}
      <button
        onClick={handleClearFilters}
        className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-all cursor-pointer"
      >
        <FiTrash2 className="w-4 h-4" />
        <span>Clear All Filters</span>
      </button>
    </div>
  );
};

export default ProductFilters;