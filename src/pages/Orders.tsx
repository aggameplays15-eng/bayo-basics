"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { ordersAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Package, Calendar, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Order, OrderItem } from "@/types";

const Orders = () => {
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await ordersAPI.getMyOrders();
        setOrders(response.orders);
      } catch (err) {
        console.error("Erreur chargement commandes:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-black mb-8">Mes Commandes</h1>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-[2rem]" />
            ))}
          </div>
        ) : !isAuthenticated ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-muted-foreground">Connectez-vous pour voir vos commandes.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <div className="bg-slate-100 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-muted-foreground">Vous n'avez pas encore passé de commande.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm rounded-[2rem] overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                        Commande #{String(order.id).slice(0, 8)}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("fr-FR")
                          : "—"}
                      </div>
                    </div>
                    <Badge
                      className={cn(
                        "rounded-full px-4 py-1 border-none font-bold text-[10px] uppercase",
                        order.status === "Livré"
                          ? "bg-emerald-100 text-emerald-700"
                          : order.status === "Annulé"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700"
                      )}
                    >
                      {order.status}
                    </Badge>
                  </div>

                  <div className="space-y-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-bold">{item.productName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {item.quantity}x •{" "}
                            {item.selectedSize || "Taille unique"} •{" "}
                            {item.selectedColor || "Standard"}
                          </p>
                        </div>
                        <p className="text-sm font-bold">
                          {(item.productPrice * item.quantity).toLocaleString()} GNF
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {order.city}
                    </div>
                    <p className="font-black text-lg text-primary">
                      {order.total.toLocaleString()} GNF
                    </p>
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
