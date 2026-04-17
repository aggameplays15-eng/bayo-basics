"use client";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { useAdminData } from "@/hooks/useAdminData";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

const Orders = () => {
  const { orders } = useAdminData();
  
  // Dans une vraie app, on filtrerait par l'ID de l'utilisateur connecté
  // Ici on affiche toutes les commandes passées sur ce navigateur
  const myOrders = [...orders].reverse();

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-black mb-8">Mes Commandes</h1>
        
        {myOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Commande #{order.id.slice(0, 8)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date().toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className={cn(
                      "rounded-full px-4 py-1 border-none font-bold text-[10px] uppercase",
                      order.status === 'Livré' ? "bg-emerald-100 text-emerald-700" : 
                      order.status === 'Annulé' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {order.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg overflow-hidden bg-slate-100">
                          <img src={item.image} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.quantity}x • {item.selectedSize || 'Taille unique'} • {item.selectedColor || 'Standard'}
                          </p>
                        </div>
                        <p className="text-sm font-bold">{(item.price * item.quantity).toLocaleString()} GNF</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {order.city}
                    </div>
                    <p className="font-black text-lg text-primary">{order.total.toLocaleString()} GNF</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default Orders;