import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../../store/cart";
import Button from "../ui/Button";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  slug: string;
  title: string;
  priceCents: number;
  originalPriceCents?: number;
  coverUrl?: string;
  onSale?: boolean;
  reviewCount?: number;
  rating?: number;
}

export default function ProductCard({
  id,
  slug,
  title,
  priceCents,
  originalPriceCents,
  coverUrl,
  onSale = false,
  reviewCount = 0,
  rating = 5,
}: ProductCardProps) {
  const addItem = useCart((s) => s.addItem);
  const [isAdded, setIsAdded] = useState(false);

  const formatPrice = (cents: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(cents / 100);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: id,
      slug,
      title,
      priceCents,
      currency: "EUR",
      licenseType: "STANDARD",
      qty: 1,
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link to={`/product/${slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square bg-secondary rounded-lg overflow-hidden mb-4">
          {/* Badge Sale */}
          {onSale && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="absolute top-3 left-3 z-10"
            >
              <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-lg">
                Sale
              </span>
            </motion.div>
          )}
          
          {/* Image */}
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}

          {/* Hover Overlay avec bouton Add */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileHover={{ scale: 1, opacity: 1 }}
              className="opacity-0 group-hover:opacity-100 transition-all duration-300"
            >
              <Button
                onClick={handleAddToCart}
                size="sm"
                className="shadow-2xl font-semibold"
              >
                {isAdded ? "✓ Added" : "Add"}
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Info produit */}
        <div className="space-y-2">
          {/* Titre */}
          <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-2">
            {title}
          </h3>

          {/* Prix */}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-foreground">
              {formatPrice(priceCents)}
            </span>
            {originalPriceCents && onSale && (
              <span className="text-sm line-through text-muted-foreground">
                {formatPrice(originalPriceCents)}
              </span>
            )}
          </div>

          {/* Reviews */}
          {reviewCount > 0 && (
            <div className="flex items-center gap-1.5">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 fill-gray-300"
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">({reviewCount})</span>
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
