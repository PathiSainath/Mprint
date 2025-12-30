import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaShoppingBag,
  FaSearch,
  FaBars,
  FaTimes,
  FaHeart,
  FaQuestionCircle,
  FaFolderOpen,
  FaBox,
} from "react-icons/fa";
import vista from "../Assets/vista.png";
import api from "../api/api";
import { useFavorites } from "../context/FavoritesContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { favoritesCount } = useFavorites();
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const menuItems = [
    { label: "View All", path: "/" },
    { label: "Bookmarks", path: "/bookmarks" },
    { label: "Brochures", path: "/brochures" },
    { label: "Cards", path: "/cards" },
    { label: "Certificates", path: "/certificates" },
    { label: "Greeting Cards", path: "/greetingcards" },
    { label: "Personalised Cards", path: "/personalised" },
    { label: "Photo Frames", path: "/frames" },
    { label: "Photo Prints", path: "/Prints" },
    { label: "Posters", path: "/posters" },
  
  ];

  useEffect(() => {
    const fetchUserAndCart = async () => {
      try {
        await api.get("/sanctum/csrf-cookie");
        try {
          const userRes = await api.get("/api/user");
          const userData = userRes.data?.user ?? userRes.data?.data ?? null;
          setUser(userData);
        } catch {
          setUser(null);
        }
        try {
          const cartRes = await api.get("/api/cart/count");
          setCartCount(cartRes.data?.count || 0);
        } catch {
          setCartCount(0);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUserAndCart();
  }, []);

  const handleLogout = async () => {
    try {
      await api.get("/sanctum/csrf-cookie");
      await api.post("/api/logout");
      localStorage.removeItem("auth_token");
      setUser(null);
      window.location.href = "/login";
    } catch {
      alert("Logout failed. Try again.");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch(e);
    }
  };

  return (
    <div className="w-full bg-white border-b shadow-sm">
      {/* ===== TOP NAVBAR ===== */}
      <div className="flex items-center justify-between px-4 lg:px-12 py-4 flex-wrap gap-4">

        {/* Logo */}
        <Link to="/">
          <img
            src={vista}
            alt="logo"
            className="h-16 md:h-20 lg:h-24 object-contain"
          />
        </Link>

        {/* Search Bar */}
        <div className="flex items-center border rounded-full px-4 py-2 w-full md:w-[45%] max-w-xl">
          <input
            type="text"
            placeholder="Search for products (cards, certificates, posters...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <button
            onClick={handleSearch}
            className="text-gray-500 hover:text-gray-700 transition"
            aria-label="Search"
          >
            <FaSearch className="ml-2" />
          </button>
        </div>

        {/* Right Icons */}
        <div className="hidden md:flex items-center gap-8 text-gray-800 text-sm">
          <a
            href="tel:02522669393"
            className="flex items-center gap-2 hover:text-blue-700"
          >
            <FaQuestionCircle className="text-lg" />
            <div className="flex flex-col leading-tight">
              <span className="font-medium">Help is here</span>
              <span className="text-xs text-gray-500">02522-669393</span>
            </div>
          </a>

          <Link
            to="/projects"
            className="flex items-center gap-2 hover:text-blue-700"
          >
            <FaFolderOpen className="text-lg" />
            <span className="font-medium">My Projects</span>
          </Link>

          <Link
            to="/favorites"
            className="flex items-center gap-2 hover:text-red-600 relative"
          >
            <FaHeart className="text-lg text-red-500" />
            <span className="font-medium">
              My Wishlist {user && favoritesCount > 0 && `(${favoritesCount})`}
            </span>
          </Link>

          {!user ? (
            <Link
              to="/login"
              className="flex items-center gap-2 hover:text-blue-700"
            >
              <FaUser className="text-lg" />
              <span className="font-medium">Sign in</span>
            </Link>
          ) : (
            <div className="relative group">
              <div className="flex items-center gap-2 cursor-pointer hover:text-blue-700">
                <FaUser className="text-lg" />
                <span className="font-medium">
                  {user.name || "User"}
                </span>
              </div>

              <div className="absolute right-0 bg-white shadow-md rounded-lg mt-2 w-48 opacity-0 group-hover:opacity-100 transition z-10">
                <Link
                  to="/account"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  My Account
                </Link>
                <Link
                  to="/purchase-history"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
                >
                  <FaBox className="text-sm" />
                  <span>Purchase History</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <Link
            to="/cart"
            className="flex items-center gap-2 hover:text-blue-700"
          >
            <FaShoppingBag className="text-lg" />
            <span className="font-medium">
              Cart {cartCount > 0 && `(${cartCount})`}
            </span>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-xl text-gray-700"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* ===== MOBILE DRAWER MENU ===== */}
      {menuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 z-50">
          <div className="absolute top-0 left-0 w-72 h-full bg-white shadow-lg p-5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-700 font-semibold">Menu</h3>
              <FaTimes
                onClick={() => setMenuOpen(false)}
                className="cursor-pointer text-gray-600 text-lg"
              />
            </div>

            <a
              href="tel:02522669393"
              className="flex items-center gap-2 mb-3 hover:text-blue-700"
            >
              <FaQuestionCircle className="text-lg" />
              <span>Help is here 02522-669393</span>
            </a>

            <Link
              to="/projects"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 mb-3 hover:text-blue-700"
            >
              <FaFolderOpen className="text-lg" />
              <span>My Projects</span>
            </Link>

            <Link
              to="/favorites"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 mb-3 hover:text-red-600"
            >
              <FaHeart className="text-lg text-red-500" />
              <span>My Favorites {user && favoritesCount > 0 && `(${favoritesCount})`}</span>
            </Link>

            {!user ? (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 mb-3 hover:text-blue-700"
              >
                <FaUser className="text-lg" />
                <span>Sign in</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 mb-3 hover:text-blue-700"
                >
                  <FaUser className="text-lg" />
                  <span>My Account</span>
                </Link>
                <Link
                  to="/purchase-history"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 mb-3 hover:text-blue-700"
                >
                  <FaBox className="text-lg" />
                  <span>Purchase History</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 mb-3 text-red-500"
                >
                  <FaUser className="text-lg" />
                  <span>Logout</span>
                </button>
              </>
            )}

            <hr className="my-4" />

            <div className="flex flex-col gap-3 text-gray-800 font-medium text-sm">
              {menuItems.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`hover:text-red-600 ${item.label === "Custom Winter Wear"
                      ? "text-red-600 font-semibold"
                      : ""
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===== DESKTOP CATEGORY ROW ===== */}
      <div className="hidden md:block w-full border-t">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center px-8 py-3 text-gray-800 text-sm font-medium">
          {menuItems.map((item, i) => (
            <Link
              key={i}
              to={item.path}
              className={`hover:text-red-600 transition px-2 ${item.label === "Custom Winter Wear"
                  ? "text-red-600 font-semibold"
                  : ""
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
