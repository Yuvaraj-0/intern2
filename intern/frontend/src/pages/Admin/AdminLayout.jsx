import { useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { FiMenu, FiX, FiLayout, FiBox, FiShoppingBag, FiUsers, FiArrowLeft } from "react-icons/fi";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
      isActive
        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  const navigation = [
    { name: "Dashboard", path: "/admin/dashboard", icon: FiLayout },
    { name: "Products", path: "/admin/products", icon: FiBox },
    { name: "Orders", path: "/admin/orders", icon: FiShoppingBag },
    { name: "Users", path: "/admin/users", icon: FiUsers },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <header className="md:hidden bg-white border-b border-slate-200 h-16 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus:outline-none transition-colors"
            aria-label="Open sidebar"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <span className="font-bold text-slate-800 text-lg">Admin Panel</span>
        </div>
        <Link
          to="/products"
          className="flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          <span>Shop</span>
        </Link>
      </header>

      {/* Mobile Sidebar Overlay Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          ></div>

          {/* Drawer content */}
          <aside className="fixed inset-y-0 left-0 w-72 bg-white shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out">
            <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
              <span className="font-bold text-slate-800 text-lg">Admin Panel</span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 -mr-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-colors"
                aria-label="Close sidebar"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 px-4 py-6 space-y-1.5">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={navLinkClass}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-slate-100">
              <Link
                to="/products"
                className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium rounded-xl transition-all"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Return to Shop</span>
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white border-r border-slate-200">
        <div className="h-16 px-6 border-b border-slate-200 flex items-center">
          <span className="font-bold text-slate-800 text-lg tracking-wide">Admin Panel</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {navigation.map((item) => (
            <NavLink key={item.name} to={item.path} className={navLinkClass}>
              <item.icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 bg-slate-50/50">
          <Link
            to="/products"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            <FiArrowLeft className="w-4 h-4" />
            <span>Return to Shop</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;