"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const data = [
  { name: 'Lun', ventes: 4000 },
  { name: 'Mar', ventes: 3000 },
  { name: 'Mer', ventes: 2000 },
  { name: 'Jeu', ventes: 2780 },
  { name: 'Ven', ventes: 1890 },
  { name: 'Sam', ventes: 2390 },
  { name: 'Dim', ventes: 3490 },
];

const AdminCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <Card className="border-none shadow-sm rounded-[2rem] p-4">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Ventes de la semaine</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                cursor={{ fill: '#f8fafc' }}
              />
              <Bar dataKey="ventes" fill="hsl(var(--primary))" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm rounded-[2rem] p-4">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Tendance des commandes</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
              <YAxis hide />
              <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
              <Line type="monotone" dataKey="ventes" stroke="hsl(var(--primary))" strokeWidth={4} dot={{ r: 6, fill: 'white', strokeWidth: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCharts;