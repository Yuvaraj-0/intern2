import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag, FiShield } from "react-icons/fi";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm font-semibold transition-all duration-200 ${
      isActive(path)
        ? "text-indigo-600 font-bold"
        : "text-slate-600 hover:text-indigo-600"
    }`;

  const mobileLinkClass = (path) =>
    `block px-4 py-2.5 rounded-xl text-base font-semibold transition-all duration-200 ${
      isActive(path)
        ? "bg-indigo-50 text-indigo-700"
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
    }`;

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-black text-indigo-600 tracking-tight transition-transform active:scale-[0.98]">
              <FiShoppingBag className="w-6 h-6 stroke-[2.5]" />
              <span>ShopSphere</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-6">
              <Link to="/products" className={linkClass("/products")}>
                Products
              </Link>
              {isAdmin() && (
                <Link to="/admin/dashboard" className="flex items-center gap-1.5 text-sm font-semibold text-amber-600 hover:text-amber-700">
                  <FiShield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Link>
              )}
            </div>
          </div>

          {/* Desktop User Info & Actions */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 py-1.5 px-3 bg-slate-50 rounded-full border border-slate-100">
                  <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-slate-700">Hi, {user.name.split(" ")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-2 pt-2 pb-4 space-y-1 shadow-lg transition-all">
          <Link
            to="/products"
            className={mobileLinkClass("/products")}
            onClick={() => setMobileMenuOpen(false)}
          >
            Products
          </Link>
          
          {isAdmin() && (
            <Link
              to="/admin/dashboard"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-base font-semibold text-amber-600 hover:bg-amber-50"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FiShield className="w-5 h-5" />
              <span>Admin Panel</span>
            </Link>
          )}

          <div className="pt-4 pb-2 border-t border-slate-100 px-4">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-800">{user.name}</div>
                    <div className="text-xs text-slate-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all"
                >
                  <FiLogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/login"
                  className="flex items-center justify-center px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-semibold text-white transition-all shadow-md shadow-indigo-600/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;