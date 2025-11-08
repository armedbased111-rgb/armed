// apps/web/src/components/layout/Navbar.tsx
import { Link, NavLink } from "react-router-dom";
import Button from "../ui/Button";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-700 bg-neutral-900/80 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-base font-semibold">
          ARM STACKER
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/catalog" className={({ isActive }) => isActive ? "text-violet-400" : "text-neutral-400"}>
            Catalog
          </NavLink>
          <NavLink to="/cart" className={({ isActive }) => isActive ? "text-violet-400" : "text-neutral-400"}>
            Cart
          </NavLink>
          <NavLink to="/account" className={({ isActive }) => isActive ? "text-violet-400" : "text-neutral-400"}>
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
