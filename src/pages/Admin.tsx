"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, Trash2, Search, CheckCircle2, XCircle, 
  Phone, MapPin, Package, Mail, Image as ImageIcon, Type
} from "lucide-react";
import { toast } from "sonner";
import { useApiData } from "@/hooks/useApiData";
import AdminStats from "@/components/admin/AdminStats";
import ProductForm from "@/components/admin/ProductForm";
import { cn } from "@/lib/utils";

const Admin = () => {
  const { 
    products, orders, zones, settings, loading,
    addProduct, deleteProduct, updateOrderStatus, 
    addZone, deleteZone, updateSettings, addBanner, deleteBanner,
    refreshOrders, refreshProducts
  } = useApiData();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [orderFilter, setOrderFilter] = useState<string>("Tous");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newZone, setNewZone] = useState({ name: "", price: 0 });
  const [newBanner, setNewBanner] = useState({ image: "", title: "", subtitle: "", link: "/products" });

  const totalSales = orders.filter(o => o.status === 'Livré').reduce((acc, o) => acc + o.total, 0);
  
  const filteredProducts = useMemo(() => products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  ), [products, searchTerm]);

  const filteredOrders = useMemo(() => orders.filter(o => 
    orderFilter === "Tous" || o.status === orderFilter
  ), [orders, orderFilter]);

  const handleAddProduct = async (data: any) => {
    try {
      await addProduct(data);
      setIsAddDialogOpen(false);
      toast.success("Produit ajouté !");
      refreshProducts();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const handleAddZone = async () => {
    if (!newZone.name) return;
    try {
      await addZone(newZone);
      setNewZone({ name: "", price: 0 });
      toast.success("Zone de livraison ajoutée !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  const handleAddBanner = async () => {
    if (!newBanner.image) return;
    try {
      await addBanner(newBanner);
      setNewBanner({ image: "", title: "", subtitle: "", link: "/products" });
      toast.success("Bannière ajoutée !");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'ajout");
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <div className="flex flex-col gap-4 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Administration</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full rounded-2xl h-14 shadow-lg shadow-primary/20 font-bold">
                <Plus className="mr-2 h-5 w-5" /> Nouveau Produit
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[500px] rounded-[2.5rem] p-6 overflow-y-auto max-h-[90vh]">
              <DialogHeader><DialogTitle>Ajouter un produit</DialogTitle></DialogHeader>
              <ProductForm onSubmit={handleAddProduct} />
            </DialogContent>
          </Dialog>
        </div>

        <AdminStats totalSales={totalSales} orderCount={orders.length} />

        <Tabs defaultValue="orders" className="space-y-6">
          <div className="sticky top-20 z-30 bg-[#F8FAFC]/80 backdrop-blur-md py-2 -mx-4 px-4">
            <TabsList className="bg-white p-1 rounded-full w-full border shadow-sm overflow-x-auto flex justify-start no-scrollbar">
              <TabsTrigger value="orders" className="rounded-full px-5 h-10 flex-shrink-0">Commandes</TabsTrigger>
              <TabsTrigger value="products" className="rounded-full px-5 h-10 flex-shrink-0">Catalogue</TabsTrigger>
              <TabsTrigger value="cms" className="rounded-full px-5 h-10 flex-shrink-0">CMS / Accueil</TabsTrigger>
              <TabsTrigger value="delivery" className="rounded-full px-5 h-10 flex-shrink-0">Livraison</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="cms" className="space-y-8">
            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
              <h3 className="font-bold mb-4 flex items-center gap-2"><Type className="h-5 w-5" /> Identité du site</h3>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Texte du Logo (Supporte les emojis/GIFs via URL)</Label>
                  <Input 
                    value={settings.logoText} 
                    onChange={async (e) => {
                      try {
                        await updateSettings({ logoText: e.target.value });
                      } catch (error: any) {
                        toast.error(error.message || "Erreur");
                      }
                    }} 
                    className="rounded-xl h-12" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Titre Principal (Hero)</Label>
                  <Input 
                    value={settings.heroTitle} 
                    onChange={async (e) => {
                      try {
                        await updateSettings({ heroTitle: e.target.value });
                      } catch (error: any) {
                        toast.error(error.message || "Erreur");
                      }
                    }} 
                    className="rounded-xl h-12" 
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Sous-titre Principal</Label>
                  <Textarea 
                    value={settings.heroSubtitle} 
                    onChange={async (e) => {
                      try {
                        await updateSettings({ heroSubtitle: e.target.value });
                      } catch (error: any) {
                        toast.error(error.message || "Erreur");
                      }
                    }} 
                    className="rounded-xl" 
                  />
                </div>
              </div>
            </Card>

            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
              <h3 className="font-bold mb-4 flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Bannières d'accueil (Images ou GIFs)</h3>
              <div className="space-y-4 mb-6">
                <div className="grid gap-2">
                  <Label>URL de l'image ou du GIF</Label>
                  <Input 
                    placeholder="https://.../image.gif" 
                    value={newBanner.image} 
                    onChange={(e) => setNewBanner({...newBanner, image: e.target.value})} 
                    className="rounded-xl h-12" 
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Titre</Label>
                    <Input 
                      placeholder="Promo été" 
                      value={newBanner.title} 
                      onChange={(e) => setNewBanner({...newBanner, title: e.target.value})} 
                      className="rounded-xl h-12" 
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Lien</Label>
                    <Input 
                      placeholder="/products" 
                      value={newBanner.link} 
                      onChange={(e) => setNewBanner({...newBanner, link: e.target.value})} 
                      className="rounded-xl h-12" 
                    />
                  </div>
                </div>
                <Button onClick={handleAddBanner} className="w-full h-12 rounded-xl font-bold">Ajouter la bannière</Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {settings.banners.map((banner) => (
                  <div key={banner.id} className="relative group rounded-2xl overflow-hidden aspect-video border">
                    <img src={banner.image} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 p-4 flex flex-col justify-end">
                      <p className="text-white font-bold">{banner.title}</p>
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={async () => {
                          try {
                            await deleteBanner(banner.id);
                            toast.success("Bannière supprimée");
                          } catch (error: any) {
                            toast.error(error.message || "Erreur lors de la suppression");
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {["Tous", "En attente", "Livré", "Annulé"].map((f) => (
                <Button key={f} variant={orderFilter === f ? "default" : "outline"} size="sm" className="rounded-full px-4 h-9 font-bold text-xs" onClick={() => setOrderFilter(f)}>{f}</Button>
              ))}
            </div>
            {filteredOrders.map((order) => (
              <Card key={order.id} className="border-none shadow-sm rounded-3xl bg-white">
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest">#{order.id}</span>
                      <h3 className="font-bold text-lg">{order.customerName}</h3>
                    </div>
                    <Badge className={cn("rounded-full px-3 py-1 border-none font-bold text-[10px] uppercase", order.status === 'Livré' ? "bg-emerald-100 text-emerald-700" : order.status === 'Annulé' ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700")}>{order.status}</Badge>
                  </div>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center text-sm text-slate-500"><Phone className="h-4 w-4 mr-2" /> {order.customerPhone}</div>
                    <div className="flex items-center text-sm text-slate-500"><Mail className="h-4 w-4 mr-2" /> {order.customerEmail}</div>
                    <div className="flex items-center text-sm text-slate-500"><MapPin className="h-4 w-4 mr-2" /> {order.city}, {order.address}</div>
                    <div className="flex items-center text-sm font-bold"><Package className="h-4 w-4 mr-2" /> {order.total.toLocaleString()} GNF</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" className="flex-1 rounded-xl h-11 font-bold text-xs bg-emerald-50 text-emerald-700" onClick={async () => {
                      try {
                        await updateOrderStatus(order.id, 'Livré');
                        toast.success("Statut mis à jour");
                        refreshOrders();
                      } catch (error: any) {
                        toast.error(error.message || "Erreur");
                      }
                    }}><CheckCircle2 className="h-4 w-4 mr-2" /> Livré</Button>
                    <Button variant="secondary" className="flex-1 rounded-xl h-11 font-bold text-xs bg-rose-50 text-rose-700" onClick={async () => {
                      try {
                        await updateOrderStatus(order.id, 'Annulé');
                        toast.success("Commande annulée");
                        refreshOrders();
                      } catch (error: any) {
                        toast.error(error.message || "Erreur");
                      }
                    }}><XCircle className="h-4 w-4 mr-2" /> Annuler</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Rechercher..." className="pl-11 rounded-2xl h-12" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            {filteredProducts.map((product) => (
              <Card key={product.id} className="border-none shadow-sm rounded-3xl bg-white">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-16 w-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0"><img src={product.image} alt="" className="h-full w-full object-cover" /></div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-bold truncate">{product.name}</h3>
                    <p className="text-xs text-slate-500">{product.category}</p>
                    <p className="font-black text-primary">{product.price.toLocaleString()} GNF</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={async () => {
                    try {
                      await deleteProduct(product.id);
                      toast.success("Produit supprimé");
                      refreshProducts();
                    } catch (error: any) {
                      toast.error(error.message || "Erreur lors de la suppression");
                    }
                  }} className="text-rose-500"><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            <Card className="border-none shadow-sm rounded-3xl p-6 bg-white">
              <h3 className="font-bold mb-4">Ajouter une zone</h3>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label>Nom du quartier / zone</Label>
                  <Input placeholder="Ex: Kaloum" value={newZone.name} onChange={(e) => setNewZone({...newZone, name: e.target.value})} className="rounded-xl h-12" />
                </div>
                <div className="grid gap-2">
                  <Label>Prix de livraison (GNF)</Label>
                  <Input type="number" placeholder="Ex: 15000" value={newZone.price} onChange={(e) => setNewZone({...newZone, price: Number(e.target.value)})} className="rounded-xl h-12" />
                </div>
                <Button onClick={handleAddZone} className="w-full h-12 rounded-xl font-bold">Ajouter la zone</Button>
              </div>
            </Card>

            <div className="space-y-3">
              <h3 className="font-bold px-2">Zones existantes</h3>
              {zones.map((zone) => (
                <Card key={zone.id} className="border-none shadow-sm rounded-2xl bg-white">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-bold">{zone.name}</p>
                      <p className="text-sm text-primary font-black">{zone.price.toLocaleString()} GNF</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={async () => {
                      try {
                        await deleteZone(zone.id);
                        toast.success("Zone supprimée");
                      } catch (error: any) {
                        toast.error(error.message || "Erreur lors de la suppression");
                      }
                    }} className="text-rose-500"><Trash2 className="h-5 w-5" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <BottomNav />
    </div>
  );
};

export default Admin;