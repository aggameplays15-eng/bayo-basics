"use client";

import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, User, ClipboardList, UserCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { label: "Accueil", icon: Home, path: "/" },
    { label: "Boutique", icon: ShoppingBag, path: "/products" },
    { label: "Panier", icon: ShoppingCart, path: "/cart", badge: totalItems, isPrimary: true },
    { label: "Profil", icon: UserCircle, path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <div className="max-w-md mx-auto h-20 flex justify-between items-center bg-background/90 backdrop-blur-xl border shadow-2xl rounded-3xl px-6 pointer-events-auto gap-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center transition-all relative min-w-[60px]",
                item.isPrimary 
                  ? "w-20 h-20 -mt-12 bg-primary text-white rounded-full shadow-xl shadow-primary/40 border-4 border-background" 
                  : "w-full h-16",
                !item.isPrimary && isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <Icon className={cn(
                  item.isPrimary ? "h-8 w-8" : "h-6 w-6",
                  !item.isPrimary && isActive && "fill-current/10"
                )} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    "absolute -top-1 -right-1 font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 text-[10px]",
                    item.isPrimary 
                      ? "bg-rose-500 text-white border-white scale-110" 
                      : "bg-primary text-primary-foreground border-background"
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
              {!item.isPrimary && (
                <span className={cn(
                  "text-[10px] mt-1 font-bold uppercase tracking-tight",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}>{item.label}</span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;