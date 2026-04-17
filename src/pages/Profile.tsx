"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, Settings, LogOut, MapPin, Phone, Mail, ChevronRight, Heart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ordersAPI, favoritesAPI } from "@/services/api";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { Order, Product } from "@/types";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, updateProfile, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: ""
  });

  // Fetch orders and favorites
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ordersRes, favoritesRes] = await Promise.all([
          ordersAPI.getMyOrders(),
          favoritesAPI.getAll()
        ]);
        setOrders(ordersRes.orders);
        setFavorites(favoritesRes.favorites);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || ""
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success("Déconnexion réussie");
    navigate("/");
  };

  const handleUpdateProfile = async () => {
    try {
      await updateProfile(formData);
      toast.success("Profil mis à jour");
    } catch (error) {
      toast.error("Erreur lors de la mise à jour");
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 md:pb-0">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Sidebar Profil */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-sm text-center"
            >
              <div className="relative w-32 h-32 mx-auto mb-6">
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-full h-full object-cover rounded-[2rem] shadow-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-xl shadow-lg">
                  <Settings className="h-4 w-4" />
                </div>
              </div>
              <h2 className="text-2xl font-black mb-1">{user.name}</h2>
              <p className="text-muted-foreground text-sm mb-6">{user.email}</p>
              
              <div className="flex justify-center gap-4 mb-8">
                <div className="text-center">
                  <p className="text-xl font-black text-primary">{orders.length}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Commandes</p>
                </div>
                <div className="w-[1px] bg-slate-100" />
                <div className="text-center">
                  <p className="text-xl font-black text-primary">{favorites.length}</p>
                  <p className="text-[10px] font-bold uppercase text-muted-foreground">Favoris</p>
                </div>
              </div>

              <Button 
                variant="destructive" 
                className="w-full rounded-2xl h-12 font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 border-none"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" /> Déconnexion
              </Button>
            </motion.div>

            <div className="bg-white rounded-[2.5rem] p-6 shadow-sm space-y-4">
              <h3 className="font-bold px-2">Coordonnées</h3>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <Phone className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Téléphone</p>
                  <p className="text-sm font-bold">{user.phone || "Non renseigné"}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                <MapPin className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Adresse</p>
                  <p className="text-sm font-bold">{user.address || "Non renseignée"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders" className="space-y-6">
              <TabsList className="bg-white p-1 rounded-full border shadow-sm w-full md:w-auto">
                <TabsTrigger value="orders" className="rounded-full px-8 h-10 font-bold">Mes Commandes</TabsTrigger>
                <TabsTrigger value="wishlist" className="rounded-full px-8 h-10 font-bold">Favoris</TabsTrigger>
                <TabsTrigger value="settings" className="rounded-full px-8 h-10 font-bold">Paramètres</TabsTrigger>
              </TabsList>

              <TabsContent value="orders" className="space-y-4">
                {loading ? (
                  <div className="text-center py-20 bg-white rounded-[2.5rem]">
                    <p className="text-muted-foreground">Chargement...</p>
                  </div>
                ) : orders.length > 0 ? (
                  orders.map((order) => (
                    <motion.div 
                      key={order.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-6 rounded-[2rem] shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 group hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="h-16 w-16 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                          <Package className="h-8 w-8" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-primary uppercase tracking-widest">Commande #{order.id.slice(0, 8)}</p>
                          <h4 className="font-bold text-lg">{order.total.toLocaleString()} GNF</h4>
                          <p className="text-xs text-muted-foreground">{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <Badge className="rounded-full px-4 py-1 bg-amber-100 text-amber-700 border-none font-bold text-[10px] uppercase">
                          {order.status}
                        </Badge>
                        <Button variant="ghost" size="icon" className="rounded-full group-hover:bg-primary group-hover:text-white transition-all">
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white rounded-[2.5rem]">
                    <Package className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-muted-foreground font-medium">Aucune commande pour le moment.</p>
                    <Button variant="link" onClick={() => navigate("/products")} className="font-bold text-primary">Commencer mes achats</Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="wishlist">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loading ? (
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm text-center py-20 col-span-full">
                      <p className="text-muted-foreground">Chargement...</p>
                    </div>
                  ) : favorites.length > 0 ? (
                    favorites.map((product) => (
                      <motion.div 
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-4 rounded-[2rem] shadow-sm flex items-center gap-4"
                      >
                        <img src={product.image} alt={product.name} className="w-20 h-20 object-cover rounded-xl" />
                        <div className="flex-1">
                          <h4 className="font-bold">{product.name}</h4>
                          <p className="text-primary font-black">{product.price.toLocaleString()} GNF</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => navigate(`/product/${product.id}`)}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="bg-white p-6 rounded-[2rem] shadow-sm text-center py-20 col-span-full">
                      <Heart className="h-12 w-12 text-rose-200 mx-auto mb-4" />
                      <p className="text-muted-foreground font-medium">Votre liste de favoris est vide.</p>
                      <Button variant="link" onClick={() => navigate("/products")} className="font-bold text-primary">Découvrir nos produits</Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="settings">
                <Card className="border-none shadow-sm rounded-[2.5rem] bg-white">
                  <CardHeader>
                    <CardTitle className="text-xl font-black">Modifier mes informations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Nom complet</label>
                        <input 
                          className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4 text-sm font-medium" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase text-muted-foreground">Téléphone</label>
                        <input 
                          className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4 text-sm font-medium"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          placeholder="+224 ..."
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase text-muted-foreground">Adresse</label>
                      <input 
                        className="w-full h-12 rounded-2xl bg-slate-50 border-none px-4 text-sm font-medium"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Votre adresse à Conakry"
                      />
                    </div>
                    <Button 
                      className="w-full h-12 rounded-2xl font-bold mt-4"
                      onClick={handleUpdateProfile}
                    >
                      Enregistrer les modifications
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
};

export default Profile;