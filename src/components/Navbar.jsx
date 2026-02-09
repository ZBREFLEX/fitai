import { useState } from "react";
import { Link } from "react-router-dom";

const modules = [
  { label: "Body Analysis", path: "/body-composition" },
  { label: "Calorie AI", path: "/calorie-estimation" },
  { label: "Nutrition", path: "/nutrition" },
  { label: "Fitness Guide", path: "/fitness-guidance" },
  { label: "Progress", path: "/progress-tracking" },
  { label: "Gamification", path: "/gamification" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
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
          </div>
        )}
      </div>
    </nav>
  );
}
