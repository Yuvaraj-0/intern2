import { useState } from "react";
import { FiSearch, FiX } from "react-icons/fi";

const ProductSearch = ({ onSearch }) => {
  const [search, setSearch] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ search });
  };

  const handleClear = () => {
    setSearch("");
    onSearch({ search: "" });
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-3 w-full">
      <div className="relative flex-1 flex items-center bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:border-indigo-500 transition-all duration-200">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <FiSearch className="w-5 h-5" />
        </div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products, brands, categories..."
          className="w-full pl-11 pr-10 py-2.5 bg-transparent border-0 focus:outline-none text-sm text-slate-800 placeholder-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            aria-label="Clear search"
          >
            <FiX className="w-4 h-4" />
          </button>
        )}
      </div>
      <button
        type="submit"
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer"
      >
        Search
      </button>
    </form>
  );
};

export default ProductSearch;