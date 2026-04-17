"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

const PushNotificationManager = () => {
  const [permission, setPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!("Notification" in window)) {
      toast.error("Votre navigateur ne supporte pas les notifications.");
      return;
    }

    const result = await Notification.requestPermission();
    setPermission(result);

    if (result === "granted") {
      toast.success("Notifications activées !");
      // Ici, vous devriez envoyer le token d'abonnement à votre backend (Supabase)
    } else if (result === "denied") {
      toast.error("Notifications bloquées.");
    }
  };

  if (permission === "granted") return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50">
      <div className="bg-white p-4 rounded-3xl shadow-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4">
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Bell className="h-6 w-6" />
        </div>
        <div className="flex-grow">
          <p className="text-xs font-bold">Restez informé !</p>
          <p className="text-[10px] text-muted-foreground">Activez les notifications pour nos promos.</p>
        </div>
        <Button size="sm" onClick={requestPermission} className="rounded-full px-4 h-9 text-[10px] font-bold">
          Activer
        </Button>
      </div>
    </div>
  );
};

export default PushNotificationManager;