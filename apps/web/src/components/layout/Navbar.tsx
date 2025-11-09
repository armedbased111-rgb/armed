// apps/web/src/components/layout/Navbar.tsx
import React from "react";
import { Link, NavLink } from "react-router-dom";
import { useCart } from "../../store/cart";

export default function Navbar() {
  // Selector Zustand: ne re-render que si totalQty change
  const totalQty = useCart((s) => s.totalQty());

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-700 bg-neutral-900/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-base font-semibold">
          ARM STACKER
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/catalog" className={({ isActive }) => (isActive ? "text-violet-400" : "text-neutral-400")}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => (isActive ? "text-violet-400" : "text-neutral-400")}>
            Cart
          </NavLink>

          <Link to="/cart" className="relative inline-flex items-center text-neutral-300">
            <span className="mr-2">Panier</span>
            <span className="min-w-6 h-6 px-2 rounded-full bg-violet-600 text-white text-xs flex items-center justify-center">
              {totalQty}
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
