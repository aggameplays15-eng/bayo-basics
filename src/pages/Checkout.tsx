"use client";

import Navbar from "@/components/Navbar";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, Truck, CreditCard, MapPin, Mail } from "lucide-react";
import { useApiData } from "@/hooks/useApiData";
import { ordersAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { zones, loading: zonesLoading } = useApiData();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState<string>("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  });

  const selectedZone = zones.find(z => z.id === selectedZoneId);
  const deliveryFee = selectedZone ? selectedZone.price : 0;
  const finalTotal = totalPrice + deliveryFee;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour passer une commande");
      navigate("/login");
      return;
    }
    if (!selectedZoneId) {
      toast.error("Veuillez sélectionner une zone de livraison");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Prepare order items from cart
      const orderItems = cart.map(item => ({
        product_id: parseInt(item.id),
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        selectedColor: item.selectedColor
      }));
      
      // Create order via API
      await ordersAPI.create({
        items: orderItems as any,
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        address: formData.address,
        city: selectedZone?.name || "Conakry",
        delivery_fee: deliveryFee
      });
      
      toast.success("Commande enregistrée avec succès !");
      setIsSubmitted(true);
      clearCart();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la création de la commande");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="bg-green-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-12 w-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-black mb-4">Merci pour votre commande !</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            Votre commande a été reçue. Un conseiller vous contactera par téléphone ou par email pour confirmer la livraison.
          </p>
          <Button onClick={() => navigate("/")} size="lg" className="rounded-full px-8 h-14 font-bold">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate("/cart");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-3xl font-black mb-8">Finaliser ma commande</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold">Informations de livraison</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input 
                  id="name" 
                  placeholder="Ex: Mamadou Diallo" 
                  required 
                  className="rounded-2xl h-12"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Numéro de téléphone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="Ex: 622 00 00 00" 
                  required 
                  className="rounded-2xl h-12"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Adresse Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Ex: mamadou@exemple.com" 
                  required 
                  className="rounded-2xl h-12 pl-11"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Zone de livraison</Label>
              <Select onValueChange={setSelectedZoneId} required>
                <SelectTrigger className="rounded-2xl h-12">
                  <SelectValue placeholder={zonesLoading ? "Chargement..." : "Sélectionnez votre quartier"} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name} (+{zone.price.toLocaleString()} GNF)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Adresse précise (indications)</Label>
              <Textarea 
                id="address" 
                placeholder="Ex: Près de la mosquée, portail bleu..." 
                required 
                className="rounded-2xl min-h-[100px]"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>

            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
              <CreditCard className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <p className="text-xs font-medium text-amber-800">
                Paiement en espèces uniquement lors de la livraison.
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-16 rounded-full text-lg font-bold shadow-xl shadow-primary/20"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Traitement..." : "Confirmer la commande"}
            </Button>
          </form>

          <div className="space-y-6">
            <h2 className="text-xl font-bold px-2">Résumé de la commande</h2>
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm space-y-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100">
                        <img src={item.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.quantity} x {item.price.toLocaleString()} GNF</p>
                      </div>
                    </div>
                    <span className="font-bold">{(item.price * item.quantity).toLocaleString()} GNF</span>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sous-total</span>
                  <span className="font-medium">{totalPrice.toLocaleString()} GNF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Frais de livraison</span>
                  <span className="font-medium text-primary">
                    {selectedZone ? `${deliveryFee.toLocaleString()} GNF` : "Sélectionnez une zone"}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-xl font-black">Total à payer</span>
                  <span className="text-2xl font-black text-primary">{finalTotal.toLocaleString()} GNF</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;