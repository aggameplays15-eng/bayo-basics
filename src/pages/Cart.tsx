"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-secondary/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-12 w-12 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
          <p className="text-muted-foreground mb-8">Il semble que vous n'ayez pas encore ajouté d'articles.</p>
          <Link to="/products">
            <Button size="lg" className="rounded-full px-8">
              Commencer mes achats
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Mon Panier ({totalItems})</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="flex gap-4 p-4 bg-secondary/20 rounded-2xl items-center">
                <div className="h-24 w-24 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-grow">
                  <h3 className="font-bold text-lg">{item.name}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{item.category}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-full px-2 py-1 bg-background">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{(item.price * item.quantity).toLocaleString()} GNF</p>
                  <p className="text-xs text-muted-foreground">{item.price.toLocaleString()} GNF / unité</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary/30 p-8 rounded-3xl h-fit sticky top-24">
            <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{totalPrice.toLocaleString()} GNF</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="text-green-600 font-medium">Gratuite</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-primary">{totalPrice.toLocaleString()} GNF</span>
              </div>
            </div>
            <Link to="/checkout">
              <Button className="w-full h-14 rounded-full text-lg font-bold">
                Passer à la caisse <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-center text-muted-foreground mt-4">
              Paiement en espèces à la livraison uniquement.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;