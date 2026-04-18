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
    { label: "Panier", icon: ShoppingCart, path: "/cart", badge: totalItems },
    { label: "Profil", icon: UserCircle, path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-6 left-0 right-0 z-50 px-6 pointer-events-none">
      <div className="max-w-md mx-auto h-16 flex justify-around items-center bg-background/80 backdrop-blur-xl border shadow-2xl rounded-full px-2 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-12 transition-all relative rounded-full",
                isActive ? "text-primary bg-primary/5" : "text-muted-foreground hover:text-primary"
              )}
            >
              <div className="relative">
                <Icon className={cn("h-5 w-5", isActive && "fill-current/10")} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-background">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;