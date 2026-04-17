"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/ImageUpload";

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => void;
  initialData?: Product;
}

const ProductForm = ({ onSubmit, initialData }: ProductFormProps) => {
  const [hasSizes, setHasSizes] = useState(!!initialData?.sizes?.length);
  const [hasColors, setHasColors] = useState(!!initialData?.colors?.length);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    category: initialData?.category || "Général",
    image: initialData?.image || "",
    stock: initialData?.stock || 0,
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      sizes: hasSizes ? formData.sizes : [],
      colors: hasColors ? formData.colors : [],
    };
    onSubmit(finalData as Omit<Product, 'id'>);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        <Label>Image ou GIF du produit</Label>
        <ImageUpload
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
          onRemove={() => setFormData({ ...formData, image: "" })}
          maxSize={5}
          accept="image/*,.gif"
        />
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
            className="rounded-2xl h-12"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="price">Prix (GNF)</Label>
            <Input 
              id="price" 
              type="number" 
              value={formData.price} 
              onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
              required 
              className="rounded-2xl h-12"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="stock">Stock disponible</Label>
            <Input 
              id="stock" 
              type="number" 
              value={formData.stock} 
              onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})} 
              required 
              className="rounded-2xl h-12"
            />
          </div>
        </div>

        <div className="space-y-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Tailles / Dimensions</Label>
              <p className="text-[10px] text-muted-foreground">Activer si le produit a plusieurs tailles</p>
            </div>
            <Switch checked={hasSizes} onCheckedChange={setHasSizes} />
          </div>
          
          {hasSizes && (
            <Input 
              placeholder="Ex: S, M, L, XL" 
              className="rounded-xl"
              value={formData.sizes.join(", ")}
              onChange={(e) => setFormData({...formData, sizes: e.target.value.split(",").map(s => s.trim())})}
            />
          )}

          <div className="flex items-center justify-between pt-2 border-t">
            <div className="space-y-0.5">
              <Label>Couleurs</Label>
              <p className="text-[10px] text-muted-foreground">Activer si le produit a plusieurs couleurs</p>
            </div>
            <Switch checked={hasColors} onCheckedChange={setHasColors} />
          </div>

          {hasColors && (
            <Input 
              placeholder="Ex: Noir, Blanc, Bleu" 
              className="rounded-xl"
              value={formData.colors.join(", ")}
              onChange={(e) => setFormData({...formData, colors: e.target.value.split(",").map(c => c.trim())})}
            />
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            className="rounded-2xl min-h-[100px]"
          />
        </div>
      </div>

      <Button type="submit" className="w-full h-14 rounded-2xl font-bold text-lg">
        {initialData ? "Mettre à jour" : "Enregistrer le produit"}
      </Button>
    </form>
  );
};

export default ProductForm;