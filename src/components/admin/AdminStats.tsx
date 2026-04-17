"use client";

import { Card, CardContent } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";

interface AdminStatsProps {
  totalSales: number;
  orderCount: number;
}

const AdminStats = ({ totalSales, orderCount }: AdminStatsProps) => {
  const stats = [
    { title: "Ventes Totales", value: `${totalSales.toLocaleString()} GNF`, icon: DollarSign, trend: "+12.5%", up: true, color: "bg-blue-500" },
    { title: "Commandes", value: orderCount.toString(), icon: ShoppingCart, trend: "+8.2%", up: true, color: "bg-emerald-500" },
    { title: "Clients", value: "842", icon: Users, trend: "-2.4%", up: false, color: "bg-violet-500" },
    { title: "Conversion", value: "3.2%", icon: TrendingUp, trend: "+1.1%", up: true, color: "bg-amber-500" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {stats.map((kpi, i) => (
        <Card key={i} className="border-none shadow-sm rounded-[2rem] overflow-hidden hover:shadow-md transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${kpi.color} text-white shadow-lg shadow-current/20`}>
                <kpi.icon className="h-6 w-6" />
              </div>
              <div className={`flex items-center text-xs font-bold ${kpi.up ? 'text-emerald-600' : 'text-destructive'}`}>
                {kpi.up ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                {kpi.trend}
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">{kpi.title}</p>
            <h3 className="text-2xl font-black">{kpi.value}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;