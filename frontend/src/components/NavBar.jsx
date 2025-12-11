import { useState, useRef, useEffect } from "react";
import logo from "../assets/Pastra.svg"; // Adjust the path as necessary
import { useUserStore } from "../stores/useUserStore";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Honeycell from "../assets/honey-cell.svg?react";

const ProfileSection = ({ user }) => {
  const { logout, deleteAccount } = useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMenuItemClick = (action) => {
    setIsDropdownOpen(false); // Close dropdown

    // Handle different actions
    switch (action) {
      case "product":
        // Navigate to product page or handle action
        navigate("/SellerPage");
        break;
      case "admin":
        // Navigate to product page or handle action
        navigate("/admin");
        break;
      case "logout":
        // Handle logout
        logout();
        break;
      case "delete":
        // Handle account deletion
        deleteAccount();
        break;
      default:
        break;
    }
  };

  if (user) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={toggleDropdown}
          className={`group btn-anim focus:scale-120 flex items-center gap-2 justify-center w-fit h-fit relative transition-all duration-300
            
            ${isDropdownOpen ? "rotate-360" : ""}
            `}
        >
          {user && (
            <Honeycell className="drop-shadow-sm group-hover:text-yellow-200 text-amber-100 h-10 w-10" />
          )}
          <span className="absolute font-bold text-yellow-700">
            {user.role === "seller"
              ? user.colonyName?.charAt(0).toUpperCase() || "0"
              : user.email?.charAt(0).toUpperCase() || "0"}
          </span>
          {/* Optional dropdown arrow */}
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="overflow-hidden absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-50">
            <div className="py-2">
              {user.role === "admin" && (
                <button
                  onClick={() => handleMenuItemClick("admin")}
                  className="btn-anim w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors duration-150 font-medium"
                >
                  Go to Admin Page
                </button>
              )}
              {user.role === "seller" || user.role==="admin" &&  (
                <button
                  onClick={() => handleMenuItemClick("product")}
                  className="btn-anim w-full text-left px-4 py-3 text-gray-700 hover:bg-yellow-50 hover:text-yellow-800 transition-colors duration-150 font-medium"
                >
                  Go to Product Page
                </button>
              )}
              <hr className="my-1 border-gray-200" />
              <button
                onClick={() => handleMenuItemClick("logout")}
                className="btn-anim w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 transition-colors duration-150 font-medium"
              >
                Log Out
              </button>
              {user.role !== "admin" &&
                <>
                  <hr className="my-1 border-gray-200" />
                  <button
                    onClick={() => handleMenuItemClick("delete")}
                    className="btn-anim w-full text-left px-4 py-3 text-red-800 hover:bg-red-100 transition-colors duration-150 font-medium"
                    >
                    Delete Account
                  </button>
                </>
              }
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => navigate("/authenticate")}
      className="px-5 btn-anim py-1 rounded-full h-10 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-semibold transition-colors duration-200 whitespace-nowrap"
    >
      Sign In
    </button>
  );
};

const NavBar = ({ user }) => {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  // test

  return (
    <div className="bg-yellow-300 relative z-40 shadow-lg w-full">

      <div className="flex items-center justify-between w-full px-4 sm:px-6 lg:px-8 py-2">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <img
            src={logo}
            alt="PastraBeez Logo"
            className="h-11 w-15 object-contain"
          />
        </div>

        {/* Logo Text - Centered */}
        <h2 className="flex-1 select-none bee-logo-desktop lg:inline hidden text-center">
          PastraBeez
        </h2>

        {/* Profile/Sell Button */}
        <ProfileSection user={user} />
      </div>

      {/* Navigation Links */}
      <div
        className="select-none bg-white flex items-center justify-center gap-8 lg:gap-32 w-fu
  ll px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100"
      >
        <button
          className={`
            ${
              path === "/"
                ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
                : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"
            }
          `}
          onClick={() => navigate("/")}
        >
          Home
        </button>
        <button
          className={
            path === "/catalog"
              ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"
          }
          onClick={() => navigate("/catalog")}
        >
          Hive
        </button>
        <button
          className={
            path === "/about-us"
              ? "text-yellow-700 font-semibold border-b-2 border-yellow-400"
              : "text-gray-600 hover:text-yellow-700 btn-anim font-medium transition-colors duration-200 cursor-pointer"
          }
          onClick={() => navigate("/about-us")}
        >
          About Us
        </button>
      </div>
    </div>
  );
};

export default NavBar;
