"use client";

import { Link } from "react-router-dom";
import { Package, Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import { useAdminData } from "@/hooks/useAdminData";

const Footer = () => {
  const { settings } = useAdminData();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 border-t pt-20 pb-32 md:pb-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary p-1.5 rounded-xl">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-black tracking-tighter">
                {settings.logoText}<span className="text-primary">.</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              La destination n°1 pour le style premium à Conakry. Qualité, authenticité et service client exceptionnel.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <a key={i} href="#" className="h-10 w-10 rounded-full bg-white border flex items-center justify-center text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all shadow-sm">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-6">Boutique</h3>
            <ul className="space-y-4">
              {["Tous les produits", "Vêtements", "Électronique", "Accessoires"].map((item) => (
                <li key={item}>
                  <Link to="/products" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-6">Aide & Support</h3>
            <ul className="space-y-4">
              {["Suivre ma commande", "Livraison", "Retours", "FAQ"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
                <span>Conakry, République de Guinée</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>+224 622 00 00 00</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>contact@bayobasics.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground font-medium">
            © {currentYear} {settings.logoText}. Tous droits réservés.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Confidentialité</Link>
            <Link to="#" className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;