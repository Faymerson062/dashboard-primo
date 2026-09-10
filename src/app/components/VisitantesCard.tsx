"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function VisitantesCard({ inicial }: { inicial: number }) {
  const [total, setTotal] = useState(inicial);

  useEffect(() => {
    const canal = supabase
      .channel("visitas-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "clientes" }, () => {
        setTotal((t) => t + 1);
      })
      .subscribe();
    return () => {
      supabase.removeChannel(canal);
    };
  }, []);

  return (
    <div className="group relative overflow-hidden rounded-xl glass p-3 transition-all duration-500 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 opacity-0 blur-2xl transition-opacity duration-700 group-hover:opacity-100" />
      <div className="relative flex items-center gap-2.5">
        <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-2 transition-all duration-500 group-hover:scale-110">
          <Eye className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground/80">
            Visitantes
          </p>
          <p className="text-lg font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-primary">
            {total.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  );
}
