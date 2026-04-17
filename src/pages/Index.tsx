"use client";

import { Suspense, lazy, useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import PushNotificationManager from "@/components/PushNotificationManager";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiData } from "@/hooks/useApiData";

const ProductCard = lazy(() => import("@/components/ProductCard"));

const Index = () => {
  const { products, settings, loading } = useApiData();
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-play pour le carousel
  useEffect(() => {
    if (settings.banners.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % settings.banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [settings.banners.length]);

  return (
    <div className="min-h-screen bg-background pb-0">
      <Navbar />
      <PushNotificationManager />
      
      {/* Bandeau défilant (Marquee) */}
      <div className="pt-24">
        <div className="bg-primary text-primary-foreground py-2.5 overflow-hidden whitespace-nowrap relative z-40 shadow-sm">
          <motion.div 
            animate={{ x: [0, -1000] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="inline-block font-black text-[10px] uppercase tracking-[0.25em]"
          >
            LIVRAISON GRATUITE À CONAKRY • PAIEMENT À LA LIVRAISON • QUALITÉ PREMIUM GARANTIE • NOUVELLE COLLECTION DISPONIBLE • 
            LIVRAISON GRATUITE À CONAKRY • PAIEMENT À LA LIVRAISON • QUALITÉ PREMIUM GARANTIE • NOUVELLE COLLECTION DISPONIBLE • 
          </motion.div>
        </div>
      </div>

      <section className="relative pt-8 pb-8 overflow-hidden">
        <div className="container mx-auto px-4">
          {/* Carousel Principal */}
          <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-100 mb-12 group">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentBanner}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={settings.banners[currentBanner]?.image} 
                  alt="" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-8 md:p-16">
                  <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h2 className="text-3xl md:text-6xl font-black text-white mb-3 leading-tight">
                      {settings.banners[currentBanner]?.title}
                    </h2>
                    <p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl font-medium">
                      {settings.banners[currentBanner]?.subtitle}
                    </p>
                    <Link to={settings.banners[currentBanner]?.link || "/products"}>
                      <Button size="lg" className="rounded-full px-10 font-bold h-16 text-lg shadow-2xl shadow-primary/40">
                        Découvrir <ArrowRight className="ml-2 h-6 w-6" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Contrôles du Carousel */}
            {settings.banners.length > 1 && (
              <>
                <div className="absolute bottom-8 right-8 flex gap-3 z-10">
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full bg-white/10 backdrop-blur-xl border-none text-white hover:bg-white/30 h-12 w-12"
                    onClick={() => setCurrentBanner((prev) => (prev - 1 + settings.banners.length) % settings.banners.length)}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="rounded-full bg-white/10 backdrop-blur-xl border-none text-white hover:bg-white/30 h-12 w-12"
                    onClick={() => setCurrentBanner((prev) => (prev + 1) % settings.banners.length)}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>

                {/* Indicateurs (Dots) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {settings.banners.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-1.5 rounded-full transition-all ${currentBanner === idx ? "w-8 bg-white" : "w-2 bg-white/40"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
              <Sparkles className="h-3 w-3" />
              <span>Le meilleur de Conakry</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.1] mb-6">
              {settings.heroTitle}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 px-4 max-w-2xl mx-auto">
              {settings.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-4">
        <div className="flex items-end justify-between mb-10">
          <div>
            <h2 className="text-3xl font-black mb-2">Populaires</h2>
            <p className="text-muted-foreground text-sm">Les articles les plus demandés en ce moment.</p>
          </div>
          <Link to="/products">
            <Button variant="link" className="font-bold text-primary p-0 h-auto">Tout voir <ArrowRight className="ml-1 h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          <Suspense fallback={<Skeleton className="h-64 w-full rounded-[2rem]" />}>
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Suspense>
        </div>
      </section>

      <CTA />
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Index;