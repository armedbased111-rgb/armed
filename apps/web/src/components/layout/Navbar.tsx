import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../store/cart";
import { motion } from "framer-motion";

export default function Navbar() {
  const totalQty = useCart((s) => s.totalQty());

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="w-full px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-lg font-bold tracking-tight hover:opacity-80 transition-opacity">
          .armed
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center gap-8">
          <NavLink 
            to="/" 
            className={({ isActive }) => 
              isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors text-sm"
            }
          >
            home
          </NavLink>
          <NavLink 
            to="/catalog" 
            className={({ isActive }) => 
              isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors text-sm"
            }
          >
            soundkits
          </NavLink>
          <NavLink 
            to="/tracks" 
            className={({ isActive }) => 
              isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors text-sm"
            }
          >
            beats
          </NavLink>
          <NavLink 
            to="/account" 
            className={({ isActive }) => 
              isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors text-sm"
            }
          >
            account
          </NavLink>
          <NavLink 
            to="/legal" 
            className={({ isActive }) => 
              isActive ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground transition-colors text-sm"
            }
          >
            legal
          </NavLink>
        </nav>

        {/* Actions droite */}
        <div className="flex items-center gap-4">
          {/* Devise */}
          <button className="hidden md:block text-sm text-muted-foreground hover:text-foreground transition-colors">
            EUR
          </button>

          {/* Search */}
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>

          {/* Account */}
          <Link 
            to="/account"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </Link>

          {/* Panier */}
          <Link 
            to="/cart" 
            className="relative text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {totalQty > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium"
              >
                {totalQty}
              </motion.span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
