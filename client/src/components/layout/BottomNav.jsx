import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, isAdmin, logout, user } = useAuth();

  // Hide nav on login/signup pages
  if (location.pathname === "/login" || location.pathname === "/signup") {
    return null;
  }

  const navItems = [
    { path: "/", label: "Home", icon: "🏠", public: true },
    { path: "/map", label: "Map", icon: "🗺️", public: true },
    { path: "/report", label: "Report", icon: "📝", public: false },
    { path: "/profile", label: "Profile", icon: "👤", public: false },
    { path: "/admin", label: "Admin", icon: "⚙️", admin: true },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="flex justify-around items-center py-3 max-w-screen-lg mx-auto px-2">
        {navItems.map((item) => {
          // Show public items always
          if (item.public) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${
                  isActive(item.path)
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          }

          // Show protected items only if logged in
          if (!item.admin && isLoggedIn) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${
                  isActive(item.path)
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          }

          // Show admin items only for admins
          if (item.admin && isAdmin) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${
                  isActive(item.path)
                    ? "text-blue-600 font-semibold"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          }

          return null;
        })}

        {/* Login Link */}
        {!isLoggedIn && (
          <Link
            to="/login"
            className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition duration-200 ${
              isActive("/login")
                ? "text-blue-600 font-semibold"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span className="text-xl">🔑</span>
            <span className="text-xs font-medium">Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
}
