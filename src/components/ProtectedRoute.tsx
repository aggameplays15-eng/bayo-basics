"use client";

import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface ProtectedRouteProps {
  children: React.ReactNode;
  isAdmin?: boolean;
}

const ProtectedRoute = ({ children, isAdmin = false }: ProtectedRouteProps) => {
  const { isAuthenticated, isAdmin: userIsAdmin, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-12 w-3/4 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    toast.error("Vous devez être connecté pour accéder à cette page");
    return <Navigate to="/login" replace />;
  }

  if (isAdmin && !userIsAdmin) {
    toast.error("Accès refusé : Réservé aux administrateurs");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;