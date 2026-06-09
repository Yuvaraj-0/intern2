import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { productService } from "../../services/productService";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    lowStock: 0,
    categories: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await productService.getProducts({ limit: 1000 });
      const products = response.data;
      const lowStockCount = products.filter(p => p.stock < 10).length;
      const categoriesCount = [...new Set(products.map(p => p.category))].length;
      
      setStats({
        totalProducts: response.pagination?.total || products.length,
        lowStock: lowStockCount,
        categories: categoriesCount,
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStock}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Categories</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.categories}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Welcome, {user?.name}!</h2>
        <p className="text-gray-600">
          This is your admin dashboard. Use the sidebar to manage products, view orders, and control user access.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;