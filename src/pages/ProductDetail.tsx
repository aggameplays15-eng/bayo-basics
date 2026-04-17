"use client";

import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, ArrowLeft, Share2, Check, Star } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const { products } = useAdminData();
  const { addToCart } = useCart();
  
  const product = products.find(p => p.id === id);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  if (!product) return null;

  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasColors = product.colors && product.colors.length > 0;

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-8">
          <Link to="/products" className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Button variant="ghost" size="icon" className="rounded-full h-12 w-12 bg-secondary/50">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </motion.div>

          <div className="space-y-8">
            <div>
              <Badge className="mb-4 bg-primary/10 text-primary border-none rounded-full px-4 py-1 font-bold uppercase tracking-widest text-[10px]">
                {product.category}
              </Badge>
              <h1 className="text-4xl font-black mb-2 tracking-tight">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-3xl font-black text-primary">{product.price.toLocaleString()} GNF</p>
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-full">
                  <Star className="h-4 w-4 text-amber-500 fill-current" />
                  <span className="text-sm font-bold text-amber-700">4.9</span>
                </div>
              </div>
            </div>

            <div className="prose prose-slate">
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            </div>

            {/* Tailles - Affichées uniquement si elles existent */}
            {hasSizes && (
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest">Choisir l'option</p>
                <div className="flex flex-wrap gap-3">
                  {product.sizes?.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={cn(
                        "px-6 h-12 rounded-2xl border-2 font-bold transition-all",
                        selectedSize === size ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-border hover:border-primary/50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Couleurs - Affichées uniquement si elles existent */}
            {hasColors && (
              <div className="space-y-4">
                <p className="text-sm font-bold uppercase tracking-widest">Choisir la couleur</p>
                <div className="flex gap-4">
                  {product.colors?.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={cn(
                        "h-12 w-12 rounded-2xl border-4 transition-all flex items-center justify-center shadow-sm",
                        selectedColor === color ? "border-primary scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: color.startsWith('#') ? color : undefined }}
                    >
                      {!color.startsWith('#') && <span className="text-[10px] font-bold">{color}</span>}
                      {selectedColor === color && <Check className="h-5 w-5 text-white mix-blend-difference" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4">
              <Button 
                size="lg" 
                className="w-full h-16 rounded-full text-lg font-bold shadow-xl shadow-primary/20"
                onClick={() => addToCart(product, selectedSize, selectedColor)}
                disabled={product.stock <= 0}
              >
                <ShoppingCart className="mr-2 h-6 w-6" /> 
                {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
              </Button>
              <p className="text-center text-xs text-muted-foreground mt-4 font-medium">
                {product.stock > 0 ? `En stock : ${product.stock} unités disponibles` : "Bientôt de retour en stock"}
              </p>
            </div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default ProductDetail;