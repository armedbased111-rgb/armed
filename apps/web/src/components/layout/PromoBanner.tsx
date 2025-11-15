import { motion } from "framer-motion";

export default function PromoBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium"
    >
      <p>
        <span className="font-bold">LAUNCH SALE</span> — 30% OFF with the code "30OFF"
      </p>
    </motion.div>
  );
}

