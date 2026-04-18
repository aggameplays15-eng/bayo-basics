"use client";

import { memo, useState, useEffect } from "react";
import { Product } from "../types";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { favoritesAPI } from "../services/api";
import { Button } from "./ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Link } from "react-router-dom";
import { Plus, Star, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ProductCardProps {
  product: Product;
}

const ProductCard = memo(({ product }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if product is favorite on mount
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const checkFavorite = async () => {
      try {
        const response = await favoritesAPI.check(product.id);
        setIsFavorite(response.isFavorite);
      } catch (error) {
        // Silently fail
      }
    };
    
    checkFavorite();
  }, [product.id, isAuthenticated]);

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.error("Connectez-vous pour ajouter aux favoris");
      return;
    }
    
    setIsLoading(true);
    try {
      if (isFavorite) {
        await favoritesAPI.remove(product.id);
        setIsFavorite(false);
        toast.success("Retiré des favoris");
      } else {
        await favoritesAPI.add(product.id);
        setIsFavorite(true);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="h-full"
    >
      <Card className="group overflow-hidden border-none bg-white/70 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 rounded-[2.5rem] flex flex-col h-full relative">
        <div className="aspect-[4/5] overflow-hidden relative bg-slate-100">
          <Link to={`/product/${product.id}`} className="block h-full w-full">
            <img 
              src={product.image} 
              alt={product.name} 
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
            />
          </Link>
          
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            <Badge className="bg-white/90 text-primary backdrop-blur-md border-none px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider shadow-sm">
              {product.category}
            </Badge>
          </div>

          <button 
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`absolute top-4 right-4 h-10 w-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm transition-colors ${
              isFavorite ? "text-rose-500" : "text-slate-400 hover:text-rose-500"
            }`}
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          
          <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
              className="w-full h-12 rounded-2xl shadow-xl shadow-primary/20 font-bold"
            >
              <Plus className="h-5 w-5 mr-2" /> Ajouter
            </Button>
          </div>
        </div>

        <CardHeader className="p-5 pb-2 flex-grow">
          <div className="flex justify-between items-start gap-2 mb-1">
            <Link to={`/product/${product.id}`}>
              <CardTitle className="text-base font-bold line-clamp-1 tracking-tight hover:text-primary transition-colors">
                {product.name}
              </CardTitle>
            </Link>
            <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-full shrink-0">
              <Star className="h-3 w-3 text-amber-500 fill-current" />
              <span className="text-[10px] font-black text-amber-700">4.8</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
        </CardHeader>

        <CardContent className="px-5 py-2">
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-primary">
              {product.price.toLocaleString()}
            </span>
            <span className="text-[10px] font-bold text-primary/60 uppercase">GNF</span>
          </div>
        </CardContent>

        <CardFooter className="p-5 pt-2">
          <Link to={`/product/${product.id}`} className="w-full">
            <Button 
              variant="secondary"
              className="w-full rounded-2xl h-11 font-bold text-xs bg-slate-100 hover:bg-primary hover:text-white transition-all duration-300"
            >
              Voir les détails
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  );
});

ProductCard.displayName = "ProductCard";

export default ProductCard;