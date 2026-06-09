import { useState } from "react";
import { productService } from "../../services/productService";
import { toast } from "react-hot-toast";

const ProductTable = ({ products, onRefresh }) => {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setDeleting(id);
      try {
        await productService.deleteProduct(id);
        toast.success("Product deleted successfully");
        onRefresh();
      } catch (error) {
        toast.error("Failed to delete product");
      } finally {
        setDeleting(null);
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product._id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <a href={`/admin/products/edit/${product._id}`} className="text-indigo-600 hover:text-indigo-900">
                  Edit
                </a>
                <button
                  onClick={() => handleDelete(product._id)}
                  disabled={deleting === product._id}
                  className="text-red-600 hover:text-red-900 disabled:opacity-50"
                >
                  {deleting === product._id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;