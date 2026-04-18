"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Product } from "@/types";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/ImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id'>) => void;
  initialData?: Product;
}

const CATEGORIES = [
  { id: "Vêtements", icon: "👕", fields: ["sizes", "colors", "material"] },
  { id: "Accessoires", icon: "👜", fields: ["colors", "material"] },
  { id: "Électronique", icon: "📱", fields: ["specs", "warranty"] },
  { id: "Chaussures", icon: "👟", fields: ["sizes", "colors"] },
  { id: "Général", icon: "📦", fields: [] },
];

const ProductForm = ({ onSubmit, initialData }: ProductFormProps) => {
  const [hasSizes, setHasSizes] = useState(!!initialData?.sizes?.length);
  const [hasColors, setHasColors] = useState(!!initialData?.colors?.length);
  const [hasSpecs, setHasSpecs] = useState(!!initialData?.specs?.length);
  const [hasMaterial, setHasMaterial] = useState(!!initialData?.material);
  const [hasWarranty, setHasWarranty] = useState(!!initialData?.warranty);
  
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    category: initialData?.category || "Général",
    image: initialData?.image || "",
    stock: initialData?.stock || 0,
    sizes: initialData?.sizes || [],
    colors: initialData?.colors || [],
    specs: initialData?.specs || [],
    material: initialData?.material || "",
    warranty: initialData?.warranty || "",
  });

  const selectedCategory = CATEGORIES.find(c => c.id === formData.category) || CATEGORIES[4];

  useEffect(() => {
    // Reset optional fields based on category
    if (!selectedCategory.fields.includes("sizes")) {
      setHasSizes(false);
      setFormData(prev => ({ ...prev, sizes: [] }));
    }
    if (!selectedCategory.fields.includes("colors")) {
      setHasColors(false);
      setFormData(prev => ({ ...prev, colors: [] }));
    }
    if (!selectedCategory.fields.includes("specs")) {
      setHasSpecs(false);
      setFormData(prev => ({ ...prev, specs: [] }));
    }
    if (!selectedCategory.fields.includes("material")) {
      setHasMaterial(false);
      setFormData(prev => ({ ...prev, material: "" }));
    }
    if (!selectedCategory.fields.includes("warranty")) {
      setHasWarranty(false);
      setFormData(prev => ({ ...prev, warranty: "" }));
    }
  }, [formData.category]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalData = {
      ...formData,
      sizes: hasSizes ? formData.sizes : [],
      colors: hasColors ? formData.colors : [],
      specs: hasSpecs ? formData.specs : [],
      material: hasMaterial ? formData.material : undefined,
      warranty: hasWarranty ? formData.warranty : undefined,
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
          <Label htmlFor="category">Catégorie</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
            <SelectTrigger className="rounded-2xl h-12">
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map(cat => (
                <SelectItem key={cat.id} value={cat.id}>
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.id}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name">Nom du produit</Label>
          <Input 
            id="name" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
            className="rounded-2xl h-12"
            placeholder={selectedCategory.id === "Vêtements" ? "Ex: T-shirt Premium" : 
                     selectedCategory.id === "Électronique" ? "Ex: iPhone 15" :
                     selectedCategory.id === "Accessoires" ? "Ex: Sac à main" :
                     "Ex: Nom du produit"}
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

        {/* Category-specific fields */}
        {selectedCategory.fields.length > 0 && (
          <div className="space-y-4 p-4 bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl border border-slate-200">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedCategory.icon}</span>
              <div>
                <Label className="text-sm font-bold">Options pour {selectedCategory.id}</Label>
                <p className="text-[10px] text-muted-foreground">Champs spécifiques à cette catégorie</p>
              </div>
            </div>

            {selectedCategory.fields.includes("sizes") && (
              <div className="flex items-center justify-between pt-2">
                <div className="space-y-0.5">
                  <Label>Tailles / Dimensions</Label>
                  <p className="text-[10px] text-muted-foreground">Ex: S, M, L, XL ou 40, 41, 42</p>
                </div>
                <Switch checked={hasSizes} onCheckedChange={setHasSizes} />
              </div>
            )}

            {hasSizes && selectedCategory.fields.includes("sizes") && (
              <Input 
                placeholder={selectedCategory.id === "Chaussures" ? "Ex: 40, 41, 42, 43" : "Ex: S, M, L, XL"} 
                className="rounded-xl"
                value={formData.sizes.join(", ")}
                onChange={(e) => setFormData({...formData, sizes: e.target.value.split(",").map(s => s.trim())})}
              />
            )}

            {selectedCategory.fields.includes("colors") && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label>Couleurs disponibles</Label>
                  <p className="text-[10px] text-muted-foreground">Ex: Noir, Blanc, Bleu</p>
                </div>
                <Switch checked={hasColors} onCheckedChange={setHasColors} />
              </div>
            )}

            {hasColors && selectedCategory.fields.includes("colors") && (
              <Input 
                placeholder="Ex: Noir, Blanc, Bleu" 
                className="rounded-xl"
                value={formData.colors.join(", ")}
                onChange={(e) => setFormData({...formData, colors: e.target.value.split(",").map(c => c.trim())})}
              />
            )}

            {selectedCategory.fields.includes("specs") && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label>Spécifications techniques</Label>
                  <p className="text-[10px] text-muted-foreground">Ex: 128GB, 5G, 6.1 pouces</p>
                </div>
                <Switch checked={hasSpecs} onCheckedChange={setHasSpecs} />
              </div>
            )}

            {hasSpecs && selectedCategory.fields.includes("specs") && (
              <Input 
                placeholder="Ex: 128GB, 5G, 6.1 pouces" 
                className="rounded-xl"
                value={formData.specs.join(", ")}
                onChange={(e) => setFormData({...formData, specs: e.target.value.split(",").map(s => s.trim())})}
              />
            )}

            {selectedCategory.fields.includes("material") && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label>Matériau</Label>
                  <p className="text-[10px] text-muted-foreground">Ex: Coton, Cuir, Métal</p>
                </div>
                <Switch checked={hasMaterial} onCheckedChange={setHasMaterial} />
              </div>
            )}

            {hasMaterial && selectedCategory.fields.includes("material") && (
              <Input 
                placeholder="Ex: Coton, Cuir, Métal" 
                className="rounded-xl"
                value={formData.material}
                onChange={(e) => setFormData({...formData, material: e.target.value})}
              />
            )}

            {selectedCategory.fields.includes("warranty") && (
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="space-y-0.5">
                  <Label>Garantie</Label>
                  <p className="text-[10px] text-muted-foreground">Ex: 1 an, 2 ans</p>
                </div>
                <Switch checked={hasWarranty} onCheckedChange={setHasWarranty} />
              </div>
            )}

            {hasWarranty && selectedCategory.fields.includes("warranty") && (
              <Input 
                placeholder="Ex: 1 an, 2 ans" 
                className="rounded-xl"
                value={formData.warranty}
                onChange={(e) => setFormData({...formData, warranty: e.target.value})}
              />
            )}
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
            className="rounded-2xl min-h-[100px]"
            placeholder={selectedCategory.id === "Vêtements" ? "Décrivez le style, la coupe, le confort..." :
                     selectedCategory.id === "Électronique" ? "Décrivez les caractéristiques, la performance..." :
                     selectedCategory.id === "Accessoires" ? "Décrivez l'utilisation, la qualité..." :
                     "Description du produit"}
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