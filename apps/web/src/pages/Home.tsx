import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Button from "../components/ui/Button";
import ProductCard from "../components/catalog/ProductCard";
import TrackCard from "../components/tracks/TrackCard";
import { useProducts } from "../hooks/useProducts";
import { useTracks } from "../hooks/useTracks";

export default function Home() {
  const { data: products } = useProducts({ page: 1, pageSize: 12 });
  const { data: tracks } = useTracks({ page: 1, pageSize: 4 });

  return (
    <div className="w-full">
      {/* Tagline minimaliste */}
      <section className="py-12 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground font-light tracking-wide"
        >
          unique sounds for unique beats.
        </motion.p>
      </section>

      {/* Hero Product - Produit vedette */}
      <section className="pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-5xl mx-auto"
        >
          {/* Titre principal */}
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              FOUNDATION OUT NOW
            </h1>
          </div>

          {/* Image/Vidéo produit principale */}
          <Link to="/catalog" className="block group">
            <div className="relative aspect-[16/9] bg-secondary rounded-xl overflow-hidden mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="text-6xl font-bold text-foreground/20">.armed</div>
                  <p className="text-muted-foreground">Featured Product Visual</p>
                </div>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
            </div>

            {/* Prix et CTA */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold">€24,99</span>
                <span className="text-lg text-muted-foreground line-through">€39,99</span>
              </div>
              <Button size="lg" className="px-8">
                Add to Cart
              </Button>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Section Featured */}
      <section className="py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold tracking-tight">Featured</h2>
        </div>

        {products && products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {products.slice(0, 4).map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    title={product.title}
                    priceCents={product.priceCents}
                    originalPriceCents={product.priceCents + 1000}
                    coverUrl={product.coverUrl ?? undefined}
                    onSale={true}
                    reviewCount={Math.floor(Math.random() * 20) + 1}
                    rating={5}
                  />
                </motion.div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/catalog">
                <Button variant="outline" size="lg" className="px-12">
                  SHOP ALL
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* Spacer visuel */}
      <div className="h-12" />

      {/* Section produit mis en avant (style Halo de Drayki) */}
      {products && products.length > 4 && (
        <section className="py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Link to={`/product/${products[4].slug}`} className="block group">
              <div className="max-w-4xl mx-auto text-center space-y-6">
                <h2 className="text-5xl md:text-6xl font-bold">.armed = HALO</h2>
                
                <div className="aspect-video bg-secondary rounded-xl overflow-hidden">
                  {products[4].coverUrl ? (
                    <img 
                      src={products[4].coverUrl} 
                      alt={products[4].title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      Product Visual
                    </div>
                  )}
                </div>

                <div className="flex items-baseline justify-center gap-3 text-2xl">
                  <span className="font-bold">From €19,99</span>
                </div>
              </div>
            </Link>
          </motion.div>
        </section>
      )}

      {/* Section Beats/Tracks */}
      <section className="py-16">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">Latest Beats</h2>
              <p className="text-muted-foreground">Exclusive productions for your next hit</p>
            </div>
            <Link to="/tracks">
              <Button variant="ghost" size="sm">
                View all →
              </Button>
            </Link>
          </div>
        </div>

        {tracks && tracks.length > 0 ? (
          <div className="space-y-4">
            {tracks.map((track, idx) => {
              // Trouver les prix depuis les licences
              const mp3License = track.licenses?.find((l) => l.type === "MP3");
              const wavLicense = track.licenses?.find((l) => l.type === "WAV");
              const exclusiveLicense = track.licenses?.find((l) => l.type === "EXCLUSIVE");

              return (
                <motion.div
                  key={track.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <TrackCard
                    id={track.id}
                    slug={track.slug}
                    title={track.title}
                    producer=".armed"
                    bpm={track.bpm}
                    key={track.key}
                    genre={track.genre}
                    audioPreviewUrl={track.previewUrl}
                    coverUrl={track.coverUrl}
                    mp3Price={mp3License?.priceCents ?? 3000}
                    wavPrice={wavLicense?.priceCents ?? 5000}
                    exclusivePrice={exclusiveLicense?.priceCents ?? 15000}
                  />
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="border border-border rounded-lg p-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-secondary rounded w-3/4" />
                    <div className="h-3 bg-secondary rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/tracks">
            <Button variant="outline" size="lg" className="px-12">
              Browse All Beats
            </Button>
          </Link>
        </div>
      </section>

      {/* Section Bundles */}
      <section className="py-16 -mx-4 px-4 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8 bg-secondary/30">
        <div className="max-w-screen-2xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Bundles</h2>
          </div>

          {products && products.length > 8 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(8, 12).map((product, idx) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.05 }}
                >
                  <ProductCard
                    id={product.id}
                    slug={product.slug}
                    title={`${product.title} Bundle`}
                    priceCents={Math.round(product.priceCents * 2.5)}
                    originalPriceCents={Math.round(product.priceCents * 4)}
                    coverUrl={product.coverUrl ?? undefined}
                    onSale={true}
                    reviewCount={Math.floor(Math.random() * 15) + 1}
                    rating={5}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="aspect-square bg-secondary rounded-lg animate-pulse" />
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="px-12">
                View all
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
