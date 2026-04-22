"use client";

import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, ShoppingCart, ClipboardList, UserCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const { totalItems } = useCart();

  const navItems = [
    { label: "Accueil",   icon: Home,          path: "/" },
    { label: "Boutique",  icon: ShoppingBag,   path: "/products" },
    { label: "Panier",    icon: ShoppingCart,  path: "/cart", badge: totalItems, isPrimary: true },
    { label: "Commandes", icon: ClipboardList, path: "/orders" },
    { label: "Profil",    icon: UserCircle,    path: "/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-4 left-0 right-0 z-50 px-4 pointer-events-none">
      <div className="max-w-sm mx-auto flex items-end justify-between bg-background/90 backdrop-blur-xl border shadow-2xl rounded-3xl px-4 h-16 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          if (item.isPrimary) {
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex items-center justify-center w-14 h-14 -translate-y-4 bg-primary text-white rounded-2xl shadow-lg shadow-primary/40 flex-shrink-0"
              >
                <Icon className="h-6 w-6" />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 w-5 flex items-center justify-center rounded-full bg-rose-500 text-white text-[10px] font-black border-2 border-background">
                    {item.badge > 9 ? "9+" : item.badge}
                  </span>
                )}
              </Link>
            );
          }

          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5]")} />
              <span className="text-[9px] font-bold uppercase tracking-tight leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
