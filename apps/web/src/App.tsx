// apps/web/src/App.tsx
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import AppContainer from "./components/layout/AppContainer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Legal from "./pages/Legal";

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100">
      <Navbar />
      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/account" element={<Account />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<div className="p-4">404 — page introuvable.</div>} />
        </Routes>
      </AppContainer>
    </div>
  );
}
