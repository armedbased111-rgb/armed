import React from "react";
import { Link, NavLink } from "react-router-dom";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[color:var(--bg)/0.8] backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-base font-semibold">
          ARM STACKER
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/catalog" className={({ isActive }) => isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}>
            Cart
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? "text-[var(--brand)]" : "text-[var(--text-muted)]"}>
            Account
          </NavLink>
          <Button variant="secondary" size="sm" onClick={() => alert("Theme toggle TODO")}>
            Theme
          </Button>
        </nav>
      </div>
    </header>
  );
}
