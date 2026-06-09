import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
  return (
    <Link to={`/products/${product._id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.name}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-xl font-bold text-indigo-600">${product.price}</span>
            <span className="text-sm text-gray-500">{product.category}</span>
          </div>
          <div className="mt-2 text-sm text-gray-500">Stock: {product.stock}</div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;