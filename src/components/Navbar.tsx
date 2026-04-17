"use client";

import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Package, Search, User, Menu } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAdminData } from "@/hooks/useAdminData";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Navbar = () => {
  const { totalItems } = useCart();
  const { settings } = useAdminData();
  const location = useLocation();
  
  // Simulation d'état de connexion
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  const navLinks = [
    { label: "Boutique", path: "/products" },
    { label: "Vêtements", path: "/products?category=Vêtements" },
    { label: "Électronique", path: "/products?category=Électronique" },
    { label: "Accessoires", path: "/products?category=Accessoires" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 px-4 py-4 pointer-events-none">
      <nav className="container max-w-7xl mx-auto h-20 flex items-center justify-between px-8 bg-white/70 backdrop-blur-2xl border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.05)] rounded-[2.5rem] pointer-events-auto">
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-primary p-2 rounded-2xl group-hover:rotate-[15deg] transition-all duration-500 shadow-lg shadow-primary/20">
              <Package className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-black tracking-tighter">
              {settings.logoText}<span className="text-primary">.</span>
            </span>
          </Link>
          
          <div className="hidden lg:flex gap-8">
            {navLinks.map((link) => (
              <Link 
                key={link.label}
                to={link.path} 
                className={cn(
                  "text-sm font-bold transition-all hover:text-primary relative py-2",
                  location.pathname + location.search === link.path ? "text-primary" : "text-slate-500"
                )}
              >
                {link.label}
                {location.pathname + location.search === link.path && (
                  <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center bg-slate-100 rounded-full px-4 h-11 border border-transparent focus-within:border-primary/20 focus-within:bg-white transition-all">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Rechercher..." 
              className="bg-transparent border-none outline-none text-sm font-medium w-40"
            />
          </div>
          
          <Link to="/cart">
            <Button variant="ghost" size="icon" className="relative rounded-full h-11 w-11 hover:bg-primary/5 transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground border-2 border-white rounded-full text-[10px] font-black">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden md:block" />

          <div className="hidden md:flex items-center gap-2">
            {isLoggedIn ? (
              <Link to="/profile">
                <Button variant="ghost" size="icon" className="rounded-full h-11 w-11 bg-primary/5 text-primary">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="rounded-full px-6 h-11 text-xs font-bold">
                    Connexion
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="rounded-full px-6 h-11 text-xs font-black shadow-lg shadow-primary/20">
                    S'inscrire
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Menu Mobile (Hamburger) */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden rounded-full h-11 w-11">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="rounded-l-[2.5rem] border-none p-8">
              <SheetHeader className="mb-12">
                <SheetTitle className="text-left flex items-center gap-3">
                  <div className="bg-primary p-2 rounded-xl">
                    <Package className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-black">{settings.logoText}</span>
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link 
                    key={link.label}
                    to={link.path} 
                    className={cn(
                      "text-2xl font-black transition-all hover:text-primary",
                      location.pathname + location.search === link.path ? "text-primary" : "text-slate-900"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-[1px] bg-slate-100 my-4" />
                {isLoggedIn ? (
                  <Link to="/profile">
                    <Button className="w-full h-14 rounded-2xl font-bold text-lg">
                      Mon Profil
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login">
                      <Button variant="outline" className="w-full h-14 rounded-2xl font-bold text-lg border-2">
                        Se connecter
                      </Button>
                    </Link>
                    <Link to="/register">
                      <Button className="w-full h-14 rounded-2xl font-bold text-lg">
                        Créer un compte
                      </Button>
                    </Link>
                  </>
                )}
                <Link to="/admin" className="text-center text-xs font-bold text-muted-foreground hover:text-primary">
                  Accès Administration
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;