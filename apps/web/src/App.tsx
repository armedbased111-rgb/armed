// apps/web/src/App.tsx
import { Routes, Route } from "react-router-dom";
import PromoBanner from "./components/layout/PromoBanner";
import Navbar from "./components/layout/Navbar";
import AppContainer from "./components/layout/AppContainer";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import Product from "./pages/Product";
import Tracks from "./pages/Tracks";
import TrackDetail from "./pages/TrackDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Account from "./pages/Account";
import Legal from "./pages/Legal";
import CheckoutConfirmation from "./pages/CheckoutConfirmation";

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <PromoBanner />
      <Navbar />
      <AppContainer>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<Product />} />
          <Route path="/tracks" element={<Tracks />} />
          <Route path="/track/:slug" element={<TrackDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/confirmation" element={<CheckoutConfirmation />} />
          <Route path="/account" element={<Account />} />
          <Route path="/legal" element={<Legal />} />
          <Route path="*" element={<div className="p-4 text-muted-foreground">404 — page introuvable.</div>} />
        </Routes>
      </AppContainer>
      <Footer />
    </div>
  );
}
