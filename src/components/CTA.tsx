"use client";

import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const CTA = () => {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[3rem] bg-primary p-8 md:p-20 text-center text-primary-foreground shadow-2xl shadow-primary/30"
        >
          {/* Décoration d'arrière-plan */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-black uppercase tracking-widest mb-8">
              <Sparkles className="h-3 w-3" />
              <span>Offre Limitée</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              Prêt à rafraîchir <br />votre style ?
            </h2>
            
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 font-medium">
              Rejoignez des milliers de clients satisfaits à Conakry. Qualité premium et livraison rapide garanties.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/products" className="w-full sm:w-auto">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto h-16 px-10 rounded-full font-black text-lg shadow-xl">
                  <ShoppingBag className="mr-2 h-5 w-5" /> Voir la boutique
                </Button>
              </Link>
              <Link to="/register" className="w-full sm:w-auto">
                <Button size="lg" variant="ghost" className="w-full sm:w-auto h-16 px-10 rounded-full font-bold text-lg hover:bg-white/10 text-white">
                  Créer un compte <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;