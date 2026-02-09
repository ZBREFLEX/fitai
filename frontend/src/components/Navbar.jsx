import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const modules = [
  { label: "Body Analysis", path: "/body-composition" },
  { label: "Calorie AI", path: "/calorie-estimation" },
  { label: "Nutrition", path: "/nutrition" },
  { label: "Fitness Guide", path: "/fitness-guidance" },
  { label: "Progress", path: "/progress-tracking" },
  { label: "Gamification", path: "/gamification" },
];

const API_URL = "http://localhost:8000/api";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  // Function to check for user data
  const checkUserData = () => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // Check for user on mount
    checkUserData();

    // Check for user data every 500ms to catch login changes
    const interval = setInterval(checkUserData, 500);

    // Listen for storage changes (in case of multi-tab)
    const handleStorageChange = () => {
      checkUserData();
    };
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom login event
    const handleLoginEvent = () => {
      checkUserData();
    };
    window.addEventListener('userLoggedIn', handleLoginEvent);

    // Listen for custom logout event
    const handleLogoutEvent = () => {
      checkUserData();
    };
    window.addEventListener('userLoggedOut', handleLogoutEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userLoggedIn', handleLoginEvent);
      window.removeEventListener('userLoggedOut', handleLogoutEvent);
    };
  }, []);

  const handleLogout = async () => {
    try {
      // Get refresh token
      const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
      
      // Call backend logout with JWT token
      if (refreshToken) {
        await fetch(`${API_URL}/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem('access_token') || sessionStorage.getItem('access_token')}`
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all tokens and user data
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
      sessionStorage.removeItem('user');
      setUser(null);
      setShowUserMenu(false);
      
      // Dispatch logout event
      window.dispatchEvent(new Event('userLoggedOut'));
      
      navigate("/");
    }
  };

  const getUserInitial = () => {
    if (user && user.first_name) {
      return user.first_name.charAt(0).toUpperCase();
    }
    if (user && user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <nav className="sticky top-0 z-50 bg-dark border-b border-secondary shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="text-2xl font-bold gradient-text">⚡</div>
            <span className="text-xl font-bold text-neutral hidden md:block">
              FitAI Pro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 text-neutral hover:text-accent transition-colors rounded-lg hover:bg-secondary"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="px-3 py-2 text-neutral hover:text-accent transition-colors rounded-lg hover:bg-secondary"
            >
              About
            </Link>

            {/* Modules Dropdown */}
            <div className="relative group px-3 py-2">
              <button className="text-neutral hover:text-accent transition-colors rounded-lg hover:bg-secondary">
                Modules
              </button>
              <div className="absolute left-0 mt-0 w-48 bg-secondary rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-2">
                {modules.map((m) => (
                  <Link
                    key={m.path}
                    to={m.path}
                    className="block px-4 py-2 text-neutral hover:text-accent hover:bg-primary transition-colors text-sm"
                  >
                    {m.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              // User is logged in - show user menu
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-3 py-2 text-neutral hover:text-accent transition-colors rounded-lg hover:bg-secondary"
                >
                  <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-sm">
                    {getUserInitial()}
                  </div>
                  <span className="hidden lg:block">{user.first_name || user.email}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${showUserMenu ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-secondary rounded-lg shadow-xl py-2 z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-neutral hover:text-accent hover:bg-primary transition-colors text-sm"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-neutral hover:text-accent hover:bg-primary transition-colors text-sm"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              // User is not logged in - show sign in/sign up buttons
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 text-neutral hover:text-accent transition-colors rounded-lg border border-accent hover:bg-secondary"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-accent text-primary font-semibold rounded-lg hover:bg-opacity-90 transition-all shadow-lg"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-accent"
            onClick={() => setIsOpen(!isOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-2">
            <Link
              to="/"
              className="block px-3 py-2 text-neutral hover:text-accent hover:bg-secondary rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-3 py-2 text-neutral hover:text-accent hover:bg-secondary rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              About
            </Link>
            {modules.map((m) => (
              <Link
                key={m.path}
                to={m.path}
                className="block px-3 py-2 text-neutral hover:text-accent hover:bg-secondary rounded-lg text-sm"
                onClick={() => setIsOpen(false)}
              >
                {m.label}
              </Link>
            ))}
            
            {user ? (
              // Mobile: User is logged in
              <>
                <div className="px-3 py-2 text-neutral border-t border-secondary mt-2 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-accent text-primary flex items-center justify-center font-bold text-sm">
                      {getUserInitial()}
                    </div>
                    <span>{user.first_name || user.email}</span>
                  </div>
                </div>
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-neutral hover:text-accent hover:bg-secondary rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-neutral hover:text-accent hover:bg-secondary rounded-lg"
                >
                  Logout
                </button>
              </>
            ) : (
              // Mobile: User is not logged in
              <>
                <Link
                  to="/signin"
                  className="block px-3 py-2 text-neutral hover:text-accent hover:bg-secondary rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 bg-accent text-primary font-semibold rounded-lg"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
