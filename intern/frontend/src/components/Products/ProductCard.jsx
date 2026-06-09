import { Link } from "react-router-dom";
import { FiShoppingBag, FiLayers } from "react-icons/fi";

const ProductCard = ({ product }) => {
  const isLowStock = product.stock > 0 && product.stock < 10;
  const isOutOfStock = product.stock === 0;

  return (
    <Link to={`/products/${product._id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full">
        {/* Product Image / Placeholder */}
        <div className="relative aspect-video w-full bg-slate-50 overflow-hidden flex items-center justify-center border-b border-slate-100/50">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-50/50 via-indigo-50/20 to-purple-50/50 flex flex-col items-center justify-center gap-2 text-indigo-400 group-hover:scale-105 transition-transform duration-500 ease-out">
              <FiShoppingBag className="w-8 h-8 stroke-[1.5]" />
              <span className="text-[10px] font-bold tracking-wider uppercase opacity-60">No Image Available</span>
            </div>
          )}

          {/* Category Pill Tag Overlay */}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-slate-200/40 text-[10px] font-bold text-slate-700 rounded-full shadow-sm">
            <FiLayers className="w-3 h-3 text-indigo-600" />
            <span>{product.category}</span>
          </span>
        </div>

        {/* Product Info */}
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1.5">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
              {product.description}
            </p>
          </div>

          <div>
            {/* Price & Stock Badge Row */}
            <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-3.5 mt-auto">
              <span className="text-lg font-black text-indigo-600">${product.price}</span>
              
              {isOutOfStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-50 text-red-700 border border-red-100">
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-100">
                  Only {product.stock} left
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700 border border-green-100">
                  In Stock
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;