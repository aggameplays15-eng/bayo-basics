"use client";

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, UserPlus, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await register(formData);
      toast.success("Compte créé avec succès ! Bienvenue chez Bayo Basics.");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Échec de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4">
      <Link to="/" className="absolute top-8 left-8 flex items-center text-sm font-bold hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil
      </Link>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="space-y-1 text-center pt-12 pb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-primary/10 p-4 rounded-[2rem] text-primary">
                <UserPlus className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl font-black tracking-tight">Créer un compte</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">
              Rejoignez l'expérience Bayo Basics
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="name" 
                    placeholder="Mamadou Diallo" 
                    required 
                    className="rounded-2xl h-12 pl-11 bg-slate-50 border-none focus-visible:ring-primary/20"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="nom@exemple.com" 
                    required 
                    className="rounded-2xl h-12 pl-11 bg-slate-50 border-none focus-visible:ring-primary/20"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input 
                    id="password" 
                    type="password" 
                    required 
                    minLength={6}
                    className="rounded-2xl h-12 pl-11 bg-slate-50 border-none focus-visible:ring-primary/20"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 mt-4" disabled={isLoading}>
                {isLoading ? "Création..." : "S'inscrire"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 px-8 pb-12 text-center">
            <div className="text-sm font-medium text-muted-foreground">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-primary font-black hover:underline">
                Se connecter
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;